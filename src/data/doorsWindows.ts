// ============================================================
// MADIO Doors & Windows — data model and catalogue
//
// SOURCE OF TRUTH: the 2026 product catalogue "Madio Doors & Windows —
// Product Catalogue" (client-supplied PDF, 2026-11) for system names and
// specs; "Madio Catalogue 2026 — Visual Masterpiece.pdf" + handwritten
// planning notes (2026-07-16) for the general copy (process, materials,
// standards, comparison). The earlier HL-named systems were replaced by the
// 2026 range on the client's instruction.
//
// CORRECTIONS APPLIED — do not revert without client sign-off:
//   1. The source PDF calls Madio "a premium manufacturer." Madio does not
//      manufacture in-house — systems are custom-engineered to Madio's spec
//      by a production partner. All copy here is reworded to avoid
//      "manufacturer" / "we manufacture" / "our factory" framing, and the
//      production partner is never named.
//   2. The source PDFs claim 15 years (and, in the 2026 catalogue, 12 years
//      for sliding and casement, 15 for partitions). The
//      client has only confirmed 10 years as current truth, and specifically
//      per-product (not a sitewide guarantee). Every warranty field below is
//      "10 Years", stored per-system and hasValue()-gated in the UI — never
//      hardcoded as a single banner claim — so individual systems can be
//      corrected independently once the client confirms further.
//      The figure lives in DW_WARRANTY below, so a confirmed change is a
//      one-line edit that flows to every system and the standards table.
//
// Every other spec below (dimensions, track widths, wind load, glass
// thickness, load capacity, locking systems, material comparison, typologies,
// process steps, performance standards) is real, unaltered client data.
// ============================================================

// --------------- Category types ---------------
// The static baseline (categories with real client-supplied catalogue data)
// lives in shared/doorsWindowsCategories.ts so Vercel serverless functions
// (api/*.ts) can validate against it without pulling in Vite-only code
// (import.meta.glob etc.) — same reasoning as furniture.ts /
// shared/furnitureCategories.ts. Admin-created categories (category
// management, Phase A) have no catalogue data by construction, are fetched
// fresh from Cloudinary at build time, and are merged in below — so
// DWCategoryId widens to plain `string` here rather than staying the static
// union, same as furniture.ts's FurnitureCategoryId.
export type DWCategoryId = string;
export interface DWCategoryMeta {
  id: DWCategoryId;
  name: string;
  description: string;
  isPopulated: boolean;
  confirmedNote?: string;
  panelConfigs?: string[];
}
import { doorsWindowsCategories as staticDWCategories, isDoorsWindowsCategoryId as isStaticDWCategoryId } from "../../shared/doorsWindowsCategories";
import { dynamicDoorsWindowsCategories } from "./dynamicCategories.generated";
import dwCategoryPhotosByCategory from "./dwCategoryPhotos.generated";

export const dwCategories: DWCategoryMeta[] = [
  ...staticDWCategories,
  ...dynamicDoorsWindowsCategories.map((dc) => ({
    id: dc.id,
    name: dc.name,
    description: "",
    isPopulated: false,
  })),
];

export const isDWCategoryId = (s: string): boolean =>
  isStaticDWCategoryId(s) || dynamicDoorsWindowsCategories.some((dc) => dc.id === s);

// Confirmed warranty figure, per system. See correction note 2 above.
export const DW_WARRANTY = "10 Years";

// --------------- Product (populated systems) types ---------------

export interface DWTrackValue {
  twoTrack?: string;
  threeTrack?: string;
}

export interface DWSystemSpec {
  // Track table — 2-track / 3-track sliding systems only.
  trackWidth?: DWTrackValue;
  // Frame / visible height and interlock sightline.
  frameWidth?: string;
  frameHeight?: string;
  interlock?: string;

  // Flat specification table — populated where the PDF documents a value.
  glassThickness?: string;
  maxHeight?: string;
  maxWidth?: string;
  lockingSystem?: string;
  netOption?: string;
  loadCapacity?: string;
  windLoad?: string;

  // Per-product, hasValue()-gated — see correction note at top of file.
  warranty?: string;
}

export interface DWSpecRow {
  label: string;
  value: string;
}

export interface DWVisual {
  src: string;
  alt: string;
}

export interface DWSystem {
  id: DWCategoryId;
  name: string;
  tagline: string;
  family: DWFamily;
  badge?: string;
  description: string;
  // The catalogue's own spec table, row for row, in its order.
  specRows: DWSpecRow[];
  // The catalogue's highlight tags (warranty tags left out on purpose).
  highlights: string[];
  coreFeatures: string[];
  // Normalised subset of specRows, used for comparison tables and cards.
  specs: DWSystemSpec;
  bestFor: string;
  images: string[];
  // Illustrative catalogue imagery, never presented as a Madio installation.
  visual?: DWVisual;
}

// Vite glob: resolves clean product photography once the client supplies it.
// Catalogue PDF renders are physical-book photography (visible page spread/
// binding) and are not used here — same standard applied to furniture.ts,
// where raw catalogue crops are excluded in favour of a "coming soon" state.
const _dwImgs = import.meta.glob<string>(
  "../assets/doors-windows/*.{png,jpeg,jpg,webp}",
  { eager: true, import: "default" },
);

// Client-uploaded photos for a category, via the admin upload tool — same
// Cloudinary-sourced pipeline as Furniture (see furniture.ts's
// cloudinaryImagesFor). Cloudinary photos come first so a system's primary
// display image (images[0]) is real client photography once any exists;
// the static glob below is a fallback only, kept for parity with Furniture's
// transitional pattern (in practice always empty for D&W — no filename in
// src/assets/doors-windows/ matches a category id).
function dwImg(id: string): string[] {
  const cloudinaryUrls = getCategoryPhotos(id as DWCategoryId).map((p) => p.secureUrl);
  const png = _dwImgs[`../assets/doors-windows/${id}.png`];
  const jpeg = _dwImgs[`../assets/doors-windows/${id}.jpeg`];
  const jpg = _dwImgs[`../assets/doors-windows/${id}.jpg`];
  const staticUrl = png ?? jpeg ?? jpg;
  return staticUrl ? [...cloudinaryUrls, staticUrl] : cloudinaryUrls;
}

// Every Cloudinary photo uploaded for a category, with its stable MDW-XXX
// code — used both by dwImg() above (populated systems) and by
// DoorsWindows.tsx / DoorsWindowsDetail.tsx to render a real photo grid for
// an un-populated category once it has client photos, replacing the
// "Coming Soon" state (same pattern Bar Chairs uses in Furniture).
export interface DWCategoryPhoto {
  productCode: string;
  secureUrl: string;
  createdAt: string;
}

// Most recently uploaded first — same reasoning as Furniture's
// FurnitureCategoryPage.tsx: Cloudinary's own creation timestamp, not code
// order, is the correct sort key.
export const getCategoryPhotos = (id: DWCategoryId): DWCategoryPhoto[] =>
  [...(dwCategoryPhotosByCategory[id] ?? [])].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );

// --------------- The 2026 range ---------------
// Source: "Madio Doors & Windows — Product Catalogue" (client-supplied PDF,
// 2026-11). Names, subtitles, spec rows and highlight tags are copied as the
// catalogue prints them. Two deliberate exclusions, per the correction notes
// above: the catalogue's per-system warranty figures (12 / 15 years) are NOT
// shown (DW_WARRANTY stays the confirmed figure until the client confirms a
// change), and nothing here says Madio manufactures in-house.
// Photos: the catalogue's own imagery is illustrative (not Madio
// installations), so it sits in `visual` and is captioned as such on the page.
// Real client photography uploaded via /admin/upload always comes first.

export type DWFamily = "sliding-folding" | "casement" | "glass-partitions";

export const dwFamilies: { id: DWFamily; title: string }[] = [
  { id: "sliding-folding", title: "Sliding & Folding" },
  { id: "casement", title: "Casement Windows" },
  { id: "glass-partitions", title: "Glass Partitions" },
];

const visuals = import.meta.glob<string>("../assets/dw2026/*.webp", { eager: true, import: "default" });
const visual = (id: string, alt: string): DWVisual | undefined => {
  const src = visuals[`../assets/dw2026/${id}.webp`];
  return src ? { src, alt } : undefined;
};
export const dwAsset = (name: string): string | undefined => visuals[`../assets/dw2026/${name}.webp`];

const row = (label: string, value: string): DWSpecRow => ({ label, value });

interface DWSystemInput extends Omit<DWSystem, "images" | "visual" | "coreFeatures" | "bestFor"> {
  visualAlt: string;
  bestFor?: string;
}

const sys = (s: DWSystemInput): DWSystem => {
  const { visualAlt, ...rest } = s;
  return {
    ...rest,
    coreFeatures: rest.highlights,
    bestFor: rest.bestFor ?? "",
    images: dwImg(rest.id),
    visual: visual(rest.id, visualAlt),
    specs: { ...rest.specs, warranty: DW_WARRANTY },
  };
};

