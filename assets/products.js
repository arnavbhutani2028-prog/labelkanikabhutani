// ===== Store config =====
const BRAND = {
 name: "Label Kanika Bhutani",
 logo: "Kanika Bhutani",
 logoTop: "Label",
 tagline: "Festive & Bridal Couture",
 city: "New Delhi"
};

// Shopify CDN photo, resized for fast loading
const cdn = (path, w = 900) => `https://cdn.shopify.com/s/files/1/0378/5464/2313/${path}&width=${w}`;

// ===== Product catalogue =====
// family = colour filter · events = occasions it suits · style = used by the AI stylist
const PRODUCTS = [
  // New collection photos coming soon — products will be added here.
];

const CATEGORIES = ["Gharara", "Sharara", "Farshi Set", "Kaftan Set", "Jewellery"];
const CAT_LABEL = { "Gharara": "Ghararas", "Anarkali": "Anarkalis", "Kurta Set": "Kurta Sets", "Co-ord Set": "Co-ords", "Farshi Set": "Farshi Sets", "Sharara": "Shararas", "Kaftan Set": "Kaftan Sets", "Jewellery": "Jewellery" };
const SIZES = ["XS", "S", "M", "L", "XL", "Custom"];
const EVENTS = ["wedding", "reception", "sangeet", "mehendi", "haldi", "engagement"];
const FAMILIES = ["red", "pink", "ivory", "gold", "yellow", "green", "blue", "purple", "peach"];
const FAMILY_SWATCH = { red: "#9b1b30", pink: "#e0447c", ivory: "#efe6d6", gold: "#d6b25e", yellow: "#f2b705",
 green: "#4f7a28", blue: "#1f3a7a", purple: "#5b2a6e", peach: "#f0a58a" };
// fallback colours for the drawn illustration if a photo fails to load
PRODUCTS.forEach(p => { p.color = FAMILY_SWATCH[p.family]; p.accent = "#c9a24a"; });
