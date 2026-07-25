const express = require('express');
const r = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, getAllUsers } = require('../controllers/userController');
const { getWishlist, toggleWishlist, addReview, getDashboardStats } = require('../controllers/miscController');
const { protect, isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Profile
r.get('/profile', protect, getProfile);
r.put('/profile', protect, upload.single('profile_image'), updateProfile);
r.put('/change-password', protect, changePassword);

// Addresses
r.post('/addresses', protect, addAddress);
r.put('/addresses/:id', protect, updateAddress);
r.delete('/addresses/:id', protect, deleteAddress);

// Wishlist
r.get('/wishlist', protect, getWishlist);
r.post('/wishlist/toggle', protect, toggleWishlist);

// Reviews
r.post('/reviews', protect, upload.array('images', 5), addReview);

// Admin
r.get('/admin/all', protect, isAdmin, getAllUsers);
r.get('/admin/dashboard', protect, isAdmin, getDashboardStats);

module.exports = r;
