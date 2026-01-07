import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Minus, ArrowUpDown, Home, Briefcase, BarChart3, RefreshCw, Newspaper, Star, Globe, Github } from 'lucide-react';
import Login from './login';
import Footer from './Footer';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [conversionResult, setConversionResult] = useState(0);
  const [currency, setCurrency] = useState('usd');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
      );
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchChartData = async (coinId) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=7`
      );
      const data = await response.json();
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


  const addToPortfolio = (crypto, amount) => {
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
        amount,
        purchasePrice: crypto.current_price
      }]);
    }
  };


  const removeFromPortfolio = (cryptoId) => {
    setPortfolio(portfolio.filter(item => item.id !== cryptoId));
  };


  const calculateConversion = () => {
    const fromCrypto = cryptoData.find(crypto => crypto.id === convertFrom);
    const toCrypto = cryptoData.find(crypto => crypto.id === convertTo);

    if (fromCrypto && toCrypto) {
      const result = (convertAmount * fromCrypto.current_price) / toCrypto.current_price;
      setConversionResult(result);
    }
  };

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

  // yha se ui start
  const Navigation = () => (
    <nav className="nav-glass text-white shadow-xl p-6 md:p-8 sticky top-0 z-20 w-full mb-10">
      <div className="w-full px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-lg hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-blue-500/30 hover:border-blue-400 float-animation">
              <img
                src="/logo.jpg"
                alt="CripTik Logo"
                className="w-full h-full object-cover scale-[1.4]"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">CripTik</h1>
              <p className="text-sm text-gray-400 hidden sm:block mt-1">Real-time Crypto Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrency(prev => prev === 'usd' ? 'inr' : 'usd')}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white px-4 py-2 rounded-full border border-slate-700 transition-all"
              title="Toggle Currency"
            >
              <span className={`font-bold ${currency === 'usd' ? 'text-blue-400' : 'text-gray-500'}`}>$</span>
              <span className="text-gray-600">/</span>
              <span className={`font-bold ${currency === 'inr' ? 'text-blue-400' : 'text-gray-500'}`}>₹</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
              <span className="live-indicator"></span>
              <span className="hidden sm:inline">Live Updates</span>
            </div>
            <button
              onClick={fetchCryptoData}
              className="btn-primary flex items-center gap-2 text-base px-6 py-3 font-semibold"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'favorites', label: 'Favorites', icon: Star },
          { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
          { id: 'charts', label: 'Charts', icon: BarChart3 },
          { id: 'convert', label: 'Convert', icon: ArrowUpDown },
          { id: 'news', label: 'News', icon: Newspaper }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-btn flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all whitespace-nowrap shadow-lg flex-1 sm:flex-none justify-center ${activeTab === id
              ? 'active text-white scale-105 shadow-blue-500/20'
              : 'bg-slate-800/40 hover:bg-slate-700/60 text-gray-400 hover:text-white border border-slate-700/30 hover:border-slate-600'
              }`}
          >
            <Icon size={24} />
            <span className="">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );

  const FavoritesPage = () => {
    const favoriteCoins = cryptoData.filter(coin => favorites.includes(coin.id));

    return (
      <div className="w-full px-4 sm:px-8 py-4">
        {favoriteCoins.length === 0 ? (
          <div className="mt-20 text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h3>
            <p className="text-gray-400 text-lg">Star coins on the home page to add them here!</p>
            <button
              onClick={() => setActiveTab('home')}
              className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
            >
              Browse Coins
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {favoriteCoins.map((crypto, index) => (
              <div
                key={crypto.id}
                className="glass-card p-6"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="coin-img w-16 h-16"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{crypto.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded bg-slate-700/50 text-xs font-mono text-gray-300 uppercase">{crypto.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-8 ml-auto">
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{formatCurrency(crypto.current_price)}</p>
                      <div className="flex justify-end mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${crypto.price_change_percentage_24h >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {crypto.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(crypto.id);
                      }}
                      className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-yellow-400 transition-all border border-slate-700 hover:scale-110"
                    >
                      <Star size={24} fill="currentColor" />
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

  // first page
  const HomePage = () => (
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
          <span className="live-indicator"></span>
          <span>{cryptoData.length} coins loaded</span>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {cryptoData.slice(0, 20).map((crypto, index) => (
            <div
              key={crypto.id}
              className="glass-card p-6 group hover:translate-x-1 transition-transform"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="relative">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="coin-img w-16 h-16"
                    />
                    <span className="absolute -top-2 -left-2 bg-slate-700 text-xs text-gray-300 w-6 h-6 rounded-full flex items-center justify-center font-bold border border-slate-600 shadow-lg">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">{crypto.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-700/50 text-xs font-mono text-gray-300 uppercase">{crypto.symbol}</span>
                      <span className="text-gray-500 text-sm">Rank #{crypto.market_cap_rank}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-8 ml-auto">
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{formatCurrency(crypto.current_price)}</p>
                    <div className="flex justify-end mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${crypto.price_change_percentage_24h >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {crypto.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToPortfolio(crypto, 1);
                      }}
                      className="btn-primary p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40"
                      title="Add to Portfolio"
                    >
                      <Plus size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(crypto.id);
                      }}
                      className={`p-3 rounded-full transition-all border hover:scale-110 ${favorites.includes(crypto.id)
                        ? 'bg-slate-800/80 text-yellow-400 border-yellow-500/30'
                        : 'bg-slate-800/50 text-gray-400 border-slate-700 hover:text-yellow-400 hover:border-yellow-500/50'
                        }`}
                      title={favorites.includes(crypto.id) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star size={24} fill={favorites.includes(crypto.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
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
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10">
        <div className="stat-card p-8">
          <h3 className="text-base font-medium text-gray-400 mb-3">Total Value</h3>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {formatCurrency(portfolioValue)}
          </p>
        </div>
        <div className="stat-card p-8">
          <h3 className="text-base font-medium text-gray-400 mb-3">Profit/Loss</h3>
          <p className={`text-3xl sm:text-4xl font-bold ${portfolioProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {portfolioProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolioProfitLoss)}
          </p>
        </div>
        <div className="stat-card p-8">
          <h3 className="text-base font-medium text-gray-400 mb-3">Holdings</h3>
          <p className="text-3xl sm:text-4xl font-bold text-white">{portfolio.length} Assets</p>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="glass-card text-center py-20 px-4">
          <div className="text-7xl mb-6 bounce-animation">📊</div>
          <h3 className="text-2xl font-bold text-white mb-3">Your portfolio is empty</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">Start building your crypto wealth by adding coins from the Home page.</p>
          <button onClick={() => setActiveTab('home')} className="btn-primary px-8 py-3 text-lg">
            Explore Coins
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {portfolio.map((item) => {
            const currentValue = item.current_price * item.amount;
            const purchaseValue = item.purchasePrice * item.amount;
            const profitLoss = currentValue - purchaseValue;
            const profitPercent = ((currentValue - purchaseValue) / purchaseValue) * 100;

            return (
              <div key={item.id} className="glass-card p-6 sm:p-8 group hover:border-blue-500/30 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <img src={item.image} alt={item.name} className="coin-img w-16 h-16" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">{item.name}</h3>
                      <p className="text-gray-400 font-medium">{item.amount} {item.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-8 ml-auto">
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{formatCurrency(currentValue)}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${profitLoss >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitPercent.toFixed(1)}%)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromPortfolio(item.id)}
                      className="bg-red-500/10 hover:bg-red-500/30 text-red-400 p-4 rounded-xl transition-all hover:scale-105"
                      title="Remove from portfolio"
                    >
                      <Minus size={20} />
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
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="mb-8">
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="w-full sm:w-auto px-6 py-3 text-lg"
        >
          {cryptoData.slice(0, 20).map((crypto) => (
            <option key={crypto.id} value={crypto.id}>
              {crypto.name} ({crypto.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
      <div className="chart-container p-6 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">7-Day Price History</h3>
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
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="glass-card p-8 sm:p-12 max-w-3xl mx-auto relative overflow-hidden mt-8">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-10 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">From Currency</label>
            <select
              value={convertFrom}
              onChange={(e) => setConvertFrom(e.target.value)}
              className="w-full text-lg py-3 px-4"
            >
              {cryptoData.slice(0, 20).map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">To Currency</label>
            <select
              value={convertTo}
              onChange={(e) => setConvertTo(e.target.value)}
              className="w-full text-lg py-3 px-4"
            >
              {cryptoData.slice(0, 20).map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-10 relative z-10">
          <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Amount to Convert</label>
          <input
            type="number"
            value={convertAmount}
            onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
            className="w-full text-2xl py-4 px-6 font-bold"
            placeholder="Enter amount"
          />
        </div>

        <div className="text-center relative z-10">
          <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
            <p className="text-lg text-gray-400 mb-2">
              <span className="font-semibold text-white">{convertAmount}</span> {cryptoData.find(c => c.id === convertFrom)?.symbol?.toUpperCase()} equals
            </p>
            <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent break-all py-2">
              {conversionResult.toFixed(6)}
              <span className="text-2xl sm:text-3xl ml-2 text-white opacity-80">{cryptoData.find(c => c.id === convertTo)?.symbol?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const NewsPage = () => (
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="flex justify-end mb-6">
        <button
          onClick={fetchNews}
          disabled={newsLoading}
          className="btn-primary flex items-center gap-2 text-sm px-6 py-3"
        >
          <RefreshCw size={18} className={newsLoading ? 'animate-spin' : ''} />
          {newsLoading ? 'Refreshing...' : 'Refresh News'}
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
        <div className="grid gap-6 sm:gap-8">
          {news.map((article, index) => (
            <div
              key={article.id}
              className={`glass-card p-6 sm:p-8 group hover:border-blue-500/30 transition-all ${article.type === 'bullish' ? 'news-bullish' :
                article.type === 'bearish' ? 'news-bearish' :
                  article.type === 'trending' ? 'news-trending' :
                    article.type === 'market' ? 'news-market' :
                      ''
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex-1 group-hover:text-blue-400 transition-colors leading-tight">
                  {article.title}
                </h3>
                {article.type === 'bullish' && <TrendingUp className="text-emerald-400 flex-shrink-0 float-animation" size={28} />}
                {article.type === 'bearish' && <TrendingDown className="text-red-400 flex-shrink-0" size={28} />}
              </div>
              <p className="text-gray-400 mb-6 text-base sm:text-lg leading-relaxed">{article.description}</p>
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
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen gradient-bg w-full relative">
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation />
        <main className="w-full fade-in-up flex-grow">
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'favorites' && <FavoritesPage />}
          {activeTab === 'portfolio' && <PortfolioPage />}
          {activeTab === 'charts' && <ChartsPage />}
          {activeTab === 'convert' && <ConvertPage />}
          {activeTab === 'news' && <NewsPage />}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CryptoTracker;
