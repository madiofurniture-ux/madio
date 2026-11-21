// Post-build prerender: turns the client-only SPA into real HTML per route so
// search engines and link previews (WhatsApp, LinkedIn, X) see each page's
// own content, title, description, share image and structured data.
//
// Runs after `vite build` (client) and `vite build --ssr` (dist-ssr/). For
// every route from entry-server's getRoutes() it renders the React tree to
// HTML and writes dist/<route>/index.html. It also writes:
//   - dist/spa.html     — the untouched empty shell, used as the fallback for
//                         any URL that wasn't prerendered (see vercel.json)
//   - dist/sitemap.xml  — every prerendered route
//
// If a single route fails to render, it's skipped (that URL simply falls back
// to the SPA shell, exactly as before this change) rather than failing the
// whole deploy.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const SITE_URL = "https://www.madio.in";
const DEFAULT_OG_IMAGE_PATH = "/og-default.jpg";
const DEFAULT_DESCRIPTION =
  "Madio Gruppo, Hyderabad: design-led furniture, MAP architectural plasters and microcement, and slim aluminium doors and windows for homes, villas and hospitality projects across India.";

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// JSON inside <script> must not be able to close the tag.
const safeJson = (o: unknown): string => JSON.stringify(o).replace(/</g, "\\u003c");

const absoluteUrl = (p: string): string =>
  /^https?:\/\//.test(p) ? p : `${SITE_URL}${p.startsWith("/") ? "" : "/"}${p}`;

interface Head {
  title: string;
  description?: string;
  image?: string;
  jsonLd?: object[];
  noindex?: boolean;
}

function headTags(route: string, head: Head, orgJsonLd: object): string {
  const url = absoluteUrl(route);
  const description = head.description || DEFAULT_DESCRIPTION;
  const image = absoluteUrl(head.image || DEFAULT_OG_IMAGE_PATH);
  const t = escapeHtml(head.title);
  const d = escapeHtml(description);
  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta name="robots" content="${head.noindex ? "noindex, nofollow" : "index, follow"}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Madio Gruppo" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];
  tags.push(`<script type="application/ld+json">${safeJson(orgJsonLd)}</script>`);
  if (head.jsonLd?.length) {
    tags.push(`<script type="application/ld+json" data-page-jsonld>${safeJson(head.jsonLd)}</script>`);
  }
  return tags.join("\n    ");
}

// Everything between these markers in index.html is replaced per route.
const HEAD_START = "<!--head:start-->";
const HEAD_END = "<!--head:end-->";

function buildPage(template: string, route: string, head: Head, appHtml: string, orgJsonLd: object): string {
  const start = template.indexOf(HEAD_START);
  const end = template.indexOf(HEAD_END);
  if (start === -1 || end === -1) throw new Error("index.html is missing the head:start/head:end markers");
  const withHead =
    template.slice(0, start + HEAD_START.length) + "\n    " + headTags(route, head, orgJsonLd) + "\n    " + template.slice(end);
  return withHead.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

function outFileFor(route: string): string {
  return route === "/" ? path.join(distDir, "index.html") : path.join(distDir, route.replace(/^\//, ""), "index.html");
}

async function main() {
  const template = readFileSync(path.join(distDir, "index.html"), "utf8");
  // Keep the empty shell for non-prerendered URLs before index.html is overwritten.
  writeFileSync(path.join(distDir, "spa.html"), template);

  const entry = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
  const routes: string[] = entry.getRoutes();

  const ok: string[] = [];
  for (const route of routes) {
    try {
      const { html, head } = await entry.render(route);
      if (!head) throw new Error("page did not call usePageMeta");
      const file = outFileFor(route);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, buildPage(template, route, head, html, entry.organizationJsonLd));
      if (!head.noindex) ok.push(route);
    } catch (err) {
      console.warn(`[prerender] skipped ${route}: ${(err as Error).message}`);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    ok
      .map((r) => `  <url><loc>${escapeHtml(absoluteUrl(r))}</loc><lastmod>${today}</lastmod></url>`)
      .join("\n") +
    `\n</urlset>\n`;
  writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);

  rmSync(ssrDir, { recursive: true, force: true });
  console.log(`[prerender] wrote ${ok.length}/${routes.length} routes + sitemap.xml`);
}

main().catch((err) => {
  console.error("[prerender] fatal:", err);
  process.exit(1);
});
