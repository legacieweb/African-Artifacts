const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('shirts', 'tshirts', 'jerseys', 'ponchos', 'hoodies', 'material', 'blankets', 'sandals', 'womens', 'soapstone', 'leatherbags', 'handmadebags'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  image: {
    type: DataTypes.STRING
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  reviews: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
});

module.exports = Product;
