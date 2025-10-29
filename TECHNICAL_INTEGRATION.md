# 🔧 Technical Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                │
│  ┌───────────────┬──────────────┬──────────────┐        │
│  │  dashboard.   │  checkout.   │  index.html  │        │
│  │  html         │  html        │  etc.        │        │
│  └───────────────┴──────────────┴──────────────┘        │
│         ↓ API Calls ↓                                    │
│  ┌─────────────────────────────────────┐               │
│  │       js/api.js                     │               │
│  │  - getUserProfile()                 │               │
│  │  - updateUserProfile()              │               │
│  │  - getUserOrders()                  │               │
│  │  - loginUser()                      │               │
│  └─────────────────────────────────────┘               │
│         ↓ HTTP Requests ↓                               │
│  ┌─────────────────────────────────────┐               │
│  │  js/checkout-profile-manager.js     │               │
│  │  - Detects changes                  │               │
│  │  - Shows save modal                 │               │
│  │  - Calls updateUserProfile()        │               │
│  └─────────────────────────────────────┘               │
│         ↓ REST API ↓                                    │
├─────────────────────────────────────────────────────────┤
│                    Backend (Node/Express)                │
│  ┌────────────────────────────────────┐                │
│  │    routes/auth.js                  │                │
│  │  - POST /auth/register             │                │
│  │  - POST /auth/login                │                │
│  │  - GET /auth/profile               │                │
│  │  - PUT /auth/profile ← Profile Save│                │
│  └────────────────────────────────────┘                │
│  ┌────────────────────────────────────┐                │
│  │    middleware/auth.js              │                │
│  │  - verifyToken()                   │                │
│  │  - JWT validation                  │                │
│  └────────────────────────────────────┘                │
│         ↓ Database Operations ↓                         │
├─────────────────────────────────────────────────────────┤
│                    Database (MongoDB)                    │
│  ┌────────────────────────────────────┐                │
│  │    models/User.js                  │                │
│  │  {                                 │                │
│  │    _id,                            │                │
│  │    name,                           │                │
│  │    email,                          │                │
│  │    password (hashed),              │                │
│  │    phone,                          │                │
│  │    address: {                      │                │
│  │      street,                       │                │
│  │      city,                         │                │
│  │      state,                        │                │
│  │      country,                      │                │
│  │      zipCode                       │                │
│  │    },                              │                │
│  │    createdAt                       │                │
│  │  }                                 │                │
│  └────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Profile Update Flow

```
User Dashboard
    ↓
    ├─ Click "Edit Profile"
    │
    ├─ Form appears
    │
    ├─ User fills in name & phone
    │
    ├─ Click "Save Changes"
    │
    ├─ Dashboard collects form data:
    │  {
    │    name: "John Doe",
    │    phone: "+254712345678"
    │  }
    │
    ├─ Calls updateUserProfile(data)
    │
    ├─ api.js sends PUT to /api/auth/profile
    │
    ├─ Backend receives request
    │
    ├─ Middleware verifies JWT token
    │
    ├─ auth.js validates data
    │
    ├─ User.findByIdAndUpdate() saves to MongoDB
    │
    ├─ Returns updated user object
    │
    ├─ Frontend shows modal confirmation
    │
    ├─ User confirms "Yes, Save"
    │
    └─ Display success notification ✓
```

### Checkout Auto-Save Flow

```
Checkout Page Loads
    ↓
    ├─ Calls loadUserProfile()
    │
    ├─ getUserProfile() fetches user from API
    │
    ├─ Response includes name, email, phone, address
    │
    ├─ Fill form fields with saved data:
    │  - first-name ← split name[0]
    │  - last-name ← split name[1..]
    │  - email ← email
    │  - phone ← phone
    │  - address ← address.street
    │  - city ← address.city
    │  - state ← address.state
    │  - country ← address.country
    │  - zip ← address.zipCode
    │
    ├─ checkoutProfileManager.init()
    │
    └─ Store original user data for comparison

User Makes Edits During Checkout
    ↓
    ├─ User modifies some fields
    │
    └─ New values in form

User Completes Payment
    ↓
    ├─ Payment successful
    │
    ├─ verifyPaystackPayment() returns success
    │
    ├─ Check: hasDataChanged()?
    │
    ├─ If YES → Show Save Modal
    │  │
    │  ├─ Modal shows:
    │  │  - Current name
    │  │  - Current phone
    │  │  - Current address
    │  │
    │  ├─ User clicks "Yes, Save to Profile"
    │  │
    │  ├─ Calls updateUserProfile()
    │  │
    │  ├─ PUT /api/auth/profile sent
    │  │
    │  ├─ Data saved to MongoDB
    │  │
    │  ├─ Show success notification
    │  │
    │  └─ Redirect to dashboard.html
    │
    ├─ If NO → Skip directly to dashboard
    │
    └─ Cart cleared, session cleaned
```

