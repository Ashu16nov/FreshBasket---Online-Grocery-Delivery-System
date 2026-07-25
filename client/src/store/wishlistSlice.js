import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], productIds: [] },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
      state.productIds = action.payload.map(i => i.product_id);
    },
    toggleItem: (state, action) => {
      const id = action.payload;
      if (state.productIds.includes(id)) {
        state.productIds = state.productIds.filter(p => p !== id);
        state.items = state.items.filter(i => i.product_id !== id);
      } else {
        state.productIds.push(id);
        state.items.push({ product_id: id });
      }
    },
    clearWishlist: (state) => { state.items = []; state.productIds = []; },
  },
});

export const { setWishlist, toggleItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
