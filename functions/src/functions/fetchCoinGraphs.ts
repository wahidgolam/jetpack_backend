import { onRequest } from "firebase-functions/v2/https";
import * as dotenv from 'dotenv';
import * as admin from "firebase-admin";
import axios from 'axios';
import { MongoClient } from 'mongodb';

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

exports.fetchCoinGraphs = onRequest(async (req, res) => {
  
  try { 

    const { token, timeframe } = req.body;
    // Validate required timeframe parameter
    // if (!req.body.timeframe) {
    //   res.status(400).send({ error: 'timeframe parameter is required' });
    // }
    // if (!req.body.token) {
    //   res.status(400).send({ error: 'token parameter is required' });
    // }
    // if (!TIMEFRAMES.includes(req.body.timeframe)) {
    //   res.status(400).send({ error: 'Invalid timeframe. Must be one of: ' + TIMEFRAMES.join(', ') });
    // }
    // Check if specific geckoid is provided in request body

    const graphData: Record<string, GraphData> = {};
    // Fetch data for each timeframe
    const response = await axios.get<MarketChartData>(
      `https://api.coingecko.com/api/v3/coins/${token}/market_chart`,
      {
         params: {
          vs_currency: 'usd',
           days: DAYS_MAP[timeframe as keyof typeof DAYS_MAP]
        },
        headers: {
          'accept': 'application/json',
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        }
      }
    );

    graphData[timeframe] = {
      price: response.data.prices,
      market_cap: response.data.market_caps,
    };

    await admin.database().ref(`coinDetails/${token}/graphs/${timeframe}`).set(graphData[timeframe]);

    // Calculate 4h data only if we're fetching 24h data
    if (timeframe === '24h') {
      const fourHourData = extract4HourData(response.data);        
      graphData['4h'] = fourHourData;
       // Update Realtime Database
      await admin.database().ref(`coinDetails/${token}/graphs/4h`).set(graphData['4h']);
    }

    // Update MongoDB
    try {
      const mongoClient = await getMongoClient();
      const db = mongoClient.db('jetpack');
      if(timeframe as string == '24h'){
        await db.collection('coinDetails').updateOne(
            { id: token },
            {
                $set: {
                    'metadata.graphs.24h': graphData[timeframe],
                }
            },
            { upsert: true }
        );
      }
      else if(timeframe as string == '1m'){
        await db.collection('coinDetails').updateOne(
            { id:token },
            {
                $set: {
                    'metadata.graphs.1m': graphData[timeframe],
                }
            },
            { upsert: true }
        );
      }
      await mongoClient.close();
    } catch (error:any) {
      console.error(`Error updating MongoDB for ${token}:`, error);
      res.status(500).send({ message: error.message });
    }

    res.status(200).send({ message: 'Graph data updated successfully' });
    
  } catch (error:any) {
    console.error('Error fetching graph data:', error);
    res.status(500).send({ error: 'Failed to fetch graph data' });
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