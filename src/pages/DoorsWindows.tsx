import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  dwCategories,
  dwSystems,
  getCategoryPhotos,
  getSystemComparison,
  getCategoryMeta,
  dwPillars,
  dwPerformanceHighlights,
  dwMinInterlock,
  dwMaxHeight,
  dwAsset,
  dwRenderAsset,
  DW_WARRANTY,
} from "../data/doorsWindows";
import type { DWCategoryMeta } from "../data/doorsWindows";
import { usePageMeta } from "../hooks/usePageMeta";
import { breadcrumbJsonLd } from "../lib/seo";
import {
  DW_BASE,
  DW_POSITIONING,
  dwApplicationGroups,
  dwArchitectServices,
  dwProjects,
  hasPublicPage,
} from "../data/dwArchitect";
import { ConsultBand, DataTable, RenderFeature } from "../components/dw/DWUI";
import { DW_RENDER_NOTE, dwFeatureRenders } from "../data/dwRenders";
import { responsiveImg } from "../lib/image";

const DW_ACCENT = "#C5A059";
const dwLogo = dwAsset("dw-logo");
const heroRender = dwRenderAsset("facade-villa");

// Why MADIO D&W — reworded from the source catalogue PDF to remove
// "manufacturer" framing and the blanket 15-Year Warranty claim.
const whyPoints = [
  `Ultra-slim aluminium profiles — interlock sightlines as narrow as ${dwMinInterlock} — maximising glass area and delivering unobstructed panoramic views.`,
  "Imported European hardware on every system, ensuring precision tolerances, smooth long-life operation, and elevated tactile quality.",
  "Complete technical support — from architectural shop drawings through to on-site installation supervision.",
  "Custom finish library: any RAL shade in premium powder-coat, or bright and matte anodized profiles for a timeless architectural finish.",
  `${DW_WARRANTY.replace(" Years", "-year")} warranty coverage confirmed per system, backed by rigorous quality assurance at every stage.`,
];

// Lead proof points for the hero, per the brand brief: ultra-slim profiles,
// imported hardware, warranty.
const heroProofPoints = [
  { figure: dwMinInterlock, label: "Ultra-slim interlock" },
  { figure: dwMaxHeight, label: "Max window height" },
  { figure: "Imported", label: "European hardware" },
  { figure: DW_WARRANTY, label: "Warranty per system" },
];

const OliveTexture: React.FC<{ className?: string; opacity?: string }> = ({
  className = "",
  opacity = "0.06",
}) => (
  <div
    className={`absolute inset-0 ${className}`}
    style={{
      backgroundImage:
        "repeating-linear-gradient(45deg, #C5A059 0, #C5A059 1px, transparent 0, transparent 50%)",
      backgroundSize: "20px 20px",
      opacity,
    }}
  />
);

