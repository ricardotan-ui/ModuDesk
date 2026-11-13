/* ==========================================================================
   ModuDesk - shared script
   Cart storage, header count, and per-page behaviour.
   ========================================================================== */

/* ---------- Product catalogue (ids match data-id in product.html) ---------- */
const ITEMS = {
  1:  { name: "Base Desk",         price: 289 },
  2:  { name: "Drawer Module",     price: 119 },
  3:  { name: "Monitor Riser",     price: 79 },
  4:  { name: "Cable Tray",        price: 39 },
  5:  { name: "Side Shelf",        price: 99 },
  6:  { name: "Desk Mat",          price: 49 },
  7:  { name: "Corner Extension",  price: 159 },
  8:  { name: "Monitor Arm",       price: 129 },
  9:  { name: "Keyboard Tray",     price: 69 },
  10: { name: "Pegboard Panel",    price: 59 },
  11: { name: "Headphone Hook",    price: 19 },
  12: { name: "Lamp Clip",         price: 54 }
};

const CART_KEY = "moduCart";


/* ---------- Cart helpers (all pages) ---------- */

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    /* storage unavailable: cart simply won't persist */
  }
  updateCount();
}

function updateCount() {
  const total = Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
  document.querySelectorAll(".count").forEach(el => {
    el.textContent = total;
  });
}


/* ---------- Products page ---------- */

function initProducts() {
  const list = document.getElementById("list");
  if (!list) return;

  const msg = document.getElementById("msg");

  /* Add to cart */
  list.addEventListener("click", e => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;

    const cart = getCart();
    const id = btn.dataset.id;
    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);

    msg.textContent = `${btn.dataset.name} added to cart (${cart[id]} in cart).`;

    btn.textContent = "Added \u2713";
    btn.classList.add("done");
    setTimeout(() => {
      btn.textContent = "Add to cart";
      btn.classList.remove("done");
    }, 1200);
  });

  /* Category filter */
  const filters = document.querySelector(".filters");
  if (!filters) return;

  filters.addEventListener("click", e => {
    const chip = e.target.closest("[data-filter]");
    if (!chip) return;

    const category = chip.dataset.filter;
    let shown = 0;

    filters.querySelectorAll(".chip").forEach(c => {
      c.classList.toggle("on", c === chip);
    });

    list.querySelectorAll(".product").forEach(card => {
      const visible = category === "All" || card.dataset.cat === category;
      card.hidden = !visible;
      if (visible) shown++;
    });

    document.getElementById("found").textContent =
      `${shown} ${shown === 1 ? "product" : "products"}`;
  });
}


/* ---------- Cart page ---------- */

function renderCart() {
  const box = document.getElementById("cart");
  if (!box) return;

  const cart = getCart();
  const ids = Object.keys(cart).filter(id => cart[id] > 0 && ITEMS[id]);

  if (!ids.length) {
    box.innerHTML = '<p>Your cart is empty. <a href="product.html">Browse products</a></p>';
    return;
  }

  let total = 0;
  const rows = ids.map(id => {
    const item = ITEMS[id];
    const subtotal = item.price * cart[id];
    total += subtotal;

    return `
      <tr>
        <td>${item.name}</td>
        <td>$${item.price}</td>
        <td class="qty">
          <button data-a="-" data-id="${id}" aria-label="Decrease">-</button>
          ${cart[id]}
          <button data-a="+" data-id="${id}" aria-label="Increase">+</button>
        </td>
        <td>$${subtotal}</td>
      </tr>`;
  }).join("");

  box.innerHTML = `
    <table>
      <tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
      ${rows}
    </table>
    <p class="total">Total: <strong>$${total}</strong></p>
    <p class="total"><button class="btn" id="co">Checkout</button></p>
    <p class="note" id="msg" role="status"></p>`;

  document.getElementById("co").onclick = () => {
    saveCart({});
    box.innerHTML = '<p class="note">Thanks! Your order is placed (demo).</p>';
  };
}

function initCart() {
  const box = document.getElementById("cart");
  if (!box) return;

  /* + / - quantity buttons */
  box.addEventListener("click", e => {
    const { a, id } = e.target.dataset;
    if (!a) return;

    const cart = getCart();
    cart[id] = (cart[id] || 0) + (a === "+" ? 1 : -1);
    if (cart[id] <= 0) delete cart[id];

    saveCart(cart);
    renderCart();
  });

  renderCart();
}


/* ---------- Contact page ---------- */

function initContact() {
  const form = document.getElementById("f");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("ok").textContent = "Message sent. Thanks for reaching out.";
    e.target.reset();
  });
}


/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  updateCount();
  initProducts();
  initCart();
  initContact();
});
