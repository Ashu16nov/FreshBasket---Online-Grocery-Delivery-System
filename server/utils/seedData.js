require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectDB } = require('../config/db');
require('../models/index');
const { User, Category, Product, Inventory, Coupon } = require('../models');
const bcrypt = require('bcryptjs');

const categories = [
  { name: 'Fruits', slug: 'fruits', icon: '🍎', color: '#EF4444', description: 'Fresh seasonal fruits', sort_order: 1 },
  { name: 'Vegetables', slug: 'vegetables', icon: '🥦', color: '#16A34A', description: 'Farm fresh vegetables', sort_order: 2 },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', color: '#3B82F6', description: 'Fresh dairy products and eggs', sort_order: 3 },
  { name: 'Bakery', slug: 'bakery', icon: '🍞', color: '#F59E0B', description: 'Fresh baked goods daily', sort_order: 4 },
  { name: 'Snacks', slug: 'snacks', icon: '🍪', color: '#8B5CF6', description: 'Chips, cookies, namkeen and more', sort_order: 5 },
  { name: 'Beverages', slug: 'beverages', icon: '🥤', color: '#06B6D4', description: 'Juices, sodas, water and drinks', sort_order: 6 },
  { name: 'Grocery', slug: 'grocery', icon: '🍚', color: '#F97316', description: 'Rice, dal, flour and staples', sort_order: 7 },
  { name: 'Household', slug: 'household', icon: '🧴', color: '#EC4899', description: 'Cleaning and household items', sort_order: 8 },
  { name: 'Meat & Poultry', slug: 'meat-poultry', icon: '🥩', color: '#DC2626', description: 'Fresh chicken, mutton and more', sort_order: 9 },
  { name: 'Seafood', slug: 'seafood', icon: '🐟', color: '#0EA5E9', description: 'Fresh fish and seafood', sort_order: 10 },
  { name: 'Organic', slug: 'organic', icon: '🌿', color: '#059669', description: 'Certified organic products', sort_order: 11 },
  { name: 'Frozen Foods', slug: 'frozen-foods', icon: '🧊', color: '#6366F1', description: 'Frozen meals and ingredients', sort_order: 12 },
];

const productImages = {
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
  bakery: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
  snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  grocery: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  household: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
  meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
  seafood: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400',
};

const buildSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 9999);

