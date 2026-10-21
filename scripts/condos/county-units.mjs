// Counts residential condo units for each building from Palm Beach County's
// situs-address layer (one record per unit parcel, with its property use).
// Usage: node scripts/condos/county-units.mjs [slug,slug]
//
// Finds the condo parcels at the building's street address(es), takes their
// 12-digit PCN prefix (the condominium's subdivision code), then counts every
// "CONDOMINIUM" parcel under that prefix, so units listed at a sibling address
// are included. Commercial condo parcels are reported separately.
// Owners who combine units end up with fewer parcels than the building's
// declared unit count, so treat a lower county number as "current homes".
import { readFile } from 'node:fs/promises';

const LAYER = 'https://maps.co.palm-beach.fl.us/arcgis/rest/services/OpenData/open_data_v2/MapServer/0/query';
const only = process.argv[2]?.split(',');

const query = async (where) => {
  const params = new URLSearchParams({ where, outFields: 'PCN,PROP_USE', returnGeometry: 'false', f: 'json', resultRecordCount: '2000' });
  const res = await fetch(`${LAYER}?${params}`);
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.features.map((f) => f.attributes);
};

// "525 & 529 S Flagler Dr, West Palm Beach, FL 33401" -> { numbers: ['525','529'], street: 'FLAGLER', zip: '33401' }
// The layer has no N/S prefix (1801 N and 1801 S Flagler Dr share a street name), so the ZIP tells them apart.
function parseAddress(address) {
  const m = address.match(/^([\d\s,&–-]+)\s(?:[NSEW]\s+)?(.+?)\s+(?:St|Ave|Dr|Blvd|Way|Rd|Ct|Pl|Ln|Ter|Cir|Hwy)\b.*\b(\d{5})$/i);
  return m && { numbers: m[1].match(/\d+/g), street: m[2].toUpperCase().replace(/'/g, "''"), zip: m[3] };
}

export const countQueryUrl = (prefixes) =>
  `${LAYER}?${new URLSearchParams({
    where: `(${prefixes.map((p) => `PCN LIKE '${p}%'`).join(' OR ')}) AND PROP_USE='CONDOMINIUM'`,
    returnCountOnly: 'true',
    f: 'html',
  })}`;

const buildings = JSON.parse(await readFile(new URL('../../src/data/buildings.json', import.meta.url), 'utf8'));
for (const b of buildings.filter((x) => !only || only.includes(x.slug))) {
  const addr = parseAddress(b.address);
  if (!addr) {
    console.log(`${b.slug}: couldn't parse "${b.address}"`);
    continue;
  }
  const at = await query(
    `STREET_NO IN (${addr.numbers.map((n) => `'${n}'`).join(',')}) AND UPPER(STREET_NAME)='${addr.street}' AND ZIP_CODE='${addr.zip}'`,
  );
  const prefixes = [...new Set(at.filter((r) => /CONDO/i.test(r.PROP_USE ?? '')).map((r) => r.PCN.slice(0, 12)))];
  if (!prefixes.length) {
    console.log(`${b.slug}: no condo parcels at ${b.address} (published units: ${b.units})`);
    continue;
  }
  const rows = await query(prefixes.map((p) => `PCN LIKE '${p}%'`).join(' OR '));
  const residential = new Set(rows.filter((r) => r.PROP_USE === 'CONDOMINIUM').map((r) => r.PCN)).size;
  const commercial = new Set(rows.filter((r) => r.PROP_USE !== 'CONDOMINIUM' && /CONDO/i.test(r.PROP_USE ?? '')).map((r) => r.PCN)).size;
  const flag = b.units === residential ? 'matches' : `published: ${b.units}`;
  console.log(`${b.slug}: ${residential} residential${commercial ? ` + ${commercial} commercial` : ''} (${flag})`);
  console.log(`  ${countQueryUrl(prefixes)}`);
}
