import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Type, ImagePlus, X } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function CreateGroupPage() {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated || !user) return <Navigate to="/auth" />;
  if (role !== "teacher" && role !== "admin" && role !== "moderator") {
    return <Navigate to="/" />;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      let imageUrl = "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `groups/${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("post-images").upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        imageUrl = `${SUPABASE_URL}/storage/v1/object/public/post-images/${path}`;
      }

      const { error: insertErr } = await supabase.from("groups").insert({
        name: name.trim(),
        teacher_id: user.id,
        image: imageUrl,
      });
      if (insertErr) throw insertErr;

      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate("/groups");
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    }
    setLoading(false);
  };

  return (
    <div className="container py-8 max-w-lg">
      <div className="space-y-6 opacity-0 animate-fade-up">
        <div className="text-center space-y-1">
          <Users className="h-8 w-8 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Guruh ochish</h1>
          <p className="text-sm text-muted-foreground">Yangi guruh yarating va o'quvchilarni qo'shing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Guruh nomi</label>
            <input
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masalan: Frontend 1-guruh"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5"><ImagePlus className="h-3.5 w-3.5" /> Guruh rasmi</label>
            {preview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setPreview(""); }} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 py-8 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Rasm qo'shish</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button disabled={loading} type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50">
            {loading ? "Yaratilmoqda..." : "Guruh yaratish"}
          </button>
        </form>
      </div>
    </div>
  );
}
