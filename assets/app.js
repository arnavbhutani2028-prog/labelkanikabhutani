// ===== Helpers =====
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const byId = id => PRODUCTS.find(p => p.id === id);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// ===== Cart =====
const Cart = {
  items() { return store.get("lkb_cart", []).filter(i => byId(i.id)); },
  save(items) { store.set("lkb_cart", items); updateCartBadge(); },
  add(id, size, qty = 1) {
    const items = this.items();
    const f = items.find(i => i.id === id && i.size === size);
    if (f) f.qty += qty; else items.push({ id, size, qty });
    this.save(items);
  },
  setQty(idx, qty) { const items = this.items(); if (qty <= 0) items.splice(idx, 1); else items[idx].qty = qty; this.save(items); },
  clear() { this.save([]); },
  count() { return this.items().reduce((a, i) => a + i.qty, 0); },
  subtotal() { return this.items().reduce((a, i) => a + (byId(i.id)?.price || 0) * i.qty, 0); }
};

function updateCartBadge() { const b = $("#cart-count"); if (b) { const c = Cart.count(); b.textContent = c; b.hidden = c === 0; } }

function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

// ===== Product artwork (SVG, no external images needed) =====
function art(p) {
  const c = p.color, a = p.accent, uid = p.id + Math.random().toString(36).slice(2, 6);
  const bg = `<defs><linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ee"/><stop offset="1" stop-color="#f1e6d4"/></linearGradient>
    <linearGradient id="sh${uid}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    <pattern id="pt${uid}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6" fill="${a}" opacity=".75"/></pattern></defs>
    <rect width="200" height="260" fill="url(#bg${uid})"/>
    <g opacity=".07" fill="#8e1b2c"><path d="M100 18 l6 10 -6 10 -6 -10z"/><path d="M30 40 l4 7 -4 7 -4 -7z"/><path d="M170 40 l4 7 -4 7 -4 -7z"/></g>`;
  const stand = `<rect x="98" y="34" width="4" height="30" fill="#b9a68a"/><ellipse cx="100" cy="33" rx="9" ry="5" fill="#b9a68a"/>`;
  const blouse = `<path d="M76 68 Q100 58 124 68 L128 112 Q100 118 72 112 Z" fill="${c}"/><path d="M76 68 Q100 58 124 68 L128 112 Q100 118 72 112 Z" fill="url(#pt${uid})" opacity=".5"/><path d="M86 66 Q100 80 114 66" stroke="${a}" stroke-width="3" fill="none"/>`;
  let body = "";
  if (!["Saree", "Gown", "Jewellery", "Accessories"].includes(p.category)) {
    body = `${stand}${blouse}
      <path d="M72 112 Q100 118 128 112 L172 236 Q100 252 28 236 Z" fill="${c}"/>
      <path d="M72 112 Q100 118 128 112 L172 236 Q100 252 28 236 Z" fill="url(#pt${uid})" opacity=".55"/>
      <path d="M72 112 Q100 118 128 112 L172 236 Q100 252 28 236 Z" fill="url(#sh${uid})"/>
      <path d="M36 214 Q100 230 164 214 L172 236 Q100 252 28 236 Z" fill="${a}"/>
      <path d="M40 222 Q100 238 160 222" stroke="${c}" stroke-width="2" stroke-dasharray="4 5" fill="none"/>
      <path d="M72 112 Q100 118 128 112 L130 120 Q100 126 70 120 Z" fill="${a}"/>
      <path d="M124 70 Q160 120 150 228 L140 226 Q148 130 118 76 Z" fill="${a}" opacity=".45"/>`;
  } else if (p.category === "Saree") {
    body = `${stand}${blouse}
      <path d="M72 112 Q100 118 128 112 L138 240 L62 240 Z" fill="${c}"/>
      <path d="M72 112 Q100 118 128 112 L138 240 L62 240 Z" fill="url(#pt${uid})" opacity=".45"/>
      <path d="M72 112 Q100 118 128 112 L138 240 L62 240 Z" fill="url(#sh${uid})"/>
      <path d="M62 226 L138 226 L138 240 L62 240 Z" fill="${a}"/>
      <path d="M82 120 L90 240 M94 120 L98 240 M106 120 L104 240" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
      <path d="M78 68 L124 70 Q150 140 132 240 L112 240 Q126 150 96 112 Z" fill="${c}"/>
      <path d="M78 68 L124 70 Q150 140 132 240 L112 240 Q126 150 96 112 Z" fill="url(#sh${uid})"/>
      <path d="M126 76 Q150 140 134 240 L128 240 Q142 140 120 78 Z" fill="${a}"/>`;
  } else if (p.category === "Gown") {
    body = `${stand}
      <path d="M80 66 Q100 60 120 66 L122 116 Q100 122 78 116 Z" fill="${c}"/>
      <path d="M80 66 Q100 60 120 66 L122 116 Q100 122 78 116 Z" fill="url(#pt${uid})" opacity=".6"/>
      <path d="M78 116 Q100 122 122 116 Q170 170 182 240 Q100 256 18 240 Q30 170 78 116 Z" fill="${c}"/>
      <path d="M78 116 Q100 122 122 116 Q170 170 182 240 Q100 256 18 240 Q30 170 78 116 Z" fill="url(#sh${uid})"/>
      <path d="M60 150 Q100 162 140 150 M40 196 Q100 212 160 196" stroke="${a}" stroke-width="2" fill="none" opacity=".7"/>
      <path d="M78 112 Q100 120 122 112 L122 118 Q100 126 78 118 Z" fill="${a}"/>`;
  } else {
    body = `<path d="M50 70 Q100 170 150 70" stroke="${c}" stroke-width="6" fill="none"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const t = i / 8, x = 50 + 100 * t, y = 70 + 4 * 100 * t * (1 - t) * 0.92;
        return `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${a}" stroke-width="3"/><circle cx="${x}" cy="${y + 14}" r="3" fill="#fff" opacity=".9"/>`; }).join("")}
      <path d="M100 160 l18 22 -18 26 -18 -26z" fill="${c}" stroke="${a}" stroke-width="4"/>
      <circle cx="100" cy="184" r="6" fill="${a}"/>
      <circle cx="100" cy="222" r="4" fill="#fff"/><circle cx="100" cy="234" r="4" fill="#fff"/>
      <path d="M40 210 q0 26 0 26 M160 210 q0 26 0 26" stroke="${a}" stroke-width="2"/>
      <circle cx="40" cy="240" r="8" fill="${c}" stroke="${a}" stroke-width="2"/><circle cx="160" cy="240" r="8" fill="${c}" stroke="${a}" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 200 260" role="img" aria-label="${esc(p.name)}" xmlns="http://www.w3.org/2000/svg">${bg}${body}</svg>`;
}

// Use a real photo when a product has one (p.img), otherwise the drawn illustration
function media(p) {
  return p.img ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy">` : `<div class="ph" role="img" aria-label="${esc(p.name)} — photo coming soon"><span class="ph-mono">KB</span><span class="ph-txt">Photo coming soon</span></div>`;
}

function card(p) {
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="card-img">${media(p)}</div>
    <div class="card-body"><span class="cat">${p.category}</span><h3>${esc(p.name)}</h3><p class="price">From ${inr(p.price)}</p></div></a>`;
}

// ===== Shared header & footer =====
function renderChrome() {
  const here = location.pathname.split("/").pop() || "index.html";
  const link = (h, t) => `<a href="${h}" class="${here === h ? "active" : ""}">${t}</a>`;
  document.body.insertAdjacentHTML("afterbegin", `
  <div class="announce">Free shipping across India · Complimentary alterations · Virtual trials available</div>
  <header class="site-header"><div class="wrap nav">
    <button class="menu-btn" aria-label="Menu" onclick="document.body.classList.toggle('nav-open')">☰</button>
    <a href="index.html" class="logo"><small class="top">${BRAND.logoTop}</small>${BRAND.logo}<small>${BRAND.tagline}</small></a>
    <nav class="links">${link("shop.html", "Shop")}${link("stylist.html", "AI Stylist ✦")}${link("consult.html", "Book Consultation")}</nav>
    <a href="cart.html" class="cart-link" aria-label="Cart">Bag <span id="cart-count" hidden>0</span></a>
  </div></header>`);
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site-footer"><div class="wrap foot">
    <div><div class="logo light"><small class="top">${BRAND.logoTop}</small>${BRAND.logo}<small>${BRAND.tagline}</small></div><p>Handcrafted festive and bridal wear, made-to-measure and shipped directly from our ${BRAND.city} atelier to you.</p></div>
    <div><h4>Shop</h4>${CATEGORIES.map(c => `<a href="shop.html?cat=${encodeURIComponent(c)}">${CAT_LABEL[c]}</a>`).join("")}</div>
    <div><h4>Help</h4><a href="stylist.html">AI Stylist</a><a href="consult.html">Book a consultation</a><a href="cart.html">Your bag</a></div>
  </div><p class="copy">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p></footer>`);
  document.title = document.title.replace("{BRAND}", BRAND.name);
  updateCartBadge();
}

