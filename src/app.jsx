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

const NAVIGATION_NOTIFICATION_ID = 5305;
const NAVIGATION_NOTIFICATION_CHANNEL = 'spidermaps-navigation';
const NAVIGATION_NOTIFICATION_ACTION_TYPE = 'spidermaps-navigation-actions';
const EXIT_NAVIGATION_ACTION = 'exit-navigation';
const SPIDERMAPS_SHARE_BASE_URL = (
  import.meta.env.VITE_SPIDERMAPS_SHARE_BASE_URL || 'https://maps.m4spider.com'
).replace(/\/+$/, '');

const isNativeCapacitorApp = () => {
  try {
    return Capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
};

const buildSpiderMapsShareUrl = ([lat, lng], name = '') => {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6)
  });
  if (name) params.set('q', name);
  return `${SPIDERMAPS_SHARE_BASE_URL}/?${params.toString()}`;
};

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
  mallaReddyCollege: {
    name: "Malla Reddy College",
    coords: [17.5932, 78.4449],
    address: "Maisammaguda, Dulapally, Hyderabad, Telangana",
    temp: "31°C",
    traffic: "Campus route estimate available near Maisammaguda / Dulapally",
    type: "college"
  },
  hmtGroundChintal: {
    name: "HMT Ground Chintal",
    coords: [17.5014, 78.4417],
    address: "HMT Colony, Chintal, Quthbullapur, Hyderabad, Telangana 500054",
    temp: "31°C",
    traffic: "Local ground near HMT Road / Chintal route corridors",
    type: "ground"
  },
  hpGasChintal: {
    name: "HP Gas - Praveena Gas Agencies",
    coords: [17.4978, 78.4498],
    address: "Venkateswara Nagar / Main Road, Chinthal, Quthbullapur, Hyderabad, Telangana 500055",
    temp: "31°C",
    traffic: "HP LPG agency search result near Chintal",
    type: "gas agency"
  },
  sriGajananaHomes: {
    name: "Sri Gajanana Homes",
    coords: [17.5462, 78.4810],
    address: "Shivalayam Rd, Kompally, Hyderabad, Telangana 500100",
    temp: "31°C",
    traffic: "Apartment result on Shivalayam Road, Kompally",
    type: "apartment"
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

const isGpsRouteStartLabel = (value) => {
  const text = normalizeSearchText(value || '');
  return isGpsStartText(text) || /\bgps\b/.test(text);
};

const isPreciseGpsLocation = (place) => (
  Boolean(place?.coords)
  && place.type === 'gps'
  && place.name !== 'Approximate Location'
);

const SEARCH_ALIASES = {
  work: 'office job quthbullapur quthbulpur quthbulapur sudershan reddy nagar',
  home: 'house kompally kompali kompaly sri chaitanya school',
  hyderabad: 'hyd hyd centre center nampally city telangana',
  goa: 'panaji beach coastal city travel',
  suprabhata: 'suprabatha suprabata arcade commercial shop building kompally',
  ambMall: 'amb mall amb cinemas asian mahesh babu sarath city capital mall kondapur gachibowli hyderabad cinema theatre shopping mall',
  sits: 'sidhartha siddhartha group of institutions institute technology sciences sits narapally peerzadiguda college engineering hyderabad',
  mallaReddyCollege: 'malla reddy clg college engineering institute university maisammaguda dulapally dhulapally medchal hyderabad mallareddy mrec mriet mrcet mrce',
  hmtGroundChintal: 'hmt ground hmt grounds chintal chinthal hmt colony hmt road mahendra nagar quthbullapur jeedimetla hyderabad playground sports ground',
  hpGasChintal: 'hp gas hpcl hpgas praveena gas agencies praveena gas agency chintal chinthal quthbullapur venkateswara nagar main road lpg cylinder cooking gas hyderabad',
  sriGajananaHomes: 'sri gajanana homes sri gajana gajanana home shivalayam road shivalayam rd kompally apartment residence godrej warehouse nearby',
  alwal: 'alwal secunderabad city main road'
};

const PUBLIC_SEARCH_PLACE_KEYS = [];
const EXACT_LOCAL_SEARCH_KEYS = [];

const VERIFIED_SEARCH_FALLBACKS = [
  {
    key: 'verified-gandhis-villa-malkajgiri',
    match: /\b(gandhi'?s?|gandhis)\s+villa\b|\b(gandhi'?s?|gandhis)\b.*\b(malkajgiri|narasimha|maruthi)\b|\b(narasimha|maruthi|malkajgiri)\b.*\b(gandhi'?s?|gandhis)\b/i,
    place: {
      name: "Gandhi's Villa",
      coords: [17.4419366, 78.5373665],
      address: '3-89/1, Narasimha Reddy Nagar, Maruthi Nagar, Malkajgiri, Secunderabad, Telangana 500047',
      temp: '--',
      traffic: 'Verified local home result',
      type: 'residence'
    }
  },
  {
    key: 'verified-suprabhata-arcade-1',
    match: /\b(suprabhata|suprabatha)\s+arcade\s*-?\s*1\b|\b(gfwj\+wr4)\b|\b(gfwj\s*wr4)\b|\bsuprabhata\b.*\bkompally\b|\bsuprabatha\b.*\bkompally\b/i,
    place: {
      name: 'SUPRABHATA ARCADE-1',
      coords: [17.5472625, 78.4820781],
      address: 'GFWJ+WR4 2, Kompally, Hyderabad, Telangana 500100',
      temp: '--',
      traffic: 'Verified local apartment result',
      type: 'apartment'
    }
  },
  {
    key: 'verified-suprabhata-arcade-2',
    match: /\b(suprabhata|suprabatha)\s+arcade\s*-?\s*(2|ii)\b|\b(gfwj\+xv)\b|\b(gfwj\s*xv)\b/i,
    place: {
      name: 'Suprabatha Arcade-II',
      coords: [17.5474375, 78.4821875],
      address: 'GFWJ+XV, 2, Kompally, Hyderabad, Telangana 500100',
      temp: '--',
      traffic: 'Verified local apartment result',
      type: 'apartment'
    }
  },
  {
    key: 'verified-my-friends-circle-restaurant',
    match: /\b(my\s+)?friend'?s?\s+circle\b|\bfriends?\s+circle\s+restaurant\b|\bffxg\+pv\b|\bffxg\s*pv\b|\blaxmi\s+plaza\b.*\bsuchitra\b/i,
    place: {
      name: "My Friend's Circle Restaurant",
      coords: [17.4993125, 78.4771875],
      address: 'Plot No. 8, Suchitra Rd, near Laxmi Plaza, Ramraj Nagar, Medchal, Secunderabad, Telangana 500015',
      temp: '--',
      traffic: 'Verified local restaurant result',
      type: 'restaurant'
    }
  },
  {
    key: 'verified-indumani-plaza-apartment',
    match: /\bindumani\s+plaza\b|\bffw7\+j8\b|\bffw7\s*j8\b|\bpadma\s+nagar\b.*\bphase\s*ii\b/i,
    place: {
      name: 'Indumani Plaza Apartment',
      coords: [17.4965625, 78.4633125],
      address: '16, Padma Nagar Phase II Ln, Phase 2, Bajpayee Nagar, Quthbullapur, Hyderabad, Telangana 500054',
      temp: '--',
      traffic: 'Verified local apartment result',
      type: 'apartment'
    }
  },
  {
    key: 'verified-delite-kitchen-kompally',
    match: /\b(delite|delight|delete)\s+kitchen\b.*\b(kompally|devender|central park|doolapally)\b|\b(kompally|devender|central park|doolapally)\b.*\b(delite|delight|delete)\s+kitchen\b/i,
    place: {
      name: 'Delite Kitchen, Kompally',
      coords: [17.541892, 78.4908809],
      address: 'Survey No 160, Plot No 4-128, beside New Gulf Bakers, Central Park, Devender Colony, Kompally, Hyderabad, Telangana 500100',
      temp: '--',
      traffic: 'Verified local restaurant result',
      type: 'restaurant'
    }
  },
  {
    key: 'verified-delite-kitchen-medchal',
    match: /\b(delite|delight|delete)\s+kitchen\b.*\b(medchal|slr|vivekananda|raghavendra|nh44|gfrr)\b|\b(medchal|slr|vivekananda|raghavendra|nh44|gfrr)\b.*\b(delite|delight|delete)\s+kitchen\b/i,
    place: {
      name: 'Delite Kitchen - Medchal',
      coords: [17.5418125, 78.4908125],
      address: 'GFRR+P8, Sy#122&123, SLR Centre, NH44, opposite Vivekananda statue, Raghavendra Colony, Medchal, Hyderabad, Secunderabad, Telangana 501401',
      temp: '--',
      traffic: 'Verified local restaurant result',
      type: 'restaurant'
    }
  },
  {
    key: 'verified-dmart-kompally',
    match: /\b(dmart|d\s*mart|d-mart)\b.*\b(kompally|medchal)\b|\b(kompally|medchal)\b.*\b(dmart|d\s*mart|d-mart)\b/i,
    place: {
      name: 'D-Mart Kompally',
      coords: [17.5211523, 78.4830582],
      address: 'Medchal Rd, near RR Multispeciality Hospital, Caton Residential Twp, Kompally, Telangana 500067',
      temp: '--',
      traffic: 'Verified local supermarket result',
      type: 'supermarket'
    }
  },
  {
    key: 'verified-sri-gajanana-homes-kompally',
    match: /\b(sri\s+)?gajanana\s+homes?\b|\bgajanana\b.*\b(kompally|shivalayam)\b|\bshivalayam\s+road?\b.*\bgajanana\b|\bsri\s+gajanan[a]?\b/i,
    place: {
      name: 'Sri Gajanana Homes',
      coords: [17.5462, 78.4810],
      address: 'Shivalayam Rd, Kompally, Hyderabad, Telangana 500100',
      temp: '--',
      traffic: 'Verified local apartment result on Shivalayam Road',
      type: 'apartment'
    }
  }
];

const TRAVEL_MODES = [
  { id: 'car', label: 'Car', osrmProfile: 'driving', fuelKmPerLiter: 16, speedFallbackKmh: 32 },
  { id: 'bike', label: 'Bike', osrmProfile: 'driving', fuelKmPerLiter: 40, speedFallbackKmh: 30 },
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
    .replace(/[_\W]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const cleanIntentWords = (value) =>
  normalizeSearchText(value)
    .replace(/\b(near me|nearby|route|routes|direction|directions|navigate|navigation|go to|take me|show|find|search|map|maps)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const HYDERABAD_SEARCH_CENTERS = {
  chintal: [17.50136, 78.44166],
  kompally: [17.5323, 78.4892],
  kukatpally: [17.4948, 78.3996],
  idpl: [17.4816, 78.4336],
  alwal: [17.5011, 78.5034],
  hyderabad: [17.3850, 78.4867]
};

const getSearchCenterForQuery = (query) => {
  const text = normalizeSearchText(query);
  if (/\b(idpl|balanagar)\b/.test(text)) return HYDERABAD_SEARCH_CENTERS.idpl;
  if (/\b(kukatpally|kukatpali|kphb)\b/.test(text)) return HYDERABAD_SEARCH_CENTERS.kukatpally;
  if (/\b(hmt|chintal|chinthal|quthbullapur|jeedimetla)\b/.test(text)) return HYDERABAD_SEARCH_CENTERS.chintal;
  if (/\b(kompally|kompali|kompaly)\b/.test(text)) return HYDERABAD_SEARCH_CENTERS.kompally;
  if (/\b(alwal|secunderabad)\b/.test(text)) return HYDERABAD_SEARCH_CENTERS.alwal;
  return HYDERABAD_SEARCH_CENTERS.hyderabad;
};

const SEARCH_AREA_WORDS = new Set([
  'hyderabad', 'secunderabad', 'telangana', 'medchal', 'chintal', 'chinthal', 'idpl',
  'balanagar', 'kompally', 'kompali', 'kompaly', 'kukatpally', 'kukatpali', 'kphb',
  'alwal', 'quthbullapur', 'jeedimetla', 'dulapally', 'maisammaguda', 'near', 'nearby'
]);

const SEARCH_BRAND_ALIASES = {
  dmart: ['dmart', 'd mart', 'd-mart', 'avenue supermarts', 'avenue supermarket'],
  hp: ['hp', 'hpcl', 'hindustan petroleum'],
  hmt: ['hmt']
};

const SEARCH_TYPE_ALIASES = {
  fuel: 'petrol pump gas station fuel hp hpcl',
  restaurant: 'restaurants restaurant food dining cafe',
  cafe: 'restaurants cafe food coffee',
  fast_food: 'restaurants fast food dining',
  supermarket: 'supermarket grocery dmart d mart store shop mart',
  convenience: 'convenience store shop mart',
  department_store: 'department store shop mart',
  hotel: 'hotels hotel lodge stay',
  hostel: 'hostels hostel lodge stay',
  guest_house: 'hotels guest house lodge stay',
  motel: 'hotels motel lodge stay',
  hospital: 'hospitals hospital clinic medical',
  clinic: 'hospitals clinic medical',
  bus_station: 'transit bus station',
  bus_stop: 'transit bus stop',
  station: 'transit station metro railway',
  subway_entrance: 'transit metro subway station'
};

const CATEGORY_SEARCH_QUERIES = {
  fuel: 'petrol pumps near me',
  hospitals: 'hospitals near me',
  restaurants: 'restaurants near me',
  hostels: 'hostels hotels near me',
  transit: 'transit bus metro stations near me'
};

const NEARBY_CATEGORY_FALLBACKS = [
  {
    category: 'fuel',
    name: 'Indian Oil Petrol Pump',
    coords: [17.5409, 78.4908],
    address: 'Jayabheri Park Road / IOCL Kompally, Kompally, Hyderabad',
    type: 'fuel'
  },
  {
    category: 'fuel',
    name: 'Indian Oil Petrol Pump - Smart Bazaar Road',
    coords: [17.5435, 78.4902],
    address: 'Behind Smart Bazaar, Jayabheri Park Road, Kompally, Hyderabad',
    type: 'fuel'
  },
  {
    category: 'hospitals',
    name: 'KIMS Hospitals, Kompally',
    coords: [17.5354, 78.4858],
    address: 'Kompally, North Hyderabad, Telangana',
    type: 'hospital'
  },
  {
    category: 'hospitals',
    name: 'Renova Hospital, Kompally',
    coords: [17.5378, 78.4866],
    address: 'Kompally, Hyderabad, Telangana 500055',
    type: 'hospital'
  },
  {
    category: 'hospitals',
    name: 'Russh Super Speciality Hospital',
    coords: [17.5089, 78.4808],
    address: 'Suchitra Kompally, Hyderabad',
    type: 'hospital'
  },
  {
    category: 'restaurants',
    name: 'Delite Kitchen, Kompally',
    coords: [17.541892, 78.4908809],
    address: 'Central Park, Devender Colony, Kompally, Hyderabad',
    type: 'restaurant'
  },
  {
    category: 'restaurants',
    name: 'AnTeRa Kitchen And Bar',
    coords: [17.5289, 78.4898],
    address: 'Near PSR Convention Center, Brundavan Colony, Kompally, Hyderabad',
    type: 'restaurant'
  },
  {
    category: 'restaurants',
    name: 'Wow! Momo - IOCL Kompally',
    coords: [17.5409, 78.4908],
    address: 'IOCL Kompally, Kompally, Hyderabad',
    type: 'restaurant'
  },
  {
    category: 'restaurants',
    name: 'Zinggy Sea Food Restaurant',
    coords: [17.5382, 78.4862],
    address: 'Masjid Street, Opposite Citrus Hills, Kompally, Hyderabad',
    type: 'restaurant'
  },
  {
    category: 'transit',
    name: 'Kompally Bus Stop',
    coords: [17.5401, 78.4909],
    address: 'Nizamabad Road, Kompally, Hyderabad',
    type: 'bus_stop'
  },
  {
    category: 'transit',
    name: 'Gundlapochampally Railway Station',
    coords: [17.5876, 78.4779],
    address: 'Gundlapochampally, Medchal-Malkajgiri, Telangana',
    type: 'station'
  }
];

const getFallbackCategoriesForQuery = (query) => {
  const text = normalizeSearchText(query);
  const categories = [];
  if (/\b(petrol|pump|pumps|fuel|gas|hp|hpcl)\b/.test(text)) categories.push('fuel');
  if (/\b(hospital|hospitals|clinic|clinics|medical)\b/.test(text)) categories.push('hospitals');
  if (/\b(restaurant|restaurants|food|cafe|dining)\b/.test(text)) categories.push('restaurants');
  if (/\b(hostel|hostels|hotel|hotels|lodge|stay)\b/.test(text)) categories.push('hostels');
  if (/\b(transit|bus|metro|station|railway)\b/.test(text)) categories.push('transit');
  return [...new Set(categories)];
};

const getPrimarySearchWords = (query) => {
  const words = (cleanIntentWords(query) || normalizeSearchText(query))
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !SEARCH_AREA_WORDS.has(word));
  if (/\bd\s*mart\b|d-mart|dmart/i.test(query)) return ['dmart'];
  return words;
};

const getExpandedSearchRegexWords = (query) => {
  const primaryWords = getPrimarySearchWords(query);
  const expanded = primaryWords.flatMap((word) => SEARCH_BRAND_ALIASES[word] || [word]);
  return [...new Set(expanded)].slice(0, 8).map(escapeOverpassRegex);
};

const isHyderabadPoiQuery = (query) => (
  /\b(arcade|apartment|apartments|villa|residence|residency|plaza|dmart|d\s*mart|supermarket|shop|store|mart|restaurant|restaurants|food|cafe|hotel|hotels|hostel|hostels|lodge|bus|bus stop|metro|station|transit|petrol|pump|fuel|hp|hpcl|gas|lpg|hospital|hospitals|clinic|temple|mandir|masjid|church|school|college|colleges|clg|clgs|cgl|cgls|ground|hmt|chintal|chinthal|hyderabad|secunderabad|telangana|medchal|kompally|kukatpally|kphb|idpl|balanagar|dulapally|maisammaguda|quthbullapur|jeedimetla|malkajgiri|suchitra)\b/i.test(query)
);

const escapeOverpassRegex = (value) => (
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);

const buildOverpassPoiQuery = (query, centerOverride = null) => {
  const [lat, lng] = centerOverride || getSearchCenterForQuery(query);
  const words = getExpandedSearchRegexWords(query);
  const nameRegex = words.length ? words.join('|') : '.*';
  const radius = centerOverride
    ? (/\b(transit|bus|metro|station)\b/i.test(query) ? 14000 : 12000)
    : (/\b(dmart|d\s*mart|supermarket|shop|store|mart)\b/i.test(query)
    ? 24000
    : (/\b(hyderabad|secunderabad|telangana)\b/i.test(query) ? 22000 : 12000));

  return `[out:json][timeout:12];
(
  nwr(around:${radius},${lat},${lng})["name"~"${nameRegex}",i];
  nwr(around:${radius},${lat},${lng})["brand"~"${nameRegex}",i];
  nwr(around:${radius},${lat},${lng})["operator"~"${nameRegex}",i];
  nwr(around:${radius},${lat},${lng})["amenity"~"fuel|restaurant|cafe|fast_food|hospital|clinic|school|college|university|bus_station|place_of_worship",i];
  nwr(around:${radius},${lat},${lng})["tourism"~"hotel|hostel|guest_house|motel",i];
  nwr(around:${radius},${lat},${lng})["shop"~"supermarket|convenience|mall|department_store|general",i];
  nwr(around:${radius},${lat},${lng})["leisure"~"sports_centre|pitch|park|stadium",i];
  nwr(around:${radius},${lat},${lng})["public_transport"~"station|platform|stop_position",i];
  nwr(around:${radius},${lat},${lng})["highway"="bus_stop"];
  nwr(around:${radius},${lat},${lng})["railway"~"station|halt|subway_entrance",i];
);
out center tags 80;`;
};

const fetchJsonWithTimeout = async (url, options = {}, timeoutMs = 6500) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
};

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
  const qWords = q.split(/\s+/);
  const tWords = t.split(/\s+/);
  const normalizedTokens = qWords.map((word) => {
    if (['clg', 'clgs', 'cgl', 'cgls', 'colleges'].includes(word)) return 'college';
    if (['petrol', 'pump', 'pumps'].includes(word)) return 'fuel';
    if (['temples', 'mandir'].includes(word)) return 'temple';
    if (['hospitals', 'clinics'].includes(word)) return word.slice(0, -1);
    if (['stops'].includes(word)) return 'stop';
    return word;
  });
  const matchedTokens = normalizedTokens.filter((qWord) => (
    tWords.some((tWord) => tWord === qWord || tWord.startsWith(qWord) || qWord.startsWith(tWord))
  ));
  const coverage = matchedTokens.length / Math.max(1, normalizedTokens.length);

  if (t === q) return 100;
  if (t.startsWith(q)) return 88;
  if (t.includes(q)) return 72 + coverage * 18;
  if (coverage === 1) return 86;
  if (coverage >= 0.75) return 72;
  if (coverage < 0.5 && normalizedTokens.length > 1) return 0;

  return normalizedTokens.reduce((score, qWord) => {
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

const vehicleMarkerSvg = (className = '') => `
  <svg class="vehicle-marker-svg ${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <ellipse cx="24" cy="39" rx="15" ry="5" fill="black" opacity="0.2" />
    <path d="M9 29 C9 20 13 9 24 5 C35 9 39 20 39 29 L36 39 C33 44 15 44 12 39 L9 29Z" fill="#f8fafc" stroke="#dbeafe" stroke-width="2" />
    <path d="M16 18 C18 12 22 9 24 8 C26 9 30 12 32 18 L29 25 L19 25 L16 18Z" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1.4" />
    <path d="M14 29 C17 26 20 25 24 25 C28 25 31 26 34 29 L32 37 C27 40 21 40 16 37 L14 29Z" fill="#e2e8f0" />
    <path d="M10 30 L5 35 L11 35" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4" />
    <path d="M38 30 L43 35 L37 35" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4" />
    <circle cx="17" cy="32" r="2" fill="#fef3c7" />
    <circle cx="31" cy="32" r="2" fill="#fef3c7" />
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

const blendCoordinates = (from, to, ratio = 0.5) => {
  if (!from) return to;
  if (!to) return from;
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  return [
    from[0] + (to[0] - from[0]) * clampedRatio,
    from[1] + (to[1] - from[1]) * clampedRatio
  ];
};

const projectCoordinate = (coords, heading = 0, meters = 0) => {
  if (!coords || !Number.isFinite(meters) || Math.abs(meters) < 0.5) return coords;
  const earthRadius = 6371000;
  const bearing = (heading * Math.PI) / 180;
  const distanceRatio = meters / earthRadius;
  const lat1 = (coords[0] * Math.PI) / 180;
  const lng1 = (coords[1] * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceRatio)
    + Math.cos(lat1) * Math.sin(distanceRatio) * Math.cos(bearing)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(distanceRatio) * Math.cos(lat1),
    Math.cos(distanceRatio) - Math.sin(lat1) * Math.sin(lat2)
  );
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
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

const getRouteDurationMinutes = (_route, distanceKm, mode) => getEstimatedRouteMinutes(distanceKm, mode);

const getNearestRouteDistance = (point, routeCoordinates = []) => (
  routeCoordinates.reduce((nearest, routePoint) => (
    Math.min(nearest, getDistanceMeters(point, routePoint))
  ), Number.POSITIVE_INFINITY)
);

const getRouteProgress = (point, routeCoordinates = []) => {
  if (!point || routeCoordinates.length < 2) {
    return {
      distanceToRoute: Number.POSITIVE_INFINITY,
      progressMeters: 0,
      remainingMeters: Number.POSITIVE_INFINITY,
      routeLengthMeters: 0,
      nearestPoint: null,
      routeHeading: 0,
      segmentIndex: 0
    };
  }

  let best = {
    distanceToRoute: Number.POSITIVE_INFINITY,
    progressMeters: 0,
    remainingMeters: 0,
    routeLengthMeters: 0,
    nearestPoint: null,
    routeHeading: 0,
    segmentIndex: 0
  };
  let distanceBeforeSegment = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i += 1) {
    const start = routeCoordinates[i];
    const end = routeCoordinates[i + 1];
    const midLatRad = ((start[0] + end[0]) / 2) * Math.PI / 180;
    const metersPerLat = 111320;
    const metersPerLng = Math.max(1, 111320 * Math.cos(midLatRad));
    const ax = start[1] * metersPerLng;
    const ay = start[0] * metersPerLat;
    const bx = end[1] * metersPerLng;
    const by = end[0] * metersPerLat;
    const px = point[1] * metersPerLng;
    const py = point[0] * metersPerLat;
    const dx = bx - ax;
    const dy = by - ay;
    const segmentLengthSq = dx * dx + dy * dy;
    const segmentLength = Math.sqrt(segmentLengthSq);

    if (!segmentLength) continue;

    const projection = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / segmentLengthSq));
    const projectedX = ax + dx * projection;
    const projectedY = ay + dy * projection;
    const distanceToRoute = Math.hypot(px - projectedX, py - projectedY);
    const progressMeters = distanceBeforeSegment + segmentLength * projection;

    if (distanceToRoute < best.distanceToRoute) {
      best = {
        distanceToRoute,
        progressMeters,
        remainingMeters: 0,
        routeLengthMeters: 0,
        nearestPoint: [projectedY / metersPerLat, projectedX / metersPerLng],
        routeHeading: getBearingDegrees(start, end),
        segmentIndex: i
      };
    }

    distanceBeforeSegment += segmentLength;
  }

  best.routeLengthMeters = distanceBeforeSegment;
  best.remainingMeters = Math.max(0, distanceBeforeSegment - best.progressMeters);
  return best;
};

const getRoutePointAtProgress = (routeCoordinates = [], targetProgressMeters = 0) => {
  if (routeCoordinates.length < 2) return null;
  let distanceBeforeSegment = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i += 1) {
    const start = routeCoordinates[i];
    const end = routeCoordinates[i + 1];
    const segmentLength = getDistanceMeters(start, end);
    if (!segmentLength) continue;
    const segmentEndProgress = distanceBeforeSegment + segmentLength;

    if (targetProgressMeters <= segmentEndProgress) {
      const ratio = Math.max(0, Math.min(1, (targetProgressMeters - distanceBeforeSegment) / segmentLength));
      const point = blendCoordinates(start, end, ratio);
      return {
        point,
        heading: getBearingDegrees(start, end)
      };
    }

    distanceBeforeSegment = segmentEndProgress;
  }

  const last = routeCoordinates[routeCoordinates.length - 1];
  const previous = routeCoordinates[routeCoordinates.length - 2];
  return {
    point: last,
    heading: getBearingDegrees(previous, last)
  };
};

const getStepProgressMeters = (step, routeCoordinates = []) => {
  if (!step?.coords || routeCoordinates.length < 2) return null;
  return getRouteProgress(step.coords, routeCoordinates).progressMeters;
};

const formatLiveStepInstruction = (step, metersAway) => {
  if (!step) return 'Go straight';
  const roundedDistance = Math.max(10, Math.round((metersAway || 0) / 10) * 10);
  const nextInstruction = step.instruction || 'Go straight';
  if (/arriv/i.test(nextInstruction)) return nextInstruction;
  if (/^go straight/i.test(nextInstruction)) return nextInstruction.replace(/for \d+ m/i, `for ${roundedDistance} m`);
  if (/\bin \d+ m/i.test(nextInstruction)) return nextInstruction.replace(/\bin \d+ m/i, `in ${roundedDistance} m`);
  if (/^turn/i.test(nextInstruction)) return `${nextInstruction} in ${roundedDistance} m`;
  return nextInstruction;
};

const getManeuverDisplay = (instruction = '') => {
  const text = String(instruction || '').toLowerCase();
  if (/\barriv/.test(text)) return { symbol: '\u2713', label: 'Arrived', icon: 'ic_nav_arrive' };
  if (/\bu[-\s]?turn\b|\bmake a u\b/.test(text)) return { symbol: '\u21b6', label: 'U-turn', icon: 'ic_nav_uturn' };
  if (/\bleft\b/.test(text)) return { symbol: '\u21b0', label: 'Turn left', icon: 'ic_nav_turn_left' };
  if (/\bright\b/.test(text)) return { symbol: '\u21b1', label: 'Turn right', icon: 'ic_nav_turn_right' };
  if (/\bstraight\b|\bcontinue\b|\btowards\b/.test(text)) return { symbol: '\u2191', label: 'Go straight', icon: 'ic_nav_straight' };
  return { symbol: '\u279c', label: 'Navigation', icon: 'ic_nav_straight' };
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
  const [searchCenterOverride, setSearchCenterOverride] = useState(null);
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
  const routeLastLegMarkersGroup = useRef([]);
  const routeStartLegMarkersGroup = useRef([]);
  const routeLineCoordinatesRef = useRef([]);
  const lastRouteEndpointsRef = useRef(null);
  const navTelemetryRef = useRef({ lastCoords: null, rawCoords: null, filteredCoords: null, displayCoords: null, coveredMeters: 0, heading: 0, startedAt: null, averageSpeedKmh: 0 });
  const navRerouteRef = useRef({ lastRerouteAt: 0, offRouteHits: 0, currentStepIndex: 0 });
  const navProgressRef = useRef({ lastProgressMeters: 0, lastRemainingMeters: null, arrived: false });
  const routeInteractionLockedRef = useRef(false);
  const activeBaseStyleRef = useRef(mapStyle);
  const audioCtxRef = useRef(null);
  const hazardWatchIdRef = useRef(null);
  const warnedHazardsRef = useRef(new Set());
  const mapReadSuggestionsRef = useRef([]);
  const navigationNotificationsReadyRef = useRef(false);
  const navigationNotificationShownRef = useRef(false);
  const navigationNotificationLastMetaRef = useRef('');
  const latestRouteMetaRef = useRef(null);
  const latestActiveLocationRef = useRef(DEFAULT_ACTIVE_LOCATION);
  const latestMobileModeRef = useRef('place');
  const exitNavigationRef = useRef(null);
  const arrivalUnlockTimerRef = useRef(null);

  const clearSearchState = () => {
    setSearchQuery('');
    setSearchCenterOverride(null);
    mapReadSuggestionsRef.current = [];
    setGlobalSuggestions([]);
    setGlobalSearchLoading(false);
  };

  useEffect(() => {
    routeInteractionLockedRef.current = mobileMode === 'nav' || routeActive;
  }, [mobileMode, routeActive]);

  const renderUserLocationMarker = (coords, { label = 'Your Location', heading = 0, variant = '' } = {}) => {
    const map = leafletMapInstance.current;
    if (!map || !coords) return;

    userLayerGroup.current.forEach((marker) => marker.remove());
    userLayerGroup.current = [];

    const userIcon = document.createElement('div');
    const isNavigationMarker = variant.split(/\s+/).includes('nav-live');
    userIcon.className = `gps-marker ${isNavigationMarker ? 'vehicle-gps-marker' : 'spider-gps-marker'} ${variant}`.trim();
    userIcon.style.setProperty('--gps-heading', `${Math.round(heading || 0)}deg`);
    userIcon.innerHTML = isNavigationMarker
      ? vehicleMarkerSvg('vehicle-marker-core')
      : spiderMarkerSvg('spider-marker-core');

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

  const exactLocalSearchPlaces = useMemo(() => (
    EXACT_LOCAL_SEARCH_KEYS.map((key) => {
      const place = placesDatabase[key];
      return {
        key,
        place,
        text: `${place.name} ${place.address} ${place.type} ${SEARCH_ALIASES[key] || ''}`
      };
    })
  ), []);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const cleanedQuery = cleanIntentWords(searchQuery) || normalizeSearchText(searchQuery);
    const queryWords = cleanedQuery.split(/\s+/).filter(Boolean);
    const allowExactLocal = cleanedQuery.length >= 4 || queryWords.length >= 2;

    const localSuggestions = searchablePlaces
      .filter((item) => fuzzySearch(searchQuery, item.text))
      .map((item) => ({
        ...item,
        source: 'local',
        score: getSearchScore(searchQuery, item.text)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const exactLocalSuggestions = allowExactLocal
      ? exactLocalSearchPlaces
          .map((item) => ({
            ...item,
            source: 'local',
            score: getSearchScore(searchQuery, item.text)
          }))
          .filter((item) => item.score >= 70)
      : [];

    const verifiedFallbackSuggestions = VERIFIED_SEARCH_FALLBACKS
      .filter((item) => item.match.test(searchQuery))
      .map((item) => ({
        key: item.key,
        source: 'verified',
        score: 240,
        place: item.place
      }));

    const primarySearchWords = getPrimarySearchWords(searchQuery);
    const localRankCenter = searchCenterOverride || (isHyderabadPoiQuery(searchQuery) ? getSearchCenterForQuery(searchQuery) : null);
    const scoredGlobal = globalSuggestions
      .map((item) => {
        const typeAliases = SEARCH_TYPE_ALIASES[item.place.type] || '';
        const text = `${item.place.name} ${item.place.address} ${item.place.type || ''} ${typeAliases}`;
        const normalizedText = normalizeSearchText(text);
        const primaryHits = primarySearchWords.filter((word) => {
          const aliases = SEARCH_BRAND_ALIASES[word] || [word];
          return aliases.some((alias) => normalizedText.includes(normalizeSearchText(alias)));
        }).length;
        const brandMatchBonus = primaryHits > 0 ? 58 + primaryHits * 12 : 0;
        const distanceMeters = localRankCenter ? getDistanceMeters(localRankCenter, item.place.coords) : null;
        const nearbyBonus = Number.isFinite(distanceMeters) ? Math.max(0, 38 - (distanceMeters / 1000) * 4) : 0;
        return {
          ...item,
          distanceMeters,
          score: getSearchScore(searchQuery, text) + brandMatchBonus + nearbyBonus
        };
      })
      .filter((item) => item.score >= (primarySearchWords.length ? 34 : 45));

    return [...verifiedFallbackSuggestions, ...exactLocalSuggestions, ...localSuggestions, ...scoredGlobal]
      .sort((a, b) => (b.score - a.score) || (a.source === 'local' ? -1 : 1))
      .slice(0, 7);
  }, [exactLocalSearchPlaces, globalSuggestions, searchCenterOverride, searchQuery, searchablePlaces]);

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
        const localQueryHint = isHyderabadPoiQuery(searchQuery);
        const searchCenter = searchCenterOverride
          || (/\bnear me\b/i.test(searchQuery) && lastUserLocation?.coords ? lastUserLocation.coords : null);
        const [searchLat, searchLng] = searchCenter || getSearchCenterForQuery(searchQuery);
        const photonUrl = localQueryHint
          ? `https://photon.komoot.io/api/?q=${encodeURIComponent(searchCenter ? cleanedQuery : `${cleanedQuery} Telangana India`)}&limit=8&lang=en&lat=${searchLat}&lon=${searchLng}`
          : `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanedQuery)}&limit=5&lang=en`;
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=8&q=${encodeURIComponent(localQueryHint ? `${cleanedQuery} Telangana India` : cleanedQuery)}`;
        const overpassBody = buildOverpassPoiQuery(searchQuery, searchCenter);
        const [photonResult, nominatimResult, overpassResult] = await Promise.allSettled([
          fetch(photonUrl, { signal: controller.signal }).then((response) => {
            if (!response.ok) throw new Error('Photon search failed');
            return response.json();
          }),
          fetch(nominatimUrl, { signal: controller.signal }).then((response) => {
            if (!response.ok) throw new Error('Nominatim search failed');
            return response.json();
          }),
          localQueryHint
            ? fetchJsonWithTimeout('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: new URLSearchParams({ data: overpassBody })
              }, 7000)
            : Promise.resolve({ elements: [] })
        ]);

        const photonFeatures = photonResult.status === 'fulfilled' && Array.isArray(photonResult.value.features)
          ? photonResult.value.features
          : [];
        const nominatimFeatures = nominatimResult.status === 'fulfilled' && Array.isArray(nominatimResult.value)
          ? nominatimResult.value
          : [];
        const overpassElements = overpassResult.status === 'fulfilled' && Array.isArray(overpassResult.value.elements)
          ? overpassResult.value.elements
          : [];

        const maxNearbyDistance = searchCenter
          ? (/\b(transit|bus|metro|station)\b/i.test(searchQuery) ? 16000 : 14000)
          : null;
        const isNearbyResult = (place) => (
          !searchCenter
          || getDistanceMeters(searchCenter, place.coords) <= maxNearbyDistance
        );

        const photonSuggestions = photonFeatures
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
          .filter((suggestion) => suggestion && isNearbyResult(suggestion.place))
          .filter(Boolean);

        const nominatimSuggestions = nominatimFeatures
          .map((item, index) => {
            const lat = Number(item.lat);
            const lng = Number(item.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            const address = item.address || {};
            const name = item.name || address.amenity || address.leisure || address.road || item.display_name?.split(',')[0] || cleanedQuery;
            return {
              key: `nominatim-${item.osm_type || 'x'}-${item.osm_id || index}-${lat}-${lng}`,
              source: 'nominatim',
              score: 35 - index,
              place: {
                name,
                coords: [lat, lng],
                address: item.display_name || [address.suburb, address.city, address.state, address.country].filter(Boolean).join(', '),
                temp: '--',
                traffic: 'OpenStreetMap search result',
                type: item.type || item.category || 'osm'
              }
            };
          })
          .filter((suggestion) => suggestion && isNearbyResult(suggestion.place))
          .filter(Boolean);

        const overpassSuggestions = overpassElements
          .map((item, index) => {
            const tags = item.tags || {};
            const lat = item.lat ?? item.center?.lat;
            const lng = item.lon ?? item.center?.lon;
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            const name = tags.name || tags.brand || tags.operator || tags['addr:housename'];
            if (!name) return null;
            const type = tags.amenity || tags.tourism || tags.leisure || tags.highway || tags.railway || tags.public_transport || tags.shop || 'poi';
            const address = [
              tags['addr:housenumber'] && tags['addr:street'] ? `${tags['addr:housenumber']} ${tags['addr:street']}` : tags['addr:street'],
              tags['addr:suburb'] || tags['addr:neighbourhood'] || tags.locality,
              tags['addr:city'] || 'Hyderabad',
              tags['addr:state'] || 'Telangana'
            ].filter(Boolean).join(', ');
            return {
              key: `overpass-${item.type}-${item.id}-${lat}-${lng}`,
              source: 'overpass',
              score: 45 - index,
              place: {
                name,
                coords: [lat, lng],
                address: address || `${type}, Hyderabad, Telangana`,
                temp: '--',
                traffic: 'Hyderabad OpenStreetMap POI result',
                type
              }
            };
          })
          .filter((suggestion) => suggestion && isNearbyResult(suggestion.place))
          .filter(Boolean);

        const mapSuggestions = searchCenter ? mapReadSuggestionsRef.current : [];
        const providerSuggestions = [...overpassSuggestions, ...photonSuggestions, ...nominatimSuggestions];
        const fallbackCategories = searchCenter && !mapSuggestions.length && !providerSuggestions.length ? getFallbackCategoriesForQuery(searchQuery) : [];
        const fallbackSuggestions = fallbackCategories.length
          ? NEARBY_CATEGORY_FALLBACKS
              .filter((item) => fallbackCategories.includes(item.category))
              .map((item, index) => ({
                key: `nearby-fallback-${item.category}-${normalizeSearchText(item.name).replace(/\s+/g, '-')}`,
                source: 'nearby',
                score: 60 - index,
                place: {
                  name: item.name,
                  coords: item.coords,
                  address: item.address,
                  temp: '--',
                  traffic: 'Nearby fallback result while live OSM POI search is slow',
                  type: item.type
                }
              }))
              .filter((suggestion) => isNearbyResult(suggestion.place))
          : [];

        const seen = new Set();
        const primarySearchWords = getPrimarySearchWords(searchQuery);
        const searchRankCenter = searchCenter || (localQueryHint ? getSearchCenterForQuery(searchQuery) : null);
        const rankProviderSuggestion = (suggestion) => {
          const typeAliases = SEARCH_TYPE_ALIASES[suggestion.place.type] || '';
          const text = normalizeSearchText(`${suggestion.place.name} ${suggestion.place.address} ${suggestion.place.type || ''} ${typeAliases}`);
          const primaryHits = primarySearchWords.filter((word) => {
            const aliases = SEARCH_BRAND_ALIASES[word] || [word];
            return aliases.some((alias) => text.includes(normalizeSearchText(alias)));
          }).length;
          const distanceMeters = searchRankCenter ? getDistanceMeters(searchRankCenter, suggestion.place.coords) : null;
          const nearbyScore = Number.isFinite(distanceMeters) ? Math.max(0, 28 - (distanceMeters / 1000) * 3) : 0;
          const sourceBonus = suggestion.source === 'map' ? 80 : suggestion.source === 'overpass' ? 12 : 0;
          return sourceBonus + (primaryHits * 100) + nearbyScore + (suggestion.score || 0);
        };
        setGlobalSuggestions(
          [...mapSuggestions, ...providerSuggestions, ...fallbackSuggestions]
            .filter((suggestion) => {
              const key = `${normalizeSearchText(suggestion.place.name)}-${suggestion.place.coords.map((value) => value.toFixed(3)).join(',')}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .sort((a, b) => rankProviderSuggestion(b) - rankProviderSuggestion(a))
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
  }, [lastUserLocation?.coords, searchCenterOverride, searchQuery]);

  useEffect(() => {
    const cleanedQuery = cleanIntentWords(searchQuery) || normalizeSearchText(searchQuery);
    if (searchCenterOverride || cleanedQuery.length < 3 || routeSearchTarget) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const mapSuggestions = await readSearchTextFromMap(searchQuery);
      if (cancelled || mapReadSuggestionsRef.current.length) return;
      mapReadSuggestionsRef.current = mapSuggestions;
      if (mapSuggestions.length) {
        setGlobalSuggestions((current) => {
          const seen = new Set();
          return [...mapSuggestions, ...current].filter((suggestion) => {
            const key = `${normalizeSearchText(suggestion.place.name)}-${suggestion.place.coords.map((value) => value.toFixed(3)).join(',')}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [routeSearchTarget, searchCenterOverride, searchQuery]);

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
            renderRouteEndpointMarkers(routeLineCoordinatesRef.current[0] || start, end, startLabel, label);
            renderRouteLastLeg(routeLineCoordinatesRef.current.at(-1) || end, end);
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
    clearRouteLastLeg();
    clearRouteStartLeg();
    clearMapLibreLayer('route-line-casing');
    clearMapLibreLayer('route-line');
  };

  const clearRouteEndpointMarkers = () => {
    routeEndpointMarkersGroup.current.forEach((marker) => marker.remove());
    routeEndpointMarkersGroup.current = [];
  };

  const clearRouteLastLeg = () => {
    clearMapLibreLayer('route-last-leg');
    routeLastLegMarkersGroup.current.forEach((marker) => marker.remove());
    routeLastLegMarkersGroup.current = [];
  };

  const clearRouteStartLeg = () => {
    routeStartLegMarkersGroup.current.forEach((marker) => marker.remove());
    routeStartLegMarkersGroup.current = [];
  };

  const renderRouteEndpointMarkers = (start, end, startLabel = 'Start', endLabel = 'Destination') => {
    const map = leafletMapInstance.current;
    if (!map || !start || !end) return;
    clearRouteEndpointMarkers();

    const endpointMarkers = [];
    const shouldShowStartMarker = !isGpsRouteStartLabel(startLabel);

    if (shouldShowStartMarker) {
      const startEl = document.createElement('div');
      startEl.className = 'route-endpoint-marker route-start-marker';
      startEl.title = startLabel;
      startEl.innerHTML = spiderMarkerSvg('spider-marker-core');
      const startMarker = new maplibregl.Marker({ element: startEl, anchor: 'center' })
        .setLngLat(toLngLat(start))
        .setPopup(new maplibregl.Popup({ offset: 18 }).setText(startLabel))
        .addTo(map);
      endpointMarkers.push(startMarker);
    }

    const endEl = document.createElement('div');
    endEl.className = 'route-endpoint-marker route-destination-marker';
    endEl.title = endLabel;
    endEl.innerHTML = `<span></span><strong>${endLabel}</strong>`;
    const endMarker = new maplibregl.Marker({ element: endEl, anchor: 'bottom' })
      .setLngLat(toLngLat(end))
      .setPopup(new maplibregl.Popup({ offset: 18 }).setText(endLabel))
      .addTo(map);

    routeEndpointMarkersGroup.current = [...endpointMarkers, endMarker];
  };

  const renderRouteLastLeg = (routeEnd, destination) => {
    const map = leafletMapInstance.current;
    if (!map) return;
    clearRouteLastLeg();
    if (!routeEnd || !destination) return;
    const distanceMeters = getDistanceMeters(routeEnd, destination);
    if (distanceMeters < 8) return;

    const dotCount = Math.min(30, Math.max(7, Math.round(distanceMeters / 16)));
    const features = Array.from({ length: dotCount }, (_, index) => {
      const ratio = dotCount === 1 ? 1 : index / (dotCount - 1);
      const point = [
        routeEnd[0] + (destination[0] - routeEnd[0]) * ratio,
        routeEnd[1] + (destination[1] - routeEnd[1]) * ratio
      ];
      return {
        point
      };
    });

    routeLastLegMarkersGroup.current = features.map(({ point }, index) => {
      const dot = document.createElement('div');
      dot.className = index === features.length - 1
        ? 'route-last-leg-dot destination-dot'
        : 'route-last-leg-dot';
      return new maplibregl.Marker({ element: dot, anchor: 'center' })
        .setLngLat(toLngLat(point))
        .addTo(map);
    });
  };

  const renderRouteStartLeg = (rawCoords, displayCoords) => {
    const map = leafletMapInstance.current;
    if (!map) return;
    clearRouteStartLeg();
    if (!rawCoords || !displayCoords) return;
    const distanceMeters = getDistanceMeters(rawCoords, displayCoords);
    if (distanceMeters < 8 || distanceMeters > 1200) return;

    const dotCount = Math.min(44, Math.max(5, Math.round(distanceMeters / 18)));
    routeStartLegMarkersGroup.current = Array.from({ length: dotCount }, (_, index) => {
      const ratio = dotCount === 1 ? 1 : index / (dotCount - 1);
      const point = blendCoordinates(rawCoords, displayCoords, ratio);
      const dot = document.createElement('div');
      dot.className = 'route-start-leg-dot';
      return new maplibregl.Marker({ element: dot, anchor: 'center' })
        .setLngLat(toLngLat(point))
        .addTo(map);
    });
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
        'line-color': '#1d4ed8',
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
        'line-color': '#93c5fd',
        'line-width': 11,
        'line-opacity': 0.34
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
      navTelemetryRef.current = { lastCoords: null, rawCoords: null, filteredCoords: null, displayCoords: null, coveredMeters: 0, heading: 0, startedAt: null, averageSpeedKmh: 0 };
      setNavTelemetry({ speedKmh: 0, coveredKm: 0, heading: 0, accuracy: null });
      return undefined;
    }

    navTelemetryRef.current = {
      lastCoords: lastUserLocation?.coords || null,
      rawCoords: lastUserLocation?.coords || null,
      filteredCoords: lastUserLocation?.coords || null,
      displayCoords: lastUserLocation?.coords || null,
      coveredMeters: 0,
      heading: 0,
      startedAt: Date.now(),
      averageSpeedKmh: 0
    };
    navProgressRef.current = { lastProgressMeters: 0, lastRemainingMeters: null, arrived: false };
    navRerouteRef.current = { lastRerouteAt: Date.now(), offRouteHits: 0, currentStepIndex: 0 };
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const rawCoords = [position.coords.latitude, position.coords.longitude];
        const speedKmh = Math.max(0, ((position.coords.speed || 0) * 3.6));
        const previousRaw = navTelemetryRef.current.rawCoords;
        const previousFiltered = navTelemetryRef.current.filteredCoords || previousRaw;
        const accuracy = position.coords.accuracy || null;
        const rawJumpMeters = previousRaw ? getDistanceMeters(previousRaw, rawCoords) : 0;
        const shouldIgnoreJump = rawJumpMeters > 220 && speedKmh < 35 && accuracy && accuracy > 45;
        const filterRatio = accuracy && accuracy > 35 ? 0.18 : speedKmh > 18 ? 0.58 : 0.36;
        const filteredCoords = shouldIgnoreJump
          ? previousFiltered || rawCoords
          : blendCoordinates(previousFiltered, rawCoords, filterRatio);
        const routeProgress = getRouteProgress(filteredCoords, routeLineCoordinatesRef.current);
        const shouldSnapToRoad = routeProgress.nearestPoint
          && Number.isFinite(routeProgress.distanceToRoute)
          && routeProgress.distanceToRoute <= 1400;
        const heading = Number.isFinite(position.coords.heading)
          ? position.coords.heading
          : previousFiltered
            ? getBearingDegrees(previousFiltered, filteredCoords)
            : navTelemetryRef.current.heading;
        const predictedMeters = speedKmh > 5 ? Math.min(14, (speedKmh / 3.6) * 0.65) : 0;
        const lockToRouteStart = routeLineCoordinatesRef.current.length >= 2
          && navTelemetryRef.current.coveredMeters < 20
          && speedKmh < 4;
        const routeDisplayPoint = lockToRouteStart
          ? getRoutePointAtProgress(routeLineCoordinatesRef.current, 0)
          : shouldSnapToRoad
          ? getRoutePointAtProgress(routeLineCoordinatesRef.current, routeProgress.progressMeters + predictedMeters)
          : null;
        const displayCoords = routeDisplayPoint?.point || projectCoordinate(filteredCoords, heading, predictedMeters);
        const displayHeading = routeDisplayPoint?.heading ?? heading;
        let coveredMeters = navTelemetryRef.current.coveredMeters;

        if (previousFiltered) {
          const delta = getDistanceMeters(previousFiltered, filteredCoords);
          if (delta < 180) coveredMeters += delta;
        }

        const elapsedHours = navTelemetryRef.current.startedAt
          ? Math.max(0, (Date.now() - navTelemetryRef.current.startedAt) / 3600000)
          : 0;
        const tripAverageSpeedKmh = elapsedHours > 0.003 && coveredMeters > 30
          ? (coveredMeters / 1000) / elapsedHours
          : 0;
        const previousAverageSpeed = navTelemetryRef.current.averageSpeedKmh || 0;
        const liveAverageSpeedKmh = tripAverageSpeedKmh > 0
          ? (previousAverageSpeed > 0 ? (previousAverageSpeed * 0.7 + tripAverageSpeedKmh * 0.3) : tripAverageSpeedKmh)
          : previousAverageSpeed;

        navTelemetryRef.current = {
          lastCoords: filteredCoords,
          rawCoords,
          filteredCoords,
          displayCoords,
          coveredMeters,
          heading: displayHeading,
          startedAt: navTelemetryRef.current.startedAt || Date.now(),
          averageSpeedKmh: liveAverageSpeedKmh
        };
        setNavTelemetry({
          speedKmh,
          coveredKm: coveredMeters / 1000,
          heading: displayHeading,
          accuracy
        });
        renderUserLocationMarker(displayCoords, { label: 'Current location', heading: displayHeading, variant: 'nav-live' });
        if (!navProgressRef.current.arrived) {
          renderRouteStartLeg(rawCoords, displayCoords);
        } else {
          clearRouteStartLeg();
        }
        if (leafletMapInstance.current) {
          leafletMapInstance.current.easeTo({
            center: toLngLat(displayCoords),
            bearing: displayHeading,
            zoom: Math.max(leafletMapInstance.current.getZoom(), 16),
            offset: [0, 110],
            duration: 650
          });
        }

        const destination = lastRouteEndpointsRef.current?.end;
        if (destination) {
          const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];
          const crowDistanceToDestination = getDistanceMeters(filteredCoords, destination);
          const previousRemaining = navProgressRef.current.lastRemainingMeters;
          const selectedRouteMeters = Number.isFinite(latestRouteMetaRef.current?.routeDistanceMeters)
            ? latestRouteMetaRef.current.routeDistanceMeters
            : routeLineCoordinatesRef.current.reduce((sum, point, index, coordinates) => {
              if (index === 0) return 0;
              return sum + getDistanceMeters(coordinates[index - 1], point);
            }, 0);
          const progressMeters = Math.min(selectedRouteMeters, Math.max(navProgressRef.current.lastProgressMeters || 0, coveredMeters));
          const rawRemainingMeters = selectedRouteMeters > 0
            ? Math.max(0, selectedRouteMeters - progressMeters)
            : crowDistanceToDestination;
          const remainingMeters = previousRemaining === null
            ? rawRemainingMeters
            : Math.min(previousRemaining, rawRemainingMeters + 8);
          const arrived = crowDistanceToDestination <= 28 || remainingMeters <= 25;
          const justArrived = arrived && !navProgressRef.current.arrived;
          navProgressRef.current = {
            lastProgressMeters: progressMeters,
            lastRemainingMeters: arrived ? 0 : Math.max(0, remainingMeters),
            arrived: navProgressRef.current.arrived || arrived
          };
          if (justArrived) {
            triggerToast("Destination Reached", `You arrived at ${lastRouteEndpointsRef.current?.label || 'destination'}.`, false);
            clearRouteStartLeg();
            if (arrivalUnlockTimerRef.current) window.clearTimeout(arrivalUnlockTimerRef.current);
            arrivalUnlockTimerRef.current = window.setTimeout(unlockNavigationAfterArrival, 3500);
          }
          const remainingKm = (navProgressRef.current.arrived ? 0 : navProgressRef.current.lastRemainingMeters) / 1000;
          const liveSpeed = liveAverageSpeedKmh > 4
            ? Math.max(4, Math.min(liveAverageSpeedKmh, selectedMode.speedFallbackKmh * 1.8))
            : speedKmh > 6
            ? speedKmh
            : selectedMode.speedFallbackKmh;
          const remainingMinutes = navProgressRef.current.arrived ? 0 : Math.max(1, Math.round((remainingKm / liveSpeed) * 60));
          const fuelLiters = selectedMode.fuelKmPerLiter ? (navProgressRef.current.arrived ? 0 : Math.max(0.1, remainingKm / selectedMode.fuelKmPerLiter)) : 0;
          navRerouteRef.current.offRouteHits = 0;

          setRouteMeta((current) => {
            if (!current) return current;
            const stepsWithCoords = current.steps?.filter((step) => step.coords) || [];
            const routeProgressMeters = progressMeters;
            const stepsAhead = stepsWithCoords
              .map((step, index) => ({
                ...step,
                index,
                progressMeters: getStepProgressMeters(step, routeLineCoordinatesRef.current)
              }))
              .filter((step) => Number.isFinite(step.progressMeters))
              .sort((a, b) => a.progressMeters - b.progressMeters);
            const nextStep = stepsAhead.find((step) => step.progressMeters > routeProgressMeters + 18)
              || stepsAhead.find((step) => /arriv/i.test(step.instruction))
              || null;
            if (nextStep) {
              navRerouteRef.current.currentStepIndex = nextStep.index;
            }
            const stepDistance = nextStep ? Math.max(0, nextStep.progressMeters - routeProgressMeters) : remainingMeters;
            const hasArrived = navProgressRef.current.arrived;
            const liveInstruction = hasArrived
              ? 'Arrived at destination'
              : nextStep
              ? formatLiveStepInstruction(nextStep, stepDistance)
              : 'Go straight';

            return {
              ...current,
              distance: `${remainingKm.toFixed(1)} km`,
              duration: hasArrived ? 'Arrived' : `${remainingMinutes} min`,
              fuel: `${fuelLiters.toFixed(1)} L`,
              instruction: liveInstruction,
              nextInstruction: nextStep?.name || current.routeTo || current.nextInstruction,
              offRouteDistance: null
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
    if (routeInteractionLockedRef.current) {
      return;
    }
    playClickSound();
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

    return null;
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

    return null;
  };

  useEffect(() => {
    if (mobileMode === 'route' || mobileMode === 'nav' || routeActive) return;
    setRouteToQuery(isRouteDestination(activeLocation) ? activeLocation.name : '');
  }, [activeLocation, mobileMode, routeActive]);

  const drawRouteBetween = async (start, end, label = "destination", modeId = travelMode, startLabel = "Selected start", waypoint = null, allowModeFallback = true) => {
    const map = leafletMapInstance.current;
    if (!map || !leafletLoaded) return null;

    clearRouteLine();
    lastRouteEndpointsRef.current = { start, end, label, startLabel, waypoint };
    navProgressRef.current = { lastProgressMeters: 0, lastRemainingMeters: null, arrived: false };
    const selectedMode = TRAVEL_MODES.find((mode) => mode.id === modeId) || TRAVEL_MODES[0];
    const routeSummary = waypoint
      ? `${startLabel} to ${label} via ${waypoint.name}`
      : `${startLabel} to ${label}`;

    const drawRouteLine = (routeCoordinates, alternatives = []) => {
      routeLineCoordinatesRef.current = routeCoordinates;
      renderAlternativeRoutes(alternatives);
      renderRouteLine(routeCoordinates);
      renderRouteEndpointMarkers(routeCoordinates[0] || start, end, startLabel, label);
      renderRouteLastLeg(routeCoordinates.at(-1) || end, end);
      const bounds = routeCoordinates.reduce(
        (box, coord) => box.extend(toLngLat(coord)),
        new maplibregl.LngLatBounds(toLngLat(routeCoordinates[0]), toLngLat(routeCoordinates[0]))
      );
      map.fitBounds(bounds, { padding: 70, duration: 900 });
    };

    const buildRouteCandidate = (candidate, index, candidateLabel = null) => {
      const coordinates = candidate.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKmValue = candidate.distance / 1000;
      const minutesValue = getRouteDurationMinutes(candidate, distanceKmValue, selectedMode);
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
      const durationMinutes = getRouteDurationMinutes(route, distanceKm, selectedMode);
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
        routeDistanceMeters: route.distance,
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
      routeInteractionLockedRef.current = true;
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
        routeDistanceMeters: distanceKm * 1000,
        estimateLabel: `${selectedMode.label} estimate`,
        instruction: `Go straight towards ${label}`,
        nextInstruction: label,
        steps: [{ instruction: `Go straight towards ${label}`, distance: distanceKm * 1000, name: label }],
        constructionHits
      });
      routeInteractionLockedRef.current = true;
      setRouteActive(true);
      triggerToast("Navigation Started", "Live routing was unavailable, so a direct estimate was used.", true);
      return { distanceKm, durationMinutes, fuelLiters, constructionHits };
    }
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
      renderRouteEndpointMarkers(alternative.coordinates[0] || start, end, startLabel, label);
      renderRouteLastLeg(alternative.coordinates.at(-1) || end, end);
    }

    const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];
    const constructionHits = getConstructionHitsForRoute(alternative.coordinates);
    const firstActionStep = alternative.steps.find((step) => step.maneuver?.type !== 'depart') || alternative.steps[0];

    setRouteMeta((current) => ({
      ...current,
      distance: `${alternative.distanceKm.toFixed(1)} km`,
      duration: `${alternative.durationMinutes} min`,
      fuel: `${alternative.fuelLiters.toFixed(1)} L`,
      routeDistanceMeters: alternative.distanceKm * 1000,
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

    if (hasExplicitStart && startOverride === null && isPreciseGpsLocation(lastUserLocation)) {
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
      triggerToast("GPS Failed", `${getGpsErrorMessage(error)} Pick a start location instead.`, true);
      setRouteFromQuery('Choose start location');
      setMobileMode('route');
      setMobileSheetOpen(true);
      return false;
    }
  };

  const handleClearRoute = () => {
    playClickSound();
    navigationNotificationShownRef.current = false;
    navigationNotificationLastMetaRef.current = '';
    if (arrivalUnlockTimerRef.current) {
      window.clearTimeout(arrivalUnlockTimerRef.current);
      arrivalUnlockTimerRef.current = null;
    }
    clearNavigationNotification();
    routeLineCoordinatesRef.current = [];
    lastRouteEndpointsRef.current = null;
    routeInteractionLockedRef.current = false;
    navRerouteRef.current = { lastRerouteAt: 0, offRouteHits: 0, currentStepIndex: 0 };
    navProgressRef.current = { lastProgressMeters: 0, lastRemainingMeters: null, arrived: false };
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
    if (mobileMode === 'nav' || routeActive) {
      handleExitMobileNavigation();
      return;
    }
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
      setRouteFromQuery(isPreciseGpsLocation(lastUserLocation) ? lastUserLocation.name : 'My GPS location');
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
        : (isPreciseGpsLocation(lastUserLocation) ? lastUserLocation : null);
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
    setRouteFromQuery(isPreciseGpsLocation(lastUserLocation) ? lastUserLocation.name : 'My GPS location');
    setActiveLocation(destination);
    setRouteToQuery(destination.name);
    setMobileMode('route');
    setMobileSheetOpen(true);
    if (isPreciseGpsLocation(lastUserLocation)) {
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
      const liveStart = isPreciseGpsLocation(lastUserLocation) ? lastUserLocation : null;
      if (liveStart) {
        renderUserLocationMarker(liveStart.coords, { label: liveStart.name || 'Current location', heading: navTelemetryRef.current.heading, variant: 'nav-live' });
      }

      const fallbackDistanceKm = getDistanceMeters(existingRoute.start, existingRoute.end) / 1000;
      const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) || TRAVEL_MODES[0];
      const fallbackFuel = selectedMode.fuelKmPerLiter ? Math.max(0.1, fallbackDistanceKm / selectedMode.fuelKmPerLiter) : 0;

      setRouteFromQuery(liveStart?.name || existingRoute.startLabel || routeMeta?.routeFrom || 'Selected start');
      setRouteToQuery(existingRoute.label);
      routeInteractionLockedRef.current = true;
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
          routeDistanceMeters: fallbackDistanceKm * 1000,
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

    const destination = getRouteEditorDestination();
    if (!isRouteDestination(destination)) {
      triggerToast("Choose Destination", "Pick a destination before starting navigation.", true);
      setMobileMode('route');
      setMobileSheetOpen(true);
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
      setRouteFromQuery(isPreciseGpsLocation(lastUserLocation) ? lastUserLocation.name : 'My GPS location');
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

  const unlockNavigationAfterArrival = () => {
    routeInteractionLockedRef.current = false;
    setRouteActive(false);
    setMobileMode('place');
    setMobileSheetOpen(true);
    setMobileNavMenuOpen(false);
    setMobileRecenterExpanded(false);
    clearRouteStartLeg();
    clearNavigationNotification();
    navigationNotificationShownRef.current = false;
    navigationNotificationLastMetaRef.current = '';
  };

  useEffect(() => {
    exitNavigationRef.current = handleExitMobileNavigation;
  });

  useEffect(() => {
    latestRouteMetaRef.current = routeMeta;
    latestActiveLocationRef.current = activeLocation;
    latestMobileModeRef.current = mobileMode;
  }, [routeMeta, activeLocation, mobileMode]);

  useEffect(() => {
    window.__SPIDER_NAV_ACTIVE__ = mobileMode === 'nav' && routeActive;
    document.body.classList.toggle('spider-navigation-active', window.__SPIDER_NAV_ACTIVE__);
    if (!window.__SPIDER_NAV_ACTIVE__) {
      document.body.classList.remove('spider-pip-mode');
      document.body.style.removeProperty('--spider-pip-map-width');
      document.body.style.removeProperty('--spider-pip-map-height');
    }

    return () => {
      window.__SPIDER_NAV_ACTIVE__ = false;
      document.body.classList.remove('spider-navigation-active');
      document.body.classList.remove('spider-pip-mode');
      document.body.style.removeProperty('--spider-pip-map-width');
      document.body.style.removeProperty('--spider-pip-map-height');
    };
  }, [mobileMode, routeActive]);

  useEffect(() => {
    const getPipMapSize = () => {
      const viewportWidth = Math.round(window.visualViewport?.width || window.innerWidth || 360);
      const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight || 480);
      const width = Math.max(240, viewportWidth);
      const height = Math.max(320, viewportHeight);
      return { width, height };
    };

    const forcePipMapSize = () => {
      const map = leafletMapInstance.current;
      const container = map?.getContainer?.();
      const surface = mapRef.current;
      if (!map || !container || !surface) return { width: 0, height: 0 };

      const { width, height } = getPipMapSize();
      document.body.style.setProperty('--spider-pip-map-width', `${width}px`);
      document.body.style.setProperty('--spider-pip-map-height', `${height}px`);

      [surface, container].forEach((element) => {
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      });

      const canvas = map.getCanvas();
      const pixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      return { width, height };
    };

    const releasePipMapSize = () => {
      const map = leafletMapInstance.current;
      const container = map?.getContainer?.();
      const surface = mapRef.current;

      document.body.style.removeProperty('--spider-pip-map-width');
      document.body.style.removeProperty('--spider-pip-map-height');
      [surface, container, map?.getCanvas?.()].forEach((element) => {
        if (!element) return;
        element.style.width = '';
        element.style.height = '';
      });
    };

    const syncPipMap = () => {
      const map = leafletMapInstance.current;
      if (!map) return;

      const isPipMode = document.body.classList.contains('spider-pip-mode');
      const liveCoords = navTelemetryRef.current.lastCoords
        || lastUserLocation?.coords
        || activeLocation.coords;
      const heading = navTelemetryRef.current.heading || 0;

      const resizeAndFocus = () => {
        if (isPipMode) {
          forcePipMapSize();
        } else {
          releasePipMapSize();
        }
        map.resize();
        if (isPipMode && liveCoords) {
          map.easeTo({
            center: toLngLat(liveCoords),
            bearing: heading,
            zoom: Math.max(map.getZoom(), 16),
            padding: { top: 10, right: 10, bottom: 92, left: 10 },
            duration: 0
          });
        } else {
          map.easeTo({
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            duration: 0
          });
        }
      };

      resizeAndFocus();
      window.requestAnimationFrame(resizeAndFocus);
      window.setTimeout(resizeAndFocus, 180);
      window.setTimeout(resizeAndFocus, 520);
    };

    window.__SPIDER_SYNC_PIP_MAP__ = syncPipMap;
    window.addEventListener('resize', syncPipMap);
    window.addEventListener('spider:pip-mode-change', syncPipMap);

    return () => {
      if (window.__SPIDER_SYNC_PIP_MAP__ === syncPipMap) {
        delete window.__SPIDER_SYNC_PIP_MAP__;
      }
      window.removeEventListener('resize', syncPipMap);
      window.removeEventListener('spider:pip-mode-change', syncPipMap);
    };
  }, [activeLocation.coords, lastUserLocation?.coords]);

  useEffect(() => {
    if (!isNativeCapacitorApp()) return undefined;

    let actionListener;
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      if (event.notification?.extra?.type !== 'navigation') return;
      if (event.actionId === EXIT_NAVIGATION_ACTION) {
        exitNavigationRef.current?.();
        return;
      }
      if (latestMobileModeRef.current === 'nav' && latestRouteMetaRef.current) {
        window.setTimeout(() => {
          showNavigationNotification(latestRouteMetaRef.current, latestActiveLocationRef.current);
        }, 250);
      }
    }).then((listener) => {
      actionListener = listener;
    }).catch((error) => {
      console.warn('SpiderMaps notification action listener failed', error);
    });

    return () => {
      actionListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (mobileMode === 'nav' && routeMeta) {
      const notificationKey = [
        routeMeta.duration,
        routeMeta.distance,
        routeMeta.instruction,
        routeMeta.routeTo
      ].join('|');
      if (notificationKey !== navigationNotificationLastMetaRef.current) {
        navigationNotificationShownRef.current = true;
        navigationNotificationLastMetaRef.current = notificationKey;
        showNavigationNotification(routeMeta, activeLocation);
      }
    }
    if (mobileMode !== 'nav') {
      navigationNotificationShownRef.current = false;
      navigationNotificationLastMetaRef.current = '';
    }
  }, [mobileMode, routeMeta, activeLocation]);

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
          const heading = navTelemetryRef.current.heading;
          renderUserLocationMarker(coords, { label: 'Current location', heading, variant: 'nav-live' });
          clearRouteStartLeg();
          leafletMapInstance.current?.easeTo({
            center: toLngLat(coords),
            bearing: heading,
            zoom: Math.max(leafletMapInstance.current.getZoom(), 16),
            offset: [0, 110],
            duration: 650
          });
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
    clearSearchState();
    triggerToast("Search Route", query ? `"${query}" noted for this route. Navigation stays locked.` : "Navigation controls stay locked to this route.", false);
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
      const result = await shareText('SpiderMaps ride progress', message);
      triggerToast("Ride Shared", result === 'copied' ? "Ride progress copied." : "Ride share sheet opened.", false);
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
    if (routeInteractionLockedRef.current) return;
    playClickSound();
    const clickedPlace = getRenderedClickedPlace(event) || await getClickedPlace([event.lngLat.lat, event.lngLat.lng]);

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
    const destination = createSearchDestination();
    if (routeSearchTarget) {
      handleRouteSearchSelect(destination);
      return;
    }
    if (routeInteractionLockedRef.current) {
      clearSearchState();
      return;
    }
    if (!destination?.coords) {
      triggerToast("Place Not Found", "Select a suggestion or click the map to choose that location.", true);
      setMobileSheetOpen(true);
      clearSearchState();
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
    clearSearchState();
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

  const ensureNavigationNotificationReady = async () => {
    if (!isNativeCapacitorApp()) return false;
    if (navigationNotificationsReadyRef.current) return true;

    try {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        const requested = await LocalNotifications.requestPermissions();
        if (requested.display !== 'granted') {
          triggerToast('Notifications Off', 'Allow SpiderMaps notifications to show navigation in the shade.', true);
          return false;
        }
      }

      await LocalNotifications.createChannel({
        id: NAVIGATION_NOTIFICATION_CHANNEL,
        name: 'SpiderMaps Navigation',
        description: 'Live route progress and navigation controls',
        importance: 4,
        visibility: 1,
        vibration: false,
        lights: true,
        lightColor: '#22d3ee'
      });

      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: NAVIGATION_NOTIFICATION_ACTION_TYPE,
            actions: [{ id: EXIT_NAVIGATION_ACTION, title: 'Exit navigation' }]
          }
        ]
      });

      navigationNotificationsReadyRef.current = true;
      return true;
    } catch (error) {
      console.warn('SpiderMaps notification setup failed', error);
      triggerToast('Notification Error', 'Android navigation notification could not be prepared.', true);
      return false;
    }
  };

  const showNavigationNotification = async (meta = routeMeta, destination = activeLocation) => {
    if (!meta || !(await ensureNavigationNotificationReady())) return;

    const routeTo = meta.routeTo || destination?.name || 'Destination';
    const duration = meta.duration || '--';
    const distance = meta.distance || '--';
    const instruction = meta.instruction || 'Navigation active';
    const hasArrived = /arrived/i.test(duration) || /arrived/i.test(instruction);
    const cleanEtaText = meta.etaText ? ` - ${meta.etaText}` : '';
    const maneuver = getManeuverDisplay(hasArrived ? 'Arrived' : instruction);
    const title = hasArrived ? 'SpiderMaps' : `SpiderMaps - ${maneuver.label}`;
    const body = hasArrived
      ? `Arrived at ${routeTo}`
      : instruction;
    const largeBody = hasArrived
      ? `Arrived at destination\n${routeTo}`
      : `${instruction}\n${duration} - ${distance}${cleanEtaText}\n${routeTo}`;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: NAVIGATION_NOTIFICATION_ID,
            title,
            body,
            largeBody,
            summaryText: hasArrived ? 'Arrived' : maneuver.label,
            channelId: NAVIGATION_NOTIFICATION_CHANNEL,
            actionTypeId: NAVIGATION_NOTIFICATION_ACTION_TYPE,
            ongoing: true,
            autoCancel: false,
            smallIcon: 'ic_stat_navigation',
            largeIcon: maneuver.icon,
            iconColor: '#22d3ee',
            extra: { type: 'navigation', routeTo }
          }
        ]
      });
    } catch (error) {
      console.warn('SpiderMaps notification update failed', error);
    }
  };

  const clearNavigationNotification = async () => {
    if (!isNativeCapacitorApp()) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id: NAVIGATION_NOTIFICATION_ID }] });
      await LocalNotifications.removeDeliveredNotifications({ notifications: [{ id: NAVIGATION_NOTIFICATION_ID }] });
    } catch (error) {
      console.warn('SpiderMaps notification clear failed', error);
    }
  };

  const waitForMapIdle = () => new Promise((resolve) => {
    const map = leafletMapInstance.current;
    if (!map) {
      resolve();
      return;
    }
    const timer = window.setTimeout(resolve, 900);
    map.once('idle', () => {
      window.clearTimeout(timer);
      resolve();
    });
  });

  const getFeatureCenter = (feature) => {
    const geometry = feature?.geometry;
    if (!geometry?.coordinates) return null;
    const points = [];
    const collect = (coords) => {
      if (!Array.isArray(coords)) return;
      if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        points.push(coords);
        return;
      }
      coords.forEach(collect);
    };
    collect(geometry.coordinates);
    const geoPoints = points.filter(([lng, lat]) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180);
    if (!geoPoints.length) return null;
    const [lngTotal, latTotal] = geoPoints.reduce(([lngSum, latSum], [lng, lat]) => [lngSum + lng, latSum + lat], [0, 0]);
    return [latTotal / geoPoints.length, lngTotal / geoPoints.length];
  };

  const getMapFeatureLabel = (props = {}) => (
    props.name_en || props['name:en'] || props.name || props.brand || props.operator || props.ref || props['addr:housename'] || ''
  );

  const getMapFeatureTypeText = (props = {}) => normalizeSearchText([
    props.class,
    props.subclass,
    props.type,
    props.kind,
    props.amenity,
    props.shop,
    props.tourism,
    props.highway,
    props.railway,
    props.public_transport,
    props.brand,
    props.operator,
    props.name
  ].filter(Boolean).join(' '));

  const doesMapFeatureMatchCategory = (category, props = {}) => {
    const text = getMapFeatureTypeText(props);
    if (category === 'fuel') return /\b(fuel|petrol|gas station|gas|hp|hpcl|iocl|indian oil|bharat petroleum|bpcl|reliance petroleum)\b/.test(text);
    if (category === 'restaurants') return /\b(restaurant|restaurants|cafe|fast food|fast_food|food|bar|pub|dining)\b/.test(text);
    if (category === 'hospitals') return /\b(hospital|hospitals|clinic|clinics|doctors|healthcare|medical|health post|health_post)\b/.test(text);
    if (category === 'hostels') return /\b(hostel|hostels|hotel|hotels|guest house|guest_house|motel|lodge|stay)\b/.test(text);
    if (category === 'transit') return /\b(bus stop|bus_stop|bus station|bus_station|station|railway|subway|metro|platform|stop_position|halt)\b/.test(text);
    return text.includes(normalizeSearchText(category));
  };

  const readNearbyCategoryFromMap = async (category, center) => {
    const map = leafletMapInstance.current;
    if (!map || !center) return [];

    map.flyTo({ center: toLngLat(center), zoom: Math.max(map.getZoom(), 15), duration: 300 });
    await waitForMapIdle();

    const point = map.project(toLngLat(center));
    const box = [[point.x - 520, point.y - 520], [point.x + 520, point.y + 520]];
    const styleLayerIds = map.getStyle()?.layers?.map((layer) => layer.id) || [];
    const renderedFeatures = map.queryRenderedFeatures(box, { layers: styleLayerIds });
    const sourceFeatures = ['poi', 'transportation_name', 'transportation', 'place']
      .flatMap((sourceLayer) => {
        try {
          return map.querySourceFeatures('openmaptiles', { sourceLayer });
        } catch {
          return [];
        }
      });

    const maxDistance = category === 'transit' ? 16000 : 14000;
    const seen = new Set();
    return [...renderedFeatures, ...sourceFeatures]
      .map((feature) => {
        const props = feature.properties || {};
        const name = getMapFeatureLabel(props);
        const coords = getFeatureCenter(feature);
        if (!name || !coords || !doesMapFeatureMatchCategory(category, props)) return null;
        const distanceMeters = getDistanceMeters(center, coords);
        if (distanceMeters > maxDistance) return null;
        const type = props.amenity || props.shop || props.tourism || props.highway || props.railway || props.public_transport || props.class || props.subclass || category;
        return {
          key: `map-${category}-${normalizeSearchText(name).replace(/\s+/g, '-')}-${coords.map((value) => value.toFixed(4)).join('-')}`,
          source: 'map',
          score: 160 - (distanceMeters / 100),
          place: {
            name,
            coords,
            address: `${Math.max(0.1, distanceMeters / 1000).toFixed(1)} km from your location`,
            temp: '--',
            traffic: 'Read from loaded map data',
            type
          }
        };
      })
      .filter(Boolean)
      .filter((suggestion) => {
        const key = `${normalizeSearchText(suggestion.place.name)}-${suggestion.place.coords.map((value) => value.toFixed(3)).join(',')}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  };

  const readSearchTextFromMap = async (query, center = lastUserLocation?.coords || activeLocation.coords) => {
    const map = leafletMapInstance.current;
    if (!map || !query.trim()) return [];

    const searchCenter = center || [map.getCenter().lat, map.getCenter().lng];
    const cleanQuery = cleanIntentWords(query) || normalizeSearchText(query);
    if (cleanQuery.length < 3) return [];

    map.flyTo({ center: toLngLat(searchCenter), zoom: Math.max(map.getZoom(), 15), duration: 250 });
    await waitForMapIdle();

    const point = map.project(toLngLat(searchCenter));
    const box = [[point.x - 720, point.y - 720], [point.x + 720, point.y + 720]];
    const styleLayerIds = map.getStyle()?.layers?.map((layer) => layer.id) || [];
    const renderedFeatures = map.queryRenderedFeatures(box, { layers: styleLayerIds });
    const sourceFeatures = ['poi', 'transportation_name', 'transportation', 'place', 'building']
      .flatMap((sourceLayer) => {
        try {
          return map.querySourceFeatures('openmaptiles', { sourceLayer });
        } catch {
          return [];
        }
      });

    const seen = new Set();
    return [...renderedFeatures, ...sourceFeatures]
      .map((feature) => {
        const props = feature.properties || {};
        const name = getMapFeatureLabel(props);
        const coords = getFeatureCenter(feature);
        if (!name || !coords) return null;
        const type = props.amenity || props.shop || props.tourism || props.highway || props.railway || props.public_transport || props.class || props.subclass || 'map place';
        const text = `${name} ${type} ${props.brand || ''} ${props.operator || ''}`;
        const score = getSearchScore(cleanQuery, text);
        if (score < 34 && !fuzzySearch(cleanQuery, text)) return null;
        const distanceMeters = getDistanceMeters(searchCenter, coords);
        if (distanceMeters > 18000) return null;
        return {
          key: `map-search-${normalizeSearchText(name).replace(/\s+/g, '-')}-${coords.map((value) => value.toFixed(4)).join('-')}`,
          source: 'map',
          score: score + Math.max(0, 36 - distanceMeters / 500),
          place: {
            name,
            coords,
            address: `${Math.max(0.1, distanceMeters / 1000).toFixed(1)} km from map center`,
            temp: '--',
            traffic: 'Read from loaded map data',
            type
          }
        };
      })
      .filter(Boolean)
      .filter((suggestion) => {
        const key = `${normalizeSearchText(suggestion.place.name)}-${suggestion.place.coords.map((value) => value.toFixed(3)).join(',')}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  };

  const handleCategoryClick = async (category) => {
    playClickSound();
    const query = CATEGORY_SEARCH_QUERIES[category] || `${category} Hyderabad`;
    let origin = lastUserLocation;

    if (!origin?.coords) {
      triggerToast("Getting Location", `Using GPS to find ${category} near you.`, false);
      try {
        const position = await getGpsPosition();
        const coords = [position.coords.latitude, position.coords.longitude];
        origin = showUserLocation({
          coords,
          address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
          accuracy: position.coords.accuracy
        }, { select: false });
      } catch (error) {
        setGlobalSuggestions([]);
        triggerToast("GPS Needed", `${getGpsErrorMessage(error)} Tap the location button or allow GPS to search nearby ${category}.`, true);
        return;
      }
    }

    setRouteSearchTarget(null);
    setMobileMode('place');
    setMobileSheetOpen(true);
    setSearchCenterOverride(origin.coords);
    const mapSuggestions = await readNearbyCategoryFromMap(category, origin.coords);
    mapReadSuggestionsRef.current = mapSuggestions;
    setGlobalSuggestions(mapSuggestions);
    setSearchQuery(query);
    triggerToast("Reading Map", mapSuggestions.length ? `Found ${mapSuggestions.length} ${category} places from loaded map data.` : `Reading map first, then checking live POI data for ${category}.`, false);
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

  const shareText = async (title, text) => {
    if (isNativeCapacitorApp() && window.SpiderMapsNative?.share) {
      window.SpiderMapsNative.share(title, text);
      return 'shared';
    }

    if (navigator.share) {
      await navigator.share({ title, text });
      return 'shared';
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }

    throw new Error('Share unavailable');
  };

  const handleShareLocation = async () => {
    playClickSound();
    const [lat, lng] = activeLocation.coords;
    const mapsUrl = buildSpiderMapsShareUrl([lat, lng], activeLocation.name);
    const text = `${activeLocation.name}\n${lat.toFixed(5)}, ${lng.toFixed(5)}\n${mapsUrl}`;
    try {
      const result = await shareText(activeLocation.name, text);
      triggerToast("Share Ready", result === 'copied' ? "Location copied to clipboard." : "Location share sheet opened.", false);
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

  const getRouteModeTitle = () => {
    if (travelMode === 'walking') return 'Walk';
    if (travelMode === 'bike') return 'Bike';
    if (travelMode === 'cycle') return 'Cycle';
    if (travelMode === 'tracking') return 'Track';
    return 'Drive';
  };

  const getRouteFromDisplay = () => {
    if (isGpsStartText(routeFromQuery) || routeMeta?.routeFrom === 'Approximate location') return 'Your Location';
    return routeFromQuery || routeMeta?.routeFrom || 'Your Location';
  };

  const getRouteToDisplay = () => (
    isRouteDestinationText(routeToQuery)
      ? routeToQuery
      : (routeMeta?.routeTo || (isRouteDestination(activeLocation) ? activeLocation.name : 'Choose destination'))
  );

  const getRouteEditorDestination = () => {
    const textCandidates = [
      routeToQuery,
      routeMeta?.routeTo,
      lastRouteEndpointsRef.current?.label,
      isRouteDestination(activeLocation) ? activeLocation.name : ''
    ].filter(isRouteDestinationText);

    for (const text of textCandidates) {
      const resolved = resolvePlaceFromText(text, null);
      if (isRouteDestination(resolved)) return resolved;
    }

    if (lastRouteEndpointsRef.current?.end && isRouteDestinationText(lastRouteEndpointsRef.current.label)) {
      return {
        name: lastRouteEndpointsRef.current.label,
        coords: lastRouteEndpointsRef.current.end,
        address: lastRouteEndpointsRef.current.label,
        temp: '--',
        traffic: 'Route destination',
        type: 'route'
      };
    }

    return null;
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

  const parseExternalMapCoordinates = (text = '') => {
    const rawText = String(text || '');
    const decodedText = (() => {
      try {
        return decodeURIComponent(rawText);
      } catch {
        return rawText;
      }
    })();

    const patterns = [
      /geo:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i,
      /@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i,
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,
      /[?&]lat=(-?\d+(?:\.\d+)?)[^#\s]*[?&]lng=(-?\d+(?:\.\d+)?)/i,
      /[?&]lng=(-?\d+(?:\.\d+)?)[^#\s]*[?&]lat=(-?\d+(?:\.\d+)?)/i,
      /[?&]latitude=(-?\d+(?:\.\d+)?)[^#\s]*[?&]longitude=(-?\d+(?:\.\d+)?)/i,
      /[?&](?:q|query|destination|daddr)=(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i,
      /(?:^|\s)(-?\d{1,2}\.\d{4,})\s*,\s*(-?\d{1,3}\.\d{4,})(?:\s|$)/i
    ];

    for (const pattern of patterns) {
      const match = decodedText.match(pattern);
      if (!match) continue;
      const shouldSwapLatLng = pattern.source.startsWith('[?&]lng=');
      const lat = Number(shouldSwapLatLng ? match[2] : match[1]);
      const lng = Number(shouldSwapLatLng ? match[1] : match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return [lat, lng];
      }
    }

    return null;
  };

  const openExternalMapLocation = ({ url, resolvedUrl } = {}) => {
    const coords = parseExternalMapCoordinates(resolvedUrl) || parseExternalMapCoordinates(url);
    if (!coords) {
      triggerToast("Maps Link Opened", "Could not read coordinates from this live/shared Maps link yet.", true);
      return;
    }

    const location = {
      name: "Shared Maps Location",
      coords,
      address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
      temp: "--",
      traffic: resolvedUrl || url || "Opened from external map link",
      type: "shared-map"
    };

    renderUserLocationMarker(coords, { label: location.name, heading: navTelemetryRef.current.heading, variant: 'live' });
    setActiveLocation(location);
    setRouteToQuery(location.name);
    setRouteSearchTarget(null);
    setSearchQuery(location.name);
    setMobileMode('place');
    setMobileSheetOpen(true);
    leafletMapInstance.current?.flyTo({ center: toLngLat(coords), zoom: 16, duration: 900 });
    triggerToast("Maps Link Opened", "Shared location loaded in SpiderMaps.", false);
  };

  useEffect(() => {
    const initialCoords = parseExternalMapCoordinates(window.location.href);
    if (initialCoords) {
      window.setTimeout(() => openExternalMapLocation({ url: window.location.href }), 300);
    }

    const handleExternalMapUrl = (event) => {
      openExternalMapLocation(event.detail || {});
    };
    window.addEventListener('spider:external-map-url', handleExternalMapUrl);
    return () => window.removeEventListener('spider:external-map-url', handleExternalMapUrl);
  }, []);

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

            {/* Petrol pump search */}
            <button 
              onClick={() => handleCategoryClick('fuel')}
              className="flex flex-col items-center group w-full px-1"
              title="Find petrol pumps"
            >
              <div className="w-10 h-10 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 hover:border-[#06b6d4] flex items-center justify-center text-[#06b6d4] transition-all group-hover:scale-105 shadow-md">
                <Fuel size={18} />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 scale-90 group-hover:text-[#06b6d4] transition-colors text-center font-medium">Petrol</span>
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
                onChange={(e) => {
                  setSearchCenterOverride(null);
                  mapReadSuggestionsRef.current = [];
                  setSearchQuery(e.target.value);
                }}
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
              onClick={() => handleCategoryClick('hostels')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <span>Hostels</span>
            </button>
            <button 
              onClick={() => handleCategoryClick('fuel')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <Fuel size={13} />
              <span>Petrol Pumps</span>
            </button>
            <button 
              onClick={() => handleCategoryClick('hospitals')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b132b] hover:bg-[#ef4444] hover:text-white text-slate-200 rounded-full border border-[#06b6d4]/20 text-xs shadow-md font-medium transition-all"
            >
              <Plus size={13} />
              <span>Hospitals</span>
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
          {routeActive && routeMeta && (
            <div className="pip-navigation-card" aria-hidden="true">
              <div className="pip-instruction-panel">
                <div className="pip-turn-icon">{getManeuverDisplay(routeMeta.instruction).symbol}</div>
                <div className="min-w-0 flex-1">
                  <div className="pip-road-name">{routeMeta.instruction || 'Continue'}</div>
                  <div className="pip-route-time">{routeMeta.distance || '--'} - {routeMeta.duration || '--'}</div>
                </div>
              </div>
            </div>
          )}
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
              onChange={(e) => {
                setSearchCenterOverride(null);
                mapReadSuggestionsRef.current = [];
                setSearchQuery(e.target.value);
              }}
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

          {!routeSearchTarget && searchQuery.trim().length >= 3 && searchSuggestions.length === 0 && (
            <div className="pointer-events-auto rounded-3xl bg-[#121212]/96 px-4 py-3 text-sm text-slate-300 shadow-2xl">
              {globalSearchLoading ? 'Reading map and searching nearby data...' : 'No result in loaded map data yet. Press arrow to search this text.'}
            </div>
          )}

          {!routeSearchTarget && (
          <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 scrollbar-none mobile-chip-row">
            <button onClick={() => handleCategoryClick('fuel')} className="flex shrink-0 items-center gap-2 rounded-full border border-[#60a5fa]/60 bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              <Fuel size={16} />
              Petrol Pumps
            </button>
            <button onClick={() => handleCategoryClick('hospitals')} className="flex shrink-0 items-center gap-2 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              <Plus size={16} />
              Hospitals
            </button>
            <button onClick={() => handleCategoryClick('restaurants')} className="shrink-0 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              Restaurants
            </button>
            <button onClick={() => handleCategoryClick('hostels')} className="shrink-0 rounded-full bg-[#2f3033]/96 px-4 py-2 text-sm font-bold text-slate-100 shadow-xl">
              Hostels
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
          <button
            onClick={handleRecenter}
            className="w-10 h-10 rounded-lg bg-[#0b132b] hover:bg-[#06b6d4] border border-[#06b6d4]/30 hover:border-[#06b6d4] text-[#06b6d4] hover:text-[#030712] flex items-center justify-center shadow-xl transition-all"
            title="Recenter Hyderabad"
          >
            <Compass size={18} />
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

        {routeActive && mobileMode === 'route' && !routeSearchTarget && (
          <section className="fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+12px)] z-[58] rounded-3xl bg-[#202124]/98 px-4 py-3 text-white shadow-2xl md:hidden">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <div className="grid place-items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full border-4 border-blue-400 bg-white" />
                <span className="h-6 border-l-2 border-dotted border-slate-500" />
                <span className="h-3.5 w-3.5 rounded-full border-2 border-rose-400" />
              </div>
              <div className="min-w-0 space-y-3">
                <div className="truncate text-base font-semibold text-blue-100">{getRouteFromDisplay()}</div>
                <div className="h-px bg-white/15" />
                <div className="truncate text-base font-semibold text-slate-100">{getRouteToDisplay()}</div>
              </div>
              <button type="button" onClick={handleCloseMobileSheet} className="grid h-10 w-10 place-items-center rounded-full text-slate-200" title="Close route setup">
                <X size={22} />
              </button>
            </div>
          </section>
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
                  <h2 className="truncate text-3xl font-semibold text-slate-50">{getRouteModeTitle()}</h2>
                  <p className="mt-1 truncate text-sm text-slate-400">{getRouteFromDisplay()} to {getRouteToDisplay()}</p>
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
                    <span className="block truncate">{getRouteFromDisplay()}</span>
                  </button>
                  <button type="button" onClick={useGpsRouteStart} className="rounded-xl bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-200">GPS</button>
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <button
                    type="button"
                    onClick={() => openRouteSearch('to')}
                    className="min-w-0 rounded-xl border border-white/10 bg-[#07090d] px-3 py-2 text-left text-sm font-semibold text-white"
                  >
                    <span className="block text-[10px] uppercase tracking-wide text-slate-500">To</span>
                    <span className="block truncate">{getRouteToDisplay()}</span>
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

              <div className="grid grid-cols-4 gap-2">
                <button onClick={handleMobileStart} className="mobile-primary-pill">
                  <Navigation size={19} />
                  Start
                </button>
                <button onClick={() => handleMobileSearchAlongRoute()} className="mobile-secondary-pill">
                  <Plus size={19} />
                  Stops
                </button>
                <button onClick={handleShareLocation} className="mobile-secondary-pill">
                  <Share2 size={19} />
                  Share
                </button>
                <button onClick={handleSaveLocation} className="mobile-secondary-pill">
                  <Bookmark size={19} />
                  Save
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
