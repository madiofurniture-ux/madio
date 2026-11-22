// Shared building blocks for the Madio Doors & Windows pages, so every page
// in the division reads as one system: same hero, section heading, table
// and closing consultation band.
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { DW_BASE, dwWhatsAppLink } from "../../data/dwArchitect";

export const DW_ACCENT = "#C5A059";

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span
    className={`text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4 ${className}`}
    style={{ color: DW_ACCENT }}
  >
    {children}
  </span>
);

export const Hatch: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage:
        "repeating-linear-gradient(45deg, #C5A059 0, #C5A059 1px, transparent 0, transparent 50%)",
      backgroundSize: "24px 24px",
      opacity,
    }}
  />
);

/** Dark page hero used by every D&W sub-page. */
export const DWPageHero: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  breadcrumb?: string;
  children?: React.ReactNode;
}> = ({ eyebrow, title, intro, breadcrumb, children }) => (
  <section className="relative bg-[#121212] pt-36 pb-20 px-6 md:px-12 overflow-hidden">
    <Hatch opacity={0.08} />
    <div className="relative z-10 max-w-7xl mx-auto">
      <nav aria-label="Breadcrumb" className="mb-8 text-[10px] uppercase tracking-[0.2em] font-sans text-white/50">
        <Link to={DW_BASE} className="hover:text-[#C5A059] transition-colors">Doors &amp; Windows</Link>
        {breadcrumb && (
          <>
            <span className="mx-2">/</span>
            <span className="text-white/80">{breadcrumb}</span>
          </>
        )}
      </nav>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.1] mb-6 max-w-4xl">{title}</h1>
      <p className="text-sm md:text-base text-[#C4B9A8] font-light leading-relaxed max-w-2xl">{intro}</p>
      {children}
    </div>
  </section>
);

export const SectionHeading: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  dark?: boolean;
}> = ({ eyebrow, title, intro, dark }) => (
  <div className="mb-10 md:mb-12">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className={`text-2xl md:text-4xl font-serif font-light leading-tight ${dark ? "text-white" : "text-[#121212]"}`}>
      {title}
    </h2>
    {intro && (
      <p className={`text-sm font-light leading-relaxed max-w-2xl mt-4 ${dark ? "text-[#C4B9A8]" : "text-[#6B6B6B]"}`}>
        {intro}
      </p>
    )}
  </div>
);

export const DataTable: React.FC<{ headers: string[]; rows: string[][]; caption?: string }> = ({ headers, rows, caption }) => (
  <div className="overflow-x-auto border border-[#EBE8E2]">
    <table className="w-full text-xs">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className="bg-[#121212]">
          {headers.map((h) => (
            <th
              key={h}
              scope="col"
              className="text-left font-sans font-medium uppercase tracking-[0.1em] text-[10px] text-white px-4 py-3 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-[#F4F1EA]/60" : "bg-white"}>
            {row.map((cell, j) => (
              <td
                key={j}
                className={`px-4 py-3 align-top ${
                  j === 0 ? "font-medium text-[#121212] whitespace-nowrap" : "text-[#6B6B6B] font-light"
                }`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const PrimaryButton: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({
  to,
  children,
  className = "",
}) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-2 px-10 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium bg-[#C5A059] text-white hover:bg-white hover:text-[#121212] transition-all duration-300 text-center ${className}`}
  >
    {children}
  </Link>
);

/** Closing band on every D&W page: consultation first, WhatsApp as a quiet second option. */
export const ConsultBand: React.FC<{ title?: React.ReactNode; body?: string; system?: string }> = ({
  title = (
    <>
      Discuss your project with <span className="italic text-[#C5A059]">Madio</span>.
    </>
  ),
  body = "Share the drawings, the openings and the stage you are at. We will come back with system recommendations and the next steps.",
  system,
}) => (
  <section className="bg-[#121212] py-20 px-6 md:px-12 text-center">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-serif font-light text-white leading-snug mb-6">{title}</h2>
      <p className="text-sm text-[#C4B9A8] font-light leading-relaxed mb-10">{body}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <PrimaryButton to={`${DW_BASE}/consultation${system ? `?system=${system}` : ""}`} className="w-full sm:w-auto">
          Discuss Your Project <ArrowRight size={12} />
        </PrimaryButton>
        <a
          href={dwWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-white/60 hover:text-white transition-colors"
        >
          <MessageCircle size={14} /> or message us on WhatsApp
        </a>
      </div>
    </div>
  </section>
);

/** Grid of opening-type renders, always captioned as renders. */
export const RenderGallery: React.FC<{
  renders: { src: string; title: string }[];
  note: string;
  dark?: boolean;
}> = ({ renders, note, dark }) => (
  <figure>
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {renders.map((r) => (
        <li key={r.src}>
          <div className="relative aspect-[6/5] overflow-hidden bg-[#EBE8E2]">
            <img src={r.src} alt={`Render: ${r.title}`} loading="lazy" width={396} height={328} className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 text-[8px] uppercase tracking-[0.2em] font-sans bg-[#121212]/80 text-[#C5A059] px-1.5 py-0.5">
              Render
            </span>
          </div>
          <p className={`mt-2 text-[11px] font-light leading-snug ${dark ? "text-[#C4B9A8]" : "text-[#6B6B6B]"}`}>{r.title}</p>
        </li>
      ))}
    </ul>
    <figcaption className={`mt-5 text-[11px] font-light ${dark ? "text-[#C4B9A8]" : "text-[#6B6B6B]"}`}>{note}</figcaption>
  </figure>
);

/** Large renders, uncropped, always captioned as renders. */
export const RenderFeature: React.FC<{
  renders: { src: string; title: string }[];
  note: string;
}> = ({ renders, note }) => (
  <figure>
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renders.map((r) => (
        <li key={r.src}>
          <div className="relative aspect-[896/687] overflow-hidden bg-[#2A2A2A]">
            <img src={r.src} alt={`Render: ${r.title}`} loading="lazy" width={896} height={687} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] font-sans bg-[#121212]/80 text-[#C5A059] px-2 py-1">
              Render
            </span>
          </div>
          <p className="mt-3 text-sm font-serif font-light text-white">{r.title}</p>
        </li>
      ))}
    </ul>
    <figcaption className="mt-6 text-[11px] font-light text-[#C4B9A8]">{note}</figcaption>
  </figure>
);
