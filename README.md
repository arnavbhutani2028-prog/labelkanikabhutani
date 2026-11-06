# Label Kanika Bhutani — Festive & Bridal Couture (D2C)

A direct-to-consumer festive and bridal wear label: ghararas, anarkalis, kurta sets, co-ords and jewellery, sold straight from the atelier to the bride, with an **AI Bridal Stylist**.

## Features
- **Catalogue** of 18 products with filters (category, occasion, colour, budget) and sorting
- **Product pages** with size selection, quantity, add to bag / buy now, related items
- **Cart & checkout** with validation (Indian mobile + PIN code), order confirmation and order ID (demo payment)
- **AI Bridal Stylist** — recommends outfits from the catalogue based on function, budget, colours, vibe and body type, and answers follow-up questions. Uses Google Gemini via a serverless function (`/api/stylist`), with a built-in scoring engine as fallback so it always works.
- **Consultation booking** (video call or studio visit)
- Fully responsive (mobile + desktop)

## Tech
Plain HTML/CSS/JavaScript (no build step) + one Vercel serverless function.

## Deploy
1. Import this repo into Vercel (Framework preset: **Other**).
2. Add your custom domain in Vercel → Project → Settings → Domains.
3. Add environment variables (Vercel → Project → Settings → Environment Variables), then redeploy:

| Variable | Needed for |
|---|---|
| `GEMINI_API_KEY` | AI Stylist (free key: https://aistudio.google.com/apikey). Optional `GEMINI_MODEL`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate limiting for the API (10/min, 50/day per IP on the stylist). Without them, a per-instance in-memory limit is used. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Real checkout. Without them, checkout runs in clearly-labelled demo mode. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saving orders. Run `supabase/orders.sql` once in the Supabase SQL editor (RLS on; only the server writes). |
| `RESEND_API_KEY`, `RESEND_FROM`, `ORDER_NOTIFY_EMAIL` | Order confirmation emails to the customer and the store. |

Fill in contact details and the Microsoft Clarity project ID in `BRAND` at the top of `assets/products.js`.

## Security notes
- `/api/stylist` loads the catalogue on the server (`api/_lib.js`); the browser only sends preferences and at most 6 chat messages of 500 characters. Picks are validated against real product IDs. Rate limited per IP.
- `/api/create-order` recomputes prices from the server catalogue; `/api/verify-payment` checks the Razorpay signature with HMAC SHA256 before marking an order paid.
