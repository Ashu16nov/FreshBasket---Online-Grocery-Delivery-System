import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mermaid from 'mermaid';
import { FiDatabase, FiGitCommit, FiLayers, FiLayers as FiProcess, FiInfo } from 'react-icons/fi';

const erDiagramCode = `
erDiagram
    USER ||--o{ ADDRESS : "has saved"
    USER ||--o| CART : "owns active"
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ WISHLIST : "saves items to"
    USER ||--o{ NOTIFICATION : "receives"

    CATEGORY ||--o{ PRODUCT : "contains"
    PRODUCT ||--o| INVENTORY : "tracks stock in"
    PRODUCT ||--o{ REVIEW : "receives"
    PRODUCT ||--o{ CART_ITEM : "added as"
    PRODUCT ||--o{ ORDER_ITEM : "purchased as"
    PRODUCT ||--o{ WISHLIST : "bookmarked in"

    CART ||--o{ CART_ITEM : "contains"
    CART }o--o| COUPON : "applies"

    ORDER ||--o{ ORDER_ITEM : "consists of"
    ORDER }o--o| ADDRESS : "delivers to"
    ORDER }o--o| COUPON : "uses discount"
    ORDER ||--o| PAYMENT : "processed via"
    ORDER ||--o| DELIVERY : "assigned to"
    ORDER ||--o| INVOICE : "generates"

    USER {
        int id PK
        string name
        string email
        string phone
        string password_hash
        string role
    }
    CATEGORY {
        int id PK
        string name
        string slug
    }
    PRODUCT {
        int id PK
        int category_id FK
        string name
        decimal price
        int stock_qty
    }
    CART {
        int id PK
        int user_id FK
        decimal total_price
    }
    ORDER {
        int id PK
        string order_number UK
        int user_id FK
        decimal total_amount
        string status
    }
    PAYMENT {
        int id PK
        int order_id FK
        string transaction_id
        string status
    }
    DELIVERY {
        int id PK
        int order_id FK
        string agent_name
        string status
    }
`;

const dfdLevel0Code = `
graph TD
    CUSTOMER["👤 Customer"]
    ADMIN["👨‍💼 System Admin"]
    PAYMENT_GW["💳 Payment Gateway (Razorpay/Stripe)"]
    DELIVERY_PARTNER["🛵 Delivery Partner"]

    SYSTEM(("⚡ 0.0 FreshBasket Online Grocery System"))

    CUSTOMER -->|"Browse, Cart & Checkout"| SYSTEM
    SYSTEM -->|"Catalog, Order Updates & Invoices"| CUSTOMER

    ADMIN -->|"Product & Category Config"| SYSTEM
    SYSTEM -->|"Sales & Inventory Reports"| ADMIN

    SYSTEM -->|"Payment Request"| PAYMENT_GW
    PAYMENT_GW -->|"Payment Webhook / Verification"| SYSTEM

    SYSTEM -->|"Order Dispatch Details"| DELIVERY_PARTNER
    DELIVERY_PARTNER -->|"Live GPS & Delivery Status"| SYSTEM
`;

const dfdLevel1Code = `
graph TD
    C["👤 Customer"]
    A["👨‍💼 Admin"]
    P_GW["💳 Payment Gateway"]

    subgraph Data_Stores["📁 Database Data Stores"]
        D1[("D1: Users & Addresses")]
        D2[("D2: Products & Categories")]
        D3[("D3: Active Carts")]
        D4[("D4: Orders & Items")]
        D5[("D5: Inventory")]
        D6[("D6: Payments & Invoices")]
    end

    P1(("1.0 User Auth & Profile"))
    P2(("2.0 Catalog & Search"))
    P3(("3.0 Cart & Discounts"))
    P4(("4.0 Order Processing"))
    P5(("5.0 Payment Gateway"))
    P6(("6.0 Delivery Management"))

    C -->|"Credentials"| P1
    P1 <--> D1
    P1 -->|"Auth Token"| C

    C -->|"Category / Search Query"| P2
    P2 <--> D2
    P2 -->|"Products List"| C
    A -->|"Product Management"| P2

    C -->|"Add to Cart / Coupon"| P3
    P3 <--> D3
    P3 <--> D5

    C -->|"Place Order"| P4
    P4 <--> D3
    P4 --> D4
    P4 --> P5

    P5 <--> P_GW
    P5 --> D6
    P5 --> D4

    P5 --> P6
    P6 --> D5
    P6 --> D4
    P6 -->|"Delivery Tracking"| C
`;

