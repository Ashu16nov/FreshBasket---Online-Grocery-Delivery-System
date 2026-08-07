# FreshBasket - System Diagrams (DFD & ER Diagram)

This document presents the complete **Data Flow Diagrams (DFD)** and **Entity-Relationship (ER) Diagram** for **FreshBasket - Online Grocery Delivery System**.

## 1. Entity-Relationship (ER) Diagram --------------------------------------------------------------------------------------------------------------------------
The ER diagram illustrates the database design and logical relationships between entities in the MySQL database schema.

```mermaid
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
        enum role "customer | admin"
        string profile_image
        string city
        string state
        string pincode
        boolean is_active
        datetime created_at
    }

    CATEGORY {
        int id PK
        string name
        string slug
        string icon
        string image
        string color
        boolean is_active
    }

    PRODUCT {
        int id PK
        int category_id FK
        string name
        string slug
        string brand
        string weight
        string unit
        decimal price
        decimal old_price
        int discount_pct
        int stock_qty
        string thumbnail
        text description
        decimal rating_avg
        int rating_count
        boolean is_featured
        boolean is_flash_sale
        boolean is_organic
        boolean is_active
    }

    ADDRESS {
        int id PK
        int user_id FK
        string label
        string street
        string area
        string city
        string state
        string pincode
        boolean is_default
    }

    CART {
        int id PK
        int user_id FK
        int coupon_id FK
        decimal total_price
        decimal discount_amount
        decimal final_price
    }

    CART_ITEM {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }

    ORDER {
        int id PK
        string order_number UK
        int user_id FK
        int address_id FK
        int coupon_id FK
        decimal subtotal
        decimal delivery_fee
        decimal discount_amount
        decimal tax_amount
        decimal total_amount
        enum status "pending|processing|shipped|out_for_delivery|delivered|cancelled"
        enum payment_status "pending|paid|failed|refunded"
        enum payment_method "cod|online|wallet"
        datetime created_at
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        string product_name
        int quantity
        decimal unit_price
        decimal total_price
    }

    PAYMENT {
        int id PK
        int order_id FK
        string transaction_id
        enum provider "razorpay|stripe|cod"
        decimal amount
        enum status "pending|success|failed|refunded"
    }

    DELIVERY {
        int id PK
        int order_id FK
        string agent_name
        string agent_phone
        enum status "assigned|picked_up|on_the_way|delivered"
        datetime estimated_delivery_time
    }

    COUPON {
        int id PK
        string code UK
        string description
        enum discount_type "percentage|flat"
        decimal discount_value
        decimal min_order
        decimal max_discount
        boolean is_active
    }

    INVENTORY {
        int id PK
        int product_id FK
        int quantity
        int low_stock_threshold
        datetime last_restocked
    }

    INVOICE {
        int id PK
        int order_id FK
        string invoice_number UK
        decimal gst_amount
        decimal grand_total
        datetime pdf_generated_at
    }
```

---

## 2. Data Flow Diagram (DFD) -----------------------------------------------------------------------------------------------------------------------------------
Data Flow Diagrams visualize how information flows through the system, identifying external entities, main processes, data stores, and data movements.

---

### 2.1 DFD Level 0 (Context Diagram) ----------------------------------------------------------------------------------------------------------------------------
The Level 0 Context Diagram represents the overall FreshBasket system boundary and its interactions with external entities.

```mermaid
graph TD
    %% External Entities
    CUSTOMER["Customer"]
    ADMIN["System Admin"]
    PAYMENT_GW["Payment Gateway (Razorpay/Stripe)"]
    DELIVERY_PARTNER["Delivery Partner App"]

    %% Central Process
    SYSTEM(("0.0 FreshBasket Online Grocery Delivery System"))

    %% Customer Data Flows
    CUSTOMER -->|"Browse Requests, Search Query, Cart Actions, Checkout Info"| SYSTEM
    SYSTEM -->|"Product Catalog, Order Confirmation, Real-Time Tracking, Invoices"| CUSTOMER

    %% Admin Data Flows
    ADMIN -->|"Product Uploads, Inventory Updates, Category Config, Order Status Overrides"| SYSTEM
    SYSTEM -->|"Sales Reports, Order Alerts, Low Stock Alerts, User Analytics"| ADMIN

    %% Payment Gateway Data Flows
    SYSTEM -->|"Payment Request (Amount, Order ID)"| PAYMENT_GW
    PAYMENT_GW -->|"Payment Verification / Webhook Status"| SYSTEM

    %% Delivery Partner Data Flows
    SYSTEM -->|"Dispatch Details, Delivery Address & Customer Contact"| DELIVERY_PARTNER
    DELIVERY_PARTNER -->|"Live GPS Location & Status Updates (Picked/Delivered)"| SYSTEM
```

---

### 2.2 DFD Level 1 (Major System Processes) ------------------------------------------------------------------------------------------------------------
The Level 1 DFD decomposes the system into major operational modules and identifies data stores (D1–D6).

```mermaid
graph TD
    %% External Entities
    C["Customer"]
    A["Admin"]
    P_GW["Payment Gateway"]

    %% Data Stores
    subgraph Data Stores
        D1[("D1: Users & Addresses")]
        D2[("D2: Products & Categories")]
        D3[("D3: Active Carts")]
        D4[("D4: Orders & Items")]
        D5[("D5: Inventory")]
        D6[("D6: Payments & Invoices")]
    end

    %% Processes
    P1(("1.0 User Auth & Profile"))
    P2(("2.0 Catalog & Search"))
    P3(("3.0 Cart & Coupons"))
    P4(("4.0 Order Processing"))
    P5(("5.0 Payment Handling"))
    P6(("6.0 Delivery & Inventory"))

    %% Data Flows - Process 1
    C -->|"Signup / Login Credentials"| P1
    P1 -->|"JWT Token, Profile Data"| C
    P1 <-->|"User Credentials & Address Records"| D1

    %% Data Flows - Process 2
    C -->|"Category Filter, Search Query"| P2
    P2 -->|"Filtered Products List"| C
    P2 <-->|"Fetch Products & Categories"| D2
    A -->|"Add / Edit Products & Categories"| P2

    %% Data Flows - Process 3
    C -->|"Add to Cart, Apply Coupon"| P3
    P3 -->|"Cart Summary, Discount calculation"| C
    P3 <-->|"Read / Write Cart Items"| D3
    P3 <-->|"Verify Stock"| D5

    %% Data Flows - Process 4
    C -->|"Place Order (Address & Payment Choice)"| P4
    P4 <-->|"Read Cart Data"| D3
    P4 -->|"Create Order Record"| D4
    P4 -->|"Order Details"| P5

    %% Data Flows - Process 5
    P5 -->|"Transaction Request"| P_GW
    P_GW -->|"Payment Confirmation"| P5
    P5 -->|"Update Payment Status"| D6
    P5 -->|"Update Order Status to Paid"| D4

    %% Data Flows - Process 6
    P5 -->|"Trigger Dispatch"| P6
    P6 -->|"Deduct Stock"| D5
    P6 -->|"Update Delivery Status"| D4
    P6 -->|"Dispatch & Live Tracking Data"| C
    A -->|"Manage Order Status"| P6
```

---

### 2.3 DFD Level 2 (Detailed Checkout & Order Processing Subsystem) -------------------------------
The Level 2 DFD zooms into the core **Checkout & Order Processing** sub-process (Process 4.0).

```mermaid
graph TD
    CUSTOMER["Customer"]
    
    subgraph "Process 4.0: Order Processing & Checkout Subsystem"
        P4_1(("4.1 Validate Address & Cart"))
        P4_2(("4.2 Calculate Tax & Shipping"))
        P4_3(("4.3 Reserve Inventory"))
        P4_4(("4.4 Generate Order & Invoice"))
    end

    %% Data Stores
    D1[("D1: Addresses")]
    D3[("D3: Cart")]
    D4[("D4: Orders")]
    D5[("D5: Inventory")]
    D6[("D6: Invoices")]

    CUSTOMER -->|"Initiate Checkout"| P4_1
    D3 -->|"Fetch Cart Items"| P4_1
    D1 -->|"Fetch Delivery Address"| P4_1
    
    P4_1 -->|"Validated Items"| P4_2
    P4_2 -->|"Final Order Amount"| P4_3
    
    P4_3 <-->|"Reserve Stock Quantity"| D5
    P4_3 -->|"Stock Reserved"| P4_4
    
    P4_4 -->|"Save Order Record"| D4
    P4_4 -->|"Generate PDF Invoice"| D6
    P4_4 -->|"Order Confirmation Summary"| CUSTOMER
```

---

## 3. Summary of Key Entities & Data Flows -----------------------------------

| Component | Type | Primary Role |
| :--- | :--- | :--- |
| **USER** | Entity / Store | Manages customer profiles, delivery addresses, and admin credentials |
| **PRODUCT & CATEGORY** | Entity / Store | Stores catalog items, images, prices, brands, and category taxonomy |
| **CART & CART_ITEM** | Entity / Store | Manages real-time shopping baskets, active items, and applied discounts |
| **ORDER & ORDER_ITEM** | Entity / Store | Captures purchase history, order statuses, item snapshots, and totals |
| **PAYMENT & INVOICE** | Entity / Store | Tracks financial transactions, payment provider webhooks, and GST invoices |
| **INVENTORY** | Entity / Store | Controls real-time stock levels and low-stock alerts for automatic reordering |
