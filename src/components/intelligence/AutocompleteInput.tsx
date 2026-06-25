import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AutocompleteItem = { value: string; label: string; sub?: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (item: AutocompleteItem) => void;
  fetcher: (q: string) => AutocompleteItem[] | Promise<AutocompleteItem[]>;
  placeholder?: string;
  minChars?: number;
  emptyHint?: string;
  id?: string;
};

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  fetcher,
  placeholder,
  minChars = 3,
  emptyHint,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AutocompleteItem[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (value.trim().length < minChars) {
      setItems([]);
      return;
    }
    setLoading(true);
    Promise.resolve(fetcher(value)).then((res) => {
      if (!cancelled) {
        setItems(res.slice(0, 10));
        setActive(0);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, fetcher, minChars]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showList = open && value.trim().length >= minChars;

  const select = (item: AutocompleteItem) => {
    onChange(item.value);
    onSelect?.(item);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hint = useMemo(() => {
    if (value.trim().length < minChars) return emptyHint || `Type at least ${minChars} characters…`;
    if (loading) return "Searching…";
    if (items.length === 0) return "No suggestions";
    return null;
  }, [value, minChars, emptyHint, loading, items.length]);

  return (
    <div ref={wrapRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showList && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-72 overflow-auto">
          {items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">{hint}</div>
          ) : (
            items.map((it, i) => (
              <button
                key={`${it.value}-${i}`}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => select(it)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-accent",
                  i === active && "bg-accent"
                )}
              >
                <span className="font-medium">{it.label}</span>
                {it.sub && <span className="text-xs text-muted-foreground">{it.sub}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}