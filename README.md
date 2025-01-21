# Jetpack Firebase Cloud Functions

This repository contains the Firebase Cloud Functions that power the Jetpack backend services. These functions provide various endpoints for token management, market data fetching, user operations, and trading functionality.

## Functions Overview

### Token Management

#### `listToken`
- **Method:** POST
- **Purpose:** Lists or relists a token in the system
- **Parameters:**
  - `geckoid`: CoinGecko ID of the token
  - `address`: Contract address of the token

#### `delistToken`
- **Method:** POST
- **Purpose:** Delists a token from the system
- **Parameters:** (At least one required)
  - `geckoid`: CoinGecko ID of the token
  - `address`: Contract address of the token
  - `id`: Internal token ID

### Market Data

#### `fetchCoinMarketData`
- **Method:** GET
- **Purpose:** Fetches current market data for all listed tokens
- **Features:**
  - Updates price and market cap data
  - Maintains live price graphs
  - Stores data in Realtime Database

#### `fetchCoinGraphs`
- **Method:** GET
- **Purpose:** Fetches historical price and market cap data
- **Timeframes:** 4h, 24h, 7d, 1m, 1y
- **Features:**
  - Stores graph data in Realtime Database
  - Includes price and market cap history

#### `fetchCoinGeckoList`
- **Method:** GET
- **Purpose:** Updates the internal database with latest Solana tokens from CoinGecko
- **Features:**
  - Filters for Solana-based tokens
  - Updates Firestore collection

#### `fetchCoinStaticData`
- **Method:** GET
- **Purpose:** Fetches static information about tokens
- **Data Retrieved:**
  - Token name, symbol
  - Description
  - Categories
  - Links
  - Images

### User Operations

#### `createUser`
- **Method:** POST
- **Purpose:** Creates a new user in the system
- **Parameters:**
  - `email`: User's email address
  - `walletPubKey`: User's wallet public key

#### `addTransaction`
- **Method:** POST
- **Purpose:** Records a user's trading transaction
- **Parameters:**
  - `geckoid`: CoinGecko ID of the token
  - `contractAddress`: Token contract address
  - `userId`: User's ID
  - `amount`: Transaction amount
  - `price`: Transaction price
  - `txn_type`: Either 'buy' or 'sell'

### Trading Operations

#### `getSwapTransaction`
- **Method:** POST
- **Purpose:** Generates a swap transaction using Jupiter Protocol
- **Parameters:**
  - `mint`: Token mint address
  - `txn_type`: 'buy' or 'sell'
  - `amount`: Amount to swap
  - `user_pub_key`: User's public key

### Discovery

#### `getRecommendations`
- **Method:** GET
- **Purpose:** Retrieves recommended tokens
- **Features:**
  - Returns up to 10 token recommendations

#### `getSpotlight`
- **Method:** GET
- **Purpose:** Retrieves spotlight tokens
- **Features:**
  - Returns featured tokens for the spotlight section

### System Status

#### `checkStatus`
- **Method:** GET
- **Purpose:** Checks if the API is operational
- **Response:** Returns status and welcome message

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:
- 400: Bad Request (Missing or invalid parameters)
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error

## Environment Variables

The following environment variables are required:
- `COINGECKO_API_KEY`: API key for CoinGecko API access

## Database Structure

The application uses both Firestore and Realtime Database:

### Firestore Collections:
- `tokens`: Stores token information
- `users`: Stores user data
- `coingecko`: Stores CoinGecko token list

### Realtime Database:
- `/coinDetails/{coinId}/marketData`: Current market data
- `/coinDetails/{coinId}/graphs`: Historical price and market cap data
- `/coinDetails/{coinId}/staticData`: Static token information

## Rate Limiting

Please note that some functions rely on external APIs (CoinGecko) which may have rate limits. Implement appropriate error handling in your client applications. 