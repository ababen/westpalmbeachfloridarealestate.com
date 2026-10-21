import raw from './buildings.json';

export type BuildingStatus = 'completed' | 'under construction' | 'pre-construction';

export interface Building {
  slug: string;
  name: string;
  aka?: string[];
  address: string;
  area: string;
  status: BuildingStatus;
  yearBuilt?: number | null;
  floors?: number | null;
  units?: number | null;
  developer?: string | null;
  architect?: string | null;
  waterfront?: boolean | null;
  amenities: string[];
  /** One- or two-sentence summary used on cards and in meta descriptions. */
  summary: string;
  /** Longer, sourced description for the building page. */
  description?: string | null;
  bedrooms?: string | null;
  sqftRange?: string | null;
  petPolicy?: string | null;
  parking?: string | null;
  rentalPolicy?: string | null;
  lat: number;
  lng: number;
  /** Freely licensed photo (scripts/condos/add-photo.mjs); credit must be shown wherever it appears. */
  photo?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    credit: string;
    license: string;
    licenseUrl: string | null;
    sourceUrl: string;
  } | null;
  /** Google Street View panorama aimed at the building (scripts/condos/streetview.mjs); null if none. */
  streetView?: { pano: string; heading: number } | null;
  /** Where each fact came from; kept for maintenance, not shown on the site. */
  sources: string[];
}

const sortKey = (name: string) => name.replace(/^the\s+/i, '');

export const buildings = (raw as Building[]).slice().sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));

/** Areas in the order they appear on the index page. */
export const buildingAreas = [
  'Downtown',
  'South Flagler',
  'North Flagler',
  'Northwood',
  'Lands of the President',
].filter((area) => buildings.some((b) => b.area === area));

/** Building areas that have a matching neighborhood guide. */
export const areaNeighborhood: Record<string, string> = {
  Downtown: 'downtown',
  'South Flagler': 'south-flagler',
  'North Flagler': 'north-flagler',
  Northwood: 'north-flagler',
  'Lands of the President': 'lands-of-the-president',
};

/** True for towers that are under construction or not yet started. */
/** Short attribution line, e.g. "Photo: Jane Doe / Wikimedia Commons, CC BY-SA 4.0". */
export const photoCredit = (p: NonNullable<Building['photo']>) =>
  p.license === 'Rendering'
    ? `Artist's rendering (${p.credit}), not a photograph`
    : `Photo: ${p.credit}${p.sourceUrl.includes('wikimedia.org') ? ' / Wikimedia Commons' : ''}, ${p.license}`;

export const isNewConstruction = (b: Building) => b.status !== 'completed';

export const areaSlug = (area: string) =>
  area
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
