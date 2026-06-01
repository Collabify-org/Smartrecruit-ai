import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <img
              src="/synlumex-logo.png.png"
              alt="Synlumex"
              className="h-16 w-auto object-contain"
            />
          </div>

          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            The AI hiring operating system for modern startups and recruiters.
          </p>

          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-muted-foreground hover:text-foreground"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        </div>

        {/* Product */}
        <FooterCol
          title="Product"
          links={[
            { label: "JD Generator", to: "/app/jd-generator" },
            { label: "Talent Intelligence", to: "/app/talent-intelligence" },
            { label: "Interview Questions", to: "/app/interview-questions" },
            { label: "Dashboard", to: "/app/dashboard" },
            { label: "Billing", to: "/app/billing" },
          ]}
        />

        {/* Resources */}
        <FooterCol
          title="Resources"
          links={[
            { label: "Blog", to: "/blog" },
            { label: "FAQ", to: "/faq" },
          ]}
        />

        {/* Company */}
        <FooterCol
          title="Company"
          links={[
            { label: "About", to: "/about" },
            { label: "Contact", to: "/contact" },
          ]}
        />

        {/* Legal */}
        <FooterCol
          title="Legal"
          links={[
            { label: "Terms", to: "/terms" },
            { label: "Privacy", to: "/privacy" },
          ]}
        />

      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Synlumex. All rights reserved.</div>
          <div>Built for high-velocity hiring teams.</div>
        </div>
      </div>

    </footer>
  );
}

/* Footer Column Component */
function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <div className="text-sm font-semibold mb-3">{title}</div>

      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
