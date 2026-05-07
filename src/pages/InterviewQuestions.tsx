import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, Loader2, Copy, Download, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exportMarkdownToDocx } from "@/lib/docxExport";

type PhoneScreenSheet = { role: string; markdown: string };

export default function InterviewQuestions() {
  const [jd, setJd] = useState("");
  const [sheet, setSheet] = useState<PhoneScreenSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (jd.trim().length < 30) {
      toast.error("Paste a longer JD to generate questions");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("interview-questions", { body: { jd } });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Failed to generate questions");
      return;
    }
    const md = (data as any).questions as string;
    const roleMatch = md.match(/Phone Screen Sheet\s*[—-]\s*(.+)/i);
    setSheet({ role: roleMatch?.[1]?.trim() || "Role", markdown: md });
    toast.success("Phone screen sheet ready");
  };

  const copy = async () => {
    if (!sheet) return;
    await navigator.clipboard.writeText(sheet.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied to clipboard");
  };

  const download = async () => {
    if (!sheet) return;
    await exportMarkdownToDocx(sheet.markdown, `Phone-Screen-${sheet.role}`.replace(/\s+/g, "-"));
    toast.success("Word file downloaded");
  };

  return (
    <>
      <PageHeader
        title="Interview Questions"
        description="Generate role-specific phone screening questions instantly from any JD."
      />

      <Card className="p-5 shadow-soft-sm mb-6">
        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste a job description here…"
          rows={6}
          className="text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">{jd.length} characters</p>
          <Button
            onClick={generate}
            disabled={loading}
            className="bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
            ) : (
              <><Mic className="h-4 w-4 mr-2" />Generate Questions</>
            )}
          </Button>
        </div>
      </Card>

      {!sheet && !loading && (
        <Card className="p-12 text-center border-2 border-dashed shadow-none bg-transparent">
          <Mic className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Paste a JD and click Generate Questions to build your phone screen sheet.
          </p>
        </Card>
      )}

      {sheet && (
        <Card className="p-6 shadow-soft-sm flex flex-col animate-fade-in">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="font-semibold tracking-tight">
              Phone Screen Sheet — <span className="text-brand">{sheet.role}</span>
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <CheckCheck className="h-4 w-4 mr-1.5 text-success" /> : <Copy className="h-4 w-4 mr-1.5" />} Copy
              </Button>
              <Button size="sm" onClick={download}>
                <Download className="h-4 w-4 mr-1.5" /> .docx
              </Button>
            </div>
          </div>
          <Textarea
            value={sheet.markdown}
            onChange={(e) => setSheet({ ...sheet, markdown: e.target.value })}
            rows={24}
            className="font-mono text-sm flex-1"
          />
        </Card>
      )}
    </>
  );
}