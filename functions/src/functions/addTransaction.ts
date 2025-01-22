import { onRequest } from "firebase-functions/v2/https";
import { Timestamp } from 'firebase-admin/firestore';

import * as admin from "firebase-admin";

const db = admin.firestore();

interface TransactionData {
  geckoid: string;
  contractAddress: string;
  amount: number;
  price: number;
  timestamp: Timestamp;
  txn_type: 'buy' | 'sell';
}

export const addTransaction = onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');

    // Check if method is POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Get data from request body
    const { geckoid, contractAddress, userId, amount, price, txn_type } = req.body;

    // Validate required fields
    if (!geckoid || !contractAddress || !userId || !amount || !price || !txn_type) {
      res.status(400).json({ 
        error: 'Missing required fields. Please provide geckoid, contractAddress, userId, amount, price, and txn_type' 
      });
      return;
    }

    // Validate txn_type value
    if (txn_type !== 'buy' && txn_type !== 'sell') {
      res.status(400).json({ 
        error: 'txn_type must be either "buy" or "sell"' 
      });
      return;
    }

    // Create transaction object
    const transactionData: TransactionData = {
      geckoid,
      contractAddress,
      amount,
      price,
      timestamp: Timestamp.now(),
      txn_type
    };

    // Add transaction to Firestore
    await db.collection('users')
      .doc(userId)
      .collection('transactions')
      .add(transactionData);

    res.status(200).json({ 
      message: 'Transaction added successfully',
      data: transactionData
    });

  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
