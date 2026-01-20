
import { watch } from 'vue';
import { useConvexClient } from 'convex-vue';

export default defineNuxtPlugin(() => {
  const convexClient = useConvexClient();
  const authClient = useAuthClient();

  let cachedToken: string | null = null;

  // Set up Convex auth with a token fetcher that uses the convexClient() plugin
  convexClient.setAuth(async ({ forceRefreshToken }) => {
    // Return cached token if available and not forcing refresh
    if (cachedToken && !forceRefreshToken) {
      return cachedToken;
    }

    try {
      // Use the convex.token() method provided by the convexClient() plugin
      const { data } = await (authClient as any).convex.token();
      const token = data?.token || null;
      cachedToken = token;
      return token;
    } catch (error) {
      console.error('[convex-auth] Error fetching token:', error);
      cachedToken = null;
      return null;
    }
  });

  // Re-authenticate when the session changes
  const session = authClient.useSession();
  watch(
    () => session.value?.data?.session?.id,
    async (newSessionId, oldSessionId) => {
      if (newSessionId !== oldSessionId) {
        // Clear cached token and re-set auth
        cachedToken = null;
        convexClient.setAuth(async ({ forceRefreshToken }) => {
          if (cachedToken && !forceRefreshToken) {
            return cachedToken;
          }

          try {
            const { data } = await (authClient as any).convex.token();
            const token = data?.token || null;
            cachedToken = token;
            return token;
          } catch (error) {
            console.error('[convex-auth] Error refreshing token:', error);
            cachedToken = null;
            return null;
          }
        });
      }
    }
  );
});
