// Central business details. Everything marked TODO must be filled in before launch —
// Florida advertising rules (Rule 61J2-10.025) require the brokerage name on all ads.
export const site = {
  name: 'West Palm Beach Florida Real Estate',
  shortName: 'WPB Real Estate',
  url: 'https://westpalmbeachfloridarealestate.com',
  description:
    'Buy or sell a home in West Palm Beach, Florida. Local guidance on neighborhoods from El Cid to Northwood, home valuations, and property search.',
  agent: {
    name: 'Alexander Babenchuk',
    title: 'REALTOR®', // TODO
    license: 'FL License #SL0000000', // TODO
    photo: '', // TODO: e.g. '/images/agent.jpg'
  },
  brokerage: {
    name: 'Your Brokerage', // TODO
    address: '000 Clematis St, West Palm Beach, FL 33401', // TODO
  },
  phone: '(561) 317-8424',
  email: 'hello@westpalmbeachfloridarealestate.com',
  // Paste your IDX/MLS search embed URL (e.g. from iHomefinder, IDX Broker, Showcase IDX).
  // While empty, the listings page shows a "tell us what you're looking for" form instead.
  idxEmbedUrl: '',
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
  { href: '/neighborhoods', label: 'Neighborhoods' },
  { href: '/about', label: 'About' },
];

export const telHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;
