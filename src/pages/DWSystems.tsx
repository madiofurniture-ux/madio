import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getCategoryMeta, getCategoryPhotos, getSystemById } from "../data/doorsWindows";
import type { DWCategoryId } from "../data/doorsWindows";
import { DW_BASE, dwApplicationGroups, hasPublicPage } from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { breadcrumbJsonLd, absoluteUrl } from "../lib/seo";
import { responsiveImg } from "../lib/image";
import { ConsultBand, DWPageHero, Hatch, RenderGallery, SectionHeading } from "../components/dw/DWUI";
import { DW_RENDER_NOTE, dwRenders } from "../data/dwRenders";

const keySpecs = (id: DWCategoryId): string[] => {
  const s = getSystemById(id);
  if (!s) return [];
  return [
    s.specs.interlock && `${s.specs.interlock} interlock`,
    s.specs.maxHeight && `up to ${s.specs.maxHeight} high`,
    s.specs.loadCapacity && `${s.specs.loadCapacity} rollers`,
    s.family === "glass-partitions" && s.specs.glassThickness,
    s.family === "glass-partitions" && s.specRows.find((r) => /profile/i.test(r.label))?.value,
  ].filter(Boolean) as string[];
};

const SystemCard: React.FC<{ id: DWCategoryId }> = ({ id }) => {
  const meta = getCategoryMeta(id);
  if (!meta) return null;
  const system = getSystemById(id);
  const isPublic = hasPublicPage(id);
  const thumb = system?.images[0] ?? getCategoryPhotos(id)[0]?.secureUrl ?? system?.visual?.src;
  const specs = keySpecs(id);

  const body = (
    <>
      <div className={`relative overflow-hidden bg-[#EBE8E2] ${thumb ? "aspect-[4/3]" : "h-16 md:h-24"}`}>
        {thumb ? (
          <img
            {...responsiveImg(thumb, "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", 600)}
            alt={system?.images[0] ? meta.name : system?.visual?.alt ?? meta.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Hatch opacity={0.06} />
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        {system?.badge && (
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-[#C5A059] mb-2">{system.badge}</span>
        )}
        <h3 className="text-lg font-serif font-light text-[#121212] mb-2 group-hover:text-[#C5A059] transition-colors">
          {meta.name}
        </h3>
        <p className="text-xs text-[#6B6B6B] font-light leading-relaxed flex-grow">{system?.tagline ?? meta.description}</p>
        {specs.length > 0 && (
          <p className="mt-4 text-[10px] uppercase tracking-[0.12em] font-sans text-[#121212]/70 leading-relaxed">
            {specs.join(" · ")}
          </p>
        )}
        <span className="mt-5 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5">
          {isPublic ? "View system" : "Details on request"} <ArrowRight size={11} />
        </span>
      </div>
    </>
  );

  const cls = "group flex flex-col bg-white border border-[#EBE8E2] hover:border-[#C5A059]/40 transition-colors";
  return isPublic ? (
    <Link to={`${DW_BASE}/${id}`} className={cls}>{body}</Link>
  ) : (
    <Link to={`${DW_BASE}/consultation?interest=${encodeURIComponent(meta.name)}`} className={cls}>{body}</Link>
  );
};

export const DWSystems: React.FC = () => {
  const publicIds = [...new Set(dwApplicationGroups.flatMap((g) => g.systemIds))].filter(hasPublicPage);

  usePageMeta(
    "Architectural Aluminium Systems | Sliding, Casement & Large-Format | Madio Doors & Windows",
    "Aluminium sliding doors and windows, casement systems, large-format glazing, folding systems and glass partitions from Madio Doors & Windows, Hyderabad.",
    {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Doors & Windows", path: DW_BASE },
          { name: "Architectural Systems", path: `${DW_BASE}/systems` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Madio Doors & Windows architectural systems",
          itemListElement: publicIds.map((id, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: getCategoryMeta(id)?.name,
            url: absoluteUrl(`${DW_BASE}/${id}`),
          })),
        },
      ],
    },
  );

  return (
    <div className="bg-[#F4F1EA]">
      <DWPageHero
        eyebrow="Architectural Systems"
        breadcrumb="Architectural Systems"
        title={
          <>
            Systems, organised by <span className="italic text-[#C5A059]">how they are used.</span>
          </>
        }
        intro="Seventeen systems from the Madio 2026 catalogue, grouped by application: sliding, large-format, casement, folding and glass partitions. Each system page carries its catalogue specification, options and documentation."
      >
        <nav aria-label="Applications" className="mt-10 flex flex-wrap gap-2">
          {dwApplicationGroups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="text-[10px] uppercase tracking-[0.18em] font-sans border border-white/20 text-white/70 hover:border-[#C5A059] hover:text-white px-3 py-2 transition-colors"
            >
              {g.title}
            </a>
          ))}
        </nav>
      </DWPageHero>

      {dwApplicationGroups.map((g, i) => (
        <section
          key={g.id}
          id={g.id}
          className={`scroll-mt-24 border-t border-[#EBE8E2] py-20 px-6 md:px-12 ${i % 2 === 1 ? "bg-white" : ""}`}
        >
          <div className="max-w-7xl mx-auto">
            <SectionHeading eyebrow={`0${i + 1}`.slice(-2)} title={g.title} intro={g.body} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.systemIds.map((id) => (
                <SystemCard key={id} id={id} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-[#EBE8E2] bg-[#121212] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            dark
            eyebrow="Opening Types"
            title={
              <>
                How the systems <span className="italic text-[#C5A059]">come together.</span>
              </>
            }
            intro="Sliding, slide & fold, casement, door and fixed configurations, visualised. Every opening is configured and sized to the project after site measurement."
          />
          <RenderGallery dark renders={dwRenders} note={DW_RENDER_NOTE} />
          <Link
            to={`${DW_BASE}/design-materials#configurations`}
            className="mt-8 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5"
          >
            All opening configurations <ArrowRight size={11} />
          </Link>
        </div>
      </section>

      <section className="border-t border-[#EBE8E2] py-14 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-sm text-[#6B6B6B] font-light leading-relaxed max-w-3xl">
          Card images are renders or illustrative catalogue visuals, not Madio installations; see{" "}
          <Link to={`${DW_BASE}/projects`} className="text-[#121212] underline underline-offset-4 hover:text-[#C5A059]">
            projects
          </Link>{" "}
          for installed work. Fixed glazing, combination units and integrated insect mesh are configured within these systems. See{" "}
          <Link to={`${DW_BASE}/design-materials#configurations`} className="text-[#121212] underline underline-offset-4 hover:text-[#C5A059]">
            opening configurations
          </Link>{" "}
          and{" "}
          <Link to={`${DW_BASE}/design-materials#mesh`} className="text-[#121212] underline underline-offset-4 hover:text-[#C5A059]">
            insect mesh options
          </Link>
          .
        </div>
      </section>

      <ConsultBand />
    </div>
  );
};
