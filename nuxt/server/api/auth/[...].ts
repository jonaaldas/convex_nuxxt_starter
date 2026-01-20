export default defineEventHandler(async (event) => {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;

  if (!convexSiteUrl) {
    console.error('[Auth Proxy] CONVEX_SITE_URL is not set');
    throw createError({
      statusCode: 500,
      message: 'CONVEX_SITE_URL environment variable is not set',
    });
  }

  const requestUrl = getRequestURL(event);
  const targetUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;

  // Build headers - exclude problematic ones
  const incomingHeaders = getHeaders(event);
  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingHeaders)) {
    const lowerKey = key.toLowerCase();
    // Skip headers that cause issues
    if (value && !['host', 'connection', 'content-length'].includes(lowerKey)) {
      headers.set(key, value);
    }
  }
  headers.set('host', new URL(convexSiteUrl).host);

  const body = event.method !== 'GET' && event.method !== 'HEAD'
    ? await readRawBody(event)
    : undefined;

  const response = await fetch(targetUrl, {
    method: event.method,
    headers,
    body,
    redirect: 'manual',
  });

  // Forward status
  setResponseStatus(event, response.status);

  // Forward response headers
  for (const [key, value] of response.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(lowerKey)) {
      setResponseHeader(event, key, value);
    }
  }

  // Return response body as text/json
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
});
