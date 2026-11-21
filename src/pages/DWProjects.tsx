import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getCategoryMeta } from "../data/doorsWindows";
import { DW_BASE, dwProjects, dwProjectTypes } from "../data/dwArchitect";
import type { DWProject, DWProjectType } from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { breadcrumbJsonLd } from "../lib/seo";
import { responsiveImg } from "../lib/image";
import { ConsultBand, DWPageHero, SectionHeading } from "../components/dw/DWUI";

const Fact: React.FC<{ label: string; value?: string }> = ({ label, value }) =>
  value ? (
    <div className="py-2 border-b border-[#EBE8E2] grid grid-cols-5 gap-3 text-xs">
      <dt className="col-span-2 text-[#6B6B6B] font-light">{label}</dt>
      <dd className="col-span-3 text-[#121212]">{value}</dd>
    </div>
  ) : null;

const ProjectCase: React.FC<{ p: DWProject }> = ({ p }) => {
  const systems = p.systemIds.map((id) => getCategoryMeta(id)).filter(Boolean);
  return (
    <article id={p.slug} className="scroll-mt-24 bg-white border border-[#EBE8E2]">
      {p.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-px bg-[#EBE8E2]">
          {p.photos.slice(0, 4).map((ph, i) => (
            <div key={ph.src} className={`relative overflow-hidden ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}>
              <img {...responsiveImg(ph.src, "(min-width: 1024px) 50vw, 100vw", 1200)} alt={ph.alt} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="p-7">
        {p.isInspiration && (
          <span className="inline-block mb-3 text-[9px] uppercase tracking-[0.25em] font-sans border border-[#121212] px-2 py-1">
            Inspiration imagery, not a Madio installation
          </span>
        )}
        <span className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#C5A059] block mb-2">{p.type}</span>
        <h3 className="text-2xl font-serif font-light text-[#121212] mb-1">{p.name}</h3>
        <p className="text-xs text-[#6B6B6B] font-light mb-5">{p.location}</p>
        <dl className="mb-5">
          <Fact label="Architect / designer" value={p.architect} />
          <Fact label="Systems" value={systems.map((s) => s!.name).join(", ")} />
          <Fact label="Configurations" value={p.configurations?.join(", ")} />
          <Fact label="Glass and finish" value={p.glassAndFinish} />
          <Fact label="Installation" value={p.installationNotes} />
        </dl>
        {p.challengeAndSolution && <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{p.challengeAndSolution}</p>}
        <div className="mt-5 flex flex-wrap gap-4">
          {systems.map((s) => (
            <Link key={s!.id} to={`${DW_BASE}/${s!.id}`} className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] inline-flex items-center gap-1.5">
              {s!.name} <ArrowRight size={10} />
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
};

export const DWProjects: React.FC = () => {
  const [filter, setFilter] = useState<DWProjectType | "All">("All");
  const realCount = dwProjects.filter((p) => !p.isInspiration).length;
  const shown = dwProjects.filter((p) => filter === "All" || p.type === filter);
  const typesInUse = dwProjectTypes.filter((t) => dwProjects.some((p) => p.type === t));

  usePageMeta(
    "Projects | Aluminium Doors and Windows for Villas, Residences & Commercial | Madio",
    "Completed Madio Doors & Windows installations: luxury villas, premium residences, apartments, commercial, hospitality and renovation projects.",
    {
      // Kept out of search until real case studies are published.
      noindex: realCount === 0,
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Doors & Windows", path: DW_BASE },
          { name: "Projects", path: `${DW_BASE}/projects` },
        ]),
      ],
    },
  );

  return (
    <div className="bg-[#F4F1EA]">
      <DWPageHero
        eyebrow="Projects"
        breadcrumb="Projects"
        title={
          <>
            Delivered, <span className="italic text-[#C5A059]">not imagined.</span>
          </>
        }
        intro="Madio installations documented as case studies: the project, the systems and configurations used, and the glass and finish choices. Only completed Madio work appears here."
      />

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {dwProjects.length === 0 ? (
            <div className="max-w-2xl">
              <SectionHeading
                eyebrow="Case studies"
                title="Our project case studies are being documented."
                intro="We are photographing and writing up completed installations across villas, residences, apartments, commercial, hospitality and renovation projects. To see work relevant to your project in the meantime, ask us for references."
              />
              <ul className="flex flex-wrap gap-2 mb-10">
                {dwProjectTypes.map((t) => (
                  <li key={t} className="text-[10px] uppercase tracking-[0.15em] font-sans border border-[#EBE8E2] bg-white px-3 py-2 text-[#121212]">
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                to={`${DW_BASE}/consultation?resource=${encodeURIComponent("Project references")}`}
                className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5"
              >
                Request project references <ArrowRight size={11} />
              </Link>
            </div>
          ) : (
            <>
              <div role="tablist" aria-label="Project type" className="flex flex-wrap gap-2 mb-10">
                {(["All", ...typesInUse] as const).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={filter === t}
                    onClick={() => setFilter(t)}
                    className={`text-[10px] uppercase tracking-[0.18em] font-sans px-4 py-2 border transition-colors ${
                      filter === t ? "bg-[#121212] text-white border-[#121212]" : "border-[#EBE8E2] text-[#121212] hover:border-[#121212]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {shown.map((p) => (
                  <ProjectCase key={p.slug} p={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <ConsultBand />
    </div>
  );
};
