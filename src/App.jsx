import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Minus, ArrowUpDown, Home, Briefcase, BarChart3, RefreshCw, Newspaper } from 'lucide-react';
import Login from './login';

const CryptoTracker = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cryptoData, setCryptoData] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [news, setNews] = useState([]);
  const [convertFrom, setConvertFrom] = useState('bitcoin');
  const [convertTo, setConvertTo] = useState('ethereum');
  const [convertAmount, setConvertAmount] = useState(1);
  const [conversionResult, setConversionResult] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'
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
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
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


  const fetchNews = () => {
    const mockNews = [
      {
        id: 1,
        title: "Bitcoin Reaches New All-Time High",
        description: "Bitcoin surpasses previous records as institutional adoption continues to grow.",
        timestamp: "2 hours ago"
      },
      {
        id: 2,
        title: "Ethereum Network Upgrade Successful",
        description: "Latest Ethereum upgrade improves transaction efficiency and reduces gas fees.",
        timestamp: "5 hours ago"
      },
      {
        id: 3,
        title: "Major Exchange Adds New Altcoins",
        description: "Popular cryptocurrency exchange expands its offerings with 15 new altcoins.",
        timestamp: "1 day ago"
      }
    ];
    setNews(mockNews);
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
    fetchNews();
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      fetchChartData(selectedCrypto);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    calculateConversion();
  }, [convertFrom, convertTo, convertAmount, cryptoData]);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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


  const Navigation = () => (
    <nav className="bg-gray-900 text-white p-4 sticky top-0 z-10 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold">CryptoTracker</h1>
          <button
            onClick={fetchCryptoData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 overflow-x-auto">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
            { id: 'charts', label: 'Charts', icon: BarChart3 },
            { id: 'convert', label: 'Convert', icon: ArrowUpDown },
            { id: 'news', label: 'News', icon: Newspaper }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                activeTab === id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );


  const HomePage = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Cryptocurrency Market</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {cryptoData.slice(0, 20).map((crypto) => (
            <div key={crypto.id} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img src={crypto.image} alt={crypto.name} className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold truncate">{crypto.name}</h3>
                    <p className="text-gray-600 uppercase text-sm">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="text-right">
                    <p className="text-lg sm:text-2xl font-bold">{formatCurrency(crypto.current_price)}</p>
                    <p className={`flex items-center gap-1 text-sm ${
                      crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {crypto.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToPortfolio(crypto, 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  const PortfolioPage = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">My Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-600 mb-2">Total Value</h3>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">{formatCurrency(portfolioValue)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-600 mb-2">Profit/Loss</h3>
          <p className={`text-xl sm:text-3xl font-bold ${portfolioProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(portfolioProfitLoss)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-600 mb-2">Holdings</h3>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{portfolio.length}</p>
        </div>
      </div>
      
      {portfolio.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg sm:text-xl text-gray-600">No holdings yet. Add some cryptocurrencies from the Home page!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {portfolio.map((item) => {
            const currentValue = item.current_price * item.amount;
            const purchaseValue = item.purchasePrice * item.amount;
            const profitLoss = currentValue - purchaseValue;
            
            return (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img src={item.image} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold truncate">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.amount} {item.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="text-right">
                      <p className="text-lg sm:text-2xl font-bold">{formatCurrency(currentValue)}</p>
                      <p className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profitLoss)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromPortfolio(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Minus size={16} />
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
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Price Charts</h2>
      <div className="mb-6">
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {cryptoData.slice(0, 20).map((crypto) => (
            <option key={crypto.id} value={crypto.id}>
              {crypto.name} ({crypto.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">7-Day Price History</h3>
        <div className="w-full" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
              <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );


  const ConvertPage = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Cryptocurrency Converter</h2>
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <select
              value={convertFrom}
              onChange={(e) => setConvertFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cryptoData.slice(0, 20).map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <select
              value={convertTo}
              onChange={(e) => setConvertTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={convertAmount}
            onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
        </div>
        
        <div className="text-center">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm sm:text-lg">
              <span className="font-semibold">{convertAmount}</span> {cryptoData.find(c => c.id === convertFrom)?.symbol?.toUpperCase()} = 
            </p>
            <p className="text-xl sm:text-3xl font-bold text-blue-600 break-all">
              {conversionResult.toFixed(6)} {cryptoData.find(c => c.id === convertTo)?.symbol?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );


  const NewsPage = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Cryptocurrency News</h2>
      <div className="grid gap-4 sm:gap-6">
        {news.map((article) => (
          <div key={article.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{article.title}</h3>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">{article.description}</p>
            <p className="text-xs sm:text-sm text-gray-500">{article.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <Navigation />
      <div className="w-full">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'portfolio' && <PortfolioPage />}
        {activeTab === 'charts' && <ChartsPage />}
        {activeTab === 'convert' && <ConvertPage />}
        {activeTab === 'news' && <NewsPage />}
      </div>
    </div>
  );
};

export default CryptoTracker;