# 🎉 African Artifacts Backend - Complete Setup Guide

## 📁 What's Been Created

Your backend is ready to use! Here's what you have:

```
c:\Users\HP\Desktop\trm store\
├── backend/                    # Node.js Backend
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── SETUP.md               # Detailed setup guide
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Login/Register
│   │   ├── products.js       # Product management
│   │   ├── cart.js           # Cart validation
│   │   ├── orders.js         # Order management
│   │   └── payment.js        # Stripe payments
│   └── middleware/
│       └── auth.js            # JWT authentication
├── js/
│   └── api.js                 # Frontend API wrapper (NEW!)
├── example-integration.html   # Demo page (NEW!)
├── BACKEND_SETUP.md          # Quick start guide (NEW!)
└── index.html                # Your main store page
```

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install & Setup Backend

```bash
# Navigate to backend folder
cd "c:\Users\HP\Desktop\trm store\backend"

# Install dependencies
npm install

# Copy .env file
copy .env.example .env

# Edit .env with your settings
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/african-artifacts
PORT=5000
JWT_SECRET=your_secret_key_here_min_32_chars
```

### 2️⃣ Start MongoDB

**Option A - Local:**
```bash
# Start MongoDB (keep this running)
mongod
```

**Option B - Cloud (Recommended):**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Get connection string
- Paste into `.env` as MONGODB_URI

### 3️⃣ Start Backend Server

```bash
# From c:\Users\HP\Desktop\trm store\backend
npm run dev
```

✅ Should see:
```
✅ MongoDB Connected
🎉 Server running on http://localhost:5000
📝 API Health Check: http://localhost:5000/api/health
```

---

## 🧪 Test It Works

### Method 1: Browser Test
```
http://localhost:5000/api/health
```
Should show: `{ "status": "Backend is running! 🚀" }`

### Method 2: Interactive Example Page
Open: `c:\Users\HP\Desktop\trm store\example-integration.html`

This page has buttons to:
- ✅ Test connection
- 🔐 Register/Login
- 📦 Load products
- 📋 Create orders
- 🛒 Manage cart

### Method 3: API Testing Tool
- **Postman** - https://www.postman.com/downloads/
- **Thunder Client** - VS Code extension
- **Insomnia** - https://insomnia.rest/download

---

## 📝 API Endpoints Reference

### Auth
```
POST   /api/auth/register           Register new user
POST   /api/auth/login              Login user
GET    /api/auth/profile            Get user profile (need token)
PUT    /api/auth/profile            Update profile (need token)
```

### Products
```
GET    /api/products                Get all products
GET    /api/products/:id            Get single product
GET    /api/products/category/:cat  Get by category
POST   /api/products                Create product
PUT    /api/products/:id            Update product
DELETE /api/products/:id            Delete product
```

### Cart
```
POST   /api/cart/validate           Validate items (need token)
POST   /api/cart/shipping           Calculate shipping
```

### Orders
```
POST   /api/orders                  Create order (need token)
GET    /api/orders/user             Get user's orders (need token)
GET    /api/orders/:id              Get order details (need token)
PUT    /api/orders/:id/cancel       Cancel order (need token)
```

### Payment
```
POST   /api/payment/create-payment-intent    Create Stripe payment (need token)
POST   /api/payment/confirm-payment         Confirm payment (need token)
```

---

## 🎯 Use in Your Website

### Step 1: Add API Wrapper to HTML

In your `index.html` or any page:
```html
<script src="js/api.js"></script>
```

### Step 2: Use API Functions

**Load Products:**
```javascript
async function showProducts() {
  const products = await getProducts('shirts');
  console.log(products);
  
  // Display in your page
  products.forEach(product => {
    console.log(`${product.name} - $${product.price}`);
  });
}
```

**User Login:**
```javascript
async function userLogin() {
  const result = await loginUser('user@example.com', 'password');
  if (result.token) {
    console.log('✅ Logged in!');
  } else {
    console.log('❌', result.error);
  }
}
```

**Create Order:**
```javascript
async function placeOrder() {
  const items = [
    { productId: 'ID123', quantity: 2, price: 45 }
  ];
  const address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10001'
  };
  
  const order = await createOrder(items, address, 90);
  if (order.order) {
    console.log('✅ Order created:', order.order._id);
  }
}
```

### Step 3: Run Your Site

