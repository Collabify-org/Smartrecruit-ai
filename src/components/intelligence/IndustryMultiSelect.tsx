import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles } from "lucide-react";
import { INDUSTRIES, searchIndustries } from "@/lib/intelligence/industries";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
  suggested?: string[]; // smart recs (e.g. from role)
  max?: number;
};

export function IndustryMultiSelect({ value, onChange, suggested = [], max = 5 }: Props) {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchIndustries(q, 8).map((i) => i.name), [q]);
  const canAdd = (name: string) =>
    name.trim().length > 0 && !value.includes(name) && value.length < max;

  const add = (name: string) => {
    const n = name.trim();
    if (!canAdd(n)) return;
    onChange([...value, n]);
    setQ("");
  };
  const remove = (name: string) => onChange(value.filter((v) => v !== name));

  const smartRecs = suggested.filter((s) => !value.includes(s)).slice(0, 5);

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1">
              {v}
              <button type="button" onClick={() => remove(v)} aria-label={`Remove ${v}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(q);
            }
          }}
          placeholder={value.length >= max ? `Maximum ${max} reached` : "Search or add custom industry…"}
          disabled={value.length >= max}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => add(q)} disabled={!canAdd(q)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {q.trim().length > 0 && results.length > 0 && (
        <div className="rounded-md border border-border bg-popover p-1 max-h-44 overflow-auto">
          {results.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => add(r)}
              disabled={value.includes(r)}
              className={cn(
                "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent",
                value.includes(r) && "opacity-40"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {smartRecs.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Smart suggestions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {smartRecs.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="text-xs px-2 py-1 rounded-full border border-dashed border-primary/40 text-primary hover:bg-primary/5"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {value.length}/{max} selected · {INDUSTRIES.length} industries indexed
      </p>
    </div>
  );
}