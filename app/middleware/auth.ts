import { authClient } from '@/src/lib/auth-client';
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data: session } = await authClient.getSession();
  if (!session?.user) {
    if (to.path === '/dashboard') {
      return navigateTo('/');
    }
  }
});
