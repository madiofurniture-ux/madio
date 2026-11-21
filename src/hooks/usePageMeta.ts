import { useEffect } from "react";
import {
  DEFAULT_OG_IMAGE_PATH,
  absoluteUrl,
  headCollector,
  type PageHead,
} from "../lib/seo";

const DEFAULT_TITLE = "MADIO | Furniture, Architectural Plasters & Doors";

export interface PageMetaOptions {
  image?: string;
  jsonLd?: object[];
  noindex?: boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets the page title, description, canonical URL and social share tags.
 *
 * In the browser it updates document.head after render. During the
 * build-time prerender (no document) it records the values in
 * headCollector instead, so scripts/prerender.ts can write them into the
 * route's static HTML — that's what search engines and link previews see.
 */
export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const { image, jsonLd, noindex } = options;

  if (typeof document === "undefined") {
    const head: PageHead = { title, description, image, jsonLd, noindex };
    headCollector.set(head);
  }

  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = title;
    const url = absoluteUrl(window.location.pathname);
    const img = absoluteUrl(image ?? DEFAULT_OG_IMAGE_PATH);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    setMeta("property", "og:title", title);
    setMeta("name", "twitter:title", title);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:image", img);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);

    // Page-specific JSON-LD (the Organization block is static in the HTML).
    document.head.querySelectorAll('script[data-page-jsonld]').forEach((s) => s.remove());
    if (jsonLdKey) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-page-jsonld", "");
      s.textContent = jsonLdKey;
      document.head.appendChild(s);
    }
  }, [title, description, image, jsonLdKey, noindex]);
}

export { DEFAULT_TITLE };
