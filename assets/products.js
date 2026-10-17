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
  { id: "G01", name: "Ivory Sequin & Jaal Hoor 3.0 Gharara Set", category: "Gharara", price: 23499, family: "ivory",
    img: cdn("files/2IvorySequinAndJaalHoor3.0GhararaSet_1.jpg?v=1727521101"),
    events: ["wedding", "engagement", "reception"], fabric: "Tissue, sequin & zari jaal", style: "traditional glam",
    desc: "An ivory tissue gharara set covered in a fine sequin and zari jaal, with a matching scalloped dupatta. Our bestselling look for engagements and day weddings." },
  { id: "G02", name: "Ivory Mirror Hoor Gharara Set", category: "Gharara", price: 19999, family: "ivory",
    img: cdn("files/7IvoryMirrorHoorGhararaSet_1.jpg?v=1701068589"),
    events: ["mehendi", "sangeet", "engagement"], fabric: "Tissue with mirror work", style: "traditional light",
    desc: "Soft ivory with hand-placed mirror work that catches every light. Elegant but easy to wear all day." },
  { id: "G03", name: "Purple Banarsi Hoor Gharara Set", category: "Gharara", price: 20500, family: "purple",
    img: cdn("files/8PurpleBanarsiHoorGhararaSet_9.jpg?v=1701450290"),
    events: ["sangeet", "reception", "wedding"], fabric: "Banarasi silk", style: "traditional",
    desc: "Rich purple Banarasi silk with a woven gold pattern. A regal pick for a sister of the bride or an evening function." },
  { id: "G04", name: "Light Beige Sitara Gharara Set", category: "Gharara", price: 19999, family: "gold",
    img: cdn("products/3_974e3a15-0319-45cd-a9ef-955a8e612025.png?v=1606823203"),
    events: ["engagement", "mehendi", "sangeet"], fabric: "Sequin & thread embroidery", style: "modern minimal",
    desc: "Light beige with all-over sitara embroidery. Understated, festive and very photogenic." },
  { id: "G05", name: "Mouse Sitara 2.0 Gharara Set", category: "Gharara", price: 18999, family: "gold",
    img: cdn("products/10_MouseSitara2.0GhararaSet_0000_1.jpg?v=1661609345"),
    events: ["sangeet", "engagement", "reception"], fabric: "Sequin & zari work", style: "modern minimal",
    desc: "A muted mouse-beige gharara with sequin and zari sitara work, for those who love quiet sparkle." },
  { id: "G06", name: "Apricot Brandy Noorie Gharara Set", category: "Gharara", price: 42700, family: "peach",
    img: cdn("files/22ApricotBrandyNoorieGhararaSet_1.jpg?v=1694183426"),
    events: ["wedding", "reception", "engagement"], fabric: "Heavy hand embroidery", style: "traditional heavy",
    desc: "A statement apricot gharara set with dense hand embroidery. Made for the big day or the reception." },
  { id: "A01", name: "Antique Gold Dabka Kainaat 2.0 Anarkali Set", category: "Anarkali", price: 29500, family: "gold",
    img: cdn("files/4_aa47c918-8f08-4f2a-a35e-22031fe8275b.jpg?v=1759734099"),
    events: ["wedding", "reception", "sangeet"], fabric: "Dabka & resham yoke", style: "traditional glam",
    desc: "A flowing anarkali with an antique gold dabka and resham yoke. Classic, graceful and twirl-worthy." },
  { id: "A02", name: "Red Floral Jacket Sakhi Anarkali Set", category: "Anarkali", price: 35200, family: "red",
    img: cdn("files/177_e7f35a0b-7a01-4cff-9c02-5310bb9e392d.jpg?v=1792151957"),
    events: ["wedding", "sangeet", "mehendi"], fabric: "Printed with embroidered jacket", style: "traditional",
    desc: "A red floral anarkali layered with a matching jacket. Festive, bright and perfect for wedding season." },
  { id: "A03", name: "Emerald Floral Jacket Sakhi Anarkali Set", category: "Anarkali", price: 35200, family: "green",
    img: cdn("files/155_4b72f8ce-4a82-4745-ab0e-9186e868494b.jpg?v=1792151665"),
    events: ["mehendi", "sangeet"], fabric: "Printed with embroidered jacket", style: "traditional",
    desc: "Emerald green florals with a jacket layer. A rich, jewel-toned choice for the mehendi." },
  { id: "A04", name: "Purple Floral Jacket Sakhi Anarkali Set", category: "Anarkali", price: 35200, family: "purple",
    img: cdn("files/164_05bb9925-7fd9-4187-8330-f71a3f622d74.jpg?v=1792151752"),
    events: ["sangeet", "reception"], fabric: "Printed with embroidered jacket", style: "traditional",
    desc: "Deep purple florals with a matching jacket. Stands out beautifully at evening functions." },
  { id: "K01", name: "Apricot Brandy Yoke Noorie Kurta Set", category: "Kurta Set", price: 23399, family: "peach",
    img: cdn("files/10ApricotBrandyYokeNoorieKurtaSet_3.jpg?v=1694178569"),
    events: ["engagement", "haldi", "mehendi"], fabric: "Embroidered yoke", style: "modern minimal",
    desc: "An apricot kurta set with a finely embroidered yoke. Light, elegant and easy to style." },
  { id: "K02", name: "Apple Green Pleated Chanderi Kiki Kurta", category: "Kurta Set", price: 16399, family: "green",
    img: cdn("files/MYNA-AG-2.png?v=1754647606"),
    events: ["haldi", "mehendi"], fabric: "Pleated chanderi", style: "boho light",
    desc: "Fresh apple-green pleated chanderi. Breathable and comfortable for day functions." },
  { id: "C01", name: "Sage Green Stripes Sakhi Co-ord Set", category: "Co-ord Set", price: 18650, family: "green",
    img: cdn("files/15_ef1ecb01-d94c-43de-9745-03998499ff5c.jpg?v=1792152681"),
    events: ["haldi", "mehendi"], fabric: "Thread work stripes", style: "boho light",
    desc: "Sage green striped co-ord with thread work. Relaxed, chic and pre-wedding ready." },
  { id: "C02", name: "Red Stripes Sakhi Co-ord Set", category: "Co-ord Set", price: 18650, family: "red",
    img: cdn("files/12_a49db659-fca6-4486-bf78-e7239aec855e.jpg?v=1792152841"),
    events: ["haldi", "mehendi", "sangeet"], fabric: "Thread work stripes", style: "boho light",
    desc: "A red striped co-ord set with thread work. Festive colour, easy silhouette." },
  { id: "F01", name: "Red Embellished Yoke Sakhi Farshi Set", category: "Farshi Set", price: 18650, family: "red",
    img: cdn("files/191_a55a53ef-8550-4c32-abac-4d162b000033.jpg?v=1792152300"),
    events: ["mehendi", "sangeet", "engagement"], fabric: "Embellished yoke", style: "traditional",
    desc: "A red farshi salwar set with an embellished yoke. Old-world grace with modern comfort." },
  { id: "F02", name: "Navy Blue Embellished Yoke Sakhi Farshi Set", category: "Farshi Set", price: 18650, family: "blue",
    img: cdn("files/186_ca500f76-e864-4be6-bf46-259eca9bc3cc.jpg?v=1792152364"),
    events: ["sangeet", "reception"], fabric: "Embellished yoke", style: "modern",
    desc: "Navy blue farshi set with an embellished yoke. Elegant for evening celebrations." },
  { id: "J01", name: "All White Polki Gold Plated Silver Jhumki", category: "Jewellery", price: 40100, family: "gold",
    img: cdn("products/3_7898f3e5-4405-4b16-9fc3-147b6029f7e9.png?v=1613048009"),
    events: ["wedding", "reception", "engagement"], fabric: "Gold-plated silver, polki", style: "traditional heavy",
    desc: "Statement all-white polki jhumkis in gold-plated silver. The finishing touch for any bridal look." },
  { id: "J02", name: "Polki Gold Plated Silver Ring With Pearls", category: "Jewellery", price: 14300, family: "gold",
    img: cdn("products/2_40ebcf2f-5b24-44ec-81c6-005089a24479.png?v=1613114057"),
    events: ["wedding", "engagement", "reception"], fabric: "Gold-plated silver, polki & pearls", style: "traditional",
    desc: "An all-white polki ring finished with pearls." }
];

const CATEGORIES = ["Gharara", "Anarkali", "Kurta Set", "Co-ord Set", "Farshi Set", "Jewellery"];
const CAT_LABEL = { "Gharara": "Ghararas", "Anarkali": "Anarkalis", "Kurta Set": "Kurta Sets", "Co-ord Set": "Co-ords", "Farshi Set": "Farshi Sets", "Jewellery": "Jewellery" };
const SIZES = ["XS", "S", "M", "L", "XL", "Custom"];
const EVENTS = ["wedding", "reception", "sangeet", "mehendi", "haldi", "engagement"];
const FAMILIES = ["red", "pink", "ivory", "gold", "yellow", "green", "blue", "purple", "peach"];
const FAMILY_SWATCH = { red: "#9b1b30", pink: "#e0447c", ivory: "#efe6d6", gold: "#d6b25e", yellow: "#f2b705",
  green: "#4f7a28", blue: "#1f3a7a", purple: "#5b2a6e", peach: "#f0a58a" };
// fallback colours for the drawn illustration if a photo fails to load
PRODUCTS.forEach(p => { p.color = FAMILY_SWATCH[p.family]; p.accent = "#c9a24a"; });
