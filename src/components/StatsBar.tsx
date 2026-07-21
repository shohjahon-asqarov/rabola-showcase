import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Globe, Heart, MessageCircle } from "lucide-react";

function useCounter(target: number, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf: number;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export default function StatsBar() {
  const { data } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [users, posts, likes, comments] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("likes").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
      ]);
      return {
        users: users.count || 0,
        posts: posts.count || 0,
        likes: likes.count || 0,
        comments: comments.count || 0,
      };
    },
  });

  const items = [
    { icon: Users, label: "Foydalanuvchilar", value: useCounter(data?.users || 0), color: "text-primary", bg: "bg-primary/10" },
    { icon: Globe, label: "Joylangan saytlar", value: useCounter(data?.posts || 0), color: "text-[hsl(258,89%,66%)]", bg: "bg-[hsl(258,89%,66%)]/10" },
    { icon: Heart, label: "Layklar", value: useCounter(data?.likes || 0), color: "text-destructive", bg: "bg-destructive/10" },
    { icon: MessageCircle, label: "Kommentlar", value: useCounter(data?.comments || 0), color: "text-[hsl(38,92%,50%)]", bg: "bg-[hsl(38,92%,50%)]/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {items.map((s, i) => (
        <div
          key={s.label}
          className="surface-card p-4 sm:p-5 flex items-center gap-3 hover-lift opacity-0 animate-fade-up"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
        >
          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
            <s.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-extrabold tracking-tight tabular-nums leading-none">{s.value.toLocaleString()}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}