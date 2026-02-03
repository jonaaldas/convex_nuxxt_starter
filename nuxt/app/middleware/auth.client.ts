export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isPending, hasActiveSubscription } = useAuthStore();

  // Wait for auth state to be resolved
  if (isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isPending, (val) => {
        if (!val) {
          unwatch();
          resolve();
        }
      }, { immediate: true });
    });
  }

  if (!isAuthenticated.value && to.path.startsWith('/dashboard')) {
    return navigateTo('/');
  }
});
