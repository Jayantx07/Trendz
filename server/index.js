const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.set('strictQuery', true);
// Allow a local default for development if MONGODB_URI is not provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trendz_dev';
if (!process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not set in environment. Falling back to local default:', MONGODB_URI);
}
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Keep process running so developer can still access non-DB routes and see errors in logs.
    // Do not exit here to make development a bit more forgiving; DB-required routes will fail with errors.
  });

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/media', require('./routes/media'));
app.use('/api/site-config', require('./routes/siteConfig'));
app.use('/api/admin/products', require('./routes/adminProducts'));
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/queries', require('./routes/queries'));
app.use('/api/payments', require('./routes/payments'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/blog', require('./routes/blog'));
// app.use('/api/appointments', require('./routes/appointments'));
// Removed PayPal integration routes
// app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 