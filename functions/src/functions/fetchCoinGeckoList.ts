import { onRequest } from "firebase-functions/v2/https";
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as admin from "firebase-admin";
// Load environment variables from .env file
dotenv.config();

exports.fetchCoinGeckoList = onRequest(async (request, response) => {
    if (request.method !== 'GET') {
        response.status(405).json({
            error: {
                code: 405,
                message: 'Method Not Allowed'
            }
        });
        return;
    }

    try {
        const apiResponse = await axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true', {
            headers: {
                'accept': 'application/json',
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY // Use the environment variable
            }
        });

        const coinList = apiResponse.data;
        const solanaCoins = coinList.filter((coin: any) => coin.platforms && coin.platforms.solana);

        const validCoinList = solanaCoins
            .filter((coin: any) => coin.platforms && coin.platforms.solana)
            .map((coin: any) => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                token_address: coin.platforms.solana // Replace platforms with token_address
            }));

        const updatedCoinList = validCoinList.filter((coin: any) => 
                typeof coin.id === 'string' && isNaN(Number(coin.id))
            );
        // Define the path to the coin_list.json file
        const db = admin.firestore();
        
        try {
            // Delete existing documents in the collection first
            const existingCoins = await db.collection('coingecko').get();
            const deleteBatch = db.batch();
            existingCoins.docs.forEach((doc) => {
                deleteBatch.delete(doc.ref);
            });
            await deleteBatch.commit();

            // Add new documents in smaller batches (Firestore has a limit of 500 operations per batch)
            const batchSize = 400;
            const batches = [];
            
            for (let i = 0; i < updatedCoinList.length; i += batchSize) {
                const batch = db.batch();
                const chunk = updatedCoinList.slice(i, i + batchSize);
                
                chunk.forEach((coin: any) => {
                    console.log(coin.id);
                    const coinRef = db.collection('coingecko').doc(coin.id); // Use coin.id as document ID
                    batch.set(coinRef, coin);
                    console.log(`Added ${coin.id} to Firestore`);
                });
                
                batches.push(batch.commit());
            }

            await Promise.all(batches);
            console.log('Successfully updated Firestore with new coin list');
            
        } catch (error: any) {
            response.status(500).json({
                error: {
                    code: 500,
                    message: `Error updating Firestore: ${error.message}`
                }
            });
        }

        response.status(200).json({
            success: true,
            message: 'Coin list has been successfully fetched'
        });
    } catch (error: any) {
        response.status(500).json({
            error: {
                code: 500,
                message: `Error fetching coin list: ${error.message}`
            }
        });
    }
});
