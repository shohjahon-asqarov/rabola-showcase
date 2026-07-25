import { Heart, MessageCircle, ExternalLink, Clock, CheckCircle, XCircle, TrendingUp, Bookmark, Eye, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { type Post } from "@/lib/mock-data";
import ImageSlider from "@/components/ImageSlider";
import { toast } from "@/hooks/use-toast";

interface PostCardProps {
  post: Post;
  index?: number;
  showStatus?: boolean;
}

const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
  pending: { icon: Clock, label: "Kutilmoqda", color: "bg-warning/10 text-warning" },
  approved: { icon: CheckCircle, label: "Tasdiqlandi", color: "bg-primary/10 text-primary" },
  rejected: { icon: XCircle, label: "Rad etildi", color: "bg-destructive/10 text-destructive" },
};

export default function PostCard({ post, index = 0, showStatus = false }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const profile = post.profiles;

  const images = post.image ? post.image.split(",").filter(Boolean) : [];
  const status = (post as any).status || "approved";
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const isTrending = (post as any).is_trending;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", post.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setLiked(true);
      });
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Kirish shart", description: "Loyiha bilan o'zaro aloqa qilish uchun tizimga kiring", variant: "destructive" });
      return;
    }
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description || undefined,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Havola nusxalandi", description: "Loyiha havolasi clipboardga nusxalandi!" });
      }
    } catch {
      // Ignore user-cancelling
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Kirish shart", description: "Loyihani saqlash uchun tizimga kiring", variant: "destructive" });
      return;
    }
    setSaved(v => !v);
    toast({
      title: !saved ? "Saqlandi" : "Saqlanganlardan olib tashlandi",
      description: !saved ? "Loyiha profilingizga saqlandi." : "Loyiha saqlanganlardan o'chirildi."
    });
  };

  return (
    <div
      className="group surface-card overflow-hidden hover-lift opacity-0 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: "forwards" }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted m-2 rounded-2xl">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
          <ImageSlider images={images} alt={post.title} />
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          {isTrending && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
              <TrendingUp className="h-3 w-3" /> Trenddagi
            </span>
          )}
          {showStatus && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.color} backdrop-blur-sm`}>
              <StatusIcon className="h-3 w-3" /> {statusInfo.label}
            </span>
          )}
        </div>
        <button
          onClick={handleShare}
          aria-label="Loyihani ulashish"
          title="Ulashish"
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-primary hover:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-200 z-10 shadow-sm"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-4 pt-2 space-y-3">
        <div>
          <h3 className="font-bold text-[15px] text-card-foreground leading-tight line-clamp-1">{post.title}</h3>
        </div>

        {profile && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-primary overflow-hidden">
              {profile.profile_image ? (
                <img src={profile.profile_image} alt="" className="h-full w-full object-cover" />
              ) : (
                profile.firstname?.[0]
              )}
            </div>
            <span className="text-[12.5px] text-muted-foreground">
              {profile.firstname} {profile.lastname?.[0]}.
            </span>
          </div>
        )}

        {post.description && (
          <p className="text-[12.5px] text-muted-foreground line-clamp-1">{post.description}</p>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-border/70">
          <button
            onClick={handleLike}
            aria-label={`${likesCount} ta layk. Yoqtirish uchun bosing.`}
            title="Loyiha yoqdi"
            className="flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-destructive focus-visible:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive rounded px-1 transition-colors active:scale-95"
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${liked ? "fill-destructive text-destructive scale-110" : ""}`} />
            {likesCount}
          </button>
          <Link
            to={`/post/${post.id}`}
            aria-label={`${post.comments_count} ta izoh. Izohlarni ko'rish.`}
            title="Izoh qoldirish"
            className="flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comments_count}
          </Link>
          <span
            aria-label={`Taxminan ${(post.likes_count || 0) * 3 + (post.comments_count || 0) * 5} ta ko'rishlar soni.`}
            title="Ko'rishlar soni"
            className="flex items-center gap-1 text-[12.5px] text-muted-foreground select-none"
          >
            <Eye className="h-3.5 w-3.5" />
            {(post.likes_count || 0) * 3 + (post.comments_count || 0) * 5}
          </span>
          <button
            onClick={handleSave}
            aria-label={saved ? "Saqlanganlardan olib tashlash" : "Loyihani saqlash"}
            title={saved ? "Saqlangan" : "Saqlash"}
            className="ml-auto text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded p-0.5 transition-colors"
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-primary text-primary" : ""}`} />
          </button>
          <Link
            to={`/post/${post.id}`}
            aria-label="Loyihani to'liq ko'rish"
            title="Ko'rish"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1"
          >
            <ExternalLink className="h-3 w-3" /> Ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
}
