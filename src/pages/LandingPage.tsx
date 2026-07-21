import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Code, Users, Trophy, Sparkles } from "lucide-react";
import heroAsset from "@/assets/rabola-hero.png.asset.json";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-7rem)]" style={{ background: "var(--gradient-hero)" }}>
      <section className="container pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/80 backdrop-blur border border-primary/20 text-primary text-[13px] font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> RABOLA · Aqlli platforma
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.02]">
              Loyihalaringizni <br />
              <span className="gradient-text">aqlli namoyish qiling.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              RABOLA — dasturchilar uchun zamonaviy portfolio va reyting platformasi. Web-loyihalaringizni joylang, ilhomlaning, va hamjamiyat ichida yuqoriga chiqing.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link to="/feed" className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-lift)] active:scale-[0.97] transition-all" style={{ background: "var(--gradient-primary)" }}>
                Loyihalarni ko'rish <ArrowRight className="h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Link to="/auth" className="inline-flex h-12 items-center gap-2 rounded-xl border border-primary/25 bg-card px-6 text-base font-semibold text-primary hover:bg-accent transition-all active:scale-[0.97]">
                  Ro'yxatdan o'tish
                </Link>
              )}
            </div>
          </div>
          <div className="relative opacity-0 animate-fade-up hidden lg:block" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/15 to-[hsl(var(--primary-glow))]/25 blur-3xl" />
            <div className="relative rounded-[2rem] overflow-hidden border border-primary/15 bg-card shadow-[var(--shadow-lift)]">
              <img src={heroAsset.url} alt="RABOLA mascot with a developer" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Code, title: "Loyihalarni joylang", desc: "O'z saytlaringizni platformaga joylang va boshqalar bilan baham ko'ring" },
            { icon: Users, title: "Guruhda ishlang", desc: "Ustozlar guruhlar ochadi, o'quvchilar birgalikda o'sadi" },
            { icon: Trophy, title: "Eng yaxshilar", desc: "Eng ko'p layk olgan loyihalar trending bo'limida ko'rinadi" },
          ].map((f, i) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 space-y-3 opacity-0 animate-fade-up hover-lift" style={{ animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: "forwards" }}>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
