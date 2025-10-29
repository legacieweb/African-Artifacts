const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Product = require('../models/Product');

// Note: Cart is stored in browser localStorage/sessionStorage
// These endpoints are for cart validation and totals calculation

// Validate Cart Items
router.post('/validate', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid cart items' });
    }

    const validatedItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        continue; // Skip product if not found
      }

      if (product.stock < item.quantity) {
        validatedItems.push({
          ...item,
          warning: 'Insufficient stock available'
        });
      } else {
        validatedItems.push(item);
        totalPrice += product.price * item.quantity;
      }
    }

    res.json({
      items: validatedItems,
      totalPrice,
      itemCount: validatedItems.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate Shipping
router.post('/shipping', async (req, res) => {
  try {
    const { country, totalPrice } = req.body;

    let shippingCost = 0;

    // Simple shipping calculation
    if (country === 'United States') {
      shippingCost = totalPrice > 100 ? 0 : 10;
    } else if (country === 'Canada') {
      shippingCost = totalPrice > 100 ? 0 : 15;
    } else {
      shippingCost = 25; // International
    }

    res.json({
      shippingCost,
      totalWithShipping: totalPrice + shippingCost
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;