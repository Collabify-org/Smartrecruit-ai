import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
              <Sparkles className="h-4 w-4 text-brand-foreground" />
            </div>
            <span className="font-semibold tracking-tight">HireFlow AI</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            The AI hiring operating system for modern startups and recruiters.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { label: "JD Generator", to: "/app/jd-generator" },
          { label: "Talent Intelligence", to: "/app/talent-intelligence" },
          { label: "Billing", to: "/app/billing" },
        ]} />
        <FooterCol title="Company" links={[
          { label: "About", to: "/" },
          { label: "Contact", to: "mailto:hello@hireflow.ai" },
        ]} />
        <FooterCol title="Legal" links={[
          { label: "Terms", to: "/" },
          { label: "Privacy", to: "/" },
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} HireFlow AI. All rights reserved.</div>
          <div>Built for high-velocity hiring teams.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-3">{title}</div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to.startsWith("mailto:") ? (
              <a href={l.to} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</a>
            ) : (
              <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
