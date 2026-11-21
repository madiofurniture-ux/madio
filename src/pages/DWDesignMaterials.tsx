import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  dwHardwarePro,
  dwOpeningSystems,
  dwSystems,
  getCategoryMeta,
  systemsInFamily,
  materialComparison,
  aluminiumAdvantages,
  windowDoorTypologies,
  performanceStandards,
} from "../data/doorsWindows";
import { DW_BASE } from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { breadcrumbJsonLd } from "../lib/seo";
import { ConsultBand, DataTable, DWPageHero, SectionHeading } from "../components/dw/DWUI";

const DASH = "—";

const sections = [
  { id: "profiles", label: "Aluminium Profiles" },
  { id: "glazing", label: "Glass & Glazing" },
  { id: "partitions", label: "Glass Partitions" },
  { id: "hardware", label: "Hardware" },
  { id: "finishes", label: "Finishes" },
  { id: "configurations", label: "Opening Configurations" },
  { id: "mesh", label: "Insect Mesh" },
  { id: "standards", label: "Performance Standards" },
  { id: "aluminium", label: "Why Aluminium" },
];

const finishes = [
  {
    title: "Powder coat",
    body: "Any RAL colour in QUALICOAT-certified powder coating, applied in a multi-stage process for a durable, wipe-clean architectural finish.",
  },
  {
    title: "Anodised",
    body: "Bright and matte anodised profiles for a metallic finish that reads as the material itself.",
  },
  {
    title: "Wood-grain",
    body: "Wood-grain finishes for projects that call for warmth without the maintenance of timber.",
  },
  {
    title: "Custom colour matching",
    body: "Special finishes and colour matching to a project's material palette, on request.",
  },
];

