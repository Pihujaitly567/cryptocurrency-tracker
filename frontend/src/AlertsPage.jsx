import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { alertsAPI, cryptoAPI } from './api/client';

const AlertsPage = ({ cryptoData }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCrypto, setSelectedCrypto] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [alertType, setAlertType] = useState('above'); // 'above' or 'below'
    const [error, setError] = useState('');

    // Load alerts on mount
    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await alertsAPI.getAll();
            setAlerts(data);
        } catch (err) {
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await alertsAPI.remove(id);
            setAlerts(alerts.filter(a => a._id !== id));
        } catch (err) {
            console.error('Error deleting alert:', err);
        }
    };

    const handleAddAlert = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedCrypto || !targetPrice) {
            setError('Please select a coin and set a target price.');
            return;
        }

        const coin = cryptoData.find(c => c.id === selectedCrypto);
        if (!coin) {
            setError('Invalid coin selected.');
            return;
        }

        try {
            const newAlert = await alertsAPI.add({
                cryptoId: coin.id,
                cryptoName: coin.name,
                cryptoSymbol: coin.symbol,
                targetPrice: parseFloat(targetPrice),
                alertType
            });

            setAlerts([newAlert, ...alerts]);
            setIsAdding(false);
            setTargetPrice('');
            setSelectedCrypto('');
        } catch (err) {
            console.error('Error adding alert:', err);
            setError('Failed to create alert. Please try again.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="w-full px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="text-yellow-400" />
                        Price Alerts
                    </h2>
                    <p className="text-gray-400 mt-2">Get notified via email when coins hit your target price.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary flex items-center gap-2 px-6 py-3 font-semibold rounded-xl"
                >
                    {isAdding ? 'Cancel' : (
                        <>
                            <Plus size={20} />
                            New Alert
                        </>
                    )}
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 mb-8 animate-fade-in border border-blue-500/30 shadow-lg shadow-blue-500/10">
                    <h3 className="text-xl font-bold text-white mb-6">Create New Alert</h3>
                    {error && <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

                    <form onSubmit={handleAddAlert} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-gray-400 text-sm font-semibold mb-2">Select Coin</label>
                            <select
                                value={selectedCrypto}
                                onChange={(e) => setSelectedCrypto(e.target.value)}
                                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-medium"
                            >
                                <option value="">Choose a coin...</option>
                                {cryptoData.slice(0, 50).map(coin => (
                                    <option key={coin.id} value={coin.id}>
                                        {coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-gray-400 text-sm font-semibold mb-2">Condition</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAlertType('above')}
                                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${alertType === 'above'
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                            : 'bg-slate-900/50 border-slate-700/50 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    <TrendingUp size={18} /> Above
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAlertType('below')}
                                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${alertType === 'below'
                                            ? 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'bg-slate-900/50 border-slate-700/50 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    <TrendingDown size={18} /> Below
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-gray-400 text-sm font-semibold mb-2">Target Price ($)</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <button
                                type="submit"
                                className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
                            >
                                Set Alert
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your alerts...</p>
                </div>
            ) : alerts.length === 0 ? (
                <div className="glass-card text-center py-20 px-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Active Alerts</h3>
                    <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">Create an alert to track market moves while you sleep.</p>
                    <button onClick={() => setIsAdding(true)} className="btn-primary px-8 py-3 text-lg">
                        Create Your First Alert
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {alerts.map((alert) => (
                        <div key={alert._id} className={`glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all ${alert.isTriggered ? 'opacity-75 grayscale' : ''}`}>
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alert.alertType === 'above' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {alert.alertType === 'above' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {alert.cryptoName}
                                        <span className="text-sm font-normal text-gray-400 bg-slate-800 px-2 py-0.5 rounded uppercase">{alert.cryptoSymbol}</span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-gray-300">
                                        <span>Target: <span className="text-white font-bold">{formatCurrency(alert.targetPrice)}</span></span>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-sm">
                                            Condition: {alert.alertType === 'above' ? 'Above' : 'Below'}
                                        </span>
                                    </div>
                                    {alert.isTriggered && (
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm mt-2 font-bold">
                                            <AlertTriangle size={14} /> Triggered at {formatCurrency(alert.currentPrice)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(alert._id)}
                                className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                title="Delete Alert"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlertsPage;
