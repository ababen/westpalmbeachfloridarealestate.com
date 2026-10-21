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
  summary: string;
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
};

export const areaSlug = (area: string) =>
  area
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
