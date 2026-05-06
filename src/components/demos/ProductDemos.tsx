import { useEffect, useState } from "react";
import { Upload, FileDown, Sparkles, Check, FileText, Brain, Search, Building2, TrendingUp, DollarSign, Target, Wand2, Phone } from "lucide-react";

/* Helper: small in-view step counter that loops */
function useLoopingStep(total: number, intervalMs = 1600) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % total), intervalMs);
    return () => clearInterval(id);
  }, [total, intervalMs]);
  return step;
}

export default function ProductDemos() {
  return (
    <section id="demos" className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-brand font-semibold">Live product demos</div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">See SmartRecruit AI in motion</h2>
          <p className="mt-3 text-muted-foreground">Three workflows. Zero busywork. Every demo loops automatically.</p>
        </div>

        <div className="mt-14 space-y-20 sm:space-y-28">
          <DemoRow
            tag="A · Custom Template"
            title="Upload your company template, generate on-brand JDs forever."
            desc="SmartRecruit ingests your existing JD format once — sections, tone, structure — then writes every future role in your exact style. Export to .docx in one click."
            bullets={[
              "Upload your company JD template (.docx)",
              "AI mirrors your sections + headings + tone",
              "Generate any role in your exact format",
              "One-click export to editable Word",
            ]}
            visual={<DemoCustomTemplate />}
          />
          <DemoRow
            reverse
            tag="B · Smart Format"
            title="No template? AI writes a structured JD instantly."
            desc="Type the role and seniority. SmartRecruit's Smart Format mode produces a polished, best-practice job description in under a minute — fully editable."
            bullets={[
              "Type a role and seniority",
              "AI builds a structured JD instantly",
              "Best-practice sections out of the box",
              "Edit, copy, or export in seconds",
            ]}
            visual={<DemoSmartFormat />}
          />
          <DemoRow
            tag="C · Talent Intelligence"
            title="Paste any JD. Get the entire hiring market decoded."
            desc="Salary benchmarks, similar companies hiring, sourcing keywords, ready-to-paste Boolean strings, and an AI-recommended hiring strategy — in one report."
            bullets={[
              "Salary bands by level + region",
              "Top companies hiring this role",
              "Boolean strings for LinkedIn / job boards",
              "AI hiring strategy, ready to execute",
            ]}
            visual={<DemoTalentIntelligence />}
          />
          <DemoRow
            reverse
            tag="D · Interview Questions"
            title="JD uploaded? Your phone screening sheet is ready."
            desc="Paste any job description and SmartRecruit instantly generates a complete phone screening question sheet — candidate details, role-specific questions, CTC, notice period, and feedback fields. Ready to use on your next call."
            bullets={[
              "Role-specific questions generated from JD",
              "Candidate name, experience, CTC fields included",
              "Notice period, location, source fields",
              "Level 1 feedback field",
              "Download as .docx instantly",
            ]}
            visual={<DemoInterviewQuestions />}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Layout helper ---------- */

function DemoRow({ tag, title, desc, bullets, visual, reverse }: {
  tag: string; title: string; desc: string; bullets: string[]; visual: React.ReactNode; reverse?: boolean;
}) {
  return (
    <div className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}>
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {tag}
        </div>
        <h3 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-muted-foreground">{desc}</p>
        <ul className="mt-5 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <div aria-hidden className="absolute -inset-4 sm:-inset-6 bg-gradient-brand opacity-15 blur-3xl rounded-[2rem] -z-10" />
        {visual}
      </div>
    </div>
  );
}

function DemoFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-soft-lg overflow-hidden">
      <div className="h-9 border-b border-border bg-secondary/60 flex items-center px-3 gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <div className="ml-3 text-[11px] text-muted-foreground truncate">{title}</div>
      </div>
      {children}
    </div>
  );
}

