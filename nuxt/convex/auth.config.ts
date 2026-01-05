import { getAuthConfigProvider } from '@convex-dev/better-auth/auth-config';
import type { AuthConfig } from 'convex/server';

export default {
  providers: [
    // getAuthConfigProvider(),
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig;
