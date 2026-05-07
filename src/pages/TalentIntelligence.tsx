import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, Loader2, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAVY = "#0D2B55";
const LIGHT_BLUE = "#E8F0FA";

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
  };

  const downloadDocx = async () => {
    if (!report) return;
    const text = buildPlainText(report);
    await exportMarkdownToDocx(text, "Talent-Intelligence-Report");
    toast.success("Word file downloaded!");
  };

  const buildPlainText = (r: any) => {
    let text = "TALENT INTELLIGENCE REPORT\n\n";
    text += "1. TOP SEARCH KEYWORDS\n";
    r.keywords?.boolean_strings?.forEach((s: string, i: number) => { text += `${i+1}. ${s}\n`; });
    text += "\nSKILL KEYWORDS: " + r.keywords?.skill_keywords?.join(", ") + "\n\n";
    text += "2. BEST SOURCING PLATFORMS\n";
    r.platforms?.forEach((p: any) => { text += `${p.name}: ${p.reason}\n`; });
    text += "\n3. MARKET SALARY RANGE\n";
    text += `India - Entry: ${r.salary?.india?.entry} | Mid: ${r.salary?.india?.mid} | Senior: ${r.salary?.india?.senior}\n`;
    text += `International - Entry: ${r.international?.entry} | Mid: ${r.salary?.international?.mid} | Senior: ${r.salary?.international?.senior}\n`;
    text += `Trend: ${r.salary?.trend} - ${r.salary?.trend_reason}\n\n`;
    text += "4. TOP COMPANIES TO SOURCE FROM\n";
    r.source_companies?.forEach((c: any) => { text += `${c.name} (${c.type}, ${c.size}): ${c.reason}\n`; });
    text += "\n5. CANDIDATE PERSONA\n";
    text += `Background: ${r.candidate_persona?.background}\n`;
    text += `Red Flags: ${r.candidate_persona?.red_flags?.join(", ")}\n`;
    text += `Interview Approach: ${r.candidate_persona?.interview_approach}\n\n`;
    text += "6. COMPANIES ACTIVELY HIRING\n";
    r.hiring_companies?.forEach((c: any) => { text += `${c.name} (${c.type}, ${c.size}, ${c.industry}): ${c.reason}\n`; });
    return text;
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ backgroundColor: NAVY }} className="px-4 py-3 rounded-t-lg">
      <h3 className="text-white font-bold text-sm">{title}</h3>
    </div>
  );

  return (
    <>
      <PageHeader title="Talent Intelligence" description="Decode the hiring market for any role — keywords, platforms, salary, and sourcing companies." />

      <Card className="p-5 shadow-soft-sm mb-6">
        <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste a job description here…" rows={6} className="text-sm" />
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
        </Card>
      )}

      {report && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg" style={{ color: NAVY }}>Talent Intelligence Report</h2>
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
                    {i+1}. {s}
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
                    <th className="text-white text-left p-2 rounded-tl">Platform</th>
                    <th className="text-white text-left p-2 rounded-tr">Why Best for This Role</th>
                  </tr>
                </thead>
                <tbody>
                  {report.platforms?.map((p: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-2 font-semibold text-xs" style={{ color: NAVY }}>{p.name}</td>
                      <td className="p-2 text-xs text-gray-600">{p.reason}</td>
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
                    <th className="text-white text-left p-2">India (LPA)</th>
                    <th className="text-white text-left p-2">International (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {["entry", "mid", "senior"].map((level, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-2 font-semibold text-xs capitalize" style={{ color: NAVY }}>{level}</td>
                      <td className="p-2 text-xs">{report.salary?.india?.[level]}</td>
                      <td className="p-2 text-xs">{report.salary?.international?.[level]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-white rounded p-3 text-xs">
                <span className="font-semibold" style={{ color: NAVY }}>Market Trend: </span>
                <span className="capitalize font-bold" style={{ color: report.salary?.trend === "rising" ? "green" : report.salary?.trend === "declining" ? "red" : "orange" }}>
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
