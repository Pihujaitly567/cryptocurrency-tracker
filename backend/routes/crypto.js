import express from 'express';
import axios from 'axios';
import cache from '../utils/cache.js';

const router = express.Router();

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// @route   GET /api/crypto/markets
// @desc    Get crypto market data (proxied from CoinGecko with caching)
// @access  Public
router.get('/markets', async (req, res) => {
    try {
        const { vs_currency = 'usd', per_page = 50 } = req.query;
        const cacheKey = `markets_${vs_currency}_${per_page}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log('✅ Serving from cache:', cacheKey);
            return res.json(cachedData);
        }

        // Fetch from CoinGecko API
        console.log('🌐 Fetching from CoinGecko API...');
        const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
            params: {
                vs_currency,
                order: 'market_cap_desc',
                per_page,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h',
            },
        });

        // Cache for 5 minutes (300 seconds)
        cache.set(cacheKey, response.data, 300);

        res.json(response.data);
    } catch (error) {
        console.error('CoinGecko API error:', error.message);
        res.status(500).json({ message: 'Error fetching crypto market data' });
    }
});

// @route   GET /api/crypto/chart/:coinId
// @desc    Get chart data for a specific coin
// @access  Public
router.get('/chart/:coinId', async (req, res) => {
    try {
        const { coinId } = req.params;
        const { vs_currency = 'usd', days = 7 } = req.query;
        const cacheKey = `chart_${coinId}_${vs_currency}_${days}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log('✅ Serving from cache:', cacheKey);
            return res.json(cachedData);
        }

        // Fetch from CoinGecko API
        console.log('🌐 Fetching chart data from CoinGecko API...');
        const response = await axios.get(
            `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`,
            {
                params: {
                    vs_currency,
                    days,
                },
            }
        );

        // Cache for 5 minutes
        cache.set(cacheKey, response.data, 300);

        res.json(response.data);
    } catch (error) {
        console.error('CoinGecko chart API error:', error.message);
        res.status(500).json({ message: 'Error fetching chart data' });
    }
});

// @route   GET /api/crypto/cache/stats
// @desc    Get cache statistics (for debugging)
// @access  Public
router.get('/cache/stats', (req, res) => {
    res.json({
        size: cache.size(),
        message: 'Cache statistics',
    });
});

// @route   DELETE /api/crypto/cache
// @desc    Clear cache (for debugging/admin)
// @access  Public
router.delete('/cache', (req, res) => {
    cache.clear();
    res.json({ message: 'Cache cleared successfully' });
});

export default router;
