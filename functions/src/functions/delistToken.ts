import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

exports.delistToken = onRequest(async (request, response) => {
    if (request.method !== 'POST') {
        response.status(405).json({
            error: {
                code: 405,
                message: 'Method Not Allowed'
            }
        });
        return;
    }
    const { geckoid, address, id } = request.body;

    if (!geckoid && !address && !id) {
        response.status(400).json({
            error: {
                code: 400,
                message: 'At least one parameter (geckoid, address, or id) is required'
            }
        });
        return;
    }

    try {
        const query = db.collection('tokens');
        let tokenRef;

        if (id) {
            tokenRef = query.doc(id);
        } else if (geckoid) {
            const snapshot = await query.where('geckoid', '==', geckoid).get();
            if (!snapshot.empty) {
                tokenRef = snapshot.docs[0].ref;
            }
        } else if (address) {
            const snapshot = await query.where('address', '==', address).get();
            if (!snapshot.empty) {
                tokenRef = snapshot.docs[0].ref;
            }
        }

        if (!tokenRef) {
            response.status(404).json({
                error: {
                    code: 404,
                    message: 'Token not found'
                }
            });
            return;
        }

        await tokenRef.update({ active: false });
        response.status(200).json({
            success: true,
            message: 'Token delisted successfully'
        });
    } catch (error: any) {
        response.status(500).json({
            error: {
                code: 500,
                message: `Error delisting token: ${error.message}`
            }
        });
    }
});