export default defineEventHandler(async (event) => {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;

  if (!convexSiteUrl) {
    throw createError({
      statusCode: 500,
      message: 'CONVEX_SITE_URL environment variable is not set',
    });
  }

  const requestUrl = getRequestURL(event);
  const targetUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;

  // Build headers from incoming request
  const incomingHeaders = getHeaders(event);
  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (value) headers.set(key, value);
  }
  headers.set('accept-encoding', 'application/json');
  headers.set('host', new URL(convexSiteUrl).host);

  const response = await fetch(targetUrl, {
    method: event.method,
    headers,
    body: event.method !== 'GET' && event.method !== 'HEAD' ? await readRawBody(event) : undefined,
    redirect: 'manual',
  });

  // Forward status and headers from the Convex response
  setResponseStatus(event, response.status);

  for (const [key, value] of response.headers.entries()) {
    // Skip certain headers that shouldn't be forwarded
    if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
      setResponseHeader(event, key, value);
    }
  }

  return response.body;
});
