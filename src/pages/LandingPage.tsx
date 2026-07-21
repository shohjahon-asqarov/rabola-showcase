import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Code2,
  Users2,
  Trophy,
  Sparkles,
  CheckCircle2,
  Globe2,
  Heart,
  MessageSquare,
  ChevronRight,
  Laptop,
  GraduationCap,
  Star,
  UserCheck
} from "lucide-react";
import heroAsset from "@/assets/rabola-hero.png.asset.json";
import mascotAsset from "@/assets/rabola-mascot.png.asset.json";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import StatsBar from "@/components/StatsBar";

interface PostWithProfile {
  id: string;
  title: string;
  image: string;
  url: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    firstname: string;
    lastname: string;
    profile_image: string | null;
    username: string;
  } | null;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Fetch top trending projects to showcase real-time activity
  const { data: trendingPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ["trending-landing-posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .order("likes_count", { ascending: false })
        .limit(4);
      if (error) throw error;

      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, firstname, lastname, profile_image, username")
        .in("user_id", userIds);

      return postsData.map((p) => ({
        ...p,
        profiles: profiles?.find((pr) => pr.user_id === p.user_id) || null,
      })) as PostWithProfile[];
    },
  });

  return (
    <div className="relative min-h-screen bg-background font-sans antialiased">
      {/* Premium Ambient Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-primary/8 blur-[80px] sm:blur-[120px]" />
        <div className="absolute top-[15%] right-[5%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-cyan-500/8 blur-[70px] sm:blur-[110px]" />
      </div>

      {/* HERO SECTION - Premium Grid Layout */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

            {/* Left Hero Text Block */}
            <div className="space-y-6 sm:space-y-8 text-left max-w-2xl lg:max-w-none opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>

              {/* Premium Glow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                RABOLA — Kelajak dasturchilari maskani
              </div>

              {/* Main Elegant Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-foreground">
                O'z loyihalaringizni <br />
                <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  oltindek namoyish qiling!
                </span>
              </h1>

              {/* High-quality Description */}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
                RABOLA — dasturchilar va talabalar uchun eng ilg'or portfolio va reyting platformasi. Saytlaringizni yuklang, real foydalanuvchilar bahosini oling va reyting cho'qqisini zabt eting.
              </p>

              {/* Action Buttons with Standard Heights */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/feed"
                  className="group inline-flex h-12 sm:h-14 items-center justify-center gap-3 rounded-2xl px-8 text-base font-bold text-white shadow-lg hover:shadow-xl hover:shadow-primary/15 transition-all duration-300"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Loyihalarni ko'rish
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-8 text-base font-bold text-foreground hover:bg-accent hover:border-primary/40 transition-all duration-300"
                  >
                    Hamjamiyatga qo'shilish
                  </Link>
                )}
              </div>

              {/* Core Feature Checklist */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 pt-6 border-t border-border max-w-xl">
                {[
                  "Tekshirilgan loyihalar",
                  "Jonli reyting tizimi",
                  "Guruhlar va mentorlar",
                  "AI-Powered Moderatsiya"
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Hero Mockup Browser Box */}
            <div className="relative lg:block opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/20 to-cyan-500/20 blur-2xl opacity-60 pointer-events-none" />

              {/* Perfect Pixel Browser Mockup Container */}
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl transition-all duration-500 hover:scale-[1.01]">

                {/* Standard Browser Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/90" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/90" />
                    <span className="h-3 w-3 rounded-full bg-green-500/90" />
                  </div>
                  <div className="h-6 w-48 rounded-md bg-muted/60 border border-border/40 flex items-center justify-center text-[11px] text-muted-foreground font-medium">
                    rabola.uz/showcase
                  </div>
                  <div className="w-10" />
                </div>

                {/* Simulated Web Application Display */}
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="relative rounded-xl overflow-hidden group shadow-md aspect-[16/10] bg-muted flex items-center justify-center border border-border">
                    {heroAsset.url ? (
                      <img
                        src={heroAsset.url}
                        alt="RABOLA Hero Illustration"
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center">
                        <Code2 className="h-12 w-12 text-primary/30 animate-pulse" />
                      </div>
                    )}

                    {/* Embedded mascot badge */}
                    <div className="absolute bottom-4 right-4 h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-card border border-border/80 p-1.5 shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '5s' }}>
                      <img src={mascotAsset.url} alt="RABOLA Mascot" className="h-full w-full object-contain" />
                    </div>
                  </div>

                  {/* Standardized Information Structure */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Haftalik eng yaxshi loyiha</span>
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        <Trophy className="h-3.5 w-3.5" /> Top #1
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Sirkulyar E-Commerce Dashboard</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Next.js, TailwindCSS va Supabase yordamida yaratilgan, animatsiyalar bilan to'ldirilgan premium admin panel.
                    </p>

                    {/* Author Details and Stats bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">S</span>
                        <span className="text-xs font-bold">Sardor M.</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> 142
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> 24
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* STATS BAR SECTION - Standard spacing */}
      <section className="py-12 border-y border-border bg-muted/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Platforma raqamlarda</h3>
            <p className="text-sm text-muted-foreground">Bizning dasturchilar hamjamiyatimiz kundan-kunga o'sib bormoqda</p>
          </div>
          <StatsBar />
        </div>
      </section>

      {/* BENTO GRID - Clean 3-Column Standard Spaced Grid */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Nega RABOLA?</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Karyerangiz va portfoliongizni <br />
              <span className="gradient-text">yangi darajaga olib chiqing</span>
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Dasturlash sirlarini o'rganish, topshiriqlar topshirish va tayyor ishlanmalarni namoyish etish har qachongidan osonroq.
            </p>
          </div>

          {/* Standard Responsive Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Card 1: 2-Cols Large featured card on desktop */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-extrabold text-foreground">Professional Portfolio va Galereya</h4>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Yaratgan web-saytlaringizni yuqori aniqlikdagi skrinshotlar, havolalar, to'liq tavsif va ishlatilgan texnologiyalar bilan birga chiroyli va qulay tartibda taqdim eting. Mijozlar va ish beruvchilar uchun tayyor portfolio!
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-primary font-bold text-sm">
                Loyihalarni ko'rib chiqish <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 2: Small Card (Likes & Comments) */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Heart className="h-6 w-6 text-rose-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-foreground">Hamjamiyat Bahosi</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Boshqa dasturchilar loyihalaringizga layk bosib, professional sharhlar qoldirib, rivojlanishingizga va xatolaringizni tuzatishingizga yordam berishadi.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Small Card (Leaderboards) */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-foreground">Top Reyting va G'oliblik</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Haftalik va oylik reytingda eng ko'p baholangan birinchi o'rinlarni egallang va o'z ismingizni peshqadamlar jadvaliga yozdiring.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: 2-Cols Mentorship description */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Users2 className="h-6 w-6 text-cyan-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-extrabold text-foreground">Ustozlar va Guruhlar bilan o'sish</h4>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    IT markazlar va ustozlar maxsus o'quv guruhlari yaratishi mumkin. O'quvchilar ushbu guruhlarga a'zo bo'lib, o'zaro raqobat muhitida birgalikda o'rganadilar va loyihalarini mentorlar nazoratida topshiradilar.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                Guruhlar bilan tanishish <ChevronRight className="h-4 w-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TRENDING PROJECTS SHOWCASE SECTION - Standard padded layout */}
      <section className="py-20 sm:py-28 bg-muted/15 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="space-y-3 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Trending loyihalar
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground">
                Hamjamiyatning eng sara saytlari
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                O'quvchilar va professional dasturchilar tomonidan joylanayotgan eng ommabop va chiroyli dizaynlar.
              </p>
            </div>
            <Link
              to="/feed"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-card border border-border px-5 text-sm font-semibold hover:bg-accent transition-all shrink-0"
            >
              Barcha loyihalar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Dynamic Grid using aspect ratios */}
          {isPostsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse h-72" />
              ))}
            </div>
          ) : trendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {trendingPosts.map((post) => (
                <div key={post.id} className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden border-b border-border">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur text-[9px] font-bold text-white uppercase tracking-wider">
                        Web sayt
                      </div>
                    </div>

                    {/* Content details */}
                    <div className="p-4 space-y-2.5 text-left">
                      <h4 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>

                      {/* Creator */}
                      <div className="flex items-center gap-2">
                        <div className="h-5.5 w-5.5 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                          {post.profiles?.profile_image ? (
                            <img src={post.profiles.profile_image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-primary">{post.profiles?.firstname?.[0]}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {post.profiles ? `${post.profiles.firstname} ${post.profiles.lastname?.[0]}.` : "Dasturchi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="p-4 border-t border-border flex items-center justify-between text-xs bg-muted/10">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                    >
                      <Globe2 className="h-3.5 w-3.5" /> Saytga o'tish
                    </a>
                    <div className="flex items-center gap-2.5 text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> {post.comments_count}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-medium">
              Hozircha ommabop loyihalar mavjud emas. Birinchi bo'lib joylang!
            </div>
          )}

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Qadamlar</h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Hammasi juda oddiy va tezkor
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Platformadan samarali foydalanish va reyting cho'qqisiga chiqish uchun 3 ta asosiy qadam.
            </p>
          </div>

          {/* Grid Layout spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto relative">

            <div className="hidden sm:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-border -z-10" />

            {[
              {
                step: "01",
                title: "Hisob oching",
                desc: "Tez va osonlik bilan ro'yxatdan o'ting, o'z profil ma'lumotlaringizni to'ldiring hamda o'zingizga mos guruhni tanlang."
              },
              {
                step: "02",
                title: "Loyiha yuklang",
                desc: "Ishlaringiz havolasini, rasmlari va qisqacha tavsifini yuklang. AI va moderatorlarimiz uni tezda tekshirib tasdiqlaydi."
              },
              {
                step: "03",
                title: "Reytingda o'sing",
                desc: "Hamjamiyat a'zolari bilan muloqot qiling, loyihalarni baholang va reyting tizimida yuqori pog'onalarga ko'tariling."
              },
            ].map((s, idx) => (
              <div key={s.step} className="flex flex-col items-center text-center space-y-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                  style={{ background: idx === 1 ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "var(--gradient-primary)" }}
                >
                  {s.step}
                </div>
                <h4 className="text-lg font-extrabold text-foreground">{s.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* MENTORSHIP & ACADEMIES SECTION */}
      <section className="py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <GraduationCap className="h-4 w-4" /> Ustozlar va IT Akademiyalar uchun
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Talabalaringiz rivojlanishini nazorat qiling
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                RABOLA faqatgina portfolio sayti emas. Bu ustozlarga dars guruhlarini tashkil qilish, o'quvchilarga topshiriqlar berish va ularning real loyihalari asosida amaliy ko'nikmalarini baholash imkonini beruvchi ta'limiy eko-tizimdir.
              </p>

              <ul className="space-y-3 pt-2">
                {[
                  "Osonlik bilan yangi dars guruhlari va kurslarni yaratish",
                  "Talabalar topshirgan ishlarni real-time tartibda ko'rib chiqish",
                  "Akademiyadagi jami o'quvchilar reytingini avtomatik yuritish",
                  "O'quvchilar portfolio portfoliosini tayyor shakllantirib borish"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm font-semibold text-foreground">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <UserCheck className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  to="/groups"
                  className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Guruhlarni ko'rish <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Illustrative Group leaderboard */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/15 to-cyan-400/15 blur-2xl rounded-2xl opacity-60 pointer-events-none" />
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Users2 className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-sm sm:text-base">"Najot Ta'lim - N68" guruhi</h4>
                      <p className="text-xs text-muted-foreground">O'quvchilar soni: 18 ta</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[11px]">Faol</span>
                </div>

                <div className="space-y-2">
                  {[
                    { name: "Asilbek Olimov", projects: 6, score: 320, rank: 1, color: "text-amber-500" },
                    { name: "Zuhra Karimova", projects: 5, score: 285, rank: 2, color: "text-slate-400" },
                    { name: "Behruz Jalilov", projects: 4, score: 210, rank: 3, color: "text-amber-700" }
                  ].map((st) => (
                    <div key={st.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`font-black text-sm w-4 ${st.color}`}>#{st.rank}</span>
                        <div className="text-left">
                          <p className="font-bold">{st.name}</p>
                          <p className="text-[10px] text-muted-foreground">{st.projects} ta loyiha</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-foreground">{st.score} layk</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">

          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Savol va Javoblar</h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Tez-tez so'raladigan savollar
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              RABOLA platformasi haqida o'zingizni qiziqtirgan eng keng tarqalgan savollarga javob oling.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <Accordion type="single" collapsible className="w-full text-left space-y-2">
              {[
                {
                  q: "RABOLA platformasi kimlar uchun mo'ljallangan?",
                  a: "Platformamiz birinchi navbatda dasturlashni boshlayotgan o'quvchilar, maktab va akademiya talabalari hamda o'z loyihalarini namoyish etib portfolio yaratishni istagan barcha dasturchilar uchun mo'ljallangan."
                },
                {
                  q: "Loyihamni saytga joylashtirsam hamma ko'ra oladimi?",
                  a: "Ha, siz joylashtirgan loyihalar dastlab moderatorlarimiz tomonidan tekshiriladi. Sifatli va real sayt ekanligi tasdiqlangach, u darhol bosh sahifadagi galereyaga tushadi va hamma uchun ko'rinadi."
                },
                {
                  q: "Reyting qanday hisoblanadi va uning foydasi nima?",
                  a: "Foydalanuvchilar sizning loyihalaringizga layk bosishi orqali reyting ballingiz oshib boradi. Yuqori reytingdagi foydalanuvchilar yetakchilar jadvalining yuqori qismidan joy oladi, bu esa ularga ko'proq ish takliflari va IT kompaniyalar e'tiborini tortish imkonini beradi."
                },
                {
                  q: "Ustozlar guruhni qanday yaratishadi va bu qanday ishlaydi?",
                  a: "Bizning ma'murlar tomonidan 'ustoz' yoki 'moderator' roli berilgan hisob egalari bemalol guruhlar yaratib, unga dars o'tadigan o'quvchilarni qo'shishlari va o'quvchilarni tizimli baholab borishlari mumkin."
                },
              ].map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border last:border-b-0 py-1">
                  <AccordionTrigger className="text-sm sm:text-base font-extrabold hover:text-primary transition-colors text-foreground">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </section>

      {/* PREMIUM CALL TO ACTION (CTA) BANNER */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary via-blue-900 to-indigo-950 py-16 px-6 sm:px-12 text-center shadow-2xl">

            {/* CTA Ambient light effects */}
            <div className="absolute top-0 left-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                O'z loyihalaringiz bilan dunyoni hayratda qoldiring!
              </h2>
              <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto font-medium leading-relaxed opacity-90">
                Bugunoq ro'yxatdan o'ting, birinchi loyihangizni joylashtiring va o'zbekistonlik eng kuchli dasturchilar hamjamiyatidan joy oling.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/auth"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-primary hover:bg-blue-50 hover:scale-103 transition-all duration-300 shadow-lg"
                >
                  Hozir qo'shilish <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/feed"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-8 text-sm font-semibold text-white hover:bg-white/15 transition-all"
                >
                  Platformani o'rganish
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
