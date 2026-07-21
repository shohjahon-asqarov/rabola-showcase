import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ExternalLink, ArrowLeft, MessageCircle, Calendar, CheckCircle, Share2, Hash, Trash2, Send, Eye, Bookmark, Globe, TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ImageSlider from "@/components/ImageSlider";
import { toast } from "@/hooks/use-toast";
import type { Post, Comment } from "@/lib/mock-data";

export default function PostDetailPage() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const isAdmin = role === "admin";

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id!).single();
      if (error) throw error;
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", data.user_id).single();
      return { ...data, profiles: profile } as Post;
    },
    enabled: !!id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-posts", id],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("id,title,image,likes_count").eq("status", "approved").neq("id", id!).order("likes_count", { ascending: false }).limit(4);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments").select("*").eq("post_id", id!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return data.map(c => ({ ...c, profiles: profiles?.find(p => p.user_id === c.user_id) || null })) as Comment[];
    },
    enabled: !!id,
  });

  useEffect(() => { if (post) setLikesCount(post.likes_count); }, [post]);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("likes").select("id").eq("user_id", user.id).eq("post_id", id).maybeSingle()
      .then(({ data }) => { if (data) setLiked(true); });
  }, [user, id]);

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user || !commentText.trim()) return;
      await supabase.from("comments").insert({ user_id: user.id, post_id: id!, text: commentText.trim() });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
  });

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      toast({ title: "Xatolik", description: "Izoh o'chirilmadi", variant: "destructive" });
      return;
    }
    toast({ title: "Izoh o'chirildi" });
    queryClient.invalidateQueries({ queryKey: ["comments", id] });
    queryClient.invalidateQueries({ queryKey: ["post", id] });
  };

  const handleLike = async () => {
    if (!user || !id) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", id);
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: id });
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  if (isLoading) return <div className="p-16 text-center"><span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /></div>;
  if (!post) return <div className="p-16 text-center"><p className="text-muted-foreground">Loyiha topilmadi</p><Link to="/feed" className="text-primary text-sm mt-2 inline-block hover:underline">← Orqaga</Link></div>;

  const author = post.profiles;
  const images = post.image ? post.image.split(",").filter(Boolean) : [];
  const timeAgo = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m} daqiqa oldin`; const h = Math.floor(m / 60); if (h < 24) return `${h} soat oldin`; return `${Math.floor(h / 24)} kun oldin`; };
  const viewsEstimate = (post.likes_count || 0) * 7 + (post.comments_count || 0) * 4 + 42;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: post.title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast({ title: "Havola nusxa olindi" }); }
    } catch {}
  };
  let hostname = "";
  try { hostname = new URL(post.url).hostname.replace(/^www\./, ""); } catch {}

  return (
    <div className="pb-24 md:pb-16">
      {/* Ambient background */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 -z-10" style={{ background: "var(--gradient-hero)" }} />

        <div className="container pt-6">
          <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5">
            <ArrowLeft className="h-4 w-4" /> Barcha loyihalarga qaytish
          </Link>

          {/* Title header */}
          <div className="opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {(post as any).status === "approved" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/15">
                  <CheckCircle className="h-3 w-3" /> Tasdiqlangan
                </span>
              )}
              {(post as any).is_trending && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-primary-foreground shadow-sm" style={{ background: "var(--gradient-primary)" }}>
                  <TrendingUp className="h-3 w-3" /> Trending
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> {timeAgo(post.created_at)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">{post.title}</h1>
            {author && (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden ring-2 ring-primary/10">
                  {author.profile_image ? <img src={author.profile_image} alt="" className="h-full w-full object-cover" /> : author.firstname?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{author.firstname} {author.lastname}</p>
                  <p className="text-xs text-muted-foreground truncate">@{author.username} · #{author.numeric_id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-8 grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">
        {/* MAIN */}
        <div className="min-w-0 space-y-6">
          {/* Gallery */}
          <div className="relative rounded-3xl overflow-hidden border border-primary/10 bg-card shadow-[var(--shadow-card)] opacity-0 animate-fade-up" style={{ animationDelay: "0.08s", animationFillMode: "forwards" }}>
            <div className="aspect-[16/10]">
              <ImageSlider images={images} alt={post.title} />
            </div>
          </div>

          {/* Meta strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "0.12s", animationFillMode: "forwards" }}>
            {[
              { icon: Heart, label: "Yoqdi", value: likesCount, tone: "text-rose-500" },
              { icon: MessageCircle, label: "Izohlar", value: comments.length, tone: "text-primary" },
              { icon: Eye, label: "Ko'rildi", value: viewsEstimate, tone: "text-[hsl(var(--primary-glow))]" },
              { icon: Sparkles, label: "Reyting", value: (likesCount * 3 + comments.length * 2), tone: "text-primary" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center gap-3">
                <span className={`h-9 w-9 rounded-xl bg-accent flex items-center justify-center ${s.tone}`}><s.icon className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 opacity-0 animate-fade-up" style={{ animationDelay: "0.16s", animationFillMode: "forwards" }}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /> Loyiha haqida</h2>
            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {post.description || <span className="text-muted-foreground italic">Muallif ushbu loyiha haqida hozircha tavsif qo'shmagan.</span>}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> Fikr-mulohazalar
                <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">{comments.length}</span>
              </h2>
            </div>
            {user ? (
              <div className="flex gap-3 items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-primary/10">
                  {author?.profile_image ? <img src={author.profile_image} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-primary">?</span>}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none min-h-[52px] max-h-40"
                    placeholder="Fikringizni qoldiring..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment.mutate(); } }}
                  />
                  <button
                    onClick={() => addComment.mutate()}
                    disabled={addComment.isPending || !commentText.trim()}
                    className="absolute right-2 bottom-2 h-9 w-9 rounded-xl text-primary-foreground flex items-center justify-center active:scale-95 disabled:opacity-40 transition-all"
                    style={{ background: "var(--gradient-primary)" }}
                    aria-label="Yuborish"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 rounded-2xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Izoh qoldirish uchun <Link to="/auth" className="text-primary font-semibold hover:underline">tizimga kiring</Link></p>
              </div>
            )}

            <div className="space-y-4 pt-2">
              {comments.map(c => (
                <div key={c.id} className="group/comment flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden ring-2 ring-primary/10">
                    {c.profiles?.profile_image ? <img src={c.profiles.profile_image} alt="" className="h-full w-full object-cover" /> : c.profiles?.firstname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0 rounded-2xl bg-muted/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{c.profiles?.firstname} {c.profiles?.lastname}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(c.created_at)}</span>
                      {user && (isAdmin || c.user_id === user.id) && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="ml-auto opacity-0 group-hover/comment:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-all shrink-0"
                          title="Izohni o'chirish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap break-words">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Hali fikr yo'q — birinchi bo'ling!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR — sticky */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Actions card */}
          <div className="rounded-3xl border border-primary/15 bg-card p-5 space-y-3 shadow-[var(--shadow-card)] opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-2xl text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-lift)] active:scale-[0.98] transition-all"
              style={{ background: "var(--gradient-primary)" }}
            >
              <ExternalLink className="h-4 w-4" /> Saytga o'tish
            </a>
            {hostname && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <Globe className="h-3.5 w-3.5" /> <span className="truncate">{hostname}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleLike}
                className={`h-11 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${liked ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400" : "border-border hover:bg-muted"}`}
                aria-label="Yoqtirish"
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} /> {likesCount}
              </button>
              <button
                onClick={() => setSaved(v => !v)}
                className={`h-11 rounded-xl border text-sm font-semibold flex items-center justify-center transition-all active:scale-95 ${saved ? "border-primary/40 bg-accent text-primary" : "border-border hover:bg-muted"}`}
                aria-label="Saqlash"
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} />
              </button>
              <button
                onClick={share}
                className="h-11 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-95"
                aria-label="Ulashish"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Author card */}
          {author && (
            <div className="rounded-3xl border border-border bg-card p-5 space-y-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.16s", animationFillMode: "forwards" }}>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Muallif</p>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-[hsl(var(--primary-glow))]/15 flex items-center justify-center text-xl font-extrabold text-primary overflow-hidden ring-2 ring-primary/10">
                  {author.profile_image ? <img src={author.profile_image} alt="" className="h-full w-full object-cover" /> : author.firstname?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{author.firstname} {author.lastname}</p>
                  <p className="text-xs text-muted-foreground truncate">@{author.username}</p>
                  <p className="text-[11px] text-primary font-semibold flex items-center gap-1 mt-0.5"><Hash className="h-3 w-3" />{author.numeric_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-base font-extrabold">{author.likes_count || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Layklar</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-base font-extrabold">Rank</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Faol</p>
                </div>
              </div>
              <Link to="/profile" className="w-full h-10 rounded-xl border border-border text-sm font-semibold flex items-center justify-center hover:bg-muted transition-colors">
                Profilni ko'rish
              </Link>
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 space-y-3 opacity-0 animate-fade-up" style={{ animationDelay: "0.22s", animationFillMode: "forwards" }}>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">O'xshash loyihalar</p>
              <div className="space-y-2">
                {related.map((r: any) => {
                  const img = (r.image || "").split(",").filter(Boolean)[0];
                  return (
                    <Link key={r.id} to={`/post/${r.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors group">
                      <div className="h-12 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        {img ? <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{r.title}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> {r.likes_count || 0}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}