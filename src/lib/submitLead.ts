// Sends a website enquiry to /api/lead (a Vercel function), which saves it in the MADIO CRM's Leads module and
// keeps a backup copy in the Google Sheet. The browser never holds a key or a sheet URL.
//
// Result:
//   ok           the enquiry was saved (CRM, sheet, or both)
//   fixable      the visitor can correct something (e.g. the phone number); `error` says what
//   unavailable  nothing could be saved; show WhatsApp / email so the enquiry is not lost

export type LeadFields = {
  name: string;
  phone: string;
  email?: string;
  location?: string;
  division?: string; // "Doors & Windows" | "Furniture" | "MAP" (blank = general)
  interest?: string;
  project_type?: string;
  project_stage?: string;
  role?: string;
  timeline?: string;
  openings?: string;
  message?: string;
  form: string; // which form, e.g. "ads-landing hero"
  subject?: string;
  interestedIn?: string;
  company_website?: string; // honeypot: must stay empty
};

export type LeadResult = { status: "ok" } | { status: "fixable"; error: string } | { status: "unavailable" };

export const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"] as const;
const TRACKING_STORE = "madio_ad_click";

/** The ad-click parameters: from this page's URL, else the first ones seen in this visit (kept across pages). */
export function adTracking(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Record<string, string> = {};
  TRACKING_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) fromUrl[k] = v.slice(0, 200);
  });
  try {
    if (Object.keys(fromUrl).length) {
      if (!window.sessionStorage.getItem(TRACKING_STORE)) window.sessionStorage.setItem(TRACKING_STORE, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const saved = JSON.parse(window.sessionStorage.getItem(TRACKING_STORE) || "{}") as Record<string, unknown>;
    const out: Record<string, string> = {};
    TRACKING_KEYS.forEach((k) => {
      if (typeof saved[k] === "string" && saved[k]) out[k] = (saved[k] as string).slice(0, 200);
    });
    return out;
  } catch {
    return fromUrl;
  }
}

/** A fresh id for one filled-in form. Keep it for retries, so the CRM recognises a resend and saves it once. */
export function newSubmissionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function submitLead(fields: LeadFields, submissionId: string = newSubmissionId()): Promise<LeadResult> {
  const body = {
    ...fields,
    page: typeof window !== "undefined" ? window.location.pathname : "",
    submission_id: submissionId,
    tracking: adTracking(),
  };
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) return { status: "ok" };
    if ((res.status === 400 || res.status === 422) && data.error) return { status: "fixable", error: data.error };
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
