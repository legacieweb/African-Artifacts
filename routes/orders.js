const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Create Order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, total, amountPaid, paymentMethod, balanceRemaining, paymentReference, status, shippingAddress } = req.body;

    if (!items || total == null || amountPaid == null || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate items is an array
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    // Parse and validate numbers
    const parsedTotal = parseFloat(total);
    const parsedAmountPaid = parseFloat(amountPaid);
    const parsedBalanceRemaining = parseFloat(balanceRemaining || 0);

    if (isNaN(parsedTotal) || isNaN(parsedAmountPaid) || isNaN(parsedBalanceRemaining)) {
      return res.status(400).json({ error: 'Invalid number values' });
    }

    // Validate and parse items
    const parsedItems = items.map(item => {
      const quantity = parseInt(item.quantity);
      const price = parseFloat(item.price);
      if (isNaN(quantity) || isNaN(price)) {
        throw new Error('Invalid item quantity or price');
      }
      return {
        name: item.name,
        size: item.size,
        quantity,
        price
      };
    });

    // Validate payment method
    if (!['full', 'partial', 'card', 'paystack', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Create order
    const order = new Order({
      userId: req.userId,
      items: parsedItems,
      total: parsedTotal,
      amountPaid: parsedAmountPaid,
      balanceRemaining: parsedBalanceRemaining,
      paymentMethod,
      paymentReference,
      status: status || 'confirmed',
      shippingAddress
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get User Orders
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Order Details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin only - add auth later)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Order
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;