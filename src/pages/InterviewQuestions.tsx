import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ShadingType, AlignmentType, BorderStyle,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

export default function InterviewQuestions() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("technical");
  const [downloading, setDownloading] = useState(false);

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
    setResult((data as any).result);
    setActiveTab("technical");
    toast.success("Interview questions ready!");
  };

  const NAVY = "1a3a5c";

  const navyCell = (text: string) =>
    new TableCell({
      shading: { type: ShadingType.SOLID, color: NAVY },
      children: [new Paragraph({
        children: [new TextRun({ text, color: "FFFFFF", bold: true, size: 20 })],
      })],
    });

  const bodyCell = (text: string, color = "000000") =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, size: 18, color })],
      })],
    });

  const listCell = (items: string[], color = "333333") =>
    new TableCell({
      children: items.map(
        (item) => new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: item, size: 18, color })],
        })
      ),
    });

  const sectionHeading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
      children: [new TextRun({ text, bold: true, color: NAVY, size: 26 })],
    });

  const downloadDocx = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const sections: any[] = [];

      // Title
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "Interview Question Bank", bold: true, size: 36, color: NAVY })],
          spacing: { after: 200 },
        })
      );

      // TECHNICAL
      sections.push(sectionHeading("1. Technical Questions"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("#"),
              navyCell("Question"),
              navyCell("Level"),
              navyCell("Category"),
              navyCell("Ideal Answer Points"),
            ],
          }),
          ...result.technical.map((q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell(`${i + 1}`),
                bodyCell(q.question),
                bodyCell(q.difficulty),
                bodyCell(q.category),
                listCell(q.ideal_answer_points),
              ],
            })
          ),
        ],
      }));

      // BEHAVIORAL
      sections.push(sectionHeading("2. Behavioral Questions"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("#"),
              navyCell("Question"),
              navyCell("Competency"),
              navyCell("STAR Prompts"),
              navyCell("Red Flags"),
            ],
          }),
          ...result.behavioral.map((q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell(`${i + 1}`),
                bodyCell(q.question),
                bodyCell(q.competency),
                listCell(q.star_prompts),
                listCell(q.red_flags, "CC0000"),
              ],
            })
          ),
        ],
      }));

      // SITUATIONAL
      sections.push(sectionHeading("3. Situational Questions"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("#"),
              navyCell("Question"),
              navyCell("What to Assess"),
              navyCell("Ideal Answer Points"),
              navyCell("Red Flags"),
            ],
          }),
          ...result.situational.map((q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell(`${i + 1}`),
                bodyCell(q.question),
                bodyCell(q.what_to_assess),
                listCell(q.ideal_answer_points),
                listCell(q.red_flags, "CC0000"),
              ],
            })
          ),
        ],
      }));

      // CULTURE FIT
      sections.push(sectionHeading("4. Culture Fit Questions"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("#"),
              navyCell("Question"),
              navyCell("What to Assess"),
              navyCell("Positive Signals"),
              navyCell("Red Flags"),
            ],
          }),
          ...result.culture_fit.map((q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell(`${i + 1}`),
                bodyCell(q.question),
                bodyCell(q.what_to_assess),
                listCell(q.positive_signals, "1a5c2a"),
                listCell(q.red_flags, "CC0000"),
              ],
            })
          ),
        ],
      }));

      // ROLE SPECIFIC
      sections.push(sectionHeading("5. Role-Specific Questions"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("#"),
              navyCell("Question"),
              navyCell("Why Critical"),
              navyCell("Ideal Answer Points"),
              navyCell("Red Flags"),
            ],
          }),
          ...result.role_specific.map((q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell(`${i + 1}`),
                bodyCell(q.question),
                bodyCell(q.rationale),
                listCell(q.ideal_answer_points),
                listCell(q.red_flags, "CC0000"),
              ],
            })
          ),
        ],
      }));

      // INTERVIEW STRUCTURE
      sections.push(sectionHeading("6. Interview Structure"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("Round"),
              navyCell("Name"),
              navyCell("Duration"),
              navyCell("Focus"),
              navyCell("Interviewer"),
            ],
          }),
          ...result.interview_structure.map((r: any) =>
            new TableRow({
              children: [
                bodyCell(r.round),
                bodyCell(r.name),
                bodyCell(`${r.duration_minutes} mins`),
                bodyCell(r.focus),
                bodyCell(r.interviewer),
              ],
            })
          ),
        ],
      }));

      // SCORECARD
      sections.push(sectionHeading("7. Evaluation Scorecard"));
      sections.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              navyCell("Criteria"),
              navyCell("Weight"),
              navyCell("Green Flags"),
              navyCell("Red Flags"),
            ],
          }),
          ...result.scorecard.map((s: any) =>
            new TableRow({
              children: [
                bodyCell(s.criteria),
                bodyCell(s.weight),
                listCell(s.green_flags, "1a5c2a"),
                listCell(s.red_flags, "CC0000"),
              ],
            })
          ),
        ],
      }));

      const doc = new Document({
        sections: [{ children: sections }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "Interview-Question-Bank.docx");
      toast.success("Word file downloaded!");
    } catch (e: any) {
      toast.error("Download failed: " + e.message);
    }
    setDownloading(false);
  };

  const diffBadge = (d: string) => {
    const map: any = {
      Easy: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Hard: "bg-red-100 text-red-800",
    };
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${map[d] || "bg-gray-100 text-gray-700"}`}>
        {d}
      </span>
    );
  };

  const tabs = [
    { key: "technical", label: "Technical" },
    { key: "behavioral", label: "Behavioral" },
    { key: "situational", label: "Situational" },
    { key: "culture_fit", label: "Culture Fit" },
    { key: "role_specific", label: "Role Specific" },
    { key: "structure", label: "Structure" },
    { key: "scorecard", label: "Scorecard" },
  ];

  return (
    <>
      <PageHeader
        title="Interview Questions"
        description="Generate role-specific interview questions instantly from any JD."
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

      {!result && !loading && (
        <Card className="p-12 text-center border-2 border-dashed shadow-none bg-transparent">
          <Mic className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Paste a JD and click Generate Questions to build your interview kit.
          </p>
        </Card>
      )}

      {result && (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md">

          {/* Title Bar */}
          <div style={{ background: "#0f2744" }} className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">Interview Question Bank</h2>
            </div>
            <Button
              onClick={downloadDocx}
              disabled={downloading}
              size="sm"
              className="bg-white text-[#0f2744] hover:bg-blue-50 font-semibold text-xs"
            >
              {downloading ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Downloading…</>
              ) : (
                <><Download className="h-3.5 w-3.5 mr-1.5" />Download .docx</>
              )}
            </Button>
          </div>

          {/* Tab Bar */}
          <div className="flex overflow-x-auto border-b-2 border-[#1a3a5c] bg-gray-50">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === t.key
                    ? "border-[#1a3a5c] text-[#1a3a5c] bg-white"
                    : "border-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white">

            {/* TECHNICAL */}
            {activeTab === "technical" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Technical Questions
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#1a3a5c" }}>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-8">#</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold">Question</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-20">Level</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-36">Category</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">Ideal Answer Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.technical?.map((q: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="px-4 py-3 text-[#1a3a5c] font-bold text-xs align-top">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-800 align-top text-xs leading-relaxed">{q.question}</td>
                        <td className="px-4 py-3 align-top">{diffBadge(q.difficulty)}</td>
                        <td className="px-4 py-3 text-gray-600 align-top text-xs">{q.category}</td>
                        <td className="px-4 py-3 align-top">
                          <ul className="list-disc pl-3 space-y-0.5">
                            {q.ideal_answer_points?.map((p: string, j: number) => (
                              <li key={j} className="text-xs text-gray-600">{p}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BEHAVIORAL */}
            {activeTab === "behavioral" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Behavioral Questions
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#1a3a5c" }}>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-8">#</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold">Question</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-36">Competency</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">STAR Prompts</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-40">Red Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.behavioral?.map((q: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="px-4 py-3 text-[#1a3a5c] font-bold text-xs align-top">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-800 align-top text-xs leading-relaxed">{q.question}</td>
                        <td className="px-4 py-3 align-top">
                          <span className="inline-block bg-blue-100 text-[#1a3a5c] text-xs px-2 py-0.5 rounded font-semibold">
                            {q.competency}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {q.star_prompts?.map((p: string, j: number) => (
                              <li key={j} className="text-xs text-gray-600">• {p}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {q.red_flags?.map((f: string, j: number) => (
                              <li key={j} className="text-xs text-red-600">⚠ {f}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SITUATIONAL */}
            {activeTab === "situational" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Situational Questions
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#1a3a5c" }}>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-8">#</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold">Question</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-36">What to Assess</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">Ideal Answer Points</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-40">Red Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.situational?.map((q: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="px-4 py-3 text-[#1a3a5c] font-bold text-xs align-top">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-800 align-top text-xs leading-relaxed">{q.question}</td>
                        <td className="px-4 py-3 text-gray-600 align-top text-xs">{q.what_to_assess}</td>
                        <td className="px-4 py-3 align-top">
                          <ul className="list-disc pl-3 space-y-0.5">
                            {q.ideal_answer_points?.map((p: string, j: number) => (
                              <li key={j} className="text-xs text-gray-600">{p}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {q.red_flags?.map((f: string, j: number) => (
                              <li key={j} className="text-xs text-red-600">⚠ {f}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CULTURE FIT */}
            {activeTab === "culture_fit" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Culture Fit Questions
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#1a3a5c" }}>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-8">#</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold">Question</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-40">What to Assess</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">Positive Signals</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-40">Red Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.culture_fit?.map((q: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="px-4 py-3 text-[#1a3a5c] font-bold text-xs align-top">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-800 align-top text-xs leading-relaxed">{q.question}</td>
                        <td className="px-4 py-3 text-gray-600 align-top text-xs">{q.what_to_assess}</td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {q.positive_signals?.map((p: string, j: number) => (
                              <li key={j} className="text-xs text-green-700">✓ {p}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {q.red_flags?.map((f: string, j: number) => (
                              <li key={j} className="text-xs text-red-600">⚠ {f}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ROLE SPECIFIC */}
            {activeTab === "role_specific" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Role-Specific Questions
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#1a3a5c" }}>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-8">#</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold">Question</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-44">Why Critical</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">Ideal Answer Points</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-40">Red Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.role_specific?.map((q: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="px-4 py-3 text-[#1a3a5c] font-bold text-xs align-top">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-800 align-top text-xs leading-relaxed">{q.question}</td>
                        <td className="px-4 py-3 text-gray-600 align-top text-xs italic">{q.rationale}</td>
                        <td className="px-4 py-3 align-top">
                          <ul className="list-disc pl-3 space-y-0.5">
                            {q.ideal_answer_points?.map((p: string, j: number) => (
                              <li key={j} className="text-xs text-gray-600">{p}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {q.red_flags?.map((f: string, j: number) => (
                              <li key={j} className="text-xs text-red-600">⚠ {f}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* STRUCTURE */}
            {activeTab === "structure" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Interview Structure
                </div>
                <div className="divide-y divide-gray-100">
                  {result.interview_structure?.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 px-6 py-4">
                      <div style={{ background: "#1a3a5c" }} className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-bold text-[#1a3a5c] text-sm">{r.name}</h4>
                          <span className="text-xs bg-blue-100 text-[#1a3a5c] px-2 py-0.5 rounded font-semibold">{r.duration_minutes} mins</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{r.focus}</p>
                        <p className="text-xs text-gray-400 mt-1">Interviewer: {r.interviewer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCORECARD */}
            {activeTab === "scorecard" && (
              <div>
                <div style={{ background: "#1a3a5c" }} className="px-5 py-2.5 text-white text-xs font-bold tracking-widest uppercase">
                  Evaluation Scorecard
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#1a3a5c" }}>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold">Criteria</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-20">Weight</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">Green Flags</th>
                      <th className="text-white text-left px-4 py-2.5 text-xs font-semibold w-48">Red Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scorecard?.map((s: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="px-4 py-3 font-semibold text-[#1a3a5c] text-xs align-top">{s.criteria}</td>
                        <td className="px-4 py-3 align-top">
                          <span className="text-xs font-bold bg-[#1a3a5c] text-white px-2 py-0.5 rounded">{s.weight}</span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {s.green_flags?.map((f: string, j: number) => (
                              <li key={j} className="text-xs text-green-700">✓ {f}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <ul className="space-y-0.5">
                            {s.red_flags?.map((f: string, j: number) => (
                              <li key={j} className="text-xs text-red-600">⚠ {f}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
