import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Globe, Heart, MessageCircle, TrendingUp, Calendar, BarChart3, Activity } from "lucide-react";
import StatsBar from "@/components/StatsBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function StatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats-page"],
    queryFn: async () => {
      const startWeek = daysAgo(7);
      const startMonth = daysAgo(30);
      const startToday = daysAgo(0);

      const [posts, likes, comments, todayPosts, weekPosts, monthPosts, topUsers, topGroupsData, topTeachers] = await Promise.all([
        supabase.from("posts").select("id, created_at").eq("status", "approved"),
        supabase.from("likes").select("id, created_at"),
        supabase.from("comments").select("id, created_at"),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", startToday),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", startWeek),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", startMonth),
        supabase.from("profiles").select("user_id, firstname, lastname, profile_image, likes_count").eq("is_banned", false).order("likes_count", { ascending: false }).limit(5),
        supabase.from("groups").select("id, name"),
        supabase.from("user_roles").select("user_id").eq("role", "teacher"),
      ]);

      // 7-day chart of new posts
      const days: { label: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        const c = (posts.data || []).filter(p => {
          const t = new Date(p.created_at).getTime();
          return t >= d.getTime() && t < next.getTime();
        }).length;
        days.push({ label: d.toLocaleDateString("uz-UZ", { weekday: "short" }), count: c });
      }

      const maxD = Math.max(1, ...days.map(d => d.count));

      // top groups: count members
      const groupIds = (topGroupsData.data || []).map(g => g.id);
      const { data: members } = groupIds.length
        ? await supabase.from("profiles").select("group_id").in("group_id", groupIds)
        : { data: [] as any[] };
      const topGroups = (topGroupsData.data || [])
        .map(g => ({ ...g, count: (members || []).filter((m: any) => m.group_id === g.id).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // top teachers by likes
      const teacherIds = (topTeachers.data || []).map(r => r.user_id);
      const { data: teacherProfiles } = teacherIds.length
        ? await supabase.from("profiles").select("user_id, firstname, lastname, profile_image, likes_count").in("user_id", teacherIds).order("likes_count", { ascending: false }).limit(5)
        : { data: [] as any[] };

      return {
        totalPosts: posts.data?.length || 0,
        totalLikes: likes.data?.length || 0,
        totalComments: comments.data?.length || 0,
        todayCount: todayPosts.count || 0,
        weekCount: weekPosts.count || 0,
        monthCount: monthPosts.count || 0,
        days,
        maxD,
        topUsers: topUsers.data || [],
        topGroups,
        topTeachers: teacherProfiles || [],
      };
    },
  });

  return (
    <div className="container py-6 pb-24 md:pb-10 space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <BarChart3 className="h-3.5 w-3.5" /> Statistika
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platforma statistikasi</h1>
        <p className="text-sm text-muted-foreground">Real vaqtli ma'lumotlar va o'sish ko'rsatkichlari</p>
      </header>

      <StatsBar />

      {/* Period cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: "Bugungi postlar", value: data?.todayCount ?? 0, color: "text-primary", bg: "bg-primary/10" },
          { icon: TrendingUp, label: "Haftalik o'sish", value: data?.weekCount ?? 0, color: "text-[hsl(258,89%,66%)]", bg: "bg-[hsl(258,89%,66%)]/10" },
          { icon: Activity, label: "Oylik postlar", value: data?.monthCount ?? 0, color: "text-[hsl(38,92%,50%)]", bg: "bg-[hsl(38,92%,50%)]/10" },
        ].map((s, i) => (
          <div key={s.label} className="surface-card p-5 flex items-center gap-4 hover-lift opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
            <div className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <div className="surface-card p-5">
        <h2 className="text-lg font-semibold mb-4">Oxirgi 7 kunlik postlar</h2>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="flex items-end justify-between gap-2 h-48">
            {data?.days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-xl transition-all duration-700 opacity-0 animate-fade-up"
                    style={{
                      height: `${(d.count / data.maxD) * 100}%`,
                      background: "var(--gradient-primary)",
                      minHeight: d.count > 0 ? "8px" : "2px",
                      animationDelay: `${i * 60}ms`,
                      animationFillMode: "forwards",
                    }}
                    title={`${d.count} post`}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">{d.label}</div>
                <div className="text-xs font-bold tabular-nums">{d.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Eng faol foydalanuvchilar</h3>
          </div>
          <div className="space-y-2">
            {(data?.topUsers || []).map((u: any, i: number) => (
              <Link key={u.user_id} to={`/profile?user=${u.user_id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <span className="inline-flex h-8 w-8 rounded-full overflow-hidden bg-accent">
                  {u.profile_image ? <img src={u.profile_image} alt="" className="h-full w-full object-cover" /> : <span className="h-full w-full flex items-center justify-center text-xs font-bold text-primary">{u.firstname?.[0]}</span>}
                </span>
                <span className="flex-1 text-sm font-medium truncate">{u.firstname} {u.lastname}</span>
                <span className="text-xs font-bold text-primary">{u.likes_count}</span>
              </Link>
            ))}
            {!data?.topUsers.length && <p className="text-sm text-muted-foreground text-center py-4">Ma'lumot yo'q</p>}
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-[hsl(258,89%,66%)]" />
            <h3 className="font-semibold">Eng faol guruhlar</h3>
          </div>
          <div className="space-y-2">
            {(data?.topGroups || []).map((g: any, i: number) => (
              <Link key={g.id} to={`/groups/${g.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <span className="flex-1 text-sm font-medium truncate">{g.name}</span>
                <span className="text-xs font-bold text-primary">{g.count} a'zo</span>
              </Link>
            ))}
            {!data?.topGroups.length && <p className="text-sm text-muted-foreground text-center py-4">Ma'lumot yo'q</p>}
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold">Eng yaxshi ustozlar</h3>
          </div>
          <div className="space-y-2">
            {(data?.topTeachers || []).map((t: any, i: number) => (
              <Link key={t.user_id} to={`/profile?user=${t.user_id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <span className="inline-flex h-8 w-8 rounded-full overflow-hidden bg-accent">
                  {t.profile_image ? <img src={t.profile_image} alt="" className="h-full w-full object-cover" /> : <span className="h-full w-full flex items-center justify-center text-xs font-bold text-primary">{t.firstname?.[0]}</span>}
                </span>
                <span className="flex-1 text-sm font-medium truncate">{t.firstname} {t.lastname}</span>
                <span className="text-xs font-bold text-primary">{t.likes_count}</span>
              </Link>
            ))}
            {!data?.topTeachers.length && <p className="text-sm text-muted-foreground text-center py-4">Ma'lumot yo'q</p>}
          </div>
        </div>
      </div>
    </div>
  );
}