export const dwSystems: DWSystem[] = [
  // ---------------- Sliding & Folding ----------------
  sys({
    id: "slidefold",
    name: "Madio SlideFold",
    tagline: "Panoramic Folding System",
    family: "sliding-folding",
    badge: "Signature",
    description:
      "A panoramic slide-and-fold system for openings that need to clear completely. Panels fold and stack to one or both sides on 90° track joints with 45° sash joints, take glass from 5 to 20 mm and lock with multipoint hardware.",
    specRows: [
      row("Window Height (Max)", "2500 mm"),
      row("Sash Height & Weight", "50 / 39 mm"),
      row("Track Joint", "90°"),
      row("Sash Joint", "45°"),
      row("Glass Range", "5 – 20 mm"),
      row("Locking Type", "Multipoint"),
      row("Roller Capacity (2 Pcs)", "180 kg"),
    ],
    highlights: ["Sound Insulation", "Water Tightness", "Colour Choice", "Impact Resistance"],
    specs: { maxHeight: "2500 mm", glassThickness: "5 – 20 mm", lockingSystem: "Multipoint", loadCapacity: "180 kg (2 rollers)" },
    visualAlt: "Living room opening fully onto a garden through folding glass doors",
  }),
  sys({
    id: "vista-32",
    name: "Madio Vista 32",
    tagline: "Classic 32mm Profile",
    family: "sliding-folding",
    description:
      "A large-format sliding system: shutters up to 4500 mm high and 2000 mm wide on 300 / 600 kg rollers, 26 – 32 mm glass, a 19 mm interlock sightline and multi locking, in 6063 aluminium alloy.",
    specRows: [
      row("2-Track Frame Width", "152 mm"),
      row("Frame Height", "42 mm"),
      row("Interlock Sightline", "19 mm"),
      row("Glass Thickness", "26 – 32 mm"),
      row("Max Shutter Height", "4500 mm"),
      row("Max Shutter Width", "2000 mm"),
      row("Aluminium Alloy", "6063"),
      row("Locking Type", "Multi Locking"),
      row("Roller Capacity", "300 / 600 kg"),
    ],
    highlights: ["Multi Locking", "Alloy 6063", "Large Format"],
    specs: {
      trackWidth: { twoTrack: "152 mm" },
      frameHeight: "42 mm",
      interlock: "19 mm",
      glassThickness: "26 – 32 mm",
      maxHeight: "4500 mm",
      maxWidth: "2000 mm",
      lockingSystem: "Multi locking",
      loadCapacity: "300 / 600 kg",
    },
    visualAlt: "Double-height lobby glazed floor to ceiling with sliding panels",
  }),
  sys({
    id: "monoslim",
    name: "Madio Monoslim",
    tagline: "Ultra-Thin Profile Window",
    family: "sliding-folding",
    badge: "Most Popular",
    description:
      "An ultra-thin sliding window with a 28 mm frame height and a 19 mm interlock sightline, in 2-track and 3-track frames. Shutters reach 3500 mm high and 2000 mm wide on 250 / 500 kg rollers, with 5 – 23 mm glass.",
    specRows: [
      row("2-Track Frame Width", "114 mm"),
      row("3-Track Frame Width", "169 mm"),
      row("Frame Height", "28 mm"),
      row("Interlock Sightline", "19 mm"),
      row("Glass Thickness", "5 – 23 mm"),
      row("Max Shutter Height", "3500 mm"),
      row("Max Shutter Width", "2000 mm"),
      row("Aluminium Alloy", "6063"),
      row("Roller Capacity", "250 / 500 kg"),
    ],
    highlights: ["Ultra-Slim Frame", "Multi Locking", "Alloy 6063"],
    specs: {
      trackWidth: { twoTrack: "114 mm", threeTrack: "169 mm" },
      frameHeight: "28 mm",
      interlock: "19 mm",
      glassThickness: "5 – 23 mm",
      maxHeight: "3500 mm",
      maxWidth: "2000 mm",
      lockingSystem: "Multi locking",
      loadCapacity: "250 / 500 kg",
    },
    visualAlt: "Living room with a full-height slim-framed sliding window onto a hillside",
  }),
  sys({
    id: "breeze-35",
    name: "Madio Breeze 35",
    tagline: "Versatile 35mm Sliding System",
    family: "sliding-folding",
    description:
      "A versatile 35 mm sliding system in 2-track and 3-track frames, with multi or single locking and an optional mosquito net. Shutters reach 3500 mm high and 2000 mm wide, with 5 – 24 mm glass and 250 / 500 kg rollers.",
    specRows: [
      row("2-Track Frame Width", "95 mm"),
      row("3-Track Frame Width", "145 mm"),
      row("Frame Height", "31 / 41 mm"),
      row("Interlock Sightline", "25 mm"),
      row("Glass Thickness", "5 – 24 mm"),
      row("Max Shutter Height", "3500 mm"),
      row("Max Shutter Width", "2000 mm"),
      row("Aluminium Alloy", "6063"),
      row("Locking Type", "Multi / Single"),
      row("Mosquito Net", "Optional"),
      row("Roller Capacity", "250 / 500 kg"),
    ],
    highlights: ["Sound Insulation", "Water Tightness", "Colour Choice", "Impact Resistance"],
    specs: {
      trackWidth: { twoTrack: "95 mm", threeTrack: "145 mm" },
      frameHeight: "31 / 41 mm",
      interlock: "25 mm",
      glassThickness: "5 – 24 mm",
      maxHeight: "3500 mm",
      maxWidth: "2000 mm",
      lockingSystem: "Multi / single",
      netOption: "Mosquito net, optional",
      loadCapacity: "250 / 500 kg",
    },
    visualAlt: "Bedroom under a pitched roof with a wide glazed sliding wall",
  }),
  sys({
    id: "zephyr-29",
    name: "Madio Zephyr 29",
    tagline: "Compact 29mm Sliding System",
    family: "sliding-folding",
    description:
      "A compact 29 mm sliding system in 2-track and 3-track frames, with a 23 mm slim interlock, 90° track and sash joints and multipoint locking, for windows up to 3000 mm high.",
    specRows: [
      row("2-Track Depth & Height", "83 / 55 mm"),
      row("3-Track Depth & Height", "125 / 55 mm"),
      row("Window Height (Max)", "3000 mm"),
      row("Sash Height & Weight", "23 / 39 mm"),
      row("Slim Interlocking", "23 mm"),
      row("Track Joint", "90°"),
      row("Sash Joint", "90°"),
      row("Glass Range", "5 – 20 mm"),
      row("Locking Type", "Multipoint"),
      row("Roller Capacity", "180 kg"),
    ],
    highlights: ["Compact Profile", "Multipoint Lock", "Slim Interlock"],
    specs: {
      trackWidth: { twoTrack: "83 mm", threeTrack: "125 mm" },
      frameHeight: "55 mm",
      interlock: "23 mm",
      glassThickness: "5 – 20 mm",
      maxHeight: "3000 mm",
      lockingSystem: "Multipoint",
      loadCapacity: "180 kg",
    },
    visualAlt: "Gridded dark-framed window looking out over a forested valley",
  }),
  sys({
    id: "phantom",
    name: "Madio Phantom",
    tagline: "Superslim Precision Profile",
    family: "sliding-folding",
    description:
      "A superslim sliding profile with a 20 mm interlocking sightline and a wide 5 – 30 mm glass range, for windows up to 3500 mm high on 280 kg rollers with multipoint locking.",
    specRows: [
      row("2-Track Depth & Height", "150 / 31 mm"),
      row("Window Height (Max)", "3500 mm"),
      row("Sash Height & Weight", "20 / 39 mm"),
      row("Slim Interlocking", "20 mm"),
      row("Track Joint", "90°"),
      row("Sash Joint", "90°"),
      row("Glass Range", "5 – 30 mm"),
      row("Locking Type", "Multipoint"),
      row("Roller Capacity", "280 kg"),
    ],
    highlights: ["20mm Sightline", "Wide Glass Range", "Multipoint Lock"],
    specs: {
      trackWidth: { twoTrack: "150 mm" },
      frameHeight: "31 mm",
      interlock: "20 mm",
      glassThickness: "5 – 30 mm",
      maxHeight: "3500 mm",
      lockingSystem: "Multipoint",
      loadCapacity: "280 kg",
    },
    visualAlt: "Tall glazed opening framing a sea view",
  }),
  sys({
    id: "titan-40",
    name: "Madio Titan 40",
    tagline: "Heavy Duty 40mm System",
    family: "sliding-folding",
    badge: "Heavy Duty",
    description:
      "The heavy-duty system of the range: windows up to 4800 mm high on 380 kg rollers, 38 mm glass, a 20 mm slim interlock and multipoint locking.",
    specRows: [
      row("2-Track Depth & Height", "154 / 54 mm"),
      row("Window Height (Max)", "4800 mm"),
      row("Sash Height & Weight", "20 / 39 mm"),
      row("Slim Interlocking", "20 mm"),
      row("Track Joint", "90°"),
      row("Sash Joint", "90°"),
      row("Glass Range", "38 mm"),
      row("Locking Type", "Multipoint"),
      row("Roller Capacity", "380 kg"),
    ],
    highlights: ["4800mm Max Height", "380Kg Roller", "Heavy Duty"],
    specs: {
      trackWidth: { twoTrack: "154 mm" },
      frameHeight: "54 mm",
      interlock: "20 mm",
      glassThickness: "38 mm",
      maxHeight: "4800 mm",
      lockingSystem: "Multipoint",
      loadCapacity: "380 kg",
    },
    visualAlt: "Tall glazed doors opening onto a balcony above the sea",
  }),
  // ---------------- Casement Windows ----------------
  sys({
    id: "casement-40",
    name: "Madio Casement 40",
    tagline: "40mm Casement System",
    family: "casement",
    description:
      "A 40 mm casement system with 45° precision joints, a weather seal and single or multipoint locking, for windows up to 1500 mm high with 5 – 20 mm glass.",
    specRows: [
      row("Track Depth & Visible Height", "83 / 50 mm"),
      row("Window Height (Max)", "1500 mm"),
      row("Track Joint", "45°"),
      row("Sash Joint", "45°"),
      row("Glass Range", "5 – 20 mm"),
      row("Locking Type", "Single & Multipoint"),
    ],
    highlights: ["Single & Multipoint", "45° Precision Joints", "Weather Seal"],
    specs: { frameHeight: "50 mm", glassThickness: "5 – 20 mm", maxHeight: "1500 mm", lockingSystem: "Single & multipoint" },
    visualAlt: "Bedroom with a row of casement windows",
  }),
  sys({
    id: "casement-52",
    name: "Madio Casement 52",
    tagline: "52mm Premium Casement",
    family: "casement",
    description:
      "A 52 mm premium casement with 45° joints and single or multipoint locking, for windows up to 1500 mm high with 5 – 20 mm glass. Rated for sound insulation, water tightness, wind load and impact resistance.",
    specRows: [
      row("Track Depth & Visible Height", "83 / 50 mm"),
      row("Window Height (Max)", "1500 mm"),
      row("Track Joint", "45°"),
      row("Sash Joint", "45°"),
      row("Glass Range", "5 – 20 mm"),
      row("Locking Type", "Single & Multipoint"),
    ],
    highlights: ["Sound Insulation", "Water Tightness", "Wind Load Rated", "Impact Resistance"],
    specs: { frameHeight: "50 mm", glassThickness: "5 – 20 mm", maxHeight: "1500 mm", lockingSystem: "Single & multipoint" },
    visualAlt: "Reading corner lit by dark-framed casement windows",
  }),
  // ---------------- Glass Partitions ----------------
  sys({
    id: "division-82",
    name: "Madio Division 82",
    tagline: "82mm Single Glass Partition",
    family: "glass-partitions",
    description: "An 82 mm single glass partition in 6 mm toughened glass with a 12 mm dual-slide partition board and a powder-coated finish.",
    specRows: [row("Glass Type", "6mm Toughened"), row("Partition Board", "12mm Dual Slide"), row("Finish", "Powder Coated")],
    highlights: ["6mm Toughened Glass", "Powder Coated", "Special Hardware"],
    specs: { glassThickness: "6 mm toughened" },
    visualAlt: "Frosted glass partition wall in an open interior",
  }),
  sys({
    id: "division-82-dg",
    name: "Madio Division 82 DG",
    tagline: "82mm Double Glass Partition",
    family: "glass-partitions",
    description: "The double glass version of the Division 82, in 6 mm toughened glass with a 12 mm dual-slide partition board, powder coated, with a motorised curtain option.",
    specRows: [
      row("Glass Type", "6mm Toughened"),
      row("Partition Board", "12mm Dual Slide"),
      row("Finish", "Powder Coated"),
      row("Special Feature", "Motorized Curtain"),
    ],
    highlights: ["Double Glass", "Motorized Curtain Option", "Powder Coated"],
    specs: { glassThickness: "6 mm toughened" },
    visualAlt: "Glazed mezzanine partition above a lounge",
  }),
  sys({
    id: "division-85",
    name: "Madio Division 85",
    tagline: "85mm Single Glass Partition",
    family: "glass-partitions",
    description: "An 85 mm single glass partition in 6 mm toughened glass with a 12 mm dual-slide partition board and a powder-coated finish, for sound-proof and heat-resistant interiors.",
    specRows: [row("Glass Type", "6mm Toughened"), row("Partition Board", "12mm Dual Slide"), row("Finish", "Powder Coated")],
    highlights: ["Sound Proof", "Heat Resistance", "6mm Toughened"],
    specs: { glassThickness: "6 mm toughened" },
    visualAlt: "Office cabin enclosed by a glass partition",
  }),
  sys({
    id: "division-85-dg",
    name: "Madio Division 85 DG",
    tagline: "85mm Double Glass Partition",
    family: "glass-partitions",
    description: "The double glass version of the Division 85, in 6 mm toughened glass with a 12 mm dual-slide partition board, powder coated, with a motorised curtain option.",
    specRows: [
      row("Glass Type", "6mm Toughened"),
      row("Partition Board", "12mm Dual Slide"),
      row("Finish", "Powder Coated"),
      row("Special Feature", "Motorized Curtain"),
    ],
    highlights: ["Sound Proof", "Heat Resistance", "Motorized Curtain"],
    specs: { glassThickness: "6 mm toughened" },
    visualAlt: "Frosted double glass partition wall",
  }),
  sys({
    id: "slimwall-25x50",
    name: "Madio Slimwall 25x50",
    tagline: "25x50mm Slim Glass Partition",
    family: "glass-partitions",
    description: "A slim glass partition on a 25 × 50 mm profile, taking 6 – 12 mm toughened glass, with a powder-coated finish.",
    specRows: [row("Glass Type", "6 – 12mm Toughened"), row("Profile", "25 x 50 mm"), row("Finish", "Powder Coated")],
    highlights: ["Sleek & Stylish", "6-12mm Glass", "Powder Coated"],
    specs: { glassThickness: "6 – 12 mm toughened" },
    visualAlt: "Slim-framed glass partition at mezzanine level",
  }),
  sys({
    id: "grandwall-100",
    name: "Madio Grandwall 100",
    tagline: "100mm Single Glass Partition",
    family: "glass-partitions",
    description: "A heavy-duty 100 mm profile single glass partition, taking 6 – 12 mm toughened glass, with a powder-coated finish.",
    specRows: [row("Glass Type", "6 – 12mm Toughened"), row("Profile Width", "100 mm"), row("Finish", "Powder Coated")],
    highlights: ["6-12mm Glass", "Heavy Duty Profile", "Powder Coated"],
    specs: { glassThickness: "6 – 12 mm toughened" },
    visualAlt: "Workspace behind a full-height glass partition",
  }),
  sys({
    id: "grandwall-100-dg",
    name: "Madio Grandwall 100 DG",
    tagline: "100mm Double Glass Partition",
    family: "glass-partitions",
    description: "The double glass version of the Grandwall 100: a 100 mm profile with 6 – 12 mm toughened glass and a powder-coated finish.",
    specRows: [
      row("Glass Type", "6 – 12mm Toughened"),
      row("Profile Width", "100 mm"),
      row("Configuration", "Double Glass"),
      row("Finish", "Powder Coated"),
    ],
    highlights: ["Double Glass", "6-12mm Toughened", "Powder Coated"],
    specs: { glassThickness: "6 – 12 mm toughened" },
    visualAlt: "Meeting room enclosed by a gridded black-framed glass partition",
  }),
  sys({
    id: "ultraslim-16x25",
    name: "Madio Ultraslim 16x25",
    tagline: "16x25mm Slim Glass Partition",
    family: "glass-partitions",
    description: "The slimmest partition profile in the range, 16 × 25 mm, for a frameless look with 6 – 12 mm toughened glass and a powder-coated finish.",
    specRows: [row("Glass Type", "6 – 12mm Toughened"), row("Profile", "16 x 25 mm"), row("Finish", "Powder Coated")],
    highlights: ["Ultra Slim Frame", "Frameless Look", "Powder Coated"],
    specs: { glassThickness: "6 – 12 mm toughened" },
    visualAlt: "Frosted glass partition with an ultra-slim frame",
  }),
];

// Hardware collection, from the same catalogue.
export const dwHardwarePro = {
  name: "Madio Hardware Pro",
  tagline: "Premium Hardware Collection",
  specRows: [
    row("Handle Models", "WPHH 2512, WPHH 2518"),
    row("Lock Model", "533 BTF"),
    row("Slide Controller", "WDSC 800, WDSC 900"),
    row("Multi-Lock Body", "WMLBS 9"),
    row("Finish", "Powder Coated / Chrome"),
  ],
  highlights: ["Multi-Point Locks", "Heavy Duty Rollers", "Premium Handles", "Corrosion Resistant"],
};

export const systemsInFamily = (f: DWFamily) => dwSystems.filter((s) => s.family === f);
/** Window and door systems (everything except interior glass partitions). */
export const dwOpeningSystems = dwSystems.filter((s) => s.family !== "glass-partitions");

// --------------- Overview page content (real, client-supplied data) ---------------

export const materialComparison = [
  { parameter: "Durability", aluminium: "40+ year lifespan; corrosion-resistant", wood: "15–25 years; prone to rot, termites", upvc: "20–30 years; yellows and warps" },
  { parameter: "Maintenance", aluminium: "Near-zero; wipe-clean finish", wood: "High; regular sanding, sealing, painting", upvc: "Low initially; non-repairable damage" },
  { parameter: "Strength-to-Weight", aluminium: "Superior; enables slim profiles and large spans", wood: "Heavy; limits maximum panel sizes", upvc: "Requires steel reinforcement for strength" },
  { parameter: "Design Flexibility", aluminium: "Powder-coated in any RAL colour, anodised finishes", wood: "Limited to paint or stain colours", upvc: "Limited colour options; cannot be repainted" },
  { parameter: "Thermal Performance", aluminium: "Thermal break technology for excellent insulation", wood: "Natural insulator but degrades with age", upvc: "Good insulation; weakens at weld joints" },
  { parameter: "Fire Resistance", aluminium: "Non-combustible; does not emit toxic fumes", wood: "Combustible; fire hazard", upvc: "Self-extinguishing but releases toxic gases" },
  { parameter: "Sustainability", aluminium: "100% recyclable; low embodied energy in recycling", wood: "Renewable but often unsustainably sourced", upvc: "Non-biodegradable; difficult to recycle" },
  { parameter: "Max Span Capability", aluminium: "Up to 4800 mm height with slim sightlines", wood: "Limited by structural weight", upvc: "Limited; requires thick profiles for rigidity" },
  { parameter: "Aesthetic Profile", aluminium: "Ultra-slim sightlines (19–25 mm interlock)", wood: "Bulky frames reduce glass area", upvc: "Wider frames compromise views" },
];

export const windowDoorTypologies = [
  { configuration: "2-Track Sliding", application: "Standard residential openings; balconies" },
  { configuration: "3-Track Sliding", application: "Wide openings; living rooms; commercial facades" },
  { configuration: "Casement (Openable)", application: "Bedrooms; bathrooms; ventilation-priority areas" },
  { configuration: "Fixed Glazing", application: "Picture windows; feature walls" },
  { configuration: "Combination Systems", application: "Mixed sliding + fixed for architectural flexibility" },
  { configuration: "Pleated Net Integration", application: "Insect protection without compromising aesthetics" },
];

export const aluminiumAdvantages = [
  { advantage: "Affordability", description: "Competitive pricing with superior long-term value; minimal maintenance costs over decades" },
  { advantage: "Durability", description: "Resistant to corrosion, warping, and UV degradation; maintains structural integrity for 40+ years" },
  { advantage: "Easy Maintenance", description: "Powder-coated finishes require only periodic wiping; no painting, staining, or sealing needed" },
  { advantage: "Design Versatility", description: "Available in unlimited RAL colours, wood-grain finishes, and anodised options to match any aesthetic" },
  { advantage: "Thermal Efficiency", description: "Advanced thermal break technology minimises heat transfer; reduces energy costs year-round" },
  { advantage: "Eco-Friendly", description: "100% recyclable with no loss of quality; significantly lower carbon footprint than alternatives" },
  { advantage: "Security", description: "Inherent strength allows for multi-point locking systems; superior resistance to forced entry" },
  { advantage: "Acoustic Insulation", description: "Combined with appropriate glazing, achieves sound reduction up to 38 dB" },
];

// Process step 2 reworded from the PDF's "Precision Manufacturing" — Madio does
// not manufacture in-house (see correction note at top of file).
export const madioProcess = [
  {
    step: 1,
    title: "Design & Consulting",
    tagline: "Your vision, our expertise.",
    bullets: [
      "Dedicated design consultation with experienced fenestration specialists",
      "Site assessment and precise measurement services",
      "System recommendation based on architectural requirements, orientation, and climate",
      "3D visualisation and technical drawings for project approval",
      "Budget planning and value engineering support",
    ],
  },
  {
    step: 2,
    title: "Precision Engineering",
    tagline: "Where engineering meets artistry.",
    bullets: [
      "State-of-the-art CNC fabrication for micron-level accuracy",
      "Premium-grade aluminium alloy (6063-T5) for optimal strength and finish",
      "Multi-stage powder coating with QUALICOAT-standard finishes",
      "Rigorous quality control at every stage of the process",
      "Custom colour matching and special finish capabilities",
    ],
  },
  {
    step: 3,
    title: "Expert Installation",
    tagline: "Precision delivered to your doorstep.",
    bullets: [
      "Specialist-trained installation teams with precision tooling",
      "Strict adherence to Madio's installation protocols",
      "Weather-sealing, alignment, and hardware calibration",
      "Site cleanliness and protection of surrounding finishes",
      "Post-installation quality audit and sign-off",
    ],
  },
  {
    step: 4,
    title: "After-Sales Support",
    tagline: "Our relationship begins at installation.",
    bullets: [
      "Warranty coverage confirmed and documented per system at handover",
      "Dedicated support helpline for service requests",
      "Annual maintenance guidance and care documentation",
      "Hardware replacement and adjustment services",
      "Lifetime technical support for all Madio products",
    ],
  },
];

// Warranty corrected from the PDF's blanket "15 Years" — see correction note
// at top of file. This table is general standards copy, not a per-product
// claim, but is kept consistent with the confirmed 10-year figure.
export const performanceStandards = [
  { standard: "Acoustic Insulation", specification: "≤ 38 dB" },
  { standard: "Wind Load Classification", specification: "Class A" },
  { standard: "Hardware Origin", specification: "Imported European Hardware" },
  { standard: "Aluminium Grade", specification: "6063-T5 Architectural Grade" },
  { standard: "Powder Coating", specification: "QUALICOAT Certified" },
  { standard: "Warranty", specification: `${DW_WARRANTY} per system` },
  { standard: "Glass Compatibility", specification: "Single, DGU, and Laminated" },
];

// --------------- Brand brief content ---------------
// Brand values and lead messages come from the client's brand brief
// (2026-11). Copy below only restates facts that already exist in this file
// (catalogue data) — no new specs, product names or testimonials.

export const dwPillars = [
  {
    title: "Precision Engineering",
    body:
      "Every system is custom-engineered to Madio's specification in 6063-T5 architectural-grade aluminium, fitted with imported European hardware and multi-point locking.",
  },
  {
    title: "Minimalist Aesthetics",
    body:
      "Ultra-slim profiles, with interlock sightlines as narrow as 19 mm, give the glass the room. Frames recede so that light, view and architecture lead.",
  },
  {
    title: "Sustainable Luxury",
    body:
      "Aluminium is 100% recyclable without loss of quality, and thermal-break technology limits heat transfer. Luxury that is built to last decades, not seasons.",
  },
];

