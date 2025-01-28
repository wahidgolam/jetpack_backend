import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const db = admin.firestore();
const rtdb = admin.database();

// Configuration for live graph
const LIVE_GRAPH_MAX_LENGTH = 100; // You can adjust this value

// Change the function to be HTTP triggered for testing

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Add MongoDB connection function
async function getMongoClient() {
  const client = new MongoClient(mongoUri as string);
  await client.connect();
  return client;
}

exports.fetchCoinMarketData = onRequest(async (req, res) => {

    if (req.method !== 'GET') {
        res.status(405).json({
            error: {
                code: 405,
                message: 'Method Not Allowed'
            }
        });
        return;
    }

    try {
        // Step 1: Fetch all tokens from Firestore
        const tokensSnapshot = await db.collection('tokens').get();
        const geckoIds: string[] = [];

        tokensSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.geckoid) {
                geckoIds.push(data.geckoid);
            }
        });

        if (geckoIds.length === 0) {
            console.log('No geckoIds found.');
            res.status(404).json({
                message: 'No geckoIds found'
            });
            return;
        }

        // Create a comma-separated string of geckoIds
        const geckoIdsString = geckoIds.join(',');

        // Step 2: Call CoinGecko API
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
            params: {
                vs_currency: 'usd',
                ids: geckoIdsString,
                price_change_percentage: '1h,24h,7d,30d,1y',
                locale: 'en',
                precision: 'full'
            },
            headers: {
                'accept': 'application/json',
                'x-cg-demo-api-key': 'CG-fLaeU6PeaY5gSKuVNeUyL7Vs'
            }
        });

        const coinDetails = response.data;

        // Step 3: Store coin details and update live graphs in Realtime Database
        const updates: { [key: string]: any } = {};
        const currentTimestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

        for (const coin of coinDetails) {
            const { current_price, market_cap } = coin;
            const { id, symbol, name, image, ...filteredCoin } = coin;
            
            // Update market data
            updates[`/coinDetails/${id}/marketData`] = filteredCoin;

            // Fetch current live graph data
            const livePricesSnapshot = await rtdb.ref(`/coinDetails/${id}/graphs/live/prices`).once('value');
            const liveMarketCapsSnapshot = await rtdb.ref(`/coinDetails/${id}/graphs/live/market_caps`).once('value');
            
            let prices = livePricesSnapshot.val() || [];
            let marketCaps = liveMarketCapsSnapshot.val() || [];

            // Add new data points
            const newPrice = {
                timestamp: currentTimestamp,
                price: current_price
            };
            const newMarketCap = {
                timestamp: currentTimestamp,
                market_cap: market_cap
            };
            
            prices.push(newPrice);
            marketCaps.push(newMarketCap);

            // Trim arrays to maintain maximum length
            if (prices.length > LIVE_GRAPH_MAX_LENGTH) {
                prices = prices.slice(-LIVE_GRAPH_MAX_LENGTH);
            }
            if (marketCaps.length > LIVE_GRAPH_MAX_LENGTH) {
                marketCaps = marketCaps.slice(-LIVE_GRAPH_MAX_LENGTH);
            }

            // Add to RTDB updates
            updates[`/coinDetails/${id}/graphs/live/prices`] = prices;
            updates[`/coinDetails/${id}/graphs/live/market_caps`] = marketCaps;

            // Update MongoDB
            try {
                const mongoClient = await getMongoClient();
                const db = mongoClient.db('jetpack');
                await db.collection('coinDetails').updateOne(
                    { id },
                    {
                        $set: {
                            marketData: filteredCoin,
                            'graphs.live.prices': prices,
                            'graphs.live.market_caps': marketCaps
                        }
                    },
                    { upsert: true }
                );
                await mongoClient.close();
            } catch (error) {
                console.error(`Error updating MongoDB for ${id}:`, error);
            }
        }

        await rtdb.ref().update(updates);

        console.log('Coin details and live graphs updated successfully.');
        res.status(200).json({
            message: 'Coin details and live graphs updated successfully'
        });
    } catch (error: any) {
        console.error('Error fetching coin details:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});
