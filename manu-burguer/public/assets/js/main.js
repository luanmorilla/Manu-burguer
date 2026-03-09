import { products, WHATSAPP_NUMBER } from "../data/products.js";
import { formatCurrency, escapeHtml } from "./utils.js";
import { readCart, saveCart } from "./store.js";

const state = {
  products,
  filter: "all",
  cart: readCart(),
};

const elements = {
  grid: document.querySelector("#products-grid"),
  chips: document.querySelectorAll(".category-chip"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartOverlay: document.querySelector("#cart-overlay"),
  closeCart: document.querySelector("#close-cart"),
  cartList: document.querySelector("#cart-list"),
  cartSubtotal: document.querySelector("#cart-subtotal"),
  topCartCount: document.querySelector("#top-cart-count"),
  topCartTotal: document.querySelector("#top-cart-total"),
  bottomCartCount: document.querySelector("#bottom-cart-count"),
  bottomCartTotal: document.querySelector("#bottom-cart-total"),
  bottomCartPrice: document.querySelector("#bottom-cart-price"),
  openCartTop: document.querySelector("#open-cart-top"),
  openCartHero: document.querySelector("#open-cart-hero"),
  openCartBottom: document.querySelector("#open-cart-bottom"),
  clearCart: document.querySelector("#clear-cart"),
  openCheckout: document.querySelector("#open-checkout"),
  checkoutModal: document.querySelector("#checkout-modal"),
  checkoutOverlay: document.querySelector("#checkout-overlay"),
  closeCheckout: document.querySelector("#close-checkout"),
  checkoutForm: document.querySelector("#checkout-form"),
  checkoutTotal: document.querySelector("#checkout-total"),
  toast: document.querySelector("#toast"),
};

function getFilteredProducts() {
  if (state.filter === "all") return state.products;
  return state.products.filter((product) => product.category === state.filter);
}

function getCartDetailed() {
  return state.cart
    .map((item) => {
      const product = state.products.find((productItem) => productItem.id === item.id);
      if (!product) return null;
      return {
        ...product,
        quantity: item.quantity,
        total: product.price * item.quantity,
      };
    })
    .filter(Boolean);
}

function getCartTotals() {
  const detailed = getCartDetailed();
  const quantity = detailed.reduce((sum, item) => sum + item.quantity, 0);
  const total = detailed.reduce((sum, item) => sum + item.total, 0);
  return { quantity, total };
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function renderProducts() {
  const filtered = getFilteredProducts();

  elements.grid.innerHTML = filtered
    .map(
      (product) => `
      <article class="product-card reveal">
        <div class="product-thumb">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
        </div>
        <div class="product-content">
          <div class="product-topline">
            <h4 class="product-title">${escapeHtml(product.name)}</h4>
            <span class="product-badge">${escapeHtml(product.tag)}</span>
          </div>
          <p class="product-description">${escapeHtml(product.description)}</p>
          <div class="product-footer">
            <div class="product-price">
              <span>Preço</span>
              <strong>${formatCurrency(product.price)}</strong>
            </div>
            <button class="add-btn" type="button" data-add-id="${product.id}">Adicionar</button>
          </div>
        </div>
      </article>
    `,
    )
    .join("");
}

function renderCart() {
  const items = getCartDetailed();
  const totals = getCartTotals();

  if (!items.length) {
    elements.cartList.innerHTML = `
      <div class="empty-cart glass-soft">
        <h4>Seu carrinho está vazio</h4>
        <p>Adicione produtos do cardápio para continuar o pedido.</p>
      </div>
    `;
  } else {
    elements.cartList.innerHTML = items
      .map(
        (item) => `
        <article class="cart-item">
          <div class="cart-item__info">
            <div class="cart-item__title">${escapeHtml(item.name)}</div>
            <div class="cart-item__price">${formatCurrency(item.total)}</div>
            <button class="remove-link" type="button" data-remove-id="${item.id}">Remover</button>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" type="button" data-decrease-id="${item.id}">−</button>
            <strong>${item.quantity}</strong>
            <button class="qty-btn" type="button" data-increase-id="${item.id}">+</button>
          </div>
        </article>
      `,
      )
      .join("");
  }

  elements.cartSubtotal.textContent = formatCurrency(totals.total);
  elements.checkoutTotal.textContent = formatCurrency(totals.total);
  elements.topCartCount.textContent = `${totals.quantity} ${totals.quantity === 1 ? "item" : "itens"}`;
  elements.topCartTotal.textContent = formatCurrency(totals.total);
  elements.bottomCartCount.textContent = `${totals.quantity} ${totals.quantity === 1 ? "item" : "itens"} no carrinho`;
  elements.bottomCartTotal.textContent = totals.quantity
    ? "Toque para revisar o pedido"
    : "Escolha produtos para começar";
  elements.bottomCartPrice.textContent = formatCurrency(totals.total);
}

function setFilter(filter) {
  state.filter = filter;
  elements.chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.filter === filter);
  });
  renderProducts();
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }
  saveCart(state.cart);
  renderCart();
  showToast("Produto adicionado ao carrinho");
}

