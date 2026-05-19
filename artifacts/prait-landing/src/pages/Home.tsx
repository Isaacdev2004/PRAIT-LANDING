import { useState, useRef, useEffect, type ReactNode, type FormEvent } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Briefcase, TrendingUp, CheckCircle, Globe, BookOpen,
  MapPin, ArrowRight, Star, Building2, Users, Award, Zap, Menu, X
} from "lucide-react";
import { motion, useInView, AnimatePresence, animate as animateValue } from "framer-motion";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7 } },
};

function AnimateOnScroll({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animateValue(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { el.textContent = Math.round(v) + suffix; },
    });
    return () => controls.stop();
  }, [inView, to, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
}

const TABS = [
  {
    id: "domestic",
    label: "Domestic Career Colleges",
    icon: GraduationCap,
    headline: "Start a High-Paying Career in Canada",
    subhead: "Funded diploma programs for residents & new immigrants",
    bullets: [
      "OSAP & government-funded programs available",
      "Fast-tracked, flexible schedules designed for working adults",
      "Fully recognized diplomas from accredited institutions",
      "Career placement support included",
      "Programs in healthcare, IT, business, trades & more",
    ],
    cta: "Explore Career Programs",
    color: "primary",
  },
  {
    id: "international",
    label: "International Admissions",
    icon: Globe,
    headline: "Study at Top Canadian Colleges",
    subhead: "End-to-end admissions & visa support for African students",
    bullets: [
      "Partner institution: Conestoga College",
      "Full application management & document preparation",
      "Student visa guidance and processing support",
      "Pre-arrival and settlement assistance",
      "Scholarship and funding identification",
    ],
    cta: "View Admissions Process",
    color: "secondary",
  },
  {
    id: "training",
    label: "Corporate Training & Upskilling",
    icon: Briefcase,
    headline: "Build the Skills the Modern Market Demands",
    subhead: "Bootcamps, corporate training & international excursions",
    bullets: [
      "AI & Cybersecurity intensive bootcamps",
      "Resume & LinkedIn optimization",
      "Digital skills & workplace technology training",
      "Corporate team upskilling packages",
      "International training excursions for professionals",
    ],
    cta: "View Training Programs",
    color: "secondary",
  },
  {
    id: "business",
    label: "Business Consulting",
    icon: TrendingUp,
    headline: "Scale Your Business. Expand Your Reach.",
    subhead: "Comprehensive consulting for entrepreneurs & enterprises",
    bullets: [
      "Canadian business registration & operations",
      "Government grants & loans applications",
      "Branding, web development & digital marketing",
      "Business accounting & taxation",
      "Bilateral trade opportunities & global expansion",
    ],
    cta: "Book a Strategy Session",
    color: "accent",
  },
];

