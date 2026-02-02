import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('home'); // 'home', 'checkout', 'admin-list', 'admin-add', 'admin-edit'
  const [cartItem, setCartItem] = useState(null);
  const [userDetails, setUserDetails] = useState({ name: '', phone: '', address: '' });
  
  // Admin Form State
  const [form, setForm] = useState({ 
    id: '', name: '', price: '', discount: 0, description: '', sizes: '', image: '' 
  });

  // --- LOADING DATA ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await axios.get('https://test1-mot0.onrender.com/api/products');
    setProducts(data);
  };

  // --- ADMIN ACTIONS ---
  
  // 1. Delete Product
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this?")) {
      await axios.delete(`https://test1-mot0.onrender.com/api/products/${id}`);
      fetchProducts(); // Refresh list
    }
  };

  // 2. Setup Edit Form
  const handleEdit = (product) => {
    setForm({ 
      id: product._id, // Save ID to know which one to update
      name: product.name, 
      price: product.price, 
      discount: product.discount, 
      description: product.description, 
      sizes: product.sizes, 
      image: product.image 
    });
    setView('admin-edit');
  };

  // 3. Submit (Add or Update)
  const handleSubmit = async () => {
    if (view === 'admin-edit') {
      // UPDATE existing
      await axios.put(`https://test1-mot0.onrender.com/api/products/${form.id}`, form);
      alert("Product Updated!");
    } else {
      // CREATE new
      await axios.post('https://test1-mot0.onrender.com/api/products', form);
      alert("Product Added!");
    }
    setForm({ id: '', name: '', price: '', discount: 0, description: '', sizes: '', image: '' }); // Clear form
    fetchProducts();
    setView('admin-list');
  };

  // --- HELPERS ---
  const calculatePrice = (price, discount) => Math.round(price - (price * discount / 100));

  // --- PAYMENT ---
  const handlePayment = async () => {
    // ... (Keep your payment logic from before here, or copy from previous response)
    alert("This is a demo payment button. Integrate Razorpay code here.");
  };

  return (
    <div className="App">
      
      {/* --- TOP NAVIGATION (Public) --- */}
      { !view.includes('admin') && (
        <nav>
          <h1>MyShop</h1>
          <div>
            <button onClick={() => setView('home')}>Home</button>
            <button className="admin-btn" onClick={() => setView('admin-list')}>Dashboard</button>
          </div>
        </nav>
      )}

      {/* --- PUBLIC: PRODUCT GRID --- */}
      {view === 'home' && (
        <div className="grid">
          {products.map(p => (
            <div key={p._id} className="card">
              <img src={p.image || "https://via.placeholder.com/200"} alt={p.name} />
              <h3>{p.name}</h3>
              <p>₹{calculatePrice(p.price, p.discount)} <s style={{color:'#888', fontSize:'0.8rem'}}>₹{p.price}</s></p>
              <button onClick={() => { setCartItem(p); setView('checkout'); }}>Buy Now</button>
            </div>
          ))}
        </div>
      )}

      {/* --- PUBLIC: CHECKOUT --- */}
      {view === 'checkout' && cartItem && (
        <div className="checkout-container">
          <button onClick={() => setView('home')}>← Back</button>
          <h2>Checkout</h2>
          <div className="summary">
            <h3>{cartItem.name}</h3>
            <h1>Total: ₹{calculatePrice(cartItem.price, cartItem.discount)}</h1>
          </div>
          <button className="pay-btn" onClick={handlePayment}>Pay Now</button>
        </div>
      )}

      {/* ===================================================== */}
      {/* ADMIN DASHBOARD SECTION                   */}
      {/* ===================================================== */}
      
      {view.includes('admin') && (
        <div className="admin-layout">
          
          {/* SIDEBAR */}
          <div className="sidebar">
            <h2>Admin Panel</h2>
            <button onClick={() => setView('home')}>← Back to Site</button>
            <button onClick={() => setView('admin-list')} className={view==='admin-list'?'active':''}>📦 All Products</button>
            <button onClick={() => {setForm({}); setView('admin-add')}} className={view==='admin-add'?'active':''}>➕ Add New</button>
            <button onClick={() => alert("Orders feature coming soon!")}>🚚 Orders</button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="admin-content">
            
            {/* 1. LIST VIEW */}
            {view === 'admin-list' && (
              <div>
                <h2>Manage Inventory ({products.length} Items)</h2>
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td><img src={p.image || "https://via.placeholder.com/50"} width="50" alt="" /></td>
                        <td>{p.name}</td>
                        <td>₹{p.price}</td>
                        <td style={{color: 'green'}}>In Stock</td>
                        <td>
                          <button className="edit-btn" onClick={() => handleEdit(p)}>✏️ Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. ADD / EDIT FORM VIEW */}
            {(view === 'admin-add' || view === 'admin-edit') && (
              <div className="form-container">
                <h2>{view === 'admin-edit' ? 'Edit Product' : 'Add New Product'}</h2>
                
                <div className="form-group">
                  <label>Product Name</label>
                  <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                
                <div className="row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" value={form.discount || ''} onChange={e => setForm({...form, discount: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input value={form.image || ''} onChange={e => setForm({...form, image: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="4" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                <button className="save-btn" onClick={handleSubmit}>
                  {view === 'admin-edit' ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
