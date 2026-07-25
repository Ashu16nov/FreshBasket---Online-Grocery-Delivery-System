const express = require('express');
const r = express.Router();
const multer = require('multer');
const path = require('path');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

r.get('/', getCategories);
r.post('/', protect, isAdmin, upload.single('image'), createCategory);
r.put('/:id', protect, isAdmin, upload.single('image'), updateCategory);
r.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = r;
