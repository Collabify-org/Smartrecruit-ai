import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Brain, Phone, ArrowRight, Clock, TrendingUp, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getUser } from "@/lib/auth";

interface UsageStat {
  jds_used: number;
  jds_limit: number;
  talent_used: number;
  talent_limit: number;
  interview_used: number;
  interview_limit: number;
  plan: string;
}

interface RecentItem {
  id: string;
  type: "jd" | "talent" | "interview";
  title: string;
  created_at: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const firstName = (user?.name || "there").split(" ")[0];
  const [stats, setStats] = useState<UsageStat | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { setLoading(false); return; }

    const [usageRes, jdRes, talentRes, interviewRes] = await Promise.all([
      supabase.from("profiles").select("plan, usage_jd, usage_interview, usage_talent").eq("id", authUser.id).single(),
      supabase.from("jd_history").select("id, role_name, created_at").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("talent_history").select("id, jd_input, created_at").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("interview_history").select("id, jd_input, created_at").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(3),
    ]);

    if (usageRes.data) {
      const p: any = usageRes.data;
      const limits: Record<string, number> = { free: 3, trial: 3, starter: 10, professional: 50, enterprise: 9999 };
      const limit = limits[p.plan] ?? 3;
      setStats({
        plan: p.plan,
        jds_used: p.usage_jd ?? 0, jds_limit: limit,
        talent_used: p.usage_talent ?? 0, talent_limit: limit,
        interview_used: p.usage_interview ?? 0, interview_limit: limit,
      });
    }

    const recentItems: RecentItem[] = [
      ...(jdRes.data || []).map((j: any) => ({ id: j.id, type: "jd" as const, title: j.role_name || "Untitled JD", created_at: j.created_at })),
      ...(talentRes.data || []).map((t: any) => ({ id: t.id, type: "talent" as const, title: (t.jd_input || "").slice(0, 50) + "...", created_at: t.created_at })),
      ...(interviewRes.data || []).map((i: any) => ({ id: i.id, type: "interview" as const, title: (i.jd_input || "").slice(0, 50) + "...", created_at: i.created_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    setRecent(recentItems);
    setLoading(false);
  }

  const usagePercent = (used: number, limit: number) => Math.min(Math.round((used / limit) * 100), 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* GREETING */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your AI hiring OS is ready. What are you working on today?
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/app/jd-generator")}
          className="group rounded-2xl border border-border bg-card p-5 text-left hover:border-brand hover:shadow-glow transition-all duration-200"
        >
          <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
            <FileText className="h-5 w-5" />
          </div>
          <div className="font-semibold text-sm">JD Generator</div>
          <div className="text-xs text-muted-foreground mt-1">Write a job description in 60 seconds</div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand">
            Start generating <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() => navigate("/app/talent-intelligence")}
          className="group rounded-2xl border border-border bg-card p-5 text-left hover:border-brand hover:shadow-glow transition-all duration-200"
        >
          <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
            <Brain className="h-5 w-5" />
          </div>
          <div className="font-semibold text-sm">Talent Intelligence</div>
          <div className="text-xs text-muted-foreground mt-1">Decode salaries, sourcing and market data</div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand">
            Analyze market <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() => navigate("/app/interview-questions")}
          className="group rounded-2xl border border-border bg-card p-5 text-left hover:border-brand hover:shadow-glow transition-all duration-200"
        >
          <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
            <Phone className="h-5 w-5" />
          </div>
          <div className="font-semibold text-sm">Interview Questions</div>
          <div className="text-xs text-muted-foreground mt-1">Generate full interview kit from any JD</div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand">
            Generate kit <ArrowRight className="h-3 w-3" />
          </div>
        </button>
      </div>

      {/* USAGE + RECENT */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* USAGE */}
        <Card className="p-6 shadow-soft-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Usage this month</div>
            {stats?.plan && (
              <Badge variant="secondary" className="capitalize">{stats.plan} plan</Badge>
            )}
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-secondary rounded animate-pulse" />)}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <UsageBar
                icon={FileText}
                label="JD Generator"
                used={stats.jds_used}
                limit={stats.jds_limit}
                percent={usagePercent(stats.jds_used, stats.jds_limit)}
              />
              <UsageBar
                icon={Brain}
                label="Talent Intelligence"
                used={stats.talent_used}
                limit={stats.talent_limit}
                percent={usagePercent(stats.talent_used, stats.talent_limit)}
              />
              <UsageBar
                icon={Phone}
                label="Interview Questions"
                used={stats.interview_used}
                limit={stats.interview_limit}
                percent={usagePercent(stats.interview_used, stats.interview_limit)}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No usage data yet.</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate("/app/billing")}
          >
            Manage plan
          </Button>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card className="p-6 shadow-soft-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Recent activity</div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/history")} className="text-xs">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-secondary rounded animate-pulse" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
              <Zap className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No activity yet — start generating!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    {item.type === "jd" && <FileText className="h-4 w-4" />}
                    {item.type === "talent" && <Brain className="h-4 w-4" />}
                    {item.type === "interview" && <Phone className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" /> {timeAgo(item.created_at)}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{item.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* TIPS */}
      <Card className="p-6 bg-gradient-subtle border-border shadow-soft-sm">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Pro tip — use the full workflow</div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Generate a JD first → paste it into Talent Intelligence to decode the market → then paste into Interview Questions to get a full kit. Three tools, one workflow, 12 hours saved.
            </div>
            <Button size="sm" className="mt-3 bg-gradient-brand text-brand-foreground shadow-glow" onClick={() => navigate("/app/jd-generator")}>
              Start with JD Generator <ArrowRight className="h-3 w-3 ml-1.5" />
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}

function UsageBar({ icon: Icon, label, used, limit, percent }: {
  icon: any; label: string; used: number; limit: number; percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Icon className="h-3.5 w-3.5 text-brand" /> {label}
        </div>
        <span className="text-xs text-muted-foreground">{used} / {limit}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${percent >= 90 ? "bg-destructive" : percent >= 70 ? "bg-warning" : "bg-brand"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
