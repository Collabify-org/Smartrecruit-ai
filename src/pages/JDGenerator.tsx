import { useState, useEffect, useMemo, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Download, Sparkles, Loader2, Wand2, CheckCheck } from "lucide-react";
import { exportMarkdownToDocx } from "@/lib/docxExport";
import { type JDInput } from "@/lib/jdGenerator";
import { supabase } from "@/integrations/supabase/client";
import { lsGet, lsSet } from "@/lib/storage";
import { AutocompleteInput, type AutocompleteItem } from "@/components/intelligence/AutocompleteInput";
import { IndustryMultiSelect } from "@/components/intelligence/IndustryMultiSelect";
import { SkillRecommender } from "@/components/intelligence/SkillRecommender";
import { DocumentUploader } from "@/components/intelligence/DocumentUploader";
import { HiringInsightsPanel } from "@/components/intelligence/HiringInsightsPanel";
import { suggestRoles } from "@/lib/intelligence/roles";
import { searchCompanies } from "@/lib/intelligence/companies";
import { identifyFromJD } from "@/lib/intelligence/aiMockService";
import type { ExtractedJD } from "@/lib/intelligence/documentExtractor";

export default function JDGenerator() {
  const [mode, setMode] = useState<"smartrecruit" | "upload">("smartrecruit");
  const [input, setInput] = useState<JDInput>({
    role: "",
    experience: "",
    skills: "",
    company: "",
    workMode: "Remote",
    country: "India",
    industry: "Technology",
    seniority: "Mid-level",
    hiringType: "Full-time",
    benefits: "",
  });
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [industriesList, setIndustriesList] = useState<string[]>(["Technology"]);
  const [department, setDepartment] = useState<string>("");
  const [extractedSource, setExtractedSource] = useState<ExtractedJD | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync skills list <-> CSV input (backend expects CSV)
  useEffect(() => {
    setInput((p) => ({ ...p, skills: skillsList.join(", ") }));
  }, [skillsList]);

  // Sync industry multiselect -> backend single string
  useEffect(() => {
    setInput((p) => ({ ...p, industry: industriesList.join(", ") || "Technology" }));
  }, [industriesList]);

  const roleFetcher = useMemo(
    () => (q: string): AutocompleteItem[] =>
      suggestRoles(q, 10).map((r) => ({ value: r.title, label: r.title, sub: r.department })),
    []
  );
  const companyFetcher = useMemo(
    () => async (q: string): Promise<AutocompleteItem[]> => {
      const res = await searchCompanies(q, 10);
      return res.map((c) => ({ value: c.name, label: c.name, sub: c.industry }));
    },
    []
  );

  const onJDParsed = async (data: ExtractedJD) => {
    setExtractedSource(data);
    const ai = await identifyFromJD(data.rawText);
    setInput((p) => ({
      ...p,
      role: data.jobTitle || ai.role || p.role,
      experience: data.experience || ai.experience || p.experience,
      hiringType: data.employmentType || p.hiringType,
    }));
    if (data.industry && !industriesList.includes(data.industry)) {
      setIndustriesList((prev) => Array.from(new Set([data.industry!, ...prev])).slice(0, 5));
    }
    if (data.department) setDepartment(data.department);
    const merged = Array.from(new Set([...skillsList, ...data.requiredSkills, ...ai.skills])).slice(0, 12);
    if (merged.length) setSkillsList(merged);
    toast.success("Job information extracted — review and refine.");
  };

  const generate = async () => {
    if (!input.role || !input.company) {
      toast.error("Please enter at least Role and Company");
      return;
    }
    setLoading(true);
    const apiMode: "smartrecruit" = "smartrecruit";
    const { data, error } = await supabase.functions.invoke("generate-jd", {
      body: {
        roleName: input.role,
        experience: input.experience,
        skills: input.skills,
        companyName: input.company,
        workMode: input.workMode,
        country: input.country,
        industry: input.industry,
        seniority: input.seniority,
        hiringType: input.hiringType,
        benefits: input.benefits,
        mode: apiMode,
        sourceJD: extractedSource?.rawText || undefined,
      },
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
      <PageHeader title="Hiring Intelligence" description="Upload a JD, get instant AI-powered role, skills, salary, risks and interview insights — then export a recruiter-ready hiring kit." />

      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mb-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="upload" className="gap-2"><Wand2 className="h-4 w-4" />Smart Upload</TabsTrigger>
          <TabsTrigger value="smartrecruit" className="gap-2"><Sparkles className="h-4 w-4" />SmartRecruit Format</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <Card className="p-5 shadow-soft-sm">
            <div className="mb-3">
              <Label className="font-medium">Upload Job Description (PDF · DOCX · TXT)</Label>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll extract the role, skills, experience and structure. Then the AI fills the rest below.
              </p>
            </div>
            <DocumentUploader onParsed={onJDParsed} />
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-soft-sm">
          <h3 className="font-semibold mb-4">Role details</h3>
          <div className="space-y-4">

            <Field label="Role name">
              <AutocompleteInput
                value={input.role}
                onChange={(v) => setInput({ ...input, role: v })}
                onSelect={(it) => {
                  setInput((p) => ({ ...p, role: it.value }));
                  if (it.sub) setDepartment(it.sub);
                }}
                fetcher={roleFetcher}
                placeholder="Start typing — e.g. Sales, HR, Developer"
                emptyHint="Type at least 3 characters for AI role suggestions"
              />
              {department && (
                <p className="text-[11px] text-muted-foreground mt-1">Department: <span className="text-foreground">{department}</span></p>
              )}
            </Field>

            <Field label="Company name">
              <AutocompleteInput
                value={input.company}
                onChange={(v) => setInput({ ...input, company: v })}
                fetcher={companyFetcher}
                placeholder="e.g. Infosys, Amazon, Stripe"
                emptyHint="Type at least 3 characters for company suggestions"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Country">
                <Select value={input.country} onValueChange={(v) => setInput({ ...input, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">🇮🇳 India</SelectItem>
                    <SelectItem value="USA">🇺🇸 USA</SelectItem>
                    <SelectItem value="UAE">🇦🇪 UAE</SelectItem>
                    <SelectItem value="UK">🇬🇧 UK</SelectItem>
                    <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                    <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                    <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Seniority">
                <Select value={input.seniority} onValueChange={(v) => setInput({ ...input, seniority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Head-of">Head-of</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Industries (searchable · multi-select · custom)">
              <IndustryMultiSelect value={industriesList} onChange={setIndustriesList} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience (years)">
                <Input value={input.experience} onChange={(e) => setInput({ ...input, experience: e.target.value })} placeholder="e.g. 3-5" />
              </Field>

              <Field label="Hiring type">
                <Select value={input.hiringType} onValueChange={(v) => setInput({ ...input, hiringType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Skills (AI-recommended · click to add)">
              <SkillRecommender
                role={input.role}
                industry={industriesList[0]}
                selected={skillsList}
                onChange={setSkillsList}
              />
            </Field>

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

            <Field label="Benefits (optional — leave blank to skip benefits section)">
              <Input value={input.benefits} onChange={(e) => setInput({ ...input, benefits: e.target.value })} placeholder="e.g. Health insurance, annual bonus, 5-day week" />
            </Field>

            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4 mr-2" />Generate Hiring Kit</>}
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-sm flex flex-col lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">JD Preview</h3>
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
                <p className="text-[11px] mt-1">Upload a JD or fill role details to begin</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-soft-sm">
          <HiringInsightsPanel
            role={input.role}
            industry={industriesList[0]}
            experience={input.experience}
            skills={skillsList}
            country={input.country}
            active={!!input.role && input.role.trim().length >= 3}
          />
          {(!input.role || input.role.trim().length < 3) && (
            <div className="text-center text-sm text-muted-foreground py-10">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Enter a role to unlock AI hiring intelligence — salary, risks, interview questions and sourcing recommendations.
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
