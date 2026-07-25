const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
  brand: { type: DataTypes.STRING(100), defaultValue: null },
  weight: { type: DataTypes.STRING(50), defaultValue: null },
  unit: { type: DataTypes.STRING(30), defaultValue: 'piece' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  old_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: null },
  discount_pct: { type: DataTypes.INTEGER, defaultValue: 0 },
  stock_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
  images: { type: DataTypes.JSON, defaultValue: [] },
  thumbnail: { type: DataTypes.STRING(500), defaultValue: null },
  description: { type: DataTypes.TEXT, defaultValue: null },
  ingredients: { type: DataTypes.TEXT, defaultValue: null },
  nutritional_info: { type: DataTypes.JSON, defaultValue: null },
  rating_avg: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
  rating_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_flash_sale: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_organic: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'products' });

module.exports = Product;
