/**
 * 🔗 API Connection Layer
 * Connects your frontend to the backend
 * 
 * Change API_URL to your backend location
 */

const API_URL = 'http://localhost:5000/api';

// Store auth token in localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

function clearAuthToken() {
  localStorage.removeItem('authToken');
}

// ==================== AUTHENTICATION ====================

// Register
async function registerUser(name, email, password, confirmPassword) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    const data = await response.json();
    if (response.ok) {
      setAuthToken(data.token);
      console.log('✅ Registration successful');
    }
    return data;
  } catch (err) {
    console.error('❌ Registration error:', err);
    return { error: err.message };
  }
}

// Login
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      setAuthToken(data.token);
      console.log('✅ Login successful');
    }
    return data;
  } catch (err) {
    console.error('❌ Login error:', err);
    return { error: err.message };
  }
}

// Logout
function logoutUser() {
  clearAuthToken();
  console.log('✅ Logged out');
}

// Get User Profile
async function getUserProfile() {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Profile error:', err);
    return null;
  }
}

// Update User Profile
async function updateUserProfile(updates) {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Update profile error:', err);
    return { error: err.message };
  }
}

// ==================== PRODUCTS ====================

// Get All Products
async function getProducts(category = null, search = null) {
  try {
    let url = `${API_URL}/products`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    if (params.toString()) url += '?' + params.toString();

    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error('❌ Get products error:', err);
    return [];
  }
}

// Get Single Product
async function getProduct(productId) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    return await response.json();
  } catch (err) {
    console.error('❌ Get product error:', err);
    return null;
  }
}

// Get Products by Category
async function getProductsByCategory(category) {
  try {
    const response = await fetch(`${API_URL}/products/category/${category}`);
    return await response.json();
  } catch (err) {
    console.error('❌ Get category error:', err);
    return [];
  }
}

// Create Product (Admin)
async function createProduct(productData) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Create product error:', err);
    return { error: err.message };
  }
}

// ==================== CART ====================

// Validate Cart
async function validateCart(items) {
  try {
    const token = getAuthToken();
    if (!token) return { items, totalPrice: 0 };

    const response = await fetch(`${API_URL}/cart/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items })
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Validate cart error:', err);
    return { items, totalPrice: 0 };
  }
}

// Calculate Shipping
async function calculateShipping(country, totalPrice) {
  try {
    const response = await fetch(`${API_URL}/cart/shipping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, totalPrice })
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Shipping calculation error:', err);
    return { shippingCost: 0, totalWithShipping: totalPrice };
  }
}

// ==================== ORDERS ====================

// Create Order
async function createOrder(items, shippingAddress, totalPrice, paymentDetails = {}) {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };

    const payload = {
      items,
      shippingAddress,
      total: paymentDetails.total ?? totalPrice,
      amountPaid: paymentDetails.amountPaid ?? totalPrice,
      paymentMethod: paymentDetails.paymentMethod ?? 'paystack',
      paymentReference: paymentDetails.paymentReference,
      paymentOption: paymentDetails.paymentOption,
      balanceRemaining: paymentDetails.balanceRemaining ?? 0
    };

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Create order error:', err);
    return { error: err.message };
  }
}

// Get User Orders
async function getUserOrders() {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_URL}/orders/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Get orders error:', err);
    return [];
  }
}

// Get Order Details
async function getOrderDetails(orderId) {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Get order details error:', err);
    return null;
  }
}

// Cancel Order
async function cancelOrder(orderId) {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };

    const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Cancel order error:', err);
    return { error: err.message };
  }
}

// ==================== PAYMENT ====================

// Initialize Paystack Transaction
async function initializePaystackTransaction(orderId, amount, email, options = {}) {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };

    const response = await fetch(`${API_URL}/payment/initialize-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, amount, email, callbackUrl: options.callbackUrl })
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Initialize transaction error:', err);
    return { error: err.message };
  }
}

// Verify Paystack Payment
async function verifyPaystackPayment(orderId, reference) {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };

    const response = await fetch(`${API_URL}/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, reference })
    });
    return await response.json();
  } catch (err) {
    console.error('❌ Verify payment error:', err);
    return { error: err.message };
  }
}

// ==================== UTILITY ====================

// Check if user is logged in
function isLoggedIn() {
  return !!getAuthToken();
}

// Get current user info
async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  return await getUserProfile();
}

console.log('✅ API loaded. Backend URL:', API_URL);