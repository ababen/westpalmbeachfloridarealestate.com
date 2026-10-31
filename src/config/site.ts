// Central site details.
export const site = {
  name: 'West Palm Beach Florida Real Estate',
  shortName: 'WPB Real Estate',
  url: 'https://westpalmbeachfloridarealestate.com',
  description:
    'Buy or sell a home in West Palm Beach, Florida. Local guidance on neighborhoods from El Cid to Northwood, home valuations, and property search.',
  phone: '(561) 783-4553',
  // Official business address (privacy policy, structured data); forwarded via Cloudflare Email Routing.
  email: 'hello@westpalmbeachfloridarealestate.com',
  // Paste your IDX/MLS search embed URL (e.g. from iHomefinder, IDX Broker, Showcase IDX).
  // While empty, the listings page shows a "tell us what you're looking for" form instead.
  idxEmbedUrl: 'https://link.flexmls.com/1z80v7evrh7o,15',
  // Google Analytics 4 measurement ID.
  gaId: 'G-LHGSP4Y2FY',
  // Google Maps Embed API key for building Street View. Public in the page, restricted to this domain in
  // Google Cloud; kept out of git in .env as PUBLIC_GOOGLE_MAPS_KEY. Without it, Street View is hidden.
  googleMapsKey: import.meta.env.PUBLIC_GOOGLE_MAPS_KEY ?? '',
  // Cloudflare Turnstile site key for the lead forms (public). The secret is the TURNSTILE_SECRET Worker secret.
  turnstileSiteKey: '0x4AAAAAAFesKaEe_ur8uKYV',
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
};

export const nav = [
  { href: '/listings', label: 'Search Homes' },
  { href: '/buy', label: 'Buy' },
  { href: '/sell', label: 'Sell' },
  { href: '/condos', label: 'Condos' },
  { href: '/neighborhoods', label: 'Neighborhoods' },
  { href: '/about', label: 'About' },
];

export const telHref = `tel:+1${site.phone.replace(/\D/g, '')}`;
