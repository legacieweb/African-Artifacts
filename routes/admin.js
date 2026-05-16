const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { Order, User, Product } = require('../models/sequelize');
const { Op, fn, col } = require('sequelize');

// Get all orders (Admin)
router.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order details (Admin)
router.get('/orders/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status and tracking (Admin)
router.put('/orders/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    await Order.update(
      updateData,
      { where: { id: req.params.id } }
    );
    const updatedOrder = await Order.findByPk(req.params.id);
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products (Admin)
router.get('/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Admin)
router.post('/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (Admin)
router.put('/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    const updatedProduct = await Product.findByPk(req.params.id);
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Admin)
router.delete('/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Admin)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stats with time-series (Admin)
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalUsers = await User.count({ where: { role: 'user' } });
    const orders = await Order.findAll();
    const totalRevenue = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);

    // Get revenue and orders for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total')), 'revenue']
      ],
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });
    
    res.json({
      totalOrders,
      totalUsers,
      totalRevenue,
      dailyStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
