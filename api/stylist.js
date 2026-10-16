// Vercel serverless function: POST /api/stylist
// Uses Google Gemini (free API key from https://aistudio.google.com/apikey).
// Set GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables.
// If the key is missing or the call fails, the website falls back to its built-in styling engine.

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "AI not configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prefs = {}, history = [], catalog = [] } = body || {};
  if (!Array.isArray(catalog) || !catalog.length) return res.status(400).json({ error: "catalog required" });

  const items = catalog.slice(0, 60).map(p =>
    `${p.id} | ${p.name} | ${p.category} | ₹${p.price} | colour: ${p.family} | occasions: ${(p.events || []).join("/")} | ${p.fabric} | style: ${p.style}`
  ).join("\n");

  const system = `You are the AI Bridal Stylist for an Indian direct-to-consumer bridal wear brand.
Recommend ONLY products from this catalogue (id | name | category | price | colour | occasions | fabric | style):
${items}

Customer preferences: ${JSON.stringify(prefs)}
Rules:
- Respect the budget (budget 0 means no limit). Never recommend an outfit over budget.
- Match the occasion first, then colours, then vibe. Usually suggest 2–3 outfits plus 1 accessory if it fits.
- If the customer shares a body type, give one short, kind, body-positive styling tip.
- Be warm, concise (under 110 words), and speak like a friendly stylist. Use ₹ for prices.
- For follow-up questions, answer them directly; only include picks if relevant.
Reply ONLY as JSON: {"message": string, "picks": [{"id": string, "why": string (max 10 words)}]}`;

  const contents = (history.length ? history : [{ role: "user", text: "Please recommend outfits for me." }])
    .slice(-10)
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.text).slice(0, 1500) }] }));

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
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    const out = JSON.parse(text.replace(/^```json|```$/g, "").trim());
    const valid = new Set(catalog.map(p => p.id));
    return res.status(200).json({
      message: String(out.message || ""),
      picks: (out.picks || []).filter(p => valid.has(p.id)).slice(0, 5),
      source: "ai"
    });
  } catch (e) {
    return res.status(502).json({ error: "AI request failed" });
  }
};
