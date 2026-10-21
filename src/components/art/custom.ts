// Hand-drawn building layers for BuildingArt, drawn from each building's street view.
// Each returns { body, outline }: body is SVG markup for the building; outline is a path
// that gets the neon glow. Coordinates are in BuildingArt's 400×300 viewBox, ground at y=252.

const G = 252;
const WHITE = '#f7e6f1';
const SHADE = '#dcc4dc';
const GLASS_DARK = '#1d3f73';

type Drawing = (id: string) => { body: string; outline: string };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const r = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

// Horizontal floor bands between x0 and x1, from top to the ground.
const bands = (x0: number, x1: number, top: number, step: number, fill: string, h = 2) =>
  range(Math.floor((G - top - 6) / step))
    .map((i) => r(x0, top + 5 + i * step, x1 - x0, h, fill))
    .join('');

// A shaded side face to the right of a block, receding up-right, for depth.
const side = (x: number, top: number, depth = 12, fill = '#b89ac0') =>
  `<path d="M${x} ${G}V${top}l${depth} -${depth * 0.5}V${G - depth * 0.2}Z" fill="${fill}"/>`;

export const CUSTOM: Record<string, Drawing> = {
  // Sweeping glass tower with wavy white floor slabs and a white podium.
  bristol: (id) => {
    const top = 34;
    const left = (t: number) => 152 - 44 * Math.sin(Math.PI * t * 0.62);
    const right = (t: number) => 210 + 32 * Math.sin(Math.PI * t * 0.58);
    const ts = range(21).map((i) => i / 20);
    const y = (t: number) => top + t * (G - top);
    const edge = [...ts.map((t) => `${left(t).toFixed(1)} ${y(t).toFixed(1)}`), ...ts.reverse().map((t) => `${right(t).toFixed(1)} ${y(t).toFixed(1)}`)];
    const outline = `M${edge.join('L')}Z`;
    const floors = range(25)
      .map((i) => {
        const t = (i + 0.6) / 25.5;
        const yy = y(t);
        const l = left(t);
        const rr = right(t);
        return `<path d="M${l.toFixed(1)} ${yy.toFixed(1)}Q${((l + rr) / 2).toFixed(1)} ${(yy + 4 - 7 * Math.sin(i)).toFixed(1)} ${rr.toFixed(1)} ${yy.toFixed(1)}" stroke="${WHITE}" stroke-width="2.4" fill="none"/>`;
      })
      .join('');
    const body = `
      <path d="${outline}" fill="url(#${id}-glass)"/>
      <path d="M${(left(0.05) + right(0.05)) / 2 + 10} ${y(0.04)}L${(left(0.95) + right(0.95)) / 2 + 18} ${y(0.95)}" stroke="rgb(255 255 255 / 0.22)" stroke-width="7"/>
      ${floors}
      ${r(84, 214, 56, 38, WHITE)}${r(90, 222, 44, 18, GLASS_DARK, 'opacity="0.8"')}`;
    return { body, outline };
  },

  // White crescent: two flat white wings around a concave, gridded centre; name on the right wing.
  trianon: () => {
    const outline = `M118 ${G}V124H150Q182 112 214 96H272V${G}Z`;
    const grid = range(16)
      .map((i) => `<path d="M${152 + i * 4} ${G}V${119 - i * 1.4}" stroke="#7a7186" stroke-width="1"/>`)
      .join('');
    const body = `
      ${r(118, 124, 32, G - 124, WHITE)}${bands(118, 150, 124, 7, SHADE)}
      <path d="M150 ${G}V124Q182 112 214 96V${G}Z" fill="#b9a9c4"/>${side(272, 96, 12)}
      ${grid}${bands(150, 214, 104, 7, 'rgb(90 70 110 / 0.5)', 1)}
      ${r(214, 96, 58, G - 96, WHITE)}${bands(214, 272, 96, 8, SHADE, 3)}
      ${r(214, 96, 5, G - 96, '#6d6380')}
      <text x="243" y="226" font-size="7" font-family="Georgia, serif" text-anchor="middle" fill="#3b2a4f" letter-spacing="1">TRIANON</text>`;
    return { body, outline };
  },

  // Two plain white slabs, the right one taller, joined by a darker balconied core.
  'placido-mar': () => {
    const outline = `M108 ${G}V86H160V96H170V62H232V${G}Z`;
    const body = `
      ${r(108, 86, 52, G - 86, WHITE)}${r(150, 86, 10, G - 86, SHADE)}
      ${r(160, 96, 10, G - 96, '#9e8fb0')}${bands(160, 170, 96, 6, '#e9d6ea', 1.5)}
      ${side(232, 62, 14)}${r(170, 62, 62, G - 62, WHITE)}${r(222, 62, 10, G - 62, SHADE)}
      ${range(3).map((i) => r(120 + i * 12, 96, 3, G - 104, 'rgb(120 100 140 / 0.35)')).join('')}
      ${range(4).map((i) => r(182 + i * 11, 72, 3, G - 80, 'rgb(120 100 140 / 0.35)')).join('')}`;
    return { body, outline };
  },

  // Slender glass tower with white slab edges and rounded corners; a white mid-rise beside it.
  'la-clara': (id) => {
    const outline = `M150 ${G}V62Q150 48 164 48H206Q220 48 220 62V${G}Z`;
    const body = `
      ${r(78, 168, 60, G - 168, WHITE)}${bands(78, 138, 168, 8, SHADE, 3)}
      ${range(5).map((i) => r(84 + i * 11, 174, 6, G - 180, 'rgb(110 90 140 / 0.3)')).join('')}
      <path d="${outline}" fill="url(#${id}-glass)"/>
      ${bands(150, 220, 50, 7.6, 'rgb(255 244 250 / 0.85)', 2.2)}
      ${r(196, 52, 3, G - 52, 'rgb(255 255 255 / 0.25)')}`;
    return { body, outline };
  },

  // Cream Mediterranean tower: arched base, pilasters, balconies with dark rails, cornice.
  'two-city-plaza': () => {
    const x0 = 116;
    const x1 = 240;
    const top = 58;
    const outline = `M${x0} ${G}V${top}H${x1}V${G}Z`;
    const bays = range(6).map((i) => x0 + 6 + i * 20);
    const balconies = bays
      .flatMap((bx) => range(17).map((j) => `${r(bx, top + 16 + j * 9.5, 14, 2, '#2a1f33')}${r(bx + 2, top + 11 + j * 9.5, 10, 5, 'rgb(120 80 60 / 0.35)')}`))
      .join('');
    const arches = bays.map((bx) => `<path d="M${bx} ${G}v-20a7 7 0 0 1 14 0v20z" fill="#5a3d52"/>`).join('');
    const body = `
      ${side(x1, top, 14, '#d9b27a')}${r(x0, top, x1 - x0, G - top, '#f6dca6')}
      ${range(7).map((i) => r(x0 + i * 20 - 1, top, 3, G - top, '#fbe9c4')).join('')}
      ${balconies}${arches}
      ${r(x0 - 4, top - 6, x1 - x0 + 8, 7, '#e6c27e')}${r(x0, G - 34, x1 - x0, 3, '#e6c27e')}`;
    return { body, outline };
  },

  // Tall white slab with dark window bands, a corner balcony stack and a lower second wing.
  'palm-beach-house': () => {
    const outline = `M126 ${G}V40H214V70H246V${G}Z`;
    const body = `
      ${side(246, 70, 12)}${r(126, 40, 70, G - 40, WHITE)}${bands(126, 196, 40, 7, '#5b5170', 2)}
      ${r(196, 40, 18, G - 40, SHADE)}${bands(196, 214, 40, 7, WHITE, 4)}
      ${r(214, 70, 32, G - 70, '#ecd6ea')}${bands(214, 246, 70, 7, '#5b5170', 2)}`;
    return { body, outline };
  },

  // Boxy white tower with a dense window grid and its neighbouring towers behind.
  'rapallo-south': () => {
    const outline = `M124 ${G}V82H206V${G}Z`;
    const windows = range(18)
      .flatMap((row) => range(7).map((col) => r(130 + col * 10.5, 90 + row * 8.8, 6, 4, 'rgb(70 90 140 / 0.65)')))
      .join('');
    const body = `
      ${r(212, 128, 40, G - 128, '#c9a9cf', 'opacity="0.8"')}${bands(212, 252, 128, 8, 'rgb(255 255 255 / 0.5)', 2)}
      ${r(258, 146, 36, G - 146, '#b896c2', 'opacity="0.7"')}${bands(258, 294, 146, 8, 'rgb(255 255 255 / 0.45)', 2)}
      ${side(206, 82, 12)}${r(124, 82, 82, G - 82, WHITE)}${windows}
      ${r(116, 92, 8, G - 92, SHADE)}${bands(116, 124, 92, 8.8, '#7a6a90', 1.5)}`;
    return { body, outline };
  },
};
