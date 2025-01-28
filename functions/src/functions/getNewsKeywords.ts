import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';

const db = admin.firestore();

exports.getNewsKeywords = onRequest(async (request, response) => {
    try {
        // Fetch the document from Firestore
        const docRef = db.collection('config').doc('h74tKbXzddM9qSdO6NZW');
        const doc = await docRef.get();

        if (!doc.exists) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }

        const data = doc.data();
        const keywords = data?.news_search_keywords || [];

        response.status(200).json({
            success: true,
            data: keywords
        });

    } catch (error) {
        console.error('Error fetching news keywords:', error);
        response.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
