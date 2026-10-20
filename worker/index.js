import assets from './assets.js';
import { onRequestPost as handleLead } from '../functions/api/lead.js';

const TYPES = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  svg: 'image/svg+xml',
  xml: 'application/xml; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  woff2: 'font/woff2',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ico: 'image/x-icon',
};

const decoded = new Map();
function load(key) {
  if (!(key in assets)) return null;
  if (!decoded.has(key)) decoded.set(key, Uint8Array.from(atob(assets[key]), (c) => c.charCodeAt(0)));
  return decoded.get(key);
}

function serve(key, status = 200) {
  const ext = key.split('.').pop();
  return new Response(load(key), {
    status,
    headers: {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': key.startsWith('_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url, 301);
    }

    if (url.pathname === '/api/lead') {
      return request.method === 'POST' ? handleLead({ request, env }) : new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '');
      return Response.redirect(url, 301);
    }

    const path = decodeURIComponent(url.pathname).slice(1);
    const key = [path || 'index.html', `${path}.html`, `${path}/index.html`].find((k) => k in assets);
    return key ? serve(key) : serve('404.html', 404);
  },
};
