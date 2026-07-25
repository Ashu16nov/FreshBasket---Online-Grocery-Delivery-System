const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'wishlists', indexes: [{ unique: true, fields: ['user_id', 'product_id'] }] });

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  low_stock_threshold: { type: DataTypes.INTEGER, defaultValue: 10 },
  last_restocked: { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'inventory' });

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(150), allowNull: false },
  body: { type: DataTypes.TEXT, defaultValue: null },
  type: { type: DataTypes.ENUM('order', 'payment', 'delivery', 'promotion', 'system'), defaultValue: 'system' },
  link: { type: DataTypes.STRING(300), defaultValue: null },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  invoice_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  pdf_url: { type: DataTypes.STRING(500), defaultValue: null },
  gst_number: { type: DataTypes.STRING(20), defaultValue: '27FRESHBASKET0000A1Z5' },
}, { tableName: 'invoices' });

module.exports = { Wishlist, Inventory, Notification, Invoice };
