import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Upload, Globe, Type, FileText, X, ImagePlus, AlertTriangle, Image, Info, GripVertical } from "lucide-react";

const MAX_IMAGES = 5;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function AddPostPage() {
  const { user, profile, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  if (!isAuthenticated || !user) return <Navigate to="/auth" />;

  const canPost = role === "admin" || role === "moderator" || role === "teacher" || !!profile?.group_id;

  if (!canPost) {
    return (
      <div className="p-8 sm:p-16 max-w-lg mx-auto text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
        <h1 className="text-xl font-bold">Post joylash mumkin emas</h1>
        <p className="text-muted-foreground">Siz hali guruhga qo'shilmagansiz. Post joylash uchun avval guruhga a'zo bo'lishingiz kerak.</p>
        <button onClick={() => navigate("/groups")} className="inline-flex h-10 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90">Guruhlarga o'tish</button>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    const newFiles = files.slice(0, remaining);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setImages(prev => {
      const arr = [...prev];
      const [x] = arr.splice(from, 1);
      arr.splice(to, 0, x);
      return arr;
    });
    setPreviews(prev => {
      const arr = [...prev];
      const [x] = arr.splice(from, 1);
      arr.splice(to, 0, x);
      return arr;
    });
  };

  const uploadImages = async (): Promise<string> => {
    if (images.length === 0) return "";
    const urls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("post-images").upload(path, file);
      if (error) throw error;
      urls.push(`${SUPABASE_URL}/storage/v1/object/public/post-images/${path}`);
    }
    return urls.join(",");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast({ title: "Rasm majburiy", description: "Kamida 1 ta rasm qo'shing", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const imageStr = await uploadImages();
      const { error: err } = await supabase.from("posts").insert({
        user_id: user.id, title: form.title, url: form.url, image: imageStr, description: form.description, status: "pending",
      } as any);
      if (err) { toast({ title: "Xatolik yuz berdi", description: err.message, variant: "destructive" }); setLoading(false); return; }
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "teacher"]);
      if (adminRoles) {
        const notifications = adminRoles.filter(r => r.user_id !== user.id).map(r => ({
          user_id: r.user_id, title: "Yangi post tasdiqlash kerak", message: `"${form.title}" — ${profile?.firstname} ${profile?.lastname}`, type: "new_post",
        }));
        if (notifications.length > 0) await supabase.from("notifications").insert(notifications as any);
      }
      toast({ title: "Post muvaffaqiyatli joylandi", description: "Ustoz yoki admin tasdiqlashini kuting" });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/feed");
    } catch (err: any) { toast({ title: "Xatolik", description: err.message || "Rasm yuklashda xatolik", variant: "destructive" }); setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-20 md:pb-8">
      <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="text-2xl font-bold">Yangi post yaratish</h1>
          <p className="text-sm text-muted-foreground mt-1">Loyihaingizni iTech Academy hamjamiyati bilan baham ko'ring. Barcha yangi postlar moderatorlar tomonidan ko'rib chiqiladi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media section */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Image className="h-4 w-4" /> Media fayllar</h2>
            <p className="text-sm text-muted-foreground">Loyihangizning asosiy ko'rinishi uchun yuqori sifatli rasm yuklang.</p>
            <p className="text-sm font-medium">Loyiha muqovasi (Majburiy)</p>
            {previews.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground">Rasmlarni sudrab tartibini o'zgartiring · {previews.length}/{MAX_IMAGES}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      draggable
                      onDragStart={() => { dragIndex.current = i; }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                      onDragLeave={() => setDragOver(prev => (prev === i ? null : prev))}
                      onDrop={(e) => { e.preventDefault(); if (dragIndex.current !== null) reorder(dragIndex.current, i); dragIndex.current = null; setDragOver(null); }}
                      onDragEnd={() => { dragIndex.current = null; setDragOver(null); }}
                      className={`relative group aspect-video rounded-xl overflow-hidden border bg-muted cursor-move transition-all ${dragOver === i ? "border-primary ring-2 ring-primary/30 scale-[1.02]" : "border-border"}`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover pointer-events-none" />
                      <span className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-background/80 backdrop-blur text-[11px] font-semibold flex items-center justify-center border border-border/50">{i + 1}</span>
                      <span className="absolute bottom-1.5 left-1.5 h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical className="h-3 w-3" /></span>
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {images.length < MAX_IMAGES && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Upload className="h-6 w-6 text-primary" /></div>
                <div className="text-center"><p className="text-sm font-medium">Rasm yuklash uchun bosing yoki sudrab keling</p><p className="text-xs text-muted-foreground">PNG, JPG (Maks. 5MB) - 16:9 tavsiya etiladi</p></div>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          </div>

          {/* Details section */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Info className="h-4 w-4" /> Loyiha tafsilotlari</h2>
            <p className="text-sm text-muted-foreground">Sarlavha va loyihaning mazmuni haqida batafsil ma'lumot bering</p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Loyiha sarlavhasi</label>
              <input required className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Masalan: Aqlli uylar uchun mobil ilova dizayni" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Loyiha URL</label>
              <input required type="url" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://myproject.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Loyihaning to'liq tavsifi</label>
              <textarea rows={4} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Loyihangiz nima haqida? Qanday muammolarni hal qiladi va qanday texnologiyalardan foydalanilgan?" />
            </div>
          </div>

          {/* Footer actions */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-warning/10 text-warning text-xs font-medium">Holat: Kutilmoqda</span>
              <span className="text-xs text-muted-foreground">Tizimga avtomatik saqlandi</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate("/feed")} className="h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Bekor qilish</button>
              <button disabled={loading} type="submit" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] disabled:opacity-50 flex items-center gap-2">
                {loading ? <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Yuklanmoqda...</> : "Yuborish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
