const { sequelize } = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Address = require('./Address');
const { Cart, CartItem } = require('./Cart');
const Coupon = require('./Coupon');
const { Order, OrderItem } = require('./Order');
const Payment = require('./Payment');
const Delivery = require('./Delivery');
const Review = require('./Review');
const { Wishlist, Inventory, Notification, Invoice } = require('./Misc');

// ─── Category ↔ Product ───────────────────────────────────────────────
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// ─── User ↔ Address ───────────────────────────────────────────────────
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── User ↔ Cart ──────────────────────────────────────────────────────
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ─── User ↔ Order ─────────────────────────────────────────────────────
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Order.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ─── Order ↔ Payment ──────────────────────────────────────────────────
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// ─── Order ↔ Delivery ─────────────────────────────────────────────────
Order.hasOne(Delivery, { foreignKey: 'order_id', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// ─── Product ↔ Review ─────────────────────────────────────────────────
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── User ↔ Wishlist ──────────────────────────────────────────────────
User.hasMany(Wishlist, { foreignKey: 'user_id', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ─── Product ↔ Inventory ──────────────────────────────────────────────
Product.hasOne(Inventory, { foreignKey: 'product_id', as: 'inventory' });
Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ─── User ↔ Notification ──────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// ─── Order ↔ Invoice ──────────────────────────────────────────────────
Order.hasOne(Invoice, { foreignKey: 'order_id', as: 'invoice' });
Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = {
  sequelize, User, Category, Product, Address, Cart, CartItem,
  Coupon, Order, OrderItem, Payment, Delivery, Review,
  Wishlist, Inventory, Notification, Invoice,
};
