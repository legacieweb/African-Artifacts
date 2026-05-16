const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Coupon = require('./Coupon');

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Product,
  Order,
  Coupon
};
