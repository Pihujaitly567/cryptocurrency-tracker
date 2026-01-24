import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Minus, ArrowUpDown, Home, Briefcase, BarChart3, RefreshCw, Newspaper, Star, Globe, Github, Bell, Sun, Moon, Activity } from 'lucide-react';

import Login from './login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import AlertsPage from './AlertsPage';
import StatsPage from './StatsPage';
import SentimentMeter from './SentimentMeter';

import Footer from './Footer';



import { cryptoAPI, portfolioAPI, favoritesAPI } from './api/client';

const CryptoTracker = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cryptoData, setCryptoData] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [convertFrom, setConvertFrom] = useState('bitcoin');
  const [convertTo, setConvertTo] = useState('ethereum');
  const [convertAmount, setConvertAmount] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [conversionResult, setConversionResult] = useState(0);
  const [currency, setCurrency] = useState('usd');
  const [favorites, setFavorites] = useState([]);
  const [authView, setAuthView] = useState('login');


  // Load favorites from backend when user logs in
  const loadFavorites = async () => {
    try {
      const favoriteIds = await favoritesAPI.getAll();
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Load portfolio from backend
  const loadPortfolio = async () => {
    try {
      const portfolioData = await portfolioAPI.getAll();
      // Transform backend data to match frontend structure
      const transformedData = portfolioData.map(item => ({
        id: item.cryptoId,
        _id: item._id,
        name: item.name,
        symbol: item.symbol,
        image: item.image,
        amount: item.amount,
        purchasePrice: item.purchasePrice,
        current_price: item.currentPrice || item.purchasePrice,
      }));
      setPortfolio(transformedData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      if (favorites.includes(id)) {
        await favoritesAPI.remove(id);
        setFavorites(prev => prev.filter(fav => fav !== id));
      } else {
        await favoritesAPI.add(id);
        setFavorites(prev => [...prev, id]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    // Load user data after login
    loadFavorites();
    loadPortfolio();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setPortfolio([]);
    setFavorites([]);
  };

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const data = await cryptoAPI.getMarkets(currency, 50);
      setCryptoData(data);

      // Update current prices in portfolio
      if (portfolio.length > 0) {
        const updatedPortfolio = portfolio.map(item => {
          const cryptoInfo = data.find(c => c.id === item.id);
          if (cryptoInfo) {
            return { ...item, current_price: cryptoInfo.current_price };
          }
          return item;
        });
        setPortfolio(updatedPortfolio);
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchChartData = async (coinId) => {
    try {
      const data = await cryptoAPI.getChartData(coinId, currency, 7);
      const formattedData = data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price: price.toFixed(2)
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };


  // Generate news from existing crypto data (no additional API calls needed)
  const generateNewsFromCryptoData = () => {
    if (cryptoData.length === 0) return [];

    const newsItems = [];
    const now = new Date();

    // Sort by price change to find top gainers and losers
    const sortedByChange = [...cryptoData].sort((a, b) =>
      b.price_change_percentage_24h - a.price_change_percentage_24h
    );

    // Top 3 Gainers
    const topGainers = sortedByChange.slice(0, 3);
    topGainers.forEach((coin, index) => {
      if (coin.price_change_percentage_24h > 0) {
        newsItems.push({
          id: `gainer-${index}`,
          title: `🚀 ${coin.name} Surges ${coin.price_change_percentage_24h.toFixed(2)}% in 24 Hours!`,
          description: `${coin.name} (${coin.symbol.toUpperCase()}) is one of today's top performers, currently trading at ${formatCurrency(coin.current_price)}. Market cap: ${formatCurrency(coin.market_cap)}.`,
          timestamp: 'Today',
          source: 'Market Data',
          url: `https://www.coingecko.com/en/coins/${coin.id}`,
          type: 'bullish',
          image: coin.image
        });
      }
    });

    // Top 3 Losers
    const topLosers = sortedByChange.slice(-3).reverse();
    topLosers.forEach((coin, index) => {
      if (coin.price_change_percentage_24h < 0) {
        newsItems.push({
          id: `loser-${index}`,
          title: `📉 ${coin.name} Drops ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}% in 24 Hours`,
          description: `${coin.name} (${coin.symbol.toUpperCase()}) is experiencing downward pressure, currently at ${formatCurrency(coin.current_price)}. This could present a buying opportunity for investors.`,
          timestamp: 'Today',
          source: 'Market Data',
          url: `https://www.coingecko.com/en/coins/${coin.id}`,
          type: 'bearish',
          image: coin.image
        });
      }
    });

    // Market leaders news
    const btc = cryptoData.find(c => c.id === 'bitcoin');
    const eth = cryptoData.find(c => c.id === 'ethereum');

    if (btc) {
      newsItems.push({
        id: 'btc-update',
        title: `₿ Bitcoin Trading at ${formatCurrency(btc.current_price)}`,
        description: `The leading cryptocurrency is ${btc.price_change_percentage_24h >= 0 ? 'up' : 'down'} ${Math.abs(btc.price_change_percentage_24h).toFixed(2)}% in the last 24 hours. Bitcoin continues to dominate the market with a cap of ${formatCurrency(btc.market_cap)}.`,
        timestamp: 'Live',
        source: 'Bitcoin',
        url: 'https://www.coingecko.com/en/coins/bitcoin',
        type: btc.price_change_percentage_24h >= 0 ? 'bullish' : 'bearish',
        image: btc.image
      });
    }

    if (eth) {
      newsItems.push({
        id: 'eth-update',
        title: `Ξ Ethereum at ${formatCurrency(eth.current_price)}`,
        description: `Ethereum is ${eth.price_change_percentage_24h >= 0 ? 'gaining' : 'losing'} ${Math.abs(eth.price_change_percentage_24h).toFixed(2)}% today. The smart contract platform maintains strong developer activity and DeFi dominance.`,
        timestamp: 'Live',
        source: 'Ethereum',
        url: 'https://www.coingecko.com/en/coins/ethereum',
        type: eth.price_change_percentage_24h >= 0 ? 'bullish' : 'bearish',
        image: eth.image
      });
    }

    // Calculate total market stats
    const totalMarketCap = cryptoData.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const avgChange = cryptoData.reduce((sum, coin) => sum + (coin.price_change_percentage_24h || 0), 0) / cryptoData.length;

    newsItems.push({
      id: 'market-overview',
      title: `📊 Crypto Market Overview: ${avgChange >= 0 ? 'Bullish' : 'Bearish'} Day`,
      description: `The top ${cryptoData.length} cryptocurrencies have a combined market cap of ${formatCurrency(totalMarketCap)}. Average 24h change: ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%.`,
      timestamp: 'Market Summary',
      source: 'CripTik Analytics',
      type: avgChange >= 0 ? 'bullish' : 'bearish'
    });

    // Trending by volume
    const sortedByVolume = [...cryptoData].sort((a, b) => b.total_volume - a.total_volume);
    const topVolume = sortedByVolume[0];
    if (topVolume) {
      newsItems.push({
        id: 'volume-leader',
        title: `📈 ${topVolume.name} Leads in Trading Volume`,
        description: `${topVolume.name} has the highest 24h trading volume at ${formatCurrency(topVolume.total_volume)}, indicating strong market interest and liquidity.`,
        timestamp: 'Volume Alert',
        source: 'Market Data',
        url: `https://www.coingecko.com/en/coins/${topVolume.id}`,
        type: 'trending',
        image: topVolume.image
      });
    }

    return newsItems;
  };

  const fetchNews = async () => {
    setNewsLoading(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    // If we have crypto data, generate news from it
    if (cryptoData.length > 0) {
      const generatedNews = generateNewsFromCryptoData();
      setNews(generatedNews);
    } else {
      // If no crypto data yet, wait for it and try again
      setNews([
        {
          id: 'loading-hint',
          title: '⏳ Loading Market Data...',
          description: 'Please wait while we fetch the latest cryptocurrency data. The news will update automatically once data is available.',
          timestamp: 'Loading',
          source: 'System',
          type: 'market'
        }
      ]);
    }

    setNewsLoading(false);
  };


  const addToPortfolio = async (crypto, amount) => {
    try {
      // Add to backend
      await portfolioAPI.add({
        cryptoId: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        image: crypto.image,
        amount,
        purchasePrice: crypto.current_price,
        currentPrice: crypto.current_price,
      });

      // Update local state
      const existingItem = portfolio.find(item => item.id === crypto.id);
      if (existingItem) {
        setPortfolio(portfolio.map(item =>
          item.id === crypto.id
            ? { ...item, amount: item.amount + amount }
            : item
        ));
      } else {
        setPortfolio([...portfolio, {
          ...crypto,
          id: crypto.id,
          amount,
          purchasePrice: crypto.current_price,
          current_price: crypto.current_price,
        }]);
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      alert('Failed to add to portfolio. Please try again.');
    }
  };


  const removeFromPortfolio = async (cryptoId) => {
    try {
      // Find the item in portfolio
      const item = portfolio.find(p => p.id === cryptoId);
      if (item && item._id) {
        // Remove from backend
        await portfolioAPI.remove(item._id);
      }
      // Update local state
      setPortfolio(portfolio.filter(item => item.id !== cryptoId));
    } catch (error) {
      console.error('Error removing from portfolio:', error);
      alert('Failed to remove from portfolio. Please try again.');
    }
  };


  const calculateConversion = () => {
    const fromCrypto = cryptoData.find(crypto => crypto.id === convertFrom);
    const toCrypto = cryptoData.find(crypto => crypto.id === convertTo);

    if (fromCrypto && toCrypto) {
      const result = (convertAmount * fromCrypto.current_price) / toCrypto.current_price;
      setConversionResult(result);
    }
  };

  // Load user data on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
      loadPortfolio();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCryptoData();
  }, [currency]);

  // Auto-generate news when crypto data is loaded
  useEffect(() => {
    if (cryptoData.length > 0) {
      const generatedNews = generateNewsFromCryptoData();
      setNews(generatedNews);
    }
  }, [cryptoData]);

  useEffect(() => {
    if (selectedCrypto) {
      fetchChartData(selectedCrypto);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    calculateConversion();
  }, [convertFrom, convertTo, convertAmount, cryptoData]);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currency === 'usd' ? 'en-US' : 'en-IN', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };


  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };


  const portfolioValue = portfolio.reduce((total, item) => {
    return total + (item.current_price * item.amount);
  }, 0);


  const portfolioProfitLoss = portfolio.reduce((total, item) => {
    return total + ((item.current_price - item.purchasePrice) * item.amount);
  }, 0);

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-full"></div>
        <div className="flex-1">
          <div className="skeleton h-5 w-32 mb-2"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
        <div className="text-right">
          <div className="skeleton h-6 w-24 mb-2"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
      </div>
    </div>
  );

  /* 
     Move ThemeToggle definition up here so Navigation can use it.
     Fixes: ReferenceError: Cannot access 'ThemeToggle' before initialization
  */
  const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <button
        onClick={toggleTheme}
        className="btn-secondary p-3"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    );
  };

  // Clean Navigation Component - Matching Image Design
  const Navigation = () => (
    <nav className="nav-glass text-white sticky top-0 z-50 w-full">
      <div className="w-full max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-10 xl:px-16 py-8">
        <div className="w-full flex items-center justify-between gap-12">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-500/30">
              <img
                src="/logo.jpg"
                alt="CripTik Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-blue-400 truncate">CripTik</h1>
              <p className="text-sm text-gray-400 hidden sm:block">Real-time Crypto Tracker</p>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
              { id: 'stats', label: 'Stats', icon: Activity },
              { id: 'news', label: 'News', icon: Newspaper }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-btn flex items-center gap-2.5 px-6 py-3 text-base whitespace-nowrap ${
                  activeTab === id ? 'active' : ''
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>


          {/* Right: Controls */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Search Icon */}
            <button className="p-3 text-gray-400 hover:text-white transition-colors" title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            {/* Bell Icon */}
            <button className="p-3 text-gray-400 hover:text-white transition-colors" title="Notifications">
              <Bell size={20} />
            </button>

            {/* Theme Toggle with Coin Count */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="text-sm text-gray-400 hidden lg:inline">{cryptoData.length} coins</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchCryptoData}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Welcome and Logout */}
        <div className="flex items-center justify-end gap-8 mt-6 pt-6 border-t border-divider">
          {user && (
            <span className="text-sm text-gray-400">Welcome, {user.name}</span>
          )}
          <button
            onClick={() => setCurrency(prev => prev === 'usd' ? 'inr' : 'usd')}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            title="Toggle Currency"
          >
            {currency === 'usd' ? '$' : '₹'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5"
            title="Logout"
          >
            Logout
          </button>
        </div>

        {/* Mobile Navigation - Show below on small screens */}
        <div className="md:hidden w-full mt-3 pt-3 border-t border-divider">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
              { id: 'stats', label: 'Stats', icon: Activity },
              { id: 'news', label: 'News', icon: Newspaper }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-btn flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0 ${
                  activeTab === id ? 'active' : ''
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  const FavoritesPage = () => {
    const favoriteCoins = cryptoData.filter(coin => favorites.includes(coin.id));

    return (
      <div className="w-full">
        {favoriteCoins.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Star size={48} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No coins in watchlist</h3>
            <p className="text-sm text-gray-400 mb-6">Star coins on the home page to add them here</p>
            <button
              onClick={() => setActiveTab('home')}
              className="btn-primary"
            >
              Browse Coins
            </button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[60px_1fr_140px_120px_80px] gap-4 px-5 py-3 border-b border-divider bg-card">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">#</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Coin</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Price</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">24h</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Watch</div>
            </div>
            {favoriteCoins.map((crypto, index) => (
              <div key={crypto.id} className="coin-row">
                <div className="flex flex-col md:grid md:grid-cols-[60px_1fr_140px_120px_80px] md:gap-4 items-start md:items-center gap-3">
                  <div className="text-sm text-gray-400 font-medium hidden md:block">
                    {crypto.market_cap_rank || index + 1}
                  </div>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white truncate">{crypto.name}</h3>
                        <span className="text-xs text-gray-400 uppercase">{crypto.symbol}</span>
                      </div>
                      <div className="text-xs text-gray-400 md:hidden mt-0.5">
                        #{crypto.market_cap_rank || index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right md:text-right">
                    <div className="text-base font-medium text-white">
                      {formatCurrency(crypto.current_price)}
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">Price</div>
                  </div>
                  <div className="text-right md:text-right">
                    <div className={`text-base font-medium ${crypto.price_change_percentage_24h >= 0 ? 'price-up' : 'price-down'}`}>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">24h</div>
                  </div>
                  <div className="flex items-center justify-end md:justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(crypto.id);
                      }}
                      className="p-1.5 rounded transition-colors text-yellow-400"
                      title="Remove from watchlist"
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Clean table-like coin list - Matching Image Design
  const HomePage = () => (
    <div className="w-full">
      {loading ? (
        <div className="glass-card">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="coin-row">
              <div className="flex items-center gap-4">
                <div className="skeleton w-8 h-8 rounded-full"></div>
                <div className="skeleton h-4 w-32"></div>
                <div className="ml-auto skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[70px_1fr_180px_150px_110px] gap-8 px-8 py-6 border-b border-divider bg-card">
            <div className="text-base font-medium text-gray-400 uppercase tracking-wider">#</div>
            <div className="text-base font-medium text-gray-400 uppercase tracking-wider">Coin</div>
            <div className="text-base font-medium text-gray-400 uppercase tracking-wider text-right flex items-center justify-end gap-2">
              Price
              <svg width="12" height="12" viewBox="0 0 8 8" fill="currentColor" className="text-gray-500">
                <path d="M4 0L2 3H6L4 0Z" />
                <path d="M4 8L6 5H2L4 8Z" />
              </svg>
            </div>
            <div className="text-base font-medium text-gray-400 uppercase tracking-wider text-right flex items-center justify-end gap-2">
              24h %
              <svg width="12" height="12" viewBox="0 0 8 8" fill="currentColor" className="text-gray-500">
                <path d="M4 0L2 3H6L4 0Z" />
                <path d="M4 8L6 5H2L4 8Z" />
              </svg>
            </div>
            <div className="text-base font-medium text-gray-400 uppercase tracking-wider text-center">Actions</div>
          </div>

          {/* Coin Rows */}
          {cryptoData.slice(0, 50).map((crypto, index) => (
            <div
              key={crypto.id}
              className="coin-row"
            >
              <div className="flex flex-col md:grid md:grid-cols-[70px_1fr_180px_150px_110px] md:gap-8 items-start md:items-center gap-5">
                {/* Rank */}
                <div className="text-sm text-gray-400 font-normal hidden md:block">
                  {crypto.market_cap_rank || index + 1}
                </div>

                {/* Coin Info - Name above, Symbol below */}
                <div className="flex items-center gap-5 min-w-0 flex-1">
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-14 h-14 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">{crypto.name}</h3>
                    <div className="text-base text-gray-400 mt-1.5">
                      {crypto.symbol.toUpperCase()}
                      {crypto.market_cap_rank && ` #${crypto.market_cap_rank}`}
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">
                      #{crypto.market_cap_rank || index + 1}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right md:text-right">
                  <div className="text-xl font-medium text-white">
                    {formatCurrency(crypto.current_price)}
                  </div>
                  <div className="text-xs text-gray-400 md:hidden mt-0.5">Price</div>
                </div>

                {/* 24h Change with Arrow */}
                <div className="text-right md:text-right">
                  <div className={`text-xl font-medium flex items-center justify-end gap-2 ${crypto.price_change_percentage_24h >= 0 ? 'price-up' : crypto.price_change_percentage_24h < 0 ? 'price-down' : 'text-gray-400'}`}>
                    {crypto.price_change_percentage_24h > 0 && (
                      <span className="text-green-500 text-lg">▲</span>
                    )}
                    {crypto.price_change_percentage_24h < 0 && (
                      <span className="text-red-500 text-lg">▼</span>
                    )}
                    {crypto.price_change_percentage_24h >= 0 ? '' : ''}{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400 md:hidden mt-0.5">24h</div>
                </div>

                {/* Watchlist Button in Gray Box */}
                <div className="flex items-center justify-end md:justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(crypto.id);
                    }}
                    className={`w-12 h-12 flex items-center justify-center rounded transition-colors ${
                      favorites.includes(crypto.id)
                        ? 'bg-gray-700 text-yellow-400'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-yellow-400'
                    }`}
                    title={favorites.includes(crypto.id) ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    <Star size={20} fill={favorites.includes(crypto.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  // second page 
  const PortfolioPage = () => (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card p-5">
          <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Total Value</h3>
          <p className="text-2xl font-semibold text-white">
            {formatCurrency(portfolioValue)}
          </p>
        </div>
        <div className="stat-card p-5">
          <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Profit/Loss</h3>
          <p className={`text-2xl font-semibold ${portfolioProfitLoss >= 0 ? 'price-up' : 'price-down'}`}>
            {portfolioProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolioProfitLoss)}
          </p>
        </div>
        <div className="stat-card p-5">
          <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Holdings</h3>
          <p className="text-2xl font-semibold text-white">{portfolio.length} Assets</p>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-white mb-2">Your portfolio is empty</h3>
          <p className="text-sm text-gray-400 mb-6">Start building your crypto wealth by adding coins from the Home page</p>
          <button onClick={() => setActiveTab('home')} className="btn-primary">
            Explore Coins
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_140px_140px_80px] gap-4 px-5 py-3 border-b border-divider bg-card">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Amount</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Value</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">P/L</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Action</div>
          </div>
          {portfolio.map((item) => {
            const currentValue = item.current_price * item.amount;
            const purchaseValue = item.purchasePrice * item.amount;
            const profitLoss = currentValue - purchaseValue;
            const profitPercent = ((currentValue - purchaseValue) / purchaseValue) * 100;

            return (
              <div key={item.id} className="coin-row">
                <div className="flex flex-col md:grid md:grid-cols-[1fr_120px_140px_140px_80px] md:gap-4 items-start md:items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                        <span className="text-xs text-gray-400 uppercase">{item.symbol}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right md:text-right">
                    <div className="text-sm font-medium text-white">
                      {item.amount} {item.symbol.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">Amount</div>
                  </div>
                  <div className="text-right md:text-right">
                    <div className="text-base font-medium text-white">
                      {formatCurrency(currentValue)}
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">Value</div>
                  </div>
                  <div className="text-right md:text-right">
                    <div className={`text-base font-medium ${profitLoss >= 0 ? 'price-up' : 'price-down'}`}>
                      {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                    </div>
                    <div className={`text-xs ${profitLoss >= 0 ? 'price-up' : 'price-down'}`}>
                      ({profitPercent.toFixed(1)}%)
                    </div>
                    <div className="text-xs text-gray-400 md:hidden mt-0.5">P/L</div>
                  </div>
                  <div className="flex items-center justify-end md:justify-center">
                    <button
                      onClick={() => removeFromPortfolio(item.id)}
                      className="p-1.5 rounded transition-colors text-gray-400 hover:text-red-400"
                      title="Remove from portfolio"
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );


  const ChartsPage = () => (
    <div className="w-full">
      <div className="mb-6">
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="w-full sm:w-auto min-w-[250px] px-4 py-2.5 text-sm"
        >
          {cryptoData.slice(0, 20).map((crypto) => (
            <option key={crypto.id} value={crypto.id}>
              {crypto.name} ({crypto.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
      <div className="chart-container p-6">
        <h3 className="text-base font-medium text-white mb-6">7-Day Price History</h3>
        <div className="w-full" style={{ height: '450px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickMargin={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Price']}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="url(#colorGradient)"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#1e293b' }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );


  const ConvertPage = () => (
    <div className="w-full">
      <div className="glass-card p-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">From Currency</label>
            <select
              value={convertFrom}
              onChange={(e) => setConvertFrom(e.target.value)}
              className="w-full text-sm py-2.5 px-4"
            >
              {cryptoData.slice(0, 20).map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">To Currency</label>
            <select
              value={convertTo}
              onChange={(e) => setConvertTo(e.target.value)}
              className="w-full text-sm py-2.5 px-4"
            >
              {cryptoData.slice(0, 20).map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Amount to Convert</label>
          <input
            type="number"
            value={convertAmount}
            onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
            className="w-full text-lg py-3 px-4 font-medium"
            placeholder="Enter amount"
          />
        </div>

        <div className="text-center">
          <div className="bg-card rounded-lg p-6 border border-subtle">
            <p className="text-sm text-gray-400 mb-3">
              <span className="font-medium text-white">{convertAmount}</span> {cryptoData.find(c => c.id === convertFrom)?.symbol?.toUpperCase()} equals
            </p>
            <div className="text-3xl font-semibold text-white break-all">
              {conversionResult.toFixed(6)}
              <span className="text-xl ml-2 text-gray-400">{cryptoData.find(c => c.id === convertTo)?.symbol?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const NewsPage = () => (
    <div className="w-full">
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={fetchNews}
          disabled={newsLoading}
          className="btn-secondary flex items-center gap-2 text-sm px-3 py-1.5"
        >
          <RefreshCw size={16} className={newsLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{newsLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {newsLoading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-8">
              <div className="skeleton h-8 w-3/4 mb-4"></div>
              <div className="skeleton h-5 w-full mb-3"></div>
              <div className="skeleton h-5 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {news.map((article, index) => (
            <div
              key={article.id}
              className="glass-card p-5 group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-base font-medium text-white flex-1 leading-tight">
                  {article.title}
                </h3>
                {article.type === 'bullish' && <TrendingUp className="text-green-500 flex-shrink-0" size={20} />}
                {article.type === 'bearish' && <TrendingDown className="text-red-500 flex-shrink-0" size={20} />}
              </div>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{article.description}</p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <span className="text-gray-500 flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                  <span className="live-indicator"></span>
                  {article.timestamp}
                </span>
                {article.source && (
                  <span className="bg-slate-700/50 text-gray-300 px-3 py-1.5 rounded-full border border-slate-600/30">
                    {article.source}
                  </span>
                )}
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 ml-auto font-medium"
                  >
                    Read more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  // Check for reset password URL
  // We check this before login check so it can override it if needed
  const isResetPassword = typeof window !== 'undefined' && window.location.pathname.startsWith('/reset-password/');

  if (isResetPassword) {
    return <ResetPassword onLogin={() => {
      // Clear URL and go to login
      window.history.pushState({}, '', '/');
      setAuthView('login');
      // Force re-render if needed, but the URL change usually needs a reload or custom router
      // Since we are SPA without router, we rely on component mounting
      // ResetPassword component calls onLogin which we handle here
      window.location.href = '/';
    }} />;
  }



  if (!isLoggedIn) {
    if (authView === 'forgot') {
      return <ForgotPassword onBack={() => setAuthView('login')} />;
    }
    return <Login
      onLogin={handleLogin}
      onForgotPassword={() => setAuthView('forgot')}
    />;
  }

  return (
    <div className="min-h-screen gradient-bg w-full relative transition-colors duration-300">
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation />
        <main className="w-full fade-in-up flex-grow py-12">
          <div className="w-full max-w-[1920px] mx-auto px-8 sm:px-10 lg:px-12 xl:px-20 my-10">
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'favorites' && <FavoritesPage />}
            {activeTab === 'portfolio' && <PortfolioPage />}
            {activeTab === 'alerts' && <AlertsPage cryptoData={cryptoData} />}
            {activeTab === 'charts' && <ChartsPage />}
            {activeTab === 'stats' && <StatsPage cryptoData={cryptoData} formatCurrency={formatCurrency} />}
            {activeTab === 'convert' && <ConvertPage />}
            {activeTab === 'news' && <NewsPage />}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <CryptoTracker />
  </ThemeProvider>
);

export default App;
