// Site-wide SEO constants and the per-render head collector used by the
// build-time prerender (scripts/prerender.ts). In the browser, usePageMeta
// updates document.head directly; during prerender there is no document, so
// usePageMeta records what the page asked for here and the prerender script
// writes it into that route's static HTML.

export const SITE_URL = "https://www.madio.in";
export const SITE_NAME = "Madio Gruppo";

// Default share image for pages that don't set their own: a real showroom
// photo reads far better in WhatsApp / LinkedIn previews than the logo.
export const DEFAULT_OG_IMAGE_PATH = "/og-default.jpg";

export interface PageHead {
  title: string;
  description?: string;
  /** Absolute URL or site-relative path of the share image. */
  image?: string;
  /** Extra JSON-LD objects for this page (Organization is always added). */
  jsonLd?: object[];
  /** Keep the page out of search results (admin, unknown routes). */
  noindex?: boolean;
}

let collected: PageHead | null = null;

export const headCollector = {
  reset() {
    collected = null;
  },
  set(head: PageHead) {
    collected = head;
  },
  get(): PageHead | null {
    return collected;
  },
};

export const absoluteUrl = (pathOrUrl: string): string =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

// Business details as published in the site footer.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ["MADIO", "Madio Furniture", "MAP Architectural Plasters", "Madio Doors and Windows"],
  url: SITE_URL,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  image: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
  email: "info@madio.in",
  telephone: ["+91 99486 01899", "+91 99486 01599"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "1st Floor, Road No.1, Plot No.25, Shilpa Hills, Kondapur",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500084",
    addressCountry: "IN",
  },
  areaServed: "IN",
  department: [
    { "@type": "Organization", name: "Madio Furniture", url: `${SITE_URL}/` },
    { "@type": "Organization", name: "MAP Architectural Plasters", url: `${SITE_URL}/map` },
    { "@type": "Organization", name: "Madio Doors and Windows", url: `${SITE_URL}/doors-windows` },
  ],
};
