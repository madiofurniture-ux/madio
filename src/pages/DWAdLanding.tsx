// Paid-ads landing page for Madio Doors & Windows (/lp/doors-windows).
//
// Built for Google Ads traffic: no site navigation, one conversion goal (a
// short enquiry form above the fold), call and WhatsApp as secondary routes,
// and a sticky action bar on mobile. It sits outside MadioLayout on purpose.
//
// Content rules (same as the rest of the division, see dwArchitect.ts and
// doorsWindows.ts): every figure here is read from the catalogue data, the
// warranty is DW_WARRANTY per system, catalogue imagery is labelled as
// illustrative, and the only "installed" photos are the ones the client
// captioned as Madio installations. No testimonials, prices or offers.
//
// The page is noindex: it exists for ad traffic and would otherwise compete
// with /doors-windows in search.
import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, ChevronDown, Mail, MessageCircle, Phone, Send } from "lucide-react";
import {
  DW_WARRANTY,
  aluminiumAdvantages,
  dwAsset,
  dwMaxHeight,
  dwMinInterlock,
  dwPerformanceHighlights,
  dwSystems,
  madioProcess,
  performanceStandards,
} from "../data/doorsWindows";
import { DW_BASE, DW_EMAIL, dwApplicationGroups, dwProjectStages, dwProjects, dwWhatsAppLink } from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { Eyebrow, Hatch } from "../components/dw/DWUI";

const PHONE_DISPLAY = "+91 99486 01899";
const PHONE_TEL = "tel:+919948601899";
const LEAD_SOURCE = "doors-windows-ads-landing";
const WA_TEXT = "Hello Madio Doors and Windows, I saw your page and would like to discuss doors and windows for my project.";

const dwLogo = dwAsset("dw-logo");
const warrantyLabel = DW_WARRANTY.replace(" Years", "-year");

// Ad-click parameters carried into the lead, so each enquiry can be traced
// back to its campaign and keyword in the sheet.
const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"] as const;

type Tracker = { dataLayer?: object[]; gtag?: (...args: unknown[]) => void };
/** Fires a conversion-style event if a Google tag / GTM is on the page; a no-op otherwise. */
const track = (event: string, params: Record<string, string> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as Tracker;
  w.dataLayer?.push({ event, ...params });
  w.gtag?.("event", event, params);
};

// Application groups shown as "what do you need", in the catalogue's order.
// Blinds have no imagery or public specs yet, and "Also from Madio" is not a
// door or window, so neither is a card here; both stay in the dropdown.
const requirementGroups = dwApplicationGroups.filter((g) => g.id !== "also");
const requirementOptions = [...requirementGroups.map((g) => g.title), "Not sure yet"];
const rangeCards = requirementGroups
  .filter((g) => g.id !== "blinds")
  .map((g) => {
    const systems = g.systemIds.map((id) => dwSystems.find((s) => s.id === id)).filter((s) => !!s);
    const visual = systems.find((s) => s.visual)?.visual;
    return { ...g, systems, visual };
  });

const proofPoints = [
  { figure: dwMinInterlock, label: "Ultra-slim interlock sightline" },
  { figure: "Imported", label: "European hardware" },
  { figure: dwMaxHeight, label: "Max window height" },
  { figure: DW_WARRANTY, label: "Warranty per system" },
];

const benefitTitles = ["Durability", "Easy Maintenance", "Security", "Acoustic Insulation", "Thermal Efficiency", "Eco-Friendly"];
const benefits = benefitTitles
  .map((t) => aluminiumAdvantages.find((a) => a.advantage === t))
  .filter((a) => !!a);

// Hardware origin is already a hero proof point; warranty is appended per system.
const standards = performanceStandards.filter((s) => s.standard !== "Warranty" && s.standard !== "Hardware Origin");
const installed = dwProjects.filter((p) => !p.isInspiration && p.photos.length > 0);
const heroPhoto = installed[0]?.photos[0];

