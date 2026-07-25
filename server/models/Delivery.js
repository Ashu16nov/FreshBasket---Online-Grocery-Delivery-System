const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Delivery = sequelize.define('Delivery', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  agent_name: { type: DataTypes.STRING(100), defaultValue: null },
  agent_phone: { type: DataTypes.STRING(15), defaultValue: null },
  agent_image: { type: DataTypes.STRING(500), defaultValue: null },
  status: {
    type: DataTypes.ENUM('preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered'),
    defaultValue: 'preparing',
  },
  tracking_steps: {
    type: DataTypes.JSON,
    defaultValue: [
      { step: 'Order Placed', status: 'completed', time: null },
      { step: 'Preparing', status: 'pending', time: null },
      { step: 'Packed', status: 'pending', time: null },
      { step: 'Shipped', status: 'pending', time: null },
      { step: 'Out for Delivery', status: 'pending', time: null },
      { step: 'Delivered', status: 'pending', time: null },
    ],
  },
  estimated_at: { type: DataTypes.DATE, defaultValue: null },
  delivered_at: { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'deliveries' });

module.exports = Delivery;
