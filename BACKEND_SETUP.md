# 🎯 African Artifacts - Backend Connection Guide

## 📍 Quick Start

Your backend files are in: `c:\Users\HP\Desktop\trm store\backend\`

### Step 1: Install Node.js
Download from: https://nodejs.org/ (Use LTS version)

### Step 2: Install MongoDB
Option A - Local installation:
https://www.mongodb.com/try/download/community

Option B - Cloud (MongoDB Atlas - Recommended):
- Create free account: https://www.mongodb.com/cloud/atlas
- Get connection string and paste in `.env`

### Step 3: Setup Backend

```bash
# Navigate to backend folder
cd "c:\Users\HP\Desktop\trm store\backend"

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your settings
# (Open in VS Code and update MongoDB connection, etc.)
```

### Step 4: Start Backend

**Option A - Production:**
```bash
npm start
```

**Option B - Development (Auto-reload):**
```bash
npm run dev
```

✅ Should see:
```
✅ MongoDB Connected
🎉 Server running on http://localhost:5000
📝 API Health Check: http://localhost:5000/api/health
```

---

## 🌐 Test Backend is Working

Open in browser:
```
http://localhost:5000/api/health
```

Should show: `{ "status": "Backend is running! 🚀" }`

---

## 📝 Use API in Your Frontend

### Method 1: Simple - Use the API Wrapper

Add to your HTML `<head>`:
```html
<script src="js/api.js"></script>
```

Then use in your JavaScript:

**Example - Get Products:**
```javascript
// Load products when page loads
async function loadProducts() {
  const products = await getProducts('shirts');
  console.log('Products:', products);
  // Display products in your page
}
```

**Example - User Login:**
```javascript
async function handleLogin() {
  const result = await loginUser('john@example.com', 'password123');
  if (result.token) {
    console.log('Logged in!');
    // Redirect to dashboard
  } else {
    console.log('Login failed:', result.error);
  }
}
```

**Example - Create Order:**
```javascript
async function checkout() {
  const cart = [
    { productId: '123', quantity: 2, price: 45 }
  ];
  const shippingAddress = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    zipCode: '10001'
  };
  
  const order = await createOrder(cart, shippingAddress, 90);
  if (order.message) {
    console.log('Order created!', order.order._id);
  }
}
```

### Method 2: Direct Fetch Calls

```javascript
// Get all products
fetch('http://localhost:5000/api/products')
  .then(res => res.json())
  .then(data => console.log(data));

// Login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data.token));
```

---

## 🛒 Integration Checklist

Use this to connect each part of your website:

- [ ] **Homepage** - Load featured products from API
- [ ] **Product Pages** - Fetch products by category from API
- [ ] **User Registration** - Call `registerUser()` from api.js
- [ ] **User Login** - Call `loginUser()` from api.js
- [ ] **Shopping Cart** - Validate with `validateCart()` and store locally
- [ ] **Checkout** - Call `createOrder()` with cart items
- [ ] **User Account** - Show profile using `getUserProfile()`
- [ ] **Order History** - Load with `getUserOrders()`
- [ ] **Payment** - Use `createPaymentIntent()` with Stripe

---

## 💻 Example: Update Your Shop to Load from Backend

**Current** (Hardcoded):
```html
<div id="product-list">
  <div class="product">
    <img src="shirt1.jpg">
    <h3>Kente Shirt</h3>
    <p>$45.00</p>
  </div>
</div>
```

**New** (Load from Backend):
```html
<div id="product-list"></div>

<script src="js/api.js"></script>
<script>
// Load products when page loads
document.addEventListener('DOMContentLoaded', async () => {
  const products = await getProducts('shirts');
  
  const html = products.map(product => `
    <div class="product">
      <img src="${product.image}">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart('${product._id}', '${product.name}', ${product.price})">
        Add to Cart
      </button>
    </div>
  `).join('');
  
  document.getElementById('product-list').innerHTML = html;
});

function addToCart(productId, name, price) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push({ productId, name, price, quantity: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Added to cart!');
}
</script>
```

---

## 🔐 Authentication Flow

1. **User registers:**
   ```javascript
   const user = await registerUser('John', 'john@example.com', 'password123', 'password123');
   // Token automatically saved to localStorage
   ```

2. **User logs in next time:**
   ```javascript
   const user = await loginUser('john@example.com', 'password123');
   // Token automatically saved to localStorage
   ```

3. **Make authenticated requests:**
   ```javascript
   const profile = await getUserProfile(); // Uses token from localStorage
   const orders = await getUserOrders(); // Uses token from localStorage
   ```

4. **User logs out:**
   ```javascript
   logoutUser(); // Token cleared from localStorage
   ```

---

## 📊 Database Seeding (Add Sample Products)

Create `backend/seed-data.js`:
```javascript
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const products = [
  {
    name: "Authentic Kente Shirt",
    category: "shirts",
    price: 45,
    description: "Traditional Kente shirt",
    stock: 10
  },
  {
    name: "African Print T-Shirt",
    category: "tshirts",
    price: 25,
    description: "100% cotton",
    stock: 15
  }
];

Product.insertMany(products).then(() => {
  console.log('✅ Products added!');
  process.exit();
});
```

Run: `node seed-data.js`

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS Error** | Make sure backend is running and FRONTEND_URL is set in .env |
| **MongoDB Connection Failed** | Start MongoDB or check MONGODB_URI in .env |
| **API returns 404** | Make sure backend server is running on port 5000 |
| **Login returns 401** | Check email/password are correct |
| **Payment fails** | Add Stripe test keys to .env from stripe.com |

---

## 🚀 Production Deployment

When ready to go live:

1. **Deploy Backend** to:
   - Heroku (free tier available)
   - Railway (free tier available)
   - Render (free tier available)
   - AWS, Google Cloud, Azure

2. **Setup Production Database:**
   - MongoDB Atlas (free tier)

3. **Update Frontend:**
   - Change `API_URL` in `js/api.js` to your deployed backend URL
   - Example: `const API_URL = 'https://my-store-backend.herokuapp.com/api'`

4. **Environment Variables:**
   - Set in your hosting platform dashboard
   - Never commit real .env to GitHub

---

## 📚 Reference

**API Documentation:** See `backend/SETUP.md`
**Frontend API Wrapper:** `js/api.js`
**Backend Source:** `backend/` folder

Need help? Check logs in terminal for error messages!