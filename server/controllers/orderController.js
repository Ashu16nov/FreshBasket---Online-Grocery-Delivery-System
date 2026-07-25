const { Order, OrderItem, Cart, CartItem, Product, Address, Payment, Delivery, Invoice, Coupon, Notification, User } = require('../models');
const { generateOrderNumber, generateInvoiceNumber } = require('../utils/generateToken');

// POST /api/orders
const placeOrder = async (req, res, next) => {
  try {
    const { address_id, payment_method, notes } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Coupon, as: 'coupon' },
      ],
    });

    if (!cart || !cart.items?.length) return res.status(400).json({ success: false, message: 'Cart is empty.' });

    const address = await Address.findOne({ where: { id: address_id, user_id: userId } });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.is_active) return res.status(400).json({ success: false, message: `Product ${product?.name} is unavailable.` });
      if (product.stock_qty < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      const total = parseFloat(product.price) * item.quantity;
      subtotal += total;
      orderItemsData.push({
        product_id: product.id, product_name: product.name,
        product_image: product.thumbnail, quantity: item.quantity,
        unit_price: product.price, total,
      });
    }

    let couponDiscount = 0;
    if (cart.coupon) {
      const c = cart.coupon;
      if (subtotal >= c.min_order) {
        couponDiscount = c.discount_type === 'percentage'
          ? Math.min((subtotal * c.discount_value) / 100, c.max_discount || Infinity)
          : c.discount_value;
        c.uses_count += 1; await c.save();
      }
    }

    const tax = parseFloat(((subtotal - couponDiscount) * 0.05).toFixed(2));
    const deliveryFee = subtotal > 499 ? 0 : 40;
    const grandTotal = parseFloat((subtotal - couponDiscount + tax + deliveryFee).toFixed(2));
    const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000);

    const order = await Order.create({
      order_number: generateOrderNumber(),
      user_id: userId, address_id,
      coupon_id: cart.coupon_id,
      status: 'confirmed',
      subtotal, coupon_discount: couponDiscount, tax,
      delivery_fee: deliveryFee, grand_total: grandTotal,
      payment_method, notes,
      estimated_delivery: estimatedDelivery,
    });

    await OrderItem.bulkCreate(orderItemsData.map(i => ({ ...i, order_id: order.id })));

    // Deduct stock
    for (const item of cart.items) {
      await Product.decrement('stock_qty', { by: item.quantity, where: { id: item.product_id } });
    }

    // Create payment record
    const txnId = payment_method !== 'cod' ? `TXN-${Date.now()}` : null;
    await Payment.create({
      order_id: order.id, user_id: userId, method: payment_method,
      status: payment_method === 'cod' ? 'pending' : 'success',
      transaction_id: txnId, amount: grandTotal,
      paid_at: payment_method !== 'cod' ? new Date() : null,
    });

    // Create delivery record
    const agents = ['Ravi Kumar', 'Suresh Babu', 'Priya Devi', 'Amit Sharma'];
    await Delivery.create({
      order_id: order.id,
      agent_name: agents[Math.floor(Math.random() * agents.length)],
      agent_phone: `98${Math.floor(Math.random() * 90000000 + 10000000)}`,
      status: 'preparing',
      estimated_at: estimatedDelivery,
      tracking_steps: [
        { step: 'Order Placed', status: 'completed', time: new Date() },
        { step: 'Preparing', status: 'current', time: null },
        { step: 'Packed', status: 'pending', time: null },
        { step: 'Shipped', status: 'pending', time: null },
        { step: 'Out for Delivery', status: 'pending', time: null },
        { step: 'Delivered', status: 'pending', time: null },
      ],
    });

    // Create invoice
    await Invoice.create({
      order_id: order.id,
      invoice_number: generateInvoiceNumber(),
    });

    // Notify user
    await Notification.create({
      user_id: userId,
      title: 'Order Placed Successfully! 🎉',
      body: `Your order #${order.order_number} has been confirmed.`,
      type: 'order', link: `/orders/${order.id}`,
    });

    // Clear cart
    await CartItem.destroy({ where: { cart_id: cart.id } });
    cart.coupon_id = null; await cart.save();

    // Loyalty points
    await User.increment('loyalty_points', { by: Math.floor(grandTotal / 10), where: { id: userId } });

    return res.status(201).json({ success: true, message: 'Order placed!', data: { order_id: order.id, order_number: order.order_number, grand_total: grandTotal } });
  } catch (err) { next(err); }
};

// GET /api/orders (customer)
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;
    const { count, rows } = await Order.findAndCountAll({
      where, limit: parseInt(limit), offset: (page - 1) * limit,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }] },
        { model: Address, as: 'address' },
        { model: Payment, as: 'payment' },
        { model: Delivery, as: 'delivery' },
        { model: Invoice, as: 'invoice' },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });

    order.status = 'cancelled'; await order.save();
    const payment = await Payment.findOne({ where: { order_id: order.id } });
    if (payment && payment.status === 'success') { payment.status = 'refunded'; await payment.save(); }

    await Notification.create({
      user_id: req.user.id, title: 'Order Cancelled',
      body: `Your order #${order.order_number} has been cancelled.`, type: 'order',
    });
    return res.json({ success: true, message: 'Order cancelled.' });
  } catch (err) { next(err); }
};

// GET /api/admin/orders (admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await Order.findAndCountAll({
      where, limit: parseInt(limit), offset: (page - 1) * limit,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

// PUT /api/admin/orders/:id/status (admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, { include: [{ model: Delivery, as: 'delivery' }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = status; await order.save();

    if (order.delivery) {
      const statusMap = { preparing: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5 };
      const steps = order.delivery.tracking_steps;
      const idx = statusMap[status];
      if (idx !== undefined) {
        for (let i = 0; i < steps.length; i++) {
          if (i < idx) steps[i].status = 'completed', steps[i].time = new Date();
          else if (i === idx) steps[i].status = 'current';
          else steps[i].status = 'pending';
        }
        order.delivery.tracking_steps = steps;
        order.delivery.status = status;
        if (status === 'delivered') order.delivery.delivered_at = new Date();
        await order.delivery.save();
      }
    }
    await Notification.create({
      user_id: order.user_id, title: `Order Status Updated`,
      body: `Your order #${order.order_number} is now: ${status}`, type: 'delivery',
    });
    return res.json({ success: true, message: 'Status updated.', data: order });
  } catch (err) { next(err); }
};

module.exports = { placeOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus };
