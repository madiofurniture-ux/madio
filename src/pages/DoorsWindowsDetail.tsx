import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import {
  dwCategories,
  getCategoryMeta,
  getCategoryPhotos,
  getSystemById,
  isDWCategoryId,
} from "../data/doorsWindows";
import type { DWCategoryPhoto } from "../data/doorsWindows";
import { usePageMeta } from "../hooks/usePageMeta";
import { absoluteUrl, breadcrumbJsonLd } from "../lib/seo";
import { madioProcess } from "../data/doorsWindows";
import { DW_BASE, dwApplicationGroups, hasPublicPage, resourcesForSystem, dwResources } from "../data/dwArchitect";
import { ConsultBand } from "../components/dw/DWUI";
import { responsiveImg } from "../lib/image";

const DW_ACCENT = "#C5A059";

const hasValue = (v: string | undefined): v is string =>
  !!v && v.trim() !== "" && v.trim().toLowerCase() !== "todo";

// Category slugs from the earlier HL-named catalogue, replaced by the 2026
// range. Old links land on the systems overview instead of the home page.
const LEGACY_SLUGS = new Set([
  "hl-vista-slim",
  "hl-50-casement-door",
  "hl-retro-gulf-slim",
  "hl-ultra-slim",
  "hl-eco-gulf-slim",
  "hl-elite-gulf-slim",
  "glass-partitions-doors",
  "casement-windows-openable",
  "sliding-folding-bifold",
]);

// Coming soon state — used for the 6 categories pending full client
// specification. Shows the one confirmed real data point instead of
// inventing specs, matching the pattern used for un-populated Furniture
// categories. Once the client has uploaded photos via /admin/upload for a
// category like this, `photos` replaces the empty placeholder area with a
// real grid — same pattern Bar Chairs uses in Furniture once it has real
// photos — while the rest (confirmed note, enquire CTA) stays, since full
// specs still aren't confirmed even once reference photos exist.
const ComingSoonState: React.FC<{
  categoryId: string;
  confirmedNote?: string;
  panelConfigs?: string[];
  photos?: DWCategoryPhoto[];
}> = ({ categoryId, confirmedNote, panelConfigs, photos = [] }) => (
  <div className="py-24 text-center max-w-xl mx-auto">
    {photos.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-14 text-left">
        {photos.map((p) => (
          <div key={p.productCode} className="relative aspect-square overflow-hidden bg-[#EBE8E2] border border-[#EBE8E2]">
            <img {...responsiveImg(p.secureUrl, "(min-width: 1024px) 33vw, 50vw", 600)} alt={p.productCode} loading="lazy" className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-[8px] font-mono text-white bg-black/50 px-1.5 py-0.5 tracking-wider">
              {p.productCode}
            </span>
          </div>
        ))}
      </div>
    )}

    <div className="w-8 h-[2px] mx-auto mb-8" style={{ backgroundColor: DW_ACCENT }} />

    {(confirmedNote || (panelConfigs && panelConfigs.length > 0)) && (
      <div className="bg-[#F4F1EA] border border-[#EBE8E2] px-6 py-5 mb-10 text-left">
        <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-medium block mb-3" style={{ color: DW_ACCENT }}>
          Confirmed So Far
        </span>
        {confirmedNote && (
          <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-3">{confirmedNote}</p>
        )}
        {panelConfigs && panelConfigs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {panelConfigs.map((cfg) => (
              <span
                key={cfg}
                className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 border text-[#121212] border-[#EBE8E2] bg-white"
              >
                {cfg}
              </span>
            ))}
          </div>
        )}
      </div>
    )}

    <p className="text-xs text-[#6B6B6B] font-light max-w-xs mx-auto mb-10 leading-relaxed">
      {photos.length > 0
        ? "Full technical specifications are still being finalised. Enquire below for pricing and availability."
        : "Full specifications are being finalised with the client. Enquire below and we'll get in touch once they're available."}
    </p>
    <Link
      to={`${DW_BASE}/consultation?system=${categoryId}`}
      className="inline-flex items-center space-x-2 px-8 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: DW_ACCENT }}
    >
      <span>Enquire</span>
      <ArrowRight size={12} />
    </Link>
  </div>
);

export const DoorsWindowsDetail: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const meta = category && isDWCategoryId(category) ? getCategoryMeta(category) : undefined;
  const system = category ? getSystemById(category) : undefined;
  const clientPhotos = category && isDWCategoryId(category) ? getCategoryPhotos(category) : [];
  const isAvailable = !!meta?.isPopulated || clientPhotos.length > 0;

  usePageMeta(
    meta
      ? `${meta.name} | ${system ? `${system.tagline} | ` : ""}Madio Doors & Windows`
      : "Madio Doors & Windows",
    system
      ? `${system.name}, ${system.tagline.toLowerCase()}: ${system.specRows.slice(0, 4).map((r) => `${r.label.toLowerCase()} ${r.value}`).join(", ")}. Madio Doors & Windows, Hyderabad.`
      : meta?.description ?? "Architectural aluminium systems from Madio Doors & Windows.",
    meta
      ? {
          image: system?.images[0] ?? system?.visual?.src,
          jsonLd: [
            breadcrumbJsonLd([
              { name: "Doors & Windows", path: DW_BASE },
              { name: "Architectural Systems", path: `${DW_BASE}/systems` },
              { name: meta.name, path: `${DW_BASE}/${meta.id}` },
            ]),
            ...(system
              ? [
                  {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: system.name,
                    description: system.description,
                    category: "Aluminium doors and windows",
                    brand: { "@type": "Brand", name: "Madio Doors & Windows" },
                    url: absoluteUrl(`${DW_BASE}/${system.id}`),
                    ...(system.images[0] ? { image: system.images[0] } : {}),
                    additionalProperty: system.specRows.map((r) => ({ "@type": "PropertyValue", name: r.label, value: r.value })),
                  },
                ]
              : []),
          ],
        }
      : { noindex: true },
  );

  if (category && LEGACY_SLUGS.has(category)) {
    return <Navigate to={`${DW_BASE}/systems`} replace />;
  }
  // Unknown slug → redirect to landing
  if (!category || !isDWCategoryId(category) || !meta) {
    return <Navigate to="/doors-windows" replace />;
  }

  const isPartition = system?.family === "glass-partitions";
  const photo = system?.images[0];
  const illustration = !photo ? system?.visual : undefined;

  return (
    <div className="bg-[#F4F1EA]">

      {/* ── Header banner ── */}
      <section className="relative bg-[#F4F1EA] pt-32 pb-16 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #C5A059 0, #C5A059 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            to={`${DW_BASE}/systems`}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-sans text-[#6B6B6B] hover:text-[#121212] transition-colors mb-10"
          >
            <ArrowLeft size={13} />
            <span>All Systems</span>
          </Link>

          <div className="max-w-3xl">
            <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium block mb-4" style={{ color: DW_ACCENT }}>
              {isAvailable ? "Product System" : "Coming Soon"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-[#121212] leading-tight mb-4">
              {meta.name}
            </h1>
            <p className="text-sm text-[#6B6B6B] font-light leading-relaxed max-w-xl">
              {system?.tagline ?? meta.description}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {!meta.isPopulated || !system ? (
          <ComingSoonState
            categoryId={meta.id}
            confirmedNote={meta.confirmedNote}
            panelConfigs={meta.panelConfigs}
            photos={clientPhotos}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left: image + description + core features */}
            <div className="lg:col-span-6 space-y-6">
              <figure>
                <div className="relative h-[420px] flex flex-col items-center justify-center overflow-hidden bg-[#EBE8E2]">
                  {photo || illustration ? (
                    <img
                      {...responsiveImg(photo ?? illustration!.src, "(min-width: 1024px) 50vw, 100vw", 1200)}
                      alt={photo ? system.name : illustration!.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-[9px] uppercase tracking-[0.25em] font-sans text-[#6B6B6B]">Photography coming soon</p>
                  )}
                  {illustration?.kind === "render" && (
                    <span className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.25em] font-sans px-2.5 py-1 bg-[#121212]/80 text-[#C5A059]">
                      Render
                    </span>
                  )}
                  {system.badge && (
                    <span className="absolute top-4 left-4 text-[9px] uppercase tracking-[0.25em] font-sans px-2.5 py-1 bg-[#121212] text-[#C5A059]">
                      {system.badge}
                    </span>
                  )}
                </div>
                {illustration && (
                  <figcaption className="mt-2 text-[10px] text-[#6B6B6B] font-light">
                    {illustration.kind === "render"
                      ? "Render for illustration, not a Madio installation."
                      : "Illustrative image from the Madio catalogue, not a Madio installation."}
                  </figcaption>
                )}
              </figure>

              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">
                  Overview
                </h2>
                <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{system.description}</p>
              </div>

              {system.highlights.length > 0 && (
                <div className="border-t border-[#EBE8E2] pt-6">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">
                    Highlights
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {system.highlights.map((h) => (
                      <li key={h} className="text-[10px] uppercase tracking-[0.15em] font-sans border border-[#EBE8E2] bg-white px-3 py-1.5 text-[#121212]">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: specs + warranty + CTA */}
            <div className="lg:col-span-6 space-y-10">

              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-6 flex items-center space-x-2">
                  <div className="w-4 h-[2px]" style={{ backgroundColor: DW_ACCENT }} />
                  <span>Technical Specification</span>
                </h2>
                <dl className="text-xs border-t border-[#EBE8E2]">
                  {system.specRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-5 py-3.5 border-b border-[#EBE8E2]">
                      <dt className="col-span-2 text-[#6B6B6B] font-light">{row.label}</dt>
                      <dd className="col-span-3 text-[#121212] font-medium pl-4 leading-relaxed">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-[10px] text-[#6B6B6B] font-light">From the Madio Doors &amp; Windows 2026 product catalogue.</p>
              </div>

              {/* Warranty callout — hasValue-gated, per-product (see doorsWindows.ts correction note) */}
              {hasValue(system.specs.warranty) && (
                <div className="flex items-start space-x-3 bg-[#F4F1EA] border border-[#EBE8E2] p-5">
                  <CheckCircle size={16} style={{ color: DW_ACCENT }} className="shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
                    {system.specs.warranty} Warranty.{" "}
                    {isPartition ? "Powder-coated finish." : "Custom RAL powder-coat and anodized finishes available on request."}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="border-t border-[#EBE8E2] pt-8 space-y-4">
                <Link
                  to={`${DW_BASE}/consultation?system=${system.id}`}
                  className="flex items-center justify-center space-x-2 w-full py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium text-white bg-[#C5A059] hover:bg-[#121212] transition-all duration-300"
                >
                  <span>Discuss This System</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  to={`${DW_BASE}/systems`}
                  className="flex items-center justify-center space-x-2 w-full py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium border border-[#EBE8E2] text-[#6B6B6B] hover:border-[#121212] hover:text-[#121212] transition-all duration-300"
                >
                  <ArrowLeft size={13} />
                  <span>All Systems</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Options, installation and documentation (populated systems) ── */}
      {meta.isPopulated && system && (
        <section className="border-t border-[#EBE8E2] bg-white py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#EBE8E2] border border-[#EBE8E2]">
            {(isPartition
              ? [
                  { title: "Glass", lines: [system.specs.glassThickness && `${system.specs.glassThickness} glass`, system.tagline] },
                  { title: "Profile", lines: system.specRows.filter((r) => /profile|board|configuration/i.test(r.label)).map((r) => `${r.label}: ${r.value}`) },
                  { title: "Finish", lines: ["Powder coated"] },
                  {
                    title: "Options",
                    lines: [...system.specRows.filter((r) => /special/i.test(r.label)).map((r) => `${r.value} option`), "Single and double glass versions in the range"],
                  },
                ]
              : [
                  {
                    title: "Glass",
                    lines: [system.specs.glassThickness && `${system.specs.glassThickness} glass`, "Single, DGU or laminated glazing"],
                  },
                  {
                    title: "Hardware",
                    lines: ["Imported European hardware", system.specs.lockingSystem && `Locking: ${system.specs.lockingSystem}`],
                  },
                  {
                    title: "Finishes",
                    lines: ["Any RAL powder coat (QUALICOAT)", "Anodised and wood-grain finishes"],
                  },
                  {
                    title: "Configurations",
                    lines: [
                      system.family === "casement"
                        ? "Openable casement"
                        : system.id === "slidefold"
                          ? `Panel arrangements: ${meta.panelConfigs?.join(", ") ?? "on request"}`
                          : system.specs.trackWidth?.threeTrack
                            ? "2-track and 3-track sliding"
                            : "2-track sliding",
                      "Fixed and combination units",
                      system.specs.netOption && `Insect mesh: ${system.specs.netOption}`,
                    ],
                  },
                ]
            ).map((block) => (
              <div key={block.title} className="bg-white p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">{block.title}</h2>
                <ul className="space-y-2">
                  {block.lines.filter(Boolean).map((l) => (
                    <li key={l as string} className="text-xs text-[#6B6B6B] font-light leading-relaxed">{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 mt-14">
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">Installation considerations</h2>
              <ul className="space-y-2">
                {[
                  "Final opening sizes are confirmed by Madio's site measurement before production.",
                  ...(madioProcess.find((p) => p.step === 3)?.bullets.slice(1, 4) ?? []),
                ].map((b) => (
                  <li key={b} className="text-xs text-[#6B6B6B] font-light leading-relaxed flex items-start">
                    <span className="mt-1.5 mr-2.5 w-1 h-1 rounded-full shrink-0 bg-[#C5A059]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">Technical documentation</h2>
              <ul className="border-t border-[#EBE8E2]">
                {[dwResources[0], ...resourcesForSystem(system.id)].map((r) => (
                  <li key={r.id} className="border-b border-[#EBE8E2] py-3 flex items-center justify-between gap-4 text-xs">
                    <span className="text-[#121212]">{r.title}</span>
                    {r.file ? (
                      <a href={r.file} download className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059]">Download</a>
                    ) : (
                      <Link
                        to={`${DW_BASE}/consultation?system=${system.id}&resource=${encodeURIComponent(r.title)}`}
                        className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] whitespace-nowrap"
                      >
                        Request
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── Related systems strip ── */}
      <section className="border-t border-[#EBE8E2] bg-[#F4F1EA]/40 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-8">
            Related Systems
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ...dwCategories.filter(
                (c) => c.id !== category && dwApplicationGroups.some((g) => g.systemIds.includes(category) && g.systemIds.includes(c.id)),
              ),
              ...dwCategories.filter((c) => c.id !== category),
            ]
              .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i && hasPublicPage(c.id))
              .slice(0, 3)
              .map((c) => (
                <Link
                  key={c.id}
                  to={`/doors-windows/${c.id}`}
                  className="bg-white border border-[#EBE8E2] p-6 group hover:border-[#C5A059]/40 transition-all duration-300"
                >
                  <div className="w-6 h-[2px] mb-4 transition-all duration-300 group-hover:w-10" style={{ backgroundColor: DW_ACCENT }} />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-medium block mb-1" style={{ color: DW_ACCENT }}>
                    {c.isPopulated || getCategoryPhotos(c.id).length > 0 ? "Product System" : "Coming Soon"}
                  </span>
                  <p className="text-sm font-serif font-light text-[#121212] group-hover:text-[#C5A059] transition-colors">
                    {c.name}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <ConsultBand system={meta.id} />
    </div>
  );
};
