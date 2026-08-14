import React from 'react';
import { CheckCircle2, MapPin, Target } from 'lucide-react';

export default function AboutPage(props) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">About Us</div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight">
            Strategic, management, and consulting support for businesses crossing India and Japan.
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-300">
            Sapphire Asia is a one-stop platform supporting expansion business in India and Japan. The company
            combines strategic thinking, practical execution, and cultural insight to build a bridge between
            business vision and grounded business consultancy.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-300">
            The approach is human-centric: balancing technology, consulting, operations, and relationship management
            so cross-border businesses can move with more clarity and control.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="lift-card rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-white/90 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                <props.SmartImage src={props.assets.japanMap} alt="Japan map" className="h-10 w-10 object-contain opacity-90 [filter:brightness(0)_saturate(100%)_invert(83%)_sepia(10%)_saturate(747%)_hue-rotate(173deg)_brightness(90%)_contrast(91%)]" />
                <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 text-cyan-200">
                  <MapPin size={12} />
                </span>
              </div>
              <div className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-400">Company structure</div>
              <div className="mt-2 text-2xl font-black">Tokyo</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">Strategic front-end, relationship building, and Japan-facing delivery coordination.</p>
            </div>
            <div className="lift-card rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-white/90 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                <props.SmartImage src={props.assets.indiaMap} alt="India map" className="h-10 w-10 object-contain opacity-90 [filter:brightness(0)_saturate(100%)_invert(83%)_sepia(10%)_saturate(747%)_hue-rotate(173deg)_brightness(90%)_contrast(91%)]" />
                <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 text-cyan-200">
                  <MapPin size={12} />
                </span>
              </div>
              <div className="mt-5 text-sm uppercase tracking-[0.24em] text-blue-100/70">Execution hub</div>
              <div className="mt-2 text-2xl font-black">Hyderabad</div>
              <p className="mt-3 text-sm leading-7 text-blue-50/80">Delivery, project coordination, operational support, and India-side expansion services.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3 text-cyan-300">
              <Target size={20} />
              <div className="text-[11px] font-extrabold uppercase tracking-[0.32em]">Our Mission</div>
            </div>
            <div className="mt-6 space-y-4">
              {props.missionPoints.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-cyan-300" size={18} />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="border-b border-white/10 bg-gradient-to-br from-cyan-400/12 via-blue-500/8 to-transparent p-7">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-cyan-300">Why this matters</div>
              <h3 className="mt-4 text-2xl font-black text-white">Built for plug-and-play cross-border execution.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                The deck emphasizes plug-and-play support, virtual operations, and easier communication.
              </p>
            </div>

            <div className="grid gap-0 sm:grid-cols-3">
              {[
                ['Virtual setup', 'Fast operational support for temporary or early-stage business activity.'],
                ['Bilingual bridge', 'Clearer communication between India- and Japan-facing teams.'],
                ['Visible delivery', 'Strategy, support, and execution shown upfront instead of buried in hidden sections.'],
              ].map(([title, body], index) => (
                <div
                  key={title}
                  className={`p-5 ${index > 0 ? 'border-t border-white/10 sm:border-t-0 sm:border-l' : ''} sm:border-white/10`}
                >
                  <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
