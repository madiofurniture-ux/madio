// Vercel serverless function (Node.js runtime): every website enquiry form posts here.
//
// It forwards the enquiry, server to server, to
//   1. the MADIO CRM's Leads module (POST {CRM_API_URL}/api/public/website-leads, header X-Website-Key =
//      CRM_LEAD_KEY; the key is issued in the CRM under Business Settings → Website leads), and
//   2. the Google Sheet (Apps Script web app, GOOGLE_SHEETS_API_URL, else VITE_GOOGLE_SHEETS_API_URL) as a backup copy.
//
// Unlike the old browser-side `no-cors` post, this can read both answers, so the visitor is told "sent" only when
// at least one copy was really saved. Nothing secret ever reaches the browser.
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { maxDuration: 30 };

const CRM_TIMEOUT_MS = 20_000; // the CRM's API can be waking from sleep
const SHEET_TIMEOUT_MS = 12_000;

const FIELDS = [
  "name", "phone", "email", "location", "division", "interest", "project_type", "project_stage", "role",
  "timeline", "openings", "message", "form", "page", "submission_id",
] as const;
const TRACKING = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"] as const;
// Sheet-only columns some forms already send (kept so the sheet's existing columns stay filled).
const SHEET_EXTRA = ["subject", "interestedIn", "openingScheduleSft"] as const;

type Lead = Record<string, string> & { tracking?: Record<string, string> };

const str = (v: unknown, max: number) => (typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) : "");

function cleanBody(body: unknown): Lead {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const out: Lead = {};
  for (const k of [...FIELDS, ...SHEET_EXTRA]) {
    const v = str(b[k], k === "message" ? 4000 : 200);
    if (v) out[k] = v;
  }
  const t = (b.tracking && typeof b.tracking === "object" ? b.tracking : {}) as Record<string, unknown>;
  out.tracking = {};
  for (const k of TRACKING) {
    const v = str(t[k], 200);
    if (v) out.tracking[k] = v;
  }
  return out;
}

async function withTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

type Outcome = { status: "saved" | "skipped" | "failed" | "rejected"; detail?: string; leadId?: string };

async function toCrm(lead: Lead): Promise<Outcome> {
  const base = (process.env.CRM_API_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
  const key = process.env.CRM_LEAD_KEY || "";
  if (!base || !key) return { status: "skipped" };
  try {
    const res = await withTimeout(`${base}/api/public/website-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Website-Key": key },
      body: JSON.stringify(lead),
    }, CRM_TIMEOUT_MS);
    const data = (await res.json().catch(() => ({}))) as { lead_id?: string; detail?: unknown };
    if (res.ok) return { status: "saved", leadId: data.lead_id };
    const detail = typeof data.detail === "string" ? data.detail : `HTTP ${res.status}`;
    // 422 = the enquiry itself can't be a lead (e.g. an invalid phone number): the visitor can fix it.
    return { status: res.status === 422 ? "rejected" : "failed", detail };
  } catch (e) {
    return { status: "failed", detail: e instanceof Error ? e.message : "network error" };
  }
}

async function toSheet(lead: Lead): Promise<Outcome> {
  const url = process.env.GOOGLE_SHEETS_API_URL || process.env.VITE_GOOGLE_SHEETS_API_URL || "";
  if (!url || url.includes("YOUR_COPIED_APPS_SCRIPT_URL_HERE")) return { status: "skipped" };
  const { tracking = {}, ...fields } = lead;
  const params = new URLSearchParams({
    subject: fields.subject || `Website enquiry (${fields.form || "form"})`,
    interestedIn: fields.interestedIn || fields.division || "",
    ...fields,
    projectLocation: fields.location || "",
    productInterest: fields.interest || "",
    projectStage: fields.project_stage || "",
    projectType: fields.project_type || "",
    source: fields.form || "website",
    landingPage: fields.page || "",
    ...tracking,
  });
  try {
    const res = await withTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      redirect: "follow",
    }, SHEET_TIMEOUT_MS);
    return res.ok ? { status: "saved" } : { status: "failed", detail: `HTTP ${res.status}` };
  } catch (e) {
    return { status: "failed", detail: e instanceof Error ? e.message : "network error" };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const raw = (req.body ?? {}) as Record<string, unknown>;
  // Honeypot: a field people never see. Bots that fill it get a quiet "ok" and nothing is saved.
  if (str(raw.company_website, 200)) return res.status(200).json({ ok: true });

  const lead = cleanBody(raw);
  if (!lead.name) return res.status(400).json({ ok: false, error: "Please enter your name." });
  if ((lead.phone || "").replace(/\D/g, "").length < 10) {
    return res.status(400).json({ ok: false, error: "Please enter a valid mobile number." });
  }

  const [crm, sheet] = await Promise.all([toCrm(lead), toSheet(lead)]);
  if (crm.status === "failed" || crm.status === "rejected") console.error("[lead] CRM:", crm.detail);
  if (sheet.status === "failed") console.error("[lead] Sheet:", sheet.detail);

  if (crm.status === "rejected") {
    return res.status(422).json({ ok: false, error: crm.detail || "Please check your details.", sheet: sheet.status });
  }
  if (crm.status === "saved" || sheet.status === "saved") {
    return res.status(200).json({ ok: true, crm: crm.status, sheet: sheet.status });
  }
  if (crm.status === "skipped" && sheet.status === "skipped") {
    return res.status(503).json({ ok: false, error: "Online enquiries are not configured." });
  }
  return res.status(502).json({ ok: false, error: "We could not save your enquiry just now.", crm: crm.status, sheet: sheet.status });
}
