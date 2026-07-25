const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(15), allowNull: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'admin', 'delivery'), defaultValue: 'customer' },
  profile_image: { type: DataTypes.STRING(500), defaultValue: null },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), defaultValue: null },
  city: { type: DataTypes.STRING(100), defaultValue: null },
  state: { type: DataTypes.STRING(100), defaultValue: null },
  pincode: { type: DataTypes.STRING(10), defaultValue: null },
  loyalty_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  wallet_balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  refresh_token: { type: DataTypes.TEXT, defaultValue: null },
  otp: { type: DataTypes.STRING(6), defaultValue: null },
  otp_expires: { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'users' });

User.beforeCreate(async (user) => {
  user.password_hash = await bcrypt.hash(user.password_hash, 12);
});

User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;
