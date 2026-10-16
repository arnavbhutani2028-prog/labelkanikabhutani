# Saanjh — Bridal Couture (D2C)

A direct-to-consumer bridal wear store: lehengas, sarees, gowns and bridal jewellery, sold straight from the atelier to the bride, with an **AI Bridal Stylist**.

## Features
- **Catalogue** of 17 products with filters (category, occasion, colour, budget) and sorting
- **Product pages** with size selection, quantity, add to bag / buy now, related items
- **Cart & checkout** with validation (Indian mobile + PIN code), order confirmation and order ID (demo payment)
- **AI Bridal Stylist** — recommends outfits from the catalogue based on function, budget, colours, vibe and body type, and answers follow-up questions. Uses Google Gemini via a serverless function (`/api/stylist`), with a built-in scoring engine as fallback so it always works.
- **Consultation booking** (video call or studio visit)
- Fully responsive (mobile + desktop)

## Tech
Plain HTML/CSS/JavaScript (no build step) + one Vercel serverless function.

## Deploy
1. Import this repo into Vercel (Framework preset: **Other**).
2. Add env var `GEMINI_API_KEY` (free key: https://aistudio.google.com/apikey). Optional: `GEMINI_MODEL`.
3. Add your custom domain in Vercel → Project → Settings → Domains.

To rename the brand, edit `BRAND` at the top of `assets/products.js`.
