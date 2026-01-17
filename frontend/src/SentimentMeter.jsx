import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';

const SentimentMeter = ({ cryptoData }) => {
    const [sentimentScore, setSentimentScore] = useState(50);
    const [sentimentLabel, setSentimentLabel] = useState('Neutral');
    const [analyzing, setAnalyzing] = useState(true);

    useEffect(() => {
        if (cryptoData && cryptoData.length > 0) {
            analyzeMarket(cryptoData);
        }
    }, [cryptoData]);

    const analyzeMarket = (data) => {
        setAnalyzing(true);

        // Simulate complex AI analysis delay
        setTimeout(() => {
            let score = 50;

            // 1. Market Breadth (Gainers vs Losers)
            const gainers = data.filter(c => c.price_change_percentage_24h > 0).length;
            const breadthScore = (gainers / data.length) * 100;

            // 2. Trend Strength (Average Change)
            const avgChange = data.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / data.length;
            const trendScore = 50 + (avgChange * 5); // Amplify small percentages

            // 3. Market Leader (BTC) Influence
            const btc = data.find(c => c.id === 'bitcoin');
            let btcScore = 50;
            if (btc) {
                btcScore = 50 + (btc.price_change_percentage_24h * 2);
            }

            // Weighted Calculation
            score = (breadthScore * 0.4) + (trendScore * 0.3) + (btcScore * 0.3);

            // Clamp between 0-100
            score = Math.max(0, Math.min(100, score));

            setSentimentScore(Math.round(score));
            setSentimentLabel(getLabel(score));
            setAnalyzing(false);
        }, 1500);
    };

    const getLabel = (score) => {
        if (score >= 75) return 'Extreme Greed';
        if (score >= 60) return 'Greed';
        if (score >= 40) return 'Neutral';
        if (score >= 25) return 'Fear';
        return 'Extreme Fear';
    };

    const getColor = (score) => {
        if (score >= 60) return 'text-emerald-400';
        if (score >= 40) return 'text-blue-400';
        return 'text-red-400';
    };

    const getBgColor = (score) => {
        if (score >= 60) return 'bg-emerald-500';
        if (score >= 40) return 'bg-blue-500';
        return 'bg-red-500';
    };

    return (
        <div className="glass-card p-8 relative overflow-hidden h-full flex flex-col justify-between group hover:border-blue-500/30 transition-all">

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium">AI Sentiment</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <BrainCircuit size={16} className="text-purple-400" />
                        <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">BETA</span>
                    </div>
                </div>
                {!analyzing && (
                    <div className={`text-2xl font-bold ${getColor(sentimentScore)}`}>
                        {sentimentScore}
                    </div>
                )}
            </div>

            <div className="relative">
                {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-2 space-y-2">
                        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-purple-300/70 font-mono animate-pulse">Analyzing...</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className={`text-lg font-bold ${getColor(sentimentScore)}`}>
                                {sentimentLabel}
                            </span>
                        </div>

                        {/* Minimalist Gauge Bar */}
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full relative">
                            <div
                                className={`h-full absolute left-0 top-0 transition-all duration-1000 ${getBgColor(sentimentScore)}`}
                                style={{ width: `${sentimentScore}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentimentMeter;
