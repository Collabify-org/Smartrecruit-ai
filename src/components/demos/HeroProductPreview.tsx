import { useEffect, useState } from "react";
import { Sparkles, FileText, Brain, Zap, Check, TrendingUp, Search } from "lucide-react";

/**
 * Animated SaaS hero preview.
 * Cycles through three "frames" showing JD generation → talent insights → AI workflow.
 */
const FRAMES = ["jd", "insights", "workflow"] as const;
type Frame = typeof FRAMES[number];

export default function HeroProductPreview() {
  const [active, setActive] = useState<Frame>("jd");

  useEffect(() => {
    const id = setInterval(() => {
      setActive((cur) => FRAMES[(FRAMES.indexOf(cur) + 1) % FRAMES.length]);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* Glow */}
      <div aria-hidden className="absolute -inset-6 bg-gradient-brand opacity-20 blur-3xl rounded-[2rem] -z-10 animate-pulse-glow" />
      <div className="rounded-2xl border border-border bg-card shadow-soft-lg overflow-hidden">
        {/* Browser chrome */}
        <div className="h-10 border-b border-border bg-secondary/60 flex items-center px-3 gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <div className="ml-3 text-[11px] text-muted-foreground truncate">app.Synlumex.ai</div>
          <div className="ml-auto flex items-center gap-1.5">
            {FRAMES.map((f) => (
              <span
                key={f}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  active === f ? "w-6 bg-brand" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex items-center gap-1 px-3 bg-background">
          <Tab icon={FileText} label="JD Generator" active={active === "jd"} />
          <Tab icon={Brain} label="Talent Intelligence" active={active === "insights"} />
          <Tab icon={Zap} label="AI Workflow" active={active === "workflow"} />
        </div>

        {/* Frames */}
        <div className="relative bg-gradient-subtle min-h-[340px] sm:min-h-[380px]">
          {active === "jd" && <FrameJD key="jd" />}
          {active === "insights" && <FrameInsights key="insights" />}
          {active === "workflow" && <FrameWorkflow key="workflow" />}
        </div>
      </div>

      {/* Floating badges */}
      <div className="hidden sm:flex absolute -left-6 top-24 items-center gap-2 rounded-full border border-border bg-background pl-2 pr-3 py-1.5 shadow-soft-lg animate-float-slow">
        <span className="h-6 w-6 rounded-full bg-success/15 text-success grid place-items-center"><Check className="h-3.5 w-3.5" /></span>
        <span className="text-xs font-medium">JD ready in 47s</span>
      </div>
      <div className="hidden sm:flex absolute -right-6 bottom-16 items-center gap-2 rounded-full border border-border bg-background pl-2 pr-3 py-1.5 shadow-soft-lg animate-float-slow [animation-delay:1.2s]">
        <span className="h-6 w-6 rounded-full bg-brand/15 text-brand grid place-items-center"><Sparkles className="h-3.5 w-3.5" /></span>
        <span className="text-xs font-medium">+ market insights</span>
      </div>
    </div>
  );
}

function Tab({ icon: Icon, label, active }: { icon: any; label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors ${
        active ? "border-brand text-foreground" : "border-transparent text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

/* ---------- Frame 1: JD Generator ---------- */
function FrameJD() {
  return (
    <div className="grid sm:grid-cols-5 gap-4 p-5 animate-fade-in">
      <div className="sm:col-span-2 rounded-lg border border-border bg-card p-4 space-y-2.5">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Inputs</div>
        <Field label="Role" value="Senior Product Engineer" />
        <Field label="Seniority" value="Senior · 5+ yrs" />
        <Field label="Mode" value="Synlumex Smart Format" />
        <div className="pt-1">
          <div className="h-9 rounded-md bg-gradient-brand text-brand-foreground text-xs font-medium flex items-center justify-center gap-1.5 shadow-glow">
            <Sparkles className="h-3.5 w-3.5" /> Generating JD…
          </div>
          <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-brand animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
      <div className="sm:col-span-3 rounded-lg border border-border bg-card p-4 text-left space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Live preview</div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">.docx ready</span>
        </div>
        {[80, 95, 70, 0, 50, 92, 88, 65].map((w, i) => (
          <div
            key={i}
            className={`h-2 rounded animate-slide-up-fade ${i === 3 ? "h-3 w-1/3 bg-secondary" : "bg-secondary/70"}`}
            style={{ width: w === 0 ? undefined : `${w}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Frame 2: Talent Insights ---------- */
function FrameInsights() {
  return (
    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
      <Stat icon={TrendingUp} label="Median salary" value="$142k" delay={0} />
      <Stat icon={Search} label="Boolean strings" value="6" delay={80} />
      <Stat icon={Brain} label="Skill trend" value="Rising" delay={160} />
      <Stat icon={FileText} label="Similar hirers" value="38" delay={240} />
      <div className="col-span-2 sm:col-span-4 rounded-lg border border-border bg-card p-4 animate-slide-up-fade [animation-delay:280ms]">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Boolean sourcing string</div>
        <code className="block text-[11px] font-mono text-foreground/90 truncate">
          ("Senior Product Engineer" OR "Staff Engineer") AND (React OR TypeScript) AND remote
        </code>
      </div>
      <div className="col-span-2 sm:col-span-4 grid sm:grid-cols-3 gap-2">
        {["Stripe", "Linear", "Vercel", "Ramp", "Notion", "Figma"].map((c, i) => (
          <span key={c} style={{ animationDelay: `${320 + i * 60}ms` }} className="text-[11px] px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground font-medium animate-slide-up-fade">{c}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Frame 3: AI Workflow ---------- */
function FrameWorkflow() {
  const steps = [
    { icon: FileText, label: "Define role" },
    { icon: Sparkles, label: "AI generates JD" },
    { icon: Brain, label: "Market intelligence" },
    { icon: Search, label: "Boolean + sourcing" },
    { icon: Check, label: "Hire faster" },
  ];
  return (
    <div className="p-6 animate-fade-in">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-5">End-to-end AI hiring workflow</div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-secondary" />
        <div className="absolute left-0 top-5 h-0.5 bg-gradient-brand animate-[type-line_3s_ease-out_forwards]" style={{ width: "100%" }} />
        <div className="relative grid grid-cols-5 gap-2">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center text-center animate-slide-up-fade" style={{ animationDelay: `${i * 200}ms` }}>
              <div className="h-10 w-10 rounded-full border border-border bg-card grid place-items-center shadow-soft-sm">
                <s.icon className="h-4 w-4 text-brand" />
              </div>
              <div className="mt-2 text-[10px] sm:text-xs font-medium leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-4 space-y-2 animate-slide-up-fade [animation-delay:1.2s]">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground">Synlumex AI</span>
          <span className="ml-auto text-[10px] text-muted-foreground">just now</span>
        </div>
        <div className="text-sm">
          Generated <strong>"Senior Product Engineer"</strong> JD, found <strong>3,820</strong> active candidates, and prepared <strong>6</strong> sourcing strings.
          <span className="inline-block w-1.5 h-3.5 align-middle ml-0.5 bg-foreground animate-blink" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="h-8 rounded-md border border-border bg-background px-2.5 text-xs flex items-center text-foreground/90">{value}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string; delay: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 animate-slide-up-fade" style={{ animationDelay: `${delay}ms` }}>
      <Icon className="h-3.5 w-3.5 text-brand" />
      <div className="text-lg font-semibold tracking-tight mt-1">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