// Category card — links to /doors-windows/[slug]. Mirrors FurnitureLanding's
// CategoryCard so both verticals present catalogues the same way.
//
// isPopulated tracks the static catalogue only (whether the client has
// confirmed full specs for this system) — independent of whether the client
// has uploaded any photos via /admin/upload. An un-populated category with
// client photos still shows real content here instead of "Coming Soon",
// same as Bar Chairs would in Furniture once it has real photos.
const CategoryCard: React.FC<{ cat: DWCategoryMeta; index: number }> = ({ cat, index }) => {
  const system = dwSystems.find((s) => s.id === cat.id);
  const clientPhotos = getCategoryPhotos(cat.id);
  const thumbnail = cat.isPopulated ? (system?.images[0] ?? system?.visual?.src) : clientPhotos[0]?.secureUrl;
  const isAvailable = cat.isPopulated || clientPhotos.length > 0;

  return (
    <Link
      to={`/doors-windows/${cat.id}`}
      className="group relative flex flex-col overflow-hidden border border-[#EBE8E2] bg-white hover:border-[#C5A059]/30 transition-all duration-500 reveal-on-scroll"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-52 overflow-hidden shrink-0" style={{ backgroundColor: "#EBE8E2" }}>
        {thumbnail ? (
          <img
            {...responsiveImg(thumbnail, "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", 600)}
            alt={system?.images[0] ? cat.name : system?.visual?.alt ?? cat.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <OliveTexture />
        )}
        <div className="absolute inset-0 bg-[#C5A059]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {!isAvailable && (
          <div className="absolute top-3 right-3 text-[8px] uppercase tracking-[0.25em] font-sans border border-[#2A2A2A] text-[#C4B9A8] px-2.5 py-1">
            Coming Soon
          </div>
        )}
        {isAvailable && (
          <div
            className="absolute top-3 right-3 text-[8px] uppercase tracking-[0.25em] font-sans px-2.5 py-1"
            style={{ backgroundColor: DW_ACCENT, color: "#fff" }}
          >
            Available
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="w-6 h-[2px] mb-0 transition-all duration-300 group-hover:w-10"
            style={{ backgroundColor: DW_ACCENT }}
          />
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-serif font-light text-[#121212] mb-2 group-hover:text-[#C5A059] transition-colors duration-300">
          {cat.name}
        </h3>
        <p className="text-xs text-[#6B6B6B] font-light leading-relaxed flex-grow">
          {system?.tagline ?? cat.description}
        </p>
        <div className="flex items-center space-x-1.5 mt-5 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059]">
          <span>{isAvailable ? "Explore" : "View"}</span>
          <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};

export const DoorsWindows: React.FC = () => {
  usePageMeta(
    "Madio Doors & Windows | Architectural Aluminium Systems, Hyderabad",
    "Premium architectural aluminium by Madio: ultra-slim sliding systems, casement doors and windows, glass partitions and motorised integrated blinds, with imported European hardware and a " + DW_WARRANTY.replace(" Years", "-year") + " warranty per system.",
    {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Madio", path: "/" },
          { name: "Doors & Windows", path: DW_BASE },
        ]),
      ],
    }
  );

  const comparisonRows = getSystemComparison();

  return (
  <div className="bg-[#F4F1EA]">

    {/* ================================================================
        HERO
        ================================================================ */}
    <section className="relative min-h-[95vh] flex items-center justify-center bg-[#121212] overflow-hidden pt-32 pb-28">
      <div className="absolute inset-0 z-0">
        {heroRender && (
          <img src={heroRender} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C5A059 0, #C5A059 1px, transparent 0, transparent 50%)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-[#121212]/30 to-[#121212]/60" />
      </div>
      {heroRender && (
        <span className="absolute bottom-4 right-4 z-10 text-[9px] uppercase tracking-[0.25em] font-sans text-white/50">
          Render, not a Madio installation
        </span>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center text-white flex flex-col items-center">
        {dwLogo ? (
          <img src={dwLogo} alt="Madio Doors & Windows" width={900} height={268} className="w-52 md:w-72 h-auto mb-6 animate-fade-in" />
        ) : (
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans text-[#EBE8E2] mb-8">{DW_POSITIONING.eyebrow}</span>
        )}
        <p className="text-[11px] md:text-xs tracking-[0.35em] uppercase font-sans text-[#C4B9A8] mb-6">
          {DW_POSITIONING.line}
        </p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide leading-[1.1] mb-6 animate-fade-in-up">
          Designed for Architecture. <br />
          <span className="italic font-normal text-[#C5A059]">Engineered for Living.</span>
        </h1>

        <p className="text-sm md:text-lg tracking-wider font-light text-[#F4F1EA]/95 max-w-2xl mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Premium aluminium doors and windows shaped around architectural intent, material choice and the experience of living with the finished space.
        </p>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#C5A059]/30 border border-[#C5A059]/30 mb-12 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {heroProofPoints.map((p) => (
            <div key={p.label} className="bg-[#121212] px-3 py-4 md:px-6 md:py-5">
              <dt className="sr-only">{p.label}</dt>
              <dd className="text-lg md:text-2xl font-serif font-light text-[#C5A059] leading-none mb-2">{p.figure}</dd>
              <dd className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-sans text-[#EBE8E2]/80">{p.label}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col sm:flex-row items-center gap-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link
            to={`${DW_BASE}/consultation`}
            className="w-full sm:w-auto px-10 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium bg-[#C5A059] text-white hover:bg-white hover:text-[#121212] transition-all duration-300 shadow-md text-center"
          >
            Discuss Your Project
          </Link>
          <Link
            to={`${DW_BASE}/systems`}
            className="w-full sm:w-auto px-10 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium border border-white text-white hover:bg-white hover:text-[#121212] transition-all duration-300 text-center"
          >
            Explore Architectural Systems
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-white/60 animate-bounce">
        <span className="text-[9px] uppercase tracking-[0.25em] mb-2 font-sans font-light">Scroll Down</span>
        <ChevronDown size={14} />
      </div>
    </section>

    {/* ================================================================
        ABOUT — reworded to remove the "premium manufacturer" claim.
        Madio custom-engineers systems to spec; it does not manufacture
        in-house, and the production partner is not named publicly.
        ================================================================ */}
    <section className="bg-[#F4F1EA] border-t border-[#EBE8E2] py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-5" style={{ color: DW_ACCENT }}>
          About Madio Doors &amp; Windows
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-light text-[#121212] leading-snug mb-6">
          An architectural systems partner, not a frame supplier.
        </h2>
        <p className="text-base text-[#121212] font-light leading-relaxed mb-6">
          {DW_POSITIONING.support}
        </p>
        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-4">
          Madio Doors &amp; Windows offers custom-engineered architectural aluminium fenestration systems, made to Madio's exacting specifications for the modern built environment. Founded on the principles of minimalist design, engineering precision, and uncompromising performance, Madio delivers solutions that transform spaces while standing the test of time.
        </p>
        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">
          We believe that every window and door is more than a structural element — it is a design statement, a barrier against the elements, and a gateway to natural light and panoramic views. Our systems are trusted by leading architects, discerning builders, and homeowners who refuse to compromise.
        </p>
      </div>
    </section>

    {/* ================================================================
        PHILOSOPHY — the three brand values from the brand brief.
        ================================================================ */}
    <section className="bg-[#121212] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
          Philosophy
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-white leading-tight mb-12">
          Less frame. <span className="italic font-normal text-[#C5A059]">More architecture.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2A2A2A]">
          {dwPillars.map((p, i) => (
            <div key={p.title} className="bg-[#121212] p-8 reveal-on-scroll">
              <span className="text-[10px] font-mono text-[#C5A059] block mb-4">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-xl font-serif font-light text-white mb-3">{p.title}</h3>
              <p className="text-sm text-[#C4B9A8] font-light leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ================================================================
        PRODUCT FAMILIES — the four families named in the brand brief,
        each linking to the catalogue systems that belong to it.
        ================================================================ */}
    <section className="border-t border-[#EBE8E2] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
          The Range
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-[#121212] leading-tight mb-12">
          Systems by <span className="italic font-normal">application</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dwApplicationGroups.filter((g) => g.id !== "also").slice(0, 4).map((f) => {
            const links = f.systemIds
              .filter((id) => hasPublicPage(id))
              .map((id) => getCategoryMeta(id))
              .filter((m): m is DWCategoryMeta => !!m);
            return (
              <div key={f.title} className="bg-white border border-[#EBE8E2] p-6 flex flex-col">
                <div className="w-6 h-[2px] mb-5" style={{ backgroundColor: DW_ACCENT }} />
                <h3 className="text-lg font-serif font-light text-[#121212] mb-2">{f.title}</h3>
                <p className="text-xs text-[#6B6B6B] font-light leading-relaxed flex-grow">{f.body}</p>
                <div className="mt-5 pt-4 border-t border-[#EBE8E2]">
                  {links.length > 0 ? (
                    <ul className="space-y-1.5">
                      {links.map((m) => (
                        <li key={m.id}>
                          <Link
                            to={`/doors-windows/${m.id}`}
                            className="text-[11px] text-[#121212] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1.5"
                          >
                            {m.name} <ArrowRight size={10} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Link
                      to={`${DW_BASE}/consultation?interest=${encodeURIComponent(f.title)}`}
                      className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5"
                    >
                      Enquire <ArrowRight size={10} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ================================================================
        CATEGORY GRID — 6 populated systems + 6 categories pending
        full client specification.
        ================================================================ */}
    <section id="systems" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div className="mb-12">
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
          Product Portfolio
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-[#121212] leading-tight">
          Our Fenestration <span className="italic font-normal">Systems</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Systems with neither confirmed specs nor photos are hidden until they have content. */}
        {dwCategories
          .filter((cat) => cat.isPopulated || getCategoryPhotos(cat.id).length > 0)
          .map((cat, i) => (
          <CategoryCard key={cat.id} cat={cat} index={i} />
        ))}
      </div>
    </section>

    {/* ================================================================
        PERFORMANCE — acoustic, thermal and wind load, per the brand brief.
        Figures come from the catalogue data in doorsWindows.ts.
        ================================================================ */}
    <section className="border-t border-[#EBE8E2] bg-[#121212] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
          Technical Performance
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-white leading-tight mb-12">
          Quiet, temperate, <span className="italic font-normal text-[#C5A059]">unmoved.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2A2A2A]">
          {dwPerformanceHighlights.map((h) => (
            <div key={h.title} className="bg-[#121212] p-8">
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#C4B9A8] block mb-4">{h.title}</span>
              <p className="text-2xl md:text-3xl font-serif font-light text-[#C5A059] mb-4">{h.figure}</p>
              <p className="text-sm text-[#C4B9A8] font-light leading-relaxed">{h.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ================================================================
        SYSTEM COMPARISON AT A GLANCE — from the catalogue PDF
        ================================================================ */}
    <section className="border-t border-[#EBE8E2] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
            At A Glance
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-[#121212]">
            Window &amp; Door Systems Compared
          </h2>
          <p className="text-xs text-[#6B6B6B] font-light mt-3">From the Madio 2026 product catalogue. Glass partitions are compared on the Design &amp; Materials page.</p>
        </div>
        <DataTable
          headers={["System", "Max Height", "Max Width", "Glass", "Interlock", "Rollers", "Locking"]}
          rows={comparisonRows.map((r) => [r.system, r.maxHeight, r.maxWidth, r.glass, r.interlock, r.loadCapacity, r.locking])}
        />
      </div>
    </section>

    {/* ================================================================
        PIVOT & FRENCH DOORS — client-supplied renders, not installations.
        No system page: these opening types are not in the 2026 catalogue.
        ================================================================ */}
    {dwFeatureRenders.length > 0 && (
      <section className="border-t border-[#EBE8E2] bg-[#121212] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
            Pivot &amp; French Doors
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-white leading-tight mb-4">
            Entrances, <span className="italic font-normal text-[#C5A059]">visualised.</span>
          </h2>
          <p className="text-sm text-[#C4B9A8] font-light leading-relaxed max-w-2xl mb-10">
            Pivot and French door openings are among the 49 opening types. Ask us about sizes and glazing for your project.
          </p>
          <RenderFeature renders={dwFeatureRenders} note={DW_RENDER_NOTE} />
        </div>
      </section>
    )}

    {/* ================================================================
        FOR ARCHITECTS — teaser into the dedicated page
        ================================================================ */}
    <section className="border-t border-[#EBE8E2] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
            For Architects &amp; Design Professionals
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#121212] leading-snug mb-6">
            Your architectural vision. <span className="italic">Our systems expertise.</span>
          </h2>
          <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-8">
            From system selection to project handover, we work alongside design teams so that every opening complements the architecture and meets its practical requirements.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={`${DW_BASE}/architects`} className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5">
              How we work with design teams <ArrowRight size={11} />
            </Link>
            <Link to={`${DW_BASE}/resources`} className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#121212] hover:text-[#C5A059] inline-flex items-center gap-1.5">
              Technical resources <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        <ol className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#EBE8E2] border border-[#EBE8E2]">
          {dwArchitectServices.map((svc, i) => (
            <li key={svc.title} className={`bg-white p-6 ${i === dwArchitectServices.length - 1 ? "sm:col-span-2" : ""}`}>
              <span className="text-[10px] font-mono text-[#C5A059] block mb-2">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-base font-serif font-light text-[#121212] mb-1">{svc.title}</h3>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{svc.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {dwProjects.filter((p) => !p.isInspiration && p.photos.length > 0).length > 0 && (
      <section className="border-t border-[#EBE8E2] bg-[#121212] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
            Installed
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-white leading-tight mb-10">
            Madio on site, <span className="italic font-normal text-[#C5A059]">not imagined.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dwProjects
              .filter((p) => !p.isInspiration && p.photos.length > 0)
              .slice(0, 2)
              .map((p) => (
                <Link key={p.slug} to={`${DW_BASE}/projects#${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#2A2A2A]">
                    <img src={p.photos[0].src} alt={p.photos[0].alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="mt-3 text-sm font-serif font-light text-white group-hover:text-[#C5A059] transition-colors">{p.name}</p>
                  <p className="text-[11px] text-[#C4B9A8] font-light">{p.configurations?.join(", ")}</p>
                </Link>
              ))}
          </div>
          <Link to={`${DW_BASE}/projects`} className="mt-10 text-[11px] uppercase tracking-[0.25em] font-sans text-[#C5A059] inline-flex items-center gap-2">
            View projects <ArrowRight size={12} />
          </Link>
        </div>
      </section>
    )}

    {/* Material comparison, typologies, process, performance standards and
        aluminium advantages moved to /doors-windows/design-materials and
        /doors-windows/architects — same data, nothing removed from the site. */}
    <section className="border-t border-[#EBE8E2] py-14 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <p className="text-sm text-[#6B6B6B] font-light max-w-xl">
          Profiles, glazing, hardware, finishes, opening configurations and the case for aluminium, in one place.
        </p>
        <Link to={`${DW_BASE}/design-materials`} className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5 shrink-0">
          Explore design &amp; materials <ArrowRight size={11} />
        </Link>
      </div>
    </section>

    {/* ================================================================
        WHY MADIO DOORS & WINDOWS
        ================================================================ */}
    <section className="bg-[#F4F1EA]/50 border-t border-[#EBE8E2] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-5" style={{ color: DW_ACCENT }}>
            Why Madio Doors and Windows
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#121212] leading-snug">
            The standard for premium fenestration in India.
          </h2>
        </div>
        <div className="space-y-5">
          {whyPoints.map((point, i) => (
            <div key={i} className="flex items-start space-x-4">
              <span className="text-[10px] font-mono text-[#C5A059] font-medium mt-0.5 shrink-0 w-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <ConsultBand />

  </div>
  );
};
