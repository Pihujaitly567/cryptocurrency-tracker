import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';
import favoritesRoutes from './routes/favorites.js';
import cryptoRoutes from './routes/crypto.js';
import alertRoutes from './routes/alertRoutes.js';
import { startPriceScheduler } from './utils/priceScheduler.js';


// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/alerts', alertRoutes);

// Start Price Scheduler
startPriceScheduler();


// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'CripTik Backend API is running' });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'CripTik Cryptocurrency Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            portfolio: '/api/portfolio',
            favorites: '/api/favorites',
            crypto: '/api/crypto',
        },
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 API listening on port ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`📚 Documentation: http://localhost:${PORT}/\n`);
});
