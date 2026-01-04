import type { HttpRouter } from 'convex/server';
import { createLinkToken } from './createLinkToken';
import { exchangePublicToken } from './exchangeToken';

export function registerPlaidRoutes(http: HttpRouter) {
  http.route({
    path: '/plaid/create-link-token',
    method: 'POST',
    handler: createLinkToken,
  });

  http.route({
    path: '/plaid/create-link-token',
    method: 'OPTIONS',
    handler: createLinkToken,
  });

  http.route({
    path: '/plaid/exchange-public-token',
    method: 'POST',
    handler: exchangePublicToken,
  });

  http.route({
    path: '/plaid/exchange-public-token',
    method: 'OPTIONS',
    handler: exchangePublicToken,
  });
}
