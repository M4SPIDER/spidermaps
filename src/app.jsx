import React, { useState, useMemo, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';
import MobileNavigationPanel from './components/MobileNavigationPanel.jsx';
import MobileSettingsPage from './components/MobileSettingsPage.jsx';
import { 
  Menu, 
  MapPin, 
  Navigation, 
  Search, 
  Bookmark, 
  Clock, 
  Plus, 
  Minus, 
  Volume2, 
  VolumeX, 
  Layers, 
  Trash2, 
  CheckCircle, 
  X, 
  Smartphone, 
  Info, 
  Fuel,
  Route,
  Share2,
  Car,
  Bike,
  Footprints,
  Crosshair,
  CloudSun, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  Compass,
  Settings
} from 'lucide-react';

const placesDatabase = {
  work: {
    name: "Work (Quthbullapur)",
    coords: [17.5025, 78.4612],
    address: "Sudershan Reddy Nagar, Quthbullapur, Hyderabad",
    temp: "32°C",
    traffic: "Heavy traffic delays on primary corridors",
    type: "work"
  },
  home: {
    name: "Home (Kompally)",
    coords: [17.5323, 78.4892],
    address: "Plot No. 145/P, Sri Chaitanya School, Kompally",
    temp: "30°C",
    traffic: "Normal traffic conditions, roads clear",
    type: "home"
  },
  hyderabad: {
    name: "Hyderabad Center",
    coords: [17.3850, 78.4867],
    address: "Nampally Main Road, Hyderabad, Telangana",
    temp: "31°C",
    traffic: "Heavy traffic around central hub",
    type: "city"
  },
  goa: {
    name: "Goa District",
    coords: [15.4909, 73.8278],
    address: "Panaji Municipal Roadway, Goa",
    temp: "29°C",
    traffic: "Smooth travel speeds reported",
    type: "city"
  },
  suprabhata: {
    name: "SUPRABHATA ARCADE-1",
    coords: [17.5255, 78.4867],
    address: "2, Kompally, Hyderabad, Telangana",
    temp: "31°C",
    traffic: "Minor slowdowns at junction intersection",
    type: "commercial"
  },
  ambMall: {
    name: "AMB Mall Hyderabad",
    coords: [17.4576, 78.3639],
    address: "Sarath City Capital Mall, Kondapur, Hyderabad, Telangana",
    temp: "31°C",
    traffic: "Popular mall and cinema destination; traffic may be heavy near Kondapur.",
    type: "mall"
  },
  sits: {
    name: "Siddhartha Institute of Technology & Sciences (SITS)",
    coords: [17.41045, 78.63526],
    address: "Narapally village, Peerzadiguda, Hyderabad, Telangana 500088",
    temp: "31°C",
    traffic: "Campus approach roads may slow near peak college hours",
    type: "college"
  },
  alwal: {
    name: "Alwal",
    coords: [17.5011, 78.5034],
    address: "Alwal Main Road, Hyderabad, Telangana",
    temp: "31°C",
    traffic: "Moderate traffic in this area - Slower than usual",
    type: "city"
  }
};

const DEFAULT_ACTIVE_LOCATION = {
  name: "Select a place",
  coords: [17.5177, 78.4990],
  address: "Search or click the map to choose a destination",
  temp: "--",
  traffic: "Save places to make them available in your route-start selector",
  type: "pin"
};

const isRouteDestination = (place) => (
  Boolean(place)
  && place.name !== DEFAULT_ACTIVE_LOCATION.name
  && place.type !== 'gps'
  && place.name !== 'Your Location'
  && place.name !== 'Approximate Location'
);

const isRouteDestinationText = (value) => {
  const text = normalizeSearchText(value || '');
  return Boolean(text)
    && text !== normalizeSearchText(DEFAULT_ACTIVE_LOCATION.name)
    && text !== 'your location'
    && text !== 'approximate location'
    && text !== 'my gps location';
};

const isGpsStartText = (value) => {
  const text = normalizeSearchText(value || '');
  return !text
    || text === 'my gps location'
    || text === 'your location'
    || text === 'approximate location'
    || text === 'current location';
};

const SEARCH_ALIASES = {
  work: 'office job quthbullapur quthbulpur quthbulapur sudershan reddy nagar',
  home: 'house kompally kompali kompaly sri chaitanya school',
  hyderabad: 'hyd hyd centre center nampally city telangana',
  goa: 'panaji beach coastal city travel',
  suprabhata: 'suprabatha suprabata arcade commercial shop building kompally',
  ambMall: 'amb mall amb cinemas asian mahesh babu sarath city capital mall kondapur gachibowli hyderabad cinema theatre shopping mall',
  sits: 'sidhartha siddhartha group of institutions institute technology sciences sits narapally peerzadiguda college engineering hyderabad',
  alwal: 'alwal secunderabad city main road'
};

const PUBLIC_SEARCH_PLACE_KEYS = ['hyderabad', 'goa', 'ambMall', 'sits'];

const TRAVEL_MODES = [
  { id: 'car', label: 'Car', osrmProfile: 'driving', fuelKmPerLiter: 16, speedFallbackKmh: 34 },
  { id: 'bike', label: 'Bike', osrmProfile: 'driving', fuelKmPerLiter: 40, speedFallbackKmh: 32 },
  { id: 'cycle', label: 'Cycle', osrmProfile: 'bike', fuelKmPerLiter: null, speedFallbackKmh: 14 },
  { id: 'walking', label: 'Walking', osrmProfile: 'foot', fuelKmPerLiter: null, speedFallbackKmh: 4.8 },
  { id: 'tracking', label: 'Tracking', osrmProfile: 'driving', fuelKmPerLiter: 16, speedFallbackKmh: 28 }
];

const SAVED_PLACES_DB = 'spidermaps-db';
const SAVED_PLACES_STORE = 'savedPlaces';

const openSavedPlacesDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(SAVED_PLACES_DB, 1);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(SAVED_PLACES_STORE)) {
      db.createObjectStore(SAVED_PLACES_STORE, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const readSavedPlaces = async () => {
  const db = await openSavedPlacesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVED_PLACES_STORE, 'readonly');
    const request = tx.objectStore(SAVED_PLACES_STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
};

const writeSavedPlace = async (place) => {
  const db = await openSavedPlacesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVED_PLACES_STORE, 'readwrite');
    tx.objectStore(SAVED_PLACES_STORE).put(place);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};

const HYDERABAD_CONSTRUCTION_ZONES = [
  {
    id: 'uppal-elevated-corridor',
    name: 'Uppal Elevated Corridor Works',
    coords: [17.4056, 78.5591],
    radius: 850,
    status: 'Active corridor works',
    note: 'Elevated corridor pillar works and diversions reported around Uppal Ring Road / GSI side.'
  },
  {
    id: 'banjara-hills-road-2',
    name: 'Banjara Hills Road No. 2 Flyover Works',
    coords: [17.4209, 78.4487],
    radius: 450,
    status: 'Flyover works',
    note: 'H-CITI flyover work zone around Mugdha Junction / Banjara Hills Road No. 2.'
  },
  {
    id: 'gachibowli-shilpa-layout',
    name: 'Gachibowli / Shilpa Layout Flyover Works',
    coords: [17.4443, 78.3489],
    radius: 700,
    status: 'Road width reduction',
    note: 'Construction zone around Gachibowli and Shilpa Layout flyover approaches.'
  },
  {
    id: 'it-corridor-wipro-junction',
    name: 'IT Corridor Road Widening Works',
    coords: [17.4334, 78.3707],
    radius: 650,
    status: 'Widening works',
    note: 'Road widening / free-left works reported around Wipro Junction and Financial District approaches.'
  }
];

const HYDERABAD_LOCAL_HAZARDS = [
  ...HYDERABAD_CONSTRUCTION_ZONES.map((zone) => ({ ...zone, type: 'construction', warnDistance: Math.max(zone.radius, 500) })),
  {
    id: 'pvnr-expressway-flyover',
    type: 'flyover',
    name: 'PVNR Expressway Flyover',
    coords: [17.3676, 78.4544],
    radius: 380,
    warnDistance: 450,
    status: 'Flyover approach',
    note: 'Watch lane choice near the expressway ramp and flyover merge.'
  },
  {
    id: 'gachibowli-flyover',
    type: 'flyover',
    name: 'Gachibowli Flyover',
    coords: [17.4401, 78.3489],
    radius: 360,
    warnDistance: 450,
    status: 'Flyover merge',
    note: 'Keep lane discipline near Gachibowli flyover approaches.'
  },
  {
    id: 'kompally-school-speed-breaker',
    type: 'speed-breaker',
    name: 'Kompally School Speed Breaker',
    coords: [17.5323, 78.4892],
    radius: 80,
    warnDistance: 120,
    status: 'Speed breaker',
    note: 'Slow down near school frontage and local crossing.'
  },
  {
    id: 'alwal-main-road-speed-breaker',
    type: 'speed-breaker',
    name: 'Alwal Main Road Speed Breaker',
    coords: [17.5011, 78.5034],
    radius: 80,
    warnDistance: 120,
    status: 'Speed breaker',
    note: 'Speed breaker reported near Alwal main road crossing.'
  },
  {
    id: 'sits-school-zone',
    type: 'school-zone',
    name: 'SITS / Narapally Education Zone',
    coords: [17.41045, 78.63526],
    radius: 260,
    warnDistance: 320,
    status: 'School / college zone',
    note: 'Pedestrian and student movement near campus gates.'
  },
  {
    id: 'kompally-school-zone',
    type: 'school-zone',
    name: 'Kompally School Zone',
    coords: [17.5323, 78.4892],
    radius: 240,
    warnDistance: 300,
    status: 'School zone',
    note: 'Expect school traffic and pedestrians near Sri Chaitanya School.'
  },
  {
    id: 'uppal-crossroad-accident-turn',
    type: 'accident-turn',
    name: 'Uppal Crossroad Risk Turn',
    coords: [17.4059, 78.5584],
    radius: 220,
    warnDistance: 300,
    status: 'Accident-prone turn',
    note: 'Complex junction with merging traffic around corridor works.'
  },
  {
    id: 'gachibowli-junction-risk-turn',
    type: 'accident-turn',
    name: 'Gachibowli Junction Risk Turn',
    coords: [17.4435, 78.3484],
    radius: 220,
    warnDistance: 300,
    status: 'Accident-prone turn',
    note: 'High-speed junction and flyover approach; watch turns and lane changes.'
  }
];

const normalizeSearchText = (value) =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const cleanIntentWords = (value) =>
  normalizeSearchText(value)
    .replace(/\b(near me|nearby|route|routes|direction|directions|navigate|navigation|go to|take me|show|find|search|map|maps)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getEditDistance = (a, b) => {
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i += 1) matrix[i] = [i];
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const fuzzySearch = (query, text) => {
  if (!query) return true;
  const q = cleanIntentWords(query) || normalizeSearchText(query);
  const t = normalizeSearchText(text);

  if (!q) return true;
  if (t.includes(q)) return true;

  const queryWords = q.split(/\s+/);
  const textWords = t.split(/\s+/);

  return queryWords.every((qWord) => {
    if (t.includes(qWord)) return true;

    return textWords.some((tWord) => {
      if (tWord.includes(qWord)) return true;

      const maxTypos = qWord.length <= 3 ? 0 : qWord.length <= 5 ? 1 : qWord.length <= 8 ? 2 : 3;
      if (getEditDistance(qWord, tWord) <= maxTypos) return true;

      if (tWord.length > qWord.length) {
        return getEditDistance(qWord, tWord.slice(0, qWord.length)) <= maxTypos;
      }

      return false;
    });
  });
};

const getSearchScore = (query, text) => {
  const q = cleanIntentWords(query) || normalizeSearchText(query);
  const t = normalizeSearchText(text);
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 88;
  if (t.includes(q)) return 72;

  const qWords = q.split(/\s+/);
  const tWords = t.split(/\s+/);
  return qWords.reduce((score, qWord) => {
    const bestDistance = Math.min(...tWords.map((tWord) => getEditDistance(qWord, tWord.slice(0, qWord.length))));
    return score + Math.max(0, 42 - bestDistance * 10);
  }, 0);
};

const toLngLat = ([lat, lng]) => [lng, lat];

const spiderMarkerSvg = (className = '') => `
  <svg class="spider-marker-svg ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="12 4, 15 7, 15 15, 12 18, 9 15, 9 7" fill="currentColor" fill-opacity="0.15" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" fill-opacity="0.1" />
    <path d="M12 4 L12 18" stroke-width="1" stroke-dasharray="2 2" opacity="0.7" />
    <path d="M9 7 L3 1 L1 4" />
    <path d="M9 10 L2 5 L0 9" />
    <path d="M15 7 L21 1 L23 4" />
    <path d="M15 10 L22 5 L24 9" />
    <path d="M9 15 L3 23 L1 20" />
    <path d="M9 12 L2 17 L0 13" />
    <path d="M15 15 L21 23 L23 20" />
    <path d="M15 12 L22 17 L24 13" />
    <circle cx="10.5" cy="5.5" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="5.5" r="0.5" fill="currentColor" />
  </svg>
`;

const getDistanceMeters = (a, b) => {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const earthRadius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
};

const getBearingDegrees = (from, to) => {
  if (!from || !to) return 0;
  const [lat1, lng1] = from.map((value) => (value * Math.PI) / 180);
  const [lat2, lng2] = to.map((value) => (value * Math.PI) / 180);
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const formatRouteInstruction = (step) => {
  const maneuver = step?.maneuver || {};
  const roadName = step?.name ? ` ${step.name}` : '';
  const modifier = maneuver.modifier || '';
  const distance = step?.distance ? Math.max(10, Math.round(step.distance / 10) * 10) : 0;
  const distanceText = distance ? `${distance} m` : 'soon';

  if (maneuver.type === 'arrive') return 'Arrive at destination';
  if (maneuver.type === 'depart') return `Go straight${roadName}`;
  if (modifier.includes('left')) return `Turn left in ${distanceText}${roadName}`;
  if (modifier.includes('right')) return `Turn right in ${distanceText}${roadName}`;
  if (modifier.includes('straight')) return `Go straight for ${distanceText}${roadName}`;
  if (maneuver.type === 'roundabout') return `Enter roundabout in ${distanceText}${roadName}`;
  return `Continue for ${distanceText}${roadName}`;
};

const getEstimatedRouteMinutes = (distanceKm, mode) => (
  Math.max(1, Math.round((distanceKm / mode.speedFallbackKmh) * 60))
);

const getNearestRouteDistance = (point, routeCoordinates = []) => (
  routeCoordinates.reduce((nearest, routePoint) => (
    Math.min(nearest, getDistanceMeters(point, routePoint))
  ), Number.POSITIVE_INFINITY)
);

const makeCirclePolygon = ([lat, lng], radiusMeters, steps = 48) => {
  const coords = [];
  const earthRadius = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const angularDistance = radiusMeters / earthRadius;

  for (let i = 0; i <= steps; i += 1) {
    const bearing = (i / steps) * Math.PI * 2;
    const pointLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance)
      + Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const pointLng = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(pointLat)
    );
    coords.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }

  return coords;
};

const MAP_STYLE_URLS = {
  dark: 'https://tiles.openfreemap.org/styles/liberty',
  light: 'https://tiles.openfreemap.org/styles/positron',
  normal: 'https://tiles.openfreemap.org/styles/liberty',
  satellite: 'satellite'
};

const vectorStyleCache = new Map();
const getMinZoomForStyle = () => 2.35;

const applyEnglishLabels = (style) => ({
  ...style,
  layers: style.layers.map((layer) => {
    if (layer.type !== 'symbol' || !layer.layout?.['text-field']) return layer;
    return {
      ...layer,
      layout: {
        ...layer.layout,
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']],
        'text-optional': true
      }
    };
  })
});

const loadEnglishVectorStyle = async (styleName = 'normal') => {
  const styleUrl = MAP_STYLE_URLS[styleName] || MAP_STYLE_URLS.normal;
  if (vectorStyleCache.has(styleUrl)) return structuredClone(vectorStyleCache.get(styleUrl));

  if (styleUrl === 'satellite') {
    const labelsResponse = await fetch(MAP_STYLE_URLS.normal);
    if (!labelsResponse.ok) throw new Error('Satellite labels failed');
    const labelStyle = applyEnglishLabels(await labelsResponse.json());
    const satelliteLabelPaint = {
      'text-color': '#f8fafc',
      'text-halo-color': '#020617',
      'text-halo-width': 2,
      'text-halo-blur': 0.35
    };
    const bigLabelLayerIds = ['country', 'state', 'province', 'water_name', 'waterway'];
    const isBigLabelLayer = (layer) => (
      bigLabelLayerIds.some((key) => layer.id.includes(key) || layer['source-layer']?.includes(key))
    );
    const satelliteLabelLayers = labelStyle.layers
      .filter((layer) => layer.type === 'symbol' && layer.layout?.['text-field'])
      .map((layer) => ({
        ...layer,
        minzoom: isBigLabelLayer(layer) ? Math.max(layer.minzoom || 0, 0) : Math.max(layer.minzoom || 0, 8),
        maxzoom: layer.maxzoom,
        paint: {
          ...(layer.paint || {}),
          ...satelliteLabelPaint
        }
      }));
    const roadClassFilter = [
      'match',
      ['get', 'class'],
      ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'],
      true,
      false
    ];
    const majorRoadFilter = [
      'match',
      ['get', 'class'],
      ['motorway', 'trunk', 'primary', 'secondary'],
      true,
      false
    ];
    const roadCasingLayer = {
      id: 'satellite-road-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 8,
      filter: roadClassFilter,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(5, 10, 18, 0.82)',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.4,
          10, 1.5,
          14, 4.2,
          17, 8
        ]
      }
    };
    const majorRoadLayer = {
      id: 'satellite-road-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 8,
      filter: majorRoadFilter,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': [
          'match',
          ['get', 'class'],
          ['motorway', 'trunk'],
          '#f4c542',
          ['primary', 'secondary'],
          '#f8f2df',
          '#e9edf3'
        ],
        'line-opacity': 0.92,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.25,
          10, 1.1,
          14, 3.2,
          17, 6.4
        ]
      }
    };
    const minorRoadLayer = {
      id: 'satellite-road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 11,
      filter: [
        'match',
        ['get', 'class'],
        ['tertiary', 'minor', 'service'],
        true,
        false
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#edf2f7',
        'line-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 0,
          12, 0.48,
          15, 0.78
        ],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 0.2,
          14, 1.5,
          17, 3.8
        ]
      }
    };

    const satelliteStyle = {
      version: 8,
      glyphs: labelStyle.glyphs,
      sprite: labelStyle.sprite,
      sources: {
        satellite: {
          type: 'raster',
          tiles: [
            'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg'
          ],
          minzoom: 0,
          maxzoom: 14,
          tileSize: 256,
          attribution: 'EOX Sentinel-2 cloudless'
        },
        openmaptiles: labelStyle.sources.openmaptiles
      },
      layers: [
        {
          id: 'satellite-background',
          type: 'background',
          paint: { 'background-color': '#071827' }
        },
        {
          id: 'satellite',
          type: 'raster',
          source: 'satellite',
          paint: { 'raster-saturation': 0.08, 'raster-contrast': 0.08 }
        },
        roadCasingLayer,
        minorRoadLayer,
        majorRoadLayer,
        ...satelliteLabelLayers
      ]
    };
    vectorStyleCache.set(styleUrl, structuredClone(satelliteStyle));
    return satelliteStyle;
  }

  const response = await fetch(styleUrl);
  if (!response.ok) throw new Error('Vector style failed');
  const style = applyEnglishLabels(await response.json());

  vectorStyleCache.set(styleUrl, structuredClone(style));
  return style;
};

export default function App() {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState(DEFAULT_ACTIVE_LOCATION);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mapStyle, setMapStyle] = useState('dark');
  const [travelMode, setTravelMode] = useState('car');
  const [routeStartKey, setRouteStartKey] = useState('gps');
  const [routeCustomStartPlace, setRouteCustomStartPlace] = useState(null);
  const [routeFromQuery, setRouteFromQuery] = useState('My GPS location');
  const [lastUserLocation, setLastUserLocation] = useState(null);
  const [routeToQuery, setRouteToQuery] = useState('');
  const [routeSearchTarget, setRouteSearchTarget] = useState(null);
  const [routeActive, setRouteActive] = useState(false);
  const [routeMeta, setRouteMeta] = useState(null);
  const [routeAlternatives, setRouteAlternatives] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [navTelemetry, setNavTelemetry] = useState({ speedKmh: 0, coveredKm: 0, heading: 0, accuracy: null });
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true);
  const [mobileMode, setMobileMode] = useState('place');
  const [mobileNavMenuOpen, setMobileNavMenuOpen] = useState(false);
  const [mobileRecenterExpanded, setMobileRecenterExpanded] = useState(false);
  const [mobileSettingsPage, setMobileSettingsPage] = useState(null);
  const [speedUnit, setSpeedUnit] = useState('kmph');
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [incidentsActive, setIncidentsActive] = useState(true);
  const [constructionActive, setConstructionActive] = useState(true);
  const [spiderGridActive, setSpiderGridActive] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', body: '', isWarning: false });

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersLayerGroup = useRef([]);
  const constructionLayerGroup = useRef([]);
  const userLayerGroup = useRef([]);
  const alternativeRouteMarkersGroup = useRef([]);
  const routeEndpointMarkersGroup = useRef([]);
  const routeLineCoordinatesRef = useRef([]);
  const lastRouteEndpointsRef = useRef(null);
  const navTelemetryRef = useRef({ lastCoords: null, coveredMeters: 0, heading: 0 });
  const navRerouteRef = useRef({ lastRerouteAt: 0, offRouteHits: 0, currentStepIndex: 0 });
  const activeBaseStyleRef = useRef(mapStyle);
  const audioCtxRef = useRef(null);
  const hazardWatchIdRef = useRef(null);
  const warnedHazardsRef = useRef(new Set());

  const clearSearchState = () => {
    setSearchQuery('');
    setGlobalSuggestions([]);
    setGlobalSearchLoading(false);
  };

  const renderUserLocationMarker = (coords, { label = 'Your Location', heading = 0, variant = '' } = {}) => {
    const map = leafletMapInstance.current;
    if (!map || !coords) return;

    userLayerGroup.current.forEach((marker) => marker.remove());
    userLayerGroup.current = [];

    const userIcon = document.createElement('div');
    userIcon.className = `gps-marker spider-gps-marker ${variant}`.trim();
    userIcon.style.setProperty('--gps-heading', `${Math.round(heading || 0)}deg`);
    userIcon.innerHTML = spiderMarkerSvg('spider-marker-core');

    const marker = new maplibregl.Marker({ element: userIcon, anchor: 'center' })
      .setLngLat(toLngLat(coords))
      .setPopup(new maplibregl.Popup({ offset: 18 }).setText(label))
      .addTo(map);
    userLayerGroup.current.push(marker);
  };

  const searchablePlaces = useMemo(() => (
    [
      ...PUBLIC_SEARCH_PLACE_KEYS.map((key) => ({ key, place: placesDatabase[key] })),
      ...savedPlaces.map((place) => ({ key: place.id, place }))
    ].map(({ key, place }) => ({
      key,
      place,
      text: `${place.name} ${place.address} ${place.type} ${SEARCH_ALIASES[key] || ''}`
    }))
  ), [savedPlaces]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const localSuggestions = searchablePlaces
      .filter((item) => fuzzySearch(searchQuery, item.text))
      .map((item) => ({
        ...item,
        source: 'local',
        score: getSearchScore(searchQuery, item.text)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return [...localSuggestions, ...globalSuggestions].slice(0, 7);
  }, [globalSuggestions, searchQuery, searchablePlaces]);

  const routeSearchOptions = useMemo(() => {
    if (searchQuery.trim()) return searchSuggestions;

    return searchablePlaces.slice(0, 7).map((item, index) => ({
      ...item,
      source: 'quick',
      score: 20 - index
    }));
  }, [searchQuery, searchSuggestions, searchablePlaces]);

  const routeStartPlace = useMemo(() => (
    savedPlaces.find((place) => place.id === routeStartKey) || null
  ), [routeStartKey, savedPlaces]);

  useEffect(() => {
    const cleanedQuery = cleanIntentWords(searchQuery) || normalizeSearchText(searchQuery);
    if (cleanedQuery.length < 3) {
      setGlobalSuggestions([]);
      setGlobalSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setGlobalSearchLoading(true);
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanedQuery)}&limit=5&lang=en`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Photon search failed');
        const payload = await response.json();
        const features = Array.isArray(payload.features) ? payload.features : [];

        setGlobalSuggestions(
          features
            .map((feature, index) => {
              const [lng, lat] = feature.geometry?.coordinates || [];
              const props = feature.properties || {};
              if (typeof lat !== 'number' || typeof lng !== 'number') return null;
              const name = props.name || props.city || props.state || props.country || cleanedQuery;
              const address = [props.street, props.city, props.state, props.country].filter(Boolean).join(', ');
              return {
                key: `photon-${props.osm_id || index}-${lat}-${lng}`,
                source: 'photon',
                score: 40 - index,
                place: {
                  name,
                  coords: [lat, lng],
                  address: address || props.country || 'Global map result',
                  temp: '--',
                  traffic: 'Traffic data unavailable for this global result',
                  type: props.osm_value || props.osm_key || 'global'
                }
              };
            })
            .filter(Boolean)
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          setGlobalSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setGlobalSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    readSavedPlaces()
      .then((places) => {
        if (!cancelled) setSavedPlaces(places);
      })
      .catch(() => {
        if (!cancelled) triggerToast("Saved Places", "Could not load saved places from this browser.", true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (routeStartKey !== 'gps' && routeStartKey !== 'custom' && !savedPlaces.some((place) => place.id === routeStartKey)) {
      setRouteStartKey('gps');
    }
  }, [routeStartKey, savedPlaces]);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
        maplibregl.workerCount = Math.min(6, Math.max(2, navigator.hardwareConcurrency - 1));
      }

      const style = await loadEnglishVectorStyle(mapStyle);
      if (cancelled) return;
      const isCompactViewport = window.matchMedia?.('(max-width: 768px)').matches;
      const minZoom = getMinZoomForStyle(mapStyle);

      const map = new maplibregl.Map({
        container: mapRef.current,
        style,
        center: [78.4990, 17.5177],
        zoom: isCompactViewport ? 12.4 : 13,
        minZoom,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        fadeDuration: 0,
        crossSourceCollisions: false,
        refreshExpiredTiles: false,
        maxTileCacheSize: isCompactViewport ? 48 : 128,
        maxPitch: 0,
        renderWorldCopies: true,
        collectResourceTiming: false
      });

      leafletMapInstance.current = map;

      map.on('load', () => {
        if (cancelled) return;
        activeBaseStyleRef.current = mapStyle;
        setLeafletLoaded(true);
        updateTileLayer();
        renderMarkers();
        if (incidentsActive && routeActive) renderIncidents();
        if (constructionActive && routeActive) renderConstructionZones();
        if (spiderGridActive) renderSpiderGrid(activeLocation.coords);

        const preloadStyles = () => {
          Object.keys(MAP_STYLE_URLS)
            .filter((styleName) => styleName !== mapStyle)
            .forEach((styleName) => {
              loadEnglishVectorStyle(styleName).catch(() => {});
            });
        };
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(preloadStyles);
        } else {
          window.setTimeout(preloadStyles, 1200);
        }
      });

      map.once('idle', () => {
        if (cancelled) return;
        updateTileLayer();
      });

      map.on('click', handleMapClick);
    };

    initMap().catch(() => {
      triggerToast("Vector Map", "MapLibre vector map could not load.", true);
    });

    return () => {
      cancelled = true;
      markersLayerGroup.current.forEach((marker) => marker.remove());
      constructionLayerGroup.current.forEach((marker) => marker.remove());
      userLayerGroup.current.forEach((marker) => marker.remove());
      leafletMapInstance.current?.remove();
      leafletMapInstance.current = null;
    };
  }, []);

  const updateTileLayer = () => {
    const map = leafletMapInstance.current;
    if (!map) return;

    const container = map.getContainer();
    container.classList.remove('spider-map-dark', 'spider-map-light', 'spider-map-normal', 'spider-map-satellite');
    if (mapStyle === 'light') {
      container.classList.add('spider-map-light');
    } else if (mapStyle === 'normal') {
      container.classList.add('spider-map-normal');
    } else if (mapStyle === 'satellite') {
      container.classList.add('spider-map-satellite');
    } else {
      container.classList.add('spider-map-dark');
    }
  };

  // Trigger style theme class change when state alters.
  useEffect(() => {
    updateTileLayer();
  }, [mapStyle, leafletLoaded]);

  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded || activeBaseStyleRef.current === mapStyle) return undefined;

    let cancelled = false;

    loadEnglishVectorStyle(mapStyle)
      .then((nextStyle) => {
        if (cancelled || !leafletMapInstance.current) return;
        activeBaseStyleRef.current = mapStyle;
        const nextMinZoom = getMinZoomForStyle(mapStyle);
        map.getContainer().classList.add('spider-map-switching');
        map.setMinZoom(nextMinZoom);
        if (map.getZoom() < nextMinZoom) {
          map.setZoom(nextMinZoom);
        }
        map.setStyle(nextStyle, { diff: false });
        map.once('idle', () => {
          if (cancelled) return;
          map.getContainer().classList.remove('spider-map-switching');
          updateTileLayer();
          renderMarkers();
          renderAlternativeRoutes(routeAlternatives.filter((route) => route.id !== selectedRouteId));
          renderRouteLine(routeLineCoordinatesRef.current);
          if (lastRouteEndpointsRef.current) {
            const { start, end, startLabel, label } = lastRouteEndpointsRef.current;
            renderRouteEndpointMarkers(routeLineCoordinatesRef.current[0] || start, routeLineCoordinatesRef.current.at(-1) || end, startLabel, label);
          }
          if (incidentsActive && routeActive) renderIncidents();
          if (constructionActive && routeActive) renderConstructionZones();
          if (spiderGridActive) renderSpiderGrid(activeLocation.coords);
        });
      })
      .catch(() => {
        map.getContainer().classList.remove('spider-map-switching');
        triggerToast("Map Style", "Could not switch the vector map style.", true);
      });

    return () => {
      cancelled = true;
    };
  }, [mapStyle, leafletLoaded]);

  useEffect(() => {
    renderMarkers();
  }, [savedPlaces, leafletLoaded]);

  useEffect(() => {
    if (spiderGridActive) {
      renderSpiderGrid(activeLocation.coords);
    } else {
      clearMapLibreLayer('spider-grid-line');
      clearMapLibreLayer('spider-grid-fill');
    }
  }, [spiderGridActive, activeLocation]);

  const clearMapLibreLayer = (id) => {
    const map = leafletMapInstance.current;
    if (!map) return;
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);
  };

  const clearRouteLine = () => {
    clearMapLibreLayer('route-line-casing');
    clearMapLibreLayer('route-line');
  };

  const clearRouteEndpointMarkers = () => {
    routeEndpointMarkersGroup.current.forEach((marker) => marker.remove());
    routeEndpointMarkersGroup.current = [];
  };

  const renderRouteEndpointMarkers = (start, end, startLabel = 'Start', endLabel = 'Destination') => {
    const map = leafletMapInstance.current;
    if (!map || !start || !end) return;
    clearRouteEndpointMarkers();

    const startEl = document.createElement('div');
    startEl.className = 'route-endpoint-marker route-start-marker';
    startEl.title = startLabel;
    startEl.innerHTML = spiderMarkerSvg('spider-marker-core');
    const startMarker = new maplibregl.Marker({ element: startEl, anchor: 'center' })
      .setLngLat(toLngLat(start))
      .setPopup(new maplibregl.Popup({ offset: 18 }).setText(startLabel))
      .addTo(map);

    const endEl = document.createElement('div');
    endEl.className = 'route-endpoint-marker route-destination-marker';
    endEl.title = endLabel;
    endEl.innerHTML = `<span></span><strong>${endLabel}</strong>`;
    const endMarker = new maplibregl.Marker({ element: endEl, anchor: 'bottom' })
      .setLngLat(toLngLat(end))
      .setPopup(new maplibregl.Popup({ offset: 18 }).setText(endLabel))
      .addTo(map);

    routeEndpointMarkersGroup.current = [startMarker, endMarker];
  };

  const renderRouteLine = (routeCoordinates) => {
    const map = leafletMapInstance.current;
    if (!map || !routeCoordinates?.length) return;
    clearRouteLine();
    map.addSource('route-line', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: routeCoordinates.map(toLngLat) },
        properties: {}
      }
    });
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-line',
      paint: {
        'line-color': '#ef4444',
        'line-width': 7,
        'line-opacity': 0.96
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    });
    map.addLayer({
      id: 'route-line-casing',
      type: 'line',
      source: 'route-line',
      paint: {
        'line-color': '#fecaca',
        'line-width': 11,
        'line-opacity': 0.32
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    }, 'route-line');
  };

  const renderAlternativeRoutes = (alternatives = []) => {
    const map = leafletMapInstance.current;
    if (!map) return;
    clearMapLibreLayer('route-alternatives');
    alternativeRouteMarkersGroup.current.forEach((marker) => marker.remove());
    alternativeRouteMarkersGroup.current = [];
    const features = alternatives
      .filter((route) => route.coordinates?.length > 1)
      .map((route) => ({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: route.coordinates.map(toLngLat) },
        properties: { id: route.id, color: route.color || '#4f46e5' }
      }));

    if (!features.length) return;

    map.addSource('route-alternatives', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features }
    });
    map.addLayer({
      id: 'route-alternatives',
      type: 'line',
      source: 'route-alternatives',
      paint: {
        'line-color': '#94a3b8',
        'line-width': 3.5,
        'line-opacity': 0.34
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    });

    alternatives.forEach((route) => {
      if (!route.coordinates?.length) return;
      const midpoint = route.coordinates[Math.floor(route.coordinates.length / 2)];
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'alternative-route-label';
      el.style.setProperty('--route-color', route.color || '#4f46e5');
      el.innerHTML = `
        <strong>${route.timeDeltaLabel || route.label}</strong>
        <span>${route.distanceDeltaLabel || `${route.distanceKm.toFixed(1)} km`}</span>
      `;
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        handleSelectRouteAlternative(route);
      });
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(toLngLat(midpoint))
        .addTo(map);
      alternativeRouteMarkersGroup.current.push(marker);
    });
  };

  useEffect(() => {
    if (!leafletLoaded || !routeActive) return;
    renderAlternativeRoutes(routeAlternatives.filter((route) => route.id !== selectedRouteId));
  }, [leafletLoaded, routeActive, routeAlternatives, selectedRouteId]);

  const renderMarkers = () => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return;
    markersLayerGroup.current.forEach((marker) => marker.remove());
    markersLayerGroup.current = [];

    savedPlaces.forEach((item) => {
      const el = document.createElement('div');
      el.className = `spider-map-marker ${item.type}`;
      el.innerHTML = '<span></span>';
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        handleSelectLocation(item);
      });
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(toLngLat(item.coords))
        .addTo(map);
      markersLayerGroup.current.push(marker);
    });
  };

  const renderIncidents = () => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return;
    clearMapLibreLayer('incidents');

    const incidentPoints = [
      { coords: [17.5140, 78.4830], info: "Road construction slowing transit speed on highway NH 44." },
      { coords: [17.5280, 78.4650], info: "Minor intersection backup slowing local traffic paths." }
    ];

    map.addSource('incidents', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: incidentPoints.map((point) => ({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [makeCirclePolygon(point.coords, 300)] },
          properties: { info: point.info }
        }))
      }
    });
    map.addLayer({
      id: 'incidents',
      type: 'fill',
      source: 'incidents',
      paint: {
        'fill-color': '#ef4444',
        'fill-opacity': 0.2
      }
    });
  };

  const renderConstructionZones = () => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return;
    constructionLayerGroup.current.forEach((marker) => marker.remove());
    constructionLayerGroup.current = [];
    clearMapLibreLayer('hazard-radius');

    const hazardMeta = {
      construction: { color: '#f97316', label: '!', short: 'Roadwork' },
      flyover: { color: '#38bdf8', label: '^', short: 'Flyover' },
      'speed-breaker': { color: '#facc15', label: '~', short: 'Speed breaker' },
      'school-zone': { color: '#22c55e', label: 'S', short: 'School zone' },
      'accident-turn': { color: '#ef4444', label: '!', short: 'Risk turn' }
    };

    map.addSource('hazard-radius', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: HYDERABAD_LOCAL_HAZARDS.map((zone) => {
          const meta = hazardMeta[zone.type] || hazardMeta.construction;
          return {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [makeCirclePolygon(zone.coords, zone.radius)] },
            properties: { color: meta.color }
          };
        })
      }
    });
    map.addLayer({
      id: 'hazard-radius',
      type: 'fill',
      source: 'hazard-radius',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.1
      }
    });

    HYDERABAD_LOCAL_HAZARDS.forEach((zone) => {
      const meta = hazardMeta[zone.type] || hazardMeta.construction;
      const el = document.createElement('div');
      el.className = 'hazard-marker';
      el.style.setProperty('--hazard-color', meta.color);
      el.title = meta.short;
      el.innerHTML = `<span>${meta.label}</span>`;
      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(`
        <div class="construction-popup">
          <strong>${zone.name}</strong>
          <span>${zone.status}</span>
          <p>${zone.note}</p>
        </div>
      `);
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(toLngLat(zone.coords))
        .setPopup(popup)
        .addTo(map);
      constructionLayerGroup.current.push(marker);
    });
  };

  const getConstructionHitsForRoute = (routeCoordinates) => {
    if (!leafletMapInstance.current || !routeCoordinates.length) return [];

    return HYDERABAD_LOCAL_HAZARDS.filter((zone) => (
      routeCoordinates.some((point) => (
        getDistanceMeters(point, zone.coords) <= zone.warnDistance
      ))
    ));
  };

  const renderSpiderGrid = (center = activeLocation.coords) => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return;
    clearMapLibreLayer('spider-grid-fill');
    clearMapLibreLayer('spider-grid-line');

    const [lat, lng] = center;
    const circleFeatures = [900, 1800].map((radius) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [makeCirclePolygon(center, radius)] },
      properties: {}
    }));
    const spokeFeatures = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const end = [
        lat + Math.cos(angle) * 0.015,
        lng + Math.sin(angle) * 0.015
      ];
      spokeFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [toLngLat(center), toLngLat(end)] },
        properties: {}
      });
    }
    map.addSource('spider-grid-fill', { type: 'geojson', data: { type: 'FeatureCollection', features: circleFeatures } });
    map.addLayer({
      id: 'spider-grid-fill',
      type: 'line',
      source: 'spider-grid-fill',
      paint: { 'line-color': '#06b6d4', 'line-opacity': 0.12, 'line-width': 1 }
    });
    map.addSource('spider-grid-line', { type: 'geojson', data: { type: 'FeatureCollection', features: spokeFeatures } });
    map.addLayer({
      id: 'spider-grid-line',
      type: 'line',
      source: 'spider-grid-line',
      paint: { 'line-color': '#06b6d4', 'line-opacity': 0.11, 'line-width': 1, 'line-dasharray': [4, 4] }
    });
  };

  // Handle layer toggles
  useEffect(() => {
    if (incidentsActive && routeActive) {
      renderIncidents();
    } else {
      clearMapLibreLayer('incidents');
    }
  }, [incidentsActive, routeActive]);

  useEffect(() => {
    if (constructionActive && routeActive) {
      renderConstructionZones();
    } else {
      constructionLayerGroup.current.forEach((marker) => marker.remove());
      constructionLayerGroup.current = [];
      clearMapLibreLayer('hazard-radius');
    }
  }, [constructionActive, routeActive]);

  const checkNearbyHazards = (coords) => {
    const nearby = HYDERABAD_LOCAL_HAZARDS.find((hazard) => (
      getDistanceMeters(coords, hazard.coords) <= hazard.warnDistance
      && !warnedHazardsRef.current.has(hazard.id)
    ));

    if (nearby) {
      warnedHazardsRef.current.add(nearby.id);
      triggerToast("Hazard Ahead", `${nearby.status} ahead: ${nearby.name}`, true);
    }
  };

  useEffect(() => {
    if (hazardWatchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(hazardWatchIdRef.current);
      hazardWatchIdRef.current = null;
    }

    if (travelMode !== 'tracking' || routeStartKey !== 'gps' || !navigator.geolocation) return undefined;

    warnedHazardsRef.current = new Set();
    hazardWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        checkNearbyHazards(coords);
      },
      () => {
        triggerToast("Tracking GPS", "GPS tracking is unavailable or blocked.", true);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (hazardWatchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(hazardWatchIdRef.current);
        hazardWatchIdRef.current = null;
      }
    };
  }, [routeStartKey, travelMode]);

  useEffect(() => {
    if (mobileMode !== 'nav' || !navigator.geolocation) {
      navTelemetryRef.current = { lastCoords: null, coveredMeters: 0, heading: 0 };
      setNavTelemetry({ speedKmh: 0, coveredKm: 0, heading: 0, accuracy: null });
      return undefined;
    }

    navTelemetryRef.current = { lastCoords: lastUserLocation?.coords || null, coveredMeters: 0, heading: 0 };
    navRerouteRef.current = { lastRerouteAt: 0, offRouteHits: 0, currentStepIndex: 0 };
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        const speedKmh = Math.max(0, ((position.coords.speed || 0) * 3.6));
        const previous = navTelemetryRef.current.lastCoords;
        const heading = Number.isFinite(position.coords.heading)
          ? position.coords.heading
          : previous
            ? getBearingDegrees(previous, coords)
            : navTelemetryRef.current.heading;
        let coveredMeters = navTelemetryRef.current.coveredMeters;

        if (previous) {
          const delta = getDistanceMeters(previous, coords);
          if (delta < 300) coveredMeters += delta;
        }

        navTelemetryRef.current = { lastCoords: coords, coveredMeters, heading };
        setNavTelemetry({
          speedKmh,
          coveredKm: coveredMeters / 1000,
          heading,
          accuracy: position.coords.accuracy || null
        });
        renderUserLocationMarker(coords, { label: 'Current location', heading, variant: 'live' });
        if (leafletMapInstance.current) {
          leafletMapInstance.current.easeTo({
            center: toLngLat(coords),
            bearing: heading,
            zoom: Math.max(leafletMapInstance.current.getZoom(), 16),
            duration: 650
          });
        }

        const destination = lastRouteEndpointsRef.current?.end;
        if (destination) {
          const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];
          const remainingKm = getDistanceMeters(coords, destination) / 1000;
          const liveSpeed = speedKmh > 3 ? speedKmh : selectedMode.speedFallbackKmh;
          const remainingMinutes = Math.max(1, Math.round((remainingKm / liveSpeed) * 60));
          const fuelLiters = selectedMode.fuelKmPerLiter ? Math.max(0.1, remainingKm / selectedMode.fuelKmPerLiter) : 0;
          const routeDistance = getNearestRouteDistance(coords, routeLineCoordinatesRef.current);
          const now = Date.now();

          if (Number.isFinite(routeDistance) && routeDistance > 90) {
            navRerouteRef.current.offRouteHits += 1;
          } else {
            navRerouteRef.current.offRouteHits = 0;
          }

          if (
            navRerouteRef.current.offRouteHits >= 2
            && now - navRerouteRef.current.lastRerouteAt > 15000
          ) {
            navRerouteRef.current.offRouteHits = 0;
            rerouteFromCurrentPosition(coords);
          }

          setRouteMeta((current) => {
            if (!current) return current;
            const stepsWithCoords = current.steps?.filter((step) => step.coords) || [];
            const currentStepIndex = navRerouteRef.current.currentStepIndex || 0;
            const upcomingStep = stepsWithCoords
              .slice(currentStepIndex)
              .map((step, offset) => ({
                ...step,
                index: currentStepIndex + offset,
                metersAway: getDistanceMeters(coords, step.coords)
              }))
              .sort((a, b) => a.metersAway - b.metersAway)[0];

            if (upcomingStep && upcomingStep.metersAway < 35) {
              navRerouteRef.current.currentStepIndex = Math.min(upcomingStep.index + 1, stepsWithCoords.length - 1);
            }

            const nextStep = stepsWithCoords[navRerouteRef.current.currentStepIndex] || upcomingStep;
            const stepDistance = nextStep?.coords ? getDistanceMeters(coords, nextStep.coords) : 0;
            const liveInstruction = nextStep
              ? nextStep.instruction.replace(/in \d+ m/, `in ${Math.max(10, Math.round(stepDistance / 10) * 10)} m`)
              : current.instruction;

            return {
              ...current,
              distance: `${remainingKm.toFixed(1)} km`,
              duration: `${remainingMinutes} min`,
              fuel: `${fuelLiters.toFixed(1)} L`,
              instruction: liveInstruction,
              offRouteDistance: Number.isFinite(routeDistance) ? routeDistance : null
            };
          });
        }
      },
      () => {
        setNavTelemetry((current) => ({ ...current, speedKmh: 0 }));
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [mobileMode, travelMode]);

  const handleSelectLocation = (location) => {
    playClickSound();
    if (mobileMode === 'nav') {
      rerouteNavigationToPlace(location);
      return;
    }
    clearSearchState();
    setActiveLocation(location);
    setMobileSheetOpen(true);
    setMobileMode('place');
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo({ center: toLngLat(location.coords), zoom: 15, duration: 1200 });
    }
    if (spiderGridActive) {
      renderSpiderGrid(location.coords);
    }
    triggerToast("Location Selected", `Map navigated to ${location.name}.`, false);
  };

  const createSearchDestination = () => {
    const query = searchQuery.trim();
    if (!query) return activeLocation;

    const currentName = normalizeSearchText(activeLocation.name);
    const currentAddress = normalizeSearchText(activeLocation.address);
    const normalizedQuery = normalizeSearchText(query);

    if (
      isRouteDestination(activeLocation) &&
      (currentName.includes(normalizedQuery) || normalizedQuery.includes(currentName) || currentAddress.includes(normalizedQuery))
    ) {
      return activeLocation;
    }

    const directMatch = resolvePlaceFromText(query, null);
    if (directMatch && directMatch.type !== 'search') return directMatch;

    const bestMatch = searchSuggestions[0]?.place;
    if (bestMatch) return bestMatch;

    const randomLat = 17.5177 + (Math.random() - 0.5) * 0.04;
    const randomLng = 78.4990 + (Math.random() - 0.5) * 0.04;
    return {
      name: query,
      coords: [randomLat, randomLng],
      address: `Located coordinate within Alwal area bounds`,
      temp: "31°C",
      traffic: "Route estimate available from your selected start point",
      type: "search"
    };
  };

  const resolvePlaceFromText = (value, fallback = activeLocation) => {
    const query = value.trim();
    if (!query) return fallback;
    if (normalizeSearchText(query) === 'my gps location') return null;

    const bestLocal = searchablePlaces
      .map((place) => {
        const text = `${place.name} ${place.address} ${SEARCH_ALIASES[place.key] || ''}`;
        return { place, score: getSearchScore(query, text) };
      })
      .filter((item) => item.score > 0 || fuzzySearch(query, `${item.place.name} ${item.place.address}`))
      .sort((a, b) => b.score - a.score)[0]?.place;

    if (bestLocal) return bestLocal;

    const bestGlobal = globalSuggestions.find((suggestion) => fuzzySearch(query, `${suggestion.place.name} ${suggestion.place.address}`))?.place;
    if (bestGlobal) return bestGlobal;

    const randomLat = 17.5177 + (Math.random() - 0.5) * 0.04;
    const randomLng = 78.4990 + (Math.random() - 0.5) * 0.04;
    return {
      name: query,
      coords: [randomLat, randomLng],
      address: `Located coordinate within Alwal area bounds`,
      temp: "31°C",
      traffic: "Route estimate available from your selected start point",
      type: "search"
    };
  };

  useEffect(() => {
    setRouteToQuery(isRouteDestination(activeLocation) ? activeLocation.name : '');
  }, [activeLocation]);

  const drawRouteBetween = async (start, end, label = "destination", modeId = travelMode, startLabel = "Selected start", waypoint = null, allowModeFallback = true) => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return null;

    clearRouteLine();
    lastRouteEndpointsRef.current = { start, end, label, startLabel, waypoint };
    const selectedMode = TRAVEL_MODES.find((mode) => mode.id === modeId) || TRAVEL_MODES[0];
    const routeSummary = waypoint
      ? `${startLabel} to ${label} via ${waypoint.name}`
      : `${startLabel} to ${label}`;

    const drawRouteLine = (routeCoordinates, alternatives = []) => {
      routeLineCoordinatesRef.current = routeCoordinates;
      renderAlternativeRoutes(alternatives);
      renderRouteLine(routeCoordinates);
      renderRouteEndpointMarkers(routeCoordinates[0] || start, routeCoordinates.at(-1) || end, startLabel, label);
      const bounds = routeCoordinates.reduce(
        (box, coord) => box.extend(toLngLat(coord)),
        new maplibregl.LngLatBounds(toLngLat(routeCoordinates[0]), toLngLat(routeCoordinates[0]))
      );
      map.fitBounds(bounds, { padding: 70, duration: 900 });
    };

    const buildRouteCandidate = (candidate, index, candidateLabel = null) => {
      const coordinates = candidate.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKmValue = candidate.distance / 1000;
      const minutesValue = getEstimatedRouteMinutes(distanceKmValue, selectedMode);
      const fuelValue = selectedMode.fuelKmPerLiter ? Math.max(0.1, distanceKmValue / selectedMode.fuelKmPerLiter) : 0;
      return {
        id: `route-${index}`,
        index,
        coordinates,
        distanceKm: distanceKmValue,
        durationMinutes: minutesValue,
        fuelLiters: fuelValue,
        label: candidateLabel || (index === 0 ? 'Fastest route' : `Alternative ${index + 1}`),
        steps: candidate.legs?.flatMap((leg) => leg.steps || []) || []
      };
    };

    const routeSimilarity = (a, b) => {
      if (!a?.length || !b?.length) return 0;
      const sample = a.filter((_, index) => index % Math.max(1, Math.floor(a.length / 18)) === 0).slice(0, 18);
      const closePoints = sample.filter((point) => getNearestRouteDistance(point, b) < 220).length;
      return closePoints / Math.max(1, sample.length);
    };

    const fetchWaypointAlternatives = async (primaryRoute) => {
      if (waypoint || selectedMode.osrmProfile !== 'driving') return [];

      const straightKm = getDistanceMeters(start, end) / 1000;
      if (straightKm < 3) return [];

      const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
      const latDiff = end[0] - start[0];
      const lngDiff = end[1] - start[1];
      const length = Math.hypot(latDiff, lngDiff) || 1;
      const normal = [-lngDiff / length, latDiff / length];
      const offset = Math.min(0.18, Math.max(0.025, straightKm / 380));
      const waypointCandidates = [
        [mid[0] + normal[0] * offset, mid[1] + normal[1] * offset],
        [mid[0] - normal[0] * offset, mid[1] - normal[1] * offset],
        [mid[0] + normal[0] * offset * 1.7, mid[1] + normal[1] * offset * 1.7],
        [mid[0] - normal[0] * offset * 1.7, mid[1] - normal[1] * offset * 1.7]
      ];

      const fetched = await Promise.allSettled(waypointCandidates.map(async (via, index) => {
        const points = `${start[1]},${start[0]};${via[1]},${via[0]};${end[1]},${end[0]}`;
        const response = await fetch(`https://router.project-osrm.org/route/v1/${selectedMode.osrmProfile}/${points}?overview=full&geometries=geojson&steps=true&alternatives=false`);
        if (!response.ok) throw new Error('Waypoint route failed');
        const payload = await response.json();
        const candidate = payload.routes?.[0];
        if (!candidate) throw new Error('No waypoint route');
        return buildRouteCandidate(candidate, index + 1, `Alternative ${index + 2}`);
      }));

      return fetched
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter((candidate) => (
          candidate.distanceKm <= primaryRoute.distanceKm * 1.75
          && routeSimilarity(candidate.coordinates, primaryRoute.coordinates) < 0.92
        ));
    };

    try {
      const routePoints = waypoint
        ? `${start[1]},${start[0]};${waypoint.coords[1]},${waypoint.coords[0]};${end[1]},${end[0]}`
        : `${start[1]},${start[0]};${end[1]},${end[0]}`;
      const routeUrl = `https://router.project-osrm.org/route/v1/${selectedMode.osrmProfile}/${routePoints}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      const response = await fetch(routeUrl);
      if (!response.ok) throw new Error('OSRM route request failed');
      const data = await response.json();
      const route = data.routes?.[0];
      if (!route) throw new Error('No OSRM route returned');

      let alternativeRoutes = (data.routes || []).map((candidate, index) => buildRouteCandidate(candidate, index));
      if (alternativeRoutes.length < 2 && alternativeRoutes[0]) {
        const waypointRoutes = await fetchWaypointAlternatives(alternativeRoutes[0]);
        waypointRoutes.forEach((candidate) => {
          const duplicate = alternativeRoutes.some((routeOption) => routeSimilarity(candidate.coordinates, routeOption.coordinates) > 0.94);
          if (!duplicate) {
            alternativeRoutes.push({
              ...candidate,
              id: `route-${alternativeRoutes.length}`,
              index: alternativeRoutes.length,
              label: `Alternative ${alternativeRoutes.length + 1}`
            });
          }
        });
      }
      const primaryRoute = alternativeRoutes[0];
      if (primaryRoute) {
        const alternativeColors = ['#ef4444', '#2563eb', '#7c3aed', '#0891b2', '#f97316', '#16a34a'];
        alternativeRoutes = alternativeRoutes.map((candidate) => {
          const minuteDiff = Math.round(candidate.durationMinutes - primaryRoute.durationMinutes);
          const distanceDiff = candidate.distanceKm - primaryRoute.distanceKm;
          const timeDeltaLabel = minuteDiff === 0
            ? 'Same ETA'
            : `${Math.abs(minuteDiff)} min ${minuteDiff > 0 ? 'slower' : 'faster'}`;
          const distanceDeltaLabel = Math.abs(distanceDiff) < 0.1
            ? `${candidate.distanceKm.toFixed(1)} km`
            : `${distanceDiff > 0 ? '+' : '-'}${Math.abs(distanceDiff).toFixed(1)} km`;
          return {
            ...candidate,
            color: alternativeColors[candidate.index % alternativeColors.length],
            timeDeltaLabel,
            distanceDeltaLabel
          };
        });
      }
      setRouteAlternatives(alternativeRoutes);
      setSelectedRouteId(alternativeRoutes[0]?.id || null);

      const routeCoordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      drawRouteLine(routeCoordinates, alternativeRoutes.slice(1));
      const distanceKm = route.distance / 1000;
      const durationMinutes = getEstimatedRouteMinutes(distanceKm, selectedMode);
      const fuelLiters = selectedMode.fuelKmPerLiter ? Math.max(0.1, distanceKm / selectedMode.fuelKmPerLiter) : 0;
      const constructionHits = getConstructionHitsForRoute(routeCoordinates);
      const routeSteps = route.legs?.flatMap((leg) => leg.steps || []) || [];
      const firstActionStep = routeSteps.find((step) => step.maneuver?.type !== 'depart') || routeSteps[0];

      setRouteMeta({
        distance: `${distanceKm.toFixed(1)} km`,
        duration: `${durationMinutes} min`,
        fuel: `${fuelLiters.toFixed(1)} L`,
        source: selectedMode.label,
        routeFrom: startLabel,
        routeTo: label,
        routeVia: waypoint?.name || null,
        routeSummary,
        estimateLabel: `${selectedMode.label} estimate`,
        instruction: formatRouteInstruction(firstActionStep),
        nextInstruction: firstActionStep?.name || label,
        steps: routeSteps.map((step) => ({
          instruction: formatRouteInstruction(step),
          distance: step.distance || 0,
          coords: step.maneuver?.location ? [step.maneuver.location[1], step.maneuver.location[0]] : null,
          name: step.name || ''
        })).slice(0, 12),
        constructionHits
      });
      setRouteActive(true);
      if (constructionHits.length) {
        triggerToast("Construction Zone", `Route passes near ${constructionHits[0].name}.`, true);
      } else {
        triggerToast("Navigation Started", `${selectedMode.label} route generated to ${label}.`, false);
      }
      return { distanceKm, durationMinutes, fuelLiters, constructionHits };
    } catch {
      if (allowModeFallback && selectedMode.id !== 'walking') {
        setTravelMode('walking');
        triggerToast("Walking Route", `${selectedMode.label} route was unavailable, showing walking instead.`, true);
        return drawRouteBetween(start, end, label, 'walking', startLabel, waypoint, false);
      }

      const fallbackRoute = waypoint ? [start, waypoint.coords, end] : [start, end];
      const distanceKm = fallbackRoute
        .slice(1)
        .reduce((total, coord, index) => total + getDistanceMeters(fallbackRoute[index], coord), 0) / 1000;
      const durationMinutes = getEstimatedRouteMinutes(distanceKm, selectedMode);
      const fuelLiters = selectedMode.fuelKmPerLiter ? Math.max(0.1, distanceKm / selectedMode.fuelKmPerLiter) : 0;
      const constructionHits = getConstructionHitsForRoute(fallbackRoute);
      setRouteAlternatives([]);
      setSelectedRouteId(null);
      drawRouteLine(fallbackRoute);
      setRouteMeta({
        distance: `${distanceKm.toFixed(1)} km`,
        duration: `${durationMinutes} min`,
        fuel: `${fuelLiters.toFixed(1)} L`,
        source: `${selectedMode.label} estimate`,
        routeFrom: startLabel,
        routeTo: label,
        routeVia: waypoint?.name || null,
        routeSummary,
        estimateLabel: `${selectedMode.label} estimate`,
        instruction: `Go straight towards ${label}`,
        nextInstruction: label,
        steps: [{ instruction: `Go straight towards ${label}`, distance: distanceKm * 1000, name: label }],
        constructionHits
      });
      setRouteActive(true);
      triggerToast("Navigation Started", "Live routing was unavailable, so a direct estimate was used.", true);
      return { distanceKm, durationMinutes, fuelLiters, constructionHits };
    }
  };

  const rerouteFromCurrentPosition = async (coords) => {
    const destination = lastRouteEndpointsRef.current?.end;
    const label = lastRouteEndpointsRef.current?.label;
    if (!destination || !label) return false;

    navRerouteRef.current.lastRerouteAt = Date.now();
    const currentLocation = {
      name: 'Current location',
      coords,
      address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
      temp: "--",
      traffic: "Live GPS reroute point",
      type: "gps"
    };
    setLastUserLocation(currentLocation);
    if (userLayerGroup.current) {
      renderUserLocationMarker(coords, { label: 'Current location', heading: navTelemetryRef.current.heading, variant: 'live' });
    }
    await drawRouteBetween(coords, destination, label, travelMode, 'Current location');
    setRouteFromQuery('Current location');
    triggerToast("Rerouting", "Wrong route detected. Corrected from your current GPS location.", true);
    return true;
  };

  const handleSelectRouteAlternative = (alternative) => {
    if (!alternative?.coordinates?.length) return;
    playClickSound();
    routeLineCoordinatesRef.current = alternative.coordinates;
    setSelectedRouteId(alternative.id);
    renderAlternativeRoutes(routeAlternatives.filter((route) => route.id !== alternative.id));
    renderRouteLine(alternative.coordinates);
    if (lastRouteEndpointsRef.current) {
      const { start, end, startLabel, label } = lastRouteEndpointsRef.current;
      renderRouteEndpointMarkers(alternative.coordinates[0] || start, alternative.coordinates.at(-1) || end, startLabel, label);
    }

    const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];
    const constructionHits = getConstructionHitsForRoute(alternative.coordinates);
    const firstActionStep = alternative.steps.find((step) => step.maneuver?.type !== 'depart') || alternative.steps[0];

    setRouteMeta((current) => ({
      ...current,
      distance: `${alternative.distanceKm.toFixed(1)} km`,
      duration: `${alternative.durationMinutes} min`,
      fuel: `${alternative.fuelLiters.toFixed(1)} L`,
      source: selectedMode.label,
      estimateLabel: alternative.label,
      instruction: formatRouteInstruction(firstActionStep),
      nextInstruction: firstActionStep?.name || current?.routeTo || 'destination',
      steps: alternative.steps.map((step) => ({
        instruction: formatRouteInstruction(step),
        distance: step.distance || 0,
        coords: step.maneuver?.location ? [step.maneuver.location[1], step.maneuver.location[0]] : null,
        name: step.name || ''
      })).slice(0, 12),
      constructionHits
    }));
    setRouteAlternatives((current) => [
      alternative,
      ...current.filter((route) => route.id !== alternative.id)
    ]);
    triggerToast(alternative.label, `${alternative.durationMinutes} min, ${alternative.distanceKm.toFixed(1)} km selected.`, false);
  };

  const rerouteNavigationToPlace = async (place) => {
    if (!isRouteDestination(place) || mobileMode !== 'nav') return false;

    const previousMinutes = Number.parseFloat(routeMeta?.duration || '');
    const currentDestination = lastRouteEndpointsRef.current?.end;
    const currentDestinationLabel = lastRouteEndpointsRef.current?.label || routeMeta?.routeTo;
    const liveStart = navTelemetryRef.current.lastCoords
      || lastUserLocation?.coords
      || lastRouteEndpointsRef.current?.start;

    if (!liveStart || !currentDestination || !currentDestinationLabel) {
      triggerToast("Route Start Missing", "Use GPS once or choose a start before changing the route.", true);
      setMobileMode('route');
      setMobileSheetOpen(true);
      return false;
    }

    const startLabel = navTelemetryRef.current.lastCoords
      ? 'Current location'
      : (lastUserLocation?.name || lastRouteEndpointsRef.current?.startLabel || 'Selected start');

    setRouteToQuery(currentDestinationLabel);
    setSearchQuery('');
    const nextRoute = await drawRouteBetween(liveStart, currentDestination, currentDestinationLabel, travelMode, startLabel, place);
    setMobileMode('nav');
    setMobileSheetOpen(false);
    setMobileNavMenuOpen(false);
    setMobileRecenterExpanded(false);

    if (nextRoute && Number.isFinite(previousMinutes)) {
      const diff = Math.round(nextRoute.durationMinutes - previousMinutes);
      if (diff === 0) {
        triggerToast("Route Changed", `Via ${place.name} is about the same ETA.`, false);
      } else if (diff < 0) {
        triggerToast("Faster Route", `Via ${place.name} is about ${Math.abs(diff)} min faster.`, false);
      } else {
        triggerToast("Slower Route", `Via ${place.name} is about ${diff} min slower.`, true);
      }
    } else {
      triggerToast("Route Changed", `Navigation to ${currentDestinationLabel} now goes via ${place.name}.`, false);
    }

    return true;
  };

  const handleDrawRoute = async (destinationArg = activeLocation, startOverride) => {
    playClickSound();
    if (!leafletMapInstance.current) return false;

    const destination = destinationArg?.coords ? destinationArg : activeLocation;

    if (!isRouteDestination(destination)) {
      triggerToast("Choose Destination", "Search or click a destination before starting directions.", true);
      return false;
    }

    const hasExplicitStart = startOverride !== undefined;
    const stateStartPlace = routeStartKey === 'custom' ? routeCustomStartPlace : routeStartPlace;
    const startPlace = hasExplicitStart ? startOverride : (routeStartKey !== 'gps' ? stateStartPlace : null);

    if (startPlace) {
      if (!startPlace) {
        triggerToast("Choose Start", "Save a place first, then choose it as your route start.", true);
        return false;
      }
      if (userLayerGroup.current) {
        renderUserLocationMarker(startPlace.coords, { label: `Start: ${startPlace.name}`, variant: 'selected-start' });
      }
      await drawRouteBetween(startPlace.coords, destination.coords, destination.name, travelMode, startPlace.name);
      triggerToast("Route Start", `Starting from ${startPlace.name}.`, false);
      return true;
    }

    if (!hasExplicitStart && routeStartKey !== 'gps') {
      triggerToast("Choose Start", "Save a place first, then choose it as your route start.", true);
      return false;
    }

    if (hasExplicitStart && startOverride === null && lastUserLocation) {
      if (userLayerGroup.current) {
        renderUserLocationMarker(lastUserLocation.coords, { label: lastUserLocation.name, heading: navTelemetryRef.current.heading, variant: 'live' });
      }
      setRouteFromQuery(lastUserLocation.name);
      await drawRouteBetween(lastUserLocation.coords, destination.coords, destination.name, travelMode, lastUserLocation.name);
      return true;
    }

    if (!navigator.geolocation) {
      triggerToast("Choose Start", "GPS is unavailable. Pick a start location from the selector.", true);
      return false;
    }

    triggerToast("Requesting GPS", "Allow location access to start live navigation.", false);
    try {
      const position = await getGpsPosition();
      const start = [position.coords.latitude, position.coords.longitude];
      const gpsStartLocation = {
        name: 'Your Location',
        coords: start,
        address: `${start[0].toFixed(5)}, ${start[1].toFixed(5)}`,
        temp: "--",
        traffic: position.coords.accuracy ? `Current GPS position selected, accuracy ${Math.round(position.coords.accuracy)} m` : "Current GPS position selected",
        type: "gps"
      };
      setLastUserLocation(gpsStartLocation);
      setRouteFromQuery(gpsStartLocation.name);
      if (userLayerGroup.current) {
        renderUserLocationMarker(start, { label: 'Your GPS location', heading: position.coords.heading || 0, variant: 'live' });
      }
      await drawRouteBetween(start, destination.coords, destination.name, travelMode, gpsStartLocation.name);
      return true;
    } catch (error) {
      try {
        const fallback = await getApproximateIpLocation();
        showUserLocation(fallback, { select: false });
        await drawRouteBetween(fallback.coords, destination.coords, destination.name, travelMode, 'Approximate location');
        triggerToast("Approx Route", `${getGpsErrorMessage(error)} Routing from approximate network location.`, true);
        return true;
      } catch {
        triggerToast("GPS Failed", `${getGpsErrorMessage(error)} Pick a saved start location if GPS is unavailable.`, true);
        setMobileMode('route');
        setMobileSheetOpen(true);
        return false;
      }
    }
  };

  const handleClearRoute = () => {
    playClickSound();
    routeLineCoordinatesRef.current = [];
    lastRouteEndpointsRef.current = null;
    navRerouteRef.current = { lastRerouteAt: 0, offRouteHits: 0, currentStepIndex: 0 };
    clearRouteLine();
    clearMapLibreLayer('route-alternatives');
    alternativeRouteMarkersGroup.current.forEach((marker) => marker.remove());
    alternativeRouteMarkersGroup.current = [];
    clearRouteEndpointMarkers();
    if (userLayerGroup.current) {
      userLayerGroup.current.forEach((marker) => marker.remove());
      userLayerGroup.current = [];
    }
    setRouteActive(false);
    setRouteMeta(null);
    setRouteAlternatives([]);
    setSelectedRouteId(null);
    triggerToast("Route Cleared", "Active map route lines have been removed.", false);
  };

  const handleCloseMobileSheet = () => {
    playClickSound();
    clearSearchState();
    setRouteSearchTarget(null);
    setLayersMenuOpen(false);
    setMobileNavMenuOpen(false);
    setMobileRecenterExpanded(false);
    setMobileMode('place');
    setMobileSheetOpen(false);
  };

  const handleMobileDirections = async () => {
    const destination = mobileMode === 'route' && isRouteDestinationText(routeToQuery)
      ? resolvePlaceFromText(routeToQuery, activeLocation)
      : createSearchDestination();
    if (!isRouteDestination(destination)) {
      triggerToast("Choose Destination", "Search or click a real destination first.", true);
      return;
    }
    const startPlace = mobileMode === 'route'
      ? (!isGpsStartText(routeFromQuery) ? resolvePlaceFromText(routeFromQuery, null) : null)
      : routeCustomStartPlace;
    setActiveLocation(destination);
    if (startPlace) {
      setRouteCustomStartPlace(startPlace);
      setRouteStartKey('custom');
      setRouteFromQuery(startPlace.name);
    } else if (mobileMode === 'route') {
      setRouteCustomStartPlace(null);
      setRouteStartKey('gps');
      setRouteFromQuery(lastUserLocation?.name || 'My GPS location');
    }
    setRouteToQuery(destination.name);
    setSearchQuery('');
    setMobileMode('route');
    setMobileSheetOpen(true);
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo({ center: toLngLat(destination.coords), zoom: 15, duration: 900 });
    }
    try {
      if (startPlace) {
        await drawRouteBetween(startPlace.coords, destination.coords, destination.name, travelMode, startPlace.name);
      } else {
        await handleDrawRoute(destination, null);
      }
    } finally {
      setMobileMode('route');
      setMobileSheetOpen(true);
    }
  };

  const refreshRouteFromEditor = async (nextStart = routeCustomStartPlace, nextDestination = activeLocation, forceGpsStart = false) => {
    const destination = !isRouteDestination(nextDestination) ? resolvePlaceFromText(routeToQuery, null) : nextDestination;
    if (!isRouteDestination(destination)) {
      triggerToast("Choose Destination", "Search a destination first.", true);
      return false;
    }

    setActiveLocation(destination);
    setRouteToQuery(destination.name);

    if (nextStart) {
      setRouteCustomStartPlace(nextStart);
      setRouteStartKey('custom');
      await drawRouteBetween(nextStart.coords, destination.coords, destination.name, travelMode, nextStart.name);
      triggerToast("Route Updated", `${nextStart.name} to ${destination.name}.`, false);
      return true;
    }

    if (!forceGpsStart && routeStartKey !== 'gps' && routeStartPlace) {
      await drawRouteBetween(routeStartPlace.coords, destination.coords, destination.name, travelMode, routeStartPlace.name);
      triggerToast("Route Updated", `${routeStartPlace.name} to ${destination.name}.`, false);
      return true;
    }

    return handleDrawRoute(destination, null);
  };

  const handleRouteSearchSelect = async (place) => {
    if (!routeSearchTarget || !place) return;

    playClickSound();
    setSearchQuery('');
    setMobileMode('route');
    setMobileSheetOpen(true);

    if (routeSearchTarget === 'from') {
      setRouteSearchTarget(null);
      setRouteFromQuery(place.name);
      const routeReady = await refreshRouteFromEditor(place, activeLocation);
      if (!routeReady) {
        setMobileMode('route');
        setMobileSheetOpen(true);
        setRouteSearchTarget(null);
      }
      return;
    }

    if (routeSearchTarget === 'via') {
      const destination = isRouteDestinationText(routeToQuery)
        ? resolvePlaceFromText(routeToQuery, activeLocation)
        : activeLocation;
      if (!isRouteDestination(destination)) {
        setRouteSearchTarget(null);
        setMobileMode('route');
        setMobileSheetOpen(true);
        triggerToast("Choose Destination", "Choose a destination before adding a via route.", true);
        return;
      }

      const start = routeStartKey === 'custom' && routeCustomStartPlace
        ? routeCustomStartPlace
        : lastUserLocation;
      if (!start) {
        setRouteSearchTarget(null);
        setMobileMode('route');
        setMobileSheetOpen(true);
        triggerToast("Choose Start", "Set GPS or a start place before changing the route.", true);
        return;
      }

      setRouteSearchTarget(null);
      setActiveLocation(destination);
      setRouteToQuery(destination.name);
      const nextRoute = await drawRouteBetween(start.coords, destination.coords, destination.name, travelMode, start.name, place);
      setMobileMode('route');
      setMobileSheetOpen(true);
      if (nextRoute) {
        triggerToast("Route Changed", `Route to ${destination.name} now goes via ${place.name}.`, false);
      }
      return;
    }

    setRouteSearchTarget(null);
    setRouteToQuery(place.name);
    setActiveLocation(place);
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo({ center: toLngLat(place.coords), zoom: 15, duration: 900 });
    }
    const customStart = routeStartKey === 'custom'
      ? routeCustomStartPlace
      : (!isGpsStartText(routeFromQuery) ? resolvePlaceFromText(routeFromQuery, null) : null);
    const routeReady = await refreshRouteFromEditor(customStart, place, !customStart);
    if (!routeReady) {
      setMobileMode('route');
      setMobileSheetOpen(true);
      setRouteSearchTarget(null);
    }
  };

  const openRouteSearch = (target) => {
    playClickSound();
    setRouteSearchTarget(target);
    const currentDestinationName = isRouteDestination(activeLocation) ? activeLocation.name : '';
    const destinationQuery = isRouteDestinationText(routeToQuery) ? routeToQuery : currentDestinationName;
    setSearchQuery(target === 'from' || target === 'via' ? '' : destinationQuery);
    setMobileSheetOpen(false);
  };

  const useGpsRouteStart = async () => {
    playClickSound();
    const destination = isRouteDestinationText(routeToQuery)
      ? resolvePlaceFromText(routeToQuery, activeLocation)
      : activeLocation;
    if (!isRouteDestination(destination)) {
      triggerToast("Choose Destination", "Pick a destination before changing the start to GPS.", true);
      return;
    }
    setRouteSearchTarget(null);
    setRouteCustomStartPlace(null);
    setRouteStartKey('gps');
    setRouteFromQuery(lastUserLocation?.name || 'My GPS location');
    setActiveLocation(destination);
    setRouteToQuery(destination.name);
    setMobileMode('route');
    setMobileSheetOpen(true);
    if (lastUserLocation) {
      await drawRouteBetween(lastUserLocation.coords, destination.coords, destination.name, travelMode, lastUserLocation.name);
      return true;
    }
    const routeReady = await refreshRouteFromEditor(null, destination, true);
    if (!routeReady) {
      setRouteSearchTarget(null);
      setMobileMode('route');
      setMobileSheetOpen(true);
    }
    return routeReady;
  };

  const handleMobileStart = async () => {
    const existingRoute = lastRouteEndpointsRef.current;
    const hasRenderableRoute = routeActive && routeMeta && routeLineCoordinatesRef.current.length > 1;
    if (hasRenderableRoute && existingRoute?.label && isRouteDestinationText(existingRoute.label)) {
      const fallbackDistanceKm = getDistanceMeters(existingRoute.start, existingRoute.end) / 1000;
      const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];
      const fallbackFuel = selectedMode.fuelKmPerLiter ? Math.max(0.1, fallbackDistanceKm / selectedMode.fuelKmPerLiter) : 0;

      setRouteFromQuery(existingRoute.startLabel || routeMeta?.routeFrom || 'Selected start');
      setRouteToQuery(existingRoute.label);
      setRouteActive(true);
      if (!routeMeta) {
        setRouteMeta({
          distance: `${fallbackDistanceKm.toFixed(1)} km`,
          duration: `${getEstimatedRouteMinutes(fallbackDistanceKm, selectedMode)} min`,
          fuel: `${fallbackFuel.toFixed(1)} L`,
          source: selectedMode.label,
          routeFrom: existingRoute.startLabel || 'Selected start',
          routeTo: existingRoute.label,
          routeSummary: `${existingRoute.startLabel || 'Selected start'} to ${existingRoute.label}`,
          estimateLabel: `${selectedMode.label} estimate`,
          instruction: `Go straight towards ${existingRoute.label}`,
          steps: [{ instruction: `Go straight towards ${existingRoute.label}`, distance: fallbackDistanceKm * 1000, name: existingRoute.label }],
          constructionHits: []
        });
      }
      if (!isRouteDestination(activeLocation)) {
        setActiveLocation({
          name: existingRoute.label,
          coords: existingRoute.end,
          address: routeMeta?.routeTo || existingRoute.label,
          temp: "--",
          traffic: "Route active",
          type: "route"
        });
      }
      setSearchQuery('');
      setLayersMenuOpen(false);
      setMobileNavMenuOpen(false);
      setMobileRecenterExpanded(false);
      setMobileMode('nav');
      setMobileSheetOpen(false);
      return;
    }

    const destination = mobileMode === 'route' && isRouteDestinationText(routeToQuery)
      ? resolvePlaceFromText(routeToQuery, activeLocation)
      : (isRouteDestination(activeLocation) ? activeLocation : createSearchDestination());
    if (!isRouteDestination(destination)) {
      triggerToast("Choose Destination", "Pick a destination before starting navigation.", true);
      return;
    }
    const startPlace = mobileMode === 'route'
      ? (!isGpsStartText(routeFromQuery) ? resolvePlaceFromText(routeFromQuery, null) : null)
      : routeCustomStartPlace;
    setActiveLocation(destination);
    if (startPlace) {
      setRouteCustomStartPlace(startPlace);
      setRouteStartKey('custom');
      setRouteFromQuery(startPlace.name);
    } else if (mobileMode === 'route') {
      setRouteCustomStartPlace(null);
      setRouteStartKey('gps');
      setRouteFromQuery(lastUserLocation?.name || 'My GPS location');
    }
    setRouteToQuery(destination.name);
    setSearchQuery('');
    setLayersMenuOpen(false);
    setMobileNavMenuOpen(false);
    setMobileRecenterExpanded(false);
    let routeReady = false;
    if (startPlace) {
      await drawRouteBetween(startPlace.coords, destination.coords, destination.name, travelMode, startPlace.name);
      routeReady = true;
    } else if (lastRouteEndpointsRef.current?.label === destination.name && routeActive) {
      setRouteMeta((current) => current);
      routeReady = true;
    } else {
      routeReady = await handleDrawRoute(destination, null);
    }

    if (routeReady) {
      setMobileMode('nav');
      setMobileSheetOpen(false);
    } else {
      setMobileMode('route');
      setMobileSheetOpen(true);
    }
  };

  const handleMobileAsk = () => {
    playClickSound();
    setSearchQuery('');
    setMobileMode('ask');
    setMobileSheetOpen(true);
  };

  const handleExitMobileNavigation = () => {
    setMobileNavMenuOpen(false);
    setMobileRecenterExpanded(false);
    handleClearRoute();
    setMobileMode('route');
    setMobileSheetOpen(true);
  };

  const handleMobileNavRecenter = () => {
    playClickSound();
    if (mobileRecenterExpanded) {
      setMobileRecenterExpanded(false);
      return;
    }
    setMobileRecenterExpanded(true);
    window.setTimeout(() => {
      if (!navigator.geolocation) {
        triggerToast("GPS Unavailable", "This browser does not support GPS location.", true);
        return;
      }
      getGpsPosition()
        .then((position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          showUserLocation({
            coords,
            address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
            accuracy: position.coords.accuracy
          }, { select: false });
        })
        .catch((error) => {
          triggerToast("GPS Failed", getGpsErrorMessage(error), true);
        });
    }, 0);
  };

  const handleMobileRouteMenuToggle = () => {
    playClickSound();
    setMobileNavMenuOpen((value) => !value);
  };

  const handleMobileSearchAlongRoute = (query = '') => {
    playClickSound();
    setMobileNavMenuOpen(false);
    if (query) {
      setSearchQuery(query);
    }
    setMobileMode('ask');
    setMobileSheetOpen(true);
    triggerToast("Search Route", query ? `Searching "${query}" along route.` : `Ask Maps is ready for ${activeLocation.name}.`, false);
  };

  const handleMobileAddReport = () => {
    playClickSound();
    setMobileNavMenuOpen(false);
    setIncidentsActive(true);
    triggerToast("Report Added", `Road report pinned near ${activeLocation.name}.`, false);
  };

  const handleMobileShareProgress = async () => {
    setMobileNavMenuOpen(false);
    const message = `SpiderMaps ride to ${activeLocation.name}: ${routeMeta?.distance || 'distance pending'}, ${routeMeta?.duration || 'ETA pending'}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SpiderMaps ride progress', text: message });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
      }
      triggerToast("Ride Shared", "Ride progress shared/copied.", false);
    } catch {
      triggerToast("Share Ready", message, false);
    }
  };

  const handleMobileSatellite = () => {
    playClickSound();
    setMobileNavMenuOpen(false);
    setMapStyle('satellite');
    triggerToast("Satellite Map", "Satellite view enabled.", false);
  };

  const openMobileSettings = (page = 'home') => {
    playClickSound();
    setLayersMenuOpen(false);
    setMobileNavMenuOpen(false);
    setMobileSettingsPage(page);
  };

  const handleMobileLogin = (provider) => {
    playClickSound();
    triggerToast("Login", `${provider} login will be connected when auth is enabled.`, false);
  };

  const handleMobileLogout = () => {
    playClickSound();
    triggerToast("Logout", "Signed out from this Spider Maps session.", false);
  };

  const handleSpeedUnitChange = (unit) => {
    playClickSound();
    setSpeedUnit(unit);
    triggerToast("Speedometer", `Navigation speed set to ${unit.toUpperCase()}.`, false);
  };

  const getRenderedClickedPlace = (event) => {
    const map = leafletMapInstance.current;
    if (!map || !event?.point) return null;

    const features = map.queryRenderedFeatures(event.point, {
      layers: map.getStyle()?.layers?.map((layer) => layer.id) || []
    });
    const namedFeature = features.find((feature) => {
      const props = feature.properties || {};
      return props.name_en || props['name:en'] || props.name || props.ref;
    });
    if (!namedFeature) return null;

    const props = namedFeature.properties || {};
    const name = props.name_en || props['name:en'] || props.name || props.ref;
    const category = props.class || props.type || props.kind || props.brunnel || 'map place';
    return {
      name,
      coords: [event.lngLat.lat, event.lngLat.lng],
      address: category,
      temp: "31°C",
      traffic: "Route estimate available from this map feature",
      type: category
    };
  };

  const reverseLookupClickedPlace = async (coords) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${coords[0]}&lon=${coords[1]}&limit=1&lang=en`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error('Reverse lookup failed');
      const payload = await response.json();
      const feature = payload.features?.[0];
      const props = feature?.properties || {};
      const name = props.name || props.street || props.city || props.district || props.state;
      if (!name) return null;
      const address = [props.street, props.city, props.state, props.country].filter(Boolean).join(', ');
      return {
        name,
        coords,
        address: address || `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
        temp: "--",
        traffic: "Route estimate available from this nearby map result",
        type: props.osm_value || props.osm_key || 'nearby'
      };
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  };

  const getClickedPlace = async (coords) => {
    const nearest = searchablePlaces
      .map(({ place }) => ({
        place,
        distance: getDistanceMeters(coords, place.coords)
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (nearest && nearest.distance <= 1200) {
      return {
        ...nearest.place,
        type: nearest.place.type || 'place'
      };
    }

    const reversePlace = await reverseLookupClickedPlace(coords);
    if (reversePlace) return reversePlace;

    return {
      name: "Dropped Pin",
      coords,
      address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
      temp: "31°C",
      traffic: "Route estimate available from your selected start point",
      type: "pin"
    };
  };

  const handleMapClick = async (event) => {
    if (!event?.lngLat) return;
    playClickSound();
    const clickedPlace = getRenderedClickedPlace(event) || await getClickedPlace([event.lngLat.lat, event.lngLat.lng]);

    if (mobileMode === 'nav') {
      rerouteNavigationToPlace(clickedPlace);
      return;
    }

    setActiveLocation(clickedPlace);
    setMobileSheetOpen(true);
    setMobileMode('place');
    if (spiderGridActive) {
      renderSpiderGrid(clickedPlace.coords);
    }
    if (routeStartKey === 'gps') {
      triggerToast("Choose Start", "Pick a saved start location or press Directions to request GPS.", true);
      return;
    }

    if (!routeStartPlace) {
      triggerToast("Choose Start", "Save a place first, then choose it as your route start.", true);
      return;
    }

    drawRouteBetween(routeStartPlace.coords, clickedPlace.coords, clickedPlace.name, travelMode, routeStartPlace.name);
  };
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    playClickSound();
    const submittedQuery = searchQuery;
    const destination = createSearchDestination();
    if (routeSearchTarget) {
      handleRouteSearchSelect(destination);
      return;
    }
    if (mobileMode === 'nav') {
      rerouteNavigationToPlace(destination);
      return;
    }
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo({ center: toLngLat(destination.coords), zoom: 14, duration: 1200 });
    }
    setActiveLocation(destination);
    setMobileSheetOpen(true);
    setMobileMode('place');
    if (spiderGridActive) {
      renderSpiderGrid(destination.coords);
    }
    triggerToast("Address Found", `Displaying map results for "${destination.name}".`, false);
    const bestMatch = searchSuggestions[0];

    if (bestMatch) {
      handleSelectLocation(bestMatch.place);
    } else {
      // Dynamic random simulation within Hyderabad bounds
      const randomLat = 17.5177 + (Math.random() - 0.5) * 0.04;
      const randomLng = 78.4990 + (Math.random() - 0.5) * 0.04;

      const simulatedLocation = {
        name: submittedQuery,
        coords: [randomLat, randomLng],
        address: `Located coordinate within Alwal area bounds`,
        temp: "31°C",
        traffic: "Smooth traffic speeds reported",
        type: "city"
      };

      if (leafletMapInstance.current) {
        leafletMapInstance.current.flyTo({ center: [randomLng, randomLat], zoom: 14, duration: 1200 });
      }
      setActiveLocation(simulatedLocation);
      setMobileSheetOpen(true);
      setMobileMode('place');
      clearSearchState();
      if (spiderGridActive) {
        renderSpiderGrid(simulatedLocation.coords);
      }
      triggerToast("Address Found", `Displaying map results for "${submittedQuery}".`, false);
    }
  };

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.warn("Audio Context block", e);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      setTimeout(() => {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        playClickSound();
      }, 50);
    }
    triggerToast(nextState ? "Sounds Activated" : "Sounds Muted", nextState ? "Audio clicks enabled." : "Audio clicks disabled.", false);
  };

  const triggerToast = (title, body, isWarning) => {
    setToast({ show: true, title, body, isWarning });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleCategoryClick = (category) => {
    playClickSound();
    triggerToast("Category Highlighted", `Showing local ${category} places near ${activeLocation.name}.`, false);
  };

  const handleSaveLocation = async () => {
    playClickSound();
    if (activeLocation.name === DEFAULT_ACTIVE_LOCATION.name) {
      triggerToast("Choose Place", "Search or click a place before saving.", true);
      return;
    }

    const [lat, lng] = activeLocation.coords;
    const savedPlace = {
      ...activeLocation,
      id: `saved-${normalizeSearchText(activeLocation.name).replace(/\s+/g, '-')}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
      savedAt: Date.now(),
      type: activeLocation.type || 'saved'
    };

    try {
      await writeSavedPlace(savedPlace);
      setSavedPlaces((current) => [
        savedPlace,
        ...current.filter((place) => place.id !== savedPlace.id)
      ]);
      if (routeStartKey === 'gps') {
        setRouteStartKey(savedPlace.id);
      }
      triggerToast("Place Saved", `${savedPlace.name} saved on this browser.`, false);
    } catch {
      triggerToast("Save Failed", "This browser could not save the place.", true);
    }
  };

  const handleNearbySearch = () => {
    playClickSound();
    triggerToast("Nearby Places", `Showing nearby places around ${activeLocation.name}.`, false);
  };

  const handleShareLocation = async () => {
    playClickSound();
    const [lat, lng] = activeLocation.coords;
    const text = `${activeLocation.name} - ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: activeLocation.name, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      triggerToast("Share Ready", "Location copied/shared successfully.", false);
    } catch {
      triggerToast("Share", text, false);
    }
  };

  const renderTravelModeIcon = (modeId, size = 16) => {
    if (modeId === 'car') return <Car size={size} />;
    if (modeId === 'bike') return <Bike size={size} />;
    if (modeId === 'cycle') return <Bike size={size} />;
    if (modeId === 'walking') return <Footprints size={size} />;
    return <Crosshair size={size} />;
  };

  const handleTravelModeChange = (modeId) => {
    playClickSound();
    setTravelMode(modeId);
    const mode = TRAVEL_MODES.find((item) => item.id === modeId);
    triggerToast("Travel Mode", `${mode?.label || 'Route'} mode selected.`, false);
    if (lastRouteEndpointsRef.current) {
      const { start, end, label, startLabel } = lastRouteEndpointsRef.current;
      drawRouteBetween(start, end, label, modeId, startLabel);
    }
  };

  const getGpsPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 0, message: 'Geolocation is not supported in this browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (firstError) => {
        if (firstError.code === 1) {
          reject(firstError);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 }
    );
  });

  const getGpsErrorMessage = (error) => {
    if (error?.code === 1) return "Location permission is blocked for this browser tab.";
    if (error?.code === 2) return "Location service could not find your position. Check Windows Location Services or try again.";
    if (error?.code === 3) return "Location request timed out. Try again or move closer to GPS/Wi-Fi signal.";
    return error?.message || "GPS location is unavailable right now.";
  };

  const getApproximateIpLocation = async () => {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Approximate location lookup failed.');
    const data = await response.json();
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error('Approximate location coordinates were unavailable.');
    }
    return {
      coords: [lat, lng],
      address: [data.city, data.region, data.country_name].filter(Boolean).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      accuracy: 'approx'
    };
  };

  const showUserLocation = ({ coords, address, accuracy }, options = {}) => {
    const location = {
      name: accuracy === 'approx' ? "Approximate Location" : "Your Location",
      coords,
      address,
      temp: "--",
      traffic: accuracy === 'approx' ? "Approximate location from network lookup" : `Current GPS position selected${accuracy ? `, accuracy ${Math.round(accuracy)} m` : ''}`,
      type: "gps"
    };

    renderUserLocationMarker(coords, { label: location.name, heading: navTelemetryRef.current.heading, variant: 'live' });

    setLastUserLocation(location);
    if (options.select !== false) {
      setActiveLocation(location);
    }
    setRouteStartKey('gps');
    if (routeStartKey === 'gps' || isGpsStartText(routeFromQuery)) {
      setRouteFromQuery(location.name);
    }
    leafletMapInstance.current?.flyTo({ center: toLngLat(coords), zoom: accuracy === 'approx' ? 12 : 15, duration: 1000 });
    return location;
  };

  const handleZoomIn = () => {
    playClickSound();
    if (leafletMapInstance.current) {
      leafletMapInstance.current.zoomIn({ duration: 250 });
    }
  };

  const handleZoomOut = () => {
    playClickSound();
    if (leafletMapInstance.current) {
      leafletMapInstance.current.zoomOut({ duration: 250 });
    }
  };

  const handleRecenter = () => {
    playClickSound();
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo({ center: [78.4990, 17.5177], zoom: 13, duration: 1200 });
    }
    triggerToast("Map Reset", "Returned to center Hyderabad coordinates.", false);
  };

  const handleGetUserLocation = async () => {
    playClickSound();
    if (!navigator.geolocation) {
      triggerToast("GPS Unavailable", "This browser does not support GPS location.", true);
      return;
    }

    triggerToast("Getting Location", "Requesting your current location...", false);
    try {
      const position = await getGpsPosition();
      const coords = [position.coords.latitude, position.coords.longitude];
      showUserLocation({
        coords,
        address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
        accuracy: position.coords.accuracy
      });
      triggerToast("Location Found", "Showing your current location.", false);
    } catch (error) {
      try {
        const fallback = await getApproximateIpLocation();
        showUserLocation(fallback);
        triggerToast("Approx Location", `${getGpsErrorMessage(error)} Showing approximate network location instead.`, true);
      } catch {
        triggerToast("GPS Failed", getGpsErrorMessage(error), true);
      }
    }
  };

  return (
    <div className="bg-[#030712] text-slate-100 font-sans h-screen w-screen overflow-hidden flex flex-col select-none relative">
      
      {/* MAIN CONTAINER */}
      <div className="flex-1 flex relative overflow-hidden h-full w-full">
        
        {/* 1. LEFT THIN UTILITY NAVIGATION BAR - Pure high-contrast solid Dark Blue (#0b132b) */}
        <nav className="hidden w-16 bg-[#0b132b] border-r border-[#06b6d4]/20 md:flex flex-col justify-between items-center py-4 z-40 shrink-0">
          <div className="flex flex-col items-center gap-6 w-full">
            {/* Hamburger Button */}
            <button 
              onClick={() => { playClickSound(); triggerToast("Menu Options", "Viewing offline maps & global profile features.", false); }}
              className="w-10 h-10 rounded-full hover:bg-[#1c2541] flex items-center justify-center text-[#06b6d4] transition-colors"
              title="Menu"
            >
              <Menu size={20} />
            </button>

            {/* Recenter Button (Ask Maps) */}
            <button 
              onClick={handleRecenter}
              className="flex flex-col items-center group w-full px-1"
              title="Recenter Map"
            >
              <div className="w-10 h-10 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 hover:border-[#06b6d4] flex items-center justify-center text-[#06b6d4] transition-all group-hover:scale-105 shadow-md">
                <Compass size={18} />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 scale-90 group-hover:text-[#06b6d4] transition-colors text-center font-medium">Ask Maps</span>
            </button>

            {/* Saved Places */}
            <button 
              onClick={() => { playClickSound(); triggerToast("Saved Places", savedPlaces.length ? `${savedPlaces.length} saved place${savedPlaces.length === 1 ? '' : 's'} stored locally.` : "No saved places yet. Press Save on a selected place.", false); }}
              className="flex flex-col items-center group w-full px-1"
              title="Saved Places"
            >
              <div className="w-10 h-10 rounded-full hover:bg-[#1c2541] flex items-center justify-center text-slate-400 hover:text-[#06b6d4] transition-colors">
                <Bookmark size={18} />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 scale-90 text-center">Saved</span>
            </button>

            {/* Recents History */}
            <button 
              onClick={() => { playClickSound(); triggerToast("History Log", "Viewing standard query history log.", false); }}
              className="flex flex-col items-center group w-full px-1"
              title="Recents"
            >
              <div className="w-10 h-10 rounded-full hover:bg-[#1c2541] flex items-center justify-center text-slate-400 hover:text-[#06b6d4] transition-colors">
                <Clock size={18} />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 scale-90 text-center">Recents</span>
            </button>

            {/* Classic Layout Comparison Modal Button */}
            <button 
              onClick={() => { playClickSound(); setCompareModalOpen(true); }}
              className="flex flex-col items-center group w-full px-1"
              title="Review Classic GMaps Template"
            >
              <div 
                className="w-10 h-10 rounded-lg border-2 border-[#06b6d4]/30 overflow-hidden hover:border-[#06b6d4] transition-all group-hover:scale-105 bg-[#030712] grid place-items-center"
              >
                <MapIcon size={16} className="text-[#06b6d4]" />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 scale-90 text-center leading-none">Classic View</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            {/* Sound Control */}
            <button 
              onClick={toggleSound}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${soundEnabled ? 'bg-[#06b6d4]/20 text-[#06b6d4]' : 'hover:bg-[#1c2541] text-slate-400 hover:text-[#06b6d4]'}`}
              title="Toggle Sounds"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Get App */}
            <button 
              onClick={() => { playClickSound(); triggerToast("Get Mobile App", "Mobile app links sent successfully.", false); }}
              className="flex flex-col items-center group w-full"
              title="Get mobile app"
            >
              <div className="w-10 h-10 rounded-full hover:bg-[#1c2541] flex items-center justify-center text-slate-400 hover:text-[#06b6d4] transition-colors">
                <Smartphone size={18} />
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 scale-90 text-center">Get app</span>
            </button>
          </div>
        </nav>

        {/* 2. MAIN FLOATING SEARCH PANEL - Solid High-Contrast Dark Blue background (No transparent washouts!) */}
        <section className="absolute top-3 left-3 right-3 z-30 hidden flex-col gap-2 pointer-events-none md:top-4 md:left-20 md:right-auto md:flex md:w-[390px] md:max-w-[calc(100vw-85px)]">
          
          {/* Floating Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-[#0b132b] border border-[#06b6d4]/30 rounded-3xl p-1 shadow-2xl glow-cyan flex items-center justify-between pointer-events-auto h-12 w-full"
          >
            <div className="flex items-center flex-1 pl-3">
              <Search className="text-[#06b6d4] mr-3 shrink-0" size={16} />
              <input 
                type="text" 
                placeholder="Search SpiderMaps" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-slate-100 placeholder-slate-400 font-sans text-sm focus:outline-none w-full"
              />
            </div>
            
            <div className="flex items-center gap-1 pr-1 border-l border-[#06b6d4]/15 pl-1.5">
              <button 
                type="button"
                onClick={handleDrawRoute}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${routeActive ? 'bg-[#ef4444] text-white' : 'bg-[#1c2541] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#030712]'}`}
                title="Navigate from GPS to selected place"
              >
                <Navigation size={14} className={routeActive ? '' : 'animate-pulse'} />
              </button>
              <button 
                type="submit"
                className="w-9 h-9 rounded-full hover:bg-[#1c2541] flex items-center justify-center text-[#06b6d4] transition-colors"
                title="Search Location"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </form>

          {searchQuery.trim() && searchSuggestions.length > 0 && (
            <div className="bg-[#0b132b] border border-[#06b6d4]/30 rounded-2xl shadow-2xl glow-cyan overflow-hidden pointer-events-auto">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion.key}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSearchQuery(suggestion.place.name);
                    handleSelectLocation(suggestion.place);
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-[#1c2541] transition-colors border-b border-[#06b6d4]/10 last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="block text-sm font-semibold text-slate-100 truncate">{suggestion.place.name}</span>
                      <span className="text-[9px] uppercase tracking-wide text-[#06b6d4] shrink-0">{suggestion.source === 'photon' ? 'global' : suggestion.place.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{suggestion.place.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 3 && searchSuggestions.length === 0 && (
            <div className="bg-[#0b132b] border border-[#06b6d4]/30 rounded-2xl shadow-2xl glow-cyan px-4 py-3 pointer-events-auto text-xs text-slate-400">
              {globalSearchLoading ? 'Searching global maps...' : 'No local or global result yet. Try a city, landmark, or address.'}
            </div>
          )}

          {/* Floating Search Results Drawer - Solid rich dark background for clear contrast against white map */}
          {!searchQuery.trim() && !isRouteDestination(activeLocation) && (
          <div className="hidden bg-[#0b132b] border border-[#06b6d4]/35 rounded-2xl shadow-2xl glow-cyan p-3 pointer-events-auto md:flex flex-col w-full max-h-[60vh] overflow-y-auto">
            <div className="space-y-1">
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Saved places
              </div>

              {savedPlaces.length === 0 ? (
                <div className="rounded-xl border border-[#06b6d4]/15 bg-[#030712]/60 px-3 py-4 text-xs leading-relaxed text-slate-400">
                  No saved places yet. Search or click a place, then press Save.
                </div>
              ) : (
                savedPlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => handleSelectLocation(place)}
                    className="flex items-start gap-4 p-2.5 hover:bg-[#1c2541] rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] shrink-0">
                      <Bookmark size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-slate-100 group-hover:text-[#06b6d4] transition-colors block truncate">{place.name}</span>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{place.address}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* History Link */}
            <button 
              onClick={() => { playClickSound(); triggerToast("Recent Records", "Cookie history log loaded fully.", false); }}
              className="mt-2 py-2 text-center text-xs font-semibold text-[#06b6d4] hover:text-[#ef4444] hover:underline border-t border-[#06b6d4]/15 flex items-center justify-center gap-2"
            >
              <Info size={12} />
              <span>More from recent history</span>
            </button>
          </div>
          )}
        </section>

        {/* 3. TOP HORIZONTAL CATEGORY CHIPS - Rich Solid Dark Blue backdrops */}
        <section className="absolute top-[64px] left-3 right-3 z-30 pointer-events-none hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none md:top-4 md:left-[490px] md:right-4 md:flex">
          <div className="flex gap-2 pointer-events-auto whitespace-nowrap">
            <button 
              onClick={() => handleCategoryClick('restaurants')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <span>Restaurants</span>
            </button>
            <button 
              onClick={() => handleCategoryClick('hotels')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <span>Hotels</span>
            </button>
            <button 
              onClick={() => handleCategoryClick('things to do')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <span>Things to do</span>
            </button>
            <button 
              onClick={() => handleCategoryClick('museums')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <span>Museums</span>
            </button>
            <button 
              onClick={() => handleCategoryClick('transit')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <span>Transit</span>
            </button>

            {/* Clear Routes button */}
            {routeActive && (
              <button 
                onClick={handleClearRoute}
                className="flex items-center gap-2 px-4 py-2 bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] rounded-full text-xs shadow-md font-medium hover:bg-[#ef4444] hover:text-white transition-all glow-red animate-bounce"
              >
                <Trash2 size={12} />
                <span>Clear Route</span>
              </button>
            )}
          </div>
        </section>

        {/* MAP CONTAINER AREA */}
        <div className={`flex-1 h-full w-full relative z-10 bg-[#020617] spider-map-frame spider-map-${mapStyle}`}>
          <div
            ref={mapRef}
            className="w-full h-full spider-map-surface"
          />
        </div>

        {/* MOBILE MAP UI */}
        {((mobileMode === 'place' && !isRouteDestination(activeLocation)) || routeSearchTarget) && (
        <section className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+10px)] z-40 flex flex-col gap-2 pointer-events-none md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-[#2f3033]/96 px-3 shadow-2xl backdrop-blur"
          >
            {routeSearchTarget && (
              <button type="button" onClick={() => { playClickSound(); setRouteSearchTarget(null); setMobileMode('route'); setMobileSheetOpen(true); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-100" title="Back">
                <ChevronLeft size={22} />
              </button>
            )}
            <Search size={22} className="shrink-0 text-slate-200" />
            <input
              type="text"
              placeholder={routeSearchTarget === 'from' ? 'Search start location' : routeSearchTarget === 'via' ? 'Search via place' : routeSearchTarget === 'to' ? 'Search destination' : 'Search here'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-100 placeholder:text-slate-300 focus:outline-none"
            />
            <button type="button" onClick={routeSearchTarget === 'from' ? useGpsRouteStart : () => triggerToast("Choose Place", "Search and select a place from the list.", true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-100" title="Get your location">
              <Crosshair size={20} />
            </button>
            <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-100" title="Search">
              <ChevronRight size={22} />
            </button>
          </form>

          {(routeSearchTarget ? routeSearchOptions.length > 0 : searchQuery.trim() && searchSuggestions.length > 0) && (
            <div className="pointer-events-auto max-h-[42vh] overflow-y-auto rounded-3xl bg-[#121212]/96 py-2 shadow-2xl">
              {(routeSearchTarget ? routeSearchOptions : searchSuggestions).map((suggestion) => (
                <button
                  key={suggestion.key}
                  type="button"
                  onClick={() => {
                    if (routeSearchTarget) {
                      handleRouteSearchSelect(suggestion.place);
                    } else {
                      playClickSound();
                      setSearchQuery(suggestion.place.name);
                      handleSelectLocation(suggestion.place);
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-700 text-slate-200">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0 flex-1 border-b border-white/10 pb-2">
                    <div className="truncate text-base font-semibold text-slate-50">{suggestion.place.name}</div>
                    <div className="truncate text-sm text-slate-400">{suggestion.place.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!routeSearchTarget && (
          <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 scrollbar-none mobile-chip-row">
            <button onClick={handleRecenter} className="flex shrink-0 items-center gap-2 rounded-full border border-[#60a5fa]/60 bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              <Compass size={16} />
              Ask Maps
            </button>
            <button onClick={handleMobileDirections} className="flex shrink-0 items-center gap-2 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              <Car size={16} />
              Directions
            </button>
            <button onClick={() => handleCategoryClick('restaurants')} className="shrink-0 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              Restaurants
            </button>
            <button onClick={() => handleCategoryClick('hotels')} className="shrink-0 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              Hotels
            </button>
            <button onClick={() => handleCategoryClick('transit')} className="shrink-0 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              Transit
            </button>
          </div>
          )}
        </section>
        )}

        {mobileMode === 'place' && (
        <div className="absolute right-4 bottom-[calc(46svh+20px)] z-40 flex flex-col gap-3 pointer-events-auto md:hidden">
          <button onClick={() => { playClickSound(); setLayersMenuOpen(!layersMenuOpen); }} className="grid h-12 w-12 place-items-center rounded-2xl bg-[#005d63] text-cyan-100 shadow-2xl" aria-label="Map layers and style settings">
            <Layers size={22} />
          </button>
          <button onClick={handleGetUserLocation} className="grid h-12 w-12 place-items-center rounded-2xl bg-[#3b3b3b]/95 text-slate-100 shadow-2xl" title="Get your location">
            <Crosshair size={22} />
          </button>
          <button onClick={handleMobileDirections} className="grid h-14 w-14 place-items-center rounded-2xl bg-[#67d9e8] text-[#062024] shadow-2xl" title="Directions">
            <Navigation size={24} />
          </button>
        </div>
        )}

        {layersMenuOpen && (
          <div className="absolute right-4 bottom-[calc(46svh+11rem)] z-50 w-[190px] rounded-2xl border border-white/10 bg-[#191a1d]/96 p-3 text-xs text-slate-100 shadow-2xl backdrop-blur md:hidden">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-cyan-300">Map type</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['dark', 'Dark'],
                ['normal', 'Normal'],
                ['light', 'Light'],
                ['satellite', 'Satellite']
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { playClickSound(); setMapStyle(id); setLayersMenuOpen(false); }}
                  className={`rounded-xl border px-2 py-2 text-left font-bold ${mapStyle === id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-white/5 text-slate-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={constructionActive} onChange={() => { playClickSound(); setConstructionActive(!constructionActive); }} className="accent-[#f97316]" />
                <span>Hyderabad hazards</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={incidentsActive} onChange={() => { playClickSound(); setIncidentsActive(!incidentsActive); }} className="accent-[#06b6d4]" />
                <span>Incidents</span>
              </label>
            </div>
          </div>
        )}

        {/* 4. SELECTED PLACE CARD */}
        <div className="absolute bottom-[118px] left-2 right-2 z-30 hidden max-h-[30vh] overflow-y-auto bg-[#0b132b] border border-[#06b6d4]/30 rounded-2xl p-2 shadow-2xl glow-cyan pointer-events-auto flex-col gap-2 md:bottom-6 md:left-20 md:right-auto md:flex md:w-[390px] md:max-h-none md:overflow-visible md:p-4 md:gap-3">
          <div className="flex items-start justify-between gap-3 border-b border-[#06b6d4]/15 pb-2 md:pb-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-50 leading-tight md:text-base">{activeLocation.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{activeLocation.address}</p>
            </div>
            <span className="text-xs text-slate-300 flex items-center gap-1 shrink-0">
              <span>{activeLocation.temp}</span> <CloudSun size={14} className="text-amber-400" />
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 md:gap-2">
            <button onClick={handleDrawRoute} className="map-action-button" title="Directions">
              <Route size={16} />
              <span>Directions</span>
            </button>
            <button onClick={handleSaveLocation} className="map-action-button" title="Save">
              <Bookmark size={16} />
              <span>Save</span>
            </button>
            <button onClick={handleNearbySearch} className="map-action-button" title="Nearby">
              <MapPin size={16} />
              <span>Nearby</span>
            </button>
            <button onClick={handleShareLocation} className="map-action-button" title="Share">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>

          <div className="hidden grid-cols-5 gap-1.5 md:grid">
            {TRAVEL_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleTravelModeChange(mode.id)}
                className={`travel-mode-button ${travelMode === mode.id ? 'active' : ''}`}
                title={mode.label}
              >
                {renderTravelModeIcon(mode.id, 15)}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-xl border border-[#06b6d4]/20 bg-[#030712]/60 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">From</span>
            <select
              value={routeStartKey}
              onChange={(event) => { playClickSound(); setRouteStartKey(event.target.value); }}
              className="min-w-0 rounded-lg border border-[#06b6d4]/20 bg-[#0b132b] px-2 py-1.5 text-xs font-semibold text-white outline-none focus:border-[#06b6d4]"
            >
              <option value="gps">My GPS location</option>
              {savedPlaces.map((place) => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>

          <div className="hidden grid-cols-3 gap-2 md:grid">
            <div className="route-stat">
              <Navigation size={14} />
              <span>{routeMeta?.distance || "Route"}</span>
              <small>Distance</small>
            </div>
            <div className="route-stat">
              <Clock size={14} />
              <span>{routeMeta?.duration || "--"}</span>
              <small>Duration</small>
            </div>
            <div className="route-stat">
              <Fuel size={14} />
              <span>{routeMeta?.fuel || "--"}</span>
              <small>Fuel</small>
            </div>
          </div>

          {routeMeta?.routeSummary && (
            <div className="hidden rounded-xl border border-[#06b6d4]/15 bg-[#030712]/55 px-3 py-2 text-xs text-slate-300 md:block">
              <span className="font-semibold text-cyan-300">{routeMeta.estimateLabel}</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="truncate">{routeMeta.routeSummary}</span>
            </div>
          )}

          <div className="hidden items-center gap-2 text-[11px] text-slate-400 md:flex">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">{activeLocation.traffic}</span>
          </div>
          {routeActive && routeMeta?.constructionHits?.length > 0 && (
            <div className="rounded-xl border border-orange-400/35 bg-orange-500/10 px-3 py-2 text-[11px] font-semibold text-orange-200">
              Hazard nearby: {routeMeta.constructionHits.map((zone) => zone.name).join(', ')}
            </div>
          )}
        </div>

        {/* 5. BOTTOM LEFT LAYER SELECTION PREVIEW */}
        <div className="absolute right-3 top-[112px] z-30 hidden pointer-events-auto md:top-auto md:bottom-6 md:left-[500px] md:right-auto md:block">
          <button 
            onClick={() => { playClickSound(); setLayersMenuOpen(!layersMenuOpen); }}
            aria-label="Map layers and style settings"
            className="group relative grid h-12 w-12 place-items-center rounded-xl border border-[#06b6d4]/40 bg-[#0b132b] text-[#06b6d4] shadow-xl transition-all hover:border-[#06b6d4] md:h-16 md:w-16 md:overflow-hidden md:border-2 md:items-end md:justify-center"
          >
            <div className="absolute inset-0 bg-[#1c2541] flex flex-col justify-center items-center text-center">
              <Layers size={18} className="text-[#06b6d4]" />
            </div>
            <div className="absolute inset-0 hidden bg-gradient-to-t from-black/95 via-transparent to-transparent md:block"></div>
            <span className="relative z-10 hidden text-[10px] font-bold text-[#06b6d4] pb-1 uppercase tracking-wider md:flex items-center gap-1">
               Layers
            </span>
          </button>
        </div>

        {/* 6. BOTTOM RIGHT MAP ACTIONS AND CONTROLS */}
        <div className="absolute left-3 top-[112px] z-30 hidden flex-col gap-3 pointer-events-auto items-start md:top-auto md:bottom-6 md:left-auto md:right-6 md:flex md:items-end">
          
          {/* Style / Layers Configuration Menu */}
          {(layersMenuOpen || !leafletLoaded) && (
            <div className="bg-[#0b132b] border border-[#06b6d4]/30 rounded-xl p-3 shadow-2xl max-w-[210px] space-y-2 text-xs">
              <span className="text-[9px] text-[#06b6d4] tracking-wider uppercase font-bold block border-b border-[#06b6d4]/15 pb-1">Map Settings</span>
              
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Map Base Style:</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input 
                    type="radio" 
                    name="mapStyleRadio" 
                    checked={mapStyle === 'dark'} 
                    onChange={() => { playClickSound(); setMapStyle('dark'); }}
                    className="accent-[#06b6d4]"
                  />
                  <span>Dark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input 
                    type="radio" 
                    name="mapStyleRadio" 
                    checked={mapStyle === 'light'} 
                    onChange={() => { playClickSound(); setMapStyle('light'); }}
                    className="accent-[#06b6d4]"
                  />
                  <span>Light</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input 
                    type="radio" 
                    name="mapStyleRadio" 
                    checked={mapStyle === 'normal'} 
                    onChange={() => { playClickSound(); setMapStyle('normal'); }}
                    className="accent-[#06b6d4]"
                  />
                  <span>Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input
                    type="radio"
                    name="mapStyleRadio"
                    checked={mapStyle === 'satellite'}
                    onChange={() => { playClickSound(); setMapStyle('satellite'); }}
                    className="accent-[#06b6d4]"
                  />
                  <span>Satellite</span>
                </label>
              </div>

              <div className="border-t border-[#06b6d4]/15 pt-2 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Overlays:</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input 
                    type="checkbox" 
                    checked={incidentsActive} 
                    onChange={() => { playClickSound(); setIncidentsActive(!incidentsActive); }}
                    className="accent-[#06b6d4]"
                  />
                  <span>Traffic Incidents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input 
                    type="checkbox" 
                    checked={constructionActive} 
                    onChange={() => { playClickSound(); setConstructionActive(!constructionActive); }}
                    className="accent-[#f97316]"
                  />
                  <span>Hyderabad Hazards</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-[#06b6d4]">
                  <input 
                    type="checkbox" 
                    checked={spiderGridActive} 
                    onChange={() => { playClickSound(); setSpiderGridActive(!spiderGridActive); }}
                    className="accent-[#06b6d4]"
                  />
                  <span>Spider Grid</span>
                </label>
              </div>
            </div>
          )}

          {/* Zoom controls mimicking Google Maps buttons */}
          <div className="flex flex-col rounded-lg bg-[#0b132b] border border-[#06b6d4]/30 shadow-2xl overflow-hidden divide-y divide-[#06b6d4]/15 w-10">
            <button 
              onClick={handleZoomIn}
              className="w-10 h-10 hover:bg-[#1c2541] flex items-center justify-center text-[#06b6d4] transition-colors"
              title="Zoom In"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-10 h-10 hover:bg-[#1c2541] flex items-center justify-center text-[#06b6d4] transition-colors"
              title="Zoom Out"
            >
              <Minus size={16} />
            </button>
          </div>

          {/* Current Location button */}
          <button
            onClick={handleGetUserLocation}
            className="w-10 h-10 rounded-lg bg-[#0b132b] hover:bg-[#06b6d4] border border-[#06b6d4]/30 hover:border-[#06b6d4] text-[#06b6d4] hover:text-[#030712] flex items-center justify-center shadow-xl transition-all"
            title="Get your location"
          >
            <Crosshair size={18} />
          </button>

        </div>

        {mobileMode === 'nav' && (
          <MobileNavigationPanel
            activeLocation={activeLocation}
            routeMeta={routeMeta}
            navTelemetry={navTelemetry}
            speedUnit={speedUnit}
            soundEnabled={soundEnabled}
            mobileNavMenuOpen={mobileNavMenuOpen}
            mobileRecenterExpanded={mobileRecenterExpanded}
            onExitNavigation={handleExitMobileNavigation}
            onToggleRouteMenu={handleMobileRouteMenuToggle}
            onCloseRouteMenu={() => setMobileNavMenuOpen(false)}
            onToggleSound={toggleSound}
            onRecenter={handleMobileNavRecenter}
            onSearchAlongRoute={handleMobileSearchAlongRoute}
            onAddReport={handleMobileAddReport}
            onShareProgress={handleMobileShareProgress}
            onSatellite={handleMobileSatellite}
            onOpenSettings={() => openMobileSettings('home')}
          />
        )}

        {mobileSettingsPage && (
          <MobileSettingsPage
            page={mobileSettingsPage}
            speedUnit={speedUnit}
            onClose={() => { playClickSound(); setMobileSettingsPage(null); }}
            onOpenPage={(page) => { playClickSound(); setMobileSettingsPage(page); }}
            onSpeedUnitChange={handleSpeedUnitChange}
            onLogin={handleMobileLogin}
            onLogout={handleMobileLogout}
          />
        )}

        {routeSearchTarget && mobileMode !== 'nav' && (
          <section className="fixed inset-0 z-[80] bg-[#07090d] px-3 pt-[calc(env(safe-area-inset-top)+12px)] text-white md:hidden">
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-14 items-center gap-2 rounded-full bg-[#2f3033]/96 px-3 shadow-2xl"
            >
              <button type="button" onClick={() => { playClickSound(); setRouteSearchTarget(null); setMobileMode('route'); setMobileSheetOpen(true); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-100" title="Back">
                <ChevronLeft size={22} />
              </button>
              <Search size={22} className="shrink-0 text-slate-200" />
              <input
                type="text"
                placeholder={routeSearchTarget === 'from' ? 'Search start location' : routeSearchTarget === 'via' ? 'Search via place' : 'Search destination'}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-100 placeholder:text-slate-300 focus:outline-none"
              />
              <button type="button" onClick={routeSearchTarget === 'from' ? useGpsRouteStart : () => triggerToast("Choose Place", "Search and select a place from the list.", true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-100" title="Get your location">
                <Crosshair size={20} />
              </button>
              <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-100" title="Search">
                <ChevronRight size={22} />
              </button>
            </form>

            <div className="mt-4 overflow-hidden rounded-3xl bg-[#121212]/96 shadow-2xl">
              {routeSearchOptions.length > 0 ? (
                routeSearchOptions.map((suggestion) => (
                  <button
                    key={suggestion.key}
                    type="button"
                    onClick={() => handleRouteSearchSelect(suggestion.place)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-700 text-slate-200">
                      <Clock size={20} />
                    </div>
                    <div className="min-w-0 flex-1 border-b border-white/10 pb-2">
                      <div className="truncate text-base font-semibold text-slate-50">{suggestion.place.name}</div>
                      <div className="truncate text-sm text-slate-400">{suggestion.place.address}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-5 py-5 text-sm text-slate-400">
                  {searchQuery.trim() ? 'Press search to use this destination.' : 'Search SpiderMaps'}
                </div>
              )}
            </div>
          </section>
        )}

        {mobileMode !== 'nav' && !mobileSheetOpen && !routeSearchTarget && (
          <button
            type="button"
            onClick={() => { playClickSound(); setMobileSheetOpen(true); }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+14px)] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#101113]/95 px-5 py-3 text-sm font-bold text-slate-100 shadow-2xl backdrop-blur md:hidden"
          >
            <MapPin size={17} className="text-cyan-300" />
            Place panel
          </button>
        )}

        {/* MOBILE PLACE / ROUTE SHEET */}
        {mobileMode !== 'nav' && mobileSheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[46svh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-[#101113]/98 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 shadow-[0_-24px_70px_rgba(0,0,0,0.5)] backdrop-blur md:hidden pointer-events-auto mobile-bottom-sheet">
          <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-white/25" />

          {mobileMode === 'place' && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-semibold leading-tight text-slate-50">{activeLocation.name}</h2>
                  <p className="mt-1 truncate text-sm text-slate-400">{activeLocation.address}</p>
                  <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-slate-300">
                    <span>{activeLocation.temp}</span>
                    <CloudSun size={15} className="text-amber-300" />
                    <span className="truncate text-slate-500">1 min nearby</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={handleSaveLocation} className="mobile-circle-button" title="Save">
                    <Bookmark size={20} />
                  </button>
                  <button onClick={handleShareLocation} className="mobile-circle-button" title="Share">
                    <Share2 size={20} />
                  </button>
                  <button onClick={() => openMobileSettings('home')} className="mobile-circle-button" title="Settings">
                    <Settings size={20} />
                  </button>
                  <button onClick={handleCloseMobileSheet} className="mobile-circle-button" title="Close panel">
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button onClick={handleMobileDirections} className="mobile-primary-pill">
                  <Route size={20} />
                  Directions
                </button>
                <button onClick={handleMobileStart} className="mobile-secondary-pill">
                  <Navigation size={19} />
                  Start
                </button>
                <button onClick={handleMobileAsk} className="mobile-secondary-pill">
                  <Search size={18} />
                  Ask
                </button>
                <button onClick={handleSaveLocation} className="mobile-secondary-pill">
                  <Bookmark size={18} />
                  Save
                </button>
              </div>
            </>
          )}

          {mobileMode === 'ask' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Ask Maps</h2>
                  <p className="mt-1 text-sm text-slate-400">Ask about {activeLocation.name}</p>
                </div>
                <button onClick={handleCloseMobileSheet} className="mobile-circle-button" title="Close ask">
                  <X size={22} />
                </button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-slate-300">
                Try: nearby food, fastest route, save this place, or road hazards.
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Nearby food', 'Road hazards', 'Fastest route', 'Save place'].map((label) => (
                  <button key={label} type="button" onClick={() => triggerToast('Ask Maps', `${label} around ${activeLocation.name}.`, false)} className="rounded-2xl bg-white/8 px-3 py-3 text-sm font-bold text-slate-100">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mobileMode === 'route' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-slate-50">Route to {activeLocation.name}</h2>
                  <p className="mt-1 truncate text-sm text-slate-400">{activeLocation.address}</p>
                </div>
                <button onClick={handleCloseMobileSheet} className="mobile-circle-button" title="Close route setup">
                  <X size={22} />
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-blue-400" />
                  <button
                    type="button"
                    onClick={() => openRouteSearch('from')}
                    className="min-w-0 rounded-xl border border-white/10 bg-[#07090d] px-3 py-2 text-left text-sm font-semibold text-white"
                  >
                    <span className="block text-[10px] uppercase tracking-wide text-slate-500">From</span>
                    <span className="block truncate">{routeFromQuery || routeMeta?.routeFrom || 'Choose start'}</span>
                  </button>
                  <button type="button" onClick={useGpsRouteStart} className="rounded-xl bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-200">GPS</button>
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <button
                    type="button"
                    onClick={() => openRouteSearch('to')}
                    className="min-w-0 rounded-xl border border-white/10 bg-[#07090d] px-3 py-2 text-left text-sm font-semibold text-white"
                  >
                    <span className="block text-[10px] uppercase tracking-wide text-slate-500">To</span>
                    <span className="block truncate">{isRouteDestinationText(routeToQuery) ? routeToQuery : (routeMeta?.routeTo || (isRouteDestination(activeLocation) ? activeLocation.name : 'Choose destination'))}</span>
                  </button>
                  <button type="button" onClick={() => openRouteSearch('to')} className="rounded-xl bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-200">Search</button>
                  </div>
                  {routeAlternatives.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-white/10 bg-[#07090d] p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Choose route · {routeAlternatives.length} found
                      </div>
                      {routeAlternatives.map((route) => (
                        <button
                          key={route.id}
                          type="button"
                          onClick={() => handleSelectRouteAlternative(route)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold ${selectedRouteId === route.id ? 'bg-cyan-400 text-[#062024]' : 'bg-white/8 text-slate-100'}`}
                        >
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: route.color || '#4f46e5' }} />
                            <span className="truncate">{selectedRouteId === route.id ? route.label : route.timeDeltaLabel}</span>
                          </span>
                          <span className="shrink-0 text-xs opacity-85">{route.durationMinutes} min · {route.distanceKm.toFixed(1)} km · {route.distanceDeltaLabel}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleMobileStart} className="mobile-primary-pill">
                  <Navigation size={19} />
                  Start
                </button>
                <button onClick={handleMobileDirections} className="mobile-secondary-pill">
                  <Route size={19} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {TRAVEL_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleTravelModeChange(mode.id)}
                    className={`mobile-travel-button ${travelMode === mode.id ? 'active' : ''}`}
                    title={mode.label}
                  >
                    {renderTravelModeIcon(mode.id, 18)}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="route-stat">
                  <Navigation size={14} />
                  <span>{routeMeta?.distance || "--"}</span>
                  <small>Distance</small>
                </div>
                <div className="route-stat">
                  <Clock size={14} />
                  <span>{routeMeta?.duration || "--"}</span>
                  <small>Duration</small>
                </div>
                <div className="route-stat">
                  <Fuel size={14} />
                  <span>{routeMeta?.fuel || "--"}</span>
                  <small>Fuel</small>
                </div>
              </div>

              {routeMeta?.routeSummary && (
                <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-slate-300">
                  <span className="font-bold text-cyan-300">{routeMeta.estimateLabel}</span>
                  <span className="mx-2 text-slate-600">|</span>
                  <span>{routeMeta.routeSummary}</span>
                </div>
              )}
            </div>
          )}
        </div>
        )}

      </div>

      {/* CLASSIC LAYOUT REFERENCE COMPARISON MODAL */}
      {compareModalOpen && (
        <div className="fixed inset-0 bg-[#030712]/95 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-[#06b6d4]/40 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden relative shadow-2xl">
            {/* Dismiss modal button */}
            <button 
              onClick={() => { playClickSound(); setCompareModalOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#ef4444] text-xl transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="p-4 border-b border-[#06b6d4]/20 bg-[#030712]/40">
              <h3 className="font-bold text-sm text-[#06b6d4] tracking-wider uppercase flex items-center gap-2">
                <CheckCircle size={16} /> Layout Synchronization Review
              </h3>
              <p className="text-xs text-slate-400">Comparing interactive styled layout side-by-side with reference image</p>
            </div>

            {/* Comparison cards (No blurs) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-500 font-bold uppercase">Classic Reference Layout</span>
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded">CSS Preview</span>
                </div>
                <div className="bg-[#030712] p-4 rounded-xl border border-[#1c2541] flex items-center justify-center overflow-hidden h-[300px]">
                  <div className="w-full h-full rounded-lg border border-[#06b6d4]/20 bg-[#0b132b] relative overflow-hidden">
                    <div className="absolute left-4 top-4 w-10 h-[calc(100%-2rem)] rounded-lg bg-[#030712] border border-[#06b6d4]/20" />
                    <div className="absolute left-20 top-5 w-56 h-12 rounded-2xl bg-[#030712] border border-[#06b6d4]/30" />
                    <div className="absolute left-20 top-20 w-64 h-36 rounded-2xl bg-[#030712] border border-[#06b6d4]/20" />
                    <div className="absolute bottom-5 left-20 w-52 h-16 rounded-2xl bg-[#030712] border border-amber-500/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(6,182,212,0.22),transparent_35%)]" />
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Identical thin left bar setup for direct utility navigation.</li>
                  <li>Overlying floating card for search query input.</li>
                  <li>Standard historical records (Kompally, Hyderabad, Alwal locations).</li>
                </ul>
              </div>

              {/* Modern styled panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#06b6d4] font-bold uppercase">Modern Refactored React View</span>
                  <span className="text-[10px] bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] px-2 py-0.5 rounded">Light Map with Premium Theme</span>
                </div>
                <div className="bg-[#030712] p-4 rounded-xl border border-[#06b6d4]/20 h-[300px] flex flex-col justify-between overflow-hidden">
                  <div className="space-y-3">
                    <div className="bg-[#0b132b] p-2.5 border border-[#06b6d4]/15 rounded-xl text-xs">
                      <p className="text-[#06b6d4] font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Map Legibility Solved
                      </p>
                      <p className="text-slate-300 text-[11px] mt-0.5">Custom grey/white map base renders landmarks, streets, and cafes clearly, removing dark visual interference.</p>
                    </div>
                    <div className="bg-[#0b132b] p-2.5 border border-[#06b6d4]/15 rounded-xl text-xs">
                      <p className="text-[#06b6d4] font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Responsive Interactive State
                      </p>
                      <p className="text-slate-300 text-[11px] mt-0.5">Written in solid React. Calculates actual routes, triggers popups, and updates selected coordinates in real-time.</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 text-center border-t border-[#06b6d4]/10 pt-2 font-medium">
                    Fully-functional search engine & real-time direction calculations.
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Optimized map tiles (with zero invert filters) for absolute legibility.</li>
                  <li>High fidelity touch targets for easy scrolling on small mobile screens.</li>
                  <li>Maintains Red, Dark Blue, Cyan, and Black UI palette with standard GMaps layout.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-[#030712]/80 border-t border-[#06b6d4]/20 flex items-center justify-end">
              <button 
                onClick={() => { playClickSound(); setCompareModalOpen(false); }}
                className="px-5 py-2 bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-[#030712] font-bold rounded-lg text-xs tracking-wider transition-all"
              >
                DISMISS PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAN STATUS TOAST NOTIFICATION POPUP */}
      <div 
        className={`fixed top-6 right-6 z-50 max-w-sm bg-[#0b132b] border-2 p-4 rounded-xl shadow-2xl transition-all duration-300 transform pointer-events-auto ${toast.show ? 'translate-x-0' : 'translate-x-[450px]'} ${toast.isWarning ? 'border-[#ef4444]' : 'border-[#06b6d4]'}`}
      >
        <div className="flex items-start gap-3">
          <div className={toast.isWarning ? 'text-[#ef4444]' : 'text-[#06b6d4]'}>
            <Info size={20} />
          </div>
          <div>
            <h4 className={`font-bold text-xs uppercase tracking-wider ${toast.isWarning ? 'text-[#ef4444]' : 'text-[#06b6d4]'}`}>{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.body}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
