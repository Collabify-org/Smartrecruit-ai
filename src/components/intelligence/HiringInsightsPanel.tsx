import { useEffect, useState } from "react";
import { Sparkles, ShieldAlert, TrendingUp, Users, Loader2, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateHiringInsights, type HiringInsights } from "@/lib/intelligence/aiMockService";

type Props = {
  role: string;
  industry?: string;
  experience?: string;
  skills?: string[];
  country?: string;
  active: boolean;
};

export function HiringInsightsPanel({ role, industry, experience, skills, country, active }: Props) {
  const [data, setData] = useState<HiringInsights | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active || !role || role.trim().length < 3) {
      setData(null);
      return;
    }
    setLoading(true);
    generateHiringInsights({ role, industry, experience, skills, country })
      .then(setData)
      .finally(() => setLoading(false));
  }, [active, role, industry, experience, country, skills?.join("|")]);

  if (!active) return null;

  if (loading || !data) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Generating hiring intelligence…
      </div>
    );
  }

  const sevColor = (s: "low" | "medium" | "high") =>
    s === "high" ? "text-destructive border-destructive/30 bg-destructive/5"
    : s === "medium" ? "text-warning border-warning/30 bg-warning/5"
    : "text-success border-success/30 bg-success/5";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" /> AI Hiring Intelligence
        </p>
        {data.pendingApiConfiguration && (
          <Badge variant="outline" className="text-[10px]">Pending API configuration</Badge>
        )}
      </div>

      <Section title="Salary insight" icon={<TrendingUp className="h-3.5 w-3.5" />}>
        <div className="text-sm">
          <span className="font-semibold">{data.salary.currency} {data.salary.min.toLocaleString()} – {data.salary.max.toLocaleString()}</span>
          <span className="text-muted-foreground"> · median {data.salary.currency} {data.salary.median.toLocaleString()}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">{data.salary.source}</p>
      </Section>

      <Section title="Hiring risks" icon={<ShieldAlert className="h-3.5 w-3.5" />}>
        <ul className="space-y-1.5">
          {data.risks.map((r) => (
            <li key={r.title} className={`text-xs rounded border px-2 py-1.5 ${sevColor(r.severity)}`}>
              <span className="font-medium capitalize">{r.severity} · {r.title}</span>
              <p className="text-foreground/80 mt-0.5">{r.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Interview questions" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
        <ol className="space-y-1.5 text-xs list-decimal pl-4">
          {data.interviewQuestions.map((q, i) => (
            <li key={i}>
              <span className="text-foreground">{q.question}</span>
              <Badge variant="secondary" className="ml-2 text-[10px] capitalize">{q.type}</Badge>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Sourcing platforms" icon={<Users className="h-3.5 w-3.5" />}>
        <div className="flex flex-wrap gap-1.5">
          {data.sourcingPlatforms.map((p) => (
            <span key={p.name} className="text-[11px] px-2 py-1 rounded-full border border-border bg-secondary/40" title={p.reason}>
              {p.name}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}