const express = require('express');
const router = express.Router();
const { Coupon } = require('../models/sequelize');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// Validate a coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    console.log(`Validating coupon: ${code} for amount: ${orderAmount}`);
    
    // Find coupon (case insensitive for code)
    const coupon = await Coupon.findOne({
      where: {
        code: { [Op.iLike]: code.trim() }, 
        isActive: true
      }
    });

    if (!coupon) {
      // Try to find it without isActive or trimming check to see if that's the issue
      const exists = await Coupon.findOne({ 
        where: { 
          [Op.or]: [
            { code: code },
            { code: { [Op.iLike]: `%${code.trim()}%` } }
          ]
        } 
      });
      if (exists) {
        return res.status(404).json({ error: exists.isActive ? 'Coupon code match issue' : 'This coupon is currently inactive' });
      }
      return res.status(404).json({ error: `Coupon '${code}' not found` });
    }

    // Check expiry (allow use until the end of the expiry day)
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    expiry.setHours(23, 59, 59, 999);
    
    console.log(`Now: ${now}, Expiry: ${expiry}`);

    if (now > expiry) {
      console.log(`Coupon expired: ${code}`);
      return res.status(400).json({ error: 'This coupon has expired' });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    const minAmount = parseFloat(coupon.minOrderAmount || 0);
    const currentAmount = parseFloat(orderAmount || 0);

    if (currentAmount < minAmount) {
      return res.status(400).json({ error: `Minimum order amount for this coupon is KSh ${minAmount.toLocaleString()}` });
    }

    let discount = 0;
    const subtotal = parseFloat(orderAmount);
    if (coupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (parseFloat(coupon.discountValue) / 100));
    } else {
      discount = parseFloat(coupon.discountValue);
    }

    res.json({
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all coupons
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create a coupon
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete a coupon
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Coupon.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
