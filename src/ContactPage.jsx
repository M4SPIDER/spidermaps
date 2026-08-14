import React from 'react';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const addressText = '〒110-0005 Tokyo, Taito City, Ueno, 3-20-2 Mizuno building B';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
  const googleEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent('3-20-2 Ueno, Taito City, Tokyo 110-0005 Japan')}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-6">
      <div className="rounded-[2.4rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Contact Us</div>
        <h1 className="mt-3 text-4xl font-black">Leadership Contacts & Location</h1>

        {/* Top Row: 2 Side-by-Side Small Boxes */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Left Box: Director Contact Details (No Address) */}
          <div className="lift-card flex flex-col justify-between rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-6">
            <div>
              <div className="text-2xl font-black text-white">Dr. Saradhi Paramata</div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">Director</div>
              
              <div className="mt-6 space-y-3.5 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <span className="font-semibold text-slate-200">Sapphire Asia KK</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 shrink-0">
                    <Phone size={16} />
                  </div>
                  <span><strong className="text-slate-400 font-semibold">India:</strong> +91 89772837449</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 shrink-0">
                    <Phone size={16} />
                  </div>
                  <span><strong className="text-slate-400 font-semibold">Japan:</strong> +81 9084644889</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 shrink-0">
                    <Mail size={16} />
                  </div>
                  <a href="mailto:saradhi@sapphire-asia.com" className="hover:text-cyan-300 transition-colors">
                    saradhi@sapphire-asia.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Box: Dedicated Office Address */}
          <div className="lift-card flex flex-col justify-between rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-6">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">Tokyo Headquarters</div>
              <div className="mt-1 text-2xl font-black text-white">Office Address</div>

              <div className="mt-6 flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300 shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div className="text-base font-semibold leading-relaxed text-slate-200">
                  {addressText}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
              >
                <span>View on Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Section: Embedded Google Map */}
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">
              <MapPin size={16} />
              <span>How To Find Us — Location Map</span>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>Open Map App</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="relative aspect-[16/9] w-full min-h-[380px] md:min-h-[440px]">
            <iframe
              src={googleEmbedUrl}
              title="Google Maps Location - Sapphire Asia KK"
              className="h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
