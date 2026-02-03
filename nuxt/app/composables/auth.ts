import { getAuthClient } from '@/src/lib/auth-client';

export function useAuthClient() {
  const config = useRuntimeConfig();
  const convexUrl = config.public.convexSiteUrl as string;

  if (!convexUrl) {
    throw new Error('CONVEX_SITE_URL is not configured in runtime config');
  }

  return getAuthClient(convexUrl);
}
