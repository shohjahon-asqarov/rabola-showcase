import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Medal, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TopUser {
  user_id: string;
  firstname: string;
  lastname: string;
  username: string;
  profile_image: string | null;
  likes_count: number;
}

const podiumConfig = [
  {
    place: 2,
    icon: Medal,
    height: "h-24 sm:h-28",
    avatarSize: "h-16 w-16 sm:h-20 sm:w-20",
    ringColor: "ring-[hsl(var(--muted-foreground)/0.4)]",
    bgGradient: "from-[hsl(220,13%,90%)] to-[hsl(220,13%,96%)]",
    badgeBg: "bg-[hsl(220,13%,85%)]",
    badgeText: "text-foreground",
    label: "2-o'rin",
    iconColor: "text-muted-foreground",
    order: "order-1 sm:order-1",
  },
  {
    place: 1,
    icon: Crown,
    height: "h-32 sm:h-36",
    avatarSize: "h-20 w-20 sm:h-24 sm:w-24",
    ringColor: "ring-[hsl(38,92%,50%)]",
    bgGradient: "from-[hsl(38,92%,50%/0.15)] to-[hsl(38,92%,50%/0.05)]",
    badgeBg: "bg-[hsl(38,92%,50%)]",
    badgeText: "text-[hsl(var(--warning-foreground))]",
    label: "1-o'rin",
    iconColor: "text-[hsl(38,92%,50%)]",
    order: "order-0 sm:order-2",
  },
  {
    place: 3,
    icon: Trophy,
    height: "h-20 sm:h-24",
    avatarSize: "h-14 w-14 sm:h-18 sm:w-18",
    ringColor: "ring-[hsl(25,60%,55%)]",
    bgGradient: "from-[hsl(25,60%,55%/0.15)] to-[hsl(25,60%,55%/0.05)]",
    badgeBg: "bg-[hsl(25,60%,55%)]",
    badgeText: "text-[hsl(var(--warning-foreground))]",
    label: "3-o'rin",
    iconColor: "text-[hsl(25,60%,55%)]",
    order: "order-2 sm:order-3",
  },
];

export default function Top3Leaderboard() {
  const { data: topUsers = [], isLoading } = useQuery({
    queryKey: ["top3-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, firstname, lastname, username, profile_image, likes_count")
        .eq("is_banned", false)
        .order("likes_count", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []) as TopUser[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-end gap-4 py-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (topUsers.length === 0) return null;

  // Reorder: [2nd, 1st, 3rd] for podium display
  const ordered = [topUsers[1], topUsers[0], topUsers[2]].filter(Boolean);

  return (
    <section className="opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-[hsl(38,92%,50%)]" />
        <h2 className="text-xl font-semibold">Top reyting</h2>
      </div>

      <div className="flex justify-center items-end gap-3 sm:gap-6">
        {ordered.map((user, idx) => {
          const actualPlace = idx === 1 ? 0 : idx === 0 ? 1 : 2;
          const config = podiumConfig[actualPlace];
          const Icon = config.icon;

          return (
            <div
              key={user.user_id}
              className={`flex flex-col items-center ${config.order}`}
            >
              {/* Icon */}
              <div className={`mb-2 ${config.iconColor}`}>
                <Icon className={actualPlace === 0 ? "h-7 w-7 sm:h-8 sm:w-8" : "h-5 w-5 sm:h-6 sm:w-6"} />
              </div>

              {/* Avatar */}
              <div className="relative mb-3">
                <div className={`${config.avatarSize} rounded-full ring-4 ${config.ringColor} overflow-hidden shadow-lg`}>
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.firstname}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-lg sm:text-xl font-bold text-primary">
                      {user.firstname?.[0]}{user.lastname?.[0] || ""}
                    </div>
                  )}
                </div>
                {/* Place badge */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${config.badgeBg} ${config.badgeText} rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-md`}>
                  {config.place}
                </div>
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-foreground text-center max-w-[90px] sm:max-w-[120px] truncate">
                {user.firstname} {user.lastname?.[0] || ""}. 
              </p>

              {/* Podium bar */}
              <div className={`mt-2 w-20 sm:w-24 ${config.height} rounded-t-xl bg-gradient-to-t ${config.bgGradient} border border-border border-b-0 flex flex-col items-center justify-center gap-1`}>
                <span className="text-lg sm:text-2xl font-bold text-foreground">{user.likes_count}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">layk</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
