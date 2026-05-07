import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, FileText, Brain, ArrowRight, Check, Star, Shield, Zap, Headphones,
  Upload, FileDown, Search, TrendingUp, Users, Target, Menu, X, Calendar, Mail,
  Linkedin, Building2, Rocket, Briefcase, BookOpen, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { isAuthed } from "@/lib/auth";
import HeroProductPreview from "@/components/demos/HeroProductPreview";
import ProductDemos from "@/components/demos/ProductDemos";

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Demos", href: "#demos" },
  { label: "Pricing", href: "#pricing" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Blog", href: "#blog" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Index() {
  const authed = isAuthed();
  const primaryCta = authed ? "/app/jd-generator" : "/login";
  const primaryCtaLabel = authed ? "Open app" : "Log in";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = "SmartRecruit AI — AI Job Description Generator, Talent Intelligence & Interview Questions | by Collabify";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="SmartRecruit AI home">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-brand-foreground" />
            </div>
            <span className="font-semibold tracking-tight">SmartRecruit AI</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{n.label}</a>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <Link to={primaryCta}>
              <Button size="sm" className="bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow">
                {primaryCtaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <button
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md border border-border"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-6 py-4 flex flex-col gap-3">
              {NAV.map((n) => (
                <a key={n.label} href={n.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">{n.label}</a>
              ))}
              <div className="flex gap-2 pt-2">
                <Link to={primaryCta} className="flex-1"><Button className="w-full bg-gradient-brand text-brand-foreground">{primaryCtaLabel}</Button></Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-subtle" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-spotlight" />
          <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.4] bg-dot-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
          <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full bg-brand/10 blur-3xl -z-10 animate-pulse-glow" />
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background text-xs text-muted-foreground mb-6 shadow-soft-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              New: Talent Intelligence Engine v2 — live now
            </div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.05]">
              Hire 10× faster with the <span className="text-gradient-brand">AI hiring OS</span> built for startups
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              SmartRecruit AI gives founders, recruiters and lean hiring teams three superpowers:
              an <strong className="text-foreground font-medium">AI Job Description Generator</strong> that writes JDs in your own format,
              a <strong className="text-foreground font-medium">Talent Intelligence Engine</strong> that decodes salaries, skills and sourcing in seconds,
              and an <strong className="text-foreground font-medium">Interview Questions</strong> generator that creates role-specific phone screening sheets instantly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={primaryCta}>
                <Button size="lg" className="bg-gradient-brand text-brand-foreground hover:opacity-95 shadow-glow">
                  {primaryCtaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" /> Book a demo
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required · 2-minute setup · Cancel anytime</p>

            {/* Hero product visual */}
            <div className="mt-14 mx-auto max-w-5xl px-1 sm:px-0">
              <HeroProductPreview />
            </div>
          </div>
        </section>

        {/* PRODUCT DEMOS (3 looping) */}
        <ProductDemos />

        {/* LOGO STRIP */}
        <section aria-label="Trusted by" className="border-y border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by modern hiring teams</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center opacity-70">
              {["Northwind", "Acme Labs", "Lumen", "Vertex", "Foundry", "Quanta"].map((name) => (
                <div key={name} className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="font-semibold tracking-tight text-sm">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT / FEATURES */}
        <section id="product" className="max-w-6xl mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Product"
            title="Three focused tools. Zero busywork."
            subtitle="Everything modern hiring teams need to ship roles faster — without the bloat of an ATS."
          />

          <FeatureBlock
            tag="JD Generator"
            icon={FileText}
            title="Stop rewriting JDs from scratch."
            pain="Founders spend hours rewriting the same job descriptions in different formats. Recruiters copy-paste from old docs."
            solution="Upload your company's JD template once. SmartRecruit learns your structure, tone and sections — and generates every future JD in the same format. Or use SmartRecruit's smart format mode."
            bullets={[
              "Upload your company JD template once",
              "Generate future JDs in your exact format",
              "SmartRecruit Smart Format mode (best practices)",
              "Export to editable Word (.docx)",
            ]}
            visual={
              <BrowserFrame title="JD Generator">
                <div className="p-5 space-y-3 bg-gradient-subtle">
                  <div className="flex items-center gap-2 text-xs">
                    <Upload className="h-3.5 w-3.5 text-brand" /> Template uploaded · acme-template.docx
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-secondary" />
                    <div className="h-2 w-full rounded bg-secondary/70" />
                    <div className="h-2 w-11/12 rounded bg-secondary/70" />
                    <div className="h-2 w-9/12 rounded bg-secondary/70" />
                    <div className="h-3 w-1/3 rounded bg-secondary mt-3" />
                    <div className="h-2 w-full rounded bg-secondary/70" />
                    <div className="h-2 w-10/12 rounded bg-secondary/70" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-md bg-accent text-accent-foreground inline-flex items-center gap-1"><FileDown className="h-3 w-3" />Export .docx</span>
                    <span className="text-[11px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground">Copy markdown</span>
                  </div>
                </div>
              </BrowserFrame>
            }
          />

          <FeatureBlock
            reverse
            tag="Talent Intelligence Engine"
            icon={Brain}
            title="Decode the talent market in seconds."
            pain="You're hiring blind: no idea what to pay, who else is hiring, or which keywords actually surface candidates."
            solution="Drop in any JD. SmartRecruit returns salary benchmarks, similar companies hiring the same role, trending skills, Boolean sourcing strings and a recommended hiring strategy."
            bullets={[
              "Salary benchmarks by role, level and region",
              "Similar companies hiring the same role",
              "Skills and seniority trends",
              "Ready-to-paste Boolean sourcing strings",
              "AI-recommended hiring strategy",
            ]}
            visual={
              <BrowserFrame title="Talent Intelligence">
                <div className="p-5 grid grid-cols-2 gap-3 bg-gradient-subtle">
                  <MockStat icon={TrendingUp} label="Median salary" value="$142k" />
                  <MockStat icon={Users} label="Active candidates" value="3,820" />
                  <MockStat icon={Target} label="Match keywords" value="24" />
                  <MockStat icon={Building2} label="Similar hirers" value="38" />
                  <div className="col-span-2 rounded-lg border border-border bg-card p-3">
                    <div className="text-[11px] text-muted-foreground mb-1">Boolean string</div>
                    <code className="text-[11px] block font-mono text-foreground/90 truncate">("Senior Product Engineer" OR "Staff Engineer") AND (React OR TypeScript) AND remote</code>
                  </div>
                </div>
              </BrowserFrame>
            }
          />

          <FeatureBlock
            tag="Interview Questions Generator"
            icon={Phone}
            title="Walk into every call fully prepared."
            pain="HR teams scramble to prepare screening questions for every new role. Generic questions miss role-specific depth."
            solution="Paste any JD and SmartRecruit generates a complete phone screening sheet — role-specific questions, candidate detail fields, CTC, notice period, feedback section — ready in seconds."
            bullets={[
              "Role-specific questions generated from JD",
              "Complete candidate detail fields included",
              "CTC, notice period, location capture",
              "Level 1 feedback field built in",
              "Download as .docx in one click",
            ]}
            visual={
              <BrowserFrame title="Interview Questions · Phone Screen Sheet">
                <div className="p-5 space-y-3 bg-gradient-subtle">
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-brand" /> Phone Screen Sheet — Senior Backend Engineer
                  </div>
                  <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Role-specific questions</div>
                    <div className="text-[11px] text-foreground/90">1. Walk me through how you'd design a high-throughput payments API.</div>
                    <div className="text-[11px] text-foreground/90">2. How do you approach database scaling beyond 10M rows?</div>
                    <div className="text-[11px] text-foreground/90">3. Describe a production incident you led to resolution.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MockField label="Candidate name" value="" />
                    <MockField label="Total experience" value="" />
                    <MockField label="Current CTC" value="" />
                    <MockField label="Notice period" value="" />
                    <MockField label="Location" value="" />
                    <MockField label="Source" value="" />
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-background p-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Level 1 feedback</div>
                    <div className="h-10" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-md bg-accent text-accent-foreground inline-flex items-center gap-1"><FileDown className="h-3 w-3" />Download .docx</span>
                  </div>
                </div>
              </BrowserFrame>
            }
          />
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <SectionHeader eyebrow="Use cases" title="Built for the way modern teams hire" />
            <div className="grid md:grid-cols-3 gap-5 mt-10">
              <UseCase icon={Rocket} title="Startup founders" desc="Write your first 10 JDs without hiring a recruiter. Know what to pay before you post. Generate phone screening questions for every role instantly." />
              <UseCase icon={Briefcase} title="In-house recruiters" desc="Standardize JDs across teams. Source faster with AI-generated Boolean strings. Standardize your phone screening process with role-specific question sheets." />
              <UseCase icon={Users} title="Hiring agencies" desc="Spin up market intelligence for every client brief in minutes, not days. Prepare screening sheets for every client brief in minutes." />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <SectionHeader eyebrow="Loved by hiring teams" title="What founders and recruiters say" />
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            <Testimonial
              quote="We replaced three hiring tools with SmartRecruit. Our JDs went from 4 hours to 4 minutes."
              name="Sara Linde"
              role="Head of Talent, Northwind"
            />
            <Testimonial
              quote="The Talent Intelligence Engine paid for itself on day one. Salary data is shockingly accurate."
              name="Daniel Park"
              role="Co-founder, Lumen"
            />
            <Testimonial
              quote="Finally a hiring tool that doesn't try to be an ATS. It just makes me faster."
              name="Mei Cho"
              role="Founding Recruiter, Vertex"
            />
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TrustBadge icon={Shield} title="Secure payments" desc="Stripe-grade encryption" />
            <TrustBadge icon={Check} title="GDPR ready" desc="EU-compliant data handling" />
            <TrustBadge icon={Headphones} title="Fast support" desc="Avg. reply in under 2h" />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <SectionHeader eyebrow="Pricing" title="Simple, transparent pricing" subtitle="Start with a 3-day free trial. No credit card required." />
            <PricingPlans primaryCta={primaryCta} />
          </div>
        </section>

        {/* AEO / ANSWER BLOCKS */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <SectionHeader eyebrow="Answers" title="What is AI-powered hiring, really?" />
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            <AnswerCard
              h="What is talent intelligence software?"
              p="Talent intelligence software analyzes labor market data — salaries, skills, hiring trends and competitor activity — to help recruiters make better hiring decisions. SmartRecruit turns any job description into an instant market briefing."
            />
            <AnswerCard
              h="How can AI help hiring teams?"
              p="AI removes the busywork: writing JDs, benchmarking salaries, and generating sourcing keywords. SmartRecruit combines an AI JD generator with a talent intelligence engine so small teams can hire like a 10-person recruiting org."
            />
            <AnswerCard
              h="How do I create a job description with AI?"
              p="Upload your company's JD template (or use SmartRecruit's smart format), enter the role, seniority and location, then generate. You'll get a structured, on-brand JD ready to export to Word in under 60 seconds."
            />
          </div>
        </section>

        {/* BLOG */}
        <section id="blog" className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <SectionHeader eyebrow="Blog" title="Insights for modern hiring teams" />
            <div className="grid md:grid-cols-3 gap-5 mt-10">
              <BlogCard category="Hiring strategy" title="How startups hire faster in 2026" excerpt="The 5-step playbook lean teams use to close senior roles in under 21 days." />
              <BlogCard category="Tools" title="Best AI tools for recruiters this year" excerpt="A practical breakdown of which AI tools actually move the needle for talent teams." />
              <BlogCard category="Job descriptions" title="How to write better job descriptions" excerpt="The structure, tone and signals that separate great JDs from generic ones." />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
          <Accordion type="single" collapsible className="mt-8">
            <FaqItem q="How does the AI job description generator work?" a="The AI job description generator turns a role brief into a polished JD in under 60 seconds. Upload your company JD template or use SmartRecruit Smart Format, then enter the role name, experience, skills and work mode. SmartRecruit AI produces a structured, on-brand JD ready to edit, copy or export as a Word .docx file." />
            <FaqItem q="Can I upload my own template?" a="You can upload your own company JD template once and SmartRecruit AI will mirror its sections, headings and tone on every future JD generation, keeping every role on-brand without manual reformatting." />
            <FaqItem q="What is talent intelligence software?" a="Talent intelligence software analyzes labor market data including salaries, skills, hiring trends and competitor activity to help recruiters make better hiring decisions. SmartRecruit AI turns any job description into an instant market briefing with salary ranges, Boolean search strings, and sourcing recommendations." />
            <FaqItem q="How does the Interview Questions generator work?" a="The Interview Questions generator instantly creates a complete phone screening sheet from any JD. Paste a job description into SmartRecruit AI and it produces role-specific behavioural and technical questions plus candidate detail fields including CTC, notice period, location and Level 1 feedback — all downloadable as .docx in one click." />
            <FaqItem q="How accurate are the salary insights?" a="The salary insights in SmartRecruit AI are based on current market data for the specific role, seniority level and location, covering India, USA and Gulf markets. Most teams find our salary bands within 5–8% of their actual offers, and the dataset is refreshed regularly to reflect current hiring trends." />
            <FaqItem q="Is there a free trial?" a="Every SmartRecruit AI plan includes a 3-day free trial with no credit card required. You get full access to JD generation, talent intelligence and interview questions during the trial, and can cancel anytime." />
            <FaqItem q="Does SmartRecruit AI support hiring agencies?" a="The Agency and Enterprise plan supports hiring agencies with unlimited JD generations, talent intelligence analyses and interview question sets, plus unlimited user seats, white label, API access and a dedicated account manager. Custom pricing is tailored to your team size." />
          </Accordion>
        </section>

        {/* CONTACT / LEAD CAPTURE */}
        <section id="contact" className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10">
            <div>
              <Badge variant="secondary" className="mb-3">Talk to us</Badge>
              <h2 className="text-3xl font-semibold tracking-tight">Book a demo or join the waitlist</h2>
              <p className="mt-3 text-muted-foreground">Get a personalized walkthrough, or be the first to hear about new features. We reply within 2 hours on weekdays.</p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" /> hello@smartrecruit.ai</div>
                <div className="flex items-center gap-2"><Headphones className="h-4 w-4 text-brand" /> Avg. reply: under 2 hours</div>
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-brand" /> GDPR-compliant data handling</div>
              </div>
              <div className="mt-8">
                <WaitlistForm />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 shadow-soft-lg">
              <DemoForm />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-2xl bg-gradient-brand text-brand-foreground p-10 text-center shadow-glow">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to hire smarter?</h2>
            <p className="mt-2 opacity-90 max-w-xl mx-auto text-sm sm:text-base">Join hundreds of teams using SmartRecruit AI to generate JDs, decode talent markets, and prepare interview questions — all in one place.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={primaryCta}>
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                  {primaryCtaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="bg-transparent text-brand-foreground border-brand-foreground/40 hover:bg-brand-foreground/10">
                  Contact sales
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Small components ---------- */

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-widest text-brand font-semibold">{eyebrow}</div>
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function BrowserFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-soft-lg overflow-hidden">
      <div className="h-9 border-b border-border bg-secondary/60 flex items-center px-3 gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <div className="ml-3 text-[11px] text-muted-foreground truncate">{title}</div>
      </div>
      {children}
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="h-8 rounded-md border border-border bg-background px-2.5 text-xs flex items-center text-foreground/90">{value}</div>
    </div>
  );
}

function MockStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <Icon className="h-3.5 w-3.5 text-brand" />
      <div className="text-lg font-semibold tracking-tight mt-1">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureBlock({
  tag, icon: Icon, title, pain, solution, bullets, visual, reverse,
}: {
  tag: string; icon: any; title: string; pain: string; solution: string; bullets: string[]; visual: React.ReactNode; reverse?: boolean;
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 items-center mt-16 ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
          <Icon className="h-4 w-4" /> {tag}
        </div>
        <h3 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">The pain:</span> {pain}</p>
        <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">The fix:</span> {solution}</p>
        <ul className="mt-5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>{visual}</div>
    </div>
  );
}

function UseCase({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-soft-sm hover-lift">
      <div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{desc}</p>
    </div>
  );
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <figure className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm flex flex-col gap-4">
      <div className="flex gap-0.5 text-warning">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
      </div>
      <blockquote className="text-sm text-foreground leading-relaxed">"{quote}"</blockquote>
      <figcaption className="mt-auto pt-2 border-t border-border">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </figcaption>
    </figure>
  );
}

function TrustBadge({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-3 shadow-soft-sm">
      <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function PriceCard({ name, price, period, desc, features, cta, to, highlight, subPrice }: {
  name: string; price: string; period: string; desc: string; features: string[]; cta: string; to: string; highlight?: boolean; subPrice?: string;
}) {
  const inner = (
    <div className={`relative rounded-2xl border p-6 h-full flex flex-col ${highlight ? "border-brand bg-background shadow-glow" : "border-border bg-background shadow-soft-sm"}`}>
      {highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-semibold bg-gradient-brand text-brand-foreground px-2.5 py-1 rounded-full">Most popular</span>}
      <div className="text-sm font-semibold">{name}</div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{price}</span>
        {period && <span className="text-xs text-muted-foreground">{period}</span>}
      </div>
      {subPrice && <p className="text-[11px] text-muted-foreground mt-1">{subPrice}</p>}
      <p className="text-xs text-muted-foreground mt-2">{desc}</p>
      <ul className="mt-5 space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <Button className={`mt-6 w-full ${highlight ? "bg-gradient-brand text-brand-foreground" : ""}`} variant={highlight ? "default" : "outline"}>
        {cta}
      </Button>
    </div>
  );
  return to.startsWith("#") ? <a href={to} className="contents">{inner}</a> : <Link to={to} className="contents">{inner}</Link>;
}

function PricingPlans({ primaryCta }: { primaryCta: string }) {
  const [currency, setCurrency] = useState<"INR" | "USD">("USD");

  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled || !data) return;
        if (data.country_code === "IN") setCurrency("INR");
      })
      .catch(() => { /* silent fallback to USD */ });
    return () => { cancelled = true; };
  }, []);

  const fmt = (inr: string, usd: string) => (currency === "INR" ? inr : usd);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        <PriceCard
          name="Starter"
          price={fmt("₹999", "$49")}
          period="/ month"
          desc="For individual recruiters and small HR teams"
          features={[
            "10 JD generations per month",
            "10 Talent Intelligence analyses per month",
            "10 Interview question sets per month",
            "SmartRecruit format JD",
            "Download as .docx",
            "1 user seat",
            "Email support",
            "3-day free trial",
          ]}
          cta={primaryCtaLabel}
          to={primaryCta}
        />
        <PriceCard
          highlight
          name="Professional"
          price={fmt("₹2,999", "$99")}
          period="/ month"
          desc="For growing companies and active hiring teams"
          features={[
            "50 JD generations per month",
            "50 Talent Intelligence analyses per month",
            "50 Interview question sets per month",
            "SmartRecruit format + Company template upload",
            "Download as .docx",
            "3 user seats",
            "Full salary intelligence",
            "Priority email support",
            "3-day free trial",
          ]}
          cta={primaryCtaLabel}
          to={primaryCta}
        />
        <PriceCard
          name="Agency / Enterprise"
          price="Custom Pricing"
          period=""
          subPrice="Tailored to your team size and needs"
          desc="For agencies and enterprises with high-volume hiring"
          features={[
            "Unlimited JD generations",
            "Unlimited Talent Intelligence analyses",
            "Unlimited Interview question sets",
            "Unlimited user seats",
            "Company template upload",
            "White label option",
            "API access",
            "Dedicated account manager",
            "Custom onboarding",
            "3-day free trial",
          ]}
          cta="Contact sales"
          to="#contact"
        />
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        All plans include a 3-day free trial · Payments secured by Cashfree · Cancel anytime
      </p>
    </>
  );
}

