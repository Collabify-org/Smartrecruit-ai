import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Download, Sparkles, Zap, Crown, X } from "lucide-react";
import { lsGet, lsSet } from "@/lib/storage";

const PLANS = [
  { id: "starter", name: "Starter", price: "$0", features: ["10 JDs / month", "5 analyses / month", "Email support"] },
  { id: "growth", name: "Growth", price: "$49", features: ["Unlimited JDs", "100 analyses / month", "Priority support", "Custom templates"], popular: true },
  { id: "scale", name: "Scale", price: "$149", features: ["Everything in Growth", "Unlimited analyses", "Team workspace", "Dedicated CSM"] },
];

const INVOICES = [
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49.00", status: "Paid" },
];

export default function Billing() {
  const [plan, setPlan] = useState(() => lsGet<string>("plan", "growth"));
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const setNewPlan = (p: string) => {
    setPlan(p);
    lsSet("plan", p);
    setUpgradeOpen(false);
    toast.success(`Switched to ${PLANS.find((x) => x.id === p)?.name} plan`);
  };

  const cancel = () => {
    setNewPlan("starter");
    setCancelOpen(false);
    toast.success("Subscription cancelled");
  };

  const downloadInvoice = (inv: typeof INVOICES[number]) => {
    const text = `SmartRecruit AI\nInvoice ${inv.id}\nDate: ${inv.date}\nAmount: ${inv.amount}\nStatus: ${inv.status}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  const current = PLANS.find((p) => p.id === plan)!;

  return (
    <>
      <PageHeader title="Billing" description="Manage your subscription, usage, and invoices." />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 shadow-soft-sm bg-gradient-brand text-brand-foreground">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs opacity-90 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Current plan</div>
              <div className="text-3xl font-semibold tracking-tight mt-2">{current.name}</div>
              <div className="text-sm opacity-90 mt-1">{current.price} / month · Renews May 1, 2026</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setUpgradeOpen(true)}>Change plan</Button>
              {plan !== "starter" && <Button size="sm" variant="ghost" className="text-brand-foreground hover:bg-white/10" onClick={() => setCancelOpen(true)}>Cancel</Button>}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-sm">
          <div className="text-xs text-muted-foreground">Next invoice</div>
          <div className="text-2xl font-semibold tracking-tight mt-2">{current.price}</div>
          <div className="text-sm text-muted-foreground mt-1">Due May 1, 2026</div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">Visa •••• 4242</div>
        </Card>
      </div>

      <Card className="p-6 shadow-soft-sm mb-8">
        <h3 className="font-semibold mb-4">Usage this month</h3>
        <div className="space-y-5">
          <UsageRow label="JDs generated" used={42} limit={plan === "growth" || plan === "scale" ? Infinity : 10} />
          <UsageRow label="Talent analyses" used={18} limit={plan === "scale" ? Infinity : plan === "growth" ? 100 : 5} />
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
            <DialogDescription>Upgrade or downgrade anytime. Changes take effect immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setNewPlan(p.id)}
                className={`text-left rounded-xl border p-5 transition-all ${plan === p.id ? "border-brand shadow-glow" : "border-border hover:border-foreground/30"} ${p.popular ? "relative" : ""}`}
              >
                {p.popular && <span className="absolute -top-2 right-4 text-[10px] px-2 py-0.5 rounded-full bg-gradient-brand text-brand-foreground">POPULAR</span>}
                <div className="flex items-center gap-2">
                  {p.id === "starter" ? <Zap className="h-4 w-4" /> : p.id === "growth" ? <Sparkles className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  <div className="font-semibold">{p.name}</div>
                </div>
                <div className="text-2xl font-semibold mt-3">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-1.5 mt-4">
                  {p.features.map((f) => <li key={f} className="text-xs flex gap-1.5"><Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />{f}</li>)}
                </ul>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>You'll be downgraded to the free Starter plan. You can resubscribe anytime.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep plan</Button>
            <Button variant="destructive" onClick={cancel}><X className="h-4 w-4 mr-1.5" />Cancel subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit === Infinity ? 12 : Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{used} / {limit === Infinity ? "Unlimited" : limit}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}