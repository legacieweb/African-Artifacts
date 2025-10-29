const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      name: String,
      size: String,
      quantity: Number,
      price: Number
    }
  ],
  total: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  balanceRemaining: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['full', 'partial', 'card', 'paystack', 'cash'],
    required: true
  },
  paymentReference: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  deliveryStatus: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paystackReference: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);