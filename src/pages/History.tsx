import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Brain, Phone, Clock, Download, Filter, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ShadingType, HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";
import { exportMarkdownToDocx } from "@/lib/docxExport";
import { exportTalentReportToDocx } from "@/lib/docxExport";

type HistoryTab = "all" | "jd" | "talent" | "interview";

interface HistoryItem {
  id: string;
  type: "jd" | "talent" | "interview";
  title: string;
  rawContent: string;
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

// ── Interview .docx (same logic as InterviewQuestions.tsx) ──────────────────
async function downloadInterviewDocx(title: string, rawJson: string) {
  const NAVY = "1a3a5c";
  const navyCell = (text: string) =>
    new TableCell({
      shading: { type: ShadingType.SOLID, color: NAVY },
      children: [new Paragraph({ children: [new TextRun({ text, color: "FFFFFF", bold: true, size: 20 })] })],
    });
  const bodyCell = (text: string, color = "000000") =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: text ?? "", size: 18, color })] })],
    });
  const listCell = (items: string[], color = "333333") =>
    new TableCell({
      children: (items || []).map(
        (item) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: item, size: 18, color })] })
      ),
    });
  const sectionHeading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
      children: [new TextRun({ text, bold: true, color: NAVY, size: 26 })],
    });

  let result: any;
  try { result = JSON.parse(rawJson); } catch { toast.error("Could not parse interview data"); return; }

  const sections: any[] = [];

  sections.push(new Paragraph({
    children: [new TextRun({ text: "Interview Question Bank", bold: true, size: 36, color: NAVY })],
    spacing: { after: 200 },
  }));

  // TECHNICAL
  sections.push(sectionHeading("1. Technical Questions"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("#"), navyCell("Question"), navyCell("Level"), navyCell("Category"), navyCell("Ideal Answer Points")] }),
      ...(result.technical || []).map((q: any, i: number) =>
        new TableRow({ children: [bodyCell(`${i + 1}`), bodyCell(q.question), bodyCell(q.difficulty), bodyCell(q.category), listCell(q.ideal_answer_points)] })
      ),
    ],
  }));

  // BEHAVIORAL
  sections.push(sectionHeading("2. Behavioral Questions"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("#"), navyCell("Question"), navyCell("Competency"), navyCell("STAR Prompts"), navyCell("Red Flags")] }),
      ...(result.behavioral || []).map((q: any, i: number) =>
        new TableRow({ children: [bodyCell(`${i + 1}`), bodyCell(q.question), bodyCell(q.competency), listCell(q.star_prompts), listCell(q.red_flags, "CC0000")] })
      ),
    ],
  }));

  // SITUATIONAL
  sections.push(sectionHeading("3. Situational Questions"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("#"), navyCell("Question"), navyCell("What to Assess"), navyCell("Ideal Answer Points"), navyCell("Red Flags")] }),
      ...(result.situational || []).map((q: any, i: number) =>
        new TableRow({ children: [bodyCell(`${i + 1}`), bodyCell(q.question), bodyCell(q.what_to_assess), listCell(q.ideal_answer_points), listCell(q.red_flags, "CC0000")] })
      ),
    ],
  }));

  // CULTURE FIT
  sections.push(sectionHeading("4. Culture Fit Questions"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("#"), navyCell("Question"), navyCell("What to Assess"), navyCell("Positive Signals"), navyCell("Red Flags")] }),
      ...(result.culture_fit || []).map((q: any, i: number) =>
        new TableRow({ children: [bodyCell(`${i + 1}`), bodyCell(q.question), bodyCell(q.what_to_assess), listCell(q.positive_signals, "1a5c2a"), listCell(q.red_flags, "CC0000")] })
      ),
    ],
  }));

  // ROLE SPECIFIC
  sections.push(sectionHeading("5. Role-Specific Questions"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("#"), navyCell("Question"), navyCell("Why Critical"), navyCell("Ideal Answer Points"), navyCell("Red Flags")] }),
      ...(result.role_specific || []).map((q: any, i: number) =>
        new TableRow({ children: [bodyCell(`${i + 1}`), bodyCell(q.question), bodyCell(q.rationale), listCell(q.ideal_answer_points), listCell(q.red_flags, "CC0000")] })
      ),
    ],
  }));

  // INTERVIEW STRUCTURE
  sections.push(sectionHeading("6. Interview Structure"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("Round"), navyCell("Name"), navyCell("Duration"), navyCell("Focus"), navyCell("Interviewer")] }),
      ...(result.interview_structure || []).map((r: any) =>
        new TableRow({ children: [bodyCell(r.round), bodyCell(r.name), bodyCell(`${r.duration_minutes} mins`), bodyCell(r.focus), bodyCell(r.interviewer)] })
      ),
    ],
  }));

  // SCORECARD
  sections.push(sectionHeading("7. Evaluation Scorecard"));
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [navyCell("Criteria"), navyCell("Weight"), navyCell("Green Flags"), navyCell("Red Flags")] }),
      ...(result.scorecard || []).map((s: any) =>
        new TableRow({ children: [bodyCell(s.criteria), bodyCell(s.weight), listCell(s.green_flags, "1a5c2a"), listCell(s.red_flags, "CC0000")] })
      ),
    ],
  }));

  const doc = new Document({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/[^a-z0-9]/gi, "-")}-Interview-Kit.docx`);
  toast.success("Interview kit downloaded!");
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<HistoryTab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => { fetchHistory(); }, []);

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
        id: j.id, type: "jd" as const,
        title: j.role_name || "Untitled JD",
        rawContent: j.content || "",
        created_at: j.created_at,
      })),
      ...(talentRes.data || []).map((t: any) => ({
        id: t.id, type: "talent" as const,
        title: (t.jd_input || "Talent Analysis").slice(0, 60),
        rawContent: t.results || "",
        created_at: t.created_at,
      })),
      ...(interviewRes.data || []).map((i: any) => ({
        id: i.id, type: "interview" as const,
        title: (i.jd_input || "Interview Kit").slice(0, 60),
        rawContent: i.questions || "",
        created_at: i.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setItems(all);
    setLoading(false);
  }

  async function handleDownload(item: HistoryItem) {
    setDownloading(item.id);
    try {
      if (item.type === "interview") {
        await downloadInterviewDocx(item.title, item.rawContent);
      } else if (item.type === "talent") {
        let parsed: any;
        try { parsed = JSON.parse(item.rawContent); } catch { toast.error("Could not parse talent data"); return; }
        await exportTalentReportToDocx(parsed, `${item.title.replace(/[^a-z0-9]/gi, "-")}-Talent-Report`);
        toast.success("Talent report downloaded!");
      } else if (item.type === "jd") {
        await exportMarkdownToDocx(item.rawContent, `${item.title.replace(/[^a-z0-9]/gi, "-")}-JD`);
        toast.success("JD downloaded!");
      }
    } catch (e: any) {
      toast.error("Download failed: " + e.message);
    }
    setDownloading(null);
  }

  async function deleteItem(item: HistoryItem) {
    const table = item.type === "jd" ? "jd_history" : item.type === "talent" ? "talent_history" : "interview_history";
    await supabase.from(table).delete().eq("id", item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast.success("Deleted");
  }

  const filtered = tab === "all" ? items : items.filter(i => i.type === tab);

  const typeConfig = {
    jd: { icon: FileText, label: "JD", color: "text-blue-500", bg: "bg-blue-500/10" },
    talent: { icon: Brain, label: "Talent", color: "text-purple-500", bg: "bg-purple-500/10" },
    interview: { icon: Phone, label: "Interview", color: "text-green-500", bg: "bg-green-500/10" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your generated documents — view, download as .docx, or delete.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as HistoryTab)}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="jd">JD ({items.filter(i => i.type === "jd").length})</TabsTrigger>
          <TabsTrigger value="talent">Talent ({items.filter(i => i.type === "talent").length})</TabsTrigger>
          <TabsTrigger value="interview">Interview ({items.filter(i => i.type === "interview").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <Filter className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">No records found</p>
          <p className="text-sm mt-1">Start generating to build your history.</p>
          <Button className="mt-4" onClick={() => navigate("/app/jd-generator")}>Generate your first JD</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            const isOpen = expanded === item.id;
            const isDownloading = downloading === item.id;

            return (
              <Card key={item.id} className="overflow-hidden">
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
                      <Clock className="h-3 w-3" /> {timeAgo(item.created_at)}
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{cfg.label}</Badge>

                  <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Download .docx"
                      disabled={isDownloading}
                      onClick={() => handleDownload(item)}
                    >
                      {isDownloading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Download className="h-4 w-4" />
                      }
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

                {isOpen && item.rawContent && (
                  <div className="border-t px-4 py-4 bg-secondary/20">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                      {item.rawContent}
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
