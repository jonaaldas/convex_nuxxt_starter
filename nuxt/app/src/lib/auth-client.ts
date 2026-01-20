import { createAuthClient } from 'better-auth/vue';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';
import { polarClient } from '@polar-sh/better-auth/client';
import { customSessionClient } from 'better-auth/client/plugins';
import type { Auth } from '../../../convex/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _authClient: any = null;

export function getAuthClient(baseURL: string) {
  if (!_authClient) {
    _authClient = createAuthClient({
      baseURL,
      plugins: [convexClient(), crossDomainClient(), polarClient(), customSessionClient<Auth>()],
    });
  }
  return _authClient;
}
