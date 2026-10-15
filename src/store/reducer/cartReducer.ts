// src/store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  size: string;
  variantId?: string;
  variantStock?: number;
}

export interface State {
  cart: Product[];
  totalItems: number;
  totalAmount: number;
  showNotification: boolean;
}

export interface Actions {
  addToCart: (item: Product) => void;
  removeFromCart: (item: Product) => void;
  deleteFromCart: (item: Product) => void;
  clearCart: () => void;
  showCartNotification: () => void;
  hideCartNotification: () => void;
}

// Define the initial state
const INITIAL_STATE: State = {
  cart: [],
  totalItems: 0,
  totalAmount: 0,
  showNotification: false,
};

// Define the state type
type CartState = typeof INITIAL_STATE;
const matchesCartLine = (item: Product, product: Product) => product.variantId
  ? item.variantId === product.variantId
  : item.slug === product.slug && item.color === product.color && item.size === product.size;

// Create the cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    addToCart: (state: CartState, action: PayloadAction<Product>) => {
      const product = action.payload;
      const cartItem = state.cart.find((item) => matchesCartLine(item, product));
      if (product.variantStock !== undefined && product.variantStock <= 0) return;
      if (cartItem && product.variantStock !== undefined && cartItem.quantity >= product.variantStock) return;

      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }

      state.totalItems += 1;
      state.totalAmount = Math.max(state.totalAmount + product.price, 0);
      localStorage.setItem('cart', JSON.stringify(state));
      state.showNotification = true;
    },
    removeFromCart: (state: CartState, action: PayloadAction<Product>) => {
      const product = action.payload;
      const cartItem = state.cart.find((item) => matchesCartLine(item, product));

      if (cartItem) {
        cartItem.quantity -= 1;
        if (cartItem.quantity === 0) {
          state.cart = state.cart.filter((item) => !matchesCartLine(item, product));
        }
        state.totalItems -= 1;
        state.totalAmount = Math.max(state.totalAmount - product.price, 0);
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    deleteFromCart: (state: CartState, action: PayloadAction<Product>) => {
      const product = action.payload;
      const cartItem = state.cart.find((item) => matchesCartLine(item, product));

      if (cartItem) {
        state.totalItems -= cartItem.quantity;
        state.totalAmount = Math.max(state.totalAmount - cartItem.price * cartItem.quantity, 0);
        state.cart = state.cart.filter((item) => !matchesCartLine(item, product));
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    clearCart: (state: CartState) => {
      state.cart = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cart');
    },
    loadCart: (state: CartState) => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        state.cart = parsedCart.cart;
        state.totalItems = parsedCart.totalItems;
        state.totalAmount = parsedCart.totalAmount;
      }
    },
    showCartNotification: (state: CartState) => {
      state.showNotification = true;
    },
    hideCartNotification: (state: CartState) => {
      state.showNotification = false;
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  deleteFromCart,
  clearCart,
  loadCart,
  showCartNotification,
  hideCartNotification,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
