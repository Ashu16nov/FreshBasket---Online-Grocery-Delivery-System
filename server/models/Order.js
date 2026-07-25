const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  address_id: { type: DataTypes.INTEGER, allowNull: false },
  coupon_id: { type: DataTypes.INTEGER, defaultValue: null },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  coupon_discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 40 },
  grand_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_method: { type: DataTypes.ENUM('cod', 'upi', 'card', 'netbanking', 'wallet'), defaultValue: 'cod' },
  notes: { type: DataTypes.TEXT, defaultValue: null },
  estimated_delivery: { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'orders' });

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  product_name: { type: DataTypes.STRING(200), allowNull: false },
  product_image: { type: DataTypes.STRING(500), defaultValue: null },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'order_items' });

module.exports = { Order, OrderItem };
