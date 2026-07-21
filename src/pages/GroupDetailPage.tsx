import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import { Users, Crown, Settings, Search, UserPlus, UserMinus, Ban, ArrowLeft, Pencil, ImagePlus, X, AlertTriangle, Plus } from "lucide-react";
import { useState, useRef } from "react";
import type { Post, Profile } from "@/lib/mock-data";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MAX_MEMBERS = 50;

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editName, setEditName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").eq("id", id!).single();
      if (error) throw error;
      const { data: teacher } = await supabase.from("profiles").select("*").eq("user_id", data.teacher_id).single();
      return { ...data, profiles: teacher };
    },
    enabled: !!id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("group_id", id!);
      return (data || []) as Profile[];
    },
    enabled: !!id,
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["group-blocks", id],
    queryFn: async () => {
      const { data } = await supabase.from("group_blocks").select("*").eq("group_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: groupPosts = [] } = useQuery({
    queryKey: ["group-posts", id],
    queryFn: async () => {
      const { data: memberProfiles } = await supabase.from("profiles").select("user_id").eq("group_id", id!);
      if (!memberProfiles || memberProfiles.length === 0) return [];
      const memberIds = memberProfiles.map(m => m.user_id);
      const { data: posts } = await supabase.from("posts").select("*").in("user_id", memberIds).order("created_at", { ascending: false });
      if (!posts) return [];
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return posts.map(p => ({ ...p, profiles: profiles?.find(pr => pr.user_id === p.user_id) || null })) as Post[];
    },
    enabled: !!id,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["search-users-group", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const q = searchQuery.toLowerCase();
      const { data } = await supabase.from("profiles").select("*");
      if (!data) return [];
      return data.filter(p =>
        p.firstname?.toLowerCase().includes(q) ||
        p.lastname?.toLowerCase().includes(q) ||
        String(p.numeric_id).includes(searchQuery)
      ).slice(0, 10) as Profile[];
    },
    enabled: searchQuery.length >= 2,
  });

  const isOwner = user && group && group.teacher_id === user.id;
  const isAdminUser = role === "admin";
  const canManage = isOwner || isAdminUser;
  const isBlocked = user && blocks.some(b => b.user_id === user.id);
  const isMember = user && members.some(m => m.user_id === user.id);

  if (isLoading) {
    return <div className="container py-16 text-center"><span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /></div>;
  }

  if (!group) {
    return <div className="container py-16 text-center"><p className="text-muted-foreground">Guruh topilmadi</p></div>;
  }

  if (isBlocked) {
    return (
      <div className="container py-16 max-w-lg text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-xl font-bold">Siz bloklangansiz</h1>
        <p className="text-muted-foreground">Siz guruhdan bloklangansiz va kira olmaysiz. Ustoz tomonidan bloklangansiz.</p>
        <Link to="/groups" className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          ← Guruhlarga qaytish
        </Link>
      </div>
    );
  }

  const handleAddMember = async (targetUserId: string) => {
    if (members.length >= MAX_MEMBERS) {
      setMessage(`Guruhda maksimal ${MAX_MEMBERS} ta a'zo bo'lishi mumkin`);
      return;
    }
    await supabase.from("profiles").update({ group_id: id }).eq("user_id", targetUserId);
    setMessage("Guruhga qo'shildi ✓");
    queryClient.invalidateQueries({ queryKey: ["group-members", id] });
    setSearchQuery("");
  };

  const handleRemoveMember = async (targetUserId: string) => {
    await supabase.from("profiles").update({ group_id: null }).eq("user_id", targetUserId);
    setMessage("Guruhdan chiqarildi ✓");
    queryClient.invalidateQueries({ queryKey: ["group-members", id] });
  };

  const handleBlock = async (targetUserId: string) => {
    await supabase.from("group_blocks").insert({ group_id: id!, user_id: targetUserId, blocked_by: user!.id });
    await supabase.from("profiles").update({ group_id: null }).eq("user_id", targetUserId);
    setMessage("Foydalanuvchi bloklandi ✓");
    queryClient.invalidateQueries({ queryKey: ["group-members", id] });
    queryClient.invalidateQueries({ queryKey: ["group-blocks", id] });
  };

  const handleUnblock = async (blockId: string) => {
    await supabase.from("group_blocks").delete().eq("id", blockId);
    setMessage("Blok olib tashlandi ✓");
    queryClient.invalidateQueries({ queryKey: ["group-blocks", id] });
  };

  const handleUpdateName = async () => {
    if (!editName.trim()) return;
    await supabase.from("groups").update({ name: editName.trim() }).eq("id", id!);
    setEditingName(false);
    setMessage("Nom yangilandi ✓");
    queryClient.invalidateQueries({ queryKey: ["group", id] });
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  };

  const handleUpdateImage = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    try {
      const ext = imageFile.name.split(".").pop();
      const path = `groups/${user!.id}/${crypto.randomUUID()}.${ext}`;
      await supabase.storage.from("post-images").upload(path, imageFile);
      const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/post-images/${path}`;
      await supabase.from("groups").update({ image: imageUrl }).eq("id", id!);
      setMessage("Rasm yangilandi ✓");
      setImageFile(null);
      setImagePreview("");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    } catch { setMessage("Rasm yuklashda xatolik"); }
    setUploadingImage(false);
  };

  const teacher = group.profiles;

  return (
    <div className="container py-6 sm:py-8 max-w-3xl space-y-5 sm:space-y-6 px-4 sm:px-6">
      <Link to="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Guruhlarga qaytish
      </Link>

      {/* Group header */}
      <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-up">
        <div className="relative aspect-[3/1] bg-muted overflow-hidden">
          <img src={group.image || "/placeholder.svg"} alt={group.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">{group.name}</h1>
            {teacher && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Crown className="h-3.5 w-3.5 text-primary" />
                {teacher.firstname} {teacher.lastname}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{members.length}/{MAX_MEMBERS} a'zo</p>
          </div>
          {canManage && (
            <button
              onClick={() => { setShowSettings(!showSettings); setEditName(group.name); }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-secondary transition-colors"
            >
              <Settings className="h-4 w-4" /> Sozlamalar
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && canManage && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-5 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <h2 className="font-semibold flex items-center gap-2"><Settings className="h-4 w-4" /> Guruh sozlamalari</h2>

          {message && <p className={`text-sm ${message.includes("✓") ? "text-primary" : "text-destructive"}`}>{message}</p>}

          {/* Edit name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Guruh nomi</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={editName} onChange={e => setEditName(e.target.value)} />
              <button onClick={handleUpdateName} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Edit image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Guruh rasmi</label>
            {imagePreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                <button onClick={() => { setImageFile(null); setImagePreview(""); }} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-4 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <ImagePlus className="h-5 w-5" /> Yangi rasm tanlash
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
            {imageFile && (
              <button onClick={handleUpdateImage} disabled={uploadingImage} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {uploadingImage ? "Yuklanmoqda..." : "Rasmni saqlash"}
              </button>
            )}
          </div>

          {/* Add member search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">A'zo qo'shish (ID yoki ism bilan qidiring)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="ID yoki ism kiriting..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map(u => {
                  const alreadyMember = members.some(m => m.user_id === u.user_id);
                  const isBlockedUser = blocks.some(b => b.user_id === u.user_id);
                  return (
                    <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {u.firstname?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{u.firstname} {u.lastname}</p>
                        <p className="text-xs text-muted-foreground">ID: {u.numeric_id}</p>
                      </div>
                      {isBlockedUser ? (
                        <span className="text-xs text-destructive">Bloklangan</span>
                      ) : alreadyMember ? (
                        <span className="text-xs text-muted-foreground">A'zo</span>
                      ) : (
                        <button onClick={() => handleAddMember(u.user_id)} className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary/10 text-primary px-3 text-xs font-medium hover:bg-primary/20 transition-colors">
                          <UserPlus className="h-3.5 w-3.5" /> Guruhga qo'shish
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Members list */}
          <div className="space-y-2">
            <label className="text-sm font-medium">A'zolar ({members.length})</label>
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {m.firstname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.firstname} {m.lastname}</p>
                    <p className="text-xs text-muted-foreground">ID: {m.numeric_id}</p>
                  </div>
                  {m.user_id !== user?.id && (
                    <div className="flex gap-1">
                      <button onClick={() => handleRemoveMember(m.user_id)} className="h-7 px-2 rounded text-xs bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1">
                        <UserMinus className="h-3 w-3" /> Chiqarish
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-7 px-2 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1">
                            <Ban className="h-3 w-3" /> Bloklash
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Foydalanuvchini bloklash</AlertDialogTitle>
                            <AlertDialogDescription>
                              {m.firstname} {m.lastname} guruhdan bloklangandan keyin kira olmaydi. Davom etasizmi?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBlock(m.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Bloklash
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">Hali a'zolar yo'q</p>}
            </div>
          </div>

          {/* Blocked users */}
          {blocks.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-destructive">Bloklangan foydalanuvchilar</label>
              <BlockedList blocks={blocks} onUnblock={handleUnblock} />
            </div>
          )}
        </div>
      )}

      {/* Members display */}
      <div className="rounded-xl border border-border bg-card p-5 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
        <p className="text-sm font-medium mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> A'zolar ({members.length})</p>
        <div className="flex flex-wrap gap-2">
          {members.map(m => (
            <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm">
              <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {m.firstname?.[0]}
              </span>
              {m.firstname}
            </span>
          ))}
          {members.length === 0 && <span className="text-sm text-muted-foreground">Hali a'zolar yo'q</span>}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Guruh postlari</h2>
          {(isMember || isAdminUser) && (
            <Link to="/add-post" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> Post qo'shish
            </Link>
          )}
        </div>
        {groupPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Hali postlar yo'q</p>
        )}
      </div>
    </div>
  );
}

function BlockedList({ blocks, onUnblock }: { blocks: any[]; onUnblock: (id: string) => void }) {
  const { data: profiles = [] } = useQuery({
    queryKey: ["blocked-profiles", blocks.map(b => b.user_id)],
    queryFn: async () => {
      const ids = blocks.map(b => b.user_id);
      const { data } = await supabase.from("profiles").select("*").in("user_id", ids);
      return data || [];
    },
    enabled: blocks.length > 0,
  });

  return (
    <div className="divide-y divide-border rounded-lg border border-destructive/30 overflow-hidden">
      {blocks.map(b => {
        const p = profiles.find((pr: any) => pr.user_id === b.user_id);
        return (
          <div key={b.id} className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-semibold text-destructive shrink-0">
              {p?.firstname?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p?.firstname || "?"} {p?.lastname || ""}</p>
            </div>
            <button onClick={() => onUnblock(b.id)} className="h-7 px-2 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Blokni olib tashlash
            </button>
          </div>
        );
      })}
    </div>
  );
}
