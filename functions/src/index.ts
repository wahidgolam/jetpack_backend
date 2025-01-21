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


export { checkStatus } from "./functions/checkStatus";
export { listToken } from "./functions/listToken";
export { delistToken } from "./functions/delistToken";
export { createUser } from "./functions/createUser";
export { fetchCoinGeckoList } from "./functions/fetchCoinGeckoList";
export { fetchCoinMarketData } from "./functions/fetchCoinMarketData";
export { fetchCoinStaticData } from './functions/fetchCoinStaticData';
export { fetchCoinGraphs } from './functions/fetchCoinGraphs';
export {getRecommendations} from './functions/getrecommendations';
export {getSpotlight} from './functions/getspotlight';
export {getSwapTransaction} from './functions/getSwapTransaction';
export { addTransaction } from './functions/addTransaction';