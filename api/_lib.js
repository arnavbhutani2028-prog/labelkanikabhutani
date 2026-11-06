// Shared server helpers. Files starting with "_" in /api are not exposed as endpoints on Vercel.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// ---------- Catalogue: loaded on the server, never trusted from the browser ----------
let _catalog = null;
function loadCatalog() {
  if (_catalog) return _catalog;
  const src = fs.readFileSync(path.join(__dirname, "..", "assets", "products.js"), "utf8");
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src + "\n;this.__out = { BRAND, PRODUCTS };", ctx, { timeout: 1000 });
  const { BRAND, PRODUCTS } = ctx.__out;
  _catalog = { brand: BRAND, products: PRODUCTS, byId: new Map(PRODUCTS.map(p => [p.id, p])) };
  return _catalog;
}

// ---------- Rate limiting ----------
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set (shared across all
// server instances). Otherwise falls back to a per-instance in-memory counter (best effort).
const mem = new Map();
async function hit(key, windowSec) {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(windowSec), "NX"]])
    });
    if (!r.ok) throw new Error("ratelimit store " + r.status);
    const out = await r.json();
    return Number(out[0].result);
  }
  const now = Date.now(), e = mem.get(key);
  if (!e || e.reset < now) { mem.set(key, { n: 1, reset: now + windowSec * 1000 }); return 1; }
  e.n += 1; return e.n;
}

function clientIp(req) {
  const xf = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.headers["x-real-ip"] || (req.socket && req.socket.remoteAddress) || "unknown";
}

// limits: [{ name, max, windowSec }]. Returns null if allowed, or { retryAfter } if blocked.
async function rateLimit(req, scope, limits) {
  const ip = clientIp(req);
  for (const l of limits) {
    const bucket = Math.floor(Date.now() / 1000 / l.windowSec);
    let n;
    try { n = await hit(`rl:${scope}:${l.name}:${ip}:${bucket}`, l.windowSec); }
    catch { continue; } // if the limiter store is down, don't take the site down with it
    if (n > l.max) return { retryAfter: l.windowSec };
  }
  return null;
}

function tooMany(res, info) {
  res.setHeader("Retry-After", String(info.retryAfter));
  return res.status(429).json({ error: "Too many requests. Please try again later." });
}

// ---------- Input helpers ----------
function readBody(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  return b && typeof b === "object" ? b : {};
}
const str = (v, max) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max).trim();

// Validates a cart against the server catalogue and returns server-computed line items + total (in rupees).
function priceCart(items) {
  const { byId } = loadCatalog();
  if (!Array.isArray(items) || !items.length || items.length > 20) throw new Error("Your bag is empty or too large.");
  let total = 0;
  const lines = items.map(i => {
    const p = byId.get(str(i && i.id, 20));
    const qty = Math.floor(Number(i && i.qty));
    if (!p) throw new Error("An item in your bag is no longer available.");
    if (!(qty >= 1 && qty <= 5)) throw new Error("Invalid quantity.");
    total += p.price * qty;
    return { id: p.id, name: p.name, size: str(i.size, 12) || "M", qty, price: p.price };
  });
  return { lines, total };
}

function validateCustomer(c) {
  c = c || {};
  const out = {
    name: str(c.name, 80), phone: str(c.phone, 15).replace(/\D/g, ""), email: str(c.email, 120),
    address: str(c.address, 300), city: str(c.city, 60), pin: str(c.pin, 6), wedding_date: str(c.date, 10) || null
  };
  if (out.name.length < 2) throw new Error("Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(out.phone)) throw new Error("Please enter a valid 10-digit mobile number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new Error("Please enter a valid email.");
  if (out.address.length < 5 || !out.city) throw new Error("Please enter your delivery address.");
  if (!/^[1-9]\d{5}$/.test(out.pin)) throw new Error("Please enter a valid PIN code.");
  return out;
}

// ---------- Supabase (orders table) ----------
function supabaseConfigured() { return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
async function supabase(method, pathAndQuery, body) {
  const r = await fetch(process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + pathAndQuery, {
    method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) throw new Error("Supabase " + r.status + " " + (await r.text()).slice(0, 200));
  return r.status === 204 ? null : r.json();
}

module.exports = { loadCatalog, rateLimit, tooMany, readBody, str, priceCart, validateCustomer, supabaseConfigured, supabase };
