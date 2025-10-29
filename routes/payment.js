const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const Order = require('../models/Order');

// Initialize Transaction (Paystack)
router.post('/initialize-transaction', verifyToken, async (req, res) => {
  try {
    if (!paystackSecret) {
      return res.status(500).json({ error: 'Paystack secret key missing. Set PAYSTACK_SECRET_KEY in your .env.' });
    }

    const { orderId, amount, email, callbackUrl } = req.body;

    if (!orderId || !amount || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Initialize transaction with Paystack API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystackSecret}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        email,
        currency: process.env.PAYSTACK_CURRENCY || 'NGN',
        reference: `order_${orderId}_${Date.now()}`,
        metadata: { orderId: orderId.toString() },
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL || `${req.headers.origin || process.env.FRONTEND_URL || ''}/checkout.html`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to initialize payment' });
    }

    res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });
  } catch (err) {
    console.error('Payment initialization error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during payment initialization' });
  }
});

// Verify Payment (Paystack)
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    const { orderId, reference } = req.body;

    if (!orderId || !reference) {
      return res.status(400).json({ error: 'Missing required fields: orderId and reference' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify with Paystack
    if (!paystackSecret) {
      return res.status(500).json({ error: 'Paystack secret key missing. Set PAYSTACK_SECRET_KEY in your .env.' });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to verify payment' });
    }

    if (data.status && data.data && data.data.status === 'success') {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.paystackReference = reference;
      order.amountPaid = order.total;
      order.balanceRemaining = 0;
      await order.save();

      res.json({
        message: 'Payment successful',
        order
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during payment verification' });
  }
});

module.exports = router;