const { Category } = require('../models');

const buildSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] });
    return res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, color, sort_order } = req.body;
    const slug = buildSlug(name);
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const category = await Category.create({ name, slug, icon, image, description, color, sort_order });
    return res.status(201).json({ success: true, message: 'Category created!', data: category });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    if (req.file) req.body.image = `/uploads/${req.file.filename}`;
    await cat.update(req.body);
    return res.json({ success: true, message: 'Category updated!', data: cat });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    await cat.update({ is_active: false });
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
