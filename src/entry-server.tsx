// Build-time prerender entry. Built with `vite build --ssr` and driven by
// scripts/prerender.ts — never shipped to the browser.
import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { headCollector, type PageHead } from "./lib/seo";
import { furnitureCategories, getProductsByCategory } from "./data/furniture";
import { dwCategories, getCategoryPhotos } from "./data/doorsWindows";
import { dwProjects } from "./data/dwArchitect";

export interface RenderResult {
  html: string;
  head: PageHead | null;
}

export async function render(url: string): Promise<RenderResult> {
  headCollector.reset();
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
  const html = await new Response(prelude).text();
  return { html, head: headCollector.get() };
}

/** Every public URL worth prerendering and listing in the sitemap. */
export function getRoutes(): string[] {
  const routes = new Set<string>([
    "/",
    "/contact",
    "/doors-windows",
    "/doors-windows/systems",
    "/doors-windows/design-materials",
    "/doors-windows/architects",
    "/doors-windows/resources",
    "/doors-windows/consultation",
    "/map",
    "/map/about",
    "/map/products",
    "/map/gallery",
    "/map/colors",
    "/map/stencils",
  ]);

  for (const cat of furnitureCategories) {
    const products = getProductsByCategory(cat.id).filter((p) => p.images.length > 0);
    if (products.length === 0) continue; // empty categories stay out of search
    routes.add(`/furniture/${cat.id}`);
    for (const p of products) routes.add(`/furniture/${cat.id}/${p.id}`);
  }

  // Projects joins search once real case studies exist (noindex until then).
  if (dwProjects.some((p) => !p.isInspiration)) routes.add("/doors-windows/projects");

  for (const cat of dwCategories) {
    if (!cat.isPopulated && getCategoryPhotos(cat.id).length === 0) continue;
    routes.add(`/doors-windows/${cat.id}`);
  }

  return [...routes];
}

export { organizationJsonLd } from "./lib/seo";
