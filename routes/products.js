const express = require('express');
const router = express.Router();
const { Product } = require('../models/sequelize');
const { Op } = require('sequelize');

// Get All Products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let where = {};

    if (category) where.category = category;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Product (Admin only - for now, no auth check)
router.post('/', async (req, res) => {
  try {
    const { name, category, price, description, image, stock } = req.body;

    const product = await Product.create({
      name,
      category,
      price,
      description,
      image,
      stock
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product
router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, {
      where: { id: req.params.id }
    });
    const product = await Product.findByPk(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product
router.delete('/:id', async (req, res) => {
  try {
    await Product.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Products by Category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { category: req.params.category } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
