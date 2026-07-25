const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  method: { type: DataTypes.ENUM('cod', 'upi', 'card', 'netbanking', 'wallet'), defaultValue: 'cod' },
  status: { type: DataTypes.ENUM('pending', 'processing', 'success', 'failed', 'refunded'), defaultValue: 'pending' },
  transaction_id: { type: DataTypes.STRING(100), defaultValue: null },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  gateway_response: { type: DataTypes.JSON, defaultValue: null },
  paid_at: { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'payments' });

module.exports = Payment;
