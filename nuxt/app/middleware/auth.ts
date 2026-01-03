import { until } from '@vueuse/core';

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isPending } = useAuthStore();

  if (isPending.value) {
    await until(isPending).toBe(false);
  }

  if (!isAuthenticated.value && to.path.startsWith('/dashboard')) {
    return navigateTo('/');
  }
});
