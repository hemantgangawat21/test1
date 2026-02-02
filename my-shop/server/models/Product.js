// server/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    category: String, // e.g., "Clothes", "Shoes"
    price: Number,
    discount: { type: Number, default: 0 }, // Percentage (e.g., 20)
    sizes: String, // Store as text like "S, M, L" for simplicity
    description: String,
    image: String, // URL of the image
});

module.exports = mongoose.model('Product', ProductSchema);