const createProducts = (categories) => {
  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });

  return [
    // Fruits
    { category_id: catMap['fruits'], name: 'Fresh Red Apples', brand: 'FarmFresh', weight: '1 kg', unit: 'kg', price: 149, old_price: 179, discount_pct: 17, stock_qty: 100, thumbnail: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'], description: 'Sweet and crispy red apples', rating_avg: 4.5, rating_count: 124, is_featured: true },
    { category_id: catMap['fruits'], name: 'Bananas (Dozen)', brand: 'Green Farm', weight: '1 dozen', unit: 'dozen', price: 49, old_price: 65, discount_pct: 25, stock_qty: 200, thumbnail: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], description: 'Fresh ripe bananas', rating_avg: 4.3, rating_count: 89 },
    { category_id: catMap['fruits'], name: 'Alphonso Mangoes', brand: 'Ratnagiri', weight: '1 kg', unit: 'kg', price: 349, old_price: 399, discount_pct: 13, stock_qty: 50, thumbnail: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'], description: 'Premium Ratnagiri Alphonso mangoes', rating_avg: 4.8, rating_count: 256, is_featured: true, is_flash_sale: true },
    { category_id: catMap['fruits'], name: 'Watermelon', brand: 'FarmFresh', weight: '2-3 kg', unit: 'piece', price: 99, old_price: 129, discount_pct: 23, stock_qty: 80, thumbnail: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400', images: ['https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400'], description: 'Juicy and sweet watermelon', rating_avg: 4.4, rating_count: 67 },
    { category_id: catMap['fruits'], name: 'Strawberries', brand: 'Berry Fresh', weight: '250 g', unit: 'pack', price: 129, old_price: 159, discount_pct: 19, stock_qty: 60, thumbnail: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'], description: 'Fresh Mahabaleshwar strawberries', rating_avg: 4.6, rating_count: 98, is_flash_sale: true },
    { category_id: catMap['fruits'], name: 'Pomegranate', brand: 'FarmFresh', weight: '1 kg', unit: 'kg', price: 189, old_price: 220, discount_pct: 14, stock_qty: 75, thumbnail: 'https://images.unsplash.com/photo-1615485291243-6f49e4a9b19c?w=400', images: ['https://images.unsplash.com/photo-1615485291243-6f49e4a9b19c?w=400'], description: 'Ruby red pomegranates, rich in antioxidants', rating_avg: 4.7, rating_count: 112 },
    // Vegetables
    { category_id: catMap['vegetables'], name: 'Fresh Tomatoes', brand: 'Green Farm', weight: '500 g', unit: 'g', price: 39, old_price: 59, discount_pct: 34, stock_qty: 150, thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'], description: 'Fresh red tomatoes', rating_avg: 4.2, rating_count: 78 },
    { category_id: catMap['vegetables'], name: 'Broccoli', brand: 'Organic Farm', weight: '500 g', unit: 'g', price: 79, old_price: 99, discount_pct: 20, stock_qty: 90, thumbnail: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400', images: ['https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400'], description: 'Fresh green broccoli', rating_avg: 4.5, rating_count: 54, is_organic: true },
    { category_id: catMap['vegetables'], name: 'Onions', brand: 'FarmFresh', weight: '1 kg', unit: 'kg', price: 29, old_price: 45, discount_pct: 36, stock_qty: 300, thumbnail: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', images: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400'], description: 'Fresh red onions', rating_avg: 4.0, rating_count: 145 },
    { category_id: catMap['vegetables'], name: 'Spinach Bunch', brand: 'Organic Farm', weight: '250 g', unit: 'bunch', price: 25, old_price: 35, discount_pct: 29, stock_qty: 120, thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'], description: 'Fresh baby spinach leaves', rating_avg: 4.4, rating_count: 67, is_organic: true, is_featured: true },
    { category_id: catMap['vegetables'], name: 'Bell Peppers (3 pcs)', brand: 'Green Farm', weight: '3 pieces', unit: 'pack', price: 89, old_price: 119, discount_pct: 25, stock_qty: 85, thumbnail: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', images: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'], description: 'Assorted red, yellow & green bell peppers', rating_avg: 4.6, rating_count: 43 },
    // Dairy
    { category_id: catMap['dairy-eggs'], name: 'Amul Full Cream Milk', brand: 'Amul', weight: '1 L', unit: 'L', price: 68, old_price: 72, discount_pct: 6, stock_qty: 200, thumbnail: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'], description: 'Fresh full cream milk', rating_avg: 4.6, rating_count: 312, is_featured: true },
    { category_id: catMap['dairy-eggs'], name: 'Farm Eggs (12 pcs)', brand: 'Country Eggs', weight: '12 pcs', unit: 'pack', price: 89, old_price: 105, discount_pct: 15, stock_qty: 150, thumbnail: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'], description: 'Farm fresh eggs', rating_avg: 4.5, rating_count: 189 },
    { category_id: catMap['dairy-eggs'], name: 'Greek Yogurt', brand: 'Epigamia', weight: '400 g', unit: 'g', price: 149, old_price: 175, discount_pct: 15, stock_qty: 80, thumbnail: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'], description: 'Creamy Greek yogurt, high in protein', rating_avg: 4.7, rating_count: 98, is_flash_sale: true },
    { category_id: catMap['dairy-eggs'], name: 'Amul Butter', brand: 'Amul', weight: '500 g', unit: 'g', price: 259, old_price: 275, discount_pct: 6, stock_qty: 120, thumbnail: 'https://images.unsplash.com/photo-1589985270958-bf087b6462f4?w=400', images: ['https://images.unsplash.com/photo-1589985270958-bf087b6462f4?w=400'], description: 'Salted table butter', rating_avg: 4.8, rating_count: 234 },
    // Bakery
    { category_id: catMap['bakery'], name: 'Whole Wheat Bread', brand: 'Britannia', weight: '400 g', unit: 'loaf', price: 45, old_price: 52, discount_pct: 13, stock_qty: 100, thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'], description: 'Soft whole wheat bread loaf', rating_avg: 4.3, rating_count: 145 },
    { category_id: catMap['bakery'], name: 'Croissants (4 pcs)', brand: 'French Bakery', weight: '200 g', unit: 'pack', price: 149, old_price: 180, discount_pct: 17, stock_qty: 60, thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'], description: 'Buttery flaky croissants', rating_avg: 4.6, rating_count: 67, is_featured: true },
    // Snacks
    { category_id: catMap['snacks'], name: "Lay's Classic Chips", brand: "Lay's", weight: '130 g', unit: 'pack', price: 30, old_price: 35, discount_pct: 14, stock_qty: 250, thumbnail: 'https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?w=400', images: ['https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?w=400'], description: 'Classic salted potato chips', rating_avg: 4.4, rating_count: 456, is_flash_sale: true },
    { category_id: catMap['snacks'], name: 'Oreo Cookies', brand: 'Oreo', weight: '300 g', unit: 'pack', price: 99, old_price: 120, discount_pct: 18, stock_qty: 200, thumbnail: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'], description: 'America\'s favorite cookie', rating_avg: 4.7, rating_count: 389 },
    { category_id: catMap['snacks'], name: 'Haldirams Bhujia', brand: 'Haldirams', weight: '400 g', unit: 'pack', price: 129, old_price: 150, discount_pct: 14, stock_qty: 180, thumbnail: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'], description: 'Crispy moong dal bhujia', rating_avg: 4.6, rating_count: 211 },
    // Beverages
    { category_id: catMap['beverages'], name: 'Tropicana Orange Juice', brand: 'Tropicana', weight: '1 L', unit: 'L', price: 115, old_price: 135, discount_pct: 15, stock_qty: 130, thumbnail: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'], description: '100% pure orange juice', rating_avg: 4.5, rating_count: 178, is_featured: true },
    { category_id: catMap['beverages'], name: 'Coca-Cola 2L', brand: 'Coca-Cola', weight: '2 L', unit: 'bottle', price: 99, old_price: 115, discount_pct: 14, stock_qty: 200, thumbnail: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'], description: 'Refreshing Coca-Cola', rating_avg: 4.3, rating_count: 289 },
    { category_id: catMap['beverages'], name: 'Green Tea (25 bags)', brand: 'Tetley', weight: '25 bags', unit: 'box', price: 129, old_price: 155, discount_pct: 17, stock_qty: 160, thumbnail: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'], description: 'Premium green tea bags', rating_avg: 4.4, rating_count: 134, is_organic: true },
    // Grocery
    { category_id: catMap['grocery'], name: 'Basmati Rice (5 kg)', brand: 'India Gate', weight: '5 kg', unit: 'kg', price: 599, old_price: 699, discount_pct: 14, stock_qty: 120, thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'], description: 'Premium aged Basmati rice', rating_avg: 4.7, rating_count: 345, is_featured: true },
    { category_id: catMap['grocery'], name: 'Toor Dal (1 kg)', brand: 'Tata Sampann', weight: '1 kg', unit: 'kg', price: 149, old_price: 175, discount_pct: 15, stock_qty: 200, thumbnail: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400', images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400'], description: 'Premium toor (arhar) dal', rating_avg: 4.5, rating_count: 189 },
    { category_id: catMap['grocery'], name: 'Aashirvaad Atta (10 kg)', brand: 'Aashirvaad', weight: '10 kg', unit: 'kg', price: 449, old_price: 525, discount_pct: 14, stock_qty: 90, thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'], description: 'Whole wheat atta', rating_avg: 4.6, rating_count: 278 },
    // Household
    { category_id: catMap['household'], name: 'Surf Excel Matic (2 kg)', brand: 'Surf Excel', weight: '2 kg', unit: 'kg', price: 399, old_price: 460, discount_pct: 13, stock_qty: 100, thumbnail: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'], description: 'Liquid detergent for front load', rating_avg: 4.5, rating_count: 234 },
    { category_id: catMap['household'], name: 'Dettol Hand Wash', brand: 'Dettol', weight: '500 ml', unit: 'ml', price: 149, old_price: 175, discount_pct: 15, stock_qty: 180, thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'], description: 'Antibacterial hand wash', rating_avg: 4.7, rating_count: 312, is_featured: true },
  ];
};

const coupons = [
  { code: 'FRESH10', description: '10% off on first order', discount_type: 'percentage', discount_value: 10, min_order: 200, max_discount: 100, max_uses: 1000 },
  { code: 'SAVE50', description: '₹50 off on orders above ₹499', discount_type: 'flat', discount_value: 50, min_order: 499, max_uses: 500 },
  { code: 'WELCOME20', description: '20% off for new users', discount_type: 'percentage', discount_value: 20, min_order: 300, max_discount: 200, max_uses: 200 },
  { code: 'FREEDEL', description: 'Free delivery on any order', discount_type: 'flat', discount_value: 40, min_order: 0, max_uses: null },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...');

    // Clear existing data
    await Inventory.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Coupon.destroy({ where: {} });

    // Seed categories
    const createdCats = await Category.bulkCreate(categories);
    console.log(`✅ ${createdCats.length} categories seeded`);

    // Seed products
    const productsData = createProducts(createdCats).map(p => ({ ...p, slug: buildSlug(p.name) }));
    const createdProds = await Product.bulkCreate(productsData, { returning: true });
    await Inventory.bulkCreate(createdProds.map(p => ({ product_id: p.id, quantity: p.stock_qty, low_stock_threshold: 10 })));
    console.log(`✅ ${createdProds.length} products seeded`);

    // Seed users
    const adminHash = await bcrypt.hash('admin123', 12);
    const customerHash = await bcrypt.hash('customer123', 12);
    await User.bulkCreate([
      { name: 'Admin User', email: 'admin@freshbasket.com', phone: '9876543210', password_hash: adminHash, role: 'admin', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_active: true },
      { name: 'Rahul Sharma', email: 'customer@freshbasket.com', phone: '9123456789', password_hash: customerHash, role: 'customer', city: 'Pune', state: 'Maharashtra', pincode: '411001', is_active: true },
    ], { hooks: false });
    console.log('✅ 2 demo users seeded (admin@freshbasket.com / admin123, customer@freshbasket.com / customer123)');

    // Seed coupons
    await Coupon.bulkCreate(coupons);
    console.log(`✅ ${coupons.length} coupons seeded`);

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
