import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronDown, Globe, LayoutGrid, FileText, Newspaper, MousePointerClick, Sparkles } from "lucide-react";
import type { Post } from "@/lib/mock-data";

const categories = [
  { id: "all", label: "Barcha", icon: Globe },
  { id: "web", label: "Web sayt", icon: LayoutGrid },
  { id: "portfolio", label: "Portfolio", icon: FileText },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "landing", label: "Landing", icon: MousePointerClick },
  { id: "other", label: "Boshqalar", icon: Sparkles },
];

const PAGE_SIZE = 16;

export default function SitesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"new" | "popular" | "likes">("new");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["sites-posts"],
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
        .map(p => ({ ...p, profiles: profiles?.find(pr => pr.user_id === p.user_id) || null }))
        .filter(p => !(p.profiles as any)?.is_banned) as Post[];
    },
  });

  const q = search.trim().toLowerCase();
  const filtered = posts.filter(p => {
    if (q && !(
      p.title.toLowerCase().includes(q) ||
      p.profiles?.firstname?.toLowerCase().includes(q) ||
      p.profiles?.lastname?.toLowerCase().includes(q) ||
      p.profiles?.username?.toLowerCase().includes(q)
    )) return false;
    if (category !== "all" && ((p as any).category || "other") !== category) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "likes") return (b.likes_count || 0) - (a.likes_count || 0);
    if (sort === "popular") return ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0));
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const shown = sorted.slice(0, visible);

  return (
    <div className="container py-6 pb-24 md:pb-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Barcha saytlar</h1>
        <p className="text-sm text-muted-foreground">Platformada joylangan barcha tasdiqlangan loyihalar</p>
      </header>

      <div className="surface-card p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Sayt nomi yoki muallif bo'yicha..."
            className="w-full h-11 rounded-xl border border-border bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map(c => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); setVisible(PAGE_SIZE); }}
                className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                  active ? "text-white shadow-md" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="surface-card overflow-hidden">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {shown.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
          </div>
          {visible < sorted.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisible(v => v + PAGE_SIZE)}
                className="h-11 px-6 rounded-xl bg-card border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Ko'proq yuklash ({sorted.length - visible})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Hech narsa topilmadi</p>
          <p className="text-sm mt-1">Boshqa filter yoki kalit so'z bilan urinib ko'ring</p>
        </div>
      )}
    </div>
  );
}