Open your `index.html` in browser and the API functions will work automatically!

---

## 📊 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  createdAt: Date
}
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  category: String (shirts, tshirts, etc.),
  price: Number,
  description: String,
  image: String,
  images: [String],
  stock: Number,
  rating: Number,
  reviews: [{userId, text, rating, createdAt}],
  createdAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref to User),
  items: [{productId, productName, quantity, price, image}],
  totalPrice: Number,
  shippingAddress: {...},
  status: String (pending, processing, shipped, delivered, cancelled),
  paymentStatus: String (pending, completed, failed),
  paymentMethod: String,
  stripePaymentId: String,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔑 Authentication (JWT Tokens)

When user logs in, they get a token:
```javascript
const data = await loginUser('user@example.com', 'password');
// Returns: { token: "eyJhbGciOiJIUzI1NiIs...", user: {...} }

// Token is automatically saved to localStorage
localStorage.getItem('authToken'); // Get token

// Token automatically sent with authenticated requests
const profile = await getUserProfile(); // Uses saved token
```

---

## 💳 Payment Integration (Stripe)

### Setup Stripe
1. Create account: https://stripe.com
2. Get test keys from dashboard
3. Add to `.env`:
```
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key
```

### Use in Frontend
```javascript
// Create payment
const paymentIntent = await createPaymentIntent(orderId, amount);
// Returns: { clientSecret: "..." }

// Confirm payment
const result = await confirmPayment(orderId, paymentIntentId);
// Returns: { order: {...} }
```

---

## 🌍 Deploy to Production

### Option 1: Heroku (Easy)
```bash
# Create account at heroku.com
# Install Heroku CLI
heroku login
heroku create my-store-backend
git push heroku main
```

### Option 2: Railway (Easy)
- Go to railway.app
- Connect GitHub
- Deploy automatically

### Option 3: AWS/Google Cloud
- More complex setup
- More control and scalability

### Update Frontend for Production
In `js/api.js`, change:
```javascript
const API_URL = 'https://my-store-backend.herokuapp.com/api';
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"MongoDB connection refused"** | Start MongoDB with `mongod` or use MongoDB Atlas |
| **"Port 5000 already in use"** | Change PORT in .env or kill process using `netstat -ano \| findstr :5000` |
| **"Cannot find module 'express'"** | Run `npm install` in backend folder |
| **"CORS error in browser"** | Backend running? FRONTEND_URL set in .env? |
| **"Invalid token" on API calls** | User logged in? Token in localStorage? |
| **Products not showing** | Add sample data using seed script (see SETUP.md) |

---

## 📚 Useful Documentation

- **Node.js:** https://nodejs.org/en/docs/
- **Express:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **Mongoose:** https://mongoosejs.com/
- **Stripe API:** https://stripe.com/docs/api
- **JWT:** https://jwt.io/

---

## ✅ Integration Checklist

- [ ] Backend running on localhost:5000
- [ ] MongoDB connected
- [ ] Can test health check endpoint
- [ ] `js/api.js` included in your HTML files
- [ ] User registration working
- [ ] User login working
- [ ] Products loading from API
- [ ] Can add to cart
- [ ] Can create order
- [ ] Authentication tokens working
- [ ] Ready to add Stripe payment

---

## 🎯 Next Steps

1. **Test the example page:** Open `example-integration.html` in browser
2. **Integrate with your store:** Add `<script src="js/api.js"></script>` to index.html
3. **Load products from API:** Replace hardcoded products with API calls
4. **Add user authentication:** Create login/register forms
5. **Setup shopping cart:** Save to localStorage, submit to backend
6. **Add payment:** Integrate Stripe for real transactions
7. **Deploy:** Put backend on Heroku/Railway, frontend on GitHub Pages/Netlify

---

## 💬 Support

Check files in this order if you have issues:
1. `backend/SETUP.md` - Backend specific setup
2. `BACKEND_SETUP.md` - Frontend integration
3. `example-integration.html` - Working examples
4. Check browser console (F12) for error messages
5. Check backend logs (terminal) for server errors

---

## 🚀 You're All Set!

Your e-commerce backend is ready. Now it's time to:
1. Start the server
2. Test with example page
3. Integrate with your store
4. Add real products
5. Go live! 🎉

Questions? Check the logs in your terminal for helpful error messages!