import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BenefitDetailPage({ benefit, onBack }) {
  if (!benefit) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(180deg,_#07111f_0%,_#09182b_45%,_#050b14_100%)]" />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Back to benefits
        </button>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2.4rem] border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Business Benefit</div>
            <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight text-white">{benefit.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{benefit.summary}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {benefit.highlights.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-white/10 bg-[#0b1a2d] p-5">
                  <CheckCircle2 size={18} className="text-cyan-300" />
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[2.4rem] border border-white/10 bg-[#081525] p-8 md:p-10">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">How It Shows Up</div>
            <div className="mt-6 space-y-4">
              {benefit.impacts.map((item, index) => (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-200">
                    Impact {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="mt-2 text-xl font-black text-white">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/10 p-5 text-sm leading-7 text-cyan-50">
              {benefit.closer}
            </div>

            <button
              onClick={onBack}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-200"
            >
              Explore another benefit
              <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
