const { User, Order, Product, Review, Address } = require('../models');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash', 'refresh_token', 'otp', 'otp_expires'] },
    include: [{ model: Address, as: 'addresses' }],
  });
  return res.json({ success: true, data: user });
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, city, state, pincode } = req.body;
    const user = await User.findByPk(req.user.id);
    await user.update({
      name, phone, gender, city, state, pincode,
      profile_image: req.file ? `/uploads/${req.file.filename}` : user.profile_image,
    });
    return res.json({ success: true, message: 'Profile updated!', data: user });
  } catch (err) { next(err); }
};

// PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const match = await user.comparePassword(current_password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    user.password_hash = await bcrypt.hash(new_password, 12);
    await user.save();
    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

// Addresses
const addAddress = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user.id };
    if (data.is_default) await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    const address = await Address.create(data);
    return res.status(201).json({ success: true, message: 'Address added!', data: address });
  } catch (err) { next(err); }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    if (req.body.is_default) await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    await address.update(req.body);
    return res.json({ success: true, message: 'Address updated!', data: address });
  } catch (err) { next(err); }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    await address.destroy();
    return res.json({ success: true, message: 'Address deleted.' });
  } catch (err) { next(err); }
};

// Admin: get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const where = {};
    if (role) where.role = role;
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'refresh_token', 'otp'] },
      limit: parseInt(limit), offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, getAllUsers };
