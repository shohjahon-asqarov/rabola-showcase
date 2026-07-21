import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { roleLabels, roleColors, type UserRole, type Profile } from "@/lib/mock-data";
import {
  Shield, Check, Hash, Trash2, Ban, RefreshCw, AlertTriangle, Search, UserPlus, UserMinus,
  FileText, CheckCircle, XCircle, Clock, Pencil, ExternalLink, Eye, Star, MessageSquare, Send,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [searchUsername, setSearchUsername] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [tab, setTab] = useState<"users" | "groups" | "posts" | "support">("users");
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", url: "", description: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectPostId, setRejectPostId] = useState<string | null>(null);
  const [approvePostId, setApprovePostId] = useState<string | null>(null);
  const [postSearch, setPostSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  if (!user || (role !== "admin" && role !== "moderator")) {
    return <Navigate to="/" />;
  }

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  const allowedRoles: UserRole[] = isModerator
    ? ["teacher", "student"]
    : ["moderator", "teacher", "student"];

  const { data: allUsers = [], refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!profiles) return [];
      const { data: roles } = await supabase.from("user_roles").select("*");
      return profiles.map(p => ({
        ...p,
        role: (roles?.find(r => r.user_id === p.user_id)?.role || "student") as UserRole,
      })) as Profile[];
    },
  });

  const { data: groups = [], refetch: refetchGroups } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allPosts = [], refetch: refetchPosts } = useQuery({
    queryKey: ["admin-all-posts"],
    queryFn: async () => {
      const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (!posts) return [];
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return posts.map(p => ({ ...p, profiles: profiles?.find(pr => pr.user_id === p.user_id) || null }));
    },
  });

  const { data: supportRequests = [], refetch: refetchSupport } = useQuery({
    queryKey: ["admin-support-requests"],
    queryFn: async () => {
      const { data } = await supabase.from("support_requests").select("*").order("created_at", { ascending: false });
      if (!data) return [];
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return data.map((r: any) => ({ ...r, profile: profiles?.find(p => p.user_id === r.user_id) }));
    },
  });

  const pendingPosts = allPosts.filter(p => (p as any).status === "pending");
  const approvedPosts = allPosts.filter(p => (p as any).status === "approved");
  const rejectedPosts = allPosts.filter(p => (p as any).status === "rejected");

  const filteredPosts = postSearch.length >= 2
    ? allPosts.filter(p => {
        const q = postSearch.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          (p as any).profiles?.firstname?.toLowerCase().includes(q) ||
          (p as any).profiles?.lastname?.toLowerCase().includes(q) ||
          (p as any).profiles?.username?.toLowerCase().includes(q)
        );
      })
    : allPosts;

  const handleAssign = async () => {
    const target = allUsers.find(u => u.username === searchUsername || String(u.numeric_id) === searchUsername);
    if (!target) { setMessage("Foydalanuvchi topilmadi"); return; }
    if (target.user_id === user.id) { setMessage("O'zingizga role bera olmaysiz"); return; }

    const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", target.user_id).single();
    if (existing) {
      await supabase.from("user_roles").update({ role: selectedRole }).eq("user_id", target.user_id);
    } else {
      await supabase.from("user_roles").insert({ user_id: target.user_id, role: selectedRole });
    }

    toast({ title: "Muvaffaqiyat", description: `${target.firstname} ${target.lastname} — ${roleLabels[selectedRole]} qilindi` });
    setMessage("");
    refetch();
  };

  const callAdminFn = async (action: string, targetUserId?: string) => {
    setActionLoading(targetUserId || action);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { action, targetUserId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      refetch();
      refetchGroups();
      refetchPosts();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Muvaffaqiyat",
        description: action === "delete_all_users" ? `${data.deleted} ta foydalanuvchi o'chirildi` : "Amal bajarildi",
      });
    } catch (err: any) {
      toast({ title: "Xatolik", description: err.message, variant: "destructive" });
    }
    setActionLoading("");
  };

  const handlePostApprove = async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    await supabase.from("posts").update({ status: "approved" } as any).eq("id", postId);
    // Notify post owner
    if (post) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        title: "Loyihangiz tasdiqlandi! ✅",
        message: `"${post.title}" loyihangiz tasdiqlandi va feedda ko'rinadi`,
        type: "post_approved",
        related_id: postId,
      } as any);
    }
    toast({ title: "✅ Post tasdiqlandi", description: "Post muvaffaqiyatli joylandi va feedda ko'rinadi" });
    setApprovePostId(null);
    refetchPosts();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handlePostReject = async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    await supabase.from("posts").update({ status: "rejected" } as any).eq("id", postId);
    const reason = rejectReason || "Saytingiz joylanmadi. Kamchiliklarni to'g'irlang";
    // Notify post owner
    if (post) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        title: "Loyihangiz rad etildi ❌",
        message: reason,
        type: "post_rejected",
        related_id: postId,
      } as any);
    }
    toast({ title: "❌ Post rad etildi", description: reason, variant: "destructive" });
    setRejectPostId(null);
    setRejectReason("");
    refetchPosts();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from("posts").delete().eq("id", postId);
    toast({ title: "Post o'chirildi" });
    refetchPosts();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleDeleteGroup = async (groupId: string) => {
    await supabase.from("profiles").update({ group_id: null }).eq("group_id", groupId);
    await supabase.from("groups").delete().eq("id", groupId);
    toast({ title: "Guruh o'chirildi" });
    refetchGroups();
    refetch();
  };

  const handleEditPost = async () => {
    if (!editPost) return;
    await supabase.from("posts").update({
      title: editForm.title,
      url: editForm.url,
      description: editForm.description,
    }).eq("id", editPost.id);
    toast({ title: "Post yangilandi" });
    setEditPost(null);
    refetchPosts();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleToggleTrending = async (postId: string, current: boolean) => {
    await supabase.from("posts").update({ is_trending: !current } as any).eq("id", postId);
    toast({ title: !current ? "⭐ Trendingga qo'shildi" : "Trendingdan olib tashlandi" });
    refetchPosts();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleReplySupport = async (requestId: string, userId: string) => {
    if (!replyText.trim()) return;
    await supabase.from("support_requests").update({
      reply: replyText.trim(),
      replied_by: user.id,
      status: "replied",
    } as any).eq("id", requestId);
    // Notify user
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "So'rovingizga javob berildi",
      message: replyText.trim().slice(0, 100),
      type: "support_reply",
      related_id: requestId,
    } as any);
    toast({ title: "Javob yuborildi" });
    setReplyText("");
    setReplyingTo(null);
    refetchSupport();
  };

  const handleAddToGroup = async (targetUserId: string) => {
    if (!selectedGroupId) return;
    await supabase.from("profiles").update({ group_id: selectedGroupId }).eq("user_id", targetUserId);
    toast({ title: "Guruhga qo'shildi" });
    refetch();
  };

  const handleRemoveFromGroup = async (targetUserId: string) => {
    await supabase.from("profiles").update({ group_id: null }).eq("user_id", targetUserId);
    toast({ title: "Guruhdan chiqarildi" });
    refetch();
  };

  const filteredGroupUsers = groupSearch
    ? allUsers.filter(u =>
        u.firstname?.toLowerCase().includes(groupSearch.toLowerCase()) ||
        u.lastname?.toLowerCase().includes(groupSearch.toLowerCase()) ||
        u.username?.toLowerCase().includes(groupSearch.toLowerCase()) ||
        String(u.numeric_id || "").includes(groupSearch)
      )
    : allUsers;

  const filteredUsersList = userSearch.length >= 2
    ? allUsers.filter(u => {
        const q = userSearch.toLowerCase();
        return (
          u.firstname?.toLowerCase().includes(q) ||
          u.lastname?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          String(u.numeric_id || "").includes(userSearch)
        );
      })
    : allUsers;

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
  };
  const statusLabels: Record<string, string> = {
    pending: "Kutilmoqda",
    approved: "Tasdiqlandi",
    rejected: "Rad etildi",
  };

  const renderPendingPost = (p: any) => (
    <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview image */}
      {p.image && (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img src={p.image.split(",")[0]} alt="" className="h-full w-full object-cover" />
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/50 hover:bg-background transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm">{p.title}</h3>
          {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary overflow-hidden shrink-0">
            {p.profiles?.profile_image ? (
              <img src={p.profiles.profile_image} alt="" className="h-full w-full object-cover" />
            ) : (
              p.profiles?.firstname?.[0]
            )}
          </div>
          <span className="text-xs text-muted-foreground">{p.profiles?.firstname} {p.profiles?.lastname}</span>
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Eye className="h-3.5 w-3.5" /> Saytni ko'rish
        </a>
        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <button
            onClick={() => setApprovePostId(p.id)}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.97] transition-all"
          >
            <CheckCircle className="h-4 w-4" /> Qabul qilish
          </button>
          <button
            onClick={() => setRejectPostId(p.id)}
            className="flex-1 h-10 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-destructive/20 active:scale-[0.97] transition-all"
          >
            <XCircle className="h-4 w-4" /> Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-3xl space-y-4 sm:space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-3 opacity-0 animate-fade-up">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{isModerator ? "Moderator" : "Admin"} Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap opacity-0 animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
        {[
          { key: "users", label: "Foydalanuvchilar" },
          { key: "posts", label: "Postlar", badge: pendingPosts.length > 0 ? pendingPosts.length : undefined },
          { key: "groups", label: "Guruhlar" },
          { key: "support", label: "So'rovlar", badge: supportRequests.filter((r: any) => r.status === "pending").length || undefined },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {t.label}
            {(t as any).badge && (
              <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {(t as any).badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          {/* Role assign */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <h2 className="font-semibold">Role tayinlash</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Username yoki ID" value={searchUsername} onChange={e => { setSearchUsername(e.target.value); setMessage(""); }} />
              </div>
              <select className="rounded-xl border border-input bg-background px-3 py-2 text-sm" value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole)}>
                {allowedRoles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
              </select>
              <button onClick={handleAssign} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.97]">
                <Check className="h-4 w-4" /> Tayinlash
              </button>
            </div>
            {message && <p className="text-sm text-destructive">{message}</p>}
          </div>

          {isAdmin && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="font-semibold text-destructive">Xavfli zona</h2>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:opacity-90">
                    <RefreshCw className="h-4 w-4" /> Barcha userlarni o'chirish
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Haqiqatan ham o'chirmoqchimisiz?</AlertDialogTitle>
                    <AlertDialogDescription>Bu amalni qaytarib bo'lmaydi. Barcha foydalanuvchilar, postlar, kommentlar va layklar o'chiriladi.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                    <AlertDialogAction onClick={() => callAdminFn("delete_all_users")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {actionLoading === "delete_all_users" ? "O'chirilmoqda..." : "Ha, o'chirish"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Users list */}
          <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="font-semibold">Foydalanuvchilar ({allUsers.length})</h2>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm" placeholder="Ism yoki ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {filteredUsersList.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0 overflow-hidden">
                    {u.profile_image ? <img src={u.profile_image} alt="" className="h-full w-full object-cover" /> : u.firstname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {u.firstname} {u.lastname}
                      {u.is_banned && <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-destructive/10 text-destructive font-medium">BAN</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">@{u.username} · ID: {u.numeric_id || "—"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role || "student"]}`}>
                    {roleLabels[u.role || "student"]}
                  </span>
                  {isAdmin && u.user_id !== user.id && (
                    <div className="flex gap-1">
                      <button onClick={() => callAdminFn(u.is_banned ? "unban_user" : "ban_user", u.user_id)} disabled={actionLoading === u.user_id} className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${u.is_banned ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-warning/10 text-warning hover:bg-warning/20"}`} title={u.is_banned ? "Banni olib tashlash" : "Ban qilish"}>
                        <Ban className="h-4 w-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20" title="O'chirish">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
                            <AlertDialogDescription>{u.firstname} {u.lastname} ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => callAdminFn("delete_user", u.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {actionLoading === u.user_id ? "O'chirilmoqda..." : "Ha, o'chirish"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
              {filteredUsersList.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">Topilmadi</p>}
            </div>
          </div>
        </>
      )}

      {tab === "posts" && (
        <div className="space-y-6">
          {/* Pending posts - card view */}
          {pendingPosts.length > 0 && (
            <div className="space-y-4 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Kutilmoqda ({pendingPosts.length})
                <span className="text-xs text-muted-foreground font-normal">— Ko'rib chiqing va qaror qiling</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingPosts.map(renderPendingPost)}
              </div>
            </div>
          )}

          {pendingPosts.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">Kutilayotgan postlar yo'q</p>
            </div>
          )}

          {/* All posts with search */}
          <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Barcha postlar ({allPosts.length})</h2>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm" placeholder="Post yoki muallif qidirish..." value={postSearch} onChange={e => setPostSearch(e.target.value)} />
              </div>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {filteredPosts.map(p => {
                const st = (p as any).status || "pending";
                return (
                  <div key={p.id} className="p-3 sm:p-4 hover:bg-muted/50 transition-colors space-y-2">
                    {/* Top row: image + info + status */}
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image.split(",")[0]} alt="" className="h-10 w-10 sm:h-10 sm:w-14 rounded object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{(p as any).profiles?.firstname} {(p as any).profiles?.lastname}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${statusColors[st]}`}>{statusLabels[st]}</span>
                    </div>
                    {/* Bottom row: actions */}
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => handleToggleTrending(p.id, !!(p as any).is_trending)} className={`h-8 w-8 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center ${(p as any).is_trending ? "bg-warning/20 text-warning" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`} title="Trending">
                        <Star className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${(p as any).is_trending ? "fill-warning" : ""}`} />
                      </button>
                      {st !== "approved" && (
                        <button onClick={() => setApprovePostId(p.id)} className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20" title="Tasdiqlash">
                          <CheckCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </button>
                      )}
                      {st !== "rejected" && (
                        <button onClick={() => setRejectPostId(p.id)} className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20" title="Rad etish">
                          <XCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </button>
                      )}
                      <button onClick={() => { setEditPost(p); setEditForm({ title: p.title, url: p.url, description: p.description }); }} className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80" title="Tahrirlash">
                        <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20" title="O'chirish">
                            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Postni o'chirish</AlertDialogTitle>
                            <AlertDialogDescription>"{p.title}" postini o'chirmoqchimisiz?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">O'chirish</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
              {filteredPosts.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">Postlar yo'q</p>}
            </div>
          </div>

          {/* Approve confirmation dialog */}
          <AlertDialog open={!!approvePostId} onOpenChange={open => { if (!open) setApprovePostId(null); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
                <AlertDialogDescription>Bu postni tasdiqlaysizmi? Post feedda barcha foydalanuvchilarga ko'rinadi.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={() => approvePostId && handlePostApprove(approvePostId)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Ha, qabul qilish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reject dialog with reason */}
          <Dialog open={!!rejectPostId} onOpenChange={open => { if (!open) { setRejectPostId(null); setRejectReason(""); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Postni rad etish</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  O'quvchiga xabar yuboriladi: "Saytingiz joylanmadi. Kamchiliklarni to'g'irlang"
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Qo'shimcha izoh (ixtiyoriy)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Masalan: Dizayni yaxshilang, responsive qiling..."
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="h-10 px-4 rounded-xl border border-border text-sm font-medium">Bekor qilish</button>
                </DialogClose>
                <button
                  onClick={() => rejectPostId && handlePostReject(rejectPostId)}
                  className="h-10 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90"
                >
                  Rad etish
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit post dialog */}
          <Dialog open={!!editPost} onOpenChange={open => { if (!open) setEditPost(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Postni tahrirlash</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nomi</label>
                  <input className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">URL</label>
                  <input className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={editForm.url} onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tavsif</label>
                  <textarea rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="h-10 px-4 rounded-xl border border-border text-sm font-medium">Bekor qilish</button>
                </DialogClose>
                <button onClick={handleEditPost} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Saqlash</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {tab === "groups" && (
        <>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <h2 className="font-semibold">Guruhga o'quvchi qo'shish</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <select className="rounded-xl border border-input bg-background px-3 py-2 text-sm" value={selectedGroupId || ""} onChange={e => setSelectedGroupId(e.target.value || null)}>
                <option value="">Guruh tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm" placeholder="Ism yoki ID..." value={groupSearch} onChange={e => setGroupSearch(e.target.value)} />
              </div>
            </div>

            {groupSearch && (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden max-h-60 overflow-y-auto">
                {filteredGroupUsers.slice(0, 10).map(u => {
                  const inGroup = u.group_id === selectedGroupId;
                  return (
                    <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {u.firstname?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{u.firstname} {u.lastname}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      {u.group_id && <span className="text-xs text-muted-foreground">{groups.find(g => g.id === u.group_id)?.name || "Guruhda"}</span>}
                      {selectedGroupId && (
                        inGroup ? (
                          <button onClick={() => handleRemoveFromGroup(u.user_id)} className="inline-flex h-8 items-center gap-1 rounded-xl bg-destructive/10 text-destructive px-3 text-xs font-medium hover:bg-destructive/20">
                            <UserMinus className="h-3.5 w-3.5" /> Chiqarish
                          </button>
                        ) : (
                          <button onClick={() => handleAddToGroup(u.user_id)} className="inline-flex h-8 items-center gap-1 rounded-xl bg-primary/10 text-primary px-3 text-xs font-medium hover:bg-primary/20">
                            <UserPlus className="h-3.5 w-3.5" /> Qo'shish
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
                {filteredGroupUsers.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">Topilmadi</p>}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {groups.map((g, gi) => {
              const members = allUsers.filter(u => u.group_id === g.id);
              return (
                <div key={g.id} className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: `${0.15 + gi * 0.1}s`, animationFillMode: "forwards" }}>
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <img src={g.image || "/placeholder.svg"} alt={g.name} className="h-10 w-10 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{g.name}</h3>
                      <p className="text-xs text-muted-foreground">{members.length} a'zo</p>
                    </div>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20" title="Guruhni o'chirish">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Guruhni o'chirish</AlertDialogTitle>
                            <AlertDialogDescription>"{g.name}" guruhini o'chirmoqchimisiz? Barcha a'zolar guruhdan chiqariladi.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGroup(g.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">O'chirish</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  {members.length > 0 && (
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {members.map(m => (
                          <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs">
                            {m.firstname} {m.lastname}
                            {isAdmin && (
                              <button onClick={() => handleRemoveFromGroup(m.user_id)} className="h-4 w-4 rounded-full bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/30 ml-1">×</button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "support" && (
        <div className="space-y-4 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> So'rovlar ({supportRequests.length})
          </h2>
          {supportRequests.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">So'rovlar yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {supportRequests.map((req: any) => (
                <div key={req.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {req.profile?.firstname?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{req.profile?.firstname} {req.profile?.lastname}</p>
                      <p className="text-xs text-muted-foreground">@{req.profile?.username} · ID: {req.profile?.numeric_id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.status === "pending" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                      {req.status === "pending" ? "Kutilmoqda" : "Javob berildi"}
                    </span>
                  </div>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{req.message}</p>
                  {req.reply && (
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                      <p className="text-xs font-medium text-primary mb-1">Javob:</p>
                      <p className="text-sm">{req.reply}</p>
                    </div>
                  )}
                  {!req.reply && (
                    replyingTo === req.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Javobingizni yozing..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="h-9 px-3 rounded-xl border border-border text-sm">
                            Bekor qilish
                          </button>
                          <button
                            onClick={() => handleReplySupport(req.id, req.user_id)}
                            disabled={!replyText.trim()}
                            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50"
                          >
                            <Send className="h-3.5 w-3.5" /> Yuborish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(req.id)}
                        className="h-9 px-4 rounded-xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5 hover:bg-primary/20"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Javob berish
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
