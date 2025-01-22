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

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Access Firestore
const db = admin.firestore();

// Access Realtime Database
const rtdb = admin.database();

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


exports.checkStatus = checkStatus.checkStatus;
exports.listToken = listToken.listToken;
exports.delistToken = delistToken.delistToken;
exports.createUser = createUser.createUser;
exports.fetchCoinGeckoList = fetchCoinGeckoList.fetchCoinGeckoList;
exports.fetchCoinMarketData = fetchCoinMarketData.fetchCoinMarketData;
exports.fetchCoinStaticData = fetchCoinStaticData.fetchCoinStaticData;
exports.fetchCoinGraphs = fetchCoinGraphs.fetchCoinGraphs;
exports.getRecommendations = getRecommendations.getRecommendations;
exports.getSpotlight = getSpotlight.getSpotlight;
exports.getSwapTransaction = getSwapTransaction.getSwapTransaction;
exports.addTransaction = addTransaction.addTransaction;

