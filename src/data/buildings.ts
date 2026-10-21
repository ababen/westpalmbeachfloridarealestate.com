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

export const buildings = (raw as Building[]).slice().sort((a, b) => a.name.localeCompare(b.name));

/** Areas in the order they appear on the index page. */
export const buildingAreas = [
  'Downtown',
  'North Flagler',
  'Old Northwood',
  'Northwood',
  'El Cid',
  'Flamingo Park',
  'South of Southern (SoSo)',
  'South Dixie',
  'Palm Beach Lakes',
  'Other',
].filter((area) => buildings.some((b) => b.area === area));

/** Building areas that have a matching neighborhood guide. */
export const areaNeighborhood: Record<string, string> = {
  Downtown: 'downtown',
  'El Cid': 'el-cid',
  'Flamingo Park': 'flamingo-park',
  'Old Northwood': 'old-northwood',
  Northwood: 'old-northwood',
  'South of Southern (SoSo)': 'south-of-southern',
  'Palm Beach Lakes': 'palm-beach-lakes',
};

export const areaSlug = (area: string) =>
  area
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
