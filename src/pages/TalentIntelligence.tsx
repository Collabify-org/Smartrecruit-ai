import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Loader2, TrendingUp, Building2, DollarSign, Search, Target, Copy } from "lucide-react";
import { analyzeJD, type TalentReport } from "@/lib/talentEngine";

export default function TalentIntelligence() {
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<TalentReport | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (jd.trim().length < 30) {
      toast.error("Paste a longer JD to analyze");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    setReport(analyzeJD(jd));
    setLoading(false);
    toast.success("Analysis complete");
  };

  return (
    <>
      <PageHeader title="Talent Intelligence" description="Decode the hiring market for any role — trends, salary, sourcing keywords, and strategy." />

      <Card className="p-5 shadow-soft-sm mb-6">
        <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste a job description here…" rows={6} className="text-sm" />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">{jd.length} characters</p>
          <Button onClick={run} disabled={loading} className="bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing…</> : <><Brain className="h-4 w-4 mr-2" />Analyze</>}
          </Button>
        </div>
      </Card>

      {!report && !loading && (
        <Card className="p-12 text-center border-2 border-dashed shadow-none bg-transparent">
          <Brain className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Paste a JD and click Analyze to see market insights.</p>
        </Card>
      )}

      {report && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Analyzing: <span className="font-medium text-foreground">{report.role}</span>
          </div>

          {/* Market */}
          <Section icon={TrendingUp} title="Market Trend Analysis">
            <div className="grid sm:grid-cols-3 gap-3">
              <Stat label="Demand" value={report.market.demand} tone={report.market.demand === "High" ? "success" : report.market.demand === "Medium" ? "warning" : "muted"} />
              <Stat label="Skill trend" value={report.market.trend} tone={report.market.trend === "Rising" ? "success" : report.market.trend === "Stable" ? "info" : "muted"} />
              <Stat label="Industry context" value="Active" tone="info" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">{report.market.context}</p>
          </Section>

          {/* Sources */}
          <Section icon={Building2} title="Talent Source Recommendations">
            <div className="grid sm:grid-cols-2 gap-4">
              <SourceList title="Top companies producing this talent" items={report.sources.topCompanies} />
              <SourceList title="Competitor companies to target" items={report.sources.competitors} />
              <SourceList title="Startup ecosystem" items={report.sources.startups} />
              <SourceList title="Service companies" items={report.sources.serviceCompanies} />
            </div>
          </Section>

          {/* Salary */}
          <Section icon={DollarSign} title="Salary Benchmarking">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <SalaryCard label="Entry level" value={report.salary.entry} />
              <SalaryCard label="Mid level" value={report.salary.mid} />
              <SalaryCard label="Senior level" value={report.salary.senior} />
              <SalaryCard label="Global" value={report.salary.global} accent />
            </div>
          </Section>

          {/* Keywords */}
          <Section icon={Search} title="Sourcing Keywords">
            <div className="space-y-4">
              <KeywordGroup title="LinkedIn search keywords" items={report.keywords.linkedin} />
              <KeywordGroup title="Job board keywords" items={report.keywords.jobBoards} />
              <KeywordGroup title="Alternative job titles" items={report.keywords.altTitles} />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Boolean search string</p>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(report.keywords.boolean); toast.success("Copied"); }}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
                <code className="block bg-secondary text-secondary-foreground rounded-lg p-3 text-xs font-mono break-all">{report.keywords.boolean}</code>
              </div>
            </div>
          </Section>

          {/* Strategy */}
          <Section icon={Target} title="Hiring Strategy Suggestions">
            <div className="grid sm:grid-cols-2 gap-4">
              <Tip title="Best hiring channels"><ul className="space-y-1.5 text-sm">{report.strategy.channels.map((c) => <li key={c} className="flex gap-2"><span className="text-brand">•</span>{c}</li>)}</ul></Tip>
              <Tip title="Fastest sourcing method">{report.strategy.fastest}</Tip>
              <Tip title="Referral strategy">{report.strategy.referral}</Tip>
              <Tip title="Remote vs local">{report.strategy.remoteAdvice}</Tip>
            </div>
          </Section>
        </div>
      )}
    </>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 shadow-soft-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "info" | "muted" }) {
  const toneClass = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <Badge className={`mt-2 ${toneClass} border-0 hover:${toneClass}`}>{value}</Badge>
    </div>
  );
}

function SourceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((c) => (
          <span key={c} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-medium">{c}</span>
        ))}
      </div>
    </div>
  );
}

function SalaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border border-border p-4 ${accent ? "bg-gradient-brand text-brand-foreground border-transparent" : ""}`}>
      <div className={`text-xs ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
      <div className="text-base font-semibold tracking-tight mt-2">{value}</div>
    </div>
  );
}

function KeywordGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((k) => (
          <span key={k} className="text-xs px-2.5 py-1 rounded-full border border-border bg-background">{k}</span>
        ))}
      </div>
    </div>
  );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}