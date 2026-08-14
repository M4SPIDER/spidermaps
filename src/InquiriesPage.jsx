import React from 'react';
import { ClipboardCheck, FileText, Search, TrendingUp } from 'lucide-react';

export default function InquiriesPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Inquiries</div>
            <h1 className="mt-4 text-3xl md:text-4xl font-black">Ready for a proper inquiry flow.</h1>

            <div className="mt-6 space-y-4">
              {[
                ['Cross-border expansion', 'India-Japan business setup, coordination, and execution support.'],
                ['Project monitoring', 'Structured communication, quality tracking, review cycles, and reporting cadence.'],
                ['Market entry support', 'Consulting, partner selection, vertical-specific expansion, and bilingual support.'],
              ].map(([title, body]) => (
                <div key={title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-white">{title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Quick Guide</div>
            <div className="mt-5 space-y-4">
              {[
                { icon: FileText, title: 'Scope clearly', body: 'Share business objective, sector, and operating geography.' },
                { icon: Search, title: 'Match support', body: 'We map the right consulting, vertical, and process support.' },
                { icon: TrendingUp, title: 'Move forward', body: 'Review structure, timeline, and execution path together.' },
                { icon: ClipboardCheck, title: 'Stay governed', body: 'Quality, communication, and tracking stay visible throughout delivery.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                    <Icon size={18} className="text-cyan-300" />
                    <div className="mt-3 text-sm font-black uppercase tracking-[0.16em]">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{item.body}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
