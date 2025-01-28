import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import axios from 'axios';
import { MongoClient } from 'mongodb';

const db = admin.firestore();

exports.getKolList = onRequest(async (request, response) => {
    try {

        // Get include_name from request body
        const { include_name } = request.body;

        // Fetch the document from Firestore
        const docRef = db.collection('config').doc('h74tKbXzddM9qSdO6NZW');
        const doc = await docRef.get();

        if (!doc.exists) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }

        const data = doc.data();
        const kolList = data?.kol_list || {};

        // Transform the data based on include_name parameter
        const result = include_name 
            ? kolList 
            : Object.values(kolList);

        response.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching KOL list:', error);
        response.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
