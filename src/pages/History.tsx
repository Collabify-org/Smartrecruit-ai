import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Brain,
  Phone,
  Clock,
  Download,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";

import {
  exportMarkdownToDocx,
  exportTalentReportToDocx,
} from "@/lib/docxExport";

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel,
  ShadingType,
} from "docx";

import { saveAs } from "file-saver";

/* =========================================================
   TYPES
========================================================= */

type HistoryTab =
  | "all"
  | "jd"
  | "talent"
  | "interview";

interface HistoryItem {
  id: string;
  type: "jd" | "talent" | "interview";
  title: string;
  rawContent: string;
  created_at: string;
}

/* =========================================================
   TIME AGO
========================================================= */

function timeAgo(date: string) {
  const diff =
    Date.now() - new Date(date).getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days + "d ago";
  if (hours > 0) return hours + "h ago";
  if (mins > 0) return mins + "m ago";

  return "Just now";
}

/* =========================================================
   INTERVIEW DOCX EXPORT
========================================================= */

async function downloadInterviewDocx(
  title: string,
  rawJson: string
) {
  const NAVY = "0D2B55";

  let result: any;

  try {
    result = JSON.parse(rawJson);
  } catch {
    toast.error("Could not parse interview data");
    return;
  }

  const headerCell = (text: string) =>
    new TableCell({
      shading: {
        type: ShadingType.CLEAR,
        fill: NAVY,
      },

      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              color: "FFFFFF",
              size: 20,
            }),
          ],
        }),
      ],
    });

  const bodyCell = (
    text: string,
    color = "222222"
  ) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: text || "",
              size: 18,
              color,
            }),
          ],
        }),
      ],
    });

  const listCell = (
    items: string[],
    color = "222222"
  ) =>
    new TableCell({
      children:
        items && items.length > 0
          ? items.map(
              (item) =>
                new Paragraph({
                  bullet: {
                    level: 0,
                  },

                  children: [
                    new TextRun({
                      text: item,
                      size: 18,
                      color,
                    }),
                  ],
                })
            )
          : [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "-",
                    size: 18,
                  }),
                ],
              }),
            ],
    });

  const sectionHeading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,

      spacing: {
        before: 300,
        after: 120,
      },

      children: [
        new TextRun({
          text,
          bold: true,
          color: NAVY,
          size: 28,
        }),
      ],
    });

  const children: any[] = [];

  children.push(
    new Paragraph({
      spacing: {
        after: 300,
      },

      children: [
        new TextRun({
          text: "INTERVIEW QUESTION BANK",
          bold: true,
          color: NAVY,
          size: 36,
        }),
      ],
    })
  );

  /* ==============================
     TECHNICAL QUESTIONS
  ============================== */

  children.push(
    sectionHeading("1. Technical Questions")
  );

  children.push(
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },

      rows: [
        new TableRow({
          children: [
            headerCell("#"),
            headerCell("Question"),
            headerCell("Level"),
            headerCell("Category"),
            headerCell("Ideal Answer"),
          ],
        }),

        ...((result.technical || []).map(
          (q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell((i + 1).toString()),
                bodyCell(q.question || ""),
                bodyCell(q.difficulty || ""),
                bodyCell(q.category || ""),
                listCell(
                  q.ideal_answer_points || []
                ),
              ],
            })
        ) as any[]),
      ],
    })
  );

  /* ==============================
     BEHAVIORAL QUESTIONS
  ============================== */

  children.push(
    sectionHeading("2. Behavioral Questions")
  );

  children.push(
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },

      rows: [
        new TableRow({
          children: [
            headerCell("#"),
            headerCell("Question"),
            headerCell("Competency"),
            headerCell("STAR Prompts"),
            headerCell("Red Flags"),
          ],
        }),

        ...((result.behavioral || []).map(
          (q: any, i: number) =>
            new TableRow({
              children: [
                bodyCell((i + 1).toString()),
                bodyCell(q.question || ""),
                bodyCell(q.competency || ""),
                listCell(q.star_prompts || []),
                listCell(
                  q.red_flags || [],
                  "C62828"
                ),
              ],
            })
        ) as any[]),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  saveAs(
    blob,
    title.replace(/[^a-z0-9]/gi, "-") +
      "-Interview-Kit.docx"
  );

  toast.success("Interview kit downloaded!");
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function History() {
  const navigate = useNavigate();

  const [items, setItems] = useState<
    HistoryItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [tab, setTab] =
    useState<HistoryTab>("all");

  const [expanded, setExpanded] =
    useState<string | null>(null);

  const [downloading, setDownloading] =
    useState<string | null>(null);

  /* ==============================
     FETCH HISTORY
  ============================== */

  useEffect(() => {
    fetchHistory();
    let scheduled = false;
    const refresh = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => { scheduled = false; fetchHistory(); }, 250);
    };
    const channel = supabase
      .channel("history-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "jd_history" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "talent_history" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "interview_history" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchHistory() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [
      jdRes,
      talentRes,
      interviewRes,
    ] = await Promise.all([
      supabase
        .from("jd_history")
        .select(
          "id, role_name, content, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("talent_history")
        .select(
          "id, jd_input, results, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("interview_history")
        .select(
          "id, jd_input, questions, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    const all: HistoryItem[] = [
      ...(jdRes.data || []).map((j: any) => ({
        id: j.id,
        type: "jd" as const,
        title:
          j.role_name || "Untitled JD",
        rawContent: j.content || "",
        created_at: j.created_at,
      })),

      ...(talentRes.data || []).map(
        (t: any) => ({
          id: t.id,
          type: "talent" as const,
          title:
            (
              t.jd_input ||
              "Talent Report"
            ).slice(0, 60),
          rawContent: t.results || "",
          created_at: t.created_at,
        })
      ),

      ...(interviewRes.data || []).map(
        (i: any) => ({
          id: i.id,
          type: "interview" as const,
          title:
            (
              i.jd_input ||
              "Interview Kit"
            ).slice(0, 60),
          rawContent: i.questions || "",
          created_at: i.created_at,
        })
      ),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

    setItems(all);

    setLoading(false);
  }

  /* ==============================
     DOWNLOAD
  ============================== */

  async function handleDownload(
    item: HistoryItem
  ) {
    setDownloading(item.id);

    try {
      if (item.type === "jd") {
        await exportMarkdownToDocx(
          item.rawContent,
          item.title
        );

        toast.success("JD downloaded!");
      }

      else if (item.type === "talent") {
        let parsed: any;

        try {
          parsed = JSON.parse(
            item.rawContent
          );
        } catch {
          toast.error(
            "Could not parse talent report"
          );

          setDownloading(null);
          return;
        }

        await exportTalentReportToDocx(
          parsed,
          item.title
        );

        toast.success(
          "Talent report downloaded!"
        );
      }

      else if (
        item.type === "interview"
      ) {
        await downloadInterviewDocx(
          item.title,
          item.rawContent
        );
      }
    } catch (err) {
      toast.error("Download failed");
    }

    setDownloading(null);
  }

  /* ==============================
     DELETE
  ============================== */

  async function deleteItem(
    item: HistoryItem
  ) {
    const table =
      item.type === "jd"
        ? "jd_history"
        : item.type === "talent"
        ? "talent_history"
        : "interview_history";

    await supabase
      .from(table)
      .delete()
      .eq("id", item.id);

    setItems((prev) =>
      prev.filter(
        (i) => i.id !== item.id
      )
    );

    toast.success("Deleted");
  }

  /* ==============================
     FILTER
  ============================== */

  const filtered =
    tab === "all"
      ? items
      : items.filter(
          (i) => i.type === tab
        );

  const typeConfig = {
    jd: {
      icon: FileText,
      label: "JD",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },

    talent: {
      icon: Brain,
      label: "Talent",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },

    interview: {
      icon: Phone,
      label: "Interview",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  };

  /* ==============================
     UI
  ============================== */

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          History
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          All generated reports,
          interview kits and JDs.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) =>
          setTab(v as HistoryTab)
        }
      >
        <TabsList>

          <TabsTrigger value="all">
            All ({items.length})
          </TabsTrigger>

          <TabsTrigger value="jd">
            JD (
            {
              items.filter(
                (i) => i.type === "jd"
              ).length
            }
            )
          </TabsTrigger>

          <TabsTrigger value="talent">
            Talent (
            {
              items.filter(
                (i) =>
                  i.type === "talent"
              ).length
            }
            )
          </TabsTrigger>

          <TabsTrigger value="interview">
            Interview (
            {
              items.filter(
                (i) =>
                  i.type === "interview"
              ).length
            }
            )
          </TabsTrigger>

        </TabsList>
      </Tabs>

      {loading ? (

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-secondary animate-pulse"
            />
          ))}
        </div>

      ) : filtered.length === 0 ? (

        <Card className="p-14 text-center">

          <div className="space-y-3">

            <h3 className="text-lg font-medium">
              No history found
            </h3>

            <p className="text-muted-foreground text-sm">
              Start generating your
              first document.
            </p>

            <Button
              onClick={() =>
                navigate(
                  "/app/jd-generator"
                )
              }
            >
              Generate JD
            </Button>

          </div>

        </Card>

      ) : (

        <div className="space-y-4">

          {filtered.map((item) => {

            const cfg =
              typeConfig[item.type];

            const Icon = cfg.icon;

            const isOpen =
              expanded === item.id;

            const isDownloading =
              downloading === item.id;

            return (
              <Card
                key={item.id}
                className="overflow-hidden border"
              >

                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-secondary/30 transition"
                  onClick={() =>
                    setExpanded(
                      isOpen
                        ? null
                        : item.id
                    )
                  }
                >

                  <div
                    className={
                      "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 " +
                      cfg.bg
                    }
                  >
                    <Icon
                      className={
                        "h-5 w-5 " +
                        cfg.color
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="font-medium truncate">
                      {item.title}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">

                      <Clock className="h-3 w-3" />

                      {timeAgo(
                        item.created_at
                      )}

                    </div>

                  </div>

                  <Badge
                    variant="outline"
                    className="capitalize"
                  >
                    {cfg.label}
                  </Badge>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={
                        isDownloading
                      }
                      onClick={() =>
                        handleDownload(
                          item
                        )
                      }
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() =>
                        deleteItem(item)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}

                  </div>

                </div>

                {isOpen && (
                  <div className="border-t bg-secondary/20 px-5 py-4">

                    <pre className="text-xs whitespace-pre-wrap leading-relaxed overflow-auto max-h-[400px] font-sans text-muted-foreground">
                      {item.rawContent}
                    </pre>

                  </div>
                )}

              </Card>
            );
          })}

        </div>
      )}
    </div>
  );
}
