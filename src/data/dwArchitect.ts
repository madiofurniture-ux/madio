// ============================================================
// MADIO Doors & Windows — architect-facing content model.
//
// Everything here either restates client-confirmed data that already lives
// in doorsWindows.ts (catalogue specs, process copy, typologies) or is an
// empty, typed slot waiting for real client material (projects, documents).
// Do not add specifications, project names, client names, documents or
// prices that the client has not supplied.
// ============================================================

import { dwCategories, dwSystems, getCategoryPhotos } from "./doorsWindows";
import type { DWCategoryId } from "./doorsWindows";

import { DW_BASE, dwNavLinks } from "./dwNav";
export { DW_BASE, dwNavLinks };

export const DW_POSITIONING = {
  eyebrow: "Madio Doors & Windows",
  line: "Architectural Aluminium Systems",
  tagline: "Designed for Architecture. Engineered for Living.",
  support:
    "We work with architects, designers and premium customers to translate architectural intent into considered aluminium door and window solutions.",
};

// WhatsApp — the number already published across the site.
export const DW_WHATSAPP_NUMBER = "919948601899";
export const dwWhatsAppLink = (text = "Hello Madio Doors and Windows, I'd like to discuss a project.") =>
  `https://wa.me/${DW_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
export const DW_EMAIL = "info@madio.in";

// --------------- Systems grouped by architectural application ---------------
// Only categories Madio lists in its own catalogue. Lift-and-slide is not in
// the catalogue, so it has no group. Fixed glazing and insect mesh are
// configurations/options of the systems below and are covered on the
// Design & Materials page rather than given product pages of their own.
export interface DWApplicationGroup {
  id: string;
  title: string;
  body: string;
  systemIds: DWCategoryId[];
}

export const dwApplicationGroups: DWApplicationGroup[] = [
  {
    id: "sliding",
    title: "Sliding Windows & Doors",
    body: "Slim-sightline sliding systems in 2-track and 3-track configurations, from compact apartment openings to full-height living-room walls.",
    systemIds: ["hl-ultra-slim", "hl-vista-slim", "hl-elite-gulf-slim", "hl-retro-gulf-slim", "hl-eco-gulf-slim"],
  },
  {
    id: "large-format",
    title: "Large-Format Glazing",
    body: "Systems engineered for large openings: up to 4500 mm in height with a 300 kg load capacity on the Vista Slim.",
    systemIds: ["hl-vista-slim", "hl-elite-gulf-slim"],
  },
  {
    id: "casement",
    title: "Casement Doors & Windows",
    body: "Openable systems with continuous weather gaskets and single or multi-point locking, for entrances, bedrooms and ventilation-led rooms.",
    systemIds: ["hl-50-casement-door", "casement-windows-openable"],
  },
  {
    id: "folding",
    title: "Folding Systems",
    body: "Sliding folding bi-fold systems in multiple panel arrangements, for openings that need to clear completely.",
    systemIds: ["sliding-folding-bifold"],
  },
  {
    id: "partitions",
    title: "Glass Partitions",
    body: "Glass partition and door systems in 12 mm glass for open-plan residential and commercial interiors.",
    systemIds: ["glass-partitions-doors"],
  },
  {
    id: "blinds",
    title: "Motorised Integrated Blinds",
    body: "Motorised blinds integrated into the window system. Specifications are shared on request.",
    systemIds: ["motorised-integrated-blinds"],
  },
  {
    id: "also",
    title: "Also from Madio",
    body: "Aluminium systems that complete the building envelope and interior.",
    systemIds: ["metal-ceiling-systems", "balcony-railing-system", "modular-partition-facade"],
  },
];

/** A category has a public page once it has confirmed specs or photos. */
export const hasPublicPage = (id: DWCategoryId): boolean => {
  const meta = dwCategories.find((c) => c.id === id);
  return !!meta && (meta.isPopulated || getCategoryPhotos(id).length > 0);
};

// --------------- Architects & design professionals ---------------
// Wording follows the brief, limited to services Madio's own process copy
// (madioProcess in doorsWindows.ts) already describes. No structural
// engineering, calculations or in-house fabrication is claimed.
export const dwArchitectServices = [
  {
    title: "Architectural consultation",
    body: "We discuss the project, its design intent, the opening requirements and how each space will be used.",
  },
  {
    title: "System selection",
    body: "We recommend suitable systems from the Madio range for each opening, based on its size, use, orientation and climate.",
  },
  {
    title: "Material coordination",
    body: "Aluminium profiles, glazing, hardware and finishes are reviewed together, so the system supports the material palette of the project.",
  },
  {
    title: "Dimensional coordination",
    body: "Site assessment and precise measurement, so that every opening is quoted and produced to its built dimensions.",
  },
  {
    title: "Project quotation",
    body: "A project-specific quotation itemised opening by opening (typology, specification, width × height and area) from confirmed configurations and measurements.",
  },
  {
    title: "Installation coordination",
    body: "Specialist-trained installation teams follow Madio's installation protocols: weather-sealing, alignment, hardware calibration and protection of surrounding finishes.",
  },
  {
    title: "Project handover",
    body: "A post-installation quality audit and sign-off, warranty coverage documented per system, and care and maintenance guidance.",
  },
];

export const dwAudiences = [
  "Architects",
  "Interior designers",
  "Villa developers",
  "Builders",
  "Project consultants",
  "Hospitality and institutional project teams",
  "Homeowners building to a design",
];

// --------------- Technical resources ---------------
// A resource with `file` renders as a download; without one it renders as a
// "request" link into the consultation form. Add real files only (PDF/DWG
// supplied by the client), e.g. file: "/resources/madio-dw-catalogue-2026.pdf"
// placed in public/resources/. Never upload third-party documents under the
// Madio name.
export type DWResourceKind =
  | "Brochure"
  | "Catalogue"
  | "Profile drawings"
  | "Section drawings"
  | "Configuration diagrams"
  | "Glass specification"
  | "Hardware details"
  | "Finish chart"
  | "Installation guidance"
  | "Maintenance & care"
  | "Technical manual"
  | "CAD / BIM";

export interface DWResource {
  id: string;
  title: string;
  kind: DWResourceKind;
  description: string;
  systemIds?: DWCategoryId[];
  file?: string;
  fileFormat?: string;
}

export const dwResources: DWResource[] = [
  {
    id: "catalogue-2026",
    title: "Madio Doors & Windows Catalogue 2026",
    kind: "Catalogue",
    description: "The full system catalogue: product descriptions, track and frame dimensions, glass ranges and performance data.",
  },
  {
    id: "profile-drawings",
    title: "Profile drawings",
    kind: "Profile drawings",
    description: "Profile cross-sections for each HL system.",
    systemIds: dwSystems.map((s) => s.id),
  },
  {
    id: "section-drawings",
    title: "Section and installation details",
    kind: "Section drawings",
    description: "Head, sill and jamb sections for detailing openings.",
    systemIds: dwSystems.map((s) => s.id),
  },
  {
    id: "configuration-diagrams",
    title: "Opening configuration diagrams",
    kind: "Configuration diagrams",
    description: "2-track, 3-track, casement, fixed and combination configurations, and bi-fold panel arrangements.",
  },
  {
    id: "glass-spec",
    title: "Glass specification guide",
    kind: "Glass specification",
    description: "Single, DGU and laminated glazing options and the glass thickness range each system accepts.",
  },
  {
    id: "hardware",
    title: "Hardware and locking details",
    kind: "Hardware details",
    description: "Imported European hardware, single and multi-point locking options.",
  },
  {
    id: "finish-chart",
    title: "Finish chart",
    kind: "Finish chart",
    description: "Powder-coat RAL colours, anodised and wood-grain finishes.",
  },
  {
    id: "installation",
    title: "Installation guidance",
    kind: "Installation guidance",
    description: "Opening preparation and site requirements before installation.",
  },
  {
    id: "maintenance",
    title: "Care and maintenance",
    kind: "Maintenance & care",
    description: "Cleaning, hardware adjustment and annual maintenance guidance for installed systems.",
  },
  {
    id: "cad-bim",
    title: "CAD / BIM files",
    kind: "CAD / BIM",
    description: "Drawing files for design and documentation, where available for the selected system.",
    systemIds: dwSystems.map((s) => s.id),
  },
];

export const resourcesForSystem = (id: DWCategoryId): DWResource[] =>
  dwResources.filter((r) => r.systemIds?.includes(id));

// --------------- Project portfolio ---------------
// Real Madio installations only. Inspiration or render imagery must set
// isInspiration: true and is labelled as such on the page. Architect names
// only with their permission.
export const dwProjectTypes = [
  "Luxury villas",
  "Premium residences",
  "Apartments",
  "Commercial projects",
  "Hospitality projects",
  "Renovation projects",
] as const;
export type DWProjectType = (typeof dwProjectTypes)[number];

export interface DWProject {
  slug: string;
  name: string;
  location: string;
  type: DWProjectType;
  architect?: string;
  systemIds: DWCategoryId[];
  configurations?: string[];
  glassAndFinish?: string;
  photos: { src: string; alt: string }[];
  installationNotes?: string;
  challengeAndSolution?: string;
  isInspiration?: boolean;
}

export const dwProjects: DWProject[] = [];

// --------------- Consultation form options ---------------
export const dwRoles = [
  "Architect",
  "Interior designer",
  "Developer",
  "Builder / contractor",
  "Project consultant",
  "Homeowner",
  "Other",
];

export const dwProjectStages = [
  "Concept design",
  "Design development",
  "Tender / costing",
  "Under construction",
  "Ready for windows",
  "Renovation",
];

export const dwTimelines = ["Within 1 month", "1 to 3 months", "3 to 6 months", "More than 6 months", "Not decided yet"];

export const dwConsultProjectTypes = [
  "Luxury villa",
  "Premium residence",
  "Apartment",
  "Commercial",
  "Hospitality",
  "Institutional",
  "Renovation",
];

// Area convention used by Madio's quotations (CRM: sft = W×H mm / 90,000).
export const SFT_DIVISOR = 90_000;
export const openingSft = (widthMm: number, heightMm: number, qty = 1): number =>
  widthMm > 0 && heightMm > 0 && qty > 0 ? (widthMm * heightMm * qty) / SFT_DIVISOR : 0;
