const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'plain_shop_secret_key_123';

app.use(cors());
app.use(express.json());

// In-memory DB
let users = [];
let products = [
  { id: 1, name: 'Canvas Tote', price: 24.00, category: 'Everyday essentials', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', description: 'A sturdy everyday tote with long handles and one interior pocket. Crafted from heavy cotton canvas, washed and softened so it feels familiar right away.' },
  { id: 2, name: 'Desk Tray', price: 18.00, category: 'Everyday essentials', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600', description: 'Solid oak desk tray designed to keep your everyday carry items organized and within arm reach.' },
  { id: 3, name: 'Everyday Mug', price: 16.00, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600', description: 'Hand-thrown ceramic mug with a comforting matte glaze and comfortable weight.' },
  { id: 4, name: 'Pocket Notebook', price: 8.00, category: 'Stationery', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', description: 'Smyth-sewn pocket notebook with tactile cream paper for daily thoughts and lists.' },
  { id: 5, name: 'Wood Ruler', price: 12.00, category: 'Stationery', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600', description: 'Precision crafted maple wood ruler with laser-etched markings.' }
];

let userStates = {}; // userId -> { budget: 50, cart: [], saved: [] }

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const existing = users.find(u => u.email === email);
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = { id: Date.now().toString(), email, password: hashedPassword, name: name || 'Shopper' };
    users.push(user);
    
    userStates[user.id] = { budget: 50.00, cart: [1], saved: [2, 3, 4] }; // Default items from Figma
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (!userStates[user.id]) {
      userStates[user.id] = { budget: 50.00, cart: [1], saved: [2, 3, 4] };
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// User State & Budget
app.get('/api/user/state', authMiddleware, (req, res) => {
  const state = userStates[req.user.id] || { budget: 50.00, cart: [1], saved: [2, 3, 4] };
  res.json(state);
});

app.post('/api/user/state', authMiddleware, (req, res) => {
  const { budget, cart, saved } = req.body;
  if (!userStates[req.user.id]) userStates[req.user.id] = {};
  if (budget !== undefined) userStates[req.user.id].budget = budget;
  if (cart !== undefined) userStates[req.user.id].cart = cart;
  if (saved !== undefined) userStates[req.user.id].saved = saved;
  res.json(userStates[req.user.id]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
