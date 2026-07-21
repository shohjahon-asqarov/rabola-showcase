import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Bell, CheckCheck, MessageCircle, FileText, Users, AlertTriangle, Clock } from "lucide-react";

const typeIcons: Record<string, any> = {
  new_post: FileText,
  post_approved: FileText,
  post_rejected: FileText,
  support_reply: MessageCircle,
  group_invite: Users,
  default: Bell,
};

const typeColors: Record<string, string> = {
  post_approved: "bg-primary/10 text-primary",
  post_rejected: "bg-destructive/10 text-destructive",
  new_post: "bg-warning/10 text-warning",
  support_reply: "bg-accent text-accent-foreground",
  group_invite: "bg-primary/10 text-primary",
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["all-notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  if (!isAuthenticated) return <Navigate to="/auth" />;

  const unread = notifications.filter((n: any) => !n.is_read).length;

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true } as any).eq("user_id", user!.id).eq("is_read", false);
    refetch();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Hozir";
    if (mins < 60) return `${mins} daqiqa oldin`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} soat oldin`;
    return `${Math.floor(hours / 24)} kun oldin`;
  };

  return (
    <div className="container py-6 sm:py-8 max-w-3xl px-4 sm:px-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Bildirishnomalar markazi
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">{unread} o'qilmagan</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Akademik faoliyatingizga doir barcha yangiliklar va xabarlar.</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted transition-colors">
            <CheckCheck className="h-4 w-4" /> Barchasini o'qilgan deb belgilash
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n: any) => {
          const Icon = typeIcons[n.type] || typeIcons.default;
          const color = typeColors[n.type] || "bg-muted text-muted-foreground";
          return (
            <div key={n.id} className={`rounded-xl border bg-card p-4 flex gap-4 transition-all ${!n.is_read ? "border-primary/30 bg-primary/[0.02]" : "border-border"}`}>
              <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{n.title}</h3>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {timeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Batafsil ko'rish</button>
                  {!n.is_read && (
                    <button
                      onClick={async () => { await supabase.from("notifications").update({ is_read: true } as any).eq("id", n.id); refetch(); }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      O'qilgan deb belgilash
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Hali bildirishnomalar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}
