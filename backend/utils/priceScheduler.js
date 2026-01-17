import cron from 'node-cron';
import axios from 'axios';
import Alert from '../models/Alert.js';
import { sendEmail } from './emailService.js';

// Map to store current prices to avoid fetching for every single alert
let priceCache = {};
let lastFetch = 0;
const CACHE_DURATION = 55 * 1000; // 55 seconds (slightly less than cron interval)

const getPrices = async (ids) => {
    const now = Date.now();
    if (now - lastFetch < CACHE_DURATION && Object.keys(priceCache).length > 0) {
        return priceCache;
    }

    try {
        const { data } = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`
        );
        priceCache = data;
        lastFetch = now;
        return data;
    } catch (error) {
        console.error('Error fetching prices for alerts:', error.message);
        return null;
    }
};

const checkAlerts = async () => {
    console.log('⏰ Running Price Alert Check...');

    try {
        // Find all active, non-triggered alerts
        const activeAlerts = await Alert.find({ isActive: true, isTriggered: false }).populate('user');

        if (activeAlerts.length === 0) {
            console.log('No active alerts to check.');
            return;
        }

        // Get unique crypto IDs to fetch
        const cryptoIds = [...new Set(activeAlerts.map(alert => alert.cryptoId))];

        // Fetch current prices
        const prices = await getPrices(cryptoIds);

        if (!prices) {
            console.log('Skipping alert check due to price fetch failure.');
            return;
        }

        let triggeredCount = 0;

        for (const alert of activeAlerts) {
            const currentPriceData = prices[alert.cryptoId];
            if (!currentPriceData) continue;

            const currentPrice = currentPriceData.usd;
            let triggered = false;

            if (alert.alertType === 'above' && currentPrice >= alert.targetPrice) {
                triggered = true;
            } else if (alert.alertType === 'below' && currentPrice <= alert.targetPrice) {
                triggered = true;
            }

            if (triggered) {
                console.log(`🔔 ALERT TRIGGERED: ${alert.cryptoName} is ${currentPrice} (${alert.alertType} ${alert.targetPrice})`);

                // Mark as triggered/email sent
                alert.isTriggered = true;
                alert.triggeredAt = Date.now();
                alert.currentPrice = currentPrice;
                alert.isActive = false; // Disable after triggering (one-time alert)

                await alert.save();

                // Send Email
                if (alert.user && alert.user.email) {
                    try {
                        await sendEmail({
                            email: alert.user.email,
                            subject: `Price Alert: ${alert.cryptoName} Hit Target!`,
                            message: `${alert.cryptoName} (${alert.cryptoSymbol.toUpperCase()}) has reached your target price of $${alert.targetPrice}.\nCurrent Price: $${currentPrice}`,
                            html: `
                                <h1>🚀 Price Alert Triggered!</h1>
                                <p><strong>${alert.cryptoName}</strong> (${alert.cryptoSymbol.toUpperCase()}) has reached your target price.</p>
                                <ul>
                                    <li><strong>Target Price:</strong> $${alert.targetPrice}</li>
                                    <li><strong>Current Price:</strong> $${currentPrice}</li>
                                    <li><strong>Condition:</strong> ${alert.alertType}</li>
                                </ul>
                                <p>Login to CripTik to set more alerts!</p>
                            `
                        });
                        alert.emailSent = true;
                        // Use deleteOne() to remove the alert from the database after triggering
                        await Alert.deleteOne({ _id: alert._id });
                        console.log(`Alert deleted for ${alert.cryptoName}`);
                    } catch (emailErr) {
                        console.error('Failed to send alert email:', emailErr);
                    }
                }

                triggeredCount++;
            }
        }

        console.log(`✅ Checked ${activeAlerts.length} alerts. Triggered: ${triggeredCount}`);

    } catch (error) {
        console.error('Error in alert scheduler:', error);
    }
};

export const startPriceScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', () => {
        checkAlerts();
    });
    console.log('🚀 Price Alert Scheduler Started (Runs every minute)');
};
