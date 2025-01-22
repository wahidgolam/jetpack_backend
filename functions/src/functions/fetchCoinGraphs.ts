import { onRequest } from "firebase-functions/v2/https";
import * as dotenv from 'dotenv';
import * as admin from "firebase-admin";
import axios from 'axios';
// Load environment variables from .env file
dotenv.config();

interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
}

interface GraphData {
  price: number[][];
  market_cap: number[][];
}

const TIMEFRAMES = ['24h', '7d', '1m', '1y'] as const;
const DAYS_MAP = {
  '24h': '1',
  '7d': '7',
  '1m': '30',
  '1y': '365'
};

export const fetchCoinGraphs = onRequest(async (req, res) => {
  try {
    // Get all tokens from Firestore
    const tokensSnapshot = await admin.firestore().collection('tokens').get();
    const tokens = tokensSnapshot.docs.map(doc => ({
      geckoId: doc.data().geckoid
    }));

    for (const token of tokens) {
      const graphData: Record<string, GraphData> = {};

      // Fetch data for each timeframe
      for (const timeframe of TIMEFRAMES) {
        const response = await axios.get<MarketChartData>(
          `https://api.coingecko.com/api/v3/coins/${token.geckoId}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: DAYS_MAP[timeframe]
            },
            headers: {
              'accept': 'application/json',
              'x-cg-demo-api-key': process.env.COINGECKO_API_KEY // Use the environment variable
            }
          }
        );

        graphData[timeframe] = {
          price: response.data.prices,
          market_cap: response.data.market_caps,
        };

        // Calculate 4h data from 24h data
        if (timeframe === '24h') {
          const fourHourData = extract4HourData(response.data);
          graphData['4h'] = fourHourData;
        }
      }

      // Update Realtime Database
      await admin.database().ref(`coinDetails/${token.geckoId}/graphs`).set(graphData);
    }

    res.status(200).json({ message: 'Graph data updated successfully' });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
});

function extract4HourData(data: MarketChartData): GraphData {
  // Get last 4 hours of data from 24h data
  const last4Hours = Math.floor(data.prices.length * (4/24));
  
  return {
    price: data.prices.slice(-last4Hours),
    market_cap: data.market_caps.slice(-last4Hours)
  };
} 