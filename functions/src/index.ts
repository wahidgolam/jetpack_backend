/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Create Express app
const app = express.default();

// Middleware
app.use(cors.default({ origin: true }));
app.use(express.json());

// Import route handlers
const checkStatus = require('./functions/checkStatus');
const listToken = require('./functions/listToken');
const delistToken = require('./functions/delistToken');
const createUser = require('./functions/createUser');
const fetchCoinGeckoList = require('./functions/fetchCoinGeckoList');
const fetchCoinMarketData = require('./functions/fetchCoinMarketData');
const fetchCoinStaticData = require('./functions/fetchCoinStaticData');
const fetchCoinGraphs = require('./functions/fetchCoinGraphs');
const getRecommendations = require('./functions/getrecommendations');
const getSpotlight = require('./functions/getspotlight');
const getSwapTransaction = require('./functions/getSwapTransaction');
const addTransaction = require('./functions/addTransaction');
const getKolList = require('./functions/getKolList');
const getNewsKeywords = require('./functions/getNewsKeywords');

// Define routes
app.get('/status', checkStatus.checkStatus);
app.post('/tokens/list', listToken.listToken);
app.post('/tokens/delist', delistToken.delistToken);
app.post('/create-user', createUser.createUser);
app.get('/coingecko-list', fetchCoinGeckoList.fetchCoinGeckoList);
app.get('/coins/market-data', fetchCoinMarketData.fetchCoinMarketData);
app.get('/coins/static-data', fetchCoinStaticData.fetchCoinStaticData);
app.post('/coins/graphs', fetchCoinGraphs.fetchCoinGraphs);
app.get('/recommendations', getRecommendations.getRecommendations);
app.get('/spotlight', getSpotlight.getSpotlight);
app.post('/swap', getSwapTransaction.getSwapTransaction);
app.post('/transactions', addTransaction.addTransaction);
app.get('/kol', getKolList.getKolList);
app.get('/news', getNewsKeywords.getNewsKeywords);

// Export the Express app as a Firebase Cloud Function
exports.backend = functions.https.onRequest(app);