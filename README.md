# Jetpack Firebase Cloud Functions

This repository contains the Firebase Cloud Functions that power the Jetpack backend services. These functions provide various endpoints for token management, market data fetching, user operations, and trading functionality.

## Base URL
All endpoints are accessible through the base URL:
`https://us-central1-jetpack-cb13f.cloudfunctions.net/backend`

## API Endpoints

### Token Management

#### List Token
- **Endpoint:** `/tokens/list`
- **Method:** POST
- **Purpose:** Lists or relists a token in the system
- **Parameters:**
  - `geckoid`: CoinGecko ID of the token
  - `address`: Contract address of the token

#### Delist Token
- **Endpoint:** `/tokens/delist`
- **Method:** POST
- **Purpose:** Delists a token from the system
- **Parameters:** (At least one required)
  - `geckoid`: CoinGecko ID of the token
  - `address`: Contract address of the token
  - `id`: Internal token ID

### Market Data

#### Fetch Market Data
- **Endpoint:** `/coins/market-data`
- **Method:** GET
- **Purpose:** Fetches current market data for all listed tokens
- **Parameters:** None required
- **Features:**
  - Updates price and market cap data
  - Maintains live price graphs
  - Stores data in Realtime Database

#### Fetch Graphs
- **Endpoint:** `/coins/graphs`
- **Method:** GET
- **Purpose:** Fetches historical price and market cap data
- **Parameters:**
  - `timeframe` (required): One of '24h', '7d', '1m', '1y'
  - `token` (required): CoinGecko ID of the token
- **Timeframes:** 4h, 24h, 7d, 1m, 1y
- **Features:**
  - Stores graph data in Realtime Database
  - Includes price and market cap history

#### Fetch CoinGecko List
- **Endpoint:** `/coingecko-list`
- **Method:** GET
- **Purpose:** Updates the internal database with latest Solana tokens from CoinGecko
- **Parameters:** None required
- **Features:**
  - Filters for Solana-based tokens
  - Updates Firestore collection

#### Fetch Static Data
- **Endpoint:** `/coins/static-data`
- **Method:** GET
- **Purpose:** Fetches static information about tokens
- **Parameters:** None required
- **Response Data:**
  - Token name, symbol
  - Description
  - Categories
  - Links
  - Images
  - Contract Address (if available)
- **Note:** Fetches data for all tokens in the Firestore collection

### User Operations

#### Create User
- **Endpoint:** `/create-user`
- **Method:** POST
- **Purpose:** Creates a new user in the system
- **Parameters:**
  - `email`: User's email address
  - `walletPubKey`: User's wallet public key

#### Add Transaction
- **Endpoint:** `/transactions`
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

#### Get Swap Transaction
- **Endpoint:** `/swap`
- **Method:** GET
- **Purpose:** Generates a swap transaction using Jupiter Protocol
- **Parameters:**
  - `mint`: Token mint address
  - `txn_type`: 'buy' or 'sell'
  - `amount`: Amount to swap
  - `user_pub_key`: User's public key

### Discovery

#### Get Recommendations
- **Endpoint:** `/recommendations`
- **Method:** GET
- **Purpose:** Retrieves recommended tokens
- **Features:**
  - Returns up to 10 token recommendations

#### Get Spotlight
- **Endpoint:** `/spotlight`
- **Method:** GET
- **Purpose:** Retrieves spotlight tokens
- **Features:**
  - Returns featured tokens for the spotlight section

#### Get KOL List
- **Endpoint:** `/kol`
- **Method:** GET
- **Purpose:** Retrieves Key Opinion Leaders list

#### Get News Keywords
- **Endpoint:** `/news`
- **Method:** GET
- **Purpose:** Retrieves news keywords

### System Status

#### Check Status
- **Endpoint:** `/status`
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