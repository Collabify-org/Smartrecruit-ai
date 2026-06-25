// PDF / DOCX / TXT extractor + JD field parser.
// Uses pdfjs-dist in the browser and mammoth for DOCX.

import * as pdfjsLib from "pdfjs-dist";
// Vite worker bundling — `?url` is resolved at build time.
// @ts-ignore Vite-specific import suffix
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

export type ExtractedJD = {
  rawText: string;
  jobTitle?: string;
  department?: string;
  industry?: string;
  experience?: string;
  employmentType?: string;
  location?: string;
  salary?: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  certifications: string[];
  education: string[];
};

export type ProgressFn = (stage: string, pct: number) => void;

export async function extractFile(file: File, onProgress?: ProgressFn): Promise<string> {
  const name = file.name.toLowerCase();
  onProgress?.("Reading file…", 5);

  if (name.endsWith(".txt") || file.type === "text/plain") {
    onProgress?.("Reading text…", 60);
    const t = await file.text();
    onProgress?.("Ready for review", 100);
    return t;
  }

  if (name.endsWith(".docx") || file.type.includes("word")) {
    onProgress?.("Extracting DOCX…", 30);
    const mammoth = await import("mammoth/mammoth.browser");
    const buf = await file.arrayBuffer();
    const { value } = await (mammoth as any).extractRawText({ arrayBuffer: buf });
    onProgress?.("Ready for review", 100);
    return value || "";
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    onProgress?.("Loading PDF…", 15);
    const buf = await file.arrayBuffer();
    const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
    let out = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(`Extracting page ${i} / ${pdf.numPages}…`, 15 + Math.round((i / pdf.numPages) * 75));
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      out += content.items.map((it: any) => it.str).join(" ") + "\n\n";
    }
    onProgress?.("Ready for review", 100);
    return out.trim();
  }

  throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT.");
}

// ----- Heuristic JD parser -----

const SECTIONS = {
  responsibilities: /\b(responsibilities|what you[' ]?ll do|role|key duties|duties)\b[:\-]?/i,
  required: /\b(required skills|must have|requirements|qualifications|what we[' ]?re looking for)\b[:\-]?/i,
  preferred: /\b(preferred|nice to have|good to have|bonus)\b[:\-]?/i,
  certifications: /\b(certifications?|licenses?)\b[:\-]?/i,
  education: /\b(education|academic|degree)\b[:\-]?/i,
};

function pickLine(text: string, re: RegExp): string | undefined {
  const m = text.match(re);
  return m?.[1]?.trim();
}

function splitBullets(block: string): string[] {
  return block
    .split(/\n|•|·|\u2022|\*|\-\s|;|\u2013|\u2014/)
    .map((s) => s.replace(/^\s*[\d\.\)]+\s*/, "").trim())
    .filter((s) => s.length > 4 && s.length < 240);
}

function extractSection(text: string, key: keyof typeof SECTIONS, nextKeys: (keyof typeof SECTIONS)[]): string[] {
  const startRe = SECTIONS[key];
  const m = text.match(startRe);
  if (!m) return [];
  const start = (m.index ?? 0) + m[0].length;
  let end = text.length;
  for (const k of nextKeys) {
    const nm = text.slice(start).match(SECTIONS[k]);
    if (nm && nm.index !== undefined) end = Math.min(end, start + nm.index);
  }
  return splitBullets(text.slice(start, end)).slice(0, 15);
}

export function parseJDFields(rawText: string): ExtractedJD {
  const text = rawText.replace(/\r/g, "");
  const flat = text.replace(/\n+/g, " ");

  const jobTitle =
    pickLine(text, /(?:job\s*title|role|position)\s*[:\-]\s*([^\n]+)/i) ||
    pickLine(text, /^\s*([A-Z][A-Za-z0-9 \/&\-]{3,60})\s*\n/);

  const department = pickLine(text, /(?:department|team|function)\s*[:\-]\s*([^\n]+)/i);
  const industry = pickLine(text, /(?:industry|sector)\s*[:\-]\s*([^\n]+)/i);
  const experience =
    pickLine(text, /(?:experience|exp)\s*[:\-]?\s*([\d\+\-\s]{1,12}\s*(?:years?|yrs?))/i) ||
    pickLine(flat, /(\d+\s*(?:-|to)\s*\d+\s*(?:years?|yrs?))/i);
  const employmentType =
    pickLine(flat, /(full[\s-]?time|part[\s-]?time|contract|freelance|internship|temporary)/i);
  const location =
    pickLine(text, /(?:location|based in|city)\s*[:\-]\s*([^\n]+)/i) ||
    pickLine(flat, /(remote|hybrid|on[\s-]?site)/i);
  const salary = pickLine(text, /(?:salary|ctc|compensation|package)\s*[:\-]?\s*([^\n]{4,80})/i);

  const responsibilities = extractSection(text, "responsibilities", ["required", "preferred", "certifications", "education"]);
  const required = extractSection(text, "required", ["preferred", "certifications", "education"]);
  const preferred = extractSection(text, "preferred", ["certifications", "education"]);
  const certifications = extractSection(text, "certifications", ["education"]);
  const education = extractSection(text, "education", []);

  return {
    rawText: text,
    jobTitle: jobTitle?.trim(),
    department: department?.trim(),
    industry: industry?.trim(),
    experience: experience?.trim(),
    employmentType: employmentType?.trim(),
    location: location?.trim(),
    salary: salary?.trim(),
    responsibilities,
    requiredSkills: required,
    preferredSkills: preferred,
    certifications,
    education,
  };
}