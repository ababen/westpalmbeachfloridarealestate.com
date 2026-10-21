// POST /api/lead: emails each form submission (routed by worker/index.js).
//   LEAD_TO_EMAIL    – where leads are delivered (comma-separated for several)
// Sending, in order of preference:
//   EMAIL            – Cloudflare send_email binding (wrangler.toml). Sends from LEAD_SENDER on
//                      this domain; free because LEAD_TO_EMAIL is a verified Email Routing address.
//   RESEND_API_KEY + LEAD_FROM_EMAIL – Resend, used when the binding is missing or fails.
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

  const canResend = env.RESEND_API_KEY && env.LEAD_FROM_EMAIL;
  if (!env.LEAD_TO_EMAIL || !((env.EMAIL && env.LEAD_SENDER) || canResend)) {
    console.error('Lead form is not configured: set LEAD_TO_EMAIL and the EMAIL binding or Resend settings');
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

  const message = {
    to: env.LEAD_TO_EMAIL.split(',').map((s) => s.trim()),
    replyTo: data.email,
    subject: `${SUBJECTS[kind]}${data.building ? ` (${data.building})` : ''}: ${data.name}`,
    html: `<h2>${SUBJECTS[kind]}</h2><table>${rows}</table>`,
    text: FIELDS.filter((f) => data[f])
      .map((f) => `${f}: ${data[f]}`)
      .join('\n'),
  };

  if (env.EMAIL && env.LEAD_SENDER) {
    try {
      await env.EMAIL.send({ ...message, from: { email: env.LEAD_SENDER, name: 'West Palm Beach Real Estate' } });
      return reply(true);
    } catch (err) {
      console.error('Cloudflare email error', err.code, err.message);
      if (!canResend) return reply(false, 502);
    }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL,
      to: message.to,
      reply_to: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return reply(false, 502);
  }
  return reply(true);
}
