import { createAuthClient } from 'better-auth/vue';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.CONVEX_SITE_URL,
  plugins: [convexClient(), crossDomainClient()],
});
