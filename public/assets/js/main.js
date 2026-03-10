import { products, WHATSAPP_NUMBER } from "../data/products.js";
import { formatCurrency, escapeHtml } from "./utils.js";
import { readCart, saveCart } from "./store.js";

const state = {
  products: Array.isArray(products) ? products : [],
  filter: "all",
  cart: Array.isArray(readCart()) ? readCart() : [],
  selectedProductId: null,
};

const elements = {
  grid: document.querySelector("#products-grid"),
  chips: document.querySelectorAll(".category-chip"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartOverlay: document.querySelector("#cart-overlay"),
  closeCart: document.querySelector("#close-cart"),
  cartList: document.querySelector("#cart-list"),
  cartSubtotal: document.querySelector("#cart-subtotal"),
  cartPrepTime: document.querySelector("#cart-prep-time"),
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
  orderType: document.querySelector("#order-type"),
  addressField: document.querySelector("#address-field"),
  productModal: document.querySelector("#product-modal"),
  productOverlay: document.querySelector("#product-overlay"),
  closeProductModal: document.querySelector("#close-product-modal"),
  productModalTitle: document.querySelector("#product-modal-title"),
  productModalImage: document.querySelector("#product-modal-image"),
  productModalTag: document.querySelector("#product-modal-tag"),
  productModalDescription: document.querySelector("#product-modal-description"),
  productModalPrice: document.querySelector("#product-modal-price"),
  productModalPrep: document.querySelector("#product-modal-prep"),
  productModalAdd: document.querySelector("#product-modal-add"),
};

function setBodyScrollLocked(locked) {
  document.body.style.overflow = locked ? "hidden" : "";
}

function persistCart() {
  saveCart(state.cart);
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function sanitizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPhoneForMessage(value) {
  const digits = sanitizePhone(value);

  if (!digits) return "";

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

function getProductById(productId) {
  return state.products.find((product) => product.id === productId) || null;
}

function getFilteredProducts() {
  if (state.filter === "all") return state.products;
  return state.products.filter((product) => product.category === state.filter);
}

function getCartDetailed() {
  return state.cart
    .map((item) => {
      const product = getProductById(item.id);
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

  return {
    quantity: detailed.reduce((sum, item) => sum + item.quantity, 0),
    total: detailed.reduce((sum, item) => sum + item.total, 0),
  };
}

function getPrepTimeRange() {
  const items = getCartDetailed();
  if (!items.length) return "15 a 25 min";

  const hasCombo = items.some((item) => item.category === "combos");
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (hasCombo || itemCount >= 4) return "25 a 40 min";
  if (itemCount >= 2) return "20 a 35 min";
  return "15 a 25 min";
}

function showToast(message) {
  if (!elements.toast) return;

  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function animateCartCounters() {
  const targets = [
    elements.topCartCount,
    elements.topCartTotal,
    elements.bottomCartCount,
    elements.bottomCartPrice,
    elements.openCartTop,
    elements.openCartBottom,
  ].filter(Boolean);

  targets.forEach((element) => {
    element.classList.remove("bump");
    void element.offsetWidth;
    element.classList.add("bump");
  });
}

function animateProductCard(productId) {
  const button = document.querySelector(`[data-add-id="${productId}"]`);
  const card = button?.closest(".product-card");
  if (!card) return;

  card.classList.remove("is-adding");
  void card.offsetWidth;
  card.classList.add("is-adding");
}

function updateBottomCartVisibility(quantity) {
  if (!elements.openCartBottom) return;

  if (quantity > 0) {
    elements.openCartBottom.classList.remove("is-hidden");
    elements.openCartBottom.classList.add("is-visible");
  } else {
    elements.openCartBottom.classList.remove("is-visible");
    elements.openCartBottom.classList.add("is-hidden");
  }
}

function renderProducts() {
  if (!elements.grid) return;

  const filtered = getFilteredProducts();

  if (!filtered.length) {
    elements.grid.innerHTML = `
      <div class="empty-cart glass-soft">
        <h4>Nenhum item encontrado</h4>
        <p>Não há produtos disponíveis nesta categoria no momento.</p>
      </div>
    `;
    return;
  }

  elements.grid.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card reveal ${product.featured ? "product-card--featured" : ""}">
          <button class="product-thumb product-thumb--button" type="button" data-open-product="${product.id}" aria-label="Ver detalhes de ${escapeHtml(product.name)}">
            <img
              src="${escapeHtml(product.image)}"
              alt="${escapeHtml(product.name)}"
              loading="lazy"
            />
          </button>

          <div class="product-content">
            <div class="product-topline">
              <h4 class="product-title">${escapeHtml(product.name)}</h4>
              <span class="product-badge">${escapeHtml(product.tag || "Item")}</span>
            </div>

            <p class="product-description">${escapeHtml(product.description)}</p>

            <div class="product-footer">
              <div class="product-price">
                <span>Preço</span>
                <strong>${formatCurrency(product.price)}</strong>
              </div>

              <button class="add-btn" type="button" data-add-id="${product.id}">
                Adicionar
              </button>
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
  const prepTime = getPrepTimeRange();

  if (elements.cartList) {
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
                <button class="remove-link" type="button" data-remove-id="${item.id}">
                  Remover
                </button>
              </div>

              <div class="qty-controls">
                <button
                  class="qty-btn"
                  type="button"
                  data-decrease-id="${item.id}"
                  aria-label="Diminuir quantidade de ${escapeHtml(item.name)}"
                >
                  −
                </button>

                <strong>${item.quantity}</strong>

                <button
                  class="qty-btn"
                  type="button"
                  data-increase-id="${item.id}"
                  aria-label="Aumentar quantidade de ${escapeHtml(item.name)}"
                >
                  +
                </button>
              </div>
            </article>
          `,
        )
        .join("");
    }
  }

  if (elements.cartSubtotal) elements.cartSubtotal.textContent = formatCurrency(totals.total);
  if (elements.checkoutTotal) elements.checkoutTotal.textContent = formatCurrency(totals.total);
  if (elements.cartPrepTime) elements.cartPrepTime.textContent = prepTime;
  if (elements.topCartCount) {
    elements.topCartCount.textContent = `${totals.quantity} ${totals.quantity === 1 ? "item" : "itens"}`;
  }
  if (elements.topCartTotal) elements.topCartTotal.textContent = formatCurrency(totals.total);
  if (elements.bottomCartCount) {
    elements.bottomCartCount.textContent = `${totals.quantity} ${totals.quantity === 1 ? "item" : "itens"} no carrinho`;
  }
  if (elements.bottomCartTotal) {
    elements.bottomCartTotal.textContent = totals.quantity
      ? `Preparo médio: ${prepTime}`
      : "Escolha produtos para começar";
  }
  if (elements.bottomCartPrice) elements.bottomCartPrice.textContent = formatCurrency(totals.total);

  updateBottomCartVisibility(totals.quantity);
}

function setFilter(filter) {
  state.filter = filter;

  elements.chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.filter === filter);
  });

  renderProducts();
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) {
    showToast("Produto inválido");
    return;
  }

  const existing = state.cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  persistCart();
  renderCart();
  animateProductCard(productId);
  animateCartCounters();
  showToast("Produto adicionado ao carrinho");
}

function removeFromCart(productId) {
  const exists = state.cart.some((item) => item.id === productId);
  if (!exists) return;

  state.cart = state.cart.filter((item) => item.id !== productId);
  persistCart();
  renderCart();
  animateCartCounters();
  showToast("Produto removido do carrinho");

  if (!state.cart.length) closeCheckout();
}

function updateQuantity(productId, change) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  persistCart();
  renderCart();
  animateCartCounters();
}

function clearCart() {
  state.cart = [];
  persistCart();
  renderCart();

  if (elements.checkoutForm) elements.checkoutForm.reset();

  closeCheckout();
  closeCart();
  showToast("Carrinho limpo");
}

function openCart() {
  if (!elements.cartDrawer) return;

  elements.cartDrawer.classList.add("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  setBodyScrollLocked(true);
}

function closeCart() {
  if (!elements.cartDrawer) return;

  elements.cartDrawer.classList.remove("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");

  if (
    !elements.checkoutModal?.classList.contains("is-open") &&
    !elements.productModal?.classList.contains("is-open")
  ) {
    setBodyScrollLocked(false);
  }
}

function openCheckout() {
  if (!state.cart.length) {
    showToast("Adicione pelo menos um item antes de finalizar");
    return;
  }

  if (!elements.checkoutModal) return;

  elements.checkoutModal.classList.add("is-open");
  elements.checkoutModal.setAttribute("aria-hidden", "false");
  setBodyScrollLocked(true);

  const firstInput = elements.checkoutForm?.querySelector("input, textarea, select");
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function closeCheckout() {
  if (!elements.checkoutModal) return;

  elements.checkoutModal.classList.remove("is-open");
  elements.checkoutModal.setAttribute("aria-hidden", "true");

  if (
    !elements.cartDrawer?.classList.contains("is-open") &&
    !elements.productModal?.classList.contains("is-open")
  ) {
    setBodyScrollLocked(false);
  }
}

function openProductModal(productId) {
  const product = getProductById(productId);
  if (!product || !elements.productModal) return;

  state.selectedProductId = productId;

  if (elements.productModalTitle) elements.productModalTitle.textContent = product.name;
  if (elements.productModalImage) {
    elements.productModalImage.src = product.image;
    elements.productModalImage.alt = product.name;
  }
  if (elements.productModalTag) elements.productModalTag.textContent = product.tag || "Item";
  if (elements.productModalDescription) elements.productModalDescription.textContent = product.description;
  if (elements.productModalPrice) elements.productModalPrice.textContent = formatCurrency(product.price);
  if (elements.productModalPrep) {
    elements.productModalPrep.textContent =
      product.category === "combos" ? "25 a 40 min" : "15 a 25 min";
  }

  elements.productModal.classList.add("is-open");
  elements.productModal.setAttribute("aria-hidden", "false");
  setBodyScrollLocked(true);
}

function closeProductModal() {
  if (!elements.productModal) return;

  elements.productModal.classList.remove("is-open");
  elements.productModal.setAttribute("aria-hidden", "true");
  state.selectedProductId = null;

  if (
    !elements.cartDrawer?.classList.contains("is-open") &&
    !elements.checkoutModal?.classList.contains("is-open")
  ) {
    setBodyScrollLocked(false);
  }
}

function toggleAddressField() {
  if (!elements.orderType || !elements.addressField || !elements.checkoutForm) return;

  const addressInput = elements.checkoutForm.querySelector('textarea[name="address"]');
  const isDelivery = elements.orderType.value === "Entrega";

  elements.addressField.style.display = isDelivery ? "" : "none";

  if (addressInput) {
    addressInput.required = isDelivery;
    if (!isDelivery) addressInput.value = "";
  }
}

function validateCheckout(formData) {
  const customerName = normalizeText(formData.get("customerName"));
  const phoneRaw = normalizeText(formData.get("phone"));
  const phoneDigits = sanitizePhone(phoneRaw);
  const orderType = normalizeText(formData.get("orderType"));
  const address = normalizeText(formData.get("address"));
  const paymentMethod = normalizeText(formData.get("paymentMethod"));
  const changeFor = normalizeText(formData.get("changeFor"));
  const notes = normalizeText(formData.get("notes"));

  if (!customerName) return { valid: false, message: "Digite o nome do cliente" };
  if (customerName.length < 2) return { valid: false, message: "Digite um nome válido" };
  if (!phoneRaw) return { valid: false, message: "Digite o telefone ou WhatsApp" };
  if (phoneDigits.length < 10) return { valid: false, message: "Digite um telefone válido com DDD" };
  if (!orderType) return { valid: false, message: "Selecione o tipo do pedido" };
  if (orderType === "Entrega" && !address) {
    return { valid: false, message: "Digite o endereço completo para entrega" };
  }
  if (!paymentMethod) return { valid: false, message: "Selecione a forma de pagamento" };

  if (paymentMethod.toLowerCase() === "dinheiro" && changeFor && !/^\d+[.,]?\d*$/.test(changeFor)) {
    return { valid: false, message: "Preencha o troco em formato válido. Ex: 100,00" };
  }

  return {
    valid: true,
    values: {
      customerName,
      phone: formatPhoneForMessage(phoneRaw),
      orderType,
      address,
      paymentMethod,
      changeFor,
      notes,
    },
  };
}

function buildWhatsAppMessage(validated) {
  const items = getCartDetailed();
  const totals = getCartTotals();
  const prepTime = getPrepTimeRange();
  const dateTime = new Date().toLocaleString("pt-BR");

  const lines = items.map(
    (item) => `• ${item.quantity}x ${item.name} — ${formatCurrency(item.total)}`,
  );

  return [
    `🍔 *NOVO PEDIDO - MANU BURGUER*`,
    ``,
    `*Data/Hora:* ${dateTime}`,
    `*Cliente:* ${validated.customerName}`,
    `*Telefone:* ${validated.phone}`,
    `*Tipo do pedido:* ${validated.orderType}`,
    validated.orderType === "Entrega" ? `*Endereço:* ${validated.address}` : `*Retirada:* No balcão`,
    `*Pagamento:* ${validated.paymentMethod}`,
    validated.changeFor ? `*Troco para:* ${validated.changeFor}` : null,
    `*Preparo médio:* ${prepTime}`,
    ``,
    `*Itens do pedido:*`,
    ...lines,
    ``,
    `*Total:* ${formatCurrency(totals.total)}`,
    validated.notes ? `*Observações:* ${validated.notes}` : null,
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

  if (!elements.checkoutForm) return;

  const formData = new FormData(elements.checkoutForm);
  const validation = validateCheckout(formData);

  if (!validation.valid) {
    showToast(validation.message);
    return;
  }

  const message = buildWhatsAppMessage(validation.values);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");

  closeCheckout();
  closeCart();
  elements.checkoutForm.reset();
  toggleAddressField();

  state.cart = [];
  persistCart();
  renderCart();

  showToast("Pedido montado com sucesso");
}

function bindPhoneMask() {
  if (!elements.checkoutForm) return;

  const phoneInput = elements.checkoutForm.querySelector('input[name="phone"]');
  if (!phoneInput) return;

  phoneInput.addEventListener("input", (event) => {
    const digits = sanitizePhone(event.target.value).slice(0, 11);

    if (digits.length <= 10) {
      event.target.value = digits.replace(
        /^(\d{0,2})(\d{0,4})(\d{0,4}).*/,
        (_, ddd, part1, part2) => {
          let output = "";
          if (ddd) output += `(${ddd}`;
          if (ddd.length === 2) output += ") ";
          if (part1) output += part1;
          if (part2) output += `-${part2}`;
          return output;
        },
      );
      return;
    }

    event.target.value = digits.replace(
      /^(\d{0,2})(\d{0,5})(\d{0,4}).*/,
      (_, ddd, part1, part2) => {
        let output = "";
        if (ddd) output += `(${ddd}`;
        if (ddd.length === 2) output += ") ";
        if (part1) output += part1;
        if (part2) output += `-${part2}`;
        return output;
      },
    );
  });
}

function bindEvents() {
  elements.chips.forEach((chip) => {
    chip.addEventListener("click", () => setFilter(chip.dataset.filter));
  });

  if (elements.grid) {
    elements.grid.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-id]");
      const productButton = event.target.closest("[data-open-product]");

      if (addButton) {
        addToCart(addButton.dataset.addId);
        return;
      }

      if (productButton) {
        openProductModal(productButton.dataset.openProduct);
      }
    });
  }

  if (elements.cartList) {
    elements.cartList.addEventListener("click", (event) => {
      const increase = event.target.closest("[data-increase-id]");
      const decrease = event.target.closest("[data-decrease-id]");
      const remove = event.target.closest("[data-remove-id]");

      if (increase) {
        updateQuantity(increase.dataset.increaseId, 1);
        return;
      }

      if (decrease) {
        updateQuantity(decrease.dataset.decreaseId, -1);
        return;
      }

      if (remove) {
        removeFromCart(remove.dataset.removeId);
      }
    });
  }

  if (elements.openCartTop) elements.openCartTop.addEventListener("click", openCart);
  if (elements.openCartHero) elements.openCartHero.addEventListener("click", openCart);
  if (elements.openCartBottom) elements.openCartBottom.addEventListener("click", openCart);
  if (elements.closeCart) elements.closeCart.addEventListener("click", closeCart);
  if (elements.cartOverlay) elements.cartOverlay.addEventListener("click", closeCart);
  if (elements.clearCart) elements.clearCart.addEventListener("click", clearCart);
  if (elements.openCheckout) elements.openCheckout.addEventListener("click", openCheckout);
  if (elements.closeCheckout) elements.closeCheckout.addEventListener("click", closeCheckout);
  if (elements.checkoutOverlay) elements.checkoutOverlay.addEventListener("click", closeCheckout);

  if (elements.closeProductModal) elements.closeProductModal.addEventListener("click", closeProductModal);
  if (elements.productOverlay) elements.productOverlay.addEventListener("click", closeProductModal);
  if (elements.productModalAdd) {
    elements.productModalAdd.addEventListener("click", () => {
      if (!state.selectedProductId) return;
      addToCart(state.selectedProductId);
      closeProductModal();
    });
  }

  if (elements.checkoutForm) {
    elements.checkoutForm.addEventListener("submit", submitCheckout);
  }

  if (elements.orderType) {
    elements.orderType.addEventListener("change", toggleAddressField);
  }

  bindPhoneMask();

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (elements.productModal?.classList.contains("is-open")) {
      closeProductModal();
      return;
    }

    if (elements.checkoutModal?.classList.contains("is-open")) {
      closeCheckout();
      return;
    }

    if (elements.cartDrawer?.classList.contains("is-open")) {
      closeCart();
    }
  });
}

function init() {
  renderProducts();
  renderCart();
  bindEvents();
  toggleAddressField();
}

init();