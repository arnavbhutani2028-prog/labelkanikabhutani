// POST /api/book — sends a consultation booking straight to the owner.
// Channels (each optional, set in Vercel → Settings → Environment Variables):
//   WhatsApp alert via CallMeBot: CALLMEBOT_APIKEY, NOTIFY_WHATSAPP (e.g. +919810395974)
//   Email via Resend:            RESEND_API_KEY, RESEND_FROM, ORDER_NOTIFY_EMAIL
const { rateLimit, tooMany, readBody, str } = require("./_lib");

async function whatsappAlert(text) {
  const key = process.env.CALLMEBOT_APIKEY, phone = process.env.NOTIFY_WHATSAPP;
  if (!key || !phone) return false;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(key)}&text=${encodeURIComponent(text)}`;
  try { const r = await fetch(url, { signal: AbortSignal.timeout(8000) }); return r.ok; } catch { return false; }
}
async function emailAlert(subject, text) {
  const { RESEND_API_KEY: k, RESEND_FROM: from, ORDER_NOTIFY_EMAIL: to } = process.env;
  if (!k || !from || !to) return false;
  const html = `<pre style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-wrap">${text.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</pre>`;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }), signal: AbortSignal.timeout(8000) });
    return r.ok;
  } catch { return false; }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const limited = await rateLimit(req, "book", [{ name: "min", max: 3, windowSec: 60 }, { name: "day", max: 15, windowSec: 86400 }]);
  if (limited) return tooMany(res, limited);
  const b = await readBody(req);
  const d = {
    id: str(b.id, 20), name: str(b.name, 80), phone: str(b.phone, 20).replace(/\D/g, ""), email: str(b.email, 120),
    mode: b.mode === "studio" ? "Studio visit" : "Video call", date: str(b.date, 20), slot: str(b.slot, 20),
    wedding: str(b.wedding, 20), notes: str(b.notes, 500)
  };
  if (!d.name || !/^[6-9]\d{9}$/.test(d.phone.slice(-10)) || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !d.slot)
    return res.status(400).json({ error: "Please check your name, phone number, date and time." });
  const text = [`New consultation booking ${d.id}`, `Name: ${d.name}`, `Phone: +91 ${d.phone.slice(-10)}`, d.email && `Email: ${d.email}`,
    `Type: ${d.mode}`, `Date: ${d.date}, ${d.slot}`, d.wedding && `Function date: ${d.wedding}`, d.notes && `Looking for: ${d.notes}`].filter(Boolean).join("\n");
  const [wa, mail] = await Promise.all([whatsappAlert(text), emailAlert(`New consultation booking · ${d.name}`, text)]);
  return res.status(200).json({ ok: true, delivered: wa || mail });
};
