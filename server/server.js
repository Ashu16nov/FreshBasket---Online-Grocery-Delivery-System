const app = require('./app');
const { connectDB } = require('./config/db');
require('./models/index'); // load all associations
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 FreshBasket Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Client: ${process.env.CLIENT_URL}\n`);
  });
};

start();
