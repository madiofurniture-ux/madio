import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { madioProcess } from "../data/doorsWindows";
import {
  DW_BASE,
  DW_EMAIL,
  dwArchitectServices,
  dwAudiences,
  dwWhatsAppLink,
} from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { breadcrumbJsonLd } from "../lib/seo";
import { ConsultBand, DWPageHero, PrimaryButton, SectionHeading } from "../components/dw/DWUI";

// The journey from first conversation to completed installation. Quotation
// happens after survey and configuration, never from a public price list.
const journey = [
  "Project enquiry",
  "Site survey",
  "Product selection",
  "Opening configuration",
  "Dimensions",
  "Glass and finish",
  "Hardware and accessories",
  "Quotation",
  "Technical validation",
  "Project execution",
];

export const DWArchitects: React.FC = () => {
  usePageMeta(
    "For Architects & Designers | Aluminium Doors and Windows for Architects | Madio",
    "How Madio Doors & Windows supports architects, interior designers and developers: system selection, material and dimensional coordination, project quotations, installation and handover.",
    {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Doors & Windows", path: DW_BASE },
          { name: "For Architects", path: `${DW_BASE}/architects` },
        ]),
      ],
    },
  );

  return (
    <div className="bg-[#F4F1EA]">
      <DWPageHero
        eyebrow="Architects & Design Professionals"
        breadcrumb="For Architects"
        title={
          <>
            Your architectural vision. <span className="italic text-[#C5A059]">Our systems expertise.</span>
          </>
        }
        intro="From system selection to project coordination, Madio Doors & Windows works alongside design professionals to explore aluminium solutions that complement the architecture and meet the practical requirements of each opening."
      >
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <PrimaryButton to={`${DW_BASE}/consultation?role=Architect`}>
            Send a Project Brief <ArrowRight size={12} />
          </PrimaryButton>
          <Link
            to={`${DW_BASE}/resources`}
            className="inline-flex items-center justify-center px-10 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium border border-white/60 text-white hover:bg-white hover:text-[#121212] transition-all duration-300"
          >
            Technical Resources
          </Link>
        </div>
      </DWPageHero>

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="How we support the design process"
            title="Seven points where we work with your team."
          />
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EBE8E2] border border-[#EBE8E2]">
            {dwArchitectServices.map((svc, i) => (
              <li key={svc.title} className="bg-white p-8">
                <span className="text-[10px] font-mono text-[#C5A059] block mb-3">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-xl font-serif font-light text-[#121212] mb-3">{svc.title}</h3>
                <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{svc.body}</p>
              </li>
            ))}
            <li className="bg-[#121212] p-8 flex flex-col justify-between lg:col-span-2">
              <p className="text-sm text-[#C4B9A8] font-light leading-relaxed">
                Technical drawings and 3D visualisation are prepared for project approval as part of the design consultation.
              </p>
              <Link
                to={`${DW_BASE}/consultation?role=Architect`}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059] inline-flex items-center gap-1.5"
              >
                Start with a brief <ArrowRight size={11} />
              </Link>
            </li>
          </ol>
        </div>
      </section>

      <section className="border-t border-[#EBE8E2] bg-[#121212] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            dark
            eyebrow="From enquiry to execution"
            title={
              <>
                How a project <span className="italic text-[#C5A059]">moves.</span>
              </>
            }
            intro="Quotations are prepared opening by opening, once the survey and configuration are confirmed. We do not work from a generic price list."
          />
          <ol className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#2A2A2A] border border-[#2A2A2A]">
            {journey.map((step, i) => (
              <li key={step} className="bg-[#121212] p-5">
                <span className="text-[10px] font-mono text-[#C5A059] block mb-2">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-serif font-light text-white">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[#EBE8E2] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Our Process" title="End-to-end, in detail." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {madioProcess.map((step) => (
              <div key={step.step} className="bg-white border border-[#EBE8E2] p-7">
                <span className="text-[10px] font-mono text-[#C5A059] font-medium block mb-3">Step {step.step}</span>
                <h3 className="text-lg font-serif font-light text-[#121212] mb-1">{step.title}</h3>
                <p className="text-xs italic text-[#6B6B6B] font-light mb-5">{step.tagline}</p>
                <ul className="space-y-2">
                  {step.bullets.map((b) => (
                    <li key={b} className="text-xs text-[#6B6B6B] font-light leading-relaxed flex items-start">
                      <span className="mt-1.5 mr-2.5 w-1 h-1 rounded-full shrink-0 bg-[#C5A059]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#EBE8E2] bg-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading eyebrow="Who we work with" title="Built for project teams." />
            <ul className="flex flex-wrap gap-2">
              {dwAudiences.map((a) => (
                <li key={a} className="text-[11px] uppercase tracking-[0.15em] font-sans border border-[#EBE8E2] px-3 py-2 text-[#121212]">
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#F4F1EA] border border-[#EBE8E2] p-8">
            <h3 className="text-xl font-serif font-light text-[#121212] mb-3">Sharing drawings</h3>
            <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-6">
              Send plans, elevations, window schedules or reference images with your brief. Email works best for large files;
              WhatsApp suits photos and quick references.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`mailto:${DW_EMAIL}?subject=${encodeURIComponent("Project drawings for Madio Doors & Windows")}`}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-[#121212] hover:text-[#C5A059]"
              >
                <Mail size={14} /> {DW_EMAIL}
              </a>
              <a
                href={dwWhatsAppLink("Hello Madio Doors and Windows, I'd like to share drawings for a project.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-[#121212] hover:text-[#C5A059]"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <ConsultBand />
    </div>
  );
};
