// Doors & Windows division navigation. Kept free of other imports so the
// site header (in the main bundle) doesn't pull the catalogue data in.
export const DW_BASE = "/doors-windows";

export const dwNavLinks = [
  { path: DW_BASE, label: "Overview", end: true },
  { path: `${DW_BASE}/systems`, label: "Architectural Systems" },
  { path: `${DW_BASE}/design-materials`, label: "Design & Materials" },
  { path: `${DW_BASE}/projects`, label: "Projects" },
  { path: `${DW_BASE}/architects`, label: "For Architects" },
  { path: `${DW_BASE}/resources`, label: "Technical Resources" },
  { path: `${DW_BASE}/consultation`, label: "Discuss a Project" },
];
