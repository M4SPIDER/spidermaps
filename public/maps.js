// Add your own map places here.
//
// Required fields:
// - id: unique lowercase text, like "zudio-kompally". Do not reuse built-in ids
//   such as "home", "work", "hyderabad", or "goa".
// - name: the place name shown in search and on the map.
// - coords: [latitude, longitude], always in that order.
//
// Optional fields:
// - address, type, aliases, image.
// - image can be a URL or a public asset path like "/places/name.jpg".
//
// Bad rows are ignored by the app instead of breaking all places.
export const customMapPlaces = [
  {
    id: 'karachi-bakery-suchitra',
    name: 'Karachi Bakery Suchitra',
    coords: [17.5029094, 78.4744747], // Exact coordinates for the Suchitra branch
    address: 'Plot NO. 19 & 5, Survey No. 83, Mauthi Complex, Quthbullapur Main Rd, Suchitra, Green Park, Jeedimetla, Hyderabad, Telangana 500067',
    type: 'bakery',
    aliases: 'karachi bakery suchitra biscuits cakes confectionery cafe sweets',
    image: ''
  }
];
