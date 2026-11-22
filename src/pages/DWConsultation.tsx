import React, { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Mail, MessageCircle, Plus, Send, Trash2 } from "lucide-react";
import { dwSystems, getCategoryMeta, windowDoorTypologies } from "../data/doorsWindows";
import {
  DW_BASE,
  DW_EMAIL,
  dwApplicationGroups,
  dwConsultProjectTypes,
  dwProjectStages,
  dwRoles,
  dwTimelines,
  dwWhatsAppLink,
  openingSft,
} from "../data/dwArchitect";
import { usePageMeta } from "../hooks/usePageMeta";
import { newSubmissionId, submitLead } from "../lib/submitLead";
import { HoneypotField } from "../components/HoneypotField";
import { breadcrumbJsonLd } from "../lib/seo";
import { DWPageHero } from "../components/dw/DWUI";

// The opening schedule mirrors the line format of Madio's own D&W quotations
// in the CRM (typology, specification, W × H mm, sft = W×H/90,000, qty), so
// the sales team can turn a brief into a quotation without re-keying it.
// No rates or prices are shown or computed here.
interface OpeningRow {
  location: string;
  system: string;
  configuration: string;
  width: string;
  height: string;
  qty: string;
}
const emptyRow = (system = ""): OpeningRow => ({ location: "", system, configuration: "", width: "", height: "", qty: "1" });

const inputCls =
  "w-full border border-[#EBE8E2] px-4 py-3 text-sm bg-[#F4F1EA] focus:bg-white focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] font-light text-[#121212] placeholder-[#6B6B6B]/60 transition-colors";
const labelCls = "text-[10px] uppercase tracking-wider text-[#6B6B6B] font-sans font-semibold block mb-2";

