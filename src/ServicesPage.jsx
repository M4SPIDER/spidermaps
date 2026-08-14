import React from 'react';

export default function ServicesPage(props) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-gradient-to-br from-white/7 to-white/[0.03]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/10 p-7 md:p-10 lg:border-b-0 lg:border-r">
            <props.SectionIntro
              eyebrow="What We Do"
              title="Hands-on support across advisory, governance, execution, and expansion."
            />
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            {props.services.map((service, index) => (
              <div key={service} className="border-t border-white/10 p-6 first:border-t-0 md:[&:nth-child(2)]:border-t-0 md:[&:nth-child(odd)]:border-r md:border-white/10">
                <div className="text-4xl font-black text-white/15">{String(index + 1).padStart(2, '0')}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-transparent p-7 md:p-10">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-200">Business Benefits</div>
          <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Business benefit with Sapphire Asia.</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.benefits.map((benefit) => (
              <button
                key={benefit.id}
                onClick={() => props.onBenefitOpen(benefit)}
                className="lift-card rounded-[1.4rem] border border-white/10 bg-[#07111f]/70 px-4 py-4 text-left text-sm font-bold leading-6 text-slate-100"
              >
                <div>{benefit.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
