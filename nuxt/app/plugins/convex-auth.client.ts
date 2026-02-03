
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

  // Re-authenticate when the session changes
  watch(
    () => session.value?.data?.session?.id,
    async (newSessionId, oldSessionId) => {
      if (newSessionId && newSessionId !== oldSessionId && newSessionId !== lastSessionId) {
        lastSessionId = newSessionId;
        cachedToken = null;
        convexClient.setAuth(fetchToken);
        authSet = true;
      } else if (!newSessionId && authSet) {
        cachedToken = null;
        lastSessionId = null;
        authSet = false;
        (convexClient as any).clearAuth?.();
      }
    },
    { immediate: true }
  );
});
