// POST /api/stylist — AI Bridal Stylist (Google Gemini).
// The catalogue is loaded on the server; the browser only sends preferences and a short chat history.
// Env: GEMINI_API_KEY (required for AI), GEMINI_MODEL (optional),
//      UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (optional, shared rate limiting).
const { loadCatalog, rateLimit, tooMany, readBody, str } = require("./_lib");

const LIMITS = [
  { name: "min", max: 10, windowSec: 60 },
  { name: "day", max: 50, windowSec: 86400 }
];
const MAX_HISTORY = 6, MAX_CHARS = 500;
const EVENTS = ["wedding", "reception", "sangeet", "mehendi", "haldi", "engagement"];
const FAMILIES = ["red", "pink", "ivory", "gold", "yellow", "green", "blue", "purple", "peach"];

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const limited = await rateLimit(req, "stylist", LIMITS);
  if (limited) return tooMany(res, limited);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "AI not configured" });

  const { products, byId } = loadCatalog();
  if (!products.length) return res.status(503).json({ error: "Catalogue is empty" });

  const body = readBody(req);
  const p = body.prefs || {};
  const prefs = {
    event: EVENTS.includes(p.event) ? p.event : "",
    budget: Math.max(0, Math.min(1000000, Math.floor(Number(p.budget) || 0))),
    colors: (Array.isArray(p.colors) ? p.colors : []).filter(c => FAMILIES.includes(c)).slice(0, 9),
    vibe: str(p.vibe, 30),
    body: str(p.body, 20),
    notes: str(p.notes, MAX_CHARS)
  };
  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m && m.role === "assistant" ? "model" : "user", parts: [{ text: str(m && m.text, MAX_CHARS) }] }))
    .filter(m => m.parts[0].text);

  const items = products.slice(0, 120).map(x =>
    `${x.id} | ${x.name} | ${x.category} | ₹${x.price} | colour: ${x.family} | occasions: ${(x.events || []).join("/")} | ${x.fabric} | style: ${x.style}`
  ).join("\n");

  const system = `You are the AI Stylist for an Indian direct-to-consumer festive and bridal wear label.
Recommend ONLY products from this catalogue (id | name | category | price | colour | occasions | fabric | style):
${items}

Customer preferences: ${JSON.stringify(prefs)}
Rules:
- Only discuss outfits, styling and this catalogue. Politely decline anything unrelated.
- Respect the budget (0 means no limit). Never recommend an outfit over budget.
- Match the occasion first, then colours, then vibe. Usually suggest 2–3 outfits plus 1 accessory if it fits.
- If the customer shares a body type, give one short, kind, body-positive styling tip.
- Be warm and concise (under 110 words). Use ₹ for prices.
Reply ONLY as JSON: {"message": string, "picks": [{"id": string, "why": string (max 10 words)}]}`;

  const contents = history.length ? history : [{ role: "user", parts: [{ text: "Please recommend outfits for me." }] }];
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.7, responseMimeType: "application/json", maxOutputTokens: 800 }
      })
    });
    if (!r.ok) return res.status(502).json({ error: "AI error " + r.status });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(x => x.text).join("") || "";
    const out = JSON.parse(text.replace(/^```json|```$/g, "").trim());
    return res.status(200).json({
      message: str(out.message, 1200),
      picks: (Array.isArray(out.picks) ? out.picks : []).filter(x => x && byId.has(x.id)).slice(0, 5)
        .map(x => ({ id: x.id, why: str(x.why, 80) })),
      source: "ai"
    });
  } catch (e) {
    return res.status(502).json({ error: "AI request failed" });
  }
};
