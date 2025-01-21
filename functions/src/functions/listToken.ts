import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const listToken = functions.https.onRequest(async (request, response) => {
    if (request.method !== 'POST') {
        response.status(405).json({
            error: {
                code: 405,
                message: 'Method Not Allowed'
            }
        });
        return;
    }
    const { geckoid, address } = request.body;

    if (!geckoid || !address) {
        response.status(400).json({
            error: {
                code: 400,
                message: 'Missing parameters'
            }
        });
        return;
    }

    try {
        const query = db.collection('tokens');
        const snapshot = await query.where('geckoid', '==', geckoid).where('address', '==', address).get();

        if (!snapshot.empty) {
            // If a token with the given name and symbol exists, update its active status to true
            const tokenRef = snapshot.docs[0].ref;
            await tokenRef.update({ active: true });
            response.status(200).json({
                success: true,
                message: 'Token relisted successfully'
            });
        } else {
            // If no such token exists, create a new one
            const memecoinRef = db.collection('tokens').doc();
            await memecoinRef.set({
                id: memecoinRef.id,
                geckoid,
                address,
                active: true,
                listedAt: new Date().toISOString()
            });
            response.status(200).json({
                success: true,
                message: 'Token parameters stored successfully'
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