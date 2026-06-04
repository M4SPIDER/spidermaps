import React, { useState, useMemo, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';
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
  ChevronRight,
  Map as MapIcon,
  Compass
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
  { id: 'car', label: 'Car', osrmProfile: 'driving', fuelKmPerLiter: 15, speedFallbackKmh: 34 },
  { id: 'bike', label: 'Bike', osrmProfile: 'driving', fuelKmPerLiter: 42, speedFallbackKmh: 32 },
  { id: 'cycle', label: 'Cycle', osrmProfile: 'bike', fuelKmPerLiter: null, speedFallbackKmh: 14 },
  { id: 'walking', label: 'Walking', osrmProfile: 'foot', fuelKmPerLiter: null, speedFallbackKmh: 4.8 },
  { id: 'tracking', label: 'Tracking', osrmProfile: 'driving', fuelKmPerLiter: 15, speedFallbackKmh: 28 }
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
  const [routeActive, setRouteActive] = useState(false);
  const [routeMeta, setRouteMeta] = useState(null);
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
  const routeLineCoordinatesRef = useRef([]);
  const activeBaseStyleRef = useRef(mapStyle);
  const audioCtxRef = useRef(null);
  const hazardWatchIdRef = useRef(null);
  const warnedHazardsRef = useRef(new Set());

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
    if (routeStartKey !== 'gps' && !savedPlaces.some((place) => place.id === routeStartKey)) {
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
          renderRouteLine(routeLineCoordinatesRef.current);
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

  const renderRouteLine = (routeCoordinates) => {
    const map = leafletMapInstance.current;
    if (!map || !routeCoordinates?.length) return;
    clearMapLibreLayer('route-line');
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
        'line-width': 5,
        'line-opacity': 0.92
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    });
  };

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

  const handleSelectLocation = (location) => {
    playClickSound();
    setActiveLocation(location);
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo({ center: toLngLat(location.coords), zoom: 15, duration: 1200 });
    }
    if (spiderGridActive) {
      renderSpiderGrid(location.coords);
    }
    triggerToast("Location Selected", `Map navigated to ${location.name}.`, false);
  };

  const drawRouteBetween = async (start, end, label = "destination") => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return;

    clearMapLibreLayer('route-line');
    const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];

    const drawRouteLine = (routeCoordinates) => {
      routeLineCoordinatesRef.current = routeCoordinates;
      renderRouteLine(routeCoordinates);
      const bounds = routeCoordinates.reduce(
        (box, coord) => box.extend(toLngLat(coord)),
        new maplibregl.LngLatBounds(toLngLat(routeCoordinates[0]), toLngLat(routeCoordinates[0]))
      );
      map.fitBounds(bounds, { padding: 70, duration: 900 });
    };

    try {
      const routeUrl = `https://router.project-osrm.org/route/v1/${selectedMode.osrmProfile}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const response = await fetch(routeUrl);
      if (!response.ok) throw new Error('OSRM route request failed');
      const data = await response.json();
      const route = data.routes?.[0];
      if (!route) throw new Error('No OSRM route returned');

      const routeCoordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      drawRouteLine(routeCoordinates);
      const distanceKm = route.distance / 1000;
      const durationMinutes = Math.round(route.duration / 60);
      const fuelLiters = selectedMode.fuelKmPerLiter ? Math.max(0.1, distanceKm / selectedMode.fuelKmPerLiter) : 0;
      const constructionHits = getConstructionHitsForRoute(routeCoordinates);

      setRouteMeta({
        distance: `${distanceKm.toFixed(1)} km`,
        duration: `${durationMinutes} min`,
        fuel: `${fuelLiters.toFixed(1)} L`,
        source: selectedMode.label,
        constructionHits
      });
      setRouteActive(true);
      if (constructionHits.length) {
        triggerToast("Construction Zone", `Route passes near ${constructionHits[0].name}.`, true);
      } else {
        triggerToast("Navigation Started", `${selectedMode.label} route generated to ${label}.`, false);
      }
    } catch {
      const fallbackRoute = [start, end];
      const distanceKm = getDistanceMeters(start, end) / 1000;
      const durationMinutes = Math.max(1, Math.round((distanceKm / selectedMode.speedFallbackKmh) * 60));
      const fuelLiters = selectedMode.fuelKmPerLiter ? Math.max(0.1, distanceKm / selectedMode.fuelKmPerLiter) : 0;
      const constructionHits = getConstructionHitsForRoute(fallbackRoute);
      drawRouteLine(fallbackRoute);
      setRouteMeta({
        distance: `${distanceKm.toFixed(1)} km`,
        duration: `${durationMinutes} min`,
        fuel: `${fuelLiters.toFixed(1)} L`,
        source: `${selectedMode.label} estimate`,
        constructionHits
      });
      setRouteActive(true);
      triggerToast("Navigation Started", "Live routing was unavailable, so a direct estimate was used.", true);
    }
  };

  const handleDrawRoute = () => {
    playClickSound();
    if (!leafletMapInstance.current) return;

    if (routeStartKey !== 'gps') {
      if (!routeStartPlace) {
        triggerToast("Choose Start", "Save a place first, then choose it as your route start.", true);
        return;
      }
      if (userLayerGroup.current) {
        userLayerGroup.current.forEach((marker) => marker.remove());
        userLayerGroup.current = [];
        const startIcon = document.createElement('div');
        startIcon.className = 'gps-marker selected-start';
        startIcon.innerHTML = '<span></span>';
        const marker = new maplibregl.Marker({ element: startIcon, anchor: 'center' })
          .setLngLat(toLngLat(routeStartPlace.coords))
          .setPopup(new maplibregl.Popup({ offset: 18 }).setText(`Start: ${routeStartPlace.name}`))
          .addTo(leafletMapInstance.current);
        userLayerGroup.current.push(marker);
      }
      drawRouteBetween(routeStartPlace.coords, activeLocation.coords, activeLocation.name);
      triggerToast("Route Start", `Starting from ${routeStartPlace.name}.`, false);
      return;
    }

    if (!navigator.geolocation) {
      triggerToast("Choose Start", "GPS is unavailable. Pick a start location from the selector.", true);
      return;
    }

    triggerToast("Requesting GPS", "Allow location access to start live navigation.", false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const start = [position.coords.latitude, position.coords.longitude];
        if (userLayerGroup.current) {
          userLayerGroup.current.forEach((marker) => marker.remove());
          userLayerGroup.current = [];
          const userIcon = document.createElement('div');
          userIcon.className = 'gps-marker';
          userIcon.innerHTML = '<span></span>';
          const marker = new maplibregl.Marker({ element: userIcon, anchor: 'center' })
            .setLngLat(toLngLat(start))
            .setPopup(new maplibregl.Popup({ offset: 18 }).setText('Your GPS location'))
            .addTo(leafletMapInstance.current);
          userLayerGroup.current.push(marker);
        }
        drawRouteBetween(start, activeLocation.coords, activeLocation.name);
      },
      () => {
        triggerToast("GPS Permission Needed", "GPS was blocked. Pick a start location from the selector.", true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleClearRoute = () => {
    playClickSound();
    routeLineCoordinatesRef.current = [];
    clearMapLibreLayer('route-line');
    if (userLayerGroup.current) {
      userLayerGroup.current.forEach((marker) => marker.remove());
      userLayerGroup.current = [];
    }
    setRouteActive(false);
    setRouteMeta(null);
    triggerToast("Route Cleared", "Active map route lines have been removed.", false);
  };

  const handleMapClick = (event) => {
    if (!event?.lngLat) return;
    playClickSound();
    const droppedPlace = {
      name: "Dropped Pin",
      coords: [event.lngLat.lat, event.lngLat.lng],
      address: `${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}`,
      temp: "31°C",
      traffic: "Route estimate available from your selected start point",
      type: "pin"
    };

    setActiveLocation(droppedPlace);
    if (spiderGridActive) {
      renderSpiderGrid(droppedPlace.coords);
    }
    if (routeStartKey === 'gps') {
      triggerToast("Choose Start", "Pick a saved start location or press Directions to request GPS.", true);
      return;
    }

    if (!routeStartPlace) {
      triggerToast("Choose Start", "Save a place first, then choose it as your route start.", true);
      return;
    }

    drawRouteBetween(routeStartPlace.coords, droppedPlace.coords, droppedPlace.name);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    playClickSound();
    const bestMatch = searchSuggestions[0];

    if (bestMatch) {
      setSearchQuery(bestMatch.place.name);
      handleSelectLocation(bestMatch.place);
    } else {
      // Dynamic random simulation within Hyderabad bounds
      const randomLat = 17.5177 + (Math.random() - 0.5) * 0.04;
      const randomLng = 78.4990 + (Math.random() - 0.5) * 0.04;

      const simulatedLocation = {
        name: searchQuery,
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
      if (spiderGridActive) {
        renderSpiderGrid(simulatedLocation.coords);
      }
      triggerToast("Address Found", `Displaying map results for "${searchQuery}".`, false);
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

  const handleGetUserLocation = () => {
    playClickSound();
    if (!navigator.geolocation) {
      triggerToast("GPS Unavailable", "This browser does not support GPS location.", true);
      return;
    }

    triggerToast("Getting Location", "Requesting your current location...", false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        const location = {
          name: "Your Location",
          coords,
          address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
          temp: "--",
          traffic: "Current GPS position selected",
          type: "gps"
        };

        userLayerGroup.current.forEach((marker) => marker.remove());
        userLayerGroup.current = [];
        const userIcon = document.createElement('div');
        userIcon.className = 'gps-marker';
        userIcon.innerHTML = '<span></span>';
        const marker = new maplibregl.Marker({ element: userIcon, anchor: 'center' })
          .setLngLat(toLngLat(coords))
          .setPopup(new maplibregl.Popup({ offset: 18 }).setText('Your location'))
          .addTo(leafletMapInstance.current);
        userLayerGroup.current.push(marker);

        setActiveLocation(location);
        setRouteStartKey('gps');
        leafletMapInstance.current?.flyTo({ center: toLngLat(coords), zoom: 15, duration: 1000 });
        triggerToast("Location Found", "Showing your current location.", false);
      },
      () => {
        triggerToast("GPS Permission Needed", "Allow location access to show your current location.", true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 }
    );
  };

  return (
    <div className="bg-[#030712] text-slate-100 font-sans h-screen w-screen overflow-hidden flex flex-col select-none relative">
      
      {/* MAIN CONTAINER */}
      <div className="flex-1 flex relative overflow-hidden h-full w-full">
        
        {/* 1. LEFT THIN UTILITY NAVIGATION BAR - Pure high-contrast solid Dark Blue (#0b132b) */}
        <nav className="w-16 bg-[#0b132b] border-r border-[#06b6d4]/20 flex flex-col justify-between items-center py-4 z-40 shrink-0">
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
        <section className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none md:top-4 md:left-20 md:right-auto md:w-[390px] md:max-w-[calc(100vw-85px)]">
          
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
        </section>

        {/* 3. TOP HORIZONTAL CATEGORY CHIPS - Rich Solid Dark Blue backdrops */}
        <section className="absolute top-[64px] left-3 right-3 z-30 pointer-events-none overflow-x-auto flex items-center gap-2 pb-2 scrollbar-none md:top-4 md:left-[490px] md:right-4">
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

        {/* 4. SELECTED PLACE CARD */}
        <div className="absolute bottom-[82px] left-2 right-2 z-30 max-h-[34vh] overflow-y-auto bg-[#0b132b] border border-[#06b6d4]/30 rounded-2xl p-2.5 shadow-2xl glow-cyan pointer-events-auto flex flex-col gap-2 md:bottom-6 md:left-20 md:right-auto md:w-[390px] md:max-h-none md:overflow-visible md:p-4 md:gap-3">
          <div className="flex items-start justify-between gap-3 border-b border-[#06b6d4]/15 pb-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-50 leading-tight">{activeLocation.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{activeLocation.address}</p>
            </div>
            <span className="text-xs text-slate-300 flex items-center gap-1 shrink-0">
              <span>{activeLocation.temp}</span> <CloudSun size={14} className="text-amber-400" />
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
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

          <div className="grid grid-cols-3 gap-2">
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

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
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
        <div className="absolute bottom-[184px] right-3 z-30 pointer-events-auto md:bottom-6 md:left-[500px] md:right-auto">
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
        <div className="absolute bottom-[184px] left-3 z-30 flex flex-col gap-3 pointer-events-auto items-start md:bottom-6 md:left-auto md:right-6 md:items-end">
          
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

        {/* MOBILE ROUTE CONTROLS */}
        <div className="fixed inset-x-2 bottom-2 z-50 rounded-2xl border border-[#06b6d4]/30 bg-[#0b132b]/98 p-2 shadow-2xl md:hidden pointer-events-auto space-y-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">From</span>
            <select
              value={routeStartKey}
              onChange={(event) => { playClickSound(); setRouteStartKey(event.target.value); }}
              className="min-w-0 rounded-lg border border-[#06b6d4]/20 bg-[#030712] px-2 py-2 text-xs font-semibold text-white outline-none"
            >
              <option value="gps">My GPS location</option>
              {savedPlaces.map((place) => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
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
                {renderTravelModeIcon(mode.id, 17)}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

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
