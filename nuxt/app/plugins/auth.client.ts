export default defineNuxtPlugin(async () => {
  const authClient = useAuthClient();

  // Handle OAuth one-time token (ott) from cross-domain callback
  // This is the Vue equivalent of what ConvexBetterAuthProvider does in React
  const url = new URL(window.location.href);
  const token = url.searchParams.get('ott');

  if (token) {
    try {
      // Verify the one-time token and get session
      const result = await (authClient as any).crossDomain.oneTimeToken.verify({
        token,
      });

      const session = result.data?.session;
      if (session) {
        // Exchange the session token for a proper session cookie
        await authClient.getSession({
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          },
        });
        // Notify session listeners that the session has been updated
        (authClient as any).updateSession?.();
      }
    } catch (error) {
      console.error('[auth] Failed to verify one-time token:', error);
    }

    // Remove ott from URL regardless of success/failure
    url.searchParams.delete('ott');
    window.history.replaceState({}, '', url.toString());
  }
});
