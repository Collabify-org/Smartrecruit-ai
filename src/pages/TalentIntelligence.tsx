import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, Loader2, Copy, Download, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exportMarkdownToDocx } from "@/lib/docxExport";

export default function TalentIntelligence() {
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (jd.trim().length < 30) {
      toast.error("Paste a longer JD to analyze");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("talent-intel", { body: { jd } });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Failed to analyze");
      return;
    }
    setReport((data as any).results);
    toast.success("Analysis complete");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied to clipboard");
  };

  const download = async () => {
    if (!report) return;
    await exportMarkdownToDocx(report, "Talent-Intelligence-Report");
    toast.success("Word file downloaded");
  };

  return (
    <>
      <PageHeader title="Talent Intelligence" description="Decode the hiring market for any role — keywords, platforms, salary, and sourcing companies." />

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
        <Card className="p-6 shadow-soft-sm flex flex-col animate-fade-in">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="font-semibold tracking-tight">Talent Intelligence Report</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <CheckCheck className="h-4 w-4 mr-1.5 text-success" /> : <Copy className="h-4 w-4 mr-1.5" />} Copy
              </Button>
              <Button size="sm" onClick={download}>
                <Download className="h-4 w-4 mr-1.5" /> .docx
              </Button>
            </div>
          </div>
          <Textarea value={report} onChange={(e) => setReport(e.target.value)} rows={26} className="font-mono text-sm" />
        </Card>
      )}
    </>
  );
}