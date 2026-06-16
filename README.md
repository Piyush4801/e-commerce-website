# SmartCart AI - Next-Generation AI-Powered Multi-Vendor E-Commerce Platform

SmartCart AI is a production-ready, startup-quality multi-vendor e-commerce platform designed to impress judges at national-level hackathons. It integrates conversational search parsing, real-time voice command routing, transaction fraud analysis, carbon emissions tracking, and gamified loyalty tier progression.

---

## 🚀 Key Features

1. **Dual-Mode DB Adapter (`dbService.js`)**:
   - Automatically detects if MongoDB is connected via `MONGO_URI`.
   - If not, falls back instantly to a local JSON file database, enabling zero-setup verification.
   - Automatically seeds the system with 100+ products, 20 customers, 10 sellers, and 55 orders on first start.

2. **Conversational & Voice Shopping Assistant**:
   - **Shop By Conversation**: Natural language interface to parse requests like *"Show me a coding laptop under ₹60,000"*.
   - **Voice Shopping**: Utilizes HTML5 Speech Recognition Web APIs to listen for voice commands (e.g. *"Show running shoes"*, *"Go to cart"*, *"Checkout"*).

3. **Safety Audit & Real-Time Fraud Detection**:
   - Audits transactions against high-value checks, order frequency velocity, and credit card gateway simulations.
   - Flags suspicious orders for admin review and locks them under review.

4. **Eco-Sustainability Carbon Badging**:
   - Graded supply-chain Eco Scores (A to E) per product.
   - Total estimated unit carbon footprints in kg CO₂ displayed during checkout.

5. **Gamified Loyalty Tier Progression**:
   - Progresses shoppers across tiers (Bronze 🥉 -> Silver 🥈 -> Gold 🥇 -> Platinum 👑) based on earned points.
   - Unlocks flat discounts and referral bonuses.

---

## 📁 Folder Structure

```text
e-commerce-website/
├── config/              (Database configurations)
├── controllers/         (Express controllers: Auth, Product, Order, Coupons, Analytics)
├── data/                (Seed data definition files)
├── middleware/          (Express middlewares: Auth, Logger, Upload)
├── models/              (Schema definition templates)
├── routes/              (API routes namespaces mapping)
├── services/            (Internal services: DB, NLP parser, Fraud auditor)
├── views/               (EJS/Template views placeholders)
├── public/              (React static production bundle)
│   ├── css/             (Production stylesheet assets)
│   ├── js/              (Production client code bundles)
│   └── images/          (Image and vector resources)
├── utils/               (Utility helpers)
├── seed/                (Database seeder configuration scripts)
├── frontend/            (React source files)
├── .env.example         (Environment variable guidelines)
├── package.json         (Unified package config)
├── README.md            (General documentation)
└── server.js            (Production Express startup entrypoint)
```

---

## ⚙️ Environment Variables

Copy the sample configurations and populate the active environment values:
```bash
cp .env.example .env
```

Available variables:
- `PORT`: Server port (default is `5001` to prevent clashes with macOS AirPlay).
- `JWT_SECRET`: Secret token signature key for authentication.
- `REFRESH_TOKEN_SECRET`: Secret token signature key for silent session refreshment.
- `MONGO_URI`: (Optional) Active MongoDB connection URI.

---

## 💿 Installation & Database Setup

1. Ensure **Node.js (v18+)** is installed.
2. Initialize and install dependencies (installs both backend and frontend automatically):
   ```bash
   npm install
   ```

### MongoDB Setup (Optional)
If you have MongoDB running locally, start the service:
```bash
# macOS (Homebrew)
brew services start mongodb-community
```
Update `MONGO_URI` inside `.env`. If not set, the app runs automatically in Local JSON File Database mode.

---

## 🕹️ Run Commands

### 1. Seed the Database
Run the seeder script to populate Admin, Seller, and sample products:
```bash
npm run seed
```

### 2. Launch Developer Live-Reload
Start backend server with local file watchers and frontend static proxy:
```bash
npm run dev
```

### 3. Build React Frontend (Production Build)
Compile frontend source files into the root `public/` folder:
```bash
npm run build-frontend
```

### 4. Start Production Server
Launch the Express application:
```bash
npm start
```

---

## 🔑 Preset Credentials

The seeding script creates the following pre-configured accounts:
- **System Administrator**:
  - Email: `admin@smartcart.com`
  - Password: `Admin@123`
- **Active Vendor/Seller**:
  - Email: `seller@smartcart.com`
  - Password: `Seller@123`
- **Customer**:
  - Email: `customer@smartcart.com`
  - Password: `Customer@123`

---

## 📸 Screenshots Section

*Add screens from dashboard panels:*
- Customer Shopping Hub
- Merchant Storefront Inventory Manager
- System Security Control Center