function updateQuantity(productId, change) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
  }

  saveCart(state.cart);
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart(state.cart);
  renderCart();
  closeCheckout();
}

function openCart() {
  elements.cartDrawer.classList.add("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  elements.cartDrawer.classList.remove("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

function openCheckout() {
  if (!state.cart.length) {
    showToast("Adicione pelo menos um item antes de finalizar");
    return;
  }
  elements.checkoutModal.classList.add("is-open");
  elements.checkoutModal.setAttribute("aria-hidden", "false");
}

function closeCheckout() {
  elements.checkoutModal.classList.remove("is-open");
  elements.checkoutModal.setAttribute("aria-hidden", "true");
}

function buildWhatsAppMessage(formData) {
  const items = getCartDetailed();
  const totals = getCartTotals();
  const lines = items.map(
    (item) => `• ${item.quantity}x ${item.name} — ${formatCurrency(item.total)}`,
  );

  const paymentMethod = formData.get("paymentMethod");
  const changeFor = formData.get("changeFor").trim();
  const notes = formData.get("notes").trim();

  return [
    `🍔 *NOVO PEDIDO - MANU BURGUER*`,
    "",
    `*Cliente:* ${formData.get("customerName").trim()}`,
    `*Endereço:* ${formData.get("address").trim()}`,
    `*Pagamento:* ${paymentMethod}`,
    changeFor ? `*Troco para:* ${changeFor}` : null,
    "",
    `*Itens do pedido:*`,
    ...lines,
    "",
    `*Total:* ${formatCurrency(totals.total)}`,
    notes ? `*Observações:* ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function submitCheckout(event) {
  event.preventDefault();

  if (!state.cart.length) {
    showToast("Seu carrinho está vazio");
    return;
  }

  const formData = new FormData(elements.checkoutForm);
  const message = buildWhatsAppMessage(formData);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
  showToast("Pedido montado e enviado para o WhatsApp");
}

function bindEvents() {
  elements.chips.forEach((chip) => {
    chip.addEventListener("click", () => setFilter(chip.dataset.filter));
  });

  elements.grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-id]");
    if (!button) return;
    addToCart(button.dataset.addId);
  });

  elements.cartList.addEventListener("click", (event) => {
    const increase = event.target.closest("[data-increase-id]");
    const decrease = event.target.closest("[data-decrease-id]");
    const remove = event.target.closest("[data-remove-id]");

    if (increase) updateQuantity(increase.dataset.increaseId, 1);
    if (decrease) updateQuantity(decrease.dataset.decreaseId, -1);
    if (remove) updateQuantity(remove.dataset.removeId, -999);
  });

  elements.openCartTop.addEventListener("click", openCart);
  elements.openCartHero.addEventListener("click", openCart);
  elements.openCartBottom.addEventListener("click", openCart);
  elements.closeCart.addEventListener("click", closeCart);
  elements.cartOverlay.addEventListener("click", closeCart);
  elements.clearCart.addEventListener("click", clearCart);
  elements.openCheckout.addEventListener("click", openCheckout);
  elements.closeCheckout.addEventListener("click", closeCheckout);
  elements.checkoutOverlay.addEventListener("click", closeCheckout);
  elements.checkoutForm.addEventListener("submit", submitCheckout);
}

function init() {
  renderProducts();
  renderCart();
  bindEvents();
}

init();
