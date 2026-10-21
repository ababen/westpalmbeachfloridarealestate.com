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
export const isNewConstruction = (b: Building) => b.status !== 'completed';

export const areaSlug = (area: string) =>
  area
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
