import React from 'react';
import {
  Apple,
  ChevronRight,
  Gauge,
  Info,
  LogIn,
  LogOut,
  Scale,
  Settings,
  Shield,
  X
} from 'lucide-react';

const pageContent = {
  about: {
    title: 'About',
    body: (
      <div className="space-y-5">
        <div>
          <h3 className="text-2xl font-bold text-white">Spider Maps</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Copyright 2026 M4 Spider</p>
          <p className="text-sm leading-6 text-slate-400">Version 1</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
          Built as a SpiderMaps navigation experience using open-source web tools and public routing/map data.
        </div>
      </div>
    )
  },
  navigation: {
    title: 'Navigation',
    body: null
  },
  terms: {
    title: 'Terms Of Service',
    body: (
      <div className="space-y-4 text-sm leading-6 text-slate-300">
        <p>Spider Maps is provided as an experimental navigation interface. Route times, road hazards, fuel use, and map data are estimates and must not be treated as safety-critical instructions.</p>
        <p>Use local laws, road signs, and real-world conditions first. Do not use the service in a way that distracts from driving or violates traffic rules.</p>
        <p>Public map, geocoding, and routing data may be incomplete, delayed, or unavailable in some places.</p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    body: (
      <div className="space-y-4 text-sm leading-6 text-slate-300">
        <p>Saved places are stored locally in this browser using IndexedDB. They are not uploaded by this app.</p>
        <p>When you request GPS, the browser provides location permission prompts. Approximate location lookup may use a public network-location service if GPS fails.</p>
        <p>Search and routing requests may be sent to open-source/public providers used by the app, such as Photon and OSRM.</p>
      </div>
    )
  },
  licenses: {
    title: 'Licenses',
    body: (
      <div className="space-y-4 text-sm leading-6 text-slate-300">
        <p>App code and Spider Maps branding: Copyright 2026 M4 Spider.</p>
        <p>Libraries used include React, React DOM, Vite, Tailwind CSS, MapLibre GL, Lucide React, Firebase, KaTeX, ESLint, and related build tooling.</p>
        <p>Map rendering uses MapLibre GL. Search/routing/navigation data may use open providers including Photon, OSRM, OpenStreetMap-derived data, and public map tile/style services.</p>
        <p>Open-source libraries and map data remain under their respective licenses and attribution requirements.</p>
      </div>
    )
  }
};

export default function MobileSettingsPage({
  page,
  speedUnit,
  onClose,
  onOpenPage,
  onSpeedUnitChange,
  onLogin,
  onLogout
}) {
  const active = pageContent[page];

  if (active) {
    return (
      <div className="fixed inset-0 z-[90] bg-[#101113] text-white md:hidden">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)]">
            <button type="button" onClick={() => onOpenPage('home')} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" title="Back">
              <X size={22} />
            </button>
            <h2 className="min-w-0 flex-1 truncate text-xl font-semibold">{active.title}</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {page === 'navigation' ? (
              <div className="space-y-5">
                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <Gauge size={22} className="text-cyan-300" />
                    <div>
                      <h3 className="font-semibold text-white">Speedometer</h3>
                      <p className="text-sm text-slate-400">Choose live navigation speed unit.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['kmph', 'mph'].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => onSpeedUnitChange(unit)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-bold uppercase ${speedUnit === unit ? 'border-cyan-300 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-black/20 text-slate-300'}`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : active.body}
          </div>
        </div>
      </div>
    );
  }

  const rows = [
    { id: 'about', label: 'About', icon: <Info size={20} /> },
    { id: 'navigation', label: 'Navigation', icon: <Gauge size={20} /> },
    { id: 'terms', label: 'Terms Of Service', icon: <Scale size={20} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={20} /> },
    { id: 'licenses', label: 'Licenses', icon: <Settings size={20} /> }
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-[#101113] text-white md:hidden">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)]">
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" title="Close settings">
            <X size={22} />
          </button>
          <h2 className="min-w-0 flex-1 truncate text-xl font-semibold">Settings</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
            <button type="button" onClick={() => onLogin('Google')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/5">
              <LogIn size={20} className="text-cyan-300" />
              <span className="flex-1 font-semibold">Login with Google</span>
              <ChevronRight size={18} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => onLogin('Apple')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/5">
              <Apple size={20} className="text-slate-200" />
              <span className="flex-1 font-semibold">Login with Apple</span>
              <ChevronRight size={18} className="text-slate-500" />
            </button>
            <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-rose-200 hover:bg-white/5">
              <LogOut size={20} />
              <span className="flex-1 font-semibold">Logout</span>
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
            {rows.map((row) => (
              <button key={row.id} type="button" onClick={() => onOpenPage(row.id)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-400/10 text-cyan-300">{row.icon}</span>
                <span className="flex-1 font-semibold">{row.label}</span>
                <ChevronRight size={18} className="text-slate-500" />
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
