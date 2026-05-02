import { Link } from "react-router-dom";
import { Sparkles, FileText, Brain, ArrowRight, Zap, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-brand-foreground" />
          </div>
          <span className="font-semibold tracking-tight">HireFlow AI</span>
        </div>
        <Link to="/jd-generator">
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
            Open app <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background text-xs text-muted-foreground mb-6 shadow-soft-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          AI hiring copilot for modern teams
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.05]">
          The AI hiring operating system <span className="bg-gradient-brand bg-clip-text text-transparent">for startups</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate world-class job descriptions and decode the talent market in seconds. Not a dashboard — a decision tool.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/jd-generator">
            <Button size="lg" className="bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow">
              Start generating <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/talent-intelligence">
            <Button size="lg" variant="outline">
              Explore intelligence
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <FeatureCard
            to="/jd-generator"
            icon={FileText}
            title="JD Generator"
            desc="Use your company template or HireFlow's structured format. Export to .docx in one click."
            tags={["Template mode", "HireFlow format", "Word export"]}
          />
          <FeatureCard
            to="/talent-intelligence"
            icon={Brain}
            title="Talent Intelligence Engine"
            desc="Market trends, salary benchmarks, sourcing keywords, and a hiring strategy — instantly from any JD."
            tags={["Market trends", "Salary bands", "Boolean strings"]}
          />
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Stat icon={Zap} label="Faster JD creation" value="10×" />
          <Stat icon={Target} label="Better targeted sourcing" value="4×" />
          <Stat icon={BarChart3} label="Salary insights" value="Real-time" />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ to, icon: Icon, title, desc, tags }: { to: string; icon: any; title: string; desc: string; tags: string[] }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-6 shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{desc}</p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {tags.map((t) => (
          <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm font-medium text-foreground inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        Open <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="text-2xl font-semibold tracking-tight mt-3">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
