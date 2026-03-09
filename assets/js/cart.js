window.createCartStore = function createCartStore() {
  const STORAGE_KEY = "manu-burguer-cart-v1";

  function read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Erro ao ler carrinho:", error);
      return [];
    }
  }

  function write(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  }

  let cart = read();
  const listeners = new Set();

  function notify() {
    write(cart);
    listeners.forEach((listener) => listener(getState()));
  }

  function getState() {
    const itemsCount = cart.reduce((total, item) => total + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items: cart,
      itemsCount,
      total,
    };
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(getState());
    return () => listeners.delete(listener);
  }

  function addItem(product, categoryTitle) {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        quantity: 1,
        categoryTitle,
      });
    }

    notify();
  }

  function increment(id) {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity += 1;
    notify();
  }

  function decrement(id) {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;

    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart = cart.filter((entry) => entry.id !== id);
    }

    notify();
  }

  function remove(id) {
    cart = cart.filter((entry) => entry.id !== id);
    notify();
  }

  function clear() {
    cart = [];
    notify();
  }

  return {
    subscribe,
    getState,
    addItem,
    increment,
    decrement,
    remove,
    clear,
  };
};
