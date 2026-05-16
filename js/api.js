const api = {
  BASE_URL: 'https://african-artifacts-pihe.onrender.com/api',

  async loginUser(email, password) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'Connection failed' };
    }
  },

  async registerUser(name, email, password, confirmPassword) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });
      return await response.json();
    } catch (err) {
      console.error('Registration error:', err);
      return { error: 'Connection failed' };
    }
  },

  async getProfile() {
    return await this.getUserProfile();
  },

  async getUserProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) return { error: 'Not authenticated' };

    try {
      const response = await fetch(`${this.BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (err) {
      console.error('Profile error:', err);
      return { error: 'Connection failed' };
    }
  },

  async updateUserProfile(updates) {
    const token = localStorage.getItem('authToken');
    if (!token) return { error: 'Not authenticated' };

    try {
      const response = await fetch(`${this.BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (err) {
      console.error('Update profile error:', err);
      return { error: 'Connection failed' };
    }
  },

  async getProducts(category = null) {
    try {
      let url = `${this.BASE_URL}/products`;
      if (category) url += `/category/${category}`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error('Get products error:', err);
      return [];
    }
  },

  async getUserOrders() {
    const token = localStorage.getItem('authToken');
    if (!token) return [];

    try {
      const response = await fetch(`${this.BASE_URL}/orders/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (err) {
      console.error('Get orders error:', err);
      return [];
    }
  },

  async createOrder(orderData) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.BASE_URL}/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (err) {
      console.error('Create order error:', err);
      return { error: 'Connection failed' };
    }
  },

  async validateCoupon(code, amount) {
    try {
      const response = await fetch(`${this.BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount })
      });
      return await response.json();
    } catch (err) {
      console.error('Coupon validation error:', err);
      return { error: 'Connection failed' };
    }
  },

  logoutUser() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  }
};

// Global helper functions to match existing calls
window.loginUser = (email, password) => api.loginUser(email, password);
window.registerUser = (name, email, password, confirmPassword) => api.registerUser(name, email, password, confirmPassword);
window.getUserProfile = () => api.getUserProfile();
window.getProfile = () => api.getProfile();
window.updateUserProfile = (updates) => api.updateUserProfile(updates);
window.getUserOrders = () => api.getUserOrders();
window.getProducts = (category) => api.getProducts(category);
window.createOrder = (orderData) => api.createOrder(orderData);
window.logoutUser = () => api.logoutUser();
window.api = api;
