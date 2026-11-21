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
import type { DWCategoryPhoto, DWSystemSpec } from "../data/doorsWindows";
import { usePageMeta } from "../hooks/usePageMeta";
import { absoluteUrl, breadcrumbJsonLd } from "../lib/seo";
import { madioProcess } from "../data/doorsWindows";
import { DW_BASE, dwApplicationGroups, hasPublicPage, resourcesForSystem, dwResources } from "../data/dwArchitect";
import { ConsultBand } from "../components/dw/DWUI";
import { responsiveImg } from "../lib/image";

const DW_ACCENT = "#C5A059";

const hasValue = (v: string | undefined): v is string =>
  !!v && v.trim() !== "" && v.trim().toLowerCase() !== "todo";

// Flat spec rows (excludes trackWidth/interlock, which render as their own
// track table, and frameHeight when a track table is present).
const FLAT_SPEC_LABELS: Partial<Record<keyof DWSystemSpec, string>> = {
  frameWidth: "Frame Width",
  frameHeight: "Frame Height",
  glassThickness: "Glass Thickness",
  maxHeight: "Maximum Height",
  maxWidth: "Maximum Width",
  lockingSystem: "Locking System",
  netOption: "Net Option",
  loadCapacity: "Load Capacity",
  windLoad: "Wind Load",
};

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
    meta ? `${meta.name} | Aluminium ${system?.specs.trackWidth ? "Sliding System" : "System"} | Madio Doors & Windows` : "Madio Doors & Windows",
    system
      ? `${system.name}: ${system.tagline} ${[system.specs.maxHeight && `Up to ${system.specs.maxHeight} high`, system.specs.glassThickness && `${system.specs.glassThickness} glass`, system.specs.windLoad && `${system.specs.windLoad} wind load`].filter(Boolean).join(", ")}.`
      : meta?.description ?? "Architectural aluminium systems from Madio Doors & Windows.",
    meta
      ? {
          image: system?.images[0],
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
                    additionalProperty: Object.entries({
                      "Glass thickness": system.specs.glassThickness,
                      "Maximum height": system.specs.maxHeight,
                      "Maximum width": system.specs.maxWidth,
                      "Load capacity": system.specs.loadCapacity,
                      "Wind load": system.specs.windLoad,
                      Interlock: system.specs.interlock,
                    })
                      .filter(([, v]) => !!v)
                      .map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
                  },
                ]
              : []),
          ],
        }
      : { noindex: true },
  );

  // Unknown slug → redirect to landing
  if (!category || !isDWCategoryId(category) || !meta) {
    return <Navigate to="/doors-windows" replace />;
  }

  const hasTrack =
    !!system && (hasValue(system.specs.trackWidth?.twoTrack) || hasValue(system.specs.trackWidth?.threeTrack));

  const flatRows = system
    ? (Object.entries(system.specs) as [keyof DWSystemSpec, string | undefined][])
        .filter(([key, v]) => {
          if (key === "trackWidth" || key === "interlock" || key === "warranty") return false;
          if (key === "frameHeight" && hasTrack) return false; // frame height lives in the track table instead
          return hasValue(v as string | undefined) && FLAT_SPEC_LABELS[key] !== undefined;
        })
        .map(([key, value]) => ({ label: FLAT_SPEC_LABELS[key]!, value: value as string }))
    : [];

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
              <div className="relative h-[420px] flex flex-col items-center justify-center overflow-hidden bg-[#EBE8E2]">
                {system.images.length > 0 ? (
                  <img
                    src={system.images[0]}
                    alt={system.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <div
                      className="absolute inset-0 opacity-[0.05]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, #C5A059 0, #C5A059 1px, transparent 0, transparent 50%)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="relative z-10 text-center px-8">
                      <div className="w-10 h-[2px] mb-6 mx-auto" style={{ backgroundColor: DW_ACCENT }} />
                      <p className="text-[9px] uppercase tracking-[0.25em] font-sans text-[#6B6B6B]">
                        Photography coming soon
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">
                  Overview
                </h2>
                <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{system.description}</p>
              </div>

              {system.coreFeatures.length > 0 && (
                <div className="border-t border-[#EBE8E2] pt-6">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-4">
                    Core Performance Features
                  </h2>
                  <ul className="space-y-2.5">
                    {system.coreFeatures.map((f, i) => (
                      <li key={i} className="text-xs text-[#6B6B6B] font-light leading-relaxed flex items-start">
                        <span className="mt-1.5 mr-2.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: DW_ACCENT }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasValue(system.bestFor) && (
                <div className="border-t border-[#EBE8E2] pt-6">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-3">
                    Architectural Application
                  </h2>
                  <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{system.bestFor}</p>
                </div>
              )}
            </div>

            {/* Right: specs + warranty + CTA */}
            <div className="lg:col-span-6 space-y-10">

              {/* Track table — 2-track / 3-track systems only */}
              {hasTrack && (
                <div>
                  <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-6 flex items-center space-x-2">
                    <div className="w-4 h-[2px]" style={{ backgroundColor: DW_ACCENT }} />
                    <span>Track Specification</span>
                  </h2>
                  <div className="overflow-x-auto border border-[#EBE8E2]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#121212]">
                          <th className="text-left font-sans font-medium uppercase tracking-[0.1em] text-[10px] text-white px-4 py-3">Specification</th>
                          <th className="text-left font-sans font-medium uppercase tracking-[0.1em] text-[10px] text-white px-4 py-3">2 Track</th>
                          <th className="text-left font-sans font-medium uppercase tracking-[0.1em] text-[10px] text-white px-4 py-3">3 Track</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="px-4 py-3 font-medium text-[#121212]">Track Width</td>
                          <td className="px-4 py-3 text-[#6B6B6B] font-light">{system.specs.trackWidth?.twoTrack ?? "—"}</td>
                          <td className="px-4 py-3 text-[#6B6B6B] font-light">{system.specs.trackWidth?.threeTrack ?? "—"}</td>
                        </tr>
                        {hasValue(system.specs.frameHeight) && (
                          <tr className="bg-[#F4F1EA]/60">
                            <td className="px-4 py-3 font-medium text-[#121212]">Frame Height</td>
                            <td className="px-4 py-3 text-[#6B6B6B] font-light">{system.specs.frameHeight}</td>
                            <td className="px-4 py-3 text-[#6B6B6B] font-light">{system.specs.frameHeight}</td>
                          </tr>
                        )}
                        {hasValue(system.specs.interlock) && (
                          <tr className="bg-white">
                            <td className="px-4 py-3 font-medium text-[#121212]">Interlock</td>
                            <td className="px-4 py-3 text-[#6B6B6B] font-light">{system.specs.interlock}</td>
                            <td className="px-4 py-3 text-[#6B6B6B] font-light">{system.specs.interlock}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Flat spec table */}
              {flatRows.length > 0 && (
                <div>
                  <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#121212] mb-6 flex items-center space-x-2">
                    <div className="w-4 h-[2px]" style={{ backgroundColor: DW_ACCENT }} />
                    <span>Technical Specification</span>
                  </h2>
                  <div className="space-y-0 text-xs border-t border-[#EBE8E2]">
                    {flatRows.map((row, i) => (
                      <div
                        key={row.label}
                        className={`grid grid-cols-5 py-3.5 ${i < flatRows.length - 1 ? "border-b border-[#EBE8E2]" : ""}`}
                      >
                        <span className="col-span-2 text-[#6B6B6B] font-light">{row.label}</span>
                        <span className="col-span-3 text-[#121212] font-medium pl-4 leading-relaxed">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty callout — hasValue-gated, per-product (see doorsWindows.ts correction note) */}
              {hasValue(system.specs.warranty) && (
                <div className="flex items-start space-x-3 bg-[#F4F1EA] border border-[#EBE8E2] p-5">
                  <CheckCircle size={16} style={{ color: DW_ACCENT }} className="shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
                    {system.specs.warranty} Warranty. Custom RAL powder-coat and anodized finishes available on request.
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
            {[
              {
                title: "Glass",
                lines: [
                  system.specs.glassThickness && `${system.specs.glassThickness} glass thickness`,
                  "Single, DGU or laminated glazing",
                ],
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
                title: hasTrack ? "Configurations & mesh" : "Configurations",
                lines: [
                  hasTrack ? "2-track and 3-track sliding" : "Openable casement",
                  "Fixed and combination units",
                  system.specs.netOption && `Insect mesh: ${system.specs.netOption}`,
                ],
              },
            ].map((block) => (
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
