import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';
import { httpAction } from './_generated/server';
import { Webhook } from 'standardwebhooks';
import { polarClient } from './auth';
import storage from './cache/redis';
import { registerPlaidRoutes } from './httpActions/plaid';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

registerPlaidRoutes(http);

const POLAR_WEBHOOK_SECRET = 'polar_whs_wvrd0RFOrNIytRVEE7S9avnsH9ZI8WdXr1L4837W6wP';

const ALLOWED_EVENTS = [
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.state_changed',
  'subscription.created',
  'subscription.updated',
  'subscription.active',
  'subscription.canceled',
  'subscription.revoked',
  'order.created',
  'order.paid',
  'checkout.created',
  'checkout.updated',
] as const;

type AllowedEventType = (typeof ALLOWED_EVENTS)[number];

interface PolarWebhookPayload {
  type: string;
  data: {
    id: string;
    customer_id?: string;
    customer?: {
      id: string;
      email: string;
      external_id?: string;
    };
    [key: string]: unknown;
  };
}

function verifyWebhookSignature(
  payload: string,
  headers: {
    'webhook-id': string | null;
    'webhook-timestamp': string | null;
    'webhook-signature': string | null;
  },
  secret: string
): PolarWebhookPayload {
  const {
    'webhook-id': webhookId,
    'webhook-timestamp': webhookTimestamp,
    'webhook-signature': webhookSignature,
  } = headers;

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    throw new Error('[POLAR WEBHOOK] Missing required webhook headers');
  }

  // Standard Webhooks spec requires base64 encoded secret
  const wh = new Webhook(btoa(secret));

  try {
    return wh.verify(payload, {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': webhookSignature,
    }) as PolarWebhookPayload;
  } catch (error) {
    console.error('[POLAR WEBHOOK] Signature verification failed:', error);
    throw new Error('[POLAR WEBHOOK] Invalid webhook signature');
  }
}

function extractCustomerId(payload: PolarWebhookPayload): string | null {
  if (payload.data.customer_id && typeof payload.data.customer_id === 'string') {
    return payload.data.customer_id;
  }

  if (payload.data.customer?.id && typeof payload.data.customer.id === 'string') {
    return payload.data.customer.id;
  }

  if (payload.type.startsWith('customer.') && payload.data.id) {
    return payload.data.id;
  }

  return null;
}

async function syncCustomerStateToRedis(customerId: string): Promise<void> {
  try {
    const customerState = await polarClient.customers.getState({ id: customerId });

    const cacheData = {
      customer: {
        id: customerState.id,
        email: customerState.email,
        name: customerState.name,
        externalId: customerState.externalId,
      },
      activeSubscriptions: customerState.activeSubscriptions,
      grantedBenefits: customerState.grantedBenefits,
      activeMeters: customerState.activeMeters,
      lastSyncedAt: new Date().toISOString(),
    };

    const cacheKey = `polar:customer:${customerId}`;
    await storage.setItem(cacheKey, cacheData);

    console.log(`[POLAR WEBHOOK] Synced customer state for ${customerId}`);
  } catch (error) {
    console.error(`[POLAR WEBHOOK] Failed to sync customer state for ${customerId}:`, error);
    throw error;
  }
}

async function handleCustomerDeletion(customerId: string): Promise<void> {
  try {
    await storage.removeItem(`polar:customer:${customerId}`);
    console.log(`[POLAR WEBHOOK] Removed customer ${customerId} from cache`);
  } catch (error) {
    console.error(`[POLAR WEBHOOK] Failed to remove customer ${customerId} from cache:`, error);
    throw error;
  }
}

async function processWebhookEvent(payload: PolarWebhookPayload): Promise<void> {
  const eventType = payload.type;

  if (!ALLOWED_EVENTS.includes(eventType as AllowedEventType)) {
    console.log(`[POLAR WEBHOOK] Skipping untracked event: ${eventType}`);
    return;
  }

  const customerId = extractCustomerId(payload);

  if (!customerId) {
    console.error(`[POLAR WEBHOOK] Could not extract customer ID from event: ${eventType}`);
    return;
  }

  console.log(`[POLAR WEBHOOK] Processing ${eventType} for customer ${customerId}`);

  if (eventType === 'customer.deleted') {
    await handleCustomerDeletion(customerId);
    return;
  }

  await syncCustomerStateToRedis(customerId);
}

http.route({
  path: '/polar/webhooks',
  method: 'POST',
  handler: httpAction(async (_, request) => {
    const rawBody = await request.text();

    const headers = {
      'webhook-id': request.headers.get('webhook-id'),
      'webhook-timestamp': request.headers.get('webhook-timestamp'),
      'webhook-signature': request.headers.get('webhook-signature'),
    };

    try {
      const payload = verifyWebhookSignature(rawBody, headers, POLAR_WEBHOOK_SECRET);

      // Return 200 after verified signature even if processing fails (prevents retries)
      try {
        await processWebhookEvent(payload);
      } catch (processingError) {
        console.error('[POLAR WEBHOOK] Error processing event:', processingError);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[POLAR WEBHOOK] Webhook verification failed:', error);

      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }),
});

export default http;
