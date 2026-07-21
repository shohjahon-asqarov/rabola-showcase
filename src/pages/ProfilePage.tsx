import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/PostCard";
import SupportRequestForm from "@/components/SupportRequestForm";
import { roleLabels, roleColors, type Post } from "@/lib/mock-data";
import { Heart, FileText, Users, Hash, Pencil, Clock, CheckCircle, XCircle, MessageSquare, Plus } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, role, isAuthenticated, loading } = useAuth();

  const { data: userPosts = [] } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return (data || []).map(p => ({ ...p, profiles: profile })) as Post[];
    },
    enabled: !!user,
  });

  const { data: userGroup } = useQuery({
    queryKey: ["user-group", profile?.group_id],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").eq("id", profile!.group_id!).single();
      return data;
    },
    enabled: !!profile?.group_id,
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-support-requests", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("support_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return <div className="p-16 text-center"><span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /></div>;
  if (!isAuthenticated || !profile) return <Navigate to="/auth" />;

  const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
    pending: { icon: Clock, label: "Kutilmoqda", color: "bg-warning/10 text-warning" },
    approved: { icon: CheckCircle, label: "Tasdiqlandi", color: "bg-primary/10 text-primary" },
    rejected: { icon: XCircle, label: "Rad etildi", color: "bg-destructive/10 text-destructive" },
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Profile header with gradient banner */}
      <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="relative">
              {profile.profile_image ? (
                <div className="h-24 w-24 rounded-2xl overflow-hidden border-4 border-card shadow-lg">
                  <img src={profile.profile_image} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-4 border-card shadow-lg">
                  {profile.firstname?.[0]}{profile.lastname?.[0] || ""}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <h1 className="text-2xl font-bold">{profile.firstname} {profile.lastname}</h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">#{profile.numeric_id}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
              {profile.is_banned && <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">⛔ Ban qilingan</span>}
            </div>
            <div className="flex gap-2">
              <Link to="/profile/edit" className="h-10 px-4 rounded-xl border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                <Pencil className="h-4 w-4" /> Profilni tahrirlash
              </Link>
              <Link to="/add-post" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" /> Yangi post
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Heart className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-xl font-bold">{profile.likes_count.toLocaleString()}</p><p className="text-xs text-muted-foreground">Jami layklar</p></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xl font-bold">{userPosts.length}</p><p className="text-xs text-muted-foreground">Loyihalar soni</p></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center"><Users className="h-5 w-5 text-accent-foreground" /></div>
          <div><p className="text-xl font-bold">{userGroup ? "1" : "0"}</p><p className="text-xs text-muted-foreground">Guruh</p></div>
        </div>
      </div>

      {/* Posts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Mening loyihalarim</h2>
          <div className="flex gap-1 text-sm">
            {["Barchasi", "Tasdiqlangan", "Kutilmoqda", "Rad etilgan"].map(label => (
              <button key={label} className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors font-medium">{label}</button>
            ))}
          </div>
        </div>
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} showStatus={true} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12 rounded-xl border border-border bg-card">Hali loyiha joylanmagan</p>
        )}
      </section>

      {/* Support */}
      <section className="space-y-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
        <h2 className="text-lg font-bold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> So'rovlar</h2>
        <SupportRequestForm />
        {myRequests.length > 0 && (
          <div className="space-y-2">
            {myRequests.map((req: any) => (
              <div key={req.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-sm">{req.message}</p>
                <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${req.status === "pending" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                  {req.status === "pending" ? "Kutilmoqda" : "Javob berildi"}
                </span>
                {req.reply && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 mt-2">
                    <p className="text-xs font-medium text-primary mb-1">Javob:</p>
                    <p className="text-sm">{req.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
