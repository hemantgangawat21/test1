// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Product = require('./models/Product');

const app = express();
app.use(express.json());
app.use(cors());

// CONNECT TO MONGODB (Change 'my_shop_db' if you want)
const dbURI = 'mongodb+srv://admin:Hemant123@cluster0.229cpwj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 5000 // Fail after 5 seconds instead of hanging
})
.then(() => console.log("✅ MongoDB Connected Successfully!"))
.catch(err => {
    console.error("❌ Connection Error Details:", err.message);
});
// --- RAZORPAY SETUP ---
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- ROUTES ---

// 1. Get All Products
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// 2. Add New Product (For Admin)
app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

// 3. Edit Product
app.put('/api/products/:id', async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
});

// 4. Create Payment Order
app.post('/api/payment/order', async (req, res) => {
    const { amount } = req.body;
    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        });
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 5. Verify Payment (Security Step)
app.post('/api/payment/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment is legit. Save order to DB here if you want.
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});
// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));