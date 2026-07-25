import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null, isOpen: false, loading: false },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.coupon = action.payload.coupon || null;
    },
    addItem: (state, action) => {
      const existing = state.items.find(i => i.product_id === action.payload.product_id);
      if (existing) existing.quantity += action.payload.quantity || 1;
      else state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const item = state.items.find(i => i.product_id === action.payload.product_id);
      if (item) {
        if (action.payload.quantity <= 0) state.items = state.items.filter(i => i.product_id !== action.payload.product_id);
        else item.quantity = action.payload.quantity;
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.product_id !== action.payload);
    },
    setCoupon: (state, action) => { state.coupon = action.payload; },
    clearCoupon: (state) => { state.coupon = null; },
    clearCart: (state) => { state.items = []; state.coupon = null; },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
    setCartLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setCart, addItem, updateItem, removeItem, setCoupon, clearCoupon, clearCart, toggleCart, openCart, closeCart, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