export const DWDesignMaterials: React.FC = () => {
  usePageMeta(
    "Design & Materials | Aluminium Profiles, Glass, Hardware & Finishes | Madio Doors & Windows",
    "Aluminium profiles, glazing, imported European hardware, RAL and anodised finishes, and opening configurations across the Madio Doors & Windows range.",
    {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Doors & Windows", path: DW_BASE },
          { name: "Design & Materials", path: `${DW_BASE}/design-materials` },
        ]),
      ],
    },
  );

  const bifold = getCategoryMeta("slidefold");
  const rowValue = (id: string, re: RegExp) =>
    dwSystems.find((s) => s.id === id)?.specRows.filter((r) => re.test(r.label)).map((r) => r.value).join(" · ") || DASH;

  return (
    <div className="bg-[#F4F1EA]">
      <DWPageHero
        eyebrow="Design & Materials"
        breadcrumb="Design & Materials"
        title={
          <>
            Every element, <span className="italic text-[#C5A059]">considered together.</span>
          </>
        }
        intro="Profile, glass, hardware and finish decide how an opening looks, performs and ages. Here is what each Madio system offers, from the catalogue data."
      >
        <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] uppercase tracking-[0.18em] font-sans border border-white/20 text-white/70 hover:border-[#C5A059] hover:text-white px-3 py-2 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </DWPageHero>

      <section id="profiles" className="scroll-mt-24 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Aluminium Profiles"
            title="Slim sightlines, architectural-grade alloy."
            intro="Profiles in 6063 aluminium alloy, with interlock sightlines from 19 mm on the Monoslim and Vista 32. Dimensions are as the 2026 catalogue states them for each system."
          />
          <DataTable
            caption="Profile dimensions by system (mm)"
            headers={["System", "2-Track", "3-Track", "Frame / Visible Height", "Interlock", "Joints (Track / Sash)"]}
            rows={dwOpeningSystems.map((s) => [
              s.name,
              rowValue(s.id, /^2-Track|^Track Depth/),
              rowValue(s.id, /^3-Track/),
              rowValue(s.id, /^Frame Height/) !== DASH ? rowValue(s.id, /^Frame Height/) : s.family === "casement" ? "50 mm visible" : DASH,
              s.specs.interlock ?? DASH,
              [rowValue(s.id, /^Track Joint/), rowValue(s.id, /^Sash Joint/)].filter((v) => v !== DASH).join(" / ") || DASH,
            ])}
          />
          <p className="mt-3 text-[11px] text-[#6B6B6B] font-light">
            2-track and 3-track values are frame width, or depth / height where the catalogue gives both.
          </p>
        </div>
      </section>

      <section id="glazing" className="scroll-mt-24 border-t border-[#EBE8E2] bg-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Glass & Glazing"
            title="Single, double-glazed or laminated."
            intro="Single, DGU (double-glazed unit) and laminated glazing. The glass range each window and door system takes, and the sizes it supports, are below."
          />
          <DataTable
            caption="Glazing range by system"
            headers={["System", "Glass Range", "Max Height", "Max Width", "Roller Capacity"]}
            rows={dwOpeningSystems.map((s) => [
              s.name,
              s.specs.glassThickness ?? DASH,
              s.specs.maxHeight ?? DASH,
              s.specs.maxWidth ?? DASH,
              s.specs.loadCapacity ?? DASH,
            ])}
          />
        </div>
      </section>

      <section id="partitions" className="scroll-mt-24 border-t border-[#EBE8E2] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Glass Partitions"
            title="Eight partition systems, single and double glass."
            intro="Toughened glass on powder-coated profiles, from the 16 × 25 mm Ultraslim to the 100 mm Grandwall."
          />
          <DataTable
            caption="Glass partition systems"
            headers={["System", "Glass", "Profile / Board", "Finish", "Special Feature"]}
            rows={systemsInFamily("glass-partitions").map((s) => [
              s.name,
              rowValue(s.id, /^Glass Type/),
              [rowValue(s.id, /^Profile/), rowValue(s.id, /^Partition Board/), rowValue(s.id, /^Configuration/)].filter((v) => v !== DASH).join(" · "),
              rowValue(s.id, /^Finish/),
              rowValue(s.id, /^Special/),
            ])}
          />
        </div>
      </section>

      <section id="hardware" className="scroll-mt-24 border-t border-[#EBE8E2] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Hardware"
            title="Imported European hardware on every system."
            intro="Precision tolerances, smooth long-life operation and multi-point locking where the opening calls for security."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataTable
              caption="Locking by system"
              headers={["System", "Locking"]}
              rows={dwOpeningSystems.map((s) => [s.name, s.specs.lockingSystem ?? DASH])}
            />
            <div>
              <DataTable
                caption={`${dwHardwarePro.name}: ${dwHardwarePro.tagline}`}
                headers={["Component", "Model / Finish"]}
                rows={dwHardwarePro.specRows.map((r) => [r.label, r.value])}
              />
              <ul className="mt-4 flex flex-wrap gap-2">
                {dwHardwarePro.highlights.map((h) => (
                  <li key={h} className="text-[10px] uppercase tracking-[0.15em] font-sans border border-[#EBE8E2] bg-white px-3 py-1.5 text-[#121212]">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="finishes" className="scroll-mt-24 border-t border-[#EBE8E2] bg-[#121212] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            dark
            eyebrow="Finishes"
            title={
              <>
                Finished to the <span className="italic text-[#C5A059]">material palette.</span>
              </>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A2A2A]">
            {finishes.map((f) => (
              <div key={f.title} className="bg-[#121212] p-7">
                <h3 className="text-lg font-serif font-light text-white mb-3">{f.title}</h3>
                <p className="text-sm text-[#C4B9A8] font-light leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <Link
            to={`${DW_BASE}/resources#finish-chart`}
            className="mt-8 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5"
          >
            Request the finish chart <ArrowRight size={11} />
          </Link>
        </div>
      </section>

      <section id="configurations" className="scroll-mt-24 border-t border-[#EBE8E2] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Opening Configurations"
            title="Configured to the opening."
            intro="Sliding, slide & fold, casement, fixed and combination configurations, with insect protection integrated where needed. The opening types catalogue draws 49 of them as elevations."
          />
          <DataTable
            caption="Configurations and typical applications"
            headers={["Configuration", "Application"]}
            rows={windowDoorTypologies.map((r) => [r.configuration, r.application])}
          />
          <a
            href="/resources/madio-opening-types-49-options.pdf"
            download
            className="mt-6 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5"
          >
            Download the opening types catalogue (PDF, 49 options) <ArrowRight size={11} />
          </a>
          {bifold?.panelConfigs && bifold.panelConfigs.length > 0 && (
            <div className="mt-8 bg-white border border-[#EBE8E2] p-6">
              <h3 className="text-sm font-serif font-light text-[#121212] mb-3">{bifold.name}: panel arrangements</h3>
              <div className="flex flex-wrap gap-2">
                {bifold.panelConfigs.map((c) => (
                  <span key={c} className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 border border-[#EBE8E2] text-[#121212]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="mesh" className="scroll-mt-24 border-t border-[#EBE8E2] bg-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Insect Mesh"
            title="Protection without compromising the view."
            intro="Mosquito-mesh shutters run on the third track of 3-track sliding frames, and casement windows and doors take an inner mesh shutter, so insect protection does not add visual bulk."
          />
          <DataTable
            caption="Insect mesh options by system"
            headers={["System", "Mesh Option"]}
            rows={dwSystems.filter((s) => s.specs.netOption).map((s) => [s.name, s.specs.netOption as string])}
          />
        </div>
      </section>

      <section id="standards" className="scroll-mt-24 border-t border-[#EBE8E2] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Performance Standards" title="The standards behind every system." />
          <DataTable
            caption="Performance standards"
            headers={["Standard", "Specification"]}
            rows={performanceStandards.map((r) => [r.standard, r.specification])}
          />
        </div>
      </section>

      <section id="aluminium" className="scroll-mt-24 border-t border-[#EBE8E2] bg-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="Why Aluminium"
            title="Aluminium, wood and UPVC compared."
            intro="Choosing the frame material is an architectural decision. Here is how aluminium, the core of every Madio system, compares."
          />
          <DataTable
            caption="Material comparison"
            headers={["Parameter", "Aluminium (Madio)", "Wood", "UPVC"]}
            rows={materialComparison.map((r) => [r.parameter, r.aluminium, r.wood, r.upvc])}
          />
          <DataTable
            caption="Advantages of aluminium"
            headers={["Advantage", "Description"]}
            rows={aluminiumAdvantages.map((r) => [r.advantage, r.description])}
          />
        </div>
      </section>

      <ConsultBand />
    </div>
  );
};
