import React from 'react';
import { CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function QualityPage(props) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <div className="space-y-6">
        <div>
          <props.SectionIntro
            eyebrow="Quality Assurance"
            title="The best to everyone."
          />

          <div className="mt-7 grid gap-5 xl:grid-cols-2">
            {props.qualityPhases.map((phase) => (
              <div key={phase.title} className="lift-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-cyan-300" />
                  <h3 className="text-lg font-black">{phase.title}</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {phase.bullets.map((bullet) => (
                    <div key={bullet} className="flex gap-3">
                      <CheckCircle2 size={18} className="mt-1 shrink-0 text-cyan-300" />
                      <p className="text-sm leading-7 text-slate-300">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-300">Review Cycle Snapshot</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Planning', 'Execution', 'Management', 'Post Delivery'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-100"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: 'Peer Review',
                  copy: 'Second-level checks keep quality consistent before delivery.',
                  image: props.assets.reportingGroup,
                },
                {
                  title: 'Quality Checklist',
                  copy: 'Requirements are aligned before execution starts.',
                  image: props.assets.reportingTable,
                },
                {
                  title: 'Customer Feedback',
                  copy: 'Periodic feedback helps identify improvements early.',
                  image: props.assets.reportingMeeting,
                },
              ].map((item) => (
                <div key={item.title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                  <props.SmartImage src={item.image} alt={item.title} className="h-12 w-12 rounded-xl bg-white object-contain p-2" />
                  <div className="mt-3 text-sm font-black text-white">{item.title}</div>
                  <p className="mt-2 text-xs leading-6 text-slate-300">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-300">Quality Outcomes</div>
            <h3 className="mt-3 text-2xl font-black text-white">What the review system is designed to protect.</h3>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: 'Defect-free delivery',
                  body: 'QC sheets and peer review keep output aligned before it reaches the client.',
                },
                {
                  title: 'Planning clarity',
                  body: 'Scope, timelines, and acceptance criteria are locked before execution starts.',
                },
                {
                  title: 'Continuous improvement',
                  body: 'Metrics reviews and customer feedback create a recurring improvement loop.',
                },
                {
                  title: 'Cross-team visibility',
                  body: 'Technical, account, and senior management reporting stays synchronized.',
                },
              ].map((item) => (
                <div key={item.title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-sm font-black uppercase tracking-[0.14em] text-white">{item.title}</div>
                  <p className="mt-2 text-xs leading-6 text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-cyan-300/15 bg-cyan-300/10 px-4 py-4 text-sm leading-7 text-cyan-50">
              Sapphire Asia&apos;s PMO model is not just about reporting status. It is built to catch issues early,
              validate quality before delivery, and keep improvement actions visible across the full lifecycle.
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Project Monitoring Documents</div>
          <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Operational documents that keep delivery visible.</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {props.monitoringDocuments.map((doc) => (
              <article key={doc.title} className="lift-card rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                <props.SmartImage src={doc.image} alt={doc.title} className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
                <h3 className="mt-4 text-lg font-black">{doc.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{doc.detail}</p>
                <div className="mt-4 rounded-2xl bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                  Benefit: {doc.benefit}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-cyan-300" />
              <h3 className="text-xl font-black">Reporting Interaction</h3>
            </div>
            <div className="mt-6 space-y-4">
              {props.reportingRows.map((row) => (
                <div key={row.group} className="lift-card flex flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.045] px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-lg font-black">{row.group}</div>
                    <div className="text-sm text-slate-400">{row.role}</div>
                  </div>
                  <div className="max-w-sm text-sm leading-7 text-cyan-100">{row.cadence}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
