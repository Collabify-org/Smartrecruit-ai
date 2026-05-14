import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, Phone, Download, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exportMarkdownToDocx, exportTalentReportToDocx, exportInterviewToDocx } from "@/lib/docxExport";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

interface JDRecord {
  id: string;
  created_at: string;
  role_name: string;
  company_name: string;
  output: string;
}

interface InterviewRecord {
  id: string;
  created_at: string;
  jd_input: string;
  questions: string;
}

interface TalentRecord {
  id: string;
  created_at: string;
  jd_input: string;
  result: string;
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

function parseQuestions(raw: string) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Object.entries(parsed) as [string, any[]][];
  } catch {
    return null;
  }
}

export default function History() {
  const [jds, setJds] = useState<JDRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [talents, setTalents] = useState<TalentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const [jdRes, intRes, talRes] = await Promise.all([
      supabase.from("jd_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("interview_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("talent_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setJds((jdRes.data as JDRecord[]) ?? []);
    setInterviews((intRes.data as InterviewRecord[]) ?? []);
    setTalents((talRes.data as TalentRecord[]) ?? []);
    setLoading(false);
  }

  const downloadJD = async (record: JDRecord) => {
    await exportMarkdownToDocx(record.output, `${record.role_name}-${record.company_name}`.replace(/\s+/g, "-"));
    toast.success("Downloaded!");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <>
      <PageHeader title="History" description="All your generated JDs, interview question sets, and talent analyses." />
      <Tabs defaultValue="jds">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="jds" className="gap-2">
            <FileText className="h-4 w-4" /> JDs
            <Badge variant="secondary" className="ml-1">{jds.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="interviews" className="gap-2">
            <Phone className="h-4 w-4" /> Interview Questions
            <Badge variant="secondary" className="ml-1">{interviews.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="talent" className="gap-2">
            <Brain className="h-4 w-4" /> Talent Intel
            <Badge variant="secondary" className="ml-1">{talents.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* JDs Tab */}
        <TabsContent value="jds">
          {jds.length === 0 ? <Empty icon={FileText} text="No JDs generated yet" /> : (
            <div className="space-y-3">
              {jds.map((jd) => (
                <Card key={jd.id} className="p-5 shadow-soft-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{jd.role_name || "Untitled Role"}</span>
                        {jd.company_name && <Badge variant="outline">{jd.company_name}</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" /> {timeAgo(jd.created_at)}
                      </div>
                      {expandedId === jd.id && (
                        <pre className="mt-4 text-xs bg-secondary rounded-lg p-4 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                          {jd.output}
                        </pre>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === jd.id ? null : jd.id)}>
                        {expandedId === jd.id ? "Hide" : "View"}
                      </Button>
                      <Button size="sm" onClick={() => downloadJD(jd)}>
                        <Download className="h-4 w-4 mr-1.5" /> .docx
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Interview Questions Tab */}
        <TabsContent value="interviews">
          {interviews.length === 0 ? <Empty icon={Phone} text="No interview question sets generated yet" /> : (
            <div className="space-y-3">
              {interviews.map((rec) => {
                const categories = parseQuestions(rec.questions);
                const isExpanded = expandedId === rec.id;
                return (
                  <Card key={rec.id} className="p-5 shadow-soft-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{rec.jd_input?.slice(0, 80)}...</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" /> {timeAgo(rec.created_at)}
                        </div>
                        {isExpanded && categories && (
                          <div className="mt-4 space-y-4">
                            {categories.map(([cat, questions]) => (
                              <div key={cat}>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 capitalize">
                                  {cat.replace(/_/g, " ")}
                                </h4>
                                <div className="space-y-3">
                                  {Array.isArray(questions) && questions.map((q: any, i: number) => (
                                    <div key={i} className="bg-secondary rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-primary">Q{i + 1}</span>
                                        <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                                        <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                                      </div>
                                      <p className="text-sm font-medium mb-2">{q.question}</p>
                                      {q.ideal_answer_points?.length > 0 && (
                                        <div>
                                          <p className="text-xs text-muted-foreground font-medium mb-1">Key Answer Points:</p>
                                          <ul className="space-y-0.5">
                                            {q.ideal_answer_points.map((pt: string, j: number) => (
                                              <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                                                <span className="text-primary mt-0.5">•</span> {pt}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setExpandedId(isExpanded ? null : rec.id)}>
                          {isExpanded ? "Hide" : "View"}
                        </Button>
                        <Button size="sm" onClick={async () => {
                          try {
                            const parsed = typeof rec.questions === "string" ? JSON.parse(rec.questions) : rec.questions;
                            await exportInterviewToDocx(parsed, `interview-${rec.id.slice(0, 8)}`);
                            toast.success("Downloaded!");
                          } catch { toast.error("Download failed"); }
                        }}>
                          <Download className="h-4 w-4 mr-1.5" /> .docx
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Talent Intel Tab */}
        <TabsContent value="talent">
          {talents.length === 0 ? <Empty icon={Brain} text="No talent analyses generated yet" /> : (
            <div className="space-y-3">
              {talents.map((rec) => {
                const isExpanded = expandedId === rec.id;
                let parsed: any = null;
                try { parsed = typeof rec.result === "string" ? JSON.parse(rec.result) : rec.result; } catch {}
                return (
                  <Card key={rec.id} className="p-5 shadow-soft-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{rec.jd_input?.slice(0, 80)}...</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" /> {timeAgo(rec.created_at)}
                        </div>
                        {isExpanded && parsed && (
                          <div className="mt-4 space-y-4">
                            {Object.entries(parsed).map(([key, value]) => (
                              <div key={key} className="bg-secondary rounded-lg p-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                  {key.replace(/_/g, " ")}
                                </h4>
                                {Array.isArray(value) ? (
                                  <ul className="space-y-0.5">
                                    {value.map((v: any, i: number) => (
                                      <li key={i} className="text-xs flex gap-1.5">
                                        <span className="text-primary">•</span>
                                        {typeof v === "object" ? JSON.stringify(v) : v}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm">{typeof value === "object" ? JSON.stringify(value) : String(value)}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setExpandedId(isExpanded ? null : rec.id)}>
                          {isExpanded ? "Hide" : "View"}
                        </Button>
                        <Button size="sm" onClick={async () => {
                          try {
                            const parsed = typeof rec.result === "string" ? JSON.parse(rec.result) : rec.result;
                            await exportTalentReportToDocx(parsed, `talent-${rec.id.slice(0, 8)}`);
                            toast.success("Downloaded!");
                          } catch { toast.error("Download failed"); }
                        }}>
                          <Download className="h-4 w-4 mr-1.5" /> .docx
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function Empty({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
      <Icon className="h-8 w-8 mb-2 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
