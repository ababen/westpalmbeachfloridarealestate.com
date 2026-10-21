export interface Neighborhood {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  body: string[];
  homeStyles: string[];
  highlights: string[];
  bestFor: string;
  /** Two colors for the card artwork until real photography is added. */
  palette: [string, string];
}

export const neighborhoods: Neighborhood[] = [
  {
    slug: 'downtown',
    name: 'Downtown West Palm Beach',
    tagline: 'Waterfront high-rises, Clematis Street, and Rosemary Square',
    summary:
      'The walkable urban core along the Intracoastal, with luxury condos, restaurants, and the Brightline station a few blocks away.',
    body: [
      'Downtown West Palm Beach has grown into one of South Florida’s most in-demand places to live. Condo towers line Flagler Drive with views across the Lake Worth Lagoon to Palm Beach Island, while Clematis Street and Rosemary Square offer dining, shopping, and nightlife within walking distance.',
      'The Brightline station connects downtown to Fort Lauderdale, Miami, and Orlando, and President Donald J. Trump International Airport (PBI) is a short drive away — making downtown a favorite for professionals, second-home owners, and anyone who wants a lock-and-leave lifestyle.',
    ],
    homeStyles: ['Luxury condominiums', 'Boutique mid-rise buildings', 'Townhomes'],
    highlights: [
      'Waterfront Flagler Drive and the downtown waterfront park',
      'Clematis Street dining and the GreenMarket',
      'Rosemary Square shopping and entertainment',
      'Brightline rail to Miami and Orlando',
      'Kravis Center for the Performing Arts',
    ],
    bestFor: 'Walkable living, lock-and-leave owners, and commuters',
    palette: ['#1d4e6b', '#5fa8b8'],
  },
  {
    slug: 'el-cid',
    name: 'El Cid',
    tagline: 'Historic Mediterranean Revival estates on the Intracoastal',
    summary:
      'A designated historic district just south of downtown, known for 1920s architecture and tree-lined streets steps from the water.',
    body: [
      'El Cid is one of West Palm Beach’s most prestigious historic neighborhoods. Developed during the Florida land boom of the 1920s, its streets are lined with Mediterranean Revival, Spanish Colonial, and Mission-style homes, many beautifully restored.',
      'Homes along Flagler Drive enjoy direct Intracoastal views, and residents are minutes from downtown, the Norton Museum of Art, and the bridges to Palm Beach.',
    ],
    homeStyles: ['Mediterranean Revival', 'Spanish Colonial', 'Restored 1920s estates', 'Waterfront homes'],
    highlights: [
      'Local historic district designation',
      'Steps from the Flagler Drive waterfront path',
      'Near the Norton Museum of Art',
      'Minutes to downtown and Palm Beach',
    ],
    bestFor: 'Buyers seeking historic character close to the water',
    palette: ['#b5654a', '#e8b98a'],
  },
  {
    slug: 'flamingo-park',
    name: 'Flamingo Park',
    tagline: 'One of the city’s largest historic districts',
    summary:
      'A close-knit neighborhood of 1920s and 1930s homes on a natural ridge, with a strong community feel and easy access to downtown.',
    body: [
      'Flamingo Park sits on one of the highest ridges in the city and is home to a remarkable mix of early 20th-century architecture: Mediterranean Revival, Mission, Frame Vernacular, and Craftsman bungalows.',
      'The neighborhood is known for its active neighborhood association, holiday home tours, and a location that puts downtown, Dixie Highway shops, and the waterfront within minutes.',
    ],
    homeStyles: ['Mediterranean Revival', 'Mission style', 'Craftsman bungalows', 'Frame Vernacular'],
    highlights: [
      'Local and National Register historic district',
      'Active neighborhood association and annual events',
      'Close to Antique Row on Dixie Highway',
      'Minutes to downtown',
    ],
    bestFor: 'Historic-home lovers who want community and convenience',
    palette: ['#c9577a', '#f2a7a0'],
  },
  {
    slug: 'old-northwood',
    name: 'Old Northwood & Northwood Village',
    tagline: 'Historic homes, waterfront streets, and an arts district',
    summary:
      'North of downtown, Old Northwood’s 1920s homes sit near the Intracoastal, with Northwood Village’s galleries and cafés nearby.',
    body: [
      'Old Northwood is a historic district of land-boom-era homes, many on wide lots near the Intracoastal Waterway. Architectural styles range from Mediterranean Revival to Mission and Art Deco influences.',
      'Neighboring Northwood Village has become a creative hub, with independent restaurants, art galleries, and boutiques — giving the area a relaxed, artistic character.',
    ],
    homeStyles: ['1920s historic homes', 'Mediterranean Revival', 'Waterfront properties', 'Renovated cottages'],
    highlights: [
      'National Register historic district',
      'Northwood Village arts and dining',
      'Intracoastal waterfront streets',
      'Close to downtown and I-95',
    ],
    bestFor: 'Buyers wanting historic charm with an artsy, local scene',
    palette: ['#3f6b4f', '#9cc5a1'],
  },
  {
    slug: 'south-of-southern',
    name: 'South of Southern (SoSo)',
    tagline: 'Waterfront estates and mid-century homes along Flagler Drive',
    summary:
      'The neighborhoods south of Southern Boulevard, prized for Intracoastal frontage, larger lots, and proximity to Palm Beach.',
    body: [
      'Known locally as SoSo, the area south of Southern Boulevard includes several established neighborhoods stretching along South Flagler Drive. It is one of the most sought-after areas in the city for waterfront homes.',
      'Expect a mix of mid-century ranch homes, newly built estates, and renovated classics, many with docks or water views, plus quick access to the Southern Boulevard bridge to Palm Beach.',
    ],
    homeStyles: ['Waterfront estates', 'Mid-century ranch homes', 'New construction', 'Renovated classics'],
    highlights: [
      'Intracoastal frontage and boat docks',
      'Quick access to Palm Beach via Southern Blvd',
      'Larger lots than downtown-adjacent districts',
      'Close to President Donald J. Trump International Airport (PBI)',
    ],
    bestFor: 'Waterfront living and buyers who want room to spread out',
    palette: ['#0f6f8f', '#7fd1d6'],
  },
  {
    slug: 'grandview-heights',
    name: 'Grandview Heights',
    tagline: 'A small historic district of charming bungalows',
    summary:
      'Tucked beside Flamingo Park, Grandview Heights offers historic cottages and bungalows on quiet streets near downtown.',
    body: [
      'Grandview Heights is one of the city’s earliest neighborhoods, with modest-sized historic homes — Craftsman bungalows, Frame Vernacular cottages, and Mission-style houses — on a grid of quiet streets.',
      'Its location near Dixie Highway and Flamingo Park makes it a popular choice for buyers who want historic character at a smaller scale.',
    ],
    homeStyles: ['Craftsman bungalows', 'Frame Vernacular cottages', 'Mission style'],
    highlights: [
      'Local historic district',
      'Walkable to Dixie Highway shops and dining',
      'Next to Flamingo Park',
      'Close to downtown',
    ],
    bestFor: 'First-time buyers and historic-home enthusiasts',
    palette: ['#8a6a2f', '#e0c27a'],
  },
  {
    slug: 'ibis',
    name: 'Ibis',
    tagline: 'A gated golf and country club community in western West Palm Beach',
    summary:
      'A private, amenity-rich community with championship golf, a clubhouse, tennis, and a wide range of single-family homes.',
    body: [
      'Ibis Golf & Country Club is a large gated community in the western part of the city, built around championship golf courses and a full-service clubhouse.',
      'Residents choose from villas, single-family homes, and estate homes across many sub-communities, with amenities that include golf, tennis, fitness, and dining.',
    ],
    homeStyles: ['Single-family homes', 'Estate homes', 'Villas', 'Golf course homes'],
    highlights: [
      'Gated, guarded entry',
      'Championship golf courses',
      'Clubhouse, tennis, fitness, and dining',
      'Access to western Palm Beach County amenities',
    ],
    bestFor: 'Golfers and buyers seeking a resort-style club lifestyle',
    palette: ['#2f5d3a', '#b7d48a'],
  },
  {
    slug: 'palm-beach-lakes',
    name: 'Palm Beach Lakes',
    tagline: 'Central location, condos, and easy commuting',
    summary:
      'A central area around Palm Beach Lakes Boulevard with condos, townhomes, and quick access to I-95, shopping, and the airport.',
    body: [
      'The Palm Beach Lakes area offers some of the most accessible price points near the city center, with a mix of condominiums, townhomes, and single-family homes around lakes and golf.',
      'Its central location puts I-95, President Donald J. Trump International Airport (PBI), Palm Beach Outlets, and downtown within easy reach.',
    ],
    homeStyles: ['Condominiums', 'Townhomes', 'Single-family homes'],
    highlights: [
      'Quick access to I-95',
      'Near Palm Beach Outlets',
      'Short drive to downtown and the airport',
      'Lakeside and golf-adjacent communities',
    ],
    bestFor: 'Value-minded buyers and commuters',
    palette: ['#3b4f8f', '#9fb3e8'],
  },
];
