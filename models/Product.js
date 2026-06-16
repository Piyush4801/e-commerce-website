const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sellerId: { type: String, required: true }, // Referencing User (role=seller) ID
  sellerName: String,
  images: [{ type: String }],
  image: { type: String },
  imageUrl: { type: String },
  thumbnail: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // Sustainability Metrics
  sustainability: {
    ecoScore: { type: String, enum: ['A', 'B', 'C', 'D', 'E'], default: 'C' },
    ecoRating: { type: Number, min: 1, max: 5, default: 3 },
    carbonFootprint: { type: Number, default: 5.2 } // in kg CO2
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('Product', ProductSchema);
