// ============================================================
// Doors & Windows category metadata — single source of truth.
//
// Mirrors shared/furnitureCategories.ts exactly in structure and purpose:
// deliberately framework-agnostic (no Vite-specific imports like
// import.meta.glob) so this file can be imported from BOTH:
//   - the frontend (src/data/doorsWindows.ts re-exports these), and
//   - Vercel serverless functions (api/*.ts) that need to validate an
//     upload's target category/folder server-side.
//
// The upload-provider folder for a category is always its `id` — e.g.
// category "vista-32" -> folder "vista-32" — same convention as
// Furniture (see shared/furnitureCategories.ts and api/cloudinary-sign.ts).
// ============================================================

export type DoorsWindowsCategoryId =
  | "slidefold"
  | "vista-32"
  | "monoslim"
  | "breeze-35"
  | "zephyr-29"
  | "phantom"
  | "titan-40"
  | "casement-40"
  | "casement-52"
  | "division-82"
  | "division-82-dg"
  | "division-85"
  | "division-85-dg"
  | "slimwall-25x50"
  | "grandwall-100"
  | "grandwall-100-dg"
  | "ultraslim-16x25"
  | "metal-ceiling-systems"
  | "balcony-railing-system"
  | "modular-partition-facade"
  | "motorised-integrated-blinds";

export interface DoorsWindowsCategoryMeta {
  id: DoorsWindowsCategoryId;
  name: string;
  description: string;
  isPopulated: boolean;
  // For un-populated categories: the one real, client-confirmed data point
  // (from the handwritten notes) — shown honestly instead of inventing specs.
  confirmedNote?: string;
  // Sliding Folding Bi-Fold only: real panel-arrangement configurations.
  panelConfigs?: string[];
}

export const doorsWindowsCategories: DoorsWindowsCategoryMeta[] = [
  {
    id: "slidefold",
    name: "Madio SlideFold",
    description: "Panoramic folding system.",
    isPopulated: true,
    // Slide & fold panel arrangements, from the 49-option opening-types catalogue.
    panelConfigs: ["3+0", "3+1", "5+0", "5+1", "2+2 (centre opening)", "3+3"],
  },
  {
    id: "vista-32",
    name: "Madio Vista 32",
    description: "Classic 32 mm sliding profile for large-format openings.",
    isPopulated: true,
  },
  {
    id: "monoslim",
    name: "Madio Monoslim",
    description: "Ultra-thin profile sliding window.",
    isPopulated: true,
  },
  {
    id: "breeze-35",
    name: "Madio Breeze 35",
    description: "Versatile 35 mm sliding system.",
    isPopulated: true,
  },
  {
    id: "zephyr-29",
    name: "Madio Zephyr 29",
    description: "Compact 29 mm sliding system.",
    isPopulated: true,
  },
  {
    id: "phantom",
    name: "Madio Phantom",
    description: "Superslim precision sliding profile.",
    isPopulated: true,
  },
  {
    id: "titan-40",
    name: "Madio Titan 40",
    description: "Heavy-duty 40 mm sliding system.",
    isPopulated: true,
  },
  {
    id: "casement-40",
    name: "Madio Casement 40",
    description: "40 mm casement system.",
    isPopulated: true,
  },
  {
    id: "casement-52",
    name: "Madio Casement 52",
    description: "52 mm premium casement.",
    isPopulated: true,
  },
  {
    id: "division-82",
    name: "Madio Division 82",
    description: "82 mm single glass partition.",
    isPopulated: true,
  },
  {
    id: "division-82-dg",
    name: "Madio Division 82 DG",
    description: "82 mm double glass partition.",
    isPopulated: true,
  },
  {
    id: "division-85",
    name: "Madio Division 85",
    description: "85 mm single glass partition.",
    isPopulated: true,
  },
  {
    id: "division-85-dg",
    name: "Madio Division 85 DG",
    description: "85 mm double glass partition.",
    isPopulated: true,
  },
  {
    id: "slimwall-25x50",
    name: "Madio Slimwall 25x50",
    description: "25 × 50 mm slim glass partition.",
    isPopulated: true,
  },
  {
    id: "grandwall-100",
    name: "Madio Grandwall 100",
    description: "100 mm single glass partition.",
    isPopulated: true,
  },
  {
    id: "grandwall-100-dg",
    name: "Madio Grandwall 100 DG",
    description: "100 mm double glass partition.",
    isPopulated: true,
  },
  {
    id: "ultraslim-16x25",
    name: "Madio Ultraslim 16x25",
    description: "16 × 25 mm slim glass partition.",
    isPopulated: true,
  },
  {
    id: "metal-ceiling-systems",
    name: "Metal Ceiling Systems",
    description: "Aluminium metal ceiling systems, including baffle-ceiling configurations.",
    isPopulated: false,
    confirmedNote: "Material: aluminium only. Includes a baffle-ceiling sub-type, covering all kinds of metal ceiling series.",
  },
  {
    id: "balcony-railing-system",
    name: "Balcony Railing System",
    description: "Aluminium balcony railing systems for residential and commercial facades.",
    isPopulated: false,
    confirmedNote: "Material: aluminium only.",
  },
  {
    id: "modular-partition-facade",
    name: "Modular Partition / Facade System",
    description: "Modular partition and facade systems for flexible interior and exterior configurations.",
    isPopulated: false,
  },
  {
    id: "motorised-integrated-blinds",
    name: "Motorised Integrated Blinds",
    description: "Motorised blind systems integrated within the glazed unit.",
    isPopulated: false,
  },
];

export const isDoorsWindowsCategoryId = (s: string): s is DoorsWindowsCategoryId =>
  doorsWindowsCategories.some((c) => c.id === s);