### Order History Flow

```
User on Dashboard
    ↓
    ├─ Click "Orders" tab
    │
    ├─ Calls getUserOrders()
    │
    ├─ api.js sends GET /api/orders/user
    │
    ├─ Backend queries Order collection
    │  Filter: { userId: req.userId }
    │
    ├─ Returns array of orders
    │
    ├─ For each order, display:
    │  ├─ Order ID (last 8 chars)
    │  ├─ Order status badge
    │  ├─ Order date
    │  ├─ Order total
    │  ├─ Amount paid
    │  ├─ Balance remaining
    │  ├─ Items list (name, qty, price)
    │  └─ Expandable details
    │
    └─ Show empty state if no orders
```

## API Endpoint Details

### GET /api/auth/profile
```javascript
// Request
{
  method: 'GET',
  headers: {
    'Authorization': 'Bearer {JWT_TOKEN}'
  }
}

// Response (200 OK)
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String (optional),
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  } (optional),
  createdAt: Date
}

// Error Response (401 Unauthorized)
{
  error: 'Invalid token'
}
```

### PUT /api/auth/profile
```javascript
// Request
{
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer {JWT_TOKEN}',
    'Content-Type': 'application/json'
  },
  body: {
    name?: String,        // Optional
    phone?: String,       // Optional
    address?: {           // Optional (nested object)
      street?: String,
      city?: String,
      state?: String,
      country?: String,
      zipCode?: String
    }
  }
}

// Response (200 OK)
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  address: { /* full address object */ },
  createdAt: Date
}

// Error Response (500)
{
  error: 'Error message'
}
```

### GET /api/orders/user
```javascript
// Request
{
  method: 'GET',
  headers: {
    'Authorization': 'Bearer {JWT_TOKEN}'
  }
}

// Response (200 OK)
[
  {
    _id: ObjectId,
    userId: ObjectId,
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number
      }
    ],
    shippingAddress: { /* address */ },
    total: Number,
    amountPaid: Number,
    status: String,      // 'pending', 'processing', 'completed', 'cancelled'
    paymentStatus: String,
    paystackReference: String,
    createdAt: Date,
    updatedAt: Date
  }
]

// Empty Array if no orders
[]
```

## JavaScript Functions

### API Layer (js/api.js)

```javascript
// Get user profile
async function getUserProfile()
// Returns: User object or null

// Update user profile
async function updateUserProfile(updates)
// Parameter: { name?, phone?, address? }
// Returns: Updated user object or error

// Get user orders
async function getUserOrders()
// Returns: Array of orders or []

// Login user
async function loginUser(email, password)
// Returns: { token, user, error? }

// Logout user
function logoutUser()
// Side effect: Clears token from localStorage
```

### Checkout Manager (js/checkout-profile-manager.js)

```javascript
// Initialize manager and fetch current user
window.checkoutProfileManager.init()
// Stores original user data for comparison

// Check if data has changed
window.checkoutProfileManager.hasChanged()
// Returns: boolean

// Check if user is new (no address)
window.checkoutProfileManager.isNew()
// Returns: boolean

// Show save confirmation modal
window.checkoutProfileManager.showSaveModal(onConfirm, onCancel)
// Parameters: callback functions

// Capture current form data
window.checkoutProfileManager.captureData()
// Returns: { name, phone, address }

// Close modal programmatically
window.checkoutProfileManager.closeModal()
```

### Dashboard Functions (dashboard.html)

