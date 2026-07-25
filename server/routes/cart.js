const express = require('express');
const r = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

r.get('/', protect, getCart);
r.post('/add', protect, addToCart);
r.put('/update', protect, updateCartItem);
r.delete('/remove/:productId', protect, removeFromCart);
r.delete('/clear', protect, clearCart);
r.post('/coupon', protect, applyCoupon);
r.delete('/coupon', protect, removeCoupon);

module.exports = r;
