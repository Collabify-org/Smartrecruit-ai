import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, VerticalAlign } from "docx";
import { saveAs } from "file-saver";

export async function exportMarkdownToDocx(markdown: string, filename: string) {
  const lines = markdown.split("\n");
  const children: Paragraph[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      children.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }
    if (line.startsWith("# ")) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: line.slice(2), bold: true })] }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: line.slice(3), bold: true })] }));
    } else if (line.startsWith("- ")) {
      children.push(new Paragraph({ bullet: { level: 0 }, children: parseInline(line.slice(2)) }));
    } else if (line.startsWith("---")) {
      children.push(new Paragraph({ children: [new TextRun("―――――――――")] }));
    } else {
      children.push(new Paragraph({ children: parseInline(line) }));
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else {
      runs.push(new TextRun(part));
    }
  }
  return runs.length ? runs : [new TextRun(text)];
}

export async function exportTalentReportToDocx(report: any, filename: string) {
  const NAVY = "0D2B55";
  const LIGHT_BLUE = "E8F0FA";
  const WHITE = "FFFFFF";

  const navyHeader = (text: string) => new Paragraph({
    children: [new TextRun({ text, bold: true, color: WHITE, size: 24, font: "Arial" })],
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    spacing: { before: 200, after: 100 },
    indent: { left: 100, right: 100 },
  });

  const makeTable = (headers: string[], rows: string[][], colWidths: number[]) => new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) => new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: WHITE, size: 18, font: "Arial" })] })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => new TableCell({
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? WHITE : LIGHT_BLUE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell || "", size: 18, font: "Arial" })] })]
        }))
      }))
    ]
  });

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: "TALENT INTELLIGENCE REPORT", bold: true, size: 32, color: NAVY, font: "Arial" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    navyHeader("🔍 1. TOP SEARCH KEYWORDS"),
    ...(report.keywords?.boolean_strings?.map((s: string, i: number) =>
      new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${s}`, size: 18, font: "Arial" })], spacing: { after: 40 } })
    ) || []),
    new Paragraph({ children: [new TextRun({ text: `Skill Keywords: ${report.keywords?.skill_keywords?.join(", ")}`, bold: true, size: 18, font: "Arial", color: NAVY })], spacing: { before: 100, after: 200 } }),

    navyHeader("🌐 2. BEST SOURCING PLATFORMS"),
    new Paragraph({ children: [], spacing: { after: 60 } }),
    makeTable(
      ["Platform", "Why Best for This Role"],
      (report.platforms || []).map((p: any) => [p.name, p.reason]),
      [2500, 6860]
    ),
    new Paragraph({ children: [], spacing: { after: 200 } }),

    navyHeader("💰 3. MARKET SALARY RANGE"),
    new Paragraph({ children: [], spacing: { after: 60 } }),
    makeTable(
      ["Level", "India (LPA)", "International (USD)"],
      [
        ["Entry", report.salary?.india?.entry, report.salary?.international?.entry],
        ["Mid", report.salary?.india?.mid, report.salary?.international?.mid],
        ["Senior", report.salary?.india?.senior, report.salary?.international?.senior],
      ],
      [2500, 3430, 3430]
    ),
    new Paragraph({ children: [new TextRun({ text: `Market Trend: ${report.salary?.trend} — ${report.salary?.trend_reason}`, size: 18, font: "Arial", italics: true })], spacing: { before: 100, after: 200 } }),

    navyHeader("🏢 4. TOP COMPANIES TO SOURCE FROM"),
    new Paragraph({ children: [], spacing: { after: 60 } }),
    makeTable(
      ["Company", "Type", "Size", "Why Ideal"],
      (report.source_companies || []).map((c: any) => [c.name, c.type, c.size, c.reason]),
      [2000, 2000, 1500, 3860]
    ),
    new Paragraph({ children: [], spacing: { after: 200 } }),

    navyHeader("👤 5. CANDIDATE PERSONA"),
    new Paragraph({ children: [new TextRun({ text: "Ideal Background:", bold: true, color: NAVY, size: 18, font: "Arial" })], spacing: { before: 100, after: 40 } }),
    new Paragraph({ children: [new TextRun({ text: report.candidate_persona?.background, size: 18, font: "Arial" })], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: "🚩 Red Flags:", bold: true, color: "CC0000", size: 18, font: "Arial" })], spacing: { after: 40 } }),
    ...(report.candidate_persona?.red_flags?.map((f: string) =>
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: f, size: 18, font: "Arial", color: "CC0000" })], spacing: { after: 40 } })
    ) || []),
    new Paragraph({ children: [new TextRun({ text: "Best Interview Approach:", bold: true, color: NAVY, size: 18, font: "Arial" })], spacing: { before: 100, after: 40 } }),
    new Paragraph({ children: [new TextRun({ text: report.candidate_persona?.interview_approach, size: 18, font: "Arial" })], spacing: { after: 200 } }),

    navyHeader("🔥 6. COMPANIES ACTIVELY HIRING RIGHT NOW"),
    new Paragraph({ children: [], spacing: { after: 60 } }),
    makeTable(
      ["Company", "Type", "Size", "Industry", "Why Hiring"],
      (report.hiring_companies || []).map((c: any) => [c.name, c.type, c.size, c.industry, c.reason]),
      [1800, 1500, 1200, 1500, 3360]
    ),
    new Paragraph({ children: [], spacing: { after: 200 } }),
  ];

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
    },
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{ level: 0, format: "bullet" as any, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}

export async function exportInterviewToDocx(questions: Record<string, any[]>, filename: string) {
  const NAVY = "0D2B55";
  const LIGHT_BLUE = "E8F0FA";
  const WHITE = "FFFFFF";
  const RED = "CC0000";
  const GREEN = "1A6B3C";

  const QUESTION_SECTIONS = ["technical", "behavioral", "situational", "culture_fit", "role_specific"];

  const sectionHeader = (text: string) => new Paragraph({
    children: [new TextRun({ text, bold: true, color: WHITE, size: 24, font: "Arial" })],
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    spacing: { before: 300, after: 100 },
    indent: { left: 100, right: 100 },
  });

  const makeTableWithBullets = (headers: string[], rows: (string | string[])[][], colWidths: number[]) => new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) => new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: WHITE, size: 18, font: "Arial" })] })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => {
          const lines = Array.isArray(cell) ? cell : [cell];
          return new TableCell({
            width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? WHITE : LIGHT_BLUE, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: lines.map(line => new Paragraph({
              bullet: lines.length > 1 ? { level: 0 } : undefined,
              children: [new TextRun({ text: line || "", size: 18, font: "Arial" })]
            }))
          });
        })
      }))
    ]
  });

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: "INTERVIEW QUESTION SET", bold: true, size: 32, color: NAVY, font: "Arial" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const [sectionKey, items] of Object.entries(questions)) {
    if (!Array.isArray(items) || items.length === 0) continue;

    // ── INTERVIEW STRUCTURE ──────────────────────────────────────
    if (sectionKey === "interview_structure") {
      children.push(sectionHeader("📋 INTERVIEW STRUCTURE"));
      children.push(new Paragraph({ children: [], spacing: { after: 60 } }));
      children.push(makeTableWithBullets(
        ["Round", "Name", "Duration", "Focus", "Interviewer"],
        items.map((r: any) => [
          r.round || "",
          r.name || "",
          r.duration_minutes ? `${r.duration_minutes} mins` : "",
          r.focus || "",
          r.interviewer || "",
        ]),
        [900, 2000, 900, 3660, 1900]
      ));
      children.push(new Paragraph({ children: [], spacing: { after: 200 } }));
      continue;
    }

    // ── SCORECARD ────────────────────────────────────────────────
    if (sectionKey === "scorecard") {
      children.push(sectionHeader("🏆 EVALUATION SCORECARD"));
      children.push(new Paragraph({ children: [], spacing: { after: 60 } }));
      children.push(makeTableWithBullets(
        ["Criteria", "Weight", "Green Flags ✅", "Red Flags 🚩"],
        items.map((s: any) => [
          s.criteria || "",
          s.weight || "",
          Array.isArray(s.green_flags) ? s.green_flags : [s.green_flags || ""],
          Array.isArray(s.red_flags) ? s.red_flags : [s.red_flags || ""],
        ]),
        [2000, 800, 3280, 3280]
      ));
      children.push(new Paragraph({ children: [], spacing: { after: 200 } }));
      continue;
    }

    // ── QUESTION SECTIONS ────────────────────────────────────────
    if (QUESTION_SECTIONS.includes(sectionKey)) {
      children.push(sectionHeader(sectionKey.replace(/_/g, " ").toUpperCase()));

      items.forEach((q: any, i: number) => {
        // Question text
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `Q${i + 1}: `, bold: true, color: NAVY, size: 20, font: "Arial" }),
            new TextRun({ text: q.question || "", size: 20, font: "Arial" }),
          ],
          shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BLUE, type: ShadingType.CLEAR },
          spacing: { before: 120, after: 60 },
          indent: { left: 100 },
        }));

        // Difficulty + Category (technical)
        if (q.difficulty || q.category) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "Difficulty: ", bold: true, size: 18, font: "Arial", color: "666666" }),
              new TextRun({ text: q.difficulty || "—", size: 18, font: "Arial" }),
              new TextRun({ text: "   Category: ", bold: true, size: 18, font: "Arial", color: "666666" }),
              new TextRun({ text: q.category || "—", size: 18, font: "Arial" }),
            ],
            indent: { left: 100 },
            spacing: { after: 60 },
          }));
        }

        // Competency (behavioral)
        if (q.competency) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "Competency: ", bold: true, size: 18, font: "Arial", color: "666666" }),
              new TextRun({ text: q.competency, size: 18, font: "Arial" }),
            ],
            indent: { left: 100 },
            spacing: { after: 60 },
          }));
        }

        // What to assess (situational / culture_fit)
        if (q.what_to_assess) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "What to Assess: ", bold: true, size: 18, font: "Arial", color: NAVY }),
              new TextRun({ text: q.what_to_assess, size: 18, font: "Arial" }),
            ],
            indent: { left: 100 },
            spacing: { after: 60 },
          }));
        }

        // Rationale (role_specific)
        if (q.rationale) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "Rationale: ", bold: true, size: 18, font: "Arial", color: NAVY }),
              new TextRun({ text: q.rationale, size: 18, font: "Arial" }),
            ],
            indent: { left: 100 },
            spacing: { after: 60 },
          }));
        }

        // Ideal answer points
        if (Array.isArray(q.ideal_answer_points) && q.ideal_answer_points.length > 0) {
          children.push(new Paragraph({
            children: [new TextRun({ text: "Key Answer Points:", bold: true, size: 18, font: "Arial", color: NAVY })],
            indent: { left: 100 },
            spacing: { after: 40 },
          }));
          q.ideal_answer_points.forEach((pt: string) => {
            children.push(new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: pt, size: 18, font: "Arial" })],
              spacing: { after: 30 },
            }));
          });
        }

        // STAR prompts (behavioral)
        if (Array.isArray(q.star_prompts) && q.star_prompts.length > 0) {
          children.push(new Paragraph({
            children: [new TextRun({ text: "STAR Prompts:", bold: true, size: 18, font: "Arial", color: NAVY })],
            indent: { left: 100 },
            spacing: { before: 60, after: 40 },
          }));
          q.star_prompts.forEach((pt: string) => {
            children.push(new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: pt, size: 18, font: "Arial" })],
              spacing: { after: 30 },
            }));
          });
        }

        // Positive signals (culture_fit)
        if (Array.isArray(q.positive_signals) && q.positive_signals.length > 0) {
          children.push(new Paragraph({
            children: [new TextRun({ text: "✅ Positive Signals:", bold: true, size: 18, font: "Arial", color: GREEN })],
            indent: { left: 100 },
            spacing: { before: 60, after: 40 },
          }));
          q.positive_signals.forEach((pt: string) => {
            children.push(new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: pt, size: 18, font: "Arial" })],
              spacing: { after: 30 },
            }));
          });
        }

        // Red flags
        if (Array.isArray(q.red_flags) && q.red_flags.length > 0) {
          children.push(new Paragraph({
            children: [new TextRun({ text: "🚩 Red Flags:", bold: true, size: 18, font: "Arial", color: RED })],
            indent: { left: 100 },
            spacing: { before: 60, after: 40 },
          }));
          q.red_flags.forEach((pt: string) => {
            children.push(new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: pt, size: 18, font: "Arial", color: RED })],
              spacing: { after: 30 },
            }));
          });
        }

        children.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 100 } }));
      });
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
    },
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{ level: 0, format: "bullet" as any, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}