// Derived from dwSystems so the figures can never drift from the spec data.
const mmValues = (pick: (s: DWSystem) => string | undefined) =>
  dwSystems.map((s) => parseFloat(pick(s) ?? "")).filter((n) => !Number.isNaN(n));
const interlockValues = mmValues((s) => s.specs.interlock);
export const dwMinInterlock = `${Math.min(...interlockValues)} mm`;
export const dwMaxHeight = `${Math.max(...mmValues((s) => s.specs.maxHeight))} mm`;

export const dwPerformanceHighlights = [
  {
    title: "Acoustic",
    figure: "Up to 38 dB",
    body: "Sound reduction achieved when the system is paired with appropriate glazing, with acoustic seals on every sash.",
  },
  {
    title: "Thermal",
    figure: "Thermal break",
    body: "Thermal-break technology minimises heat transfer through the frame, and every system accepts single, DGU or laminated glass.",
  },
  {
    title: "Wind Load",
    figure: "Class A",
    body: "Structurally engineered frames for wind-load resistance. The Casement 52 is wind-load rated, and the Titan 40 carries windows up to 4800 mm high.",
  },
];

// --------------- Helpers ---------------

export const getCategoryMeta = (id: string): DWCategoryMeta | undefined =>
  dwCategories.find((c) => c.id === id);

export const getSystemById = (id: string): DWSystem | undefined =>
  dwSystems.find((s) => s.id === id);

// "System Comparison At A Glance" — built directly from dwSystems so the
// table can never drift from the per-system spec data above.
export interface DWComparisonRow {
  id: string;
  system: string;
  maxHeight: string;
  maxWidth: string;
  loadCapacity: string;
  glass: string;
  interlock: string;
  locking: string;
}

const DASH = "—";

export const getSystemComparison = (): DWComparisonRow[] =>
  dwOpeningSystems.map((s) => ({
    id: s.id,
    system: s.name,
    maxHeight: s.specs.maxHeight ?? DASH,
    maxWidth: s.specs.maxWidth ?? DASH,
    loadCapacity: s.specs.loadCapacity ?? DASH,
    glass: s.specs.glassThickness ?? DASH,
    interlock: s.specs.interlock ?? DASH,
    locking: s.specs.lockingSystem ?? DASH,
  }));
