import { createAuthClient } from 'better-auth/vue';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';
import { polarClient } from '@polar-sh/better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.CONVEX_SITE_URL,
  plugins: [convexClient(), crossDomainClient(), polarClient()],
});
