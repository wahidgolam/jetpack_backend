import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
const db = admin.firestore();

export const getSpotlight = onRequest(async (req, res) => {
    try {
        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*');

        // Only allow GET requests
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        // Fetch tokens from Firestore
        const tokensSnapshot = await db.collection('tokens')
            .limit(10)
            .get();

        const geckoIds: string[] = [];
        
        tokensSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.geckoid) {
                geckoIds.push(data.geckoid);
            }
        });

        res.status(200).json({
            success: true,
            data: geckoIds
        });

    } catch (error) {
        console.error('Error in getRecommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