const faqs = [
  {
    q: "What does the warranty cover?",
    a: `Each Madio system carries a ${warrantyLabel} warranty, confirmed and documented per system at handover.`,
  },
  {
    q: "What hardware do you use?",
    a: "Imported European hardware on every system, with single or multi-point locking depending on the system and opening.",
  },
  {
    q: "Which glass can the systems take?",
    a: "Single glazing, double-glazed units (DGU) and laminated glass. The glass thickness each system accepts is listed on its specification page.",
  },
  {
    q: "Can I get a price online?",
    a: "Prices are not quoted online. After site assessment and measurement we prepare a project-specific quotation, itemised opening by opening.",
  },
  {
    q: "What happens after I send an enquiry?",
    a: "The Madio Doors & Windows team contacts you to understand the project, recommends systems for each opening and arranges site measurement when the project is ready.",
  },
  {
    q: "Which finishes are available?",
    a: "Powder coating in any RAL colour, wood-grain finishes, and bright or matte anodised profiles.",
  },
];

const inputCls =
  "w-full border border-[#EBE8E2] px-4 py-3 text-sm bg-[#F4F1EA] focus:bg-white focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] font-light text-[#121212] placeholder-[#6B6B6B]/60 transition-colors";
const labelCls = "text-[10px] uppercase tracking-wider text-[#6B6B6B] font-sans font-semibold block mb-1.5";

interface LeadForm {
  name: string;
  phone: string;
  location: string;
  requirement: string;
  stage: string;
}