/* ---------- Demo A: Custom Template ---------- */
function DemoCustomTemplate() {
  // 4-step loop: upload → parsed → generating → ready
  const step = useLoopingStep(4, 1700);
  return (
    <DemoFrame title="app.smartrecruit.ai/jd-generator · Custom Template">
      <div className="bg-gradient-subtle p-5 min-h-[360px] space-y-3">
        {/* Upload */}
        <div className={`rounded-lg border-2 border-dashed p-3 flex items-center gap-3 transition-all duration-500 ${step >= 1 ? "border-success/40 bg-success/5" : "border-border bg-background"}`}>
          <div className={`h-9 w-9 rounded-md grid place-items-center ${step >= 1 ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
            {step >= 1 ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">acme-jd-template.docx</div>
            <div className="h-1 mt-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-brand transition-all duration-700" style={{ width: step >= 1 ? "100%" : "30%" }} />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">{step >= 1 ? "Parsed" : "Uploading"}</span>
        </div>

        {/* Parsed sections */}
        <div className={`rounded-lg border border-border bg-card p-3 space-y-1.5 transition-all duration-500 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-40 translate-y-1"}`}>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Detected sections</div>
          <div className="flex flex-wrap gap-1.5">
            {["About Acme", "The Role", "Responsibilities", "Requirements", "Benefits", "How to Apply"].map((s, i) => (
              <span key={s} className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${step >= 2 ? "bg-brand/10 text-brand" : "bg-secondary text-muted-foreground"}`} style={{ transitionDelay: `${i * 60}ms` }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Generating */}
        <div className={`rounded-lg border border-border bg-card p-3 transition-opacity duration-500 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span className="font-medium">Generating branded JD…</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{step >= 3 ? "Complete" : "0:47"}</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {[90, 75, 95, 60].map((w, i) => (
              <div key={i} className="h-2 rounded bg-secondary/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-brand transition-all"
                  style={{
                    width: step >= 3 ? `${w}%` : step >= 2 ? `${w * 0.4}%` : "0%",
                    transitionDelay: `${i * 120}ms`,
                    transitionDuration: "700ms",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <div className={`flex items-center gap-2 transition-all duration-500 ${step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <span className="text-[11px] px-2.5 py-1.5 rounded-md bg-gradient-brand text-brand-foreground font-medium inline-flex items-center gap-1.5 shadow-glow">
            <FileDown className="h-3.5 w-3.5" /> Export .docx
          </span>
          <span className="text-[11px] px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground font-medium">Copy markdown</span>
          <span className="ml-auto text-[10px] text-success font-medium">On-brand ✓</span>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ---------- Demo B: Smart Format ---------- */
function DemoSmartFormat() {
  const step = useLoopingStep(3, 2000);
  const text = "Senior Product Engineer";
  const typed = step === 0 ? text.slice(0, 12) : text;
  return (
    <DemoFrame title="app.smartrecruit.ai/jd-generator · Smart Format">
      <div className="bg-gradient-subtle p-5 min-h-[360px] space-y-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 font-semibold">Role</div>
          <div className="h-9 rounded-md border border-border bg-card px-3 text-sm flex items-center font-medium">
            {typed}
            <span className="inline-block w-[2px] h-4 bg-foreground ml-0.5 animate-blink" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Seniority</div>
              <div className="h-8 rounded-md border border-border bg-card px-2.5 flex items-center">Senior · 5+ yrs</div>
            </div>
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Location</div>
              <div className="h-8 rounded-md border border-border bg-card px-2.5 flex items-center">Remote (EU)</div>
            </div>
          </div>
          <div className="mt-3 h-9 rounded-md bg-gradient-brand text-brand-foreground text-xs font-medium flex items-center justify-center gap-1.5 shadow-glow">
            <Wand2 className="h-3.5 w-3.5" /> Generate with Smart Format
          </div>
        </div>

        {/* Output */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Structured JD</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">Generated in 38s</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "About the role", w: 90 },
              { label: "What you'll do", w: 96 },
              { label: "What we look for", w: 84 },
              { label: "Compensation", w: 70 },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`transition-all duration-500 ${step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="text-[11px] font-semibold mb-1">{s.label}</div>
                <div className="space-y-1">
                  <div className="h-2 rounded bg-secondary/70" style={{ width: `${s.w}%` }} />
                  <div className="h-2 rounded bg-secondary/70" style={{ width: `${s.w - 15}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ---------- Demo C: Talent Intelligence ---------- */
function DemoTalentIntelligence() {
  const step = useLoopingStep(3, 1900);
  const stats = [
    { icon: DollarSign, label: "Median salary", value: "$142k", bar: 78 },
    { icon: TrendingUp, label: "Demand", value: "High", bar: 92 },
    { icon: Target, label: "Match keywords", value: "24", bar: 60 },
    { icon: Building2, label: "Similar hirers", value: "38", bar: 70 },
  ];
  return (
    <DemoFrame title="app.smartrecruit.ai/talent-intelligence">
      <div className="bg-gradient-subtle p-5 min-h-[360px] space-y-3">
        {/* Pasted JD */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">Job description</div>
          <div className="space-y-1">
            <div className="h-2 rounded bg-secondary/70 w-11/12" />
            <div className="h-2 rounded bg-secondary/70 w-10/12" />
            <div className="h-2 rounded bg-secondary/70 w-9/12" />
          </div>
          <div className="mt-3 h-8 rounded-md bg-gradient-brand text-brand-foreground text-xs font-medium flex items-center justify-center gap-1.5 shadow-glow">
            <Brain className="h-3.5 w-3.5" /> Analyze market
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`rounded-lg border border-border bg-card p-2.5 transition-all duration-500 ${step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <s.icon className="h-3.5 w-3.5 text-brand" />
              <div className="text-base font-semibold tracking-tight mt-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
              <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all duration-700" style={{ width: step >= 1 ? `${s.bar}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Boolean */}
        <div className={`rounded-lg border border-border bg-card p-3 transition-all duration-500 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Search className="h-3 w-3 text-brand" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Boolean string</div>
            <span className="ml-auto text-[10px] text-success">Copied</span>
          </div>
          <code className="block text-[11px] font-mono text-foreground/90 truncate">
            ("Senior Product Engineer" OR "Staff Engineer") AND (React OR TypeScript) AND remote
          </code>
        </div>

        {/* Strategy */}
        <div className={`rounded-lg border border-border bg-card p-3 text-xs transition-all duration-500 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Hiring strategy</div>
          Source 70% from competitors · 20% via warm referral · 10% inbound. Expected time-to-hire: <strong>21 days</strong>.
        </div>
      </div>
    </DemoFrame>
  );
}
