// POST /api/create-order — creates a Razorpay order for the bag.
// Prices are recomputed on the server from the catalogue; the browser's totals are never trusted.
// Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (required), SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (to save orders).
const { rateLimit, tooMany, readBody, priceCart, validateCustomer, supabaseConfigured, supabase } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const keyId = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return res.status(503).json({ error: "Payments not configured", demo: true });

  const limited = await rateLimit(req, "order", [{ name: "min", max: 5, windowSec: 60 }, { name: "day", max: 30, windowSec: 86400 }]);
  if (limited) return tooMany(res, limited);

  const body = readBody(req);
  let cart, customer;
  try { cart = priceCart(body.items); customer = validateCustomer(body.customer); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const receipt = "KB" + Date.now().toString(36).toUpperCase();
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64"), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: cart.total * 100, currency: "INR", receipt, notes: { customer: customer.name, phone: customer.phone } })
  });
  if (!r.ok) return res.status(502).json({ error: "Could not start payment. Please try again." });
  const order = await r.json();

  if (supabaseConfigured()) {
    try {
      await supabase("POST", "orders", {
        receipt, razorpay_order_id: order.id, status: "pending", amount_inr: cart.total,
        items: cart.lines, ...customer
      });
    } catch (e) {
      console.error("save pending order failed:", e.message);
      return res.status(502).json({ error: "Could not start payment. Please try again." });
    }
  }
  return res.status(200).json({ orderId: order.id, amount: order.amount, currency: "INR", keyId, receipt });
};
