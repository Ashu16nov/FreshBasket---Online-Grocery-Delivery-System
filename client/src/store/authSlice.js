import { createSlice } from '@reduxjs/toolkit';

const user = JSON.parse(localStorage.getItem('fm_user') || 'null');
const token = localStorage.getItem('fm_token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user, token, isAuthenticated: !!token, loading: false },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('fm_user', JSON.stringify(action.payload.user));
      localStorage.setItem('fm_token', action.payload.accessToken);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('fm_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('fm_user');
      localStorage.removeItem('fm_token');
    },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setCredentials, updateUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
