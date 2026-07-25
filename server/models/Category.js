const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  icon: { type: DataTypes.STRING(10), defaultValue: '🛒' },
  image: { type: DataTypes.STRING(500), defaultValue: null },
  description: { type: DataTypes.TEXT, defaultValue: null },
  color: { type: DataTypes.STRING(20), defaultValue: '#16A34A' },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'categories' });

module.exports = Category;