export default function Home() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", residency: "", interest: "", employment: [] as string[], message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("domestic");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stepsLineRef = useRef(null);
  const stepsLineInView = useInView(stepsLineRef, { once: true, margin: "-60px" });

  const [matcherData, setMatcherData] = useState({ currentRole: "", skills: "", goals: "" });
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    recommendedPathway: string;
    pathwayId: string;
    confidence: string;
    headline: string;
    reasoning: string;
    nextStep: string;
    alternativePathway: string | null;
  } | null>(null);

  const handleMatcher = async (e: FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    setMatchResult(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matcherData),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json() as { success: boolean; result: typeof matchResult };
      setMatchResult(data.result);
    } catch {
      toast({ title: "Analysis Failed", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setIsMatching(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, employment: formData.employment.join(", ") }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong");
      }
      toast({
        title: "Request Received!",
        description: "Thank you — we will be in touch shortly to schedule your free consultation.",
      });
      setFormData({ name: "", email: "", phone: "", residency: "", interest: "", employment: [], message: "" });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmployment = (val: string) => {
    setFormData(f => ({
      ...f,
      employment: f.employment.includes(val) ? f.employment.filter(v => v !== val) : [...f.employment, val]
    }));
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const activeTabData = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => scrollTo("hero")} data-testid="nav-logo">
            <img src="/prait-logo.jpeg" alt="PRAIT Consulting" className="h-12 w-auto object-contain rounded-md" />
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            {[["solutions","Solutions"],["process","How It Works"],["programs","Programs"],["testimonials","Testimonials"],["contact","Contact"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" data-testid={`nav-link-${id}`}>{label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(o => !o)} data-testid="nav-mobile-toggle">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
            {[["solutions","Solutions"],["process","How It Works"],["programs","Programs"],["testimonials","Testimonials"],["contact","Contact"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left text-base font-medium text-foreground py-2 border-b border-border/50">{label}</button>
            ))}
            <Button onClick={() => scrollTo("contact")} className="mt-2 bg-accent text-white rounded-full w-full">Book Consultation</Button>
          </motion.div>
        )}
      </header>

      {/* ── HERO ── */}
      <section id="hero" className="relative pt-24 pb-28 lg:pt-36 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="float-slow absolute top-[-100px] right-[-80px] w-[650px] h-[650px] rounded-full bg-primary/6 blur-3xl" />
          <div className="float-medium absolute bottom-[-60px] left-[-60px] w-[500px] h-[500px] rounded-full bg-secondary/6 blur-3xl" />
          <div className="float-fast absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full bg-accent/5 blur-2xl" />
          {/* Decorative grid dots */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="hsl(var(--primary))" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>
        </div>
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-5xl mx-auto text-center">
            <motion.div variants={fadeUp}>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-6">
                Canada • Africa • Global
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-4 leading-[1.1]">
              Bridging Ambition<br />
              <span className="shimmer-gradient">with Opportunity.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-3 font-medium">
              Fast-Track Your Career in Canada and Beyond.
            </motion.p>
            <motion.p variants={fadeUp} className="text-base md:text-lg text-muted-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Guiding domestic residents to funded career programs, international students to Canadian institutions, and entrepreneurs to global growth. We map the exact route to your success.
            </motion.p>

            {/* 4 Pathway Cards */}
            <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-left">
              {[
                { label: "Start a Career in Canada", sub: "OSAP-funded diploma programs for domestic residents & new immigrants.", icon: GraduationCap, color: "primary", tab: "domestic" },
                { label: "Study Internationally", sub: "Admissions support for international students applying to top Canadian colleges.", icon: Globe, color: "secondary", tab: "international" },
                { label: "Corporate Training & Upskilling", sub: "International training and bootcamps for corporate teams, professionals & graduates.", icon: Briefcase, color: "secondary", tab: "training" },
                { label: "Business Consulting", sub: "Business registration, grants, web development & global trade strategies.", icon: TrendingUp, color: "accent", tab: "business" },
              ].map((card, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card
                    className="group h-full border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer bg-card"
                    onClick={() => { scrollTo("programs"); setActiveTab(card.tab); }}
                    data-testid={`hero-card-${card.tab}`}
                  >
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${card.color}/10 text-${card.color} group-hover:scale-110 transition-transform`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground leading-snug">{card.label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{card.sub}</p>
                      <span className={`text-xs font-semibold text-${card.color} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                        Explore <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white rounded-full text-base h-13 px-8 shadow-lg shadow-accent/25" onClick={() => scrollTo("contact")} data-testid="hero-primary-cta">
                Book Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base h-13 px-8" onClick={() => scrollTo("programs")} data-testid="hero-explore">
                Explore Pathways
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST STRIP (marquee) ── */}
      <section className="border-y bg-muted/20 py-6 overflow-hidden">
        {(() => {
          const items = [
            { icon: Award, label: "Fully Recognized Diplomas" },
            { icon: Zap, label: "OSAP & Government Funding Eligible" },
            { icon: BookOpen, label: "Fast-Tracked Flexible Schedules" },
            { icon: Building2, label: "Partner to Top Canadian Colleges" },
            { icon: Users, label: "Tailored Solutions for Your Goals" },
            { icon: Globe, label: "Canada · Africa · Global" },
            { icon: CheckCircle, label: "100% Dedicated Support" },
          ];
          const doubled = [...items, ...items];
          return (
            <div className="marquee-track flex items-center gap-12 w-max">
              {doubled.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground whitespace-nowrap px-2">
                  <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  {item.label}
                  <span className="ml-4 text-border/60">·</span>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* ── PROBLEM / HOOK ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll className="text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-6">Why PRAIT?</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground leading-tight">You are capable of more.<br />The path just isn't clear yet.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Career confusion. Credential gaps. Immigration uncertainty. Skills that don't match the modern market.
              The journey to a better life is complex — and navigating it alone is overwhelming.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.15}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: "No Clear Direction", desc: "Thousands of options, no clear path. We've mapped the routes so you don't have to guess." },
                { icon: Award, title: "Credentials Not Recognized", desc: "Your qualifications may not translate. We know exactly which programs bridge that gap." },
                { icon: Globe, title: "Complex Immigration Process", desc: "Visas, permits, applications — it's a full-time job. Let us handle the complexity." },
              ].map((p, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2} className="text-center mt-10">
            <p className="text-xl font-bold text-primary">We've walked this path. We know the way.</p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── SOLUTION PILLARS ── */}
      <section id="solutions" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-4">Our Pillars</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Four Paths. One Trusted Partner.</h2>
            <p className="text-lg text-muted-foreground">Comprehensive solutions tailored to your unique journey and goals.</p>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TABS.map((tab, i) => (
              <AnimateOnScroll key={tab.id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -10, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="h-full"
                >
                  <Card className={`group border-none shadow-md hover:shadow-2xl transition-shadow duration-300 rounded-2xl overflow-hidden h-full bg-gradient-to-b from-card to-${tab.color}/5`}>
                    <CardContent className="p-7 flex flex-col h-full">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className={`h-12 w-12 rounded-xl bg-${tab.color}/10 flex items-center justify-center mb-5 text-${tab.color}`}
                      >
                        <tab.icon className="h-6 w-6" />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2">{tab.headline}</h3>
                      <p className="text-sm text-muted-foreground mb-5 flex-1 leading-relaxed">{tab.subhead}</p>
                      <Button variant="ghost" size="sm" className={`rounded-full w-full border border-${tab.color}/20 hover:bg-${tab.color}/5 text-${tab.color} group/btn`}
                        onClick={() => { setActiveTab(tab.id); scrollTo("programs"); }} data-testid={`solution-${tab.id}-btn`}>
                        {tab.cta} <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="process" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-4">The Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">A Proven Framework for Success</h2>
            <p className="text-lg text-muted-foreground">Complex processes broken into clear, actionable steps.</p>
          </AnimateOnScroll>
          {/* Animated connector line */}
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div ref={stepsLineRef} className="hidden md:block absolute top-10 left-[14%] right-[14%] h-px bg-border/40 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={stepsLineInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                style={{ originX: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent"
              />
            </div>
            {[
              { step: "01", title: "Discover", desc: "We analyze your background, goals, and map the optimal route for you specifically.", icon: MapPin, color: "primary" },
              { step: "02", title: "Plan", desc: "We develop a concrete, personalized strategy for admission, training, or business growth.", icon: BookOpen, color: "secondary" },
              { step: "03", title: "Apply & Train", desc: "We execute applications and enroll you in vital skill-building programs.", icon: Briefcase, color: "secondary" },
              { step: "04", title: "Succeed", desc: "Land in Canada, start your new career, grow your business — and thrive.", icon: CheckCircle, color: "accent" },
            ].map((s, i) => (
              <AnimateOnScroll key={i} delay={i * 0.14} className="flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className={`h-20 w-20 rounded-full bg-background border-2 border-${s.color}/30 shadow-lg flex items-center justify-center mb-5 z-10 relative`}
                >
                  <div className={`h-16 w-16 rounded-full bg-${s.color}/10 flex items-center justify-center text-${s.color}`}>
                    <s.icon className="h-8 w-8" />
                  </div>
                </motion.div>
                <span className={`text-xs font-bold text-${s.color} mb-1 tracking-widest uppercase`}>Step {s.step}</span>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll className="mt-14 text-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 shadow-md shadow-accent/20" onClick={() => scrollTo("contact")} data-testid="process-cta">
              Start Your Journey <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── PROGRAMS TABBED ── */}
      <section id="programs" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-6">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-4">Programs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Tailored Solutions for Your Goals</h2>
            <p className="text-lg text-muted-foreground">Select your path below to discover how PRAIT Consulting can facilitate your transition.</p>
          </AnimateOnScroll>

          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div className="max-w-5xl mx-auto bg-background rounded-3xl shadow-xl border overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className={`bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10`}>
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className={`h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6`}
                    >
                      <activeTabData.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">{activeTabData.headline}</h3>
                    <p className="text-primary-foreground/80 mb-8">{activeTabData.subhead}</p>
                    <motion.ul
                      className="space-y-3"
                      initial="hidden"
                      animate="show"
                      variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
                    >
                      {activeTabData.bullets.map((b, i) => (
                        <motion.li
                          key={i}
                          variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } }}
                          className="flex items-start gap-3 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                  <div className="p-10 flex flex-col justify-center">
                    <h4 className="text-xl font-bold mb-4 text-foreground">Ready to get started?</h4>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                      Book a free, no-obligation consultation with one of our pathway specialists. We'll assess your situation and map the clearest route to your goals.
                    </p>
                    <div className="space-y-3">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-white rounded-full shadow-md" onClick={() => scrollTo("contact")} data-testid={`tab-cta-${activeTab}`}>
                        {activeTabData.cta} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="w-full rounded-full" onClick={() => scrollTo("contact")}>
                        Ask a Question
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Business consulting detail strip */}
          {activeTab === "business" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-5xl mx-auto mt-8">
              <div className="bg-background rounded-2xl border p-8">
                <h4 className="font-bold text-lg mb-5 text-foreground">For Entrepreneurs & Enterprises — Our Consulting Services:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Canadian Business Registration & Operations",
                    "Canadian Business Grants & Loans",
                    "Business Accounting & Taxation",
                    "Branding, Web Development & Digital Marketing",
                    "Bilateral Trade Opportunities & Global Reach",
                    "AI Tools Integration & Business Optimization",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/20 rounded-full px-4 py-1.5 mb-4">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lives Changed. Futures Built.</h2>
            <p className="text-primary-foreground/70 text-lg">Real people. Real transformations. Hear from those who crossed borders and climbed ladders.</p>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "PRAIT didn't just help me apply — they completely re-engineered my career trajectory. The transition from nursing in Africa to healthcare IT in Toronto was seamless because of their guidance.", name: "Sarah M.", role: "Healthcare IT Consultant, Toronto" },
              { quote: "The AI bootcamp gave me the exact technical skills I was missing. Within 3 months of completing the program, I landed a junior data role. They are truly invested in your success.", name: "David O.", role: "Data Analyst, Calgary" },
              { quote: "Navigating the international student process for Conestoga felt impossible until I met the PRAIT team. They held my hand through every single step of the process.", name: "Grace K.", role: "International Student, Ontario" },
            ].map((t, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1}>
                <Card className="bg-white/10 border-none text-primary-foreground rounded-2xl h-full">
                  <CardContent className="p-8 flex flex-col justify-between h-full">
                    <div className="mb-6">
                      <div className="flex text-accent mb-4 gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-accent" />)}
                      </div>
                      <p className="text-base leading-relaxed font-medium">"{t.quote}"</p>
                    </div>
                    <div className="flex items-center gap-3 border-t border-white/20 pt-5 mt-auto">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-primary-foreground/60">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI PATHWAY MATCHER ── */}
      <section id="matcher" className="py-24 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-4">AI-Powered</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">AI Career Pathway Matcher</h2>
            <p className="text-lg text-muted-foreground">Not sure which program is right for you? Tell our AI assistant about your background and goals — it will recommend the perfect PRAIT pathway in seconds.</p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.1}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-background rounded-3xl shadow-xl border overflow-hidden">
                {/* Header bar */}
                <div className="bg-gradient-to-r from-primary to-secondary px-8 py-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">PRAIT AI Advisor</p>
                    <p className="text-white/70 text-xs">Powered by AI • Instant recommendation</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/70 text-xs">Online</span>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  {!matchResult ? (
                    <form onSubmit={handleMatcher} className="space-y-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="currentRole" className="text-sm font-semibold">What is your current job or situation? <span className="text-accent">*</span></Label>
                        <Input
                          id="currentRole"
                          required
                          placeholder="e.g. Registered Nurse in Nigeria, Unemployed recent graduate, Small business owner in Ghana..."
                          className="rounded-xl bg-muted/40 border-transparent focus-visible:border-primary h-11"
                          value={matcherData.currentRole}
                          onChange={e => setMatcherData(m => ({ ...m, currentRole: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="skills" className="text-sm font-semibold">What are your key skills or qualifications?</Label>
                        <Input
                          id="skills"
                          placeholder="e.g. 5 years nursing, BSc Computer Science, business management, customer service..."
                          className="rounded-xl bg-muted/40 border-transparent focus-visible:border-primary h-11"
                          value={matcherData.skills}
                          onChange={e => setMatcherData(m => ({ ...m, skills: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="goals" className="text-sm font-semibold">What are you looking to achieve? <span className="text-accent">*</span></Label>
                        <Input
                          id="goals"
                          required
                          placeholder="e.g. Get a funded diploma in Canada, study at a Canadian college, expand my business to Canada..."
                          className="rounded-xl bg-muted/40 border-transparent focus-visible:border-primary h-11"
                          value={matcherData.goals}
                          onChange={e => setMatcherData(m => ({ ...m, goals: e.target.value }))}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isMatching}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-full text-base h-12 shadow-lg font-semibold"
                      >
                        {isMatching ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="inline-block"
                            >
                              <Zap className="h-4 w-4" />
                            </motion.span>
                            Analyzing your profile...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Find My Pathway
                          </span>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                      {/* Result card */}
                      <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl border border-primary/20 p-6 md:p-8">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Award className="h-6 w-6 text-accent" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 rounded-full px-3 py-0.5">
                                {matchResult.confidence} Confidence
                              </span>
                              <span className="text-xs text-muted-foreground">Best match</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-foreground">{matchResult.recommendedPathway}</h3>
                          </div>
                        </div>
                        <p className="text-base font-semibold text-primary mb-3 italic">"{matchResult.headline}"</p>
                        <p className="text-muted-foreground leading-relaxed mb-5">{matchResult.reasoning}</p>
                        <div className="bg-accent/10 border border-accent/20 rounded-xl px-5 py-4 flex gap-3">
                          <ArrowRight className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-accent mb-0.5">Your next step</p>
                            <p className="text-sm text-foreground">{matchResult.nextStep}</p>
                          </div>
                        </div>
                        {matchResult.alternativePathway && (
                          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-secondary" />
                            Also consider: <span className="font-semibold text-secondary">{matchResult.alternativePathway}</span>
                          </p>
                        )}
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          size="lg"
                          className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-full h-12 font-semibold"
                          onClick={() => scrollTo("contact")}
                        >
                          Book Free Consultation
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="flex-1 rounded-full h-12"
                          onClick={() => { setMatchResult(null); setMatcherData({ currentRole: "", skills: "", goals: "" }); }}
                        >
                          Try Again
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="contact" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-4">Get Started</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Ready to Map Your Route to Success?</h2>
            <p className="text-lg text-muted-foreground">Book a free, zero-pressure consultation. Select your area of interest so we can connect you with the right expert.</p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <div className="max-w-5xl mx-auto bg-background rounded-3xl shadow-xl overflow-hidden border">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Let's Talk</h3>
                    <p className="text-primary-foreground/80 mb-8 text-sm leading-relaxed">Take the first step. Our specialists will assess your situation and provide a clear, honest roadmap.</p>
                    <ul className="space-y-4 mb-10">
                      {["Personalized pathway assessment", "Clear, actionable next steps", "Zero pressure — just honest guidance"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <CheckCircle className="text-accent h-4 w-4 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-white rounded-lg p-1.5 flex-shrink-0">
                      <img src="/prait-logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">PRAIT Consulting Inc.</p>
                      <p className="text-xs text-primary-foreground/60">info@praitconsulting.ca</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3 p-10">
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name <span className="text-accent">*</span></Label>
                        <Input id="name" required placeholder="John Doe" className="rounded-lg bg-muted/40 border-transparent focus-visible:border-primary" data-testid="form-input-name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address <span className="text-accent">*</span></Label>
                        <Input id="email" type="email" required placeholder="john@example.com" className="rounded-lg bg-muted/40 border-transparent focus-visible:border-primary" data-testid="form-input-email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="rounded-lg bg-muted/40 border-transparent focus-visible:border-primary" data-testid="form-input-phone" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="residency">Residency Status <span className="text-accent">*</span></Label>
                        <Select required value={formData.residency} onValueChange={val => setFormData(f => ({ ...f, residency: val }))}>
                          <SelectTrigger id="residency" className="rounded-lg bg-muted/40 border-transparent" data-testid="form-select-residency">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="citizen">Canadian Citizen</SelectItem>
                            <SelectItem value="pr">Permanent Resident</SelectItem>
                            <SelectItem value="permit">Work / Study Permit</SelectItem>
                            <SelectItem value="international">International (Outside Canada)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Employment Status <span className="text-accent">*</span> <span className="text-xs text-muted-foreground font-normal">(select all that apply)</span></Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Employed", "Unemployed", "Business Owner", "Corporate Representative"].map(opt => (
                          <div key={opt} className="flex items-center gap-2">
                            <Checkbox
                              id={`emp-${opt}`}
                              checked={formData.employment.includes(opt)}
                              onCheckedChange={() => toggleEmployment(opt)}
                              data-testid={`form-check-${opt.toLowerCase().replace(/\s/g,"-")}`}
                            />
                            <label htmlFor={`emp-${opt}`} className="text-sm cursor-pointer">{opt}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="interest">Primary Area of Interest <span className="text-accent">*</span></Label>
                      <Select required value={formData.interest} onValueChange={val => setFormData(f => ({ ...f, interest: val }))}>
                        <SelectTrigger id="interest" className="rounded-lg bg-muted/40 border-transparent" data-testid="form-select-interest">
                          <SelectValue placeholder="What do you need help with?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="study">Start a Career in Canada</SelectItem>
                          <SelectItem value="international">Study Internationally</SelectItem>
                          <SelectItem value="train">Corporate Training & Upskilling</SelectItem>
                          <SelectItem value="business">Business Consulting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-white rounded-full text-base h-12 shadow-md shadow-accent/20" data-testid="form-submit-btn">
                      {isSubmitting ? "Sending..." : "Book Free Consultation"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Your information is 100% secure and confidential. We never share your details with third parties.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground text-background py-14">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="bg-white p-2 rounded-lg inline-block mb-5">
                <img src="/prait-logo.jpeg" alt="PRAIT Consulting" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-background/60 max-w-sm mb-6 leading-relaxed text-sm">
                Bridging Africa and Canada through premium education, transformative career training, and strategic business consulting. Your future, our expertise.
              </p>
              <div className="flex gap-3">
                {[
                  { href: "https://www.linkedin.com/company/prait-consulting-inc/", icon: FaLinkedinIn, label: "LinkedIn" },
                  { href: "https://www.facebook.com/share/1NsoT5BUJL/?mibextid=wwXIfr", icon: FaFacebookF, label: "Facebook" },
                  { href: "https://www.instagram.com/prait_consulting?igsh=MWl1c3lyZ293Zm43OQ%3D%3D&utm_source=qr", icon: FaInstagram, label: "Instagram" },
                  { href: "https://www.tiktok.com/@prait.consulting?_r=1&_t=ZS-95xYccaoDMS", icon: FaTiktok, label: "TikTok" },
                  { href: "https://youtube.com/@praitconsulting?si=EJQYQxDudKl9PJ3k", icon: FaYoutube, label: "YouTube" },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent transition-colors" data-testid={`social-${s.label.toLowerCase()}`}>
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-base mb-5 text-background">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                {[["solutions","Solutions"],["process","How It Works"],["programs","Programs"],["testimonials","Testimonials"],["contact","Contact"]].map(([id, label]) => (
                  <li key={id}><button onClick={() => scrollTo(id)} className="text-background/60 hover:text-white transition-colors">{label}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-5 text-background">Contact</h4>
              <ul className="space-y-3 text-sm text-background/60">
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />Canada</li>
                <li>info@praitconsulting.ca</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/40">
            <p>&copy; {new Date().getFullYear()} PRAIT Consulting Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors" data-testid="footer-privacy-link">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors" data-testid="footer-terms-link">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
