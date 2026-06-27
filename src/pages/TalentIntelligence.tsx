import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exportTalentReportToDocx } from "@/lib/docxExport";

const NAVY = "#0D2B55";
const LIGHT_BLUE = "#E8F0FA";

const countryFlag: Record<string, string> = {
  UAE: "🇦🇪", India: "🇮🇳", USA: "🇺🇸", UK: "🇬🇧",
  Canada: "🇨🇦", Australia: "🇦🇺", Singapore: "🇸🇬", Other: "🌍",
};

const industryIcon: Record<string, string> = {
  Technology: "💻", "Oil & Gas": "🛢️", "EPC & Construction": "🏗️",
  Manufacturing: "🏭", Healthcare: "🏥", Finance: "💰",
  Retail: "🛒", Logistics: "🚚", Education: "🎓", Energy: "⚡", Other: "🏢",
};

export default function TalentIntelligence() {
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    setReport((data as any).result);
    toast.success("Analysis complete");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("talent_history").insert({
        user_id: user.id,
        jd_input: jd,
        results: JSON.stringify((data as any).result),
      });
    }
  };

  const downloadDocx = async () => {
    if (!report) return;
    await exportTalentReportToDocx(report, "Talent-Intelligence-Report");
    toast.success("Word file downloaded!");
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ backgroundColor: NAVY }} className="px-4 py-3 rounded-t-lg">
      <h3 className="text-white font-bold text-sm">{title}</h3>
    </div>
  );

  // Use detected salary label from report or fallback
  const localLabel = report?.salary?.salary_label || report?.salary_label || "Local Salary";
  const detectedCountry = report?.detected_country || "";
  const detectedIndustry = report?.detected_industry || "";
  const detectedRole = report?.detected_role || "";
  const detectedSeniority = report?.detected_seniority || "";

  return (
    <>
      <PageHeader
        title="Talent Intelligence"
        description="Paste any JD — get country-specific salary ranges, sourcing platforms, companies, and candidate insights."
      />

      <Card className="p-5 shadow-soft-sm mb-6">
        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste a job description here — country and industry will be auto-detected…"
          rows={6}
          className="text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">{jd.length} characters</p>
          <Button onClick={run} disabled={loading} className="bg-gradient-brand text-brand-foreground hover:opacity-95">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing…</> : <><Brain className="h-4 w-4 mr-2" />Analyze</>}
          </Button>
        </div>
      </Card>

      {!report && !loading && (
        <Card className="p-12 text-center border-2 border-dashed shadow-none bg-transparent">
          <Brain className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Paste a JD and click Analyze to see market insights.</p>
          <p className="text-xs text-muted-foreground mt-1">Country and industry are auto-detected from your JD.</p>
        </Card>
      )}

      {report && (
        <div className="space-y-5">
          {/* Header + detected badges */}
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <h2 className="font-bold text-lg" style={{ color: NAVY }}>Talent Intelligence Report</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {detectedCountry && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ backgroundColor: NAVY }}>
                    {countryFlag[detectedCountry] || "🌍"} {detectedCountry}
                  </span>
                )}
                {detectedIndustry && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ backgroundColor: "#1a4a7a" }}>
                    {industryIcon[detectedIndustry] || "🏢"} {detectedIndustry}
                  </span>
                )}
                {detectedRole && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                    {detectedRole}
                  </span>
                )}
                {detectedSeniority && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                    {detectedSeniority}
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" onClick={downloadDocx}>
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
          </div>

          {/* KEYWORDS */}
          <Card className="overflow-hidden shadow-soft-sm">
            <SectionHeader title="🔍 1. TOP SEARCH KEYWORDS" />
            <div style={{ backgroundColor: LIGHT_BLUE }} className="p-4">
              <div className="grid grid-cols-1 gap-2 mb-3">
                {report.keywords?.boolean_strings?.map((s: string, i: number) => (
                  <div key={i} className="bg-white rounded p-2 text-xs font-mono border border-blue-100">
                    {i + 1}. {s}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {report.keywords?.skill_keywords?.map((k: string, i: number) => (
                  <span key={i} style={{ backgroundColor: NAVY }} className="text-white text-xs px-3 py-1 rounded-full">{k}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* PLATFORMS */}
          <Card className="overflow-hidden shadow-soft-sm">
            <SectionHeader title="🌐 2. BEST SOURCING PLATFORMS" />
            <div className="p-4" style={{ backgroundColor: LIGHT_BLUE }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: NAVY }}>
                    <th className="text-white text-left p-2">Platform</th>
                    <th className="text-white text-left p-2">Why Best for This Role</th>
                    <th className="text-white text-left p-2">Search Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {report.platforms?.map((p: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-2 font-semibold text-xs" style={{ color: NAVY }}>{p.name}</td>
                      <td className="p-2 text-xs text-gray-600">{p.reason}</td>
                      <td className="p-2 text-xs text-gray-500 italic">{p.search_tip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* SALARY */}
          <Card className="overflow-hidden shadow-soft-sm">
            <SectionHeader title="💰 3. MARKET SALARY RANGE" />
            <div className="p-4" style={{ backgroundColor: LIGHT_BLUE }}>
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr style={{ backgroundColor: NAVY }}>
                    <th className="text-white text-left p-2">Level</th>
                    <th className="text-white text-left p-2">{localLabel}</th>
                    <th className="text-white text-left p-2">International (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {["entry", "mid", "senior"].map((level, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-2 font-semibold text-xs capitalize" style={{ color: NAVY }}>{level}</td>
                      <td className="p-2 text-xs font-medium">{report.salary?.local?.[level]}</td>
                      <td className="p-2 text-xs text-gray-500">{report.salary?.international?.[level]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-white rounded p-3 text-xs">
                <span className="font-semibold" style={{ color: NAVY }}>Market Trend: </span>
                <span className="capitalize font-bold" style={{
                  color: report.salary?.trend === "rising" ? "green" : report.salary?.trend === "declining" ? "red" : "orange"
                }}>
                  {report.salary?.trend}
                </span>
                {" — "}{report.salary?.trend_reason}
              </div>
            </div>
          </Card>

          {/* SOURCE COMPANIES */}
          <Card className="overflow-hidden shadow-soft-sm">
            <SectionHeader title="🏢 4. TOP COMPANIES TO SOURCE FROM" />
            <div className="p-4" style={{ backgroundColor: LIGHT_BLUE }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: NAVY }}>
                    <th className="text-white text-left p-2">Company</th>
                    <th className="text-white text-left p-2">Type</th>
                    <th className="text-white text-left p-2">Size</th>
                    <th className="text-white text-left p-2">Why Ideal</th>
                  </tr>
                </thead>
                <tbody>
                  {report.source_companies?.map((c: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-2 font-semibold text-xs" style={{ color: NAVY }}>{c.name}</td>
                      <td className="p-2 text-xs">{c.type}</td>
                      <td className="p-2 text-xs">{c.size}</td>
                      <td className="p-2 text-xs text-gray-600">{c.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* CANDIDATE PERSONA */}
          <Card className="overflow-hidden shadow-soft-sm">
            <SectionHeader title="👤 5. CANDIDATE PERSONA" />
            <div className="p-4 space-y-3" style={{ backgroundColor: LIGHT_BLUE }}>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-semibold mb-1" style={{ color: NAVY }}>Ideal Background</p>
                <p className="text-xs text-gray-600">{report.candidate_persona?.background}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-semibold mb-2" style={{ color: NAVY }}>🚩 Red Flags to Watch</p>
                <ul className="space-y-1">
                  {report.candidate_persona?.red_flags?.map((f: string, i: number) => (
                    <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                      <span>•</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-semibold mb-1" style={{ color: NAVY }}>Best Interview Approach</p>
                <p className="text-xs text-gray-600">{report.candidate_persona?.interview_approach}</p>
              </div>
            </div>
          </Card>

          {/* HIRING COMPANIES */}
          <Card className="overflow-hidden shadow-soft-sm">
            <SectionHeader title="🔥 6. COMPANIES ACTIVELY HIRING RIGHT NOW" />
            <div className="p-4" style={{ backgroundColor: LIGHT_BLUE }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: NAVY }}>
                    <th className="text-white text-left p-2">Company</th>
                    <th className="text-white text-left p-2">Type</th>
                    <th className="text-white text-left p-2">Size</th>
                    <th className="text-white text-left p-2">Industry</th>
                    <th className="text-white text-left p-2">Why Hiring</th>
                  </tr>
                </thead>
                <tbody>
                  {report.hiring_companies?.map((c: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-2 font-semibold text-xs" style={{ color: NAVY }}>{c.name}</td>
                      <td className="p-2 text-xs">{c.type}</td>
                      <td className="p-2 text-xs">{c.size}</td>
                      <td className="p-2 text-xs">{c.industry}</td>
                      <td className="p-2 text-xs text-gray-600">{c.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}
    </>
  );
}
