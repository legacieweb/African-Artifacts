# 🎉 Backend Setup Guide

## Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation [Download](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas (Cloud) [Free account](https://www.mongodb.com/cloud/atlas)

---

## 📦 Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then edit `.env` with your settings:
```
MONGODB_URI=mongodb://localhost:27017/african-artifacts
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here_min_32_chars
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
**On Windows:**
```bash
# If installed locally
mongod
```

**Using MongoDB Atlas (Cloud):**
- Create free account at mongodb.com/atlas
- Get connection string and paste in `.env` as MONGODB_URI

### 4. Start Backend Server
```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

✅ You should see:
```
✅ MongoDB Connected
🎉 Server running on http://localhost:5000
📝 API Health Check: http://localhost:5000/api/health
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)
- `PUT /api/auth/profile` - Update profile (requires token)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `POST /api/cart/validate` - Validate cart items
- `POST /api/cart/shipping` - Calculate shipping

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders (requires token)
- `GET /api/orders/:id` - Get order details (requires token)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order (requires token)

### Payment
- `POST /api/payment/create-payment-intent` - Create Stripe payment
- `POST /api/payment/confirm-payment` - Confirm payment

---

## 🧪 Test Backend

### Test Health Check
```
GET http://localhost:5000/api/health
```

### Test Register
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Test Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Tools to test APIs:**
- Postman - https://www.postman.com/downloads/
- Insomnia - https://insomnia.rest/download
- VS Code Thunder Client extension

---

## 🔗 Connect Frontend to Backend

Update your `index.html` JavaScript to use the backend API:

```javascript
// Example API call
const API_URL = 'http://localhost:5000/api';

// Login
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  return data;
}

// Get Products
async function getProducts(category) {
  const response = await fetch(`${API_URL}/products?category=${category}`);
  return await response.json();
}

// Create Order
async function createOrder(items, shippingAddress, totalPrice) {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items, shippingAddress, totalPrice })
  });
  return await response.json();
}
```

---

## 📝 Sample Data (Seed Products)

Create `backend/seed.js`:
```javascript
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/african-artifacts');

const products = [
  {
    name: "Authentic Kente Shirt",
    category: "shirts",
    price: 45,
    description: "Traditional Kente shirt made with authentic African fabric",
    image: "Kente hoodie African Dashiki Ankara shirt Rasta….jpg",
    stock: 10
  },
  {
    name: "African Print T-Shirt",
    category: "tshirts",
    price: 25,
    description: "Comfortable 100% cotton African print t-shirt",
    image: "Bulldog Gym Training Top Bodybuilding Mens T-Shirt….jpg",
    stock: 15
  }
];

Product.insertMany(products).then(() => {
  console.log('✅ Products added!');
  mongoose.connection.close();
});
```

Run: `node seed.js`

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "MongoDB Connection Error" | Make sure MongoDB is running, or check MONGODB_URI in .env |
| "Cannot find module 'express'" | Run `npm install` in backend folder |
| "Port 5000 already in use" | Change PORT in .env or kill process using port |
| "CORS error in browser" | Make sure FRONTEND_URL is set in .env |
| "Stripe errors" | Get test keys from stripe.com and add to .env |

---

## 🚀 Next Steps

1. ✅ Backend running
2. 📝 Update frontend to use API endpoints
3. 🛒 Create user authentication UI
4. 💳 Add Stripe payment
5. 🎨 Create admin dashboard for product management
6. 📦 Deploy to Heroku, Railway, or AWS

---

## 📚 Useful Resources

- Express Documentation: https://expressjs.com/
- MongoDB Mongoose: https://mongoosejs.com/
- Stripe API: https://stripe.com/docs/api
- Node.js Guide: https://nodejs.org/en/docs/