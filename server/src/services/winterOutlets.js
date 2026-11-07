/**
 * Annexure I — participating outlets, location, and single-invoice minimum spend.
 * Amounts are in rupees and include taxes.
 */
const OUTLETS = [
  { brand: "Magic Casa", location: "Arrival", minimum: 1000 },
  { brand: "Opium", location: "Arrival", minimum: 1000 },
  { brand: "Relay", location: "Arrival", minimum: 500 },
  { brand: "Bombay Shaving Company", location: "Bus gate lounge area", minimum: 1000 },
  { brand: "Tribe Amrapali", location: "Bus gate lounge area", minimum: 5000 },
  { brand: "Crossword", location: "Check In", minimum: 500 },
  { brand: "Accessorize London", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Beauty Luxe", location: "Domestic security hold area", minimum: 5000 },
  { brand: "Bombay Shaving Company", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Craft India", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Crossword", location: "Domestic security hold area", minimum: 500 },
  { brand: "Crossword Premium Stationery", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Da Milano", location: "Domestic security hold area", minimum: 5000 },
  { brand: "Daily Object", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Embark", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Fabindia", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Forest Essentials", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Gadget Studio", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Hidesign", location: "Domestic security hold area", minimum: 5000 },
  { brand: "Hush Puppies", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Kalamandir", location: "Domestic security hold area", minimum: 20000 },
  { brand: "Kashmir Heritage", location: "Domestic security hold area", minimum: 2000 },
  { brand: "LAVIE & LAVIE SPORTS", location: "Domestic security hold area", minimum: 2000 },
  { brand: "MacV", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Madame", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Makaibari", location: "Domestic security hold area", minimum: 500 },
  { brand: "Make Your Own Perfume", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Miniso", location: "Domestic security hold area", minimum: 500 },
  { brand: "Mufti", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Opium Sunglass Lounge", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Pavers England", location: "Domestic security hold area", minimum: 5000 },
  { brand: "Porsche Design", location: "Domestic security hold area", minimum: 20000 },
  { brand: "Puma", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Rare Planet", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Relay", location: "Domestic security hold area", minimum: 500 },
  { brand: "Renee Cosmetics", location: "Domestic security hold area", minimum: 500 },
  { brand: "Samsonite", location: "Domestic security hold area", minimum: 5000 },
  { brand: "Shahenaz Home Shop", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Smilen", location: "Domestic security hold area", minimum: 500 },
  { brand: "Socks Xpress", location: "Domestic security hold area", minimum: 500 },
  { brand: "Sunglass Hut", location: "Domestic security hold area", minimum: 20000 },
  { brand: "Swarovski", location: "Domestic security hold area", minimum: 20000 },
  { brand: "Sweet Dreams", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Tantra", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Tiramisu", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Tribe Amrapali", location: "Domestic security hold area", minimum: 5000 },
  { brand: "United Colors of Benetton", location: "Domestic security hold area", minimum: 2000 },
  { brand: "Zoot", location: "Domestic security hold area", minimum: 1000 },
  { brand: "Accessorize London", location: "International SHA", minimum: 2000 },
].map((outlet) => ({
  ...outlet,
  label: `${outlet.brand} · ${outlet.location}`,
}));

const BY_LABEL = new Map(OUTLETS.map((outlet) => [outlet.label, outlet]));

function findOutlet(name) {
  return BY_LABEL.get(String(name || "").trim()) || null;
}

module.exports = { OUTLETS, findOutlet };
