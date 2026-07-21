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
    <div className="pb-24 md:pb-8">
      {/* HERO — asymmetric with mascot */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="container relative pt-10 pb-10 sm:pt-14 sm:pb-14">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-center">
            <div className="text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/80 backdrop-blur border border-primary/20 text-[12.5px] font-semibold text-primary opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
                <Sparkles className="h-3.5 w-3.5" /> RABOLA · Aqlli portfolio platformasi
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-extrabold tracking-tight leading-[1.02] opacity-0 animate-fade-up" style={{ animationDelay: "0.08s", animationFillMode: "forwards" }}>
                Loyihalaringizni <br className="hidden sm:block" />
                <span className="gradient-text">aqlli namoyish qiling.</span>
              </h1>
              <p className="max-w-xl text-[15px] text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: "0.16s", animationFillMode: "forwards" }}>
                Web-saytlaringizni joylang, hamjamiyat baholasin, reytingda yuqoriga chiqing. RABOLA — o'quvchi va dasturchilar uchun zamonaviy showcase.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 opacity-0 animate-fade-up" style={{ animationDelay: "0.24s", animationFillMode: "forwards" }}>
                <Link to="/add-post" className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-semibold text-primary-foreground shadow-[var(--shadow-lift)] active:scale-[0.97] transition-all" style={{ background: "var(--gradient-primary)" }}>
                  <Plus className="h-4 w-4" strokeWidth={2.6} /> Sayt joylash
                </Link>
                <Link to="/top" className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-semibold bg-card border border-primary/20 text-primary hover:bg-accent transition-all">
                  <TrendingUp className="h-4 w-4" /> Top reyting <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 via-transparent to-[hsl(var(--primary-glow))]/25 blur-3xl rounded-[3rem]" />
              <div className="relative rounded-[2rem] overflow-hidden border border-primary/15 bg-card shadow-[var(--shadow-lift)]">
                <img src={heroAsset.url} alt="RABOLA robot mascot" className="w-full h-auto object-cover" loading="eager" />
              </div>
              {/* Floating badges */}
              <div className="absolute -left-3 top-6 px-3 py-2 rounded-xl bg-card border border-primary/15 shadow-[var(--shadow-card)] text-xs font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary-glow))] animate-pulse" /> AI-powered
              </div>
              <div className="absolute -right-3 bottom-6 px-3 py-2 rounded-xl bg-card border border-primary/15 shadow-[var(--shadow-card)] text-xs font-semibold flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Real-time reyting
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="container mt-4">
        <StatsBar />
      </div>

      {/* SEARCH + FILTERS */}
      <div className="container mt-4 relative z-10">
        <div className="surface-card p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
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
      <section className="container mt-6 space-y-6">
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            "<span className="text-foreground font-medium">{searchQuery}</span>" bo'yicha {sortedPosts.length} ta natija
          </p>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="surface-card overflow-hidden">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {sortedPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">{posts.length === 0 ? "Hali loyihalar yo'q" : "Hech narsa topilmadi"}</p>
            <p className="text-sm mt-1">
              {posts.length === 0 ? "Birinchi bo'lib loyiha joylang!" : "Boshqa kalit so'z bilan qidirib ko'ring"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
