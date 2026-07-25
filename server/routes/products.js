const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, searchSuggestions } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/search/suggestions', searchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, isAdmin, upload.array('images', 8), createProduct);
router.put('/:id', protect, isAdmin, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
