import React from 'react';

export default function ProcessPage(props) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <props.SectionIntro
        eyebrow="Our Services Process"
        title="How Sapphire Asia builds the bridge from idea to execution."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-4">
        {props.processSteps.map((step, index) => (
          <div key={step.title} className="lift-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <props.SmartImage src={step.image} alt={step.title} className="h-24 w-24 rounded-2xl bg-white object-contain p-3" />
            <div className="mt-5 text-xs font-extrabold uppercase tracking-[0.28em] text-cyan-300">
              Step {index + 1}
            </div>
            <h3 className="mt-3 text-xl font-black">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{step.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
          <props.SmartImage src={props.assets.processInterview} alt="Assessment icon" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
          <p className="mt-4 text-sm leading-7 text-slate-300">Assessment stays continuous, not one-time.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
          <props.SmartImage src={props.assets.processBoard} alt="Presentation icon" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
          <p className="mt-4 text-sm leading-7 text-slate-300">Partner selection and alignment are treated as working sessions with feedback loops, not just static introductions.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
          <props.SmartImage src={props.assets.processChecklist} alt="Checklist icon" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
          <p className="mt-4 text-sm leading-7 text-slate-300">Contracts, MoUs, and formal review checkpoints are part of the process from the start.</p>
        </div>
      </div>
    </section>
  );
}