const Field: React.FC<{ id: string; label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({
  id,
  label,
  required,
  children,
  className = "",
}) => (
  <div className={className}>
    <label htmlFor={id} className={labelCls}>
      {label}
      {required && " *"}
    </label>
    {children}
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder?: string }> = ({
  options,
  placeholder = "Select",
  ...rest
}) => (
  <select {...rest} className={inputCls}>
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

const fmtSft = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const DWConsultation: React.FC = () => {
  usePageMeta(
    "Discuss Your Project | Madio Doors & Windows, Hyderabad",
    "Send a project brief to Madio Doors & Windows: project type, stage, openings and timeline. For architects, designers, developers and homeowners.",
    {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Doors & Windows", path: DW_BASE },
          { name: "Discuss a Project", path: `${DW_BASE}/consultation` },
        ]),
      ],
    },
  );

  const [params] = useSearchParams();
  const systemParam = params.get("system") ?? "";
  const preSystem = getCategoryMeta(systemParam)?.name ?? "";
  const interestParam = params.get("interest") ?? "";
  const resourceParam = params.get("resource") ?? "";
  const roleParam = params.get("role") ?? "";

  const interestOptions = useMemo(
    () => [...dwApplicationGroups.filter((g) => g.id !== "also").map((g) => g.title), "Metal ceilings, railings or facade"],
    [],
  );
  const systemOptions = useMemo(() => [...dwSystems.map((s) => s.name), "Not sure yet"], []);

  const initialInterests = [
    ...(interestParam && interestOptions.includes(interestParam) ? [interestParam] : []),
    ...(preSystem ? dwApplicationGroups.filter((g) => g.systemIds.includes(systemParam) && g.id !== "also").slice(0, 1).map((g) => g.title) : []),
  ];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: dwRoles.includes(roleParam) ? roleParam : "",
    location: "",
    projectType: "",
    stage: "",
    openings: "",
    timeline: "",
    message: [
      preSystem && `Interested in the ${preSystem}.`,
      !preSystem && interestParam && !interestOptions.includes(interestParam) && `Interested in ${interestParam}.`,
      resourceParam && `Please send: ${resourceParam}.`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
  const [interests, setInterests] = useState<string[]>([...new Set(initialInterests)]);
  const [rows, setRows] = useState<OpeningRow[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fixError, setFixError] = useState("");
  const [trap, setTrap] = useState("");
  const submissionId = useRef("");

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleInterest = (v: string) =>
    setInterests((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  const setRow = (i: number, key: keyof OpeningRow, value: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const rowSft = (r: OpeningRow) => openingSft(Number(r.width), Number(r.height), Number(r.qty) || 0);
  const totalSft = rows.reduce((sum, r) => sum + rowSft(r), 0);

  const brief = useMemo(() => {
    const lines = [
      "MADIO DOORS & WINDOWS — PROJECT BRIEF",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      `Role: ${form.role || "-"}`,
      `Project location: ${form.location || "-"}`,
      `Project type: ${form.projectType || "-"}`,
      `Project stage: ${form.stage || "-"}`,
      `Product interest: ${interests.join(", ") || "-"}`,
      `Approx. openings: ${form.openings || "-"}`,
      `Timeline: ${form.timeline || "-"}`,
    ];
    const filled = rows.filter((r) => r.width || r.height || r.system || r.location);
    if (filled.length) {
      lines.push("", "OPENING SCHEDULE (W x H mm, sft = W*H/90,000 x qty)");
      filled.forEach((r, i) =>
        lines.push(
          `${i + 1}. ${r.location || "Opening"} | ${r.system || "-"} | ${r.configuration || "-"} | ${r.width || "?"} x ${r.height || "?"} mm | qty ${r.qty || 1} | ${fmtSft(rowSft(r))} sft`,
        ),
      );
      lines.push(`Total: ${fmtSft(totalSft)} sft`);
    }
    if (form.message.trim()) lines.push("", "Message:", form.message.trim());
    return lines.join("\n");
  }, [form, interests, rows, totalSft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setFixError("");
    // One id per filled-in brief, so a retry is saved once.
    submissionId.current ||= newSubmissionId();
    const result = await submitLead(
      {
        name: form.name,
        phone: form.phone,
        email: form.email,
        role: form.role,
        location: form.location,
        division: "Doors & Windows",
        interest: interests.join(", "),
        project_type: form.projectType,
        project_stage: form.stage,
        openings: form.openings,
        timeline: form.timeline,
        // The full brief, including the opening schedule, so the CRM note has everything.
        message: brief,
        form: "doors-windows-consultation",
        subject: "Doors & Windows Project Consultation",
        interestedIn: "Doors & Windows",
        openingScheduleSft: totalSft ? fmtSft(totalSft) : "",
        company_website: trap,
      },
      submissionId.current,
    );
    if (result.status === "ok") setStatus("sent");
    else if (result.status === "fixable") {
      setFixError(result.error);
      setStatus("idle");
    } else setStatus("error");
  };

  const mailto = `mailto:${DW_EMAIL}?subject=${encodeURIComponent("Project brief: Madio Doors & Windows")}&body=${encodeURIComponent(brief)}`;

  return (
    <div className="bg-[#F4F1EA]">
      <DWPageHero
        eyebrow="Discuss a Project"
        breadcrumb="Discuss a Project"
        title={
          <>
            Discuss your project <span className="italic text-[#C5A059]">with Madio.</span>
          </>
        }
        intro="Tell us about the project, where it stands and the openings involved. We will respond with system recommendations and arrange a site survey where the project is ready for one."
      />

      <section className="py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <div className="bg-white border border-[#EBE8E2] p-7">
              <h2 className="text-lg font-serif font-light text-[#121212] mb-3">What happens next</h2>
              <ol className="space-y-3 text-xs text-[#6B6B6B] font-light leading-relaxed list-decimal list-inside">
                <li>We review the brief and any drawings you share.</li>
                <li>We recommend systems and configurations for the openings.</li>
                <li>Site survey and measurement when the project is ready.</li>
                <li>A project-specific quotation, opening by opening.</li>
              </ol>
            </div>
            <div className="bg-white border border-[#EBE8E2] p-7">
              <h2 className="text-lg font-serif font-light text-[#121212] mb-3">Drawings and references</h2>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-4">
                Email plans, elevations or window schedules to us after sending the brief. Large files are best by email.
              </p>
              <a href={`mailto:${DW_EMAIL}`} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-[#121212] hover:text-[#C5A059]">
                <Mail size={14} /> {DW_EMAIL}
              </a>
            </div>
            <a
              href={dwWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-sans text-[#6B6B6B] hover:text-[#121212]"
            >
              <MessageCircle size={14} /> Prefer a quick chat? WhatsApp us
            </a>
          </aside>

          <div className="lg:col-span-8 order-1 lg:order-2 bg-white border border-[#EBE8E2] p-6 md:p-10">
            {status === "sent" ? (
              <div className="text-center py-16 flex flex-col items-center gap-5" role="status">
                <CheckCircle size={44} className="text-[#C5A059]" />
                <h2 className="text-2xl font-serif font-light text-[#121212]">Thank you. Your brief has been sent.</h2>
                <p className="text-sm text-[#6B6B6B] font-light max-w-md leading-relaxed">
                  The Madio Doors & Windows team will contact you. If you have drawings, email them to {DW_EMAIL} with your name in the subject.
                </p>
              </div>
            ) : status === "error" ? (
              <div className="py-10" role="alert">
                <h2 className="text-2xl font-serif font-light text-[#121212] mb-3">Send your brief by email or WhatsApp</h2>
                <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-8 max-w-xl">
                  We could not send the form just now. Your brief is ready below; send it by email or WhatsApp and nothing is lost.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a href={mailto} className="inline-flex items-center justify-center gap-2 px-8 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium bg-[#C5A059] text-white hover:bg-[#121212] transition-colors">
                    <Mail size={14} /> Email the brief
                  </a>
                  <a
                    href={dwWhatsAppLink(brief)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 text-xs uppercase tracking-[0.25em] font-sans font-medium border border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
                  >
                    <MessageCircle size={14} /> Send on WhatsApp
                  </a>
                </div>
                <pre className="whitespace-pre-wrap text-xs bg-[#F4F1EA] border border-[#EBE8E2] p-5 text-[#121212] font-mono">{brief}</pre>
                <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-[10px] uppercase tracking-[0.2em] font-sans text-[#6B6B6B] hover:text-[#121212]">
                  Back to the form
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <fieldset className="space-y-6">
                  <legend className="text-xl font-serif font-light text-[#121212] mb-6">About you</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field id="name" label="Full name" required>
                      <input id="name" name="name" required autoComplete="name" value={form.name} onChange={set} className={inputCls} />
                    </Field>
                    <Field id="role" label="You are">
                      <Select id="role" name="role" value={form.role} onChange={set} options={dwRoles} />
                    </Field>
                    <Field id="phone" label="Phone" required>
                      <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" value={form.phone} onChange={set} className={inputCls} />
                    </Field>
                    <Field id="email" label="Email" required>
                      <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={set} className={inputCls} />
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="space-y-6">
                  <legend className="text-xl font-serif font-light text-[#121212] mb-6">The project</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field id="location" label="Project location" required>
                      <input id="location" name="location" required placeholder="e.g. Jubilee Hills, Hyderabad" value={form.location} onChange={set} className={inputCls} />
                    </Field>
                    <Field id="projectType" label="Project type">
                      <Select id="projectType" name="projectType" value={form.projectType} onChange={set} options={dwConsultProjectTypes} />
                    </Field>
                    <Field id="stage" label="Project stage">
                      <Select id="stage" name="stage" value={form.stage} onChange={set} options={dwProjectStages} />
                    </Field>
                    <Field id="timeline" label="Expected timeline">
                      <Select id="timeline" name="timeline" value={form.timeline} onChange={set} options={dwTimelines} />
                    </Field>
                    <Field id="openings" label="Approximate number of openings, if known">
                      <input id="openings" name="openings" inputMode="numeric" value={form.openings} onChange={set} className={inputCls} />
                    </Field>
                  </div>
                  <div>
                    <span className={labelCls}>Product interest</span>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((opt) => {
                        const on = interests.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleInterest(opt)}
                            className={`text-[11px] font-sans px-3 py-2 border transition-colors ${
                              on ? "bg-[#121212] text-white border-[#121212]" : "border-[#EBE8E2] text-[#121212] hover:border-[#121212]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-xl font-serif font-light text-[#121212] mb-2">Opening schedule <span className="text-sm text-[#6B6B6B]">(optional)</span></legend>
                  <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-6">
                    If you have sizes, list the openings and we will prepare the quotation from them. Area is shown in sq ft (W × H mm ÷ 90,000 × quantity). Final sizes are confirmed at site survey.
                  </p>
                  {rows.length > 0 && (
                    <div className="space-y-4 mb-4">
                      {rows.map((r, i) => (
                        <div key={i} className="border border-[#EBE8E2] p-4 grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                          <Field id={`loc-${i}`} label="Location" className="col-span-2 md:col-span-3">
                            <input id={`loc-${i}`} placeholder="e.g. Living room" value={r.location} onChange={(e) => setRow(i, "location", e.target.value)} className={inputCls} />
                          </Field>
                          <Field id={`sys-${i}`} label="System" className="col-span-2 md:col-span-3">
                            <Select id={`sys-${i}`} value={r.system} onChange={(e) => setRow(i, "system", e.target.value)} options={systemOptions} />
                          </Field>
                          <Field id={`cfg-${i}`} label="Configuration" className="col-span-2 md:col-span-2">
                            <Select id={`cfg-${i}`} value={r.configuration} onChange={(e) => setRow(i, "configuration", e.target.value)} options={windowDoorTypologies.map((t) => t.configuration)} />
                          </Field>
                          <Field id={`w-${i}`} label="W (mm)" className="md:col-span-1">
                            <input id={`w-${i}`} inputMode="numeric" value={r.width} onChange={(e) => setRow(i, "width", e.target.value.replace(/[^\d]/g, ""))} className={inputCls} />
                          </Field>
                          <Field id={`h-${i}`} label="H (mm)" className="md:col-span-1">
                            <input id={`h-${i}`} inputMode="numeric" value={r.height} onChange={(e) => setRow(i, "height", e.target.value.replace(/[^\d]/g, ""))} className={inputCls} />
                          </Field>
                          <Field id={`q-${i}`} label="Qty" className="md:col-span-1">
                            <input id={`q-${i}`} inputMode="numeric" value={r.qty} onChange={(e) => setRow(i, "qty", e.target.value.replace(/[^\d]/g, ""))} className={inputCls} />
                          </Field>
                          <div className="md:col-span-1 flex items-center justify-between md:flex-col md:items-end gap-2 pb-1">
                            <span className="text-xs text-[#121212] whitespace-nowrap">{fmtSft(rowSft(r))} sft</span>
                            <button type="button" aria-label={`Remove opening ${i + 1}`} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="text-[#6B6B6B] hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="text-right text-sm text-[#121212]">
                        Total area: <strong className="font-medium">{fmtSft(totalSft)} sft</strong>
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setRows((rs) => [...rs, emptyRow(preSystem)])}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-sans font-medium border border-[#121212] px-4 py-2.5 text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
                  >
                    <Plus size={12} /> Add an opening
                  </button>
                </fieldset>

                <Field id="message" label="Message">
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Design intent, finishes in mind, site constraints, or anything else we should know."
                    value={form.message}
                    onChange={set}
                    className={`${inputCls} resize-y`}
                  />
                </Field>

                <HoneypotField id="company-website" value={trap} onChange={setTrap} />
                {fixError && (
                  <p role="alert" className="text-xs text-[#9B2C2C] font-light">
                    {fixError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-[#C5A059] text-white py-4 text-xs uppercase tracking-[0.25em] font-sans font-semibold hover:bg-[#121212] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {status === "sending" ? "Sending..." : (<>Send Project Brief <Send size={12} /></>)}
                </button>
                <p className="text-[11px] text-[#6B6B6B] font-light">
                  We use these details only to respond to your enquiry. No prices are quoted online; quotations are prepared per project.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
