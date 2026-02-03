
import { watch } from 'vue';
import { useConvexClient } from 'convex-vue';

export default defineNuxtPlugin(() => {
  if (import.meta.client && (globalThis as any).__convexAuthInitialized) {
    return;
  }
  if (import.meta.client) {
    (globalThis as any).__convexAuthInitialized = true;
  }

  const convexClient = useConvexClient();
  const authClient = useAuthClient();
  const { session } = useAuthStore();

  let cachedToken: string | null = null;
  let lastSessionId: string | null = null;
  let authSet = false;
  let inflightToken: Promise<string | null> | null = null;

  const fetchToken = async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
    if (cachedToken && !forceRefreshToken) {
      return cachedToken;
    }

    if (inflightToken && !forceRefreshToken) {
      return inflightToken;
    }

    try {
      inflightToken = (async () => {
        const { data } = await (authClient as any).convex.token();
        const token = data?.token || null;
        cachedToken = token;
        return token;
      })();
      return await inflightToken;
    } catch (error) {
      console.error('[convex-auth] Error fetching token:', error);
      cachedToken = null;
      return null;
    } finally {
      inflightToken = null;
    }
  };

  // Watch for session changes, but only act when session transitions from pending to loaded
  // or when session ID actually changes (login/logout)
  watch(
    () => ({
      isPending: session.value?.isPending,
      sessionId: session.value?.data?.session?.id,
    }),
    async ({ isPending, sessionId }, oldValue) => {
      // Skip while session is still loading
      if (isPending) return;

      // Skip if session ID hasn't changed
      if (sessionId === lastSessionId) return;

      if (sessionId) {
        lastSessionId = sessionId;
        cachedToken = null;
        convexClient.setAuth(fetchToken);
        authSet = true;
      } else if (authSet) {
        // User logged out
        cachedToken = null;
        lastSessionId = null;
        authSet = false;
        (convexClient as any).clearAuth?.();
      }
    },
    { immediate: true }
  );
});
