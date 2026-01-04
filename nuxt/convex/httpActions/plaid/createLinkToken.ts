import { httpAction } from '../../_generated/server';
import { plaidClient } from './client';
import { Products, CountryCode } from 'plaid';

const SITE_URL = process.env.SITE_URL || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const createLinkToken = httpAction(async (_, request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Finance Tracker',
      products: [Products.Balance, Products.Investments, Products.Liabilities, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    console.log(`[PLAID] Created link token for user ${userId}`);

    return new Response(JSON.stringify({ link_token: response.data.link_token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('[PLAID] Error creating link token:', error);
    return new Response(JSON.stringify({ error: 'Failed to create link token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
