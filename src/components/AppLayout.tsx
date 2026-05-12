import { NavLink, Outlet } from "react-router-dom";
import { FileText, Brain, CreditCard, Settings as SettingsIcon, Menu, X, Mic, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Topbar from "./Topbar";

const nav = [
  { to: "/app/jd-generator", label: "JD Generator", icon: FileText },
  { to: "/app/talent-intelligence", label: "Talent Intelligence", icon: Brain },
  { to: "/app/interview-questions", label: "Interview Questions", icon: Mic },
  { to: "/app/history", label: "History", icon: Clock },
  { to: "/app/billing", label: "Billing", icon: CreditCard },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 h-14">
        <img src="/synlumex-logo.png.png" alt="Synlumex" className="h-7 object-contain" />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-secondary">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      <div className="flex">
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-30 h-screen w-64 shrink-0 border-r border-border bg-background/60 backdrop-blur-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="hidden lg:flex items-center px-6 h-14 border-b border-border">
            <img src="/synlumex-logo.png.png" alt="Synlumex" className="h-8 object-contain" />
          </div>
          <nav className="p-3 space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-soft-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="rounded-xl bg-gradient-brand p-4 text-brand-foreground shadow-glow">
              <div className="text-xs font-medium opacity-90">Growth Plan</div>
              <div className="text-sm font-semibold mt-1">Upgrade to Scale</div>
              <div className="text-[11px] opacity-80 mt-1">Unlimited JDs & analyses</div>
            </div>
          </div>
        </aside>
        {open && <div className="fixed inset-0 z-20 bg-foreground/20 lg:hidden" onClick={() => setOpen(false)} />}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="hidden lg:block">
            <Topbar />
          </div>
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
