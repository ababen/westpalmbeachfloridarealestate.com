// Cloudflare Pages Function: POST /api/lead
// Emails each form submission via Resend. Required environment variables
// (set in Cloudflare Pages → Settings → Environment variables):
//   RESEND_API_KEY   – Resend API key
//   LEAD_TO_EMAIL    – where leads are delivered (comma-separated for several)
//   LEAD_FROM_EMAIL  – verified sender, e.g. "Website <leads@westpalmbeachfloridarealestate.com>"
// Spam protection (optional; each check is skipped when its setting is missing):
//   TURNSTILE_SECRET – Cloudflare Turnstile secret; the site key is in src/config/site.ts
//   LEAD_LIMITER     – Workers rate-limit binding keyed by client IP (wrangler.toml)

const FIELDS = ['name', 'email', 'phone', 'building', 'interest', 'address', 'area', 'budget', 'timeline', 'message'];
const SUBJECTS = {
  contact: 'New contact message',
  buy: 'New buyer inquiry',
  sell: 'New home valuation request',
  search: 'New listing alert request',
  building: 'New condo building inquiry',
};

async function passesTurnstile(token, ip, secret) {
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: String(token), remoteip: ip }),
  });
  return res.ok && (await res.json()).success === true;
}

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const reply = (ok, status = ok ? 200 : 400, error) =>
    wantsJson
      ? Response.json({ ok, ...(error && { error }) }, { status })
      : Response.redirect(new URL(ok ? '/thank-you' : '/contact', request.url), 303);
  const ip = request.headers.get('CF-Connecting-IP') || '';

  if (!env.RESEND_API_KEY || !env.LEAD_TO_EMAIL || !env.LEAD_FROM_EMAIL) {
    console.error('Lead form is not configured: set RESEND_API_KEY, LEAD_TO_EMAIL, and LEAD_FROM_EMAIL');
    return reply(false, 503);
  }

  if (env.LEAD_LIMITER && !(await env.LEAD_LIMITER.limit({ key: ip })).success) {
    return reply(false, 429, 'Too many messages in a short time. Please wait a minute and try again.');
  }

  const form = await request.formData();

  // Honeypot filled in: pretend success so bots move on.
  if (form.get('company')) return reply(true);

  if (env.TURNSTILE_SECRET && !(await passesTurnstile(form.get('cf-turnstile-response'), ip, env.TURNSTILE_SECRET))) {
    return reply(false, 403, 'We couldn’t verify you’re not a bot. Please reload the page and try again.');
  }

  const data = Object.fromEntries(FIELDS.map((f) => [f, String(form.get(f) || '').trim().slice(0, 4000)]));
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return reply(false);
  // Link-stuffed messages are almost always spam; one link (say, a listing) is fine.
  if ((data.message.match(/(?:https?:\/\/|www\.)\S+/gi) || []).length > 1) {
    return reply(false, 400, 'Please include no more than one link in your message.');
  }

  const kind = SUBJECTS[form.get('kind')] ? form.get('kind') : 'contact';
  const rows = FIELDS.filter((f) => data[f])
    .map((f) => `<tr><th align="left" style="padding:4px 12px 4px 0">${f}</th><td>${escape(data[f])}</td></tr>`)
    .join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL,
      to: env.LEAD_TO_EMAIL.split(',').map((s) => s.trim()),
      reply_to: data.email,
      subject: `${SUBJECTS[kind]}${data.building ? ` (${data.building})` : ''}: ${data.name}`,
      html: `<h2>${SUBJECTS[kind]}</h2><table>${rows}</table>`,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return reply(false, 502);
  }
  return reply(true);
}
