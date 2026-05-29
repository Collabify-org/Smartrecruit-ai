import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Brain, Phone, Clock, Download, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

type HistoryTab = "all" | "jd" | "talent" | "interview";

interface HistoryItem {
  id: string;
  type: "jd" | "talent" | "interview";
  title: string;
  content: string;
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

function downloadDoc(filename: string, content: string) {
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${filename}</title>
      </head>
      <body style="font-family: Calibri, sans-serif; font-size: 12pt; line-height: 1.6; padding: 40px;">
        <pre style="white-space: pre-wrap; font-family: Calibri, sans-serif; font-size: 12pt;">${content}</pre>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<HistoryTab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [jdRes, talentRes, interviewRes] = await Promise.all([
      supabase.from("jd_history").select("id, role_name, content, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("talent_history").select("id, jd_input, results, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("interview_history").select("id, jd_input, questions, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    const all: HistoryItem[] = [
      ...(jdRes.data || []).map((j: any) => ({
        id: j.id,
        type: "jd" as const,
        title: j.role_name || "Untitled JD",
        content: j.content || "",
        created_at: j.created_at,
      })),
      ...(talentRes.data || []).map((t: any) => ({
        id: t.id,
        type: "talent" as const,
        title: (t.jd_input || "Talent Analysis").slice(0, 60),
        content: t.results || "",
        created_at: t.created_at,
      })),
      ...(interviewRes.data || []).map((i: any) => ({
        id: i.id,
        type: "interview" as const,
        title: (i.jd_input || "Interview Kit").slice(0, 60),
        content: i.questions || "",
        created_at: i.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setItems(all);
    setLoading(false);
  }

  async function deleteItem(item: HistoryItem) {
    const table = item.type === "jd" ? "jd_history" : item.type === "talent" ? "talent_history" : "interview_history";
    await supabase.from(table).delete().eq("id", item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  const filtered = tab === "all" ? items : items.filter(i => i.type === tab);

  const typeConfig = {
    jd: { icon: FileText, label: "JD", color: "text-blue-500", bg: "bg-blue-500/10" },
    talent: { icon: Brain, label: "Talent", color: "text-purple-500", bg: "bg-purple-500/10" },
    interview: { icon: Phone, label: "Interview", color: "text-green-500", bg: "bg-green-500/10" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your generated documents — view, download, or delete.
        </p>
      </div>

      {/* TABS */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as HistoryTab)}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="jd">JD ({items.filter(i => i.type === "jd").length})</TabsTrigger>
          <TabsTrigger value="talent">Talent ({items.filter(i => i.type === "talent").length})</TabsTrigger>
          <TabsTrigger value="interview">Interview ({items.filter(i => i.type === "interview").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <Filter className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">No records found</p>
          <p className="text-sm mt-1">Start generating to build your history.</p>
          <Button className="mt-4" onClick={() => navigate("/app/jd-generator")}>
            Generate your first JD
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            const isOpen = expanded === item.id;

            return (
              <Card key={item.id} className="overflow-hidden">
                {/* ROW */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/40 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {timeAgo(item.created_at)}
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                    {cfg.label}
                  </Badge>

                  <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Download as .doc"
                      onClick={() => downloadDoc(item.title, item.content)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => deleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
                {isOpen && item.content && (
                  <div className="border-t px-4 py-4 bg-secondary/20">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                      {item.content}
                    </pre>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
