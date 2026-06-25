import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles, RefreshCw } from "lucide-react";
import { recommendSkills } from "@/lib/intelligence/skills";

type Props = {
  role: string;
  industry?: string;
  selected: string[];
  onChange: (skills: string[]) => void;
};

export function SkillRecommender({ role, industry, selected, onChange }: Props) {
  const [custom, setCustom] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const recs = useMemo(
    () => recommendSkills({ role, industry }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, industry, refreshKey]
  );

  // Auto-add top 6 when role first becomes meaningful and nothing selected yet
  useEffect(() => {
    if (selected.length === 0 && role.trim().length >= 3 && recs.length > 0) {
      onChange(recs.slice(0, 6));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const add = (s: string) => {
    const v = s.trim();
    if (!v || selected.includes(v)) return;
    onChange([...selected, v]);
  };
  const remove = (s: string) => onChange(selected.filter((x) => x !== s));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {selected.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No skills yet — pick from recommendations below or add custom.</p>
        )}
        {selected.map((s) => (
          <Badge key={s} className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15">
            {s}
            <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-recommended skills
            {role.trim().length < 3 && <span className="text-muted-foreground font-normal">(enter a role)</span>}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recs.filter((r) => !selected.includes(r)).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => add(r)}
              className="text-xs px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition"
            >
              + {r}
            </button>
          ))}
          {recs.length > 0 && recs.every((r) => selected.includes(r)) && (
            <p className="text-xs text-muted-foreground">All recommendations added.</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(custom);
              setCustom("");
            }
          }}
          placeholder="Add custom skill and press Enter…"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            add(custom);
            setCustom("");
          }}
          disabled={!custom.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}