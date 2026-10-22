# Security policy

## Reporting a vulnerability

Please report security problems privately. Don't open a public issue.

- **Preferred:** use GitHub's [Report a vulnerability](https://github.com/ababen/westpalmbeachfloridarealestate.com/security/advisories/new) form on this repository's **Security** tab.
- **Or email:** hello@westpalmbeachfloridarealestate.com, with "Security" in the subject.

Include what you found, the URL or file involved, and steps to reproduce it.

## What to expect

- Acknowledgement within **3 business days**.
- An assessment and a planned fix date within **10 business days**.
- Credit in the fix's release notes if you'd like it.

## Scope

**In scope**
- westpalmbeachfloridarealestate.com and www.westpalmbeachfloridarealestate.com
- The Cloudflare Worker in `worker/` and the lead-form API in `functions/api/`
- This repository's GitHub Actions workflows and build scripts

**Out of scope**
- Third-party services the site links to or embeds: the brokerage's IDX listing search, Google Maps, Cloudflare Turnstile, and email providers. Report those to their owners.
- Denial-of-service and volumetric attacks, spam submissions that the form's rate limit and Turnstile already block, and automated scanner output without a working proof of concept.
- Social engineering of the site owner or the brokerage.

## Secrets

Secrets never go in this repository. API keys and tokens live in the host's environment instead:

- Worker secrets in Cloudflare (`npx wrangler secret put …`), such as `TURNSTILE_SECRET` and `RESEND_API_KEY`
- GitHub Actions repository secrets, such as `CLOUDFLARE_API_TOKEN` and `GEMINI_API_KEY`
- A local `.env` or `.dev.vars` file for development, which git ignores

If a secret is ever committed, rotate it at its provider straight away: deleting the file doesn't remove it from git history.