// ===== Pages =====
function pageHome() {
  const feat = ["N29", "N01", "N14", "N32"].map(byId).filter(Boolean);
  $("#featured").innerHTML = feat.length ? feat.map(card).join("") : `<div class="soon"><span class="eyebrow">New collection</span><h2>Launching soon</h2><p>We're photographing our new festive edit. Book a free consultation to see pieces first.</p><a class="btn" href="consult.html">Book a consultation</a></div>`;
  if (!feat.length) { $("#featured").classList.add("is-empty"); const v = $("#view-all"); if (v) v.hidden = true; }
  $("#hero-art").innerHTML = feat.length ? media(feat[0]) : `<div class="ph hero-ph"><span class="ph-mono">KB</span><span class="ph-txt">New collection · coming soon</span></div>`;
  if (!PRODUCTS.length) { const c = $("#cats-section"); if (c) c.hidden = true; }
  $$(".cat-tile[data-img]").forEach(t => { const p = byId(t.dataset.img); if (p?.img) t.style.setProperty("--g", `linear-gradient(180deg,transparent 45%,rgba(30,10,14,.75)), url("${/^https?:/.test(p.img) ? p.img : new URL(p.img, location.href).href}") center/cover`); });
}

function pageShop() {
  const q = new URLSearchParams(location.search);
  const state = { cat: q.get("cat") || "All", family: "", event: q.get("event") || "", max: 100000, sort: "featured" };
  const cats = ["All", ...CATEGORIES];
  $("#f-cat").innerHTML = cats.map(c => `<button data-cat="${c}">${c === "All" ? "All" : CAT_LABEL[c]}</button>`).join("");
  $("#f-event").innerHTML = `<option value="">Any occasion</option>` + EVENTS.map(e => `<option value="${e}">${cap(e)}</option>`).join("");
  $("#f-family").innerHTML = FAMILIES.map(f => `<button class="swatch" data-f="${f}" title="${cap(f)}" style="background:${FAMILY_SWATCH[f]}"></button>`).join("");
  $("#f-event").value = state.event;

  function draw() {
    let list = PRODUCTS.filter(p => (state.cat === "All" || p.category === state.cat) && (!state.family || p.family === state.family)
      && (!state.event || p.events.includes(state.event)) && p.price <= state.max);
    if (state.sort === "low") list.sort((a, b) => a.price - b.price);
    if (state.sort === "high") list.sort((a, b) => b.price - a.price);
    if (!PRODUCTS.length) { $("#grid").innerHTML = `<div class="soon"><span class="eyebrow">New collection</span><h2>Launching soon</h2><p>We're photographing our new festive edit. Book a free consultation to see pieces first.</p><a class="btn" href="consult.html">Book a consultation</a></div>`; $("#count").textContent = ""; $(".filters").hidden = true; $(".toolbar").hidden = true; return; }
    $("#grid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty">No pieces match these filters. <button class="link" id="reset">Clear filters</button></p>`;
    $("#count").textContent = `${list.length} piece${list.length === 1 ? "" : "s"}`;
    $$("#f-cat button").forEach(b => b.classList.toggle("on", b.dataset.cat === state.cat));
    $$("#f-family button").forEach(b => b.classList.toggle("on", b.dataset.f === state.family));
    $("#max-label").textContent = state.max >= 100000 ? "Any price" : "Up to " + inr(state.max);
    const r = $("#reset"); if (r) r.onclick = () => { Object.assign(state, { cat: "All", family: "", event: "", max: 100000 }); $("#f-event").value = ""; $("#f-max").value = 100000; draw(); };
  }
  $("#f-cat").onclick = e => { if (e.target.dataset.cat) { state.cat = e.target.dataset.cat; draw(); } };
  $("#f-family").onclick = e => { const f = e.target.dataset.f; if (f) { state.family = state.family === f ? "" : f; draw(); } };
  $("#f-event").onchange = e => { state.event = e.target.value; draw(); };
  $("#f-max").oninput = e => { state.max = +e.target.value; draw(); };
  $("#f-sort").onchange = e => { state.sort = e.target.value; draw(); };
  draw();
}

function pageProduct() {
  const p = byId(new URLSearchParams(location.search).get("id")) || PRODUCTS[0];
  if (!p) { $("#product").innerHTML = `<div class="soon"><span class="eyebrow">New collection</span><h2>Launching soon</h2><p>We're photographing our new festive edit. Book a free consultation to see pieces first.</p><a class="btn" href="consult.html">Book a consultation</a></div>`; $("#related").closest("section").hidden = true; return; }
  document.title = `${p.name} · ${BRAND.name}`;
  const sizes = p.category === "Jewellery" ? ["One size"] : SIZES;
  $("#product").innerHTML = `
    <div class="pd-img"><div id="pd-main">${media(p)}</div>${(p.imgs||[]).length > 1 ? `<div class="thumbs">${p.imgs.map((u, i) => `<button class="${i ? "" : "on"}" data-u="${u}" aria-label="View photo ${i + 1}"><img src="${u}" alt=""></button>`).join("")}</div>` : ""}</div>
    <div class="pd-info">
      <a href="shop.html?cat=${encodeURIComponent(p.category)}" class="crumb">← ${CAT_LABEL[p.category]}</a>
      <h1>${esc(p.name)}</h1>
      <p class="pd-price">${inr(p.price)} <span>incl. all taxes</span></p>
      <p>${esc(p.desc)}</p>
      <dl>${p.colour ? `<dt>Colour</dt><dd>${esc(p.colour)}</dd>` : ""}<dt>Fabric</dt><dd>${esc(p.fabric)}</dd>${p.pieces ? `<dt>The set</dt><dd>${esc(p.pieces)}</dd>` : ""}<dt>Perfect for</dt><dd>${p.events.map(cap).join(", ")}</dd><dt>Delivery</dt><dd>Ships in 3–5 weeks (made to order)</dd></dl>
      <label class="lbl">Size</label>
      <div class="sizes">${sizes.map((s, i) => `<button class="${i === (sizes.length > 1 ? 2 : 0) ? "on" : ""}" data-s="${s}">${s}</button>`).join("")}</div>
      <div class="qty-row"><label class="lbl" for="qty">Qty</label><input id="qty" type="number" min="1" max="5" value="1"></div>
      <div class="pd-actions"><button class="btn" id="add">Add to bag</button><button class="btn ghost" id="buy">Buy now</button></div>
      <p class="note">Not sure about the size or colour? <a href="stylist.html">Ask our AI Stylist</a> or <a href="consult.html">book a free video consultation</a>.</p>
    </div>`;
  $$(".thumbs button").forEach(b => b.onclick = () => { $("#pd-main").innerHTML = `<img src="${b.dataset.u}" alt="${esc(p.name)}">`; $$(".thumbs button").forEach(x => x.classList.toggle("on", x === b)); });
  let size = $(".sizes .on").dataset.s;
  $(".sizes").onclick = e => { if (e.target.dataset.s) { size = e.target.dataset.s; $$(".sizes button").forEach(b => b.classList.toggle("on", b === e.target)); } };
  const add = () => { const q = Math.max(1, Math.min(5, +$("#qty").value || 1)); Cart.add(p.id, size, q); };
  $("#add").onclick = () => { add(); toast(`Added ${p.name} (${size}) to your bag`); };
  $("#buy").onclick = () => { add(); location.href = "cart.html"; };
  const rel = PRODUCTS.filter(x => x.id !== p.id && x.events.some(e => p.events.includes(e))).slice(0, 4);
  $("#related").innerHTML = rel.map(card).join("");
}

function pageCart() {
  Cart.save(Cart.items().filter(i => byId(i.id)));
  function draw() {
    const items = Cart.items();
    if (!items.length) {
      $("#cart").innerHTML = `<div class="empty-cart"><h2>Your bag is empty</h2><p>Find your perfect bridal look.</p><a class="btn" href="shop.html">Shop the collection</a> <a class="btn ghost" href="stylist.html">Ask the AI Stylist</a></div>`;
      return;
    }
    const sub = Cart.subtotal();
    $("#cart").innerHTML = `
      <div class="cart-items">${items.map((i, idx) => { const p = byId(i.id); if (!p) return ""; return `
        <div class="ci"><div class="ci-img">${media(p)}</div>
          <div class="ci-info"><a href="product.html?id=${p.id}"><strong>${esc(p.name)}</strong></a><span>Size: ${i.size}</span><span>${inr(p.price)}</span></div>
          <div class="ci-qty"><button data-i="${idx}" data-d="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-i="${idx}" data-d="1" aria-label="Increase">+</button></div>
          <strong class="ci-total">${inr(p.price * i.qty)}</strong></div>`; }).join("")}
      </div>
      <form class="checkout" id="checkout" novalidate>
        <h2>Checkout</h2>
        <div class="sum"><span>Subtotal</span><span>${inr(sub)}</span></div>
        <div class="sum"><span>Shipping</span><span>Free</span></div>
        <div class="sum total"><span>Total</span><span>${inr(sub)}</span></div>
        <input name="name" placeholder="Full name" required>
        <input name="phone" placeholder="Mobile number (10 digits)" required pattern="[6-9][0-9]{9}" inputmode="numeric">
        <input name="email" type="email" placeholder="Email" required>
        <textarea name="address" placeholder="Delivery address" rows="2" required></textarea>
        <div class="two"><input name="city" placeholder="City" required><input name="pin" placeholder="PIN code" required pattern="[1-9][0-9]{5}" inputmode="numeric"></div>
        <input name="date" type="date" aria-label="Wedding date"><small>Wedding date (optional) — we'll make sure it arrives in time.</small>
        <label class="lbl">Payment</label>
        <div class="pay">
          <label><input type="radio" name="pay" value="UPI" checked> UPI / Card (demo)</label>
          <label><input type="radio" name="pay" value="COD"> Pay on delivery</label>
          <label><input type="radio" name="pay" value="Advance"> 30% advance, rest before dispatch</label>
        </div>
        <p class="err" id="err"></p>
        <button class="btn full" type="submit">Place order · ${inr(sub)}</button>
        <small>This is a student project — no real payment is taken.</small>
      </form>`;
    $(".cart-items").onclick = e => { const b = e.target.closest("button"); if (!b) return; const i = +b.dataset.i; Cart.setQty(i, Cart.items()[i].qty + +b.dataset.d); draw(); };
    $("#checkout").onsubmit = e => {
      e.preventDefault();
      const f = e.target, bad = $$("input[required],textarea[required]", f).find(x => !x.checkValidity());
      if (bad) { $("#err").textContent = "Please check: " + (bad.placeholder || bad.name); bad.focus(); return; }
      const d = Object.fromEntries(new FormData(f));
      const order = { id: "KB" + Date.now().toString().slice(-7), ...d, items: Cart.items(), total: Cart.subtotal(), at: new Date().toISOString() };
      store.set("lkb_orders", [order, ...store.get("lkb_orders", [])]);
      Cart.clear();
      $("#cart").innerHTML = `<div class="empty-cart done"><div class="tick">✓</div><h2>Thank you, ${esc(d.name.split(" ")[0])}!</h2>
        <p>Your order <strong>#${order.id}</strong> for <strong>${inr(order.total)}</strong> is confirmed.</p>
        <p>Our stylist will call you on ${esc(d.phone)} within 24 hours to confirm measurements.</p>
        <a class="btn" href="shop.html">Continue shopping</a></div>`;
      scrollTo(0, 0);
    };
  }
  draw();
}

function pageConsult() {
  const f = $("#consult-form");
  const today = new Date().toISOString().slice(0, 10);
  $("input[name=date]", f).min = today;
  f.onsubmit = e => {
    e.preventDefault();
    const bad = $$("[required]", f).find(x => !x.checkValidity());
    if (bad) { $("#c-err").textContent = "Please fill: " + (bad.dataset.label || bad.name); bad.focus(); return; }
    const d = Object.fromEntries(new FormData(f));
    const id = "BK" + Date.now().toString().slice(-6);
    store.set("lkb_bookings", [{ id, ...d }, ...store.get("lkb_bookings", [])]);
    $("#consult-box").innerHTML = `<div class="empty-cart done"><div class="tick">✓</div><h2>You're booked, ${esc(d.name.split(" ")[0])}!</h2>
      <p>Booking <strong>#${id}</strong> — ${d.mode === "video" ? "Video call" : "Studio visit, " + BRAND.city} on <strong>${new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong> at <strong>${d.slot}</strong>.</p>
      <p>A confirmation will be sent to ${esc(d.email)}.</p><a class="btn" href="stylist.html">Meanwhile, try the AI Stylist</a></div>`;
  };
}

// ===== AI Stylist =====
// Local recommendation engine — used if the AI API isn't configured or fails, so the feature always works.
function localStylist(prefs) {
  const words = (prefs.notes || "").toLowerCase();
  const scored = PRODUCTS.map(p => {
    let s = 0;
    if (prefs.event && p.events.includes(prefs.event)) s += 4;
    if (prefs.colors?.length && prefs.colors.includes(p.family)) s += 3;
    if (prefs.budget) s += p.price <= prefs.budget ? 3 - (prefs.budget - p.price) / prefs.budget : -6;
    if (prefs.vibe && p.style.includes(prefs.vibe)) s += 2;
    if (words && (words.includes(p.category.toLowerCase().split(" ")[0]) || words.includes(p.family))) s += 1.5;
    if (prefs.body === "petite" && ["Gharara", "Kaftan Set"].includes(p.category)) s += .5;
    if (prefs.body === "curvy" && ["Sharara", "Gharara"].includes(p.category)) s += .5;
    return { p, s };
  }).sort((a, b) => b.s - a.s);
  const picks = scored.filter(x => x.p.category !== "Jewellery").slice(0, 3);
  const acc = scored.find(x => x.p.category === "Jewellery");
  if (acc) picks.push(acc);
  const ev = prefs.event ? cap(prefs.event) : "your function";
  return {
    message: `For ${ev}${prefs.budget ? ` within ${inr(prefs.budget)}` : ""}, I'd start with the ${picks[0].p.name} — ${picks[0].p.desc.split(".")[0].toLowerCase()}. ` +
      `The ${picks[1]?.p.name || ""} is a great second option, and I've added ${acc ? "the " + acc.p.name : "an accessory"} to complete the look.` +
      (prefs.body ? ` Tip for a ${prefs.body} frame: ${{ petite: "go for shorter kurtas, lighter fabrics and vertical embroidery to add height.", curvy: "a longer kurta with a flared gharara or sharara looks stunning.", tall: "long kurtas and wide gharara flares will look regal on you.", athletic: "a kaftan or flared sharara adds soft movement and shape." }[prefs.body] || ""}` : ""),
    picks: picks.map(x => ({ id: x.p.id, why: `${cap(x.p.style)} · ${x.p.fabric}` })),
    source: "local"
  };
}

async function askStylist(prefs, history) {
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 20000);
    const r = await fetch("/api/stylist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefs, history, catalog: PRODUCTS.map(({ desc, color, accent, ...p }) => p) }), signal: ctl.signal });
    if (!r.ok) throw new Error("api " + r.status);
    const j = await r.json();
    if (!j.message) throw new Error("bad response");
    j.picks = (j.picks || []).filter(x => byId(x.id));
    if (!j.picks.length && history.length <= 1) j.picks = localStylist(prefs).picks;
    return j;
  } catch (e) {
    console.info("AI stylist API unavailable, using local engine:", e.message);
    return localStylist(prefs);
  }
}

function pageStylist() {
  const f = $("#stylist-form");
  $("#s-colors").innerHTML = FAMILIES.map(c => `<label class="chip"><input type="checkbox" name="colors" value="${c}"><span style="--sw:${FAMILY_SWATCH[c]}">${cap(c)}</span></label>`).join("");
  $("#s-event").innerHTML = EVENTS.map(e => `<option value="${e}">${cap(e)}</option>`).join("");
  let prefs = null; const history = [];

  function showResult(res) {
    $("#chat").insertAdjacentHTML("beforeend", `<div class="msg ai"><p>${esc(res.message).replace(/\n/g, "<br>")}</p>
      ${res.picks?.length ? `<div class="picks">${res.picks.map(x => { const p = byId(x.id); return `<a class="pick" href="product.html?id=${p.id}"><div>${media(p)}</div><strong>${esc(p.name)}</strong><span>${inr(p.price)}</span>${x.why ? `<em>${esc(x.why)}</em>` : ""}</a>`; }).join("")}</div>` : ""}
      ${res.source === "local" ? `<small class="src">Recommended by ${BRAND.name}'s styling engine</small>` : `<small class="src">✦ AI-generated recommendation</small>`}</div>`);
    history.push({ role: "assistant", text: res.message });
    $("#chat").scrollTop = 1e6;
  }
  async function send(userText) {
    $("#chat").insertAdjacentHTML("beforeend", `<div class="msg me"><p>${esc(userText)}</p></div><div class="msg ai typing"><p>Styling your look<span>.</span><span>.</span><span>.</span></p></div>`);
    $("#chat").scrollTop = 1e6;
    history.push({ role: "user", text: userText });
    const res = await askStylist({ ...prefs, notes: (prefs.notes + " " + (history.length > 1 ? userText : "")).trim() }, history);
    $(".typing")?.remove();
    showResult(res);
  }
  f.onsubmit = async e => {
    e.preventDefault();
    if (!PRODUCTS.length) { $("#stylist-out").hidden = false; $("#out-empty").hidden = true; $("#chat").innerHTML = `<div class="msg ai"><p>Our new collection is being photographed right now, so I can't recommend pieces just yet. Check back soon, or <a href="consult.html">book a free consultation</a> with our stylist.</p></div>`; return; }
    const d = new FormData(f);
    prefs = { event: d.get("event"), budget: +d.get("budget") || 0, colors: d.getAll("colors"), body: d.get("body"), vibe: d.get("vibe"), notes: d.get("notes").trim() };
    $("#stylist-out").hidden = false; $("#out-empty").hidden = true; $("#chat").innerHTML = ""; history.length = 0;
    const summary = `I'm looking for a ${prefs.event} outfit${prefs.budget ? `, budget ${inr(prefs.budget)}` : ""}${prefs.colors.length ? `, I like ${prefs.colors.join(", ")}` : ""}${prefs.vibe ? `, ${prefs.vibe} vibe` : ""}${prefs.body ? `, ${prefs.body} body type` : ""}.${prefs.notes ? " " + prefs.notes : ""}`;
    $("#stylist-out").scrollIntoView({ behavior: "smooth" });
    send(summary);
  };
  $("#followup").onsubmit = e => {
    e.preventDefault(); const i = $("#followup input"); const t = i.value.trim(); if (!t || !prefs) return; i.value = ""; send(t);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const page = document.body.dataset.page;
  ({ home: pageHome, shop: pageShop, product: pageProduct, cart: pageCart, consult: pageConsult, stylist: pageStylist }[page] || (() => {}))();
});
