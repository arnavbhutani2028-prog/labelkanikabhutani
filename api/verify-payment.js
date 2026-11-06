// POST /api/verify-payment — verifies the Razorpay signature (HMAC SHA256), marks the order paid,
// and emails a confirmation to the customer and the store via Resend.
// Env: RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//      RESEND_API_KEY, RESEND_FROM (e.g. "Label Kanika Bhutani <orders@yourdomain>"), ORDER_NOTIFY_EMAIL (optional).
const crypto = require("crypto");
const { rateLimit, tooMany, readBody, str, supabaseConfigured, supabase } = require("./_lib");

const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM || !to) return;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to: [to], subject, html })
  });
  if (!r.ok) console.error("email failed:", r.status, (await r.text()).slice(0, 200));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return res.status(503).json({ error: "Payments not configured" });

  const limited = await rateLimit(req, "verify", [{ name: "min", max: 10, windowSec: 60 }]);
  if (limited) return tooMany(res, limited);

  const b = readBody(req);
  const orderId = str(b.razorpay_order_id, 64), paymentId = str(b.razorpay_payment_id, 64), signature = str(b.razorpay_signature, 128);
  if (!orderId || !paymentId || !/^[a-f0-9]{64}$/.test(signature)) return res.status(400).json({ error: "Invalid payment details" });

  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  let order = null;
  if (supabaseConfigured()) {
    try {
      const rows = await supabase("PATCH", `orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}&status=eq.pending`,
        { status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() });
      order = rows && rows[0];
      if (!order) {
        const existing = await supabase("GET", `orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}&select=*`);
        order = existing && existing[0];
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json({ ok: true, receipt: order.receipt, amount: order.amount_inr, duplicate: true });
      }
    } catch (e) {
      console.error("mark paid failed:", e.message);
      return res.status(502).json({ error: "Payment received but we could not save your order. We'll contact you." });
    }
  }

  if (order) {
    const rows = (order.items || []).map(i => `<tr><td>${esc(i.name)} (${esc(i.size)}) × ${i.qty}</td><td align="right">${inr(i.price * i.qty)}</td></tr>`).join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="color:#7a1426">Thank you, ${esc(order.name.split(" ")[0])}!</h2>
      <p>Your order <b>#${esc(order.receipt)}</b> is confirmed and paid.</p>
      <table width="100%" cellpadding="6" style="border-collapse:collapse">${rows}
        <tr><td><b>Total</b></td><td align="right"><b>${inr(order.amount_inr)}</b></td></tr></table>
      <p>Delivering to: ${esc(order.address)}, ${esc(order.city)} ${esc(order.pin)}</p>
      <p>Our stylist will call you on ${esc(order.phone)} within 24 hours to confirm measurements.</p>
      <p>— Label Kanika Bhutani</p></div>`;
    await sendEmail(order.email, `Order confirmed #${order.receipt} · Label Kanika Bhutani`, html);
    await sendEmail(process.env.ORDER_NOTIFY_EMAIL, `New paid order #${order.receipt} (${inr(order.amount_inr)})`, html);
  }
  return res.status(200).json({ ok: true, receipt: order ? order.receipt : null, amount: order ? order.amount_inr : null });
};