const dfdLevel2Code = `
graph TD
    CUSTOMER["👤 Customer"]

    subgraph Checkout_Subsystem["🛒 Process 4.0: Checkout & Order Subsystem"]
        P4_1(("4.1 Validate Address & Cart"))
        P4_2(("4.2 Calculate Tax & Shipping"))
        P4_3(("4.3 Reserve Inventory Stock"))
        P4_4(("4.4 Generate Order & Invoice"))
    end

    D1[("D1: Saved Addresses")]
    D3[("D3: Shopping Cart")]
    D4[("D4: Orders Database")]
    D5[("D5: Inventory Stock")]
    D6[("D6: Tax Invoices")]

    CUSTOMER -->|"Click Checkout"| P4_1
    D3 -->|"Fetch Items"| P4_1
    D1 -->|"Fetch Address"| P4_1

    P4_1 -->|"Cart Validated"| P4_2
    P4_2 -->|"Total Amount"| P4_3

    P4_3 <-->|"Reserve Stock Qty"| D5
    P4_3 -->|"Stock Reserved"| P4_4

    P4_4 -->|"Write Order"| D4
    P4_4 -->|"Write PDF Invoice"| D6
    P4_4 -->|"Order Summary & Invoice"| CUSTOMER
`;

const DiagramRenderer = ({ code, id }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'forest',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      mermaid.render(`mermaid-${id}-${Date.now()}`, code).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }).catch((err) => {
        console.error('Mermaid render error:', err);
      });
    }
  }, [code, id]);

  return (
    <div className="w-full overflow-x-auto p-6 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-center min-h-[450px]">
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
};

export default function SystemDiagrams() {
  const [activeTab, setActiveTab] = useState('er');

  const tabs = [
    { id: 'er', label: 'ER Diagram', icon: FiDatabase, desc: 'Entity-Relationship Database Schema' },
    { id: 'dfd0', label: 'DFD Level 0', icon: FiGitCommit, desc: 'High-Level Context Diagram' },
    { id: 'dfd1', label: 'DFD Level 1', icon: FiLayers, desc: 'Major System Subsystems & Data Stores' },
    { id: 'dfd2', label: 'DFD Level 2', icon: FiProcess, desc: 'Detailed Checkout & Order Subsystem' },
  ];

  return (
    <div className="section-container py-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="bg-primary-100 text-primary dark:bg-primary-900/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
          Architecture & Design
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
          System Diagrams & Data Flow
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Interactive Entity-Relationship (ER) and Data Flow Diagrams (DFD) for FreshBasket Online Grocery Delivery System.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                isActive
                  ? 'bg-primary text-white shadow-primary-500/20 shadow-lg scale-105'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Diagram Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {activeTab === 'er' && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <FiInfo size={16} className="text-primary" />
              <span>Database schema detailing entities, primary keys (PK), foreign keys (FK), and 1:N / 1:1 relationships.</span>
            </div>
            <DiagramRenderer code={erDiagramCode} id="er" />
          </div>
        )}

        {activeTab === 'dfd0' && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <FiInfo size={16} className="text-primary" />
              <span>Context Diagram representing system boundaries with Customer, Admin, Payment Gateway & Delivery Partner.</span>
            </div>
            <DiagramRenderer code={dfdLevel0Code} id="dfd0" />
          </div>
        )}

        {activeTab === 'dfd1' && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <FiInfo size={16} className="text-primary" />
              <span>Level 1 DFD illustrating interactions between 6 core processes and database stores D1-D6.</span>
            </div>
            <DiagramRenderer code={dfdLevel1Code} id="dfd1" />
          </div>
        )}

        {activeTab === 'dfd2' && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <FiInfo size={16} className="text-primary" />
              <span>Level 2 DFD depicting the step-by-step logic inside Process 4.0 (Order Processing & Checkout).</span>
            </div>
            <DiagramRenderer code={dfdLevel2Code} id="dfd2" />
          </div>
        )}
      </motion.div>

      {/* Component Key Table */}
      <div className="mt-12 bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-100 dark:border-dark-border shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiLayers className="text-primary" /> System Module Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-primary mb-1">D1: Users & Addresses</h4>
            <p className="text-gray-600 dark:text-gray-400">Customer profiles, JWT tokens, saved delivery addresses and pincodes.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-primary mb-1">D2: Catalog & Categories</h4>
            <p className="text-gray-600 dark:text-gray-400">12 grocery categories, product images, pricing, ratings, and tags.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-primary mb-1">D3: Cart & Coupons</h4>
            <p className="text-gray-600 dark:text-gray-400">Real-time cart state, item quantities, and percentage/flat promo codes.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-primary mb-1">D4: Orders & Order Items</h4>
            <p className="text-gray-600 dark:text-gray-400">Order lifecycle statuses (Pending, Out for Delivery, Delivered) & order lines.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-primary mb-1">D5: Inventory Control</h4>
            <p className="text-gray-600 dark:text-gray-400">Real-time stock deduction, low stock alerts, and restocking logs.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
            <h4 className="font-bold text-primary mb-1">D6: Payments & Invoices</h4>
            <p className="text-gray-600 dark:text-gray-400">Razorpay/COD payment status records, GST calculation, and PDF invoices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
