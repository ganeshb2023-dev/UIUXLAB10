import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Home, Sliders, ArrowLeft, Plus, Minus, Check, ChevronRight, User, LogOut, ShieldCheck, Search, X } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('plain_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('plain_user') || 'null'));
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'detail' | 'saved' | 'cart' | 'checkout' | 'confirmation' | 'plan'
  const [products, setProducts] = useState([
    { id: 1, name: 'Canvas Tote', price: 24.00, category: 'Everyday essentials', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800', description: 'A sturdy everyday tote with long handles and one interior pocket. Crafted from heavy cotton canvas, washed and softened so it feels familiar right away.' },
    { id: 2, name: 'Desk Tray', price: 18.00, category: 'Everyday essentials', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800', description: 'Solid oak desk tray designed to keep your everyday carry items organized and within arm reach.' },
    { id: 3, name: 'Everyday Mug', price: 16.00, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', description: 'Hand-thrown ceramic mug with a comforting matte glaze and comfortable weight.' },
    { id: 4, name: 'Pocket Notebook', price: 8.00, category: 'Stationery', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800', description: 'Smyth-sewn pocket notebook with tactile cream paper for daily thoughts and lists.' },
    { id: 5, name: 'Wood Ruler', price: 12.00, category: 'Stationery', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800', description: 'Precision crafted maple wood ruler with laser-etched markings.' }
  ]);

  const [budget, setBudget] = useState(50.00);
  const [goal, setGoal] = useState('Everyday essentials');
  const [cartIds, setCartIds] = useState([1]);
  const [savedIds, setSavedIds] = useState([2, 3, 4]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout form fields
  const [checkoutForm, setCheckoutForm] = useState({
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Morgan',
    address: '123 Main Street',
    city: 'Portland',
    state: 'Oregon',
    zip: '97205',
    cardNumber: '•••• •••• •••• 4242',
    expiry: '08 / 29',
    securityCode: '123'
  });

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/user/state', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.budget) setBudget(data.budget);
          if (data.cart) setCartIds(data.cart);
          if (data.saved) setSavedIds(data.saved);
        }
      }).catch(() => {});
    }
  }, [token]);

  const saveUserState = (newBudget, newCart, newSaved) => {
    if (!token) return;
    fetch('http://localhost:5000/api/user/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ budget: newBudget, cart: newCart, saved: newSaved })
    }).catch(() => {});
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword, name: authName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      localStorage.setItem('plain_token', data.token);
      localStorage.setItem('plain_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setActiveTab('home');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('plain_token');
    localStorage.removeItem('plain_user');
    setToken(null);
    setUser(null);
  };

  // Calculations
  const cartItems = products.filter(p => cartIds.includes(p.id));
  const savedItems = products.filter(p => savedIds.includes(p.id));
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const shipping = cartItems.length > 0 ? 5.00 : 0;
  const totalWithShipping = cartSubtotal + shipping;
  const remainingBudget = budget - totalWithShipping;

  const toggleCart = (id) => {
    let newCart;
    if (cartIds.includes(id)) {
      newCart = cartIds.filter(i => i !== id);
    } else {
      newCart = [...cartIds, id];
    }
    setCartIds(newCart);
    saveUserState(budget, newCart, savedIds);
  };

  const toggleSaved = (id) => {
    let newSaved;
    if (savedIds.includes(id)) {
      newSaved = savedIds.filter(i => i !== id);
    } else {
      newSaved = [...savedIds, id];
    }
    setSavedIds(newSaved);
    saveUserState(budget, cartIds, newSaved);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f5f0', color: '#2c352d', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER (01 - 06 Figma Match) */}
      <header style={{ borderBottom: '1px solid #e0dbc9', backgroundColor: '#f9f7f2', padding: '16px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <h1 onClick={() => setActiveTab('home')} style={{ fontSize: '20px', fontWeight: '700', cursor: 'pointer', margin: 0, letterSpacing: '-0.5px' }}>
            PLAIN SHOP
          </h1>
          {token && (
            <nav style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: '500' }}>
              <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'home' ? '#2b362e' : '#666', fontWeight: activeTab === 'home' ? '600' : '400' }}>Shop</button>
              <button onClick={() => setActiveTab('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'catalog' ? '#2b362e' : '#666', fontWeight: activeTab === 'catalog' ? '600' : '400' }}>New</button>
              <button onClick={() => setActiveTab('saved')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'saved' ? '#2b362e' : '#666', fontWeight: activeTab === 'saved' ? '600' : '400' }}>Saved ({savedItems.length})</button>
            </nav>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', fontWeight: '500' }}>
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ cursor: 'pointer', color: '#555' }} onClick={() => setActiveTab('catalog')}>Search</span>
              <span style={{ color: '#555' }}>Account</span>
              <button onClick={() => setActiveTab('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#2b362e' }}>
                <ShoppingBag size={16} /> Cart ({cartIds.length})
              </button>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d9534f', fontSize: '12px' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setAuthMode('login')} style={{ background: authMode === 'login' ? '#2b362e' : 'transparent', color: authMode === 'login' ? '#fff' : '#2b362e', border: '1px solid #2b362e', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => setAuthMode('signup')} style={{ background: authMode === 'signup' ? '#2b362e' : 'transparent', color: authMode === 'signup' ? '#fff' : '#2b362e', border: '1px solid #2b362e', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Sign Up</button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
        
        {!token ? (
          <div style={{ maxWidth: '460px', margin: '60px auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e0dbc9', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>{authMode === 'login' ? 'Welcome to Plain Shop' : 'Create your account'}</h2>
              <p style={{ fontSize: '14px', color: '#666' }}>Budget-aware shopping for everyday essentials.</p>
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {authMode === 'signup' && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Alex Morgan" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} required />
                </div>
              )}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="alex@example.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} required />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} required />
              </div>

              {authError && <div style={{ color: '#d9534f', fontSize: '13px', textAlign: 'center', background: '#fdf2f2', padding: '10px', borderRadius: '6px' }}>{authError}</div>}

              <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: '#2d3730', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', marginTop: '8px', fontSize: '15px' }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: '#2d3730', fontWeight: '600', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 01 — HOME STOREFRONT */}
            {activeTab === 'home' && (
              <div>
                {/* Budget Setter Banner (Figma 01) */}
                <div style={{ background: '#fff', padding: '32px 40px', borderRadius: '12px', border: '1px solid #e0dbc9', marginBottom: '48px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Set a simple shopping goal and spending limit.</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 140px', gap: '20px', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#777', display: 'block', marginBottom: '6px' }}>Shopping goal</label>
                      <input type="text" value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#777', display: 'block', marginBottom: '6px' }}>Spending limit</label>
                      <select value={budget} onChange={e => { const val = parseFloat(e.target.value); setBudget(val); saveUserState(val, cartIds, savedIds); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d5d0c0', fontSize: '14px', background: '#fff' }}>
                        <option value={25}>$25.00</option>
                        <option value={50}>$50.00</option>
                        <option value={75}>$75.00</option>
                        <option value={100}>$100.00</option>
                      </select>
                    </div>
                    <button onClick={() => setActiveTab('catalog')} style={{ padding: '11px', backgroundColor: '#2b362e', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                      Start shopping →
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '60px' }}>
                  <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1.15', margin: '0 0 20px 0' }}>Useful goods, plainly presented.</h1>
                    <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '28px' }}>
                      A tiny collection of deskware, home and ideas designed to last.
                    </p>
                    <button onClick={() => setActiveTab('catalog')} style={{ padding: '14px 28px', backgroundColor: '#2b362e', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                      Explore all products
                    </button>
                  </div>
                  <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
                    <img src={products[0].image} alt="Hero" style={{ width: '100%', height: '360px', objectFit: 'cover' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Featured products</h2>
                  <span style={{ fontSize: '13px', color: '#777', cursor: 'pointer' }} onClick={() => setActiveTab('catalog')}>View all ({products.length})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {products.slice(0, 4).map(prod => (
                    <div key={prod.id} onClick={() => { setSelectedProduct(prod); setActiveTab('detail'); }} style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e0dbc9', cursor: 'pointer' }}>
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <div style={{ padding: '16px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{prod.name}</div>
                        <div style={{ fontSize: '14px', color: '#555' }}>${prod.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 02 — PRODUCT LISTING / CATALOG */}
            {activeTab === 'catalog' && (
              <div>
                <div style={{ marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Everyday essentials</h2>
                  <p style={{ fontSize: '14px', color: '#666' }}>{products.length} products, thoughtfully crafted for daily life.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
                  {/* Filters sidebar */}
                  <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0dbc9', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Filters</h3>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Category</div>
                      {['All', 'Everyday essentials', 'Kitchen', 'Stationery'].map(cat => (
                        <div key={cat} onClick={() => setSelectedCategory(cat)} style={{ fontSize: '14px', padding: '6px 0', cursor: 'pointer', color: selectedCategory === cat ? '#2b362e' : '#555', fontWeight: selectedCategory === cat ? '700' : '400' }}>
                          {cat}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Budget status</div>
                      <div style={{ fontSize: '13px', color: '#2b362e' }}>✓ Only show items within my remaining budget (${(budget - totalWithShipping).toFixed(2)})</div>
                    </div>
                  </div>

                  {/* Product grid */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', color: '#777' }}>Showing {products.filter(p => selectedCategory === 'All' || p.category === selectedCategory).length} items</div>
                      <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5d0c0', fontSize: '13px', width: '200px', background: '#fff' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      {products
                        .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(prod => (
                          <div key={prod.id} onClick={() => { setSelectedProduct(prod); setActiveTab('detail'); }} style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e0dbc9', cursor: 'pointer' }}>
                            <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '16px' }}>
                              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{prod.name}</div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#2b362e', marginBottom: '8px' }}>${prod.price.toFixed(2)}</div>
                              <div style={{ fontSize: '11px', color: '#666', background: '#f0ece1', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>Fits remaining budget</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 03 — PRODUCT DETAILS */}
            {activeTab === 'detail' && selectedProduct && (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0dbc9', padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '12px' }} />
                </div>
                <div>
                  <button onClick={() => setActiveTab('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '13px', marginBottom: '16px', padding: 0 }}>← Back to catalog</button>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{selectedProduct.name}</h2>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>${selectedProduct.price.toFixed(2)}</div>
                  <div style={{ fontSize: '13px', color: '#777', marginBottom: '16px' }}>★★★★★ 18 reviews</div>
                  <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '24px' }}>{selectedProduct.description}</p>

                  <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Select Natural</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ padding: '6px 12px', border: '2px solid #2b362e', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>Natural</span>
                    </div>
                  </div>

                  <div style={{ background: '#f0ece1', padding: '16px', borderRadius: '10px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span>Everyday essentials</span>
                      <span style={{ fontWeight: '700' }}>${selectedProduct.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                      <span>Remaining budget after purchase</span>
                      <span style={{ fontWeight: '700' }}>${(budget - selectedProduct.price).toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleCart(selectedProduct.id)}
                    style={{ width: '100%', padding: '16px', backgroundColor: '#2b362e', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
                    {cartIds.includes(selectedProduct.id) ? '✓ View in Cart' : `Add to cart - $${selectedProduct.price.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}

            {/* 04 — SHOPPING CART */}
            {activeTab === 'cart' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>Your cart</h2>
                  <p style={{ fontSize: '14px', color: '#666' }}>Everyday essentials • Goal budget ${budget.toFixed(2)} • Estimated total ${totalWithShipping.toFixed(2)}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', fontSize: '12px', fontWeight: '600', color: '#777', borderBottom: '1px solid #d5d0c0', paddingBottom: '8px', marginBottom: '16px' }}>
                      <span>PRODUCT</span>
                      <span>TOTAL</span>
                    </div>

                    {cartItems.map(item => (
                      <div key={item.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0dbc9', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Color: Natural</div>
                          <button onClick={() => toggleCart(item.id)} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '13px', padding: 0 }}>Remove</button>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>${item.price.toFixed(2)}</div>
                      </div>
                    ))}

                    {/* Save for later section (Figma 04) */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0dbc9', marginTop: '32px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Save for later</h4>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Move this item out of your cart into a saved list. It will not count toward checkout.</p>
                      <button onClick={() => setActiveTab('saved')} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #2b362e', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                        View saved items ({savedItems.length})
                      </button>
                    </div>
                  </div>

                  {/* Order summary box (Figma 04) */}
                  <div>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e0dbc9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Order summary</h3>
                      
                      <div style={{ background: '#edf2ed', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>Budget review</div>
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '6px' }}>Everyday essentials • Goal budget ${budget.toFixed(2)}</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#2b362e' }}>Remaining budget ${(budget - totalWithShipping).toFixed(2)}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                        <span>Subtotal</span>
                        <span>${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                        <span>Estimated shipping</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', marginBottom: '24px', borderTop: '1px solid #d5d0c0', paddingTop: '16px' }}>
                        <span>Estimated total</span>
                        <span>${totalWithShipping.toFixed(2)}</span>
                      </div>

                      <button 
                        onClick={() => setActiveTab('checkout')} 
                        style={{ width: '100%', padding: '16px', background: '#2b362e', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        Proceed to checkout →
                      </button>
                      <div style={{ textAlign: 'center', fontSize: '11px', color: '#777', marginTop: '12px' }}>Shipping is estimated here and confirmed at checkout.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 05 — CHECKOUT FORM */}
            {activeTab === 'checkout' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Checkout</h2>
                  <span style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>🔒 Secure checkout</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                  <div style={{ background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e0dbc9' }}>
                    
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>01 Contact</h3>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Email</label>
                      <input type="email" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>02 Shipping address</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>First name</label>
                        <input type="text" value={checkoutForm.firstName} onChange={e => setCheckoutForm({...checkoutForm, firstName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Last name</label>
                        <input type="text" value={checkoutForm.lastName} onChange={e => setCheckoutForm({...checkoutForm, lastName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Address</label>
                      <input type="text" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>City</label>
                        <input type="text" value={checkoutForm.city} onChange={e => setCheckoutForm({...checkoutForm, city: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>State</label>
                        <input type="text" value={checkoutForm.state} onChange={e => setCheckoutForm({...checkoutForm, state: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>ZIP</label>
                        <input type="text" value={checkoutForm.zip} onChange={e => setCheckoutForm({...checkoutForm, zip: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>03 Payment</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Card number</label>
                      <input type="text" value={checkoutForm.cardNumber} onChange={e => setCheckoutForm({...checkoutForm, cardNumber: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Expiry</label>
                        <input type="text" value={checkoutForm.expiry} onChange={e => setCheckoutForm({...checkoutForm, expiry: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>Security code</label>
                        <input type="text" value={checkoutForm.securityCode} onChange={e => setCheckoutForm({...checkoutForm, securityCode: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d5d0c0', fontSize: '14px' }} />
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Your order summary & budget status (Figma 05) */}
                  <div>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e0dbc9' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Your order</h3>

                      {cartItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.name} × 1</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Natural</div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>${item.price.toFixed(2)}</div>
                        </div>
                      ))}

                      <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '16px 0', margin: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                          <span>Subtotal</span>
                          <span>${cartSubtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                          <span>Shipping</span>
                          <span>${shipping.toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
                        <span>Total</span>
                        <span>${totalWithShipping.toFixed(2)}</span>
                      </div>

                      {/* Shop within my budget box (Figma 05) */}
                      <div style={{ background: '#f8f6f0', padding: '16px', borderRadius: '10px', border: '1px solid #e0dbc9', marginBottom: '24px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Shop within my budget</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
                          <span>Goal</span>
                          <span>Everyday essentials</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
                          <span>Spending limit</span>
                          <span>${budget.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
                          <span>Total including shipping</span>
                          <span>${totalWithShipping.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#2b362e', borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
                          <span>Budget status</span>
                          <span style={{ color: '#2b362e' }}>Within your budget</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setActiveTab('cart')} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #2b362e', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Edit cart</button>
                        <button onClick={() => setActiveTab('confirmation')} style={{ flex: 1.5, padding: '14px', background: '#2b362e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Place order</button>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '11px', color: '#777', marginTop: '12px' }}>By placing your order, you agree to the store terms.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 06 — ORDER CONFIRMATION */}
            {activeTab === 'confirmation' && (
              <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '48px', borderRadius: '16px', border: '1px solid #e0dbc9' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e4ebe4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#2b362e' }}>✓</div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>Thanks for your order!</h2>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Order #PS-1048</div>
                  <p style={{ fontSize: '13px', color: '#777' }}>A confirmation has been sent to {checkoutForm.email}. We'll let you know when your order ships.</p>
                </div>

                <div style={{ border: '1px solid #e0dbc9', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Order details</h3>
                  
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.name} × 1 - Natural</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Standard shipping</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>${item.price.toFixed(2)}</div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                    <span>Total paid</span>
                    <span>${totalWithShipping.toFixed(2)}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                    <strong>Shipping to</strong><br/>
                    {checkoutForm.firstName} {checkoutForm.lastName} • {checkoutForm.address}, {checkoutForm.city}, {checkoutForm.state} {checkoutForm.zip}<br/>
                    <span style={{ color: '#777' }}>Estimated delivery: September 29–October 1</span>
                  </div>
                </div>

                {/* Budget outcome cards (Figma 06) */}
                <div style={{ background: '#f8f6f0', padding: '24px', borderRadius: '12px', border: '1px solid #e0dbc9', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Budget outcome</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0dbc9' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Original budget</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>${budget.toFixed(2)}</div>
                    </div>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0dbc9' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Actual amount spent</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>${totalWithShipping.toFixed(2)}</div>
                    </div>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0dbc9' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Amount left</div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>${remainingBudget.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Your budget plan stays active after this purchase. Use the remaining amount to keep shopping within your goal.</div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => { setCartIds([]); setActiveTab('home'); }} style={{ flex: 1, padding: '14px', background: '#2b362e', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Start new plan</button>
                  <button onClick={() => setActiveTab('catalog')} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #2b362e', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Review plan</button>
                </div>

              </div>
            )}
          </>
        )}

      </main>

    </div>
  );
}
