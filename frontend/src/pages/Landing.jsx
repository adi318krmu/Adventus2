import { Link } from "react-router-dom";
import { BookOpen, CreditCard, TrendingUp } from "lucide-react";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";

const cards = [
  { icon: BookOpen, title: "Manage Your Classes", text: "Track enrolled class details and monthly fee at a glance." },
  { icon: CreditCard, title: "Fee Payments", text: "Pay online via UPI and keep a complete payment history." },
  { icon: TrendingUp, title: "Track Progress", text: "Stay on top of approvals, status, and records with ease." }
];

const Landing = () => (
  <div className="min-h-screen overflow-y-auto bg-ink text-white">
    <header className="border-b border-line px-5 py-7">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Brand />
        <div className="flex gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn-outline">Sign In</Link>
          <Link to="/signup" className="btn-outline">Sign Up</Link>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-5 pb-12">
      <section className="grid min-h-[620px] place-items-center py-14 text-center">
        <div className="max-w-4xl">
          <h1 className="font-display text-6xl font-black leading-[0.95] text-white md:text-8xl">
            Let's Learn<br />
            <span className="text-mint">Together</span> & Grow<br />
            Together
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-slate-400">
            Your personal student portal to manage your classes, fees, progress, and everything in between - all in one place.
          </p>
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/signup" className="btn-primary min-w-56">Create Account</Link>
            <Link to="/login" className="btn-outline min-w-40">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="card min-h-44">
            <card.icon className="mb-6 text-mint" size={34} />
            <h2 className="text-xl font-bold">{card.title}</h2>
            <p className="mt-3 leading-7 text-slate-400">{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  </div>
);

export default Landing;
