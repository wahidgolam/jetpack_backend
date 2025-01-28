import { Request, Response } from 'express';
import * as admin from "firebase-admin";

const db = admin.firestore();

export const listToken = async (req: Request, res: Response) => {
    if (req.method !== 'POST') {
        res.status(405).json({
            error: {
                code: 405,
                message: 'Method Not Allowed'
            }
        });
        return;
    }
    const { geckoid, address } = req.body;

    if (!geckoid || !address) {
        res.status(400).json({
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
            res.status(200).json({
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
            res.status(200).json({
                success: true,
                message: 'Token parameters stored successfully'
            });
        }
    } catch (error: any) {
        res.status(500).json({
            error: {
                code: 500,
                message: `Error storing token parameters: ${error.message}`
            }
        });
    }
};