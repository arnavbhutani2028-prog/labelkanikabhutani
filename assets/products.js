// ===== Store config — change the brand name here =====
const BRAND = {
  name: "Saanjh",
  tagline: "Bridal Couture",
  email: "hello@saanjh.in",
  phone: "+91 98765 43210",
  city: "New Delhi"
};

// ===== Product catalogue =====
// color = main fabric colour, accent = embroidery colour, family = colour filter
const PRODUCTS = [
  { id: "L01", name: "Gulnaar Velvet Lehenga", category: "Lehenga", price: 84999, family: "red", color: "#8e1b2c", accent: "#d9a72b",
    events: ["wedding"], fabric: "Silk velvet, hand zardozi", style: "traditional heavy",
    desc: "A deep red velvet lehenga with hand-done zardozi and dabka work, paired with a double net dupatta. Made for the pheras." },
  { id: "L02", name: "Rani Gulabi Silk Lehenga", category: "Lehenga", price: 62999, family: "pink", color: "#c2185b", accent: "#e8c15a",
    events: ["wedding", "sangeet"], fabric: "Banarasi silk, gota patti", style: "traditional",
    desc: "Rani pink Banarasi silk with gota patti borders and a contrast orange dupatta. Bright, festive and lighter to carry." },
  { id: "L03", name: "Chandni Ivory Lehenga", category: "Lehenga", price: 74999, family: "ivory", color: "#efe6d6", accent: "#c9a24a",
    events: ["wedding", "reception"], fabric: "Organza, pearl & sequin", style: "modern minimal",
    desc: "Ivory organza covered in pearl and sequin jaal. For the bride who wants a soft, modern look." },
  { id: "L04", name: "Mehendi Bagh Lehenga", category: "Lehenga", price: 28999, family: "green", color: "#4f7a28", accent: "#f2c94c",
    events: ["mehendi", "haldi"], fabric: "Chanderi, mirror work", style: "boho light",
    desc: "Leaf-green chanderi with mirror work and a twirl-ready kalidaar skirt. Light enough to dance in all day." },
  { id: "L05", name: "Haldi Genda Lehenga", category: "Lehenga", price: 22499, family: "yellow", color: "#f2b705", accent: "#c0392b",
    events: ["haldi", "mehendi"], fabric: "Cotton silk, gota", style: "boho light",
    desc: "Marigold yellow cotton silk with red gota detailing. Breathable and washable — haldi-proof." },
  { id: "L06", name: "Neelam Sangeet Lehenga", category: "Lehenga", price: 45999, family: "blue", color: "#1f3a7a", accent: "#d8c08a",
    events: ["sangeet", "reception"], fabric: "Georgette, sequins", style: "glam modern",
    desc: "Midnight blue georgette with all-over sequins that catch the light on the dance floor." },
  { id: "L07", name: "Aarzoo Peach Lehenga", category: "Lehenga", price: 39999, family: "peach", color: "#f0a58a", accent: "#e9d7a8",
    events: ["engagement", "reception", "sangeet"], fabric: "Net, resham thread", style: "modern minimal",
    desc: "Pastel peach net with tonal resham florals. A favourite for day engagements." },
  { id: "S01", name: "Kanjeevaram Lal Saree", category: "Saree", price: 54999, family: "red", color: "#a3172b", accent: "#e0b33a",
    events: ["wedding"], fabric: "Pure Kanjeevaram silk, real zari", style: "traditional",
    desc: "Handwoven Kanjeevaram silk with a temple border in real zari. An heirloom piece." },
  { id: "S02", name: "Sona Tissue Saree", category: "Saree", price: 32999, family: "gold", color: "#d6b25e", accent: "#8e1b2c",
    events: ["reception", "engagement"], fabric: "Tissue silk, scalloped border", style: "glam modern",
    desc: "Shimmering gold tissue with a maroon scalloped border and a ready-stitched sequin blouse." },
  { id: "S03", name: "Jamuni Banarasi Saree", category: "Saree", price: 27999, family: "purple", color: "#5b2a6e", accent: "#d9b24c",
    events: ["sangeet", "reception", "engagement"], fabric: "Banarasi katan silk", style: "traditional",
    desc: "Rich purple katan silk with gold buta. Classic, elegant and versatile." },
  { id: "S04", name: "Gulaabi Organza Saree", category: "Saree", price: 18999, family: "pink", color: "#f4a7b9", accent: "#ffffff",
    events: ["mehendi", "haldi", "engagement"], fabric: "Organza, hand-painted florals", style: "modern minimal",
    desc: "Soft pink organza with hand-painted roses. Light, airy and photographs beautifully." },
  { id: "G01", name: "Noor Reception Gown", category: "Gown", price: 58999, family: "ivory", color: "#e9e1d3", accent: "#b8b8c8",
    events: ["reception"], fabric: "Tulle, crystal embroidery", style: "glam modern",
    desc: "Ivory tulle ballgown with crystal-studded bodice and a sweeping trail." },
  { id: "G02", name: "Sitara Wine Gown", category: "Gown", price: 42999, family: "red", color: "#5e1224", accent: "#c9a24a",
    events: ["reception", "sangeet"], fabric: "Velvet, sequin bodice", style: "glam modern",
    desc: "Wine velvet gown with a structured sequin corset. Indo-western drama for the reception." },
  { id: "G03", name: "Firoza Cocktail Gown", category: "Gown", price: 26999, family: "blue", color: "#2a9d8f", accent: "#e9d7a8",
    events: ["sangeet", "engagement"], fabric: "Satin, pleated", style: "modern minimal",
    desc: "Teal satin with soft pleats and a thigh slit. Easy to move in, easy to love." },
  { id: "A01", name: "Polki Bridal Necklace Set", category: "Accessories", price: 34999, family: "gold", color: "#d6b25e", accent: "#9b1b30",
    events: ["wedding", "reception"], fabric: "Gold-plated silver, polki & rubies", style: "traditional heavy",
    desc: "Layered polki necklace with matching jhumkas and maang tikka." },
  { id: "A02", name: "Kundan Kaleere Pair", category: "Accessories", price: 8999, family: "gold", color: "#e0c068", accent: "#c2185b",
    events: ["wedding"], fabric: "Gold-plated brass, kundan", style: "traditional",
    desc: "Handcrafted kaleere with kundan domes and hanging pearls." },
  { id: "A03", name: "Phoolon Ki Haldi Set", category: "Accessories", price: 2499, family: "yellow", color: "#f2b705", accent: "#e8577a",
    events: ["haldi", "mehendi"], fabric: "Fresh-look silk flowers", style: "boho light",
    desc: "Floral jewellery set — necklace, earrings, tikka and haathphool." }
];

const SIZES = ["XS", "S", "M", "L", "XL", "Custom"];
const EVENTS = ["wedding", "reception", "sangeet", "mehendi", "haldi", "engagement"];
const FAMILIES = ["red", "pink", "ivory", "gold", "yellow", "green", "blue", "purple", "peach"];
const FAMILY_SWATCH = { red: "#9b1b30", pink: "#e0447c", ivory: "#efe6d6", gold: "#d6b25e", yellow: "#f2b705",
  green: "#4f7a28", blue: "#1f3a7a", purple: "#5b2a6e", peach: "#f0a58a" };
