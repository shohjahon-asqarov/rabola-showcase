import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Search, Plus, Globe, LayoutGrid, FileText, Newspaper, MousePointerClick, Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import StatsBar from "@/components/StatsBar";
import type { Post, Profile } from "@/lib/mock-data";
import heroAsset from "@/assets/rabola-hero.png.asset.json";

const categories = [
  { id: "all", label: "Barcha", icon: Globe },
  { id: "web", label: "Web sayt", icon: LayoutGrid },
  { id: "portfolio", label: "Portfolio", icon: FileText },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "landing", label: "Landing", icon: MousePointerClick },
  { id: "other", label: "Boshqalar", icon: Sparkles },
];

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"new" | "popular" | "likes">("new");
  const searchQuery = localSearch.trim().toLowerCase();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      return postsData
        .map(p => ({
          ...p,
          profiles: profiles?.find(pr => pr.user_id === p.user_id) || null,
        }))
        .filter(p => !(p.profiles as any)?.is_banned) as Post[];
    },
  });

  const { data: groupsCount = 0 } = useQuery({
    queryKey: ["groups-count"],
    queryFn: async () => {
      const { count } = await supabase.from("groups").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const filteredPosts = searchQuery
    ? posts.filter(
        p =>
          p.title.toLowerCase().includes(searchQuery) ||
          p.profiles?.firstname?.toLowerCase().includes(searchQuery) ||
          p.profiles?.lastname?.toLowerCase().includes(searchQuery) ||
          p.profiles?.username?.toLowerCase().includes(searchQuery)
      )
    : posts;

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === "likes") return (b.likes_count || 0) - (a.likes_count || 0);
    if (sort === "popular") return ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0));
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="pb-24 md:pb-8 relative min-h-screen bg-background font-sans antialiased">
      {/* Premium Ambient Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[5%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-primary/8 blur-[80px] sm:blur-[110px]" />
        <div className="absolute top-[15%] right-[5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-cyan-500/8 blur-[70px] sm:blur-[100px]" />
      </div>

      {/* HERO — asymmetric with mascot */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">

            {/* Left Hero Texts */}
            <div className="text-left space-y-6 sm:space-y-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                RABOLA · Aqlli portfolio platformasi
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
                Loyihalaringizni <br />
                <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  aqlli namoyish qiling!
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Web-saytlaringizni joylang, hamjamiyat baholasin, reytingda yuqoriga chiqing. RABOLA — o'quvchi va dasturchilar uchun zamonaviy showcase va interaktiv portfolio maydoni.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/add-post"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:shadow-primary/15 transition-all duration-300"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Plus className="h-5 w-5" strokeWidth={2.6} />
                  Sayt joylash
                </Link>
                <Link
                  to="/top"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-8 text-sm font-bold text-foreground hover:bg-accent hover:border-primary/40 transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Top reyting
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="relative hidden lg:block opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/15 to-cyan-500/15 blur-2xl opacity-60 pointer-events-none" />

              {/* Browser window representation with high quality illustrative fallback image */}
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/90" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/90" />
                    <span className="h-3 w-3 rounded-full bg-green-500/90" />
                  </div>
                  <div className="h-6 w-48 rounded-md bg-muted/60 border border-border/40 flex items-center justify-center text-[11px] text-muted-foreground font-medium">
                    rabola.uz/feed
                  </div>
                  <div className="w-10" />
                </div>
                <div className="p-4 bg-muted/10">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80"
                    alt="RABOLA feed preview"
                    className="w-full h-auto rounded-xl object-cover shadow border border-border"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Floating interactive metrics */}
              <div className="absolute -left-4 top-10 px-4 py-2.5 rounded-xl bg-card/90 backdrop-blur-sm border border-border/80 shadow-lg text-xs font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> AI-Moderated
              </div>
              <div className="absolute -right-4 bottom-10 px-4 py-2.5 rounded-xl bg-card/90 backdrop-blur-sm border border-border/80 shadow-lg text-xs font-bold flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Real-time reytinglar
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS BAR SECTION */}
      <section className="py-10 border-y border-border bg-muted/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatsBar />
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 shadow-sm">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Sayt nomi yoki kalit so'z bilan qidirish..."
              className="w-full h-11 rounded-xl border border-border bg-background pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {categories.map(c => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                    active
                      ? "text-white shadow-md"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  style={active ? { background: "var(--gradient-primary)" } : undefined}
                >
                  <c.icon className="h-3.5 w-3.5" /> {c.label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="h-10 appearance-none rounded-xl border border-border bg-card pl-4 pr-9 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="new">Yangi avval</option>
              <option value="popular">Eng mashhur</option>
              <option value="likes">Eng ko'p layk</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            "<span className="text-foreground font-medium">{searchQuery}</span>" bo'yicha {sortedPosts.length} ta natija
          </p>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {sortedPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-border rounded-2xl p-8 max-w-xl mx-auto">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{posts.length === 0 ? "Hali loyihalar yo'q" : "Hech narsa topilmadi"}</p>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {posts.length === 0 ? "Birinchi bo'lib loyiha joylang!" : "Boshqa kalit so'z bilan qidirib ko'ring"}
            </p>
            {posts.length === 0 && (
              <Link to="/add-post" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white mt-5 hover:bg-primary/90">
                Loyiha joylash
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
