import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, FileText } from "lucide-react";
import { dwOpeningSystems, dwSystems, getCategoryMeta } from "../data/doorsWindows";
import { DW_BASE, dwResources } from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { breadcrumbJsonLd } from "../lib/seo";
import { ConsultBand, DWPageHero, SectionHeading } from "../components/dw/DWUI";

export const DWResources: React.FC = () => {
  usePageMeta(
    "Technical Resources | Catalogue, Drawings & Specifications | Madio Doors & Windows",
    "Catalogue, profile and section drawings, glass, hardware and finish information, installation and maintenance guidance for Madio aluminium door and window systems.",
    {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Doors & Windows", path: DW_BASE },
          { name: "Technical Resources", path: `${DW_BASE}/resources` },
        ]),
      ],
    },
  );

  return (
    <div className="bg-[#F4F1EA]">
      <DWPageHero
        eyebrow="Technical Resources"
        breadcrumb="Technical Resources"
        title={
          <>
            The information behind <span className="italic text-[#C5A059]">the specification.</span>
          </>
        }
        intro="Catalogues, drawings and product information for design and documentation. Documents not yet listed for download are sent on request, matched to the systems on your project."
      />

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Library" title="Documents and drawings" />
          <ul className="border-t border-[#EBE8E2]">
            {dwResources.map((r) => {
              const systems = (r.systemIds ?? []).map((id) => getCategoryMeta(id)?.name).filter(Boolean);
              return (
                <li
                  key={r.id}
                  id={r.id}
                  className="scroll-mt-24 border-b border-[#EBE8E2] py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
                >
                  <span className="md:col-span-2 text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] flex items-center gap-2">
                    <FileText size={13} /> {r.kind}
                  </span>
                  <div className="md:col-span-7">
                    <h3 className="text-lg font-serif font-light text-[#121212] mb-1">{r.title}</h3>
                    <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">{r.description}</p>
                    {systems.length > 0 && (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] font-sans text-[#121212]/60">
                        {systems.length === dwOpeningSystems.length ? "All window and door systems" : systems.join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-3 md:text-right">
                    {r.file ? (
                      <a
                        href={r.file}
                        download
                        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-sans font-medium bg-[#121212] text-white px-5 py-3 hover:bg-[#C5A059] transition-colors"
                      >
                        <Download size={12} /> Download{r.fileFormat ? ` ${r.fileFormat}` : ""}
                      </a>
                    ) : (
                      <Link
                        to={`${DW_BASE}/consultation?resource=${encodeURIComponent(r.title)}`}
                        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-sans font-medium border border-[#121212] text-[#121212] px-5 py-3 hover:bg-[#121212] hover:text-white transition-colors"
                      >
                        Request <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-t border-[#EBE8E2] bg-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="System data sheets"
            title="Specification online, per system."
            intro="Each system page carries its 2026 catalogue specification: frame and track dimensions, interlock, glass range, maximum sizes, roller capacity and locking, or glass, profile and finish for partitions."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dwSystems.map((s) => (
              <Link
                key={s.id}
                to={`${DW_BASE}/${s.id}`}
                className="group bg-[#F4F1EA] border border-[#EBE8E2] p-6 hover:border-[#C5A059]/40 transition-colors"
              >
                <h3 className="text-base font-serif font-light text-[#121212] group-hover:text-[#C5A059] transition-colors mb-2">
                  {s.name}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] inline-flex items-center gap-1.5">
                  Specification <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ConsultBand
        title="Need something specific?"
        body="Tell us the system and the drawing or document you need, and we will send what is available for your project."
      />
    </div>
  );
};
