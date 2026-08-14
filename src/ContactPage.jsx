import React from 'react';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const mapUrl = 'https://maps.m4spider.com/?lat=35.70584&lng=139.77352&zoom=16&embed=true';

  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Contact Us</div>
        <h1 className="mt-4 text-4xl font-black">Leadership contacts & Location.</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Box 1: Leadership Contact Card (No Map Button) */}
          <div className="lift-card flex flex-col justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6">
            <div>
              <div className="text-2xl font-black">Dr. Saradhi Paramata</div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">Director</div>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 shrink-0 text-cyan-300" /> Sapphire Asia KK</div>
                <div className="flex items-start gap-3"><Phone size={16} className="mt-1 shrink-0 text-cyan-300" /> India: +91 89772837449</div>
                <div className="flex items-start gap-3"><Phone size={16} className="mt-1 shrink-0 text-cyan-300" /> Japan: +81 9084644889</div>
                <div className="flex items-start gap-3"><Mail size={16} className="mt-1 shrink-0 text-cyan-300" /> saradhi@sapphire-asia.com</div>
              </div>
            </div>
          </div>

          {/* Box 2: Dedicated Address Box */}
          <div className="lift-card flex flex-col justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">Tokyo Headquarters</div>
              <div className="mt-2 text-2xl font-black">Office Address</div>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 shrink-0 text-cyan-300" />
                  <span className="leading-7 font-medium text-slate-200">
                    〒110-0005 Tokyo, Taito City, Ueno, 3-20-2 Mizuno building B
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-300/20 hover:text-white"
              >
                <span>Open SpiderMaps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Box 3: Clean Map Preview Frame */}
          <div className="overflow-hidden rounded-[1.6rem] border border-cyan-400/20 bg-slate-950/80 shadow-2xl min-h-[300px] h-full w-full">
            <iframe
              src={mapUrl}
              title="SpiderMaps Tokyo Office Location"
              className="h-full w-full min-h-[300px] border-0"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
