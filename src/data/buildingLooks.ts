import type { Building } from './buildings';

// How each building is drawn in its Miami Vice–style illustration, based on how it looks from the street.
//   shape:  slab (plain block), curved (rounded face), twin (two towers), arches (low/mid-rise with an arcade)
//   finish: glass (blue-green curtain wall), white (white balconies), stucco (warm Mediterranean)
export type Look = { shape: 'slab' | 'curved' | 'twin' | 'arches'; finish: 'glass' | 'white' | 'stucco' };

const LOOKS: Record<string, Look> = {
  'plaza-of-the-palm-beaches': { shape: 'twin', finish: 'white' },
  'esplanade-grande': { shape: 'arches', finish: 'stucco' },
  '101-lofts': { shape: 'arches', finish: 'stucco' },
  strand: { shape: 'slab', finish: 'stucco' },
  '610-clematis': { shape: 'arches', finish: 'stucco' },
  'city-palms': { shape: 'arches', finish: 'stucco' },
  prado: { shape: 'arches', finish: 'stucco' },
  metropolitan: { shape: 'arches', finish: 'stucco' },
  'two-city-plaza': { shape: 'arches', finish: 'stucco' },
  'one-city-plaza': { shape: 'arches', finish: 'stucco' },
  'cityplace-south-tower': { shape: 'slab', finish: 'stucco' },
  'tower-condominium-at-cityplace': { shape: 'slab', finish: 'stucco' },
  'courtyards-in-cityplace': { shape: 'arches', finish: 'stucco' },
  'mr-c-residences-west-palm-beach': { shape: 'slab', finish: 'white' },
  'banyan-tree-residences-west-palm-beach': { shape: 'twin', finish: 'glass' },
  'waterview-towers': { shape: 'slab', finish: 'white' },
  slade: { shape: 'slab', finish: 'glass' },
  'flagler-pointe': { shape: 'slab', finish: 'white' },
  portofino: { shape: 'slab', finish: 'white' },
  'flagler-landing': { shape: 'arches', finish: 'stucco' },
  'placido-mar': { shape: 'twin', finish: 'white' },
  'palm-beach-house': { shape: 'slab', finish: 'white' },
  apogee: { shape: 'curved', finish: 'glass' },
  olara: { shape: 'curved', finish: 'glass' },
  bristol: { shape: 'curved', finish: 'glass' },
  trianon: { shape: 'curved', finish: 'white' },
  'washington-tower': { shape: 'slab', finish: 'white' },
  'envoy-tower': { shape: 'slab', finish: 'white' },
  'viking-arms': { shape: 'slab', finish: 'white' },
  'rapallo-north': { shape: 'slab', finish: 'white' },
  'rapallo-south': { shape: 'slab', finish: 'white' },
  'flagler-yacht-club': { shape: 'arches', finish: 'white' },
  'maison-dor': { shape: 'arches', finish: 'white' },
};

// Buildings not listed above: low-rise reads as Mediterranean, new towers as glass, older towers as white.
export const lookFor = (b: Building): Look =>
  LOOKS[b.slug] ??
  ((b.floors ?? 10) <= 10
    ? { shape: 'arches', finish: 'stucco' }
    : b.status !== 'completed' || (b.yearBuilt ?? 0) >= 2015
      ? { shape: 'slab', finish: 'glass' }
      : { shape: 'slab', finish: 'white' });
