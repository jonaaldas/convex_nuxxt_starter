import { httpAction } from '../../_generated/server';
import { plaidClient } from './client';
import storage from '../../cache/redis';

const SITE_URL = process.env.SITE_URL || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const exchangePublicToken = httpAction(async (_, request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();
    const { publicToken, userId } = body;

    if (!publicToken || !userId) {
      return new Response(JSON.stringify({ error: 'publicToken and userId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = exchangeResponse.data;

    const cacheKey = `plaid:user:${userId}:item:${item_id}`;
    await storage.setItem(cacheKey, {
      accessToken: access_token,
      itemId: item_id,
      userId,
      createdAt: new Date().toISOString(),
    });

    const userItemsKey = `plaid:user:${userId}:items`;
    const existingItems = ((await storage.getItem(userItemsKey)) as string[]) || [];
    if (!existingItems.includes(item_id)) {
      existingItems.push(item_id);
      await storage.setItem(userItemsKey, existingItems);
    }

    console.log(`[PLAID] Token exchanged for user ${userId}, item ${item_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        item_id,
        message: 'Account linked successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('[PLAID] Error exchanging public token:', error);
    return new Response(JSON.stringify({ error: 'Failed to exchange token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
