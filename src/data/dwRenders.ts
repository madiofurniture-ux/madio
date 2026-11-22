// ============================================================
// Opening-type renders (client-supplied grid, 2026-11-22).
// These are visualisations of window and door configurations, NOT Madio
// installations: they are always shown with a "render" label and never
// on the Projects page. Titles use the opening-type names from the
// 49-option opening types catalogue where one matches, and never name a
// product system that is not in Madio's 2026 catalogue.
// ============================================================

const files = import.meta.glob<string>("../assets/dw-renders/*.webp", { eager: true, import: "default" });
const src = (n: number) => files[`../assets/dw-renders/r${String(n).padStart(2, "0")}.webp`];

export type DWRenderGroup = "sliding" | "folding" | "casement" | "doors" | "fixed";

export interface DWRender {
  src: string;
  title: string;
  group: DWRenderGroup;
}

const raw: [number, string, DWRenderGroup][] = [
  [1, "Slide & fold door opening onto a garden", "folding"],
  [2, "Slim-line sliding window, living room", "sliding"],
  [3, "Entrance door with fixed side lights", "doors"],
  [4, "Casement window with fixed lower light", "casement"],
  [5, "3-panel sliding door to a high-rise balcony", "sliding"],
  [6, "Lift & slide door (1 fixed + 1 sliding)", "sliding"],
  [7, "Corner glazing, dining room", "fixed"],
  [8, "French door + top fanlight", "doors"],
  [9, "Casement window over a kitchen counter", "casement"],
  [10, "Casement door + side light", "doors"],
  [11, "Slim-line minimal sliding door to a balcony", "sliding"],
  [12, "Double-height glazed façade", "fixed"],
  [13, "Bay window: fixed centre with side casements", "casement"],
  [14, "Pivot entrance door", "doors"],
  [15, "3-track sliding window + mesh", "sliding"],
  [16, "Casement window with frosted glass, bathroom", "casement"],
  [17, "Arched window with fixed and opening lights", "fixed"],
  [18, "Staircase glazing, fixed with top light", "fixed"],
  [19, "Slide & fold door to a pool terrace", "folding"],
  [20, "Shopfront: double door + fixed sides", "doors"],
];

export const dwRenders: DWRender[] = raw
  .map(([n, title, group]) => ({ src: src(n), title, group }))
  .filter((r): r is DWRender => !!r.src);

export const DW_RENDER_NOTE = "Renders for illustration only, not Madio installations.";
