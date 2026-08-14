import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';

export default function VerticalsPage(props) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <props.SectionIntro
        eyebrow="Business Verticals"
        title="Current service provided and customers"
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {props.verticals.map((vertical) => {
          const Icon = vertical.icon;
          return (
            <article key={vertical.title} className="lift-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)] flex flex-col justify-between">
              <div>
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${vertical.accent}`}>
                  <Icon size={26} />
                </div>
                <h3 className="mt-5 text-2xl font-black">{vertical.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{vertical.summary}</p>
                <div className="mt-6 space-y-3">
                  {vertical.bullets.map((bullet) => (
                    <div key={bullet} className="flex gap-3">
                      <ChevronRight size={18} className="mt-1 shrink-0 text-cyan-300" />
                      <p className="text-sm leading-7 text-slate-300">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>

              {vertical.websiteUrl && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <a
                    href={vertical.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-300/20 hover:text-white"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