const EnquiryForm: React.FC<{ requirement: string; onRequirement: (v: string) => void }> = ({ requirement, onRequirement }) => {
  const [form, setForm] = useState<Omit<LeadForm, "requirement">>({ name: "", phone: "", location: "", stage: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const brief = [
    "MADIO DOORS & WINDOWS — AD ENQUIRY",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Project location: ${form.location}`,
    `Looking for: ${requirement || "-"}`,
    `Project stage: ${form.stage || "-"}`,
  ].join("\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL as string | undefined;
    if (!apiUrl || apiUrl.includes("YOUR_COPIED_APPS_SCRIPT_URL_HERE")) {
      // No lead endpoint configured: never pretend it was sent.
      setStatus("fallback");
      return;
    }
    setStatus("sending");
    // Read at submit time: the ad-click parameters are on the landing URL.
    const params = new URLSearchParams(window.location.search);
    const tracking: Record<string, string> = {};
    TRACKING_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) tracking[k] = v.slice(0, 200);
    });
    try {
      // Same Apps Script endpoint and core fields as the consultation form,
      // plus the ad-click parameters for campaign attribution.
      const body = new URLSearchParams({
        name: form.name,
        email: "",
        subject: "Doors & Windows Enquiry (Ads landing page)",
        interestedIn: "Doors & Windows",
        message: [brief, ...Object.entries(tracking).map(([k, v]) => `${k}: ${v}`)].join("\n"),
        phone: form.phone,
        projectLocation: form.location,
        productInterest: requirement,
        projectStage: form.stage,
        source: LEAD_SOURCE,
        landingPage: window.location.pathname,
        ...tracking,
      });
      await fetch(apiUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setStatus("sent");
      track("generate_lead", { form: LEAD_SOURCE, requirement: requirement || "Not specified" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-10 flex flex-col items-center gap-4" role="status">
        <CheckCircle size={40} className="text-[#C5A059]" />
        <h2 className="text-2xl font-serif font-light text-[#121212]">Thank you, {form.name.split(" ")[0] || "we have your details"}.</h2>
        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed max-w-sm">
          The Madio Doors & Windows team will call you on {form.phone}. If you have drawings or photos of the openings, you can share them on WhatsApp.
        </p>
        <a
          href={dwWhatsAppLink(`${WA_TEXT}\n\n${brief}`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { placement: "thank_you" })}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-[#121212] hover:text-[#C5A059]"
        >
          <MessageCircle size={14} /> Share drawings on WhatsApp
        </a>
      </div>
    );
  }

  if (status === "fallback" || status === "error") {
    return (
      <div className="py-4" role="alert">
        <h2 className="text-xl font-serif font-light text-[#121212] mb-3">Send your enquiry on WhatsApp or email</h2>
        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-6">
          {status === "error" ? "We could not send the form just now." : "Online submission is not available right now."} Your details are ready below, so nothing is lost.
        </p>
        <div className="flex flex-col gap-3 mb-5">
          <a
            href={dwWhatsAppLink(brief)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { placement: "form_fallback" })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-sans font-medium bg-[#C5A059] text-white hover:bg-[#121212] transition-colors"
          >
            <MessageCircle size={14} /> Send on WhatsApp
          </a>
          <a
            href={`mailto:${DW_EMAIL}?subject=${encodeURIComponent("Doors & Windows enquiry")}&body=${encodeURIComponent(brief)}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-sans font-medium border border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
          >
            <Mail size={14} /> Email us
          </a>
        </div>
        <button type="button" onClick={() => setStatus("idle")} className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6B6B6B] hover:text-[#121212]">
          Back to the form
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lp-name" className={labelCls}>Full name *</label>
        <input id="lp-name" name="name" required autoComplete="name" value={form.name} onChange={set} className={inputCls} />
      </div>
      <div>
        <label htmlFor="lp-phone" className={labelCls}>Mobile number *</label>
        <input
          id="lp-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          pattern="[0-9+\-\s]{10,16}"
          title="Enter a 10-digit mobile number"
          value={form.phone}
          onChange={set}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="lp-location" className={labelCls}>Project location *</label>
        <input id="lp-location" name="location" required placeholder="e.g. Kokapet, Hyderabad" value={form.location} onChange={set} className={inputCls} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lp-requirement" className={labelCls}>Looking for</label>
          <select id="lp-requirement" name="requirement" value={requirement} onChange={(e) => onRequirement(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            {requirementOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lp-stage" className={labelCls}>Project stage</label>
          <select id="lp-stage" name="stage" value={form.stage} onChange={set} className={inputCls}>
            <option value="">Select</option>
            {dwProjectStages.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-[#C5A059] text-white py-4 text-xs uppercase tracking-[0.25em] font-sans font-semibold hover:bg-[#121212] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : (<>Request a Consultation <Send size={12} /></>)}
      </button>
      <p className="text-[11px] text-[#6B6B6B] font-light leading-relaxed">
        We use these details only to respond to your enquiry. Quotations are prepared per project after measurement.
      </p>
    </form>
  );
};

export const DWAdLanding: React.FC = () => {
  usePageMeta(
    "Ultra-Slim Aluminium Windows & Doors, Hyderabad | Madio",
    `Ultra-slim aluminium sliding, casement and folding systems with imported European hardware and a ${warrantyLabel} warranty per system. Request a consultation with Madio Doors & Windows.`,
    { noindex: true },
  );

  const [requirement, setRequirement] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goToForm = (req?: string) => {
    if (req) setRequirement(req);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("lp-name")?.focus({ preventScroll: true }), 500);
  };

  const waLink = useMemo(() => dwWhatsAppLink(WA_TEXT), []);

  return (
    <div className="bg-[#F4F1EA] min-h-screen pb-16 md:pb-0">
      {/* Minimal header: logo and direct contact only, no site navigation. */}
      <header className="bg-[#121212] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 flex items-center justify-between">
          {dwLogo ? (
            <img src={dwLogo} alt="Madio Doors & Windows" width={900} height={268} className="h-9 md:h-10 w-auto" />
          ) : (
            <span className="text-[11px] tracking-[0.3em] uppercase font-sans text-white">Madio Doors & Windows</span>
          )}
          <div className="flex items-center gap-5">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { placement: "header" })}
              className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-white/70 hover:text-white"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a
              href={PHONE_TEL}
              onClick={() => track("phone_click", { placement: "header" })}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-sans text-white border border-[#C5A059] px-3 py-2 hover:bg-[#C5A059] transition-colors"
            >
              <Phone size={13} /> <span className="hidden sm:inline">{PHONE_DISPLAY}</span><span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero with the enquiry form above the fold. */}
      <section className="relative bg-[#121212] overflow-hidden">
        {heroPhoto && (
          <img
            src={heroPhoto.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-[#121212]/30" />
        <Hatch opacity={0.05} />
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Eyebrow>Architectural Aluminium Systems · Hyderabad</Eyebrow>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.08] mb-6">
              Less frame. <span className="italic text-[#C5A059]">More view.</span>
            </h1>
            <p className="text-sm md:text-base text-[#C4B9A8] font-light leading-relaxed max-w-xl mb-8">
              Ultra-slim aluminium sliding, casement and folding systems with interlock sightlines from {dwMinInterlock}, fitted with imported European hardware and multi-point locking. Specified opening by opening for your home.
            </p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 max-w-2xl">
              {proofPoints.map((p) => (
                <div key={p.label} className="bg-[#121212]/80 px-4 py-4">
                  <dt className="sr-only">{p.label}</dt>
                  <dd>
                    <span className="block text-xl md:text-2xl font-serif text-white">{p.figure}</span>
                    <span className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[#C4B9A8] mt-1">{p.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
            {heroPhoto && <p className="text-[10px] text-white/40 font-sans mt-4">Background: a Madio slim sliding system, installed.</p>}
          </div>

          <div ref={formRef} id="enquire" className="lg:col-span-5 bg-white p-6 md:p-8 scroll-mt-4 shadow-2xl">
            <h2 className="text-2xl font-serif font-light text-[#121212] mb-1">Discuss your windows and doors</h2>
            <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-6">
              Tell us about the project and we will call you to recommend systems for each opening.
            </p>
            <EnquiryForm requirement={requirement} onRequirement={setRequirement} />
          </div>
        </div>
      </section>

      {/* Brand pillars: the three values from the brand brief, short. */}
      <section className="py-16 md:py-20 px-5 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <Eyebrow>Why Madio</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-serif font-light text-[#121212] leading-tight">
              Precision you can see in every sightline.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EBE8E2] border border-[#EBE8E2]">
            {benefits.map((b) => (
              <div key={b.advantage} className="bg-white p-7">
                <div className="w-6 h-[2px] bg-[#C5A059] mb-5" />
                <h3 className="text-lg font-serif font-light text-[#121212] mb-2">{b.advantage === "Eco-Friendly" ? "Sustainable" : b.advantage}</h3>
                <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{b.description}.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The range, grouped the way a homeowner asks for it. */}
      <section className="py-16 md:py-20 px-5 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <Eyebrow>The Range</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-serif font-light text-[#121212] leading-tight">
              A system for every opening.
            </h2>
            <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mt-4">
              {dwSystems.length} systems in the 2026 catalogue, from compact windows to full-height glass walls.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {rangeCards.map((g, i) => (
              <article
                key={g.id}
                className={`bg-white border border-[#EBE8E2] flex flex-col ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${i === rangeCards.length - 1 && rangeCards.length % 2 === 1 ? "md:col-span-2" : ""}`}
              >
                <figure className="relative h-56 bg-[#EBE8E2] overflow-hidden">
                  {g.visual ? (
                    <img src={g.visual.src} alt={g.visual.alt} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <Hatch />
                  )}
                  {g.visual && (
                    <figcaption className="absolute bottom-0 left-0 right-0 bg-[#121212]/70 text-[9px] uppercase tracking-[0.15em] font-sans text-white/80 px-3 py-1.5">
                      Catalogue imagery, illustrative
                    </figcaption>
                  )}
                </figure>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-serif font-light text-[#121212] mb-2">{g.title}</h3>
                  <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-4 flex-grow">{g.body}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] font-sans text-[#6B6B6B] mb-5">
                    {g.systems.map((s) => s.name.replace("Madio ", "")).join(" · ")}
                  </p>
                  <button
                    type="button"
                    onClick={() => goToForm(g.title)}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] hover:text-[#121212] self-start"
                  >
                    Enquire <ArrowRight size={11} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Performance and standards. */}
      <section className="relative bg-[#121212] py-16 md:py-20 px-5 md:px-12 overflow-hidden">
        <Hatch opacity={0.06} />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Performance</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-serif font-light text-white leading-tight mb-8">
              Quiet, sealed and engineered for wind load.
            </h2>
            <div className="space-y-6">
              {dwPerformanceHighlights.map((p) => (
                <div key={p.title} className="border-l-2 border-[#C5A059] pl-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C4B9A8]">{p.title}</p>
                  <p className="text-xl font-serif text-white mb-1">{p.figure}</p>
                  <p className="text-xs text-[#C4B9A8] font-light leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {[...standards, { standard: "Warranty", specification: `${DW_WARRANTY} per system` }].map((s) => (
                <div key={s.standard} className="bg-[#121212] p-6">
                  <dt className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C4B9A8] mb-2">{s.standard}</dt>
                  <dd className="text-base font-serif text-white">{s.specification}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Installed work: only photos captioned as Madio installations. */}
      {installed.length > 0 && (
        <section className="py-16 md:py-20 px-5 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-10">
              <Eyebrow>Installed by Madio</Eyebrow>
              <h2 className="text-2xl md:text-4xl font-serif font-light text-[#121212] leading-tight">Recent work.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {installed.map((p) => (
                <figure key={p.slug} className="border border-[#EBE8E2]">
                  <img src={p.photos[0].src} alt={p.photos[0].alt} loading="lazy" className="w-full aspect-[4/3] object-cover" />
                  <figcaption className="p-5">
                    <p className="text-base font-serif text-[#121212]">{p.name}</p>
                    {p.installationNotes && <p className="text-xs text-[#6B6B6B] font-light mt-1">{p.installationNotes}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process: what happens after the enquiry. */}
      <section className="py-16 md:py-20 px-5 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-serif font-light text-[#121212] leading-tight">From enquiry to handover.</h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {madioProcess.map((s) => (
              <li key={s.step} className="bg-white border border-[#EBE8E2] p-7">
                <span className="text-3xl font-serif text-[#C5A059]">0{s.step}</span>
                <h3 className="text-lg font-serif font-light text-[#121212] mt-3 mb-1">{s.title}</h3>
                <p className="text-xs italic text-[#6B6B6B] mb-4">{s.tagline}</p>
                <ul className="space-y-2">
                  {s.bullets.slice(0, 3).map((b) => (
                    <li key={b} className="text-xs text-[#6B6B6B] font-light leading-relaxed flex gap-2">
                      <span className="text-[#C5A059]">·</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ: answers come from the catalogue data only. */}
      <section className="py-16 md:py-20 px-5 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="text-2xl md:text-4xl font-serif font-light text-[#121212] leading-tight mb-8">Before you enquire.</h2>
          <div className="border-t border-[#EBE8E2]">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="border-b border-[#EBE8E2]">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-serif text-[#121212]">{f.q}</span>
                    <ChevronDown size={16} className={`shrink-0 text-[#C5A059] transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <div id={`faq-${i}`} hidden={!open} className="pb-5 text-sm text-[#6B6B6B] font-light leading-relaxed">
                    {f.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing call to action. */}
      <section className="bg-[#121212] py-16 md:py-20 px-5 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-white leading-snug mb-5">
            Let the architecture <span className="italic text-[#C5A059]">lead.</span>
          </h2>
          <p className="text-sm text-[#C4B9A8] font-light leading-relaxed mb-8">
            Share the openings and the stage your project is at. We will recommend the systems and arrange measurement when you are ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goToForm()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium bg-[#C5A059] text-white hover:bg-white hover:text-[#121212] transition-colors"
            >
              Request a Consultation <ArrowRight size={12} />
            </button>
            <a
              href={PHONE_TEL}
              onClick={() => track("phone_click", { placement: "closing" })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium border border-white/40 text-white hover:border-white transition-colors"
            >
              <Phone size={13} /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* Slim footer: contact and a way into the full site. */}
      <footer className="bg-[#0B0B0B] px-5 md:px-12 py-8 text-[11px] text-white/50 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <p>Madio Doors & Windows, Hyderabad · <a href={PHONE_TEL} className="hover:text-white">{PHONE_DISPLAY}</a> · <a href={`mailto:${DW_EMAIL}`} className="hover:text-white">{DW_EMAIL}</a></p>
          <p className="flex gap-5">
            <Link to={`${DW_BASE}/systems`} className="hover:text-white">All systems and specifications</Link>
            <Link to="/" className="hover:text-white">madio.in</Link>
          </p>
        </div>
        <p className="max-w-7xl mx-auto mt-4 text-white/30">Catalogue imagery is illustrative. Specifications follow the Madio 2026 catalogue; final configurations are confirmed at site measurement.</p>
      </footer>

      {/* Sticky action bar on mobile. */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-3 bg-[#121212] border-t border-white/10 text-[10px] uppercase tracking-[0.15em] font-sans">
        <a href={PHONE_TEL} onClick={() => track("phone_click", { placement: "sticky" })} className="flex items-center justify-center gap-1.5 py-4 text-white">
          <Phone size={14} /> Call
        </a>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { placement: "sticky" })}
          className="flex items-center justify-center gap-1.5 py-4 text-white border-x border-white/10"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <button type="button" onClick={() => goToForm()} className="flex items-center justify-center gap-1.5 py-4 bg-[#C5A059] text-white uppercase tracking-[0.15em]">
          Enquire
        </button>
      </div>
    </div>
  );
};
