let events = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadEvents() {
  const res = await fetch("data/events.json");
  events = await res.json();
  renderCatalog(events);
}

function renderCatalog(list) {
  const app = document.getElementById("app");
  if (list.length === 0) {
    app.innerHTML = "<p>No hay resultados. <a href='#/catalog'>Limpiar filtros</a></p>";
    return;
  }
  app.innerHTML = list.map(ev => `
    <div class="card">
      <img src="${ev.images[0]}" alt="${ev.title}">
      <h3>${ev.title}</h3>
      <p>${ev.city} - ${new Date(ev.datetime).toLocaleDateString()}</p>
      <p><b>Desde:</b> $${ev.priceFrom} ${ev.currency}</p>
      <button onclick="location.hash='#/event/${ev.id}'">Ver detalle</button>
    </div>
  `).join("");
}

function renderDetail(id) {
  const ev = events.find(e => e.id === id);
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>${ev.title}</h2>
    <img src="${ev.images[0]}" alt="${ev.title}" style="width:300px;">
    <p>${ev.description}</p>
    <p><b>Lugar:</b> ${ev.venue}, ${ev.city}</p>
    <p><b>Fecha:</b> ${new Date(ev.datetime).toLocaleString()}</p>
    <p><b>Precio:</b> $${ev.priceFrom} ${ev.currency}</p>
    <button onclick="addToCart('${ev.id}')">Añadir al carrito</button>
    <button onclick="toggleFavorite('${ev.id}')">
      ${favorites.includes(ev.id) ? "Quitar de Favoritos" : "⭐ Añadir a Favoritos"}
    </button>
    <a href="#/catalog">⬅ Volver</a>
  `;
}

function renderCart() {
  const app = document.getElementById("app");
  if (cart.length === 0) {
    app.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }
  let total = 0;
  let html = "<h2>🛒 Carrito</h2><ul>";
  cart.forEach(item => {
    const ev = events.find(e => e.id === item.id);
    total += ev.priceFrom * item.qty;
    html += `
      <li>${ev.title} - Cant: ${item.qty} 
      <button onclick="removeFromCart('${ev.id}')">❌</button></li>
    `;
  });
  html += `</ul><p><b>Total:</b> $${total}</p>
  <button onclick="checkout()">Finalizar compra</button>
  <a href="#/catalog">⬅ Seguir viendo</a>`;
  app.innerHTML = html;
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({id, qty:1});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Añadido al carrito");
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function checkout() {
  const code = `EVT-${Date.now()}`;
  alert("Compra confirmada. Código: " + code);
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Favoritos
function renderFavorites() {
  const favEvents = events.filter(e => favorites.includes(e.id));
  renderCatalog(favEvents);
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  router();
}

document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = events.filter(ev =>
    ev.title.toLowerCase().includes(q) ||
    ev.city.toLowerCase().includes(q) ||
    ev.artists.join(" ").toLowerCase().includes(q)
  );
  renderCatalog(filtered);
});

function router() {
  const hash = location.hash;
  if (hash.startsWith("#/event/")) {
    renderDetail(hash.split("/")[2]);
  } else if (hash === "#/cart") {
    renderCart();
  } else if (hash === "#/favorites") {
    renderFavorites();
  } else {
    renderCatalog(events);
  }
}

window.addEventListener("hashchange", router);

loadEvents();
