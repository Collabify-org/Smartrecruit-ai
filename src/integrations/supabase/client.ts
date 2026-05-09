import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Download, Sparkles, Zap, Crown, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PLANS = [
  { id: "starter", name: "Starter", price: "₹999", features: ["10 JDs / month", "10 analyses / month", "10 interview sets / month", "Email support"] },
  { id: "professional", name: "Professional", price: "₹2,999", features: ["50 JDs / month", "50 analyses / month", "50 interview sets / month", "Priority support"], popular: true },
  { id: "enterprise", name: "Enterprise", price: "Custom", features: ["Unlimited JDs", "Unlimited analyses", "Unlimited interview sets", "Dedicated support"] },
];

const INVOICES = [
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "₹2,999", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "₹2,999", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "₹2,999", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "₹2,999", status: "Paid" },
];

export default function Billing() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const current = PLANS.find((p) => p.id === profile?.plan) || PLANS[0];

  const downloadInvoice = async (inv: typeof INVOICES[number]) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(script);

    script.onload = () => {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SmartRecruit AI", 14, 20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Hiring OS — Invoice Receipt", 14, 30);

      doc.setFillColor(245, 243, 255);
      doc.rect(0, 45, 210, 20, "F");
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice ${inv.id}`, 14, 58);

      const rows = [
        ["Invoice ID", inv.id],
        ["Date", inv.date],
        ["Plan", `${current.name} Plan`],
        ["Billing Period", "Monthly"],
        ["Status", inv.status],
      ];

      let y = 85;
      rows.forEach(([label, value]) => {
        doc.setTextColor(107, 114, 128);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(label, 14, y);
        doc.setTextColor(26, 26, 26);
        doc.setFont("helvetica", "bold");
        doc.text(value, 100, y);
        doc.setDrawColor(240, 240, 240);
        doc.line(14, y + 4, 196, y + 4);
        y += 16;
      });

      doc.setFillColor(245, 243, 255);
      doc.rect(14, y + 5, 182, 20, "F");
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount", 20, y + 18);
      doc.text(inv.amount, 170, y + 18);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("SmartRecruit AI · smartrecruit-ai-seven.vercel.app", 105, 280, { align: "center" });
      doc.text("Thank you for your business!", 105, 286, { align: "center" });

      doc.save(`${inv.id}.pdf`);
      toast.success("Invoice downloaded!");
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm">Loading billing info...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Billing" description="Manage your subscription, usage, and invoices." />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 shadow-soft-sm bg-gradient-brand text-brand-foreground">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs opacity-90 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Current plan</div>
              <div className="text-3xl font-semibold tracking-tight mt-2">{current.name}</div>
              <div className="text-sm opacity-90 mt-1">{current.price} / month · Renews Jun 1, 2026</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setUpgradeOpen(true)}>Change plan</Button>
              {profile?.plan !== "starter" && (
                <Button size="sm" variant="ghost" className="text-brand-foreground hover:bg-white/10" onClick={() => setCancelOpen(true)}>Cancel</Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-sm">
          <div className="text-xs text-muted-foreground">Next invoice</div>
          <div className="text-2xl font-semibold tracking-tight mt-2">{current.price}</div>
          <div className="text-sm text-muted-foreground mt-1">Due Jun 1, 2026</div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">Visa •••• 4242</div>
        </Card>
      </div>

      {/* ✅ REAL usage from Supabase */}
      <Card className="p-6 shadow-soft-sm mb-8">
        <h3 className="font-semibold mb-4">Usage this month</h3>
        <div className="space-y-5">
          <UsageRow label="JDs generated" used={profile?.usage_jd || 0} limit={profile?.jd_limit || 10} />
          <UsageRow label="Talent analyses" used={profile?.usage_talent || 0} limit={profile?.talent_limit || 10} />
          <UsageRow label="Interview question sets" used={profile?.usage_interview || 0} limit={profile?.interview_limit || 10} />
        </div>
      </Card>

      <Card className="p-6 shadow-soft-sm">
        <h3 className="font-semibold mb-4">Billing history</h3>
        <div className="divide-y divide-border">
          {INVOICES.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">{inv.id}</div>
                <div className="text-xs text-muted-foreground">{inv.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{inv.amount}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">{inv.status}</span>
                <Button variant="ghost" size="sm" onClick={() => downloadInvoice(inv)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose your plan</DialogTitle>
            <DialogDescription>Contact us to upgrade your plan.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`text-left rounded-xl border p-5 ${profile?.plan === p.id ? "border-brand shadow-glow" : "border-border"} ${p.popular ? "relative" : ""}`}
              >
                {p.popular && <span className="absolute -top-2 right-4 text-[10px] px-2 py-0.5 rounded-full bg-gradient-brand text-brand-foreground">POPULAR</span>}
                <div className="flex items-center gap-2">
                  {p.id === "starter" ? <Zap className="h-4 w-4" /> : p.id === "professional" ? <Sparkles className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  <div className="font-semibold">{p.name}</div>
                </div>
                <div className="text-2xl font-semibold mt-3">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-1.5 mt-4">
                  {p.features.map((f) => <li key={f} className="text-xs flex gap-1.5"><Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />{f}</li>)}
                </ul>
                {profile?.plan === p.id && (
                  <div className="mt-3 text-xs text-center text-brand font-semibold">Current plan</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">To upgrade, contact us at support@smartrecruitai.com</p>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>Please contact support@smartrecruitai.com to cancel your subscription.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit >= 999999;
  const pct = isUnlimited ? 5 : Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{used} / {isUnlimited ? "Unlimited" : limit}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
