// Central business details. Florida advertising rules (Rule 61J2-10.025) require the
// brokerage's licensed name on all ads; it appears in the footer of every page.
export const site = {
  name: 'West Palm Beach Florida Real Estate',
  shortName: 'WPB Real Estate',
  url: 'https://westpalmbeachfloridarealestate.com',
  description:
    'Buy or sell a home in West Palm Beach, Florida. Local guidance on neighborhoods from El Cid to Northwood, home valuations, and property search.',
  agent: {
    name: 'Alexander Babenchuk',
    title: 'Licensed Real Estate Sales Associate',
    license: 'FL License #SL3596634',
    licenseUrl:
      'https://www.myfloridalicense.com/portalsearches/VerifyLicensee/LicenseDetail?ID=DDFABB0C721DCA8BCD909FDE963713A5',
    photo: '', // TODO: e.g. '/images/agent.jpg'
  },
  brokerage: {
    name: 'LoKation® Real Estate',
    legalName: 'K Company Realty LLC dba LoKation',
    logo: '/images/lokation-logo.svg',
    logoLight: '/images/lokation-logo-light.svg',
    address: '',
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
