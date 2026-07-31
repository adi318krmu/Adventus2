import { Link } from "react-router-dom";
import { BookOpen, CreditCard, TrendingUp, ShieldCheck, Scroll, Award } from "lucide-react";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import SakuraPetals from "../components/SakuraPetals";
import JapaneseDivider from "../components/JapaneseDivider";

const cards = [
  {
    icon: BookOpen,
    title: "Master Your Path",
    subtitle: "Class Management",
    text: "Access enrolled course ledgers, schedule details, and academic updates in your personal student hall."
  },
  {
    icon: CreditCard,
    title: "Academy Treasury",
    subtitle: "Fee & Payment History",
    text: "Submit fee payments securely via digital QR ledgers and retain a permanent record of all receipts."
  },
  {
    icon: Scroll,
    title: "Scrolls of Wisdom",
    subtitle: "Study Materials Repository",
    text: "Study curated academic scrolls, view PDFs in parchment mode, and download notes anytime."
  }
];

const Landing = () => (
  <div className="relative min-h-screen overflow-y-auto bg-ink text-white shoji-pattern transition-colors duration-300">
    <SakuraPetals />

    {/* Header Navigation */}
    <header className="relative z-20 border-b border-amber-500/30 bg-ink/80 px-5 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Brand />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn-outline !py-2.5 !px-4 text-xs tracking-wider">Sign In</Link>
          <Link to="/signup" className="btn-primary !py-2.5 !px-4 text-xs tracking-wider">Join Academy</Link>
        </div>
      </div>
    </header>

    <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
      {/* Hero Section */}
      <section className="grid min-h-[580px] place-items-center py-16 text-center">
        <div className="max-w-4xl">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
            <Award size={14} className="text-amber-400" /> Traditional Academy Discipline • Modern Excellence
          </div>

          <h1 className="font-display text-5xl font-black leading-[1.05] text-white md:text-7xl">
            Forge Knowledge.<br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Master Wisdom</span> &<br />
            Conquer Tomorrow.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-amber-100/70">
            Welcome to <strong className="text-amber-400">Adventus Samurai Academy</strong> — your central dojo portal for managing classes, academic scrolls, tuition receipts, and companion guidance.
          </p>

          <JapaneseDivider className="max-w-md mx-auto my-8" />

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/signup" className="btn-primary min-w-56 font-display uppercase tracking-wider text-sm flex items-center justify-center gap-2">
              <ShieldCheck size={18} /> Enter The Academy
            </Link>
            <Link to="/login" className="btn-outline min-w-40 font-display uppercase tracking-wider text-sm flex items-center justify-center gap-2">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="card group min-h-52 border-amber-500/30 hover:border-amber-500/70 hover:shadow-samuraiGold">
            <div className="mb-4 inline-grid place-items-center rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-400 group-hover:scale-110 transition-transform">
              <card.icon size={26} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 font-display">{card.subtitle}</p>
            <h2 className="mt-1 text-xl font-bold font-display text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  </div>
);

export default Landing;
