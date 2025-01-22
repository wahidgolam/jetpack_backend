import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const createUser = onRequest({
    memory: '256MiB',
    timeoutSeconds: 60,
    region: 'us-central1'
}, async (request, response) => {
    if (request.method !== 'POST') {
        response.status(405).json({
            error: {
                code: 405,
                message: 'Method Not Allowed'
            }
        });
        return;
    }
    const { email, walletPubKey } = request.body;

    if (!email || !walletPubKey) {
        response.status(400).json({
            error: {
                code: 400,
                message: 'Missing parameters'
            }
        });
        return;
    }

    try {
        const query = db.collection('users');
        const snapshot = await query.where('email', '==', email).where('walletPubKey', '==', walletPubKey).get();

        if (!snapshot.empty) {
            response.status(200).json({
                success: true,
                message: 'User already exists'
            });
        } else {
            const userRef = db.collection('users').doc();
            await userRef.set({
                id: userRef.id,
                email,
                walletPubKey,
                createdAt: new Date().toISOString()
            });
            response.status(200).json({
                success: true,
                message: 'User created successfully'
            });
        }
    } catch (error: any) {
        response.status(500).json({
            error: {
                code: 500,
                message: `Error storing token parameters: ${error.message}`
            }
        });
    }
});