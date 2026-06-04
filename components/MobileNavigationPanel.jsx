import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Crosshair,
  Layers,
  Map as MapIcon,
  Navigation,
  Route,
  Search,
  Share2,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

export default function MobileNavigationPanel({
  activeLocation,
  routeMeta,
  navTelemetry,
  soundEnabled,
  mapStyle,
  incidentsActive,
  constructionActive,
  spiderGridActive,
  mobileNavMenuOpen,
  mobileRecenterExpanded,
  onExitNavigation,
  onToggleRouteMenu,
  onCloseRouteMenu,
  onToggleSound,
  onRecenter,
  onSearchAlongRoute,
  onAddReport,
  onShareProgress,
  onDirections,
  onSatellite,
  onMapStyleChange,
  onToggleIncidents,
  onToggleConstruction,
  onToggleSpiderGrid
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (activePanel === 'search') {
      window.setTimeout(() => searchInputRef.current?.focus(), 40);
    }
  }, [activePanel]);

  const openSearch = () => {
    setActivePanel((panel) => (panel === 'search' ? null : 'search'));
    onCloseRouteMenu();
  };

  const submitSearch = (event) => {
    event.preventDefault();
    onSearchAlongRoute(routeSearchQuery.trim());
    setActivePanel(null);
  };

  const openSettings = () => {
    setActivePanel((panel) => (panel === 'settings' ? null : 'settings'));
    onCloseRouteMenu();
  };

  const menuItems = [
    { label: 'Add a report', icon: <AlertTriangle size={24} />, action: onAddReport },
    { label: 'Share ride progress', icon: <Share2 size={24} />, action: onShareProgress },
    { label: 'Search along route', icon: <Search size={24} />, action: openSearch },
    { label: 'Directions', icon: <Route size={24} />, action: onDirections },
    { label: 'Show satellite map', icon: <MapIcon size={24} />, action: onSatellite },
    { label: 'Settings', icon: <Layers size={24} />, action: openSettings }
  ];

  return (
    <>
      <div className="fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+14px)] z-50 rounded-2xl bg-[#00746c]/96 p-3 text-white shadow-2xl md:hidden">
        <div className="flex items-center gap-3">
          <Route size={36} className="shrink-0 rotate-90" />
          <div className="min-w-0 flex-1">
            <div className="text-xl font-light leading-none">{routeMeta?.duration || 'Start'}</div>
            <div className="mt-1 truncate text-lg font-semibold leading-tight">{routeMeta?.instruction || `towards ${activeLocation.name}`}</div>
            <div className="mt-0.5 truncate text-xs font-medium text-white/75">towards {activeLocation.name}</div>
          </div>
          <button type="button" onClick={onToggleSound} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#00746c]" title="Voice">
            {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>
      </div>

      {mobileRecenterExpanded && (
        <button type="button" onClick={onRecenter} className="fixed bottom-[132px] left-4 z-50 flex h-12 items-center gap-2 rounded-full bg-black/90 px-4 text-base font-bold text-white shadow-2xl md:hidden" title="Re-centre">
          <Navigation size={20} />
          Re-centre
        </button>
      )}

      <div className="fixed right-4 top-[42vh] z-50 flex flex-col gap-3 md:hidden">
        {!mobileRecenterExpanded && (
          <button type="button" onClick={onRecenter} className="grid h-12 w-12 place-items-center rounded-full bg-black/90 text-white shadow-2xl" title="Recenter">
            <Crosshair size={22} />
          </button>
        )}
        <button type="button" onClick={openSearch} className="grid h-12 w-12 place-items-center rounded-full bg-black/90 text-white shadow-2xl" title="Search along route">
          <Search size={22} />
        </button>
        <button type="button" onClick={onToggleSound} className="grid h-12 w-12 place-items-center rounded-full bg-black/90 text-white shadow-2xl" title="Mute">
          {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
        <button type="button" onClick={onAddReport} className="grid h-12 w-12 place-items-center rounded-full bg-black/90 text-white shadow-2xl" title="Report">
          <AlertTriangle size={22} className="text-amber-300" />
        </button>
      </div>

      {!mobileRecenterExpanded && (
      <div className="fixed bottom-[132px] left-4 z-50 rounded-full bg-black/90 px-4 py-3 text-center text-white shadow-2xl md:hidden">
        <div className="text-lg font-bold leading-none">{Math.round(navTelemetry?.speedKmh || 0)}</div>
        <div className="text-[10px] font-semibold text-slate-300">km/h</div>
        <div className="mt-1 text-[10px] text-slate-400">{(navTelemetry?.coveredKm || 0).toFixed(2)} km</div>
      </div>
      )}

      {mobileNavMenuOpen && (
        <div className="fixed inset-x-0 bottom-[96px] z-50 rounded-t-3xl bg-[#101010]/98 px-5 py-4 text-slate-300 shadow-[0_-24px_70px_rgba(0,0,0,0.58)] md:hidden">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="flex h-12 w-full items-center gap-5 border-b border-white/10 text-left text-base font-medium text-slate-300 last:border-b-0"
            >
              <span className="grid w-8 place-items-center text-slate-400">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {activePanel === 'search' && (
        <form onSubmit={submitSearch} className="fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+86px)] z-[60] flex h-14 items-center gap-3 rounded-full bg-[#202124]/98 px-4 py-3 text-white shadow-2xl md:hidden">
          <Search size={22} className="shrink-0 text-slate-300" />
          <input
            ref={searchInputRef}
            value={routeSearchQuery}
            onChange={(event) => setRouteSearchQuery(event.target.value)}
            placeholder="Search along route"
            className="min-w-0 flex-1 bg-transparent text-base font-medium text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button type="button" onClick={() => setActivePanel(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-300" title="Close search">
            <X size={20} />
          </button>
        </form>
      )}

      {activePanel === 'settings' && (
        <div className="fixed inset-x-3 bottom-[96px] z-[60] rounded-3xl bg-[#101010]/98 p-4 text-slate-200 shadow-[0_-24px_70px_rgba(0,0,0,0.58)] md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Navigation settings</h3>
            <button type="button" onClick={() => setActivePanel(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" title="Close settings">
              <X size={20} />
            </button>
          </div>

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
                onClick={() => onMapStyleChange(id)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-bold ${mapStyle === id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-white/5 text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <label className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-200">
              <span>Traffic incidents</span>
              <input type="checkbox" checked={incidentsActive} onChange={onToggleIncidents} className="h-5 w-5 accent-cyan-400" />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-200">
              <span>Hyderabad hazards</span>
              <input type="checkbox" checked={constructionActive} onChange={onToggleConstruction} className="h-5 w-5 accent-orange-400" />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-200">
              <span>Spider grid</span>
              <input type="checkbox" checked={spiderGridActive} onChange={onToggleSpiderGrid} className="h-5 w-5 accent-cyan-400" />
            </label>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-black/96 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 text-white shadow-[0_-24px_70px_rgba(0,0,0,0.58)] md:hidden">
        <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-white/35" />
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={onExitNavigation} className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/25 text-white" title="Exit navigation">
            <X size={30} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="text-2xl font-semibold text-emerald-300">{routeMeta?.duration || '--'}</div>
            <div className="mt-0.5 truncate text-sm text-slate-300">{routeMeta?.distance || '--'} - {activeLocation.name}</div>
          </div>
          <button type="button" onClick={onToggleRouteMenu} className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/25 text-white" title="Route options">
            <Route size={26} />
          </button>
        </div>
      </div>
    </>
  );
}
