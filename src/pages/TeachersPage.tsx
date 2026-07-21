import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search, GraduationCap, Users, Heart, Star, Award, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Teacher {
  user_id: string;
  firstname: string;
  lastname: string;
  username: string;
  profile_image: string | null;
  numeric_id: number;
  likes_count: number;
  posts_count: number;
  students_count: number;
  rating: number;
}

export default function TeachersPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"likes" | "students" | "posts">("likes");

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "teacher");
      if (rErr) throw rErr;
      const ids = (roles || []).map(r => r.user_id);
      if (!ids.length) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, firstname, lastname, username, profile_image, numeric_id, likes_count, is_banned")
        .in("user_id", ids)
        .eq("is_banned", false);

      const { data: groups } = await supabase
        .from("groups")
        .select("id, teacher_id")
        .in("teacher_id", ids);

      const groupIds = (groups || []).map(g => g.id);
      const { data: students } = groupIds.length
        ? await supabase.from("profiles").select("user_id, group_id").in("group_id", groupIds)
        : { data: [] as any[] };

      const { data: posts } = await supabase
        .from("posts")
        .select("user_id")
        .in("user_id", ids)
        .eq("status", "approved");

      const result: Teacher[] = (profiles || []).map(p => {
        const myGroups = (groups || []).filter(g => g.teacher_id === p.user_id).map(g => g.id);
        const myStudents = (students || []).filter((s: any) => myGroups.includes(s.group_id)).length;
        const myPosts = (posts || []).filter(x => x.user_id === p.user_id).length;
        const rating = Math.min(5, 3 + (p.likes_count || 0) / 50);
        return {
          user_id: p.user_id,
          firstname: p.firstname,
          lastname: p.lastname,
          username: p.username,
          profile_image: p.profile_image,
          numeric_id: p.numeric_id,
          likes_count: p.likes_count || 0,
          posts_count: myPosts,
          students_count: myStudents,
          rating: Math.round(rating * 10) / 10,
        };
      });
      return result;
    },
  });

  const q = search.trim().toLowerCase();
  const filtered = teachers.filter(t =>
    !q || t.firstname?.toLowerCase().includes(q) || t.lastname?.toLowerCase().includes(q) || t.username?.toLowerCase().includes(q)
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "students") return b.students_count - a.students_count;
    if (sort === "posts") return b.posts_count - a.posts_count;
    return b.likes_count - a.likes_count;
  });
  const topId = sorted[0]?.user_id;

  return (
    <div className="container py-6 pb-24 md:pb-10 space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <GraduationCap className="h-3.5 w-3.5" /> Ustozlar
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Eng yaxshi ustozlar</h1>
        <p className="text-sm text-muted-foreground">Platformadagi barcha ustozlar reytingi va faoliyati</p>
      </header>

      <div className="surface-card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ustoz ismi yoki username..."
            className="w-full h-11 rounded-xl border border-border bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="h-11 appearance-none rounded-xl border border-border bg-card pl-4 pr-9 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="likes">Layklar bo'yicha</option>
            <option value="students">O'quvchilar soni</option>
            <option value="posts">Loyihalar soni</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : sorted.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((t, i) => (
            <Link
              key={t.user_id}
              to={`/profile?user=${t.user_id}`}
              className="surface-card p-5 hover-lift opacity-0 animate-fade-up relative overflow-hidden"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms`, animationFillMode: "forwards" }}
            >
              {t.user_id === topId && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
                  <Award className="h-3 w-3" /> Eng yaxshi
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex h-14 w-14 rounded-2xl overflow-hidden bg-accent shrink-0 ring-2 ring-primary/20">
                  {t.profile_image ? (
                    <img src={t.profile_image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="h-full w-full flex items-center justify-center text-primary font-bold">
                      {t.firstname?.[0]}{t.lastname?.[0] || ""}
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-bold truncate">{t.firstname} {t.lastname}</p>
                  <p className="text-xs text-muted-foreground truncate">@{t.username} · #{t.numeric_id}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-[hsl(38,92%,50%)] font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" /> {t.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 p-2">
                  <div className="text-sm font-bold flex items-center justify-center gap-1"><Users className="h-3 w-3 text-primary" />{t.students_count}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">O'quvchi</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-2">
                  <div className="text-sm font-bold">{t.posts_count}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Loyiha</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-2">
                  <div className="text-sm font-bold flex items-center justify-center gap-1"><Heart className="h-3 w-3 text-destructive" />{t.likes_count}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Layk</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">Ustozlar topilmadi</div>
      )}
    </div>
  );
}