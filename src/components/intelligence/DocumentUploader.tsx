import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { extractFile, parseJDFields, type ExtractedJD } from "@/lib/intelligence/documentExtractor";

type Status = "idle" | "uploading" | "processing" | "ready" | "error";

type Props = {
  onParsed: (data: ExtractedJD) => void;
};

const ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export function DocumentUploader({ onParsed }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [stage, setStage] = useState("");
  const [pct, setPct] = useState(0);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [parsed, setParsed] = useState<ExtractedJD | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  const handle = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setStatus("error");
      setError("File exceeds 15MB.");
      return;
    }
    setError("");
    setFileName(file.name);
    setStatus("uploading");
    setStage("Processing document…");
    setPct(5);
    try {
      const text = await extractFile(file, (s, p) => {
        setStage(s);
        setPct(p);
        if (p > 20) setStatus("processing");
      });
      setStage("Extracting job information…");
      setPct(95);
      const data = parseJDFields(text);
      setParsed(data);
      setPreview(text);
      setStatus("ready");
      setPct(100);
      setStage("Ready for review");
      onParsed(data);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Failed to process document.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setPct(0);
    setStage("");
    setFileName("");
    setPreview("");
    setParsed(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const updatePreview = (v: string) => {
    setPreview(v);
    if (parsed) {
      const next = parseJDFields(v);
      setParsed(next);
      onParsed(next);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
      />

      {status === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handle(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition",
            drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-secondary/40"
          )}
        >
          <UploadCloud className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Drop your JD or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF · DOCX · TXT · up to 15 MB</p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">PDF</Badge>
            <Badge variant="outline" className="text-[10px]">DOCX</Badge>
            <Badge variant="outline" className="text-[10px]">TXT</Badge>
          </div>
        </div>
      )}

      {(status === "uploading" || status === "processing") && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="font-medium">{stage}</span>
          </div>
          <Progress value={pct} className="h-1.5" />
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Couldn't process this file</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={reset}>Try again</Button>
          </div>
        </div>
      )}

      {status === "ready" && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-medium">Ready for review</span>
              <FileText className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="text-muted-foreground text-xs truncate max-w-[200px]">{fileName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>

          {parsed && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {parsed.jobTitle && <Field label="Title" value={parsed.jobTitle} />}
              {parsed.experience && <Field label="Experience" value={parsed.experience} />}
              {parsed.employmentType && <Field label="Type" value={parsed.employmentType} />}
              {parsed.location && <Field label="Location" value={parsed.location} />}
              {parsed.salary && <Field label="Salary" value={parsed.salary} />}
              {parsed.industry && <Field label="Industry" value={parsed.industry} />}
            </div>
          )}

          <Textarea
            value={preview}
            onChange={(e) => updatePreview(e.target.value)}
            rows={8}
            className="text-xs font-mono"
          />
          <p className="text-[11px] text-muted-foreground">Edit the extracted content before generating — changes flow into the AI workflow.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-secondary/40 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  );
}