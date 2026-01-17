import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';
import SentimentMeter from './SentimentMeter';

const StatsPage = ({ cryptoData, formatCurrency }) => {
    // Helpers derived from cryptoData
    const totalMarketCap = cryptoData.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const totalVolume = cryptoData.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
    const topGainer = [...cryptoData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0];
    const topLoser = [...cryptoData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)[0];

    return (
        <div className="w-full px-6 sm:px-12 py-10">

            <h2 className="text-2xl font-bold text-white mb-14 flex items-center gap-2">

                <Activity className="text-blue-400" />
                Market Statistics
            </h2>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14 mb-12">


                {/* Card 1: Market Overview */}
                <div className="glass-card p-8 flex flex-col justify-between h-full group hover:border-blue-500/30 transition-all">

                    <div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Global Market Cap</h3>
                        <p className="text-3xl font-bold text-white tracking-tight">
                            {formatCurrency(totalMarketCap)}
                        </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">24h Volume</span>
                            <span className="text-sm font-medium text-gray-300">{formatCurrency(totalVolume)}</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: AI Sentiment (Center Stage) */}
                <SentimentMeter cryptoData={cryptoData} />

                {/* Card 3: Top Movers */}
                <div className="glass-card p-8 flex flex-col justify-between h-full group hover:border-purple-500/30 transition-all">

                    <h3 className="text-gray-400 text-sm font-medium mb-4">24h Top Movers</h3>

                    {topGainer && (
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img src={topGainer.image} alt={topGainer.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-bold text-white">{topGainer.name}</p>
                                    <p className="text-xs text-gray-500">{topGainer.symbol.toUpperCase()}</p>
                                </div>
                            </div>
                            <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                +{topGainer.price_change_percentage_24h.toFixed(2)}%
                            </span>
                        </div>
                    )}

                    {topLoser && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={topLoser.image} alt={topLoser.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-bold text-white">{topLoser.name}</p>
                                    <p className="text-xs text-gray-500">{topLoser.symbol.toUpperCase()}</p>
                                </div>
                            </div>
                            <span className="text-red-400 font-bold text-sm bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                {topLoser.price_change_percentage_24h.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Secondary Details (Placeholder for future charts/expansion) */}
            <div className="glass-card p-8 text-center border-dashed border-2 border-slate-700/50">
                <BarChart3 className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-500">Detailed market analytics and historical charts coming soon.</p>
            </div>

        </div>
    );
};

export default StatsPage;