```javascript
// Display profile information
displayProfile()
// Side effect: Updates #userInfoDisplay HTML

// Display address information
displayAddress()
// Side effect: Updates #addressDisplay HTML
// Also updates #addressStatus indicator

// Load and display orders
async loadUserOrders()
// Fetches and displays orders from API

// Toggle profile edit form
toggleEditProfile()
// Shows/hides edit form

// Toggle address edit form
toggleEditAddress()
// Shows/hides edit form

// Save profile changes
async saveProfile(event)
// Collects form data and shows confirmation

// Save address changes
async saveAddress(event)
// Collects form data and shows confirmation

// Switch between tabs
switchTab(tabName)
// Parameters: 'profile', 'address', 'orders'

// Show logout confirmation
showLogoutModal()

// Perform logout
confirmLogout()
```

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,           // Optional, updated
  address: {               // Optional, nested
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### Order Model (Related)
```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  shippingAddress: { /* full address */ },
  total: Number,
  amountPaid: Number,
  balanceRemaining: Number,
  status: String,          // pending, processing, completed
  paymentStatus: String,   // completed, failed, pending
  paystackReference: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Frontend Error Handling

```javascript
// API calls wrapped in try-catch
try {
  const result = await updateUserProfile(data);
  if (result.error) {
    showAlert(result.error, 'error');
  } else {
    showAlert('Success!', 'success');
  }
} catch (error) {
  showAlert('Network error', 'error');
  console.error(error);
}

// Form validation
if (!form.reportValidity()) return null;

// Null checks before DOM updates
if (currentUser && !currentUser.error) {
  displayProfile();
}
```

### Backend Error Handling (auth.js)

```javascript
// Validation errors
if (!name || !email || !password) {
  return res.status(400).json({ error: 'All fields required' });
}

// Duplicate email
if (existingUser) {
  return res.status(400).json({ error: 'Email already registered' });
}

// Authentication errors
if (!user) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

// Server errors
catch (err) {
  res.status(500).json({ error: err.message });
}
```

## Performance Considerations

### Frontend Optimization
```javascript
// Lazy load profile manager in checkout
<script defer src="js/checkout-profile-manager.js"></script>

// Cache user data to avoid redundant calls
let currentUser = null;

// Debounce form changes
// Efficient modal rendering (only when needed)
// CSS transforms for animations (GPU accelerated)
```

### Backend Optimization
```javascript
// Index on userId for fast queries
db.orders.createIndex({ userId: 1 })

// Select specific fields when not needed
User.findById(req.userId).select('-password')

// Validate before database updates
// Connection pooling for MongoDB
```

## Security Implementation

### Authentication
```javascript
// JWT token validation
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = user.id;
    next();
  });
};

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### Input Validation
```javascript
// Server-side validation
if (!name || typeof name !== 'string') {
  return res.status(400).json({ error: 'Invalid name' });
}

// Email validation
if (!email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}

// Phone format validation
if (phone && !/^\+?[0-9]{9,}$/.test(phone)) {
  return res.status(400).json({ error: 'Invalid phone' });
}
```

## Testing Guide

### Unit Tests
```javascript
// Test updateUserProfile
describe('updateUserProfile', () => {
  it('should update user name', async () => {
    const result = await updateUserProfile({ name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('should handle errors', async () => {
    const result = await updateUserProfile({ invalid: true });
    expect(result.error).toBeDefined();
  });
});
```

### Integration Tests
```javascript
// Test complete flow
describe('Checkout Profile Auto-Save', () => {
  it('should save profile after payment', async () => {
    // 1. Load checkout
    // 2. Fill form
    // 3. Complete payment
    // 4. Modal appears
    // 5. Save confirmed
    // 6. Data in MongoDB
    // 7. Dashboard shows new data
  });
});
```

## Debugging Tips

### Enable Console Logging
```javascript
// In api.js
console.log('✅ API loaded. Backend URL:', API_URL);

// In checkout-profile-manager.js
console.log('✅ Checkout Profile Manager loaded');

// In dashboard
console.log('✅ Dashboard initialized');
```

### Check Network Calls
```
1. Open F12 (DevTools)
2. Go to Network tab
3. Watch API calls
4. Check response status and data
5. Look for errors in Response
```

### Debug Modal Issues
```javascript
// Check if modal renders
document.getElementById('profileSaveModal')

// Check z-index conflicts
window.getComputedStyle(modal).zIndex

// Check event listeners
getEventListeners(document.getElementById('saveButton'))
```

## Deployment Checklist

```
Backend:
□ MongoDB connection verified
□ JWT_SECRET configured
□ PAYSTACK_SECRET_KEY configured
□ auth.js endpoints working
□ User model has address field
□ Middleware/auth.js in place
□ Error handling works

Frontend:
□ dashboard.html deployed
□ checkout-profile-manager.js in js/ folder
□ checkout.html updated with manager
□ api.js API_URL correct
□ All scripts load without 404s
□ localStorage available

Testing:
□ Registration works
□ Login works
□ Profile loads
□ Profile updates save
□ Address loads and saves
□ Checkout pre-fills
□ Modal appears after payment
□ Mobile responsive
□ No console errors
```

---

**For implementation questions, refer to specific sections above.**