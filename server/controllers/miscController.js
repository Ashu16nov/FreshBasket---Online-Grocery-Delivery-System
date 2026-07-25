const { Wishlist, Product, Category, Review, Order, OrderItem, User, Payment } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Wishlist
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }],
    });
    return res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const existing = await Wishlist.findOne({ where: { user_id: req.user.id, product_id } });
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, message: 'Removed from wishlist.', added: false });
    }
    await Wishlist.create({ user_id: req.user.id, product_id });
    return res.json({ success: true, message: 'Added to wishlist!', added: true });
  } catch (err) { next(err); }
};

// Reviews
const addReview = async (req, res, next) => {
  try {
    const { product_id, rating, title, body } = req.body;
    const existing = await Review.findOne({ where: { user_id: req.user.id, product_id } });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this product.' });

    const review = await Review.create({
      product_id, user_id: req.user.id, rating, title, body,
      images: req.files?.length ? req.files.map(f => `/uploads/${f.filename}`) : [],
    });

    // Recalculate product rating
    const result = await Review.findAll({
      where: { product_id },
      attributes: [[fn('AVG', col('rating')), 'avg'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });
    await Product.update(
      { rating_avg: parseFloat(result[0].avg).toFixed(2), rating_count: result[0].count },
      { where: { id: product_id } }
    );

    return res.status(201).json({ success: true, message: 'Review submitted!', data: review });
  } catch (err) { next(err); }
};

// Admin Dashboard Analytics
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [totalOrders, todayOrders, totalRevenue, todayRevenue, totalCustomers, totalProducts, lowStockProducts, pendingOrders] = await Promise.all([
      Order.count(),
      Order.count({ where: { createdAt: { [Op.between]: [today, todayEnd] } } }),
      Order.sum('grand_total', { where: { status: { [Op.notIn]: ['cancelled', 'refunded'] } } }),
      Order.sum('grand_total', { where: { createdAt: { [Op.between]: [today, todayEnd] }, status: { [Op.notIn]: ['cancelled'] } } }),
      User.count({ where: { role: 'customer' } }),
      Product.count({ where: { is_active: true } }),
      Product.count({ where: { stock_qty: { [Op.lte]: 10 }, is_active: true } }),
      Order.count({ where: { status: 'pending' } }),
    ]);

    // Last 7 days sales
    const salesData = await Order.findAll({
      where: { createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, status: { [Op.notIn]: ['cancelled'] } },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('SUM', col('grand_total')), 'revenue'],
        [fn('COUNT', col('id')), 'orders'],
      ],
      group: [fn('DATE', col('created_at'))],
      raw: true,
    });

    return res.json({
      success: true,
      data: { totalOrders, todayOrders, totalRevenue: totalRevenue || 0, todayRevenue: todayRevenue || 0, totalCustomers, totalProducts, lowStockProducts, pendingOrders, salesData },
    });
  } catch (err) { next(err); }
};

module.exports = { getWishlist, toggleWishlist, addReview, getDashboardStats };
