// Paid-ads landing page for Madio Doors & Windows (/lp/doors-windows).
//
// Built for Google Ads traffic: no site-wide navigation (only in-page
// anchors), the enquiry form above the fold and again at the close, call and
// WhatsApp as secondary routes, and a sticky action bar on mobile. It sits
// outside MadioLayout on purpose.
//
// Content approach: dense, specific and scannable. Hard figures per system,
// finishes, where each configuration fits, an honest material comparison,
// and repeated quote prompts.
//
// Content rules (same as the rest of the division, see dwArchitect.ts and
// doorsWindows.ts): every figure here is read from the catalogue data, the
// warranty is DW_WARRANTY per system, catalogue imagery is labelled as
// illustrative, and the only "installed" photos are the ones the client
// captioned as Madio installations. No testimonials, prices, offers,
// reach statistics or superlatives.
//
// The page is noindex: it exists for ad traffic and would otherwise compete
// with /doors-windows in search.
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, ChevronDown, Download, Mail, MessageCircle, Phone, Send } from "lucide-react";
import {
  DW_WARRANTY,
  dwAsset,
  dwHardwarePro,
  dwMaxHeight,
  dwMinInterlock,
  dwPillars,
  dwSystems,
  madioProcess,
  materialComparison,
  performanceStandards,
  windowDoorTypologies,
} from "../data/doorsWindows";
import type { DWSystem } from "../data/doorsWindows";
import {
  DW_BASE,
  DW_EMAIL,
  dwApplicationGroups,
  dwProjectStages,
  dwProjectTypes,
  dwProjects,
  dwResources,
  dwWhatsAppLink,
} from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { Eyebrow, Hatch } from "../components/dw/DWUI";

const PHONE_DISPLAY = "+91 99486 01899";
const PHONE_TEL = "tel:+919948601899";
const LEAD_SOURCE = "doors-windows-ads-landing";
const WA_TEXT = "Hello Madio Doors and Windows, I saw your page and would like a quote for windows and doors.";

const dwLogo = dwAsset("dw-logo");
const warrantyLabel = DW_WARRANTY.replace(" Years", "-year");
const openingTypesPdf = dwResources.find((r) => r.id === "configuration-diagrams" && r.file);

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

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const sectionNav = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "range", label: "Range" },
  { id: "finishes", label: "Finishes" },
  { id: "applications", label: "Applications" },
  { id: "projects", label: "Projects" },
];

// --------------- Data, all derived from the catalogue ---------------

const sys = (id: string) => dwSystems.find((s) => s.id === id);
const titan = sys("titan-40");
const maxGlass = Math.max(...dwSystems.map((s) => parseFloat((s.specs.glassThickness ?? "").split("–").pop() ?? "")).filter((n) => !Number.isNaN(n)));

const proofPoints = [
  { figure: dwMinInterlock, label: "Ultra-slim interlock" },
  { figure: "Imported", label: "European hardware" },
  { figure: dwMaxHeight, label: "Max window height" },
  { figure: DW_WARRANTY, label: "Warranty per system" },
];

const standard = (name: string) => performanceStandards.find((s) => s.standard === name)?.specification ?? "";

const keyFeatures = [
  { figure: dwMinInterlock, title: "Ultra-slim sightlines", body: `Interlock sightlines from ${dwMinInterlock}, so the frame recedes and the glass leads.` },
  { figure: dwMaxHeight, title: "Full-height glazing", body: `The ${titan?.name ?? "Titan 40"} carries windows up to ${dwMaxHeight} high${titan?.specs.loadCapacity ? ` on ${titan.specs.loadCapacity} rollers` : ""}.` },
  { figure: "Imported", title: "European hardware", body: "Imported European hardware on every system, with single or multi-point locking." },
  { figure: "Up to 38 dB", title: "Acoustic comfort", body: "Sound reduction when paired with appropriate glazing, with acoustic seals on every sash." },
  { figure: standard("Wind Load Classification") || "Class A", title: "Wind load", body: "Structurally engineered frames for wind-load resistance; the Casement 52 is wind-load rated." },
  { figure: "6063-T5", title: "Architectural-grade aluminium", body: "Premium-grade alloy for strength and finish, 100% recyclable without loss of quality." },
  { figure: `Up to ${maxGlass} mm`, title: "Glass of your choice", body: "Single glazing, double-glazed units (DGU) or laminated glass, by system and opening." },
  { figure: DW_WARRANTY, title: "Warranty per system", body: "Confirmed and documented per system at handover, with care and maintenance guidance." },
];

// Spec chips for one system, only the values the catalogue gives.
const specChips = (s: DWSystem) =>
  [
    s.specs.interlock && `${s.specs.interlock} interlock`,
    s.specs.maxHeight && `Up to ${s.specs.maxHeight} high`,
    s.specs.glassThickness && `${s.specs.glassThickness} glass`,
    s.specs.loadCapacity && `${s.specs.loadCapacity} rollers`,
    s.specs.lockingSystem && (/locking/i.test(s.specs.lockingSystem) ? s.specs.lockingSystem : `${s.specs.lockingSystem} locking`),
  ].filter((x): x is string => !!x);

// The range, grouped the way a homeowner asks for it. Large-format is folded
// into sliding here (both of its systems are sliding systems) to avoid
// listing the Vista 32 twice. Blinds have no public specs yet, and "Also
// from Madio" is not a door or window, so neither gets a block; both stay in
// the form's dropdown.
const rangeGroupIds = ["sliding", "casement", "folding", "partitions"];
const rangeGroups = rangeGroupIds
  .map((id) => dwApplicationGroups.find((g) => g.id === id))
  .filter((g) => !!g)
  .map((g) => {
    const ids = g.id === "sliding" ? [...new Set([...g.systemIds, "titan-40"])] : g.systemIds;
    const systems = ids.map(sys).filter((s): s is DWSystem => !!s);
    return { ...g, systems, visual: systems.find((s) => s.visual)?.visual };
  });

const requirementOptions = [...dwApplicationGroups.filter((g) => g.id !== "also").map((g) => g.title), "Not sure yet"];

const finishes = [
  { title: "Powder coat, any RAL colour", body: "Multi-stage powder coating with QUALICOAT-standard finishes, and custom colour matching." },
  { title: "Wood-grain finishes", body: "The warmth of timber on an aluminium profile, without sanding, sealing or painting." },
  { title: "Anodised, bright or matte", body: "A timeless architectural finish for minimal and contemporary elevations." },
];

const comparisonRows = materialComparison.filter((r) =>
  ["Durability", "Maintenance", "Strength-to-Weight", "Design Flexibility", "Fire Resistance", "Sustainability", "Aesthetic Profile"].includes(r.parameter),
);

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
    q: "How is the quote prepared?",
    a: "Prices are not quoted online. After a consultation and site measurement we prepare a project-specific quotation, itemised opening by opening (typology, specification, width × height and area).",
  },
  {
    q: "What hardware do you use?",
    a: `Imported European hardware on every system, with single or multi-point locking. The ${dwHardwarePro.name} collection adds multi-point locks, heavy-duty rollers and premium handles in powder-coated or chrome finish.`,
  },
  {
    q: "Which glass can the systems take?",
    a: "Single glazing, double-glazed units (DGU) and laminated glass. The glass thickness each system accepts is listed against it in the range above.",
  },
  {
    q: "Can you work with my architect?",
    a: "Yes. We work with architects, interior designers and developers on system selection, material and dimensional coordination, and installation.",
  },
  {
    q: "Do you also install?",
    a: "Yes. Specialist-trained installation teams follow Madio's installation protocols: weather-sealing, alignment, hardware calibration and protection of surrounding finishes, followed by a quality audit and sign-off.",
  },
];

// --------------- Form ---------------

const inputCls =
  "w-full border border-[#EBE8E2] px-4 py-3 text-sm bg-[#F4F1EA] focus:bg-white focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] font-light text-[#121212] placeholder-[#6B6B6B]/60 transition-colors";
const labelCls = "text-[10px] uppercase tracking-wider text-[#6B6B6B] font-sans font-semibold block mb-1.5";

const EnquiryForm: React.FC<{
  idPrefix: string;
  placement: string;
  requirement: string;
  onRequirement: (v: string) => void;
}> = ({ idPrefix, placement, requirement, onRequirement }) => {
  const [form, setForm] = useState({ name: "", phone: "", location: "", stage: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const id = (f: string) => `${idPrefix}-${f}`;

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
        message: [brief, `Form: ${placement}`, ...Object.entries(tracking).map(([k, v]) => `${k}: ${v}`)].join("\n"),
        phone: form.phone,
        projectLocation: form.location,
        productInterest: requirement,
        projectStage: form.stage,
        source: LEAD_SOURCE,
        landingPage: window.location.pathname,
        formPlacement: placement,
        ...tracking,
      });
      await fetch(apiUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setStatus("sent");
      track("generate_lead", { form: LEAD_SOURCE, placement, requirement: requirement || "Not specified" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-8 flex flex-col items-center gap-4" role="status">
        <CheckCircle size={40} className="text-[#C5A059]" />
        <h3 className="text-2xl font-serif font-light text-[#121212]">Thank you, {form.name.split(" ")[0] || "we have your details"}.</h3>
        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed max-w-sm">
          The Madio Doors & Windows team will call you on {form.phone}. If you have drawings or photos of the openings, share them on WhatsApp.
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
      <div className="py-2" role="alert">
        <h3 className="text-xl font-serif font-light text-[#121212] mb-3">Send your enquiry on WhatsApp or email</h3>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id("name")} className={labelCls}>Full name *</label>
          <input id={id("name")} name="name" required autoComplete="name" value={form.name} onChange={set} className={inputCls} />
        </div>
        <div>
          <label htmlFor={id("phone")} className={labelCls}>Mobile number *</label>
          <input
            id={id("phone")}
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
      </div>
      <div>
        <label htmlFor={id("location")} className={labelCls}>Project location *</label>
        <input id={id("location")} name="location" required placeholder="e.g. Kokapet, Hyderabad" value={form.location} onChange={set} className={inputCls} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id("requirement")} className={labelCls}>Looking for</label>
          <select id={id("requirement")} name="requirement" value={requirement} onChange={(e) => onRequirement(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            {requirementOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={id("stage")} className={labelCls}>Project stage</label>
          <select id={id("stage")} name="stage" value={form.stage} onChange={set} className={inputCls}>
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
        {status === "sending" ? "Sending..." : (<>Get a Project Quote <Send size={12} /></>)}
      </button>
      <p className="text-[11px] text-[#6B6B6B] font-light leading-relaxed">
        We use these details only to respond to your enquiry. Quotations are prepared per project after measurement.
      </p>
    </form>
  );
};

// --------------- Page building blocks ---------------

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = "", children }) => (
  <section id={id} className={`scroll-mt-16 py-16 md:py-20 px-5 md:px-12 ${className}`}>
    <div className="max-w-7xl mx-auto">{children}</div>
  </section>
);

const Heading: React.FC<{ eyebrow: string; title: React.ReactNode; intro?: string; dark?: boolean }> = ({ eyebrow, title, intro, dark }) => (
  <div className="max-w-3xl mb-10">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className={`text-2xl md:text-4xl font-serif font-light leading-tight ${dark ? "text-white" : "text-[#121212]"}`}>{title}</h2>
    {intro && <p className={`text-sm font-light leading-relaxed mt-4 ${dark ? "text-[#C4B9A8]" : "text-[#6B6B6B]"}`}>{intro}</p>}
  </div>
);

const QuoteButton: React.FC<{ onClick: () => void; children?: React.ReactNode; light?: boolean }> = ({ onClick, children = "Get a Project Quote", light }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium transition-colors ${
      light ? "bg-[#C5A059] text-white hover:bg-white hover:text-[#121212]" : "bg-[#C5A059] text-white hover:bg-[#121212]"
    }`}
  >
    {children} <ArrowRight size={12} />
  </button>
);

export const DWAdLanding: React.FC = () => {
  usePageMeta(
    "Ultra-Slim Aluminium Windows & Doors in Hyderabad | Madio",
    `Ultra-slim aluminium sliding, casement and folding windows and doors: interlocks from ${dwMinInterlock}, heights up to ${dwMaxHeight}, imported European hardware and a ${warrantyLabel} warranty per system. Get a project quote from Madio.`,
    { noindex: true },
  );

  const [requirement, setRequirement] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const waLink = useMemo(() => dwWhatsAppLink(WA_TEXT), []);

  const goToForm = (req?: string, placement = "cta") => {
    if (req) setRequirement(req);
    track("quote_cta_click", { placement });
    scrollToId("enquire");
    window.setTimeout(() => document.getElementById("hero-name")?.focus({ preventScroll: true }), 600);
  };

  return (
    <div className="bg-[#F4F1EA] min-h-screen pb-16 md:pb-0">
      {/* Header: logo, in-page anchors and direct contact. No site navigation. */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 flex items-center justify-between gap-6">
          {dwLogo ? (
            <img src={dwLogo} alt="Madio Doors & Windows" width={900} height={268} className="h-9 md:h-10 w-auto" />
          ) : (
            <span className="text-[11px] tracking-[0.3em] uppercase font-sans text-white">Madio Doors & Windows</span>
          )}
          <nav aria-label="On this page" className="hidden lg:flex items-center gap-6">
            {sectionNav.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/60 hover:text-white">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={PHONE_TEL}
              onClick={() => track("phone_click", { placement: "header" })}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-sans text-white border border-white/30 px-3 py-2 hover:border-white transition-colors"
            >
              <Phone size={13} /> <span className="hidden sm:inline">{PHONE_DISPLAY}</span><span className="sm:hidden">Call</span>
            </a>
            <button
              type="button"
              onClick={() => goToForm(undefined, "header")}
              className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-sans text-white bg-[#C5A059] px-4 py-2 hover:bg-white hover:text-[#121212] transition-colors"
            >
              Get a Quote
            </button>
          </div>
        </div>
      </header>

      {/* Hero with the enquiry form above the fold. */}
      <section className="relative bg-[#121212] overflow-hidden">
        {heroPhoto && (
          <img src={heroPhoto.src} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-50" fetchPriority="high" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-[#121212]/30" />
        <Hatch opacity={0.05} />
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Eyebrow>Less frame. More view.</Eyebrow>
            <h1 className="text-4xl md:text-[3.4rem] font-serif font-light text-white leading-[1.08] mb-6">
              Ultra-slim aluminium <span className="italic text-[#C5A059]">windows & doors</span> for modern homes
            </h1>
            <p className="text-sm md:text-base text-[#C4B9A8] font-light leading-relaxed max-w-xl mb-8">
              Sliding, casement and slide-and-fold systems in 6063-T5 architectural-grade aluminium, with interlocks from {dwMinInterlock}, windows up to {dwMaxHeight} high and imported European hardware with multi-point locking. Designed, measured and installed by Madio in Hyderabad.
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

          <div id="enquire" className="lg:col-span-5 bg-white p-6 md:p-8 scroll-mt-20 shadow-2xl">
            <h2 className="text-2xl font-serif font-light text-[#121212] mb-1">Get a quote for your project</h2>
            <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-5">
              Share a few details. We will call to understand the openings, recommend systems and arrange measurement.
            </p>
            <ul className="flex flex-wrap gap-2 mb-5">
              {["System selection", "Site measurement", "Itemised quotation"].map((t) => (
                <li key={t} className="text-[10px] uppercase tracking-[0.12em] font-sans text-[#121212] bg-[#F4F1EA] px-2.5 py-1.5">{t}</li>
              ))}
            </ul>
            <EnquiryForm idPrefix="hero" placement="hero" requirement={requirement} onRequirement={setRequirement} />
          </div>
        </div>
      </section>

      {/* Overview: the three brand pillars and who it is for. */}
      <Section id="overview" className="bg-white">
        <Heading
          eyebrow="Overview"
          title={<>Aluminium systems for homes where <span className="italic text-[#C5A059]">the view matters.</span></>}
          intro="Madio Doors & Windows works with homeowners, architects and designers to choose the right system for each opening, then measures, supplies and installs it. Every system is custom-engineered to Madio's specification."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#EBE8E2] border border-[#EBE8E2] mb-10">
          {dwPillars.map((p) => (
            <div key={p.title} className="bg-white p-7">
              <div className="w-6 h-[2px] bg-[#C5A059] mb-5" />
              <h3 className="text-lg font-serif font-light text-[#121212] mb-2">{p.title}</h3>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6B6B6B] mb-3">Built for</p>
            <ul className="flex flex-wrap gap-2">
              {dwProjectTypes.map((t) => (
                <li key={t} className="text-xs font-sans text-[#121212] border border-[#EBE8E2] px-3 py-1.5">{t}</li>
              ))}
            </ul>
          </div>
          <QuoteButton onClick={() => goToForm(undefined, "overview")} />
        </div>
      </Section>

      {/* Key features: hard figures from the catalogue. */}
      <Section id="features">
        <Heading eyebrow="Key Features" title="The numbers behind the slim look." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {keyFeatures.map((f) => (
            <div key={f.title} className="bg-white border border-[#EBE8E2] p-4 md:p-6">
              <p className="text-xl md:text-2xl font-serif text-[#C5A059] mb-2 md:mb-3">{f.figure}</p>
              <h3 className="text-base font-serif text-[#121212] mb-1.5">{f.title}</h3>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* The range: every system with its own figures. */}
      <Section id="range" className="bg-white">
        <Heading
          eyebrow="Product Range"
          title="A system for every opening."
          intro={`${dwSystems.length} systems in the 2026 catalogue. Each one below lists its own figures, so you can see what fits before we meet.`}
        />
        <div className="space-y-6">
          {rangeGroups.map((g) => (
            <article key={g.id} className="grid grid-cols-1 lg:grid-cols-12 border border-[#EBE8E2] bg-[#FAFAF7]">
              <figure className="relative lg:col-span-4 h-60 lg:h-auto min-h-[15rem] bg-[#EBE8E2] overflow-hidden">
                {g.visual ? (
                  <img src={g.visual.src} alt={g.visual.alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Hatch />
                )}
                {g.visual && (
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-[#121212]/70 text-[9px] uppercase tracking-[0.15em] font-sans text-white/80 px-3 py-1.5">
                    Catalogue imagery, illustrative
                  </figcaption>
                )}
              </figure>
              <div className="lg:col-span-8 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-2xl font-serif font-light text-[#121212] mb-2">{g.id === "sliding" ? "Sliding Windows & Doors, incl. Large-Format" : g.title}</h3>
                    <p className="text-xs text-[#6B6B6B] font-light leading-relaxed max-w-xl">{g.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToForm(g.title, `range_${g.id}`)}
                    className="shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-white bg-[#121212] px-4 py-2.5 hover:bg-[#C5A059] transition-colors self-start"
                  >
                    Get a quote <ArrowRight size={11} />
                  </button>
                </div>
                {g.id === "partitions" ? (
                  <ul className="flex flex-wrap gap-2">
                    {g.systems.map((s) => (
                      <li key={s.id} className="text-xs font-sans text-[#121212] bg-white border border-[#EBE8E2] px-3 py-1.5">
                        {s.name.replace("Madio ", "")} <span className="text-[#6B6B6B]">· {s.specs.glassThickness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="divide-y divide-[#EBE8E2] border-t border-[#EBE8E2]">
                    {g.systems.map((s) => (
                      <li key={s.id} className="py-3 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                        <div className="md:w-48 shrink-0">
                          <Link to={`${DW_BASE}/${s.id}`} className="text-sm font-serif text-[#121212] hover:text-[#C5A059]">{s.name.replace("Madio ", "")}</Link>
                          <p className="text-[10px] text-[#6B6B6B] font-sans">{s.tagline}</p>
                        </div>
                        <ul className="flex flex-wrap gap-1.5">
                          {specChips(s).map((c) => (
                            <li key={c} className="text-[10px] font-sans text-[#121212] bg-white border border-[#EBE8E2] px-2 py-1">{c}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Mid-page quote band. */}
      <section className="relative bg-[#121212] px-5 md:px-12 py-12 overflow-hidden">
        <Hatch opacity={0.06} />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-2">Not sure which system fits?</h2>
            <p className="text-sm text-[#C4B9A8] font-light">Tell us the rooms and the openings. We will recommend a system for each and prepare an itemised quotation.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <QuoteButton light onClick={() => goToForm(undefined, "mid_band")} />
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { placement: "mid_band" })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium border border-white/40 text-white hover:border-white transition-colors"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Finishes, glass and hardware. */}
      <Section id="finishes">
        <Heading eyebrow="Finishes, Glass & Hardware" title="Matched to your material palette." intro="Profiles, glazing, hardware and finish are chosen together, so the system supports the design of the home." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {finishes.map((f) => (
            <div key={f.title} className="bg-white border border-[#EBE8E2] p-7">
              <h3 className="text-lg font-serif font-light text-[#121212] mb-2">{f.title}</h3>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#EBE8E2] p-7">
            <h3 className="text-lg font-serif font-light text-[#121212] mb-3">Glass</h3>
            <ul className="flex flex-wrap gap-2 mb-3">
              {["Single glazing", "Double-glazed units (DGU)", "Laminated"].map((t) => (
                <li key={t} className="text-xs font-sans text-[#121212] bg-[#F4F1EA] px-3 py-1.5">{t}</li>
              ))}
            </ul>
            <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">Glass thickness from 5 mm up to {maxGlass} mm, depending on the system. Glass partitions use toughened glass.</p>
          </div>
          <div className="bg-white border border-[#EBE8E2] p-7">
            <h3 className="text-lg font-serif font-light text-[#121212] mb-1">{dwHardwarePro.name}</h3>
            <p className="text-xs italic text-[#6B6B6B] mb-3">{dwHardwarePro.tagline}</p>
            <ul className="flex flex-wrap gap-2 mb-3">
              {dwHardwarePro.highlights.map((t) => (
                <li key={t} className="text-xs font-sans text-[#121212] bg-[#F4F1EA] px-3 py-1.5">{t}</li>
              ))}
            </ul>
            <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">Imported European hardware in powder-coated or chrome finish.</p>
          </div>
        </div>
      </Section>

      {/* Applications: where each configuration fits. */}
      <Section id="applications" className="bg-white">
        <Heading eyebrow="Applications" title="Where each configuration fits." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EBE8E2] border border-[#EBE8E2]">
          {windowDoorTypologies.map((t) => (
            <div key={t.configuration} className="bg-white p-7">
              <h3 className="text-lg font-serif font-light text-[#121212] mb-2">{t.configuration}</h3>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{t.application.replace(/;/g, ",")}.</p>
            </div>
          ))}
        </div>
        {openingTypesPdf?.file && (
          <a
            href={openingTypesPdf.file}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("brochure_download", { file: openingTypesPdf.id })}
            className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between border border-[#121212] p-5 hover:bg-[#121212] hover:text-white group transition-colors"
          >
            <span>
              <span className="block text-base font-serif text-[#121212] group-hover:text-white">{openingTypesPdf.title}</span>
              <span className="block text-xs text-[#6B6B6B] font-light group-hover:text-white/70">Elevations of sliding, slide & fold, bi-fold, casement, fixed and door configurations. {openingTypesPdf.fileFormat}.</span>
            </span>
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059]">
              <Download size={14} /> Download PDF
            </span>
          </a>
        )}
      </Section>

      {/* Material comparison, from the catalogue. */}
      <Section>
        <Heading eyebrow="Why Aluminium" title="Aluminium, uPVC and wood compared." />
        <div className="overflow-x-auto border border-[#EBE8E2] bg-white">
          <table className="w-full text-xs min-w-[640px]">
            <caption className="sr-only">Aluminium compared with wood and uPVC</caption>
            <thead>
              <tr className="bg-[#121212] text-white">
                {["", "Aluminium", "uPVC", "Wood"].map((h, i) => (
                  <th key={h || "param"} scope="col" className={`text-left font-sans font-medium uppercase tracking-[0.1em] text-[10px] px-4 py-3 ${i === 1 ? "text-[#C5A059]" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((r, i) => (
                <tr key={r.parameter} className={i % 2 ? "bg-[#F4F1EA]/60" : ""}>
                  <th scope="row" className="text-left px-4 py-3 font-medium text-[#121212] whitespace-nowrap align-top">{r.parameter}</th>
                  <td className="px-4 py-3 text-[#121212] align-top">{r.aluminium}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] font-light align-top">{r.upvc}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] font-light align-top">{r.wood}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Standards grid. */}
      <section className="relative bg-[#121212] py-16 md:py-20 px-5 md:px-12 overflow-hidden">
        <Hatch opacity={0.06} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Heading dark eyebrow="Specification" title="Standards on every system." />
          <dl className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {[...standards, { standard: "Warranty", specification: `${DW_WARRANTY} per system` }].map((s) => (
              <div key={s.standard} className="bg-[#121212] p-6">
                <dt className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C4B9A8] mb-2">{s.standard}</dt>
                <dd className="text-base font-serif text-white">{s.specification}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Installed work: only photos captioned as Madio installations. */}
      {installed.length > 0 && (
        <Section id="projects" className="bg-white">
          <Heading eyebrow="Projects" title="Installed by Madio." />
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
        </Section>
      )}

      {/* Process: what happens after the enquiry. */}
      <Section>
        <Heading eyebrow="How it works" title="From enquiry to handover." />
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
      </Section>

      {/* FAQ: answers come from the catalogue data only. */}
      <Section className="bg-white">
        <div className="max-w-3xl mx-auto">
          <Heading eyebrow="Questions" title="Before you enquire." />
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
      </Section>

      {/* Closing: a second form, so nobody has to scroll back up. */}
      <section className="relative bg-[#121212] py-16 md:py-20 px-5 md:px-12 overflow-hidden">
        <Hatch opacity={0.05} />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white leading-tight mb-5">
              Let the architecture <span className="italic text-[#C5A059]">lead.</span>
            </h2>
            <p className="text-sm text-[#C4B9A8] font-light leading-relaxed mb-8 max-w-md">
              Share the openings and the stage your project is at. We will recommend the systems and arrange measurement when you are ready.
            </p>
            <div className="space-y-3 text-sm">
              <a href={PHONE_TEL} onClick={() => track("phone_click", { placement: "closing" })} className="flex items-center gap-3 text-white hover:text-[#C5A059]">
                <Phone size={16} /> {PHONE_DISPLAY}
              </a>
              <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { placement: "closing" })} className="flex items-center gap-3 text-white hover:text-[#C5A059]">
                <MessageCircle size={16} /> WhatsApp us
              </a>
              <a href={`mailto:${DW_EMAIL}`} className="flex items-center gap-3 text-white hover:text-[#C5A059]">
                <Mail size={16} /> {DW_EMAIL}
              </a>
            </div>
          </div>
          <div className="lg:col-span-6 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-serif font-light text-[#121212] mb-5">Quick enquiry</h2>
            <EnquiryForm idPrefix="close" placement="closing" requirement={requirement} onRequirement={setRequirement} />
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
        <button type="button" onClick={() => goToForm(undefined, "sticky")} className="flex items-center justify-center gap-1.5 py-4 bg-[#C5A059] text-white uppercase tracking-[0.15em]">
          Get Quote
        </button>
      </div>
    </div>
  );
};
