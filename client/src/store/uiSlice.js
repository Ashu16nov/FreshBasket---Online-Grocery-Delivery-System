import { createSlice } from '@reduxjs/toolkit';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('fm_theme');

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isDarkMode: savedTheme ? savedTheme === 'dark' : prefersDark,
    searchQuery: '',
    isSearchOpen: false,
    isMenuOpen: false,
    notifications: [],
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('fm_theme', state.isDarkMode ? 'dark' : 'light');
      if (state.isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      if (action.payload) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    toggleSearch: (state) => { state.isSearchOpen = !state.isSearchOpen; },
    toggleMenu: (state) => { state.isMenuOpen = !state.isMenuOpen; },
    closeMenu: (state) => { state.isMenuOpen = false; },
    addNotification: (state, action) => {
      state.notifications.unshift({ ...action.payload, id: Date.now() });
      if (state.notifications.length > 5) state.notifications.pop();
    },
    markAllRead: (state) => { state.notifications = state.notifications.map(n => ({ ...n, read: true })); },
  },
});

export const { toggleDarkMode, setDarkMode, setSearchQuery, toggleSearch, toggleMenu, closeMenu, addNotification, markAllRead } = uiSlice.actions;
export default uiSlice.reducer;
