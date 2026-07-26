const { Op } = require('sequelize');
const { Product, Category, Review, Inventory, Wishlist } = require('../models');

const buildSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, brand, minPrice, maxPrice,
      minRating, search, sort = 'createdAt', order = 'DESC',
      featured, flash_sale, organic,
    } = req.query;

    const where = { is_active: true };
    if (category) {
      if (!isNaN(category)) {
        where.category_id = parseInt(category);
      } else {
        const catObj = await Category.findOne({
          where: {
            [Op.or]: [
              { slug: category },
              { slug: { [Op.like]: `%${category}%` } },
              { name: { [Op.like]: `%${category}%` } },
            ],
          },
        });
        if (catObj) {
          where.category_id = catObj.id;
        } else {
          where.category_id = -1; // return empty if category not found
        }
      }
    }
    if (brand) where.brand = { [Op.like]: `%${brand}%` };
    if (minPrice || maxPrice) where.price = { [Op.between]: [minPrice || 0, maxPrice || 99999] };
    if (minRating) where.rating_avg = { [Op.gte]: minRating };
    if (featured) where.is_featured = true;
    if (flash_sale) where.is_flash_sale = true;
    if (organic) where.is_organic = true;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Review, as: 'reviews', include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'name', 'profile_image'] }], limit: 10, order: [['createdAt', 'DESC']] },
        { model: Inventory, as: 'inventory' },
      ],
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// POST /api/products (Admin)
const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = buildSlug(data.name);
    if (req.files?.length) data.images = req.files.map(f => `/uploads/${f.filename}`);
    if (data.images?.[0]) data.thumbnail = data.images[0];

    const product = await Product.create(data);
    await Inventory.create({ product_id: product.id, quantity: data.stock_qty || 0 });

    return res.status(201).json({ success: true, message: 'Product created!', data: product });
  } catch (err) { next(err); }
};

// PUT /api/products/:id (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (req.files?.length) req.body.images = req.files.map(f => `/uploads/${f.filename}`);
    await product.update(req.body);
    if (req.body.stock_qty !== undefined) {
      await Inventory.update({ quantity: req.body.stock_qty }, { where: { product_id: product.id } });
    }
    return res.json({ success: true, message: 'Product updated!', data: product });
  } catch (err) { next(err); }
};

// DELETE /api/products/:id (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    await product.update({ is_active: false });
    return res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) { next(err); }
};

// GET /api/products/search/suggestions
const searchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });
    const products = await Product.findAll({
      where: { name: { [Op.like]: `%${q}%` }, is_active: true },
      attributes: ['id', 'name', 'thumbnail', 'price', 'category_id'],
      limit: 8,
    });
    return res.json({ success: true, data: products });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, searchSuggestions };
