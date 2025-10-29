const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['shirts', 'tshirts', 'jerseys', 'ponchos', 'hoodies', 'material', 'blankets', 'sandals', 'womens', 'soapstone', 'leatherbags', 'handmadebags']
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  image: String,
  images: [String],
  stock: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      text: String,
      rating: Number,
      createdAt: Date
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);