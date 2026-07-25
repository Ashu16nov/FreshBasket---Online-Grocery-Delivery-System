const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateTokens } = require('../utils/generateToken');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, gender, city, state, pincode } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({
      name, email, phone, password_hash: password,
      role: role === 'admin' ? 'admin' : 'customer',
      gender, city, state, pincode,
      profile_image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refresh_token = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_image: user.profile_image },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refresh_token = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_image: user.profile_image, loyalty_points: user.loyalty_points },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== token)
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refresh_token = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, accessToken });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ where: { refresh_token: token } });
      if (user) { user.refresh_token = null; await user.save(); }
    }
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

module.exports = { register, login, refresh, logout, getMe };
