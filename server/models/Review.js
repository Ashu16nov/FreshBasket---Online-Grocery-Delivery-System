const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id: { type: DataTypes.INTEGER, defaultValue: null },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING(150), defaultValue: null },
  body: { type: DataTypes.TEXT, defaultValue: null },
  images: { type: DataTypes.JSON, defaultValue: [] },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  helpful_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'reviews' });

module.exports = Review;
