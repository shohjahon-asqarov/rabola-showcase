import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Top3Leaderboard from "@/components/Top3Leaderboard";
import { Link } from "react-router-dom";

interface TopUser {
  user_id: string;
  firstname: string;
  lastname: string;
  username: string;
  profile_image: string | null;
  likes_count: number;
  numeric_id: number;
}

export default function TopRatingPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["top-users-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, firstname, lastname, username, profile_image, likes_count, numeric_id")
        .eq("is_banned", false)
        .order("likes_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as TopUser[];
    },
  });

  return (
    <div className="container py-8 space-y-10 pb-24 md:pb-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Trophy className="h-4 w-4" /> Top reyting
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold">Eng faol foydalanuvchilar</h1>
        <p className="text-muted-foreground text-sm">Umumiy layklar soni bo'yicha reyting</p>
      </div>

      <Top3Leaderboard />

      <div className="surface-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">To'liq reyting</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {users.map((u, i) => (
              <Link
                key={u.user_id}
                to={`/profile?user=${u.user_id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  i < 3 ? "text-white shadow-md" : "bg-muted text-muted-foreground"
                }`} style={i < 3 ? { background: "var(--gradient-primary)" } : undefined}>
                  {i + 1}
                </span>
                <span className="inline-flex h-10 w-10 rounded-full overflow-hidden bg-accent shrink-0">
                  {u.profile_image ? (
                    <img src={u.profile_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="h-full w-full flex items-center justify-center text-sm font-semibold text-primary">
                      {u.firstname?.[0]}{u.lastname?.[0] || ""}
                    </span>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.firstname} {u.lastname}</p>
                  <p className="text-xs text-muted-foreground truncate">@{u.username} · #{u.numeric_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{u.likes_count}</p>
                  <p className="text-[10px] text-muted-foreground">layk</p>
                </div>
              </Link>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Hozircha foydalanuvchilar yo'q</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}