const { Cart, CartItem, Product, Coupon } = require('../models');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) cart = await Cart.create({ user_id: userId });
  return cart;
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: CartItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'old_price', 'thumbnail', 'stock_qty', 'discount_pct', 'weight', 'unit'] }],
        },
        { model: Coupon, as: 'coupon' },
      ],
    });
    if (!cart) return res.json({ success: true, data: { items: [], coupon: null } });
    return res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

// POST /api/cart/add
const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock_qty < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock.' });

    const cart = await getOrCreateCart(req.user.id);
    let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });

    if (item) {
      item.quantity = Math.min(item.quantity + quantity, product.stock_qty, 10);
      await item.save();
    } else {
      item = await CartItem.create({ cart_id: cart.id, product_id, quantity });
    }
    return res.json({ success: true, message: 'Added to cart!', data: item });
  } catch (err) { next(err); }
};

// PUT /api/cart/update
const updateCartItem = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    if (quantity <= 0) {
      await item.destroy();
      return res.json({ success: true, message: 'Item removed from cart.' });
    }
    item.quantity = quantity;
    await item.save();
    return res.json({ success: true, message: 'Cart updated.', data: item });
  } catch (err) { next(err); }
};

// DELETE /api/cart/remove/:productId
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    await CartItem.destroy({ where: { cart_id: cart.id, product_id: req.params.productId } });
    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (err) { next(err); }
};

// DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) await CartItem.destroy({ where: { cart_id: cart.id } });
    return res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) { next(err); }
};

// POST /api/cart/coupon
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase(), is_active: true } });
    if (!coupon) return res.status(400).json({ success: false, message: 'Invalid or expired coupon.' });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses)
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });

    const cart = await getOrCreateCart(req.user.id);
    cart.coupon_id = coupon.id;
    await cart.save();
    return res.json({ success: true, message: 'Coupon applied!', data: coupon });
  } catch (err) { next(err); }
};

// DELETE /api/cart/coupon
const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) { cart.coupon_id = null; await cart.save(); }
    return res.json({ success: true, message: 'Coupon removed.' });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon };
