import { createAuthClient } from 'better-auth/vue';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'https://ideal-bear-537.convex.site',
  plugins: [convexClient(), crossDomainClient()],
});
