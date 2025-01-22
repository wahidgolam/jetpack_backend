import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();
const rtdb = admin.database();

interface StaticData {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
  description: string;
  links: any;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  contractAddress?: string;
}

export const fetchCoinStaticData = onRequest(async (req, res) => {
  try {
    // Only allow POST requests
    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Get all tokens from Firestore
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

    // Process each token
    const processPromises = geckoIds.map(async (geckoId) => {
      try {
        // Call CoinGecko API

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${geckoId}`,
          {
            params: {
              localization: false,
              tickers: false,
              market_data: false,
              community_data: false,
              developer_data: false,
              sparkline: false
            },
            headers: {
              'accept': 'application/json',
              'x-cg-demo-api-key': 'CG-fLaeU6PeaY5gSKuVNeUyL7Vs'
            }
          }
        );
        // Extract required data
        const staticData: StaticData = {
          id: response.data.id,
          symbol: response.data.symbol,
          name: response.data.name,
          categories: response.data.categories,
          description: response.data.description.en,
          links: response.data.links,
          image: response.data.image,
          contractAddress: response.data.contract_address
        };

        // Update Realtime Database
        await admin.database()
          .ref(`coinDetails/${geckoId}/staticData`)
          .set(staticData);

        return { success: true, id: geckoId };
      } catch (error: any) {
        console.error(`Error processing ${geckoId}:`, error);
        return { success: false, id: geckoId, error: error.message };
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(processPromises);

    // Send response
    res.status(200).json({
      message: 'Static data fetch completed',
      results
    });

  } catch (error: any) {
    console.error('Error in fetchCoinStaticData:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}); 