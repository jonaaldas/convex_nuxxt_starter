import { getAuthClient } from '@/src/lib/auth-client';

export function useAuthClient() {
  const config = useRuntimeConfig();
  const baseURL = config.public.siteUrl as string;

  if (!baseURL) {
    throw new Error('SITE_URL is not configured in runtime config');
  }

  return getAuthClient(baseURL);
}
