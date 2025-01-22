import { onRequest } from "firebase-functions/v2/https";
import axios from 'axios';

exports.getSwapTransaction = onRequest(async (request, response) => {

  try {
    // Check if method is POST
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    // Get parameters from request body
    const { mint, txn_type ,amount, user_pub_key } = request.body;
    let input_mint = '';
    let output_mint = '';

    if(txn_type === 'buy'){
        output_mint = mint;
        input_mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    }
    else if(txn_type === 'sell'){
        output_mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        input_mint = mint;
    }

    // Validate required parameters
    if (!mint || !txn_type || !amount || !user_pub_key) {
      response.status(400).json({
        error: 'Missing required parameters. Please provide input_mint, output_mint, amount, and user_pub_key'
      });
      return;
    }

    // Get quote from Jupiter API
    const { data: quoteResponse } = await axios.get(`https://quote-api.jup.ag/v6/quote`, {
      params: {
        inputMint: input_mint,
        outputMint: output_mint,
        amount: amount,
        slippageBps: 50
      }
    });

    // Get serialized transaction
    const { data: swapResponse } = await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse,
      userPublicKey: user_pub_key,
      wrapAndUnwrapSol: true,
    });

    // Log the response
    console.log('Swap Transaction Response:', swapResponse);

    // Send response back to client
    response.status(200).json({
      success: true,
      data: swapResponse
    });

  } catch (error) {
    console.error('Error in getSwapTransaction:', error);
    response.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
