const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(200), defaultValue: null },
  discount_type: { type: DataTypes.ENUM('percentage', 'flat'), defaultValue: 'percentage' },
  discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  min_order: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  max_discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: null },
  max_uses: { type: DataTypes.INTEGER, defaultValue: null },
  uses_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  expires_at: { type: DataTypes.DATE, defaultValue: null },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'coupons' });

module.exports = Coupon;
