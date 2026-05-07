import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Download, Sparkles, Upload, FileText, Loader2, CheckCheck } from "lucide-react";
import { exportMarkdownToDocx } from "@/lib/docxExport";
import { type JDInput } from "@/lib/jdGenerator";
import { supabase } from "@/integrations/supabase/client";
import { lsGet, lsSet } from "@/lib/storage";

export default function JDGenerator() {
  const [mode, setMode] = useState<"smartrecruit" | "template">("smartrecruit");
  const [template, setTemplate] = useState(() => lsGet<string>("template", ""));
  const [input, setInput] = useState<JDInput>({ role: "", experience: "", skills: "", company: "", workMode: "Remote" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lsSet("template", template);
  }, [template]);

  const onUpload = async (file: File) => {
    const text = await file.text();
    setTemplate(text);
    toast.success("Template uploaded");
  };

  const generate = async () => {
    if (!input.role || !input.company) {
      toast.error("Please enter at least Role and Company");
      return;
    }
    if (mode === "template" && !template.trim()) {
      toast.error("Upload or paste a template first");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("generate-jd", {
      body: { roleName: input.role, experience: input.experience, skills: input.skills, companyName: input.company, workMode: input.workMode, mode, template },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Failed to generate JD");
      return;
    }
    setOutput((data as any).jd);
    toast.success("JD generated");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied to clipboard");
  };

  const download = async () => {
    if (!output) return;
    await exportMarkdownToDocx(output, `${input.role || "JD"}-${input.company || "Company"}`.replace(/\s+/g, "-"));
    toast.success("Word file downloaded");
  };

  return (
    <>
      <PageHeader title="JD Generator" description="Create polished job descriptions with your template or SmartRecruit's structured format. Export as .docx." />

      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mb-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="smartrecruit" className="gap-2"><Sparkles className="h-4 w-4" />SmartRecruit Format</TabsTrigger>
          <TabsTrigger value="template" className="gap-2"><FileText className="h-4 w-4" />Company Template</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-4">
          <Card className="p-5 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label className="font-medium">Your company JD template</Label>
                <p className="text-xs text-muted-foreground mt-1">Use placeholders like {"{role}"}, {"{company}"}, {"{experience}"}, {"{skills}"}, {"{workMode}"}</p>
              </div>
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept=".txt,.md" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1.5" /> Upload
                </Button>
              </div>
            </div>
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Paste your company's JD template here. It will be saved and used for all future generations."
              rows={8}
              className="font-mono text-sm"
            />
            {template && <p className="text-xs text-success mt-2 flex items-center gap-1"><CheckCheck className="h-3.5 w-3.5" /> Template saved locally</p>}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft-sm">
          <h3 className="font-semibold mb-4">Role details</h3>
          <div className="space-y-4">
            <Field label="Role name"><Input value={input.role} onChange={(e) => setInput({ ...input, role: e.target.value })} placeholder="Senior Backend Engineer" /></Field>
            <Field label="Experience (years)"><Input value={input.experience} onChange={(e) => setInput({ ...input, experience: e.target.value })} placeholder="5" /></Field>
            <Field label="Skills (comma separated)"><Input value={input.skills} onChange={(e) => setInput({ ...input, skills: e.target.value })} placeholder="Node.js, PostgreSQL, AWS, Kubernetes" /></Field>
            <Field label="Company name"><Input value={input.company} onChange={(e) => setInput({ ...input, company: e.target.value })} placeholder="Acme Inc." /></Field>
            <Field label="Work mode">
              <Select value={input.workMode} onValueChange={(v) => setInput({ ...input, workMode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4 mr-2" />Generate JD</>}
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Preview</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
                {copied ? <CheckCheck className="h-4 w-4 mr-1.5 text-success" /> : <Copy className="h-4 w-4 mr-1.5" />} Copy
              </Button>
              <Button size="sm" onClick={download} disabled={!output}>
                <Download className="h-4 w-4 mr-1.5" /> .docx
              </Button>
            </div>
          </div>
          {output ? (
            <Textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={20} className="font-mono text-sm flex-1" />
          ) : (
            <div className="flex-1 min-h-[400px] flex items-center justify-center text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
              <div>
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Your JD will appear here</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
