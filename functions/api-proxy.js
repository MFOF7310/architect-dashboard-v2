export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const targetUrl = `http://prem-eu1.bot-hosting.net:20582/api${path}${url.search}`;
  
  const headers = new Headers(request.headers);
  headers.set('x-api-key', 'ArchitectBamako223/2025');
  
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
  });
  
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}