function AnswerCard({ h, p }: { h: string; p: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
      <h3 className="text-base font-semibold tracking-tight">{h}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p}</p>
    </article>
  );
}

function BlogCard({ category, title, excerpt }: { category: string; title: string; excerpt: string }) {
  return (
    <article className="rounded-2xl border border-border bg-background overflow-hidden shadow-soft-sm hover-lift">
      <div className="h-32 bg-gradient-brand relative">
        <BookOpen className="h-6 w-6 text-brand-foreground absolute bottom-3 left-4 opacity-80" />
      </div>
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-widest text-brand font-semibold">{category}</div>
        <h3 className="mt-2 font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{excerpt}</p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground">Read article <ArrowRight className="h-3 w-3" /></div>
      </div>
    </article>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const id = q.toLowerCase().replace(/\W+/g, "-");
  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="text-left">{q}</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
    </AccordionItem>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          toast({ title: "Enter a valid email", variant: "destructive" });
          return;
        }
        const list = JSON.parse(localStorage.getItem("hf_waitlist") || "[]");
        list.push({ email, ts: Date.now() });
        localStorage.setItem("hf_waitlist", JSON.stringify(list));
        setEmail("");
        toast({ title: "You're on the waitlist 🎉", description: "We'll be in touch soon." });
      }}
      className="flex gap-2"
      aria-label="Join waitlist"
    >
      <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} required />
      <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">Join waitlist</Button>
    </form>
  );
}

function DemoForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
          toast({ title: "Please complete all required fields", variant: "destructive" });
          return;
        }
        const list = JSON.parse(localStorage.getItem("hf_demo_requests") || "[]");
        list.push({ ...form, ts: Date.now() });
        localStorage.setItem("hf_demo_requests", JSON.stringify(list));
        setForm({ name: "", email: "", company: "", message: "" });
        toast({ title: "Demo requested ✅", description: "Our team will reach out within 2 business hours." });
      }}
      className="space-y-3"
      aria-label="Book a demo"
    >
      <div className="text-sm font-semibold">Book a demo</div>
      <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
      <Input type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={120} required />
      <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={120} />
      <Textarea placeholder="What are you hiring for?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} rows={3} />
      <Button type="submit" className="w-full bg-gradient-brand text-brand-foreground shadow-glow">
        <Calendar className="mr-2 h-4 w-4" /> Request demo
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">By submitting you agree to our Terms & Privacy.</p>
    </form>
  );
}