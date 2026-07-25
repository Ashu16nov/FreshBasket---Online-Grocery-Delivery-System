const express = require('express');
const r = express.Router();
const { placeOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/auth');

r.post('/', protect, placeOrder);
r.get('/my', protect, getMyOrders);
r.get('/admin/all', protect, isAdmin, getAllOrders);
r.get('/:id', protect, getOrder);
r.put('/:id/cancel', protect, cancelOrder);
r.put('/admin/:id/status', protect, isAdmin, updateOrderStatus);

module.exports = r;
