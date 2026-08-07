# FreshBasket — Premium Full-Stack MERN + MySQL Grocery E-Commerce Platform

FreshBasket is an enterprise-grade, full-stack grocery e-commerce web application inspired by **Blinkit, Zepto, BigBasket, and Swiggy Instamart**. It features a ultra-clean, modern UI with dark mode support, glassmorphic elements, instant search, animated product cards, cart drawer, checkout stepper, real-time order tracking, PDF invoice generation, and an extensive Admin Dashboard.


### ------ Tech Stack -------

### Frontend ---------------------
- **Framework**: React.js 18 (Vite)
- **State Management**: Redux Toolkit + React Query (`@tanstack/react-query`)
- **Styling**: Tailwind CSS v3 + Custom Design Tokens (Poppins font, `#16A34A` Green theme)
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod
- **Icons & Alerts**: React Icons, SweetAlert2, React Hot Toast
- **Charts & PDF**: Recharts, jsPDF + html2canvas

### Backend & Database --------------------
- **Runtime**: Node.js & Express.js
- **Database**: MySQL (Relational Schema)
- **ORM**: Sequelize ORM
- **Authentication**: JWT (Access Token + Refresh Token via HTTP-only Cookies)
- **Security**: bcryptjs (Password Hashing), Helmet, CORS, Express Rate Limit, Parameterized SQL queries
- **File Uploads**: Multer (Local storage / Cloudinary ready)

### MySQL Database Schema (16 Tables) -------------------

1. `users` — Customer, Admin, and Delivery roles, loyalty points, wallet balance
2. `categories` — Grocery categories with custom icons, colors, and order
3. `products` — Products with pricing, discounts, ratings, tags, and stock
4. `inventory` — Real-time stock levels & low stock alerts
5. `addresses` — Multi-address support (Home, Work, Other)
6. `carts` & `cart_items` — Persistent shopping cart & item quantities
7. `coupons` — Flat & percentage discount coupons with limits
8. `orders` & `order_items` — Orders with status lifecycle
9. `payments` — Simulated payment methods (COD, UPI, Card, NetBanking)
10. `deliveries` — Delivery agent assignment & step-by-step timeline
11. `reviews` — Product reviews & rating recalculations
12. `wishlists` — Customer saved items
13. `notifications` — Order & promotion alerts
14. `invoices` — Tax invoices with GST numbers

### --------Getting Started-----------

### 1. Database Setup -------------------
Create a MySQL database named `freshmart_db`:
```sql
CREATE DATABASE freshmart_db;
```

### 2. Backend Setup ---------------------
```bash
cd server
npm install

# Configure environment variables in .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=freshmart_db

# Seed database with sample categories, products, coupons & admin/customer accounts
npm run seed

# Start backend server
npm run dev
```

Server runs at `http://localhost:5000`.

### 3. Frontend Setup ---------------------
```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`.

---

### Demo Credentials -----------------------

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@freshbasket.com` | `admin123` |
| **Customer** | `customer@freshbasket.com` | `customer123` |

---

## Features Highlights ----------------------

- ⚡ **10-Minute Delivery UI**: Blazing fast instant search & location selector
- 🛒 **Interactive Cart Drawer**: Real-time total calculation & coupon application
- 💳 **Payment Simulation**: COD, UPI, Credit/Debit cards & Net Banking
- 📍 **Live Delivery Tracking**: Interactive timeline from order placed to delivered
- 📄 **PDF Invoice Generation**: Download professional tax invoices directly in browser
- 📊 **Admin Dashboard**: Real-time sales charts, stock alerts, order status management & product CRUD
- 🌙 **Dark Mode**: Seamless light/dark mode toggling across all pages
