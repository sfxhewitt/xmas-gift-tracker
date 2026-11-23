/* Gift Tracker link fetcher: a tiny Cloudflare Worker.
   The app asks it for a shop's product page; it fetches the page like a normal browser would
   and hands the HTML back. It only answers the Gift Tracker site, so it can't be used as an open proxy.

   Deploy: Cloudflare dashboard → Workers & Pages → Create → Worker → paste this file → Deploy.
   Then put the worker's URL in FETCHER_URL at the top of app.js. */
const ALLOWED_ORIGINS = ['https://sfxhewitt.github.io'];
const MAX_BYTES = 3 * 1024 * 1024;

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0], 'Vary': 'Origin' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' } });
    if (request.method !== 'GET') return new Response('GET only', { status: 405, headers: cors });
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Not allowed', { status: 403, headers: cors });

    let target;
    try { target = new URL(new URL(request.url).searchParams.get('url')); } catch (e) { return new Response('Bad url', { status: 400, headers: cors }); }
    const h = target.hostname;
    if (target.protocol !== 'https:' || !h.includes('.') || /^[\d.]+$/.test(h) || h.includes(':') || /(^|\.)(localhost|local|internal)$/.test(h))
      return new Response('Bad url', { status: 400, headers: cors });

    try {
      const res = await fetch(target.href, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.9'
        },
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      const type = res.headers.get('Content-Type') || '';
      if (!/html|xml|text/i.test(type)) return new Response('Not a web page', { status: 415, headers: cors });
      const buf = await res.arrayBuffer();
      return new Response(buf.slice(0, MAX_BYTES), { status: res.ok ? 200 : 502, headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, max-age=300', 'X-Shop-Status': String(res.status) } });
    } catch (e) {
      return new Response('Fetch failed', { status: 502, headers: cors });
    }
  }
};
