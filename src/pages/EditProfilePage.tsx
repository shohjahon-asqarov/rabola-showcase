import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Pencil, ImagePlus, X, ArrowLeft } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function EditProfilePage() {
  const { user, profile, isAuthenticated, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstname, setFirstname] = useState(profile?.firstname || "");
  const [lastname, setLastname] = useState(profile?.lastname || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) return <div className="container py-16 text-center"><span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /></div>;
  if (!isAuthenticated || !user || !profile) return <Navigate to="/auth" />;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updates: any = {};
      if (firstname.trim() !== profile.firstname) updates.firstname = firstname.trim();
      if (lastname.trim() !== profile.lastname) updates.lastname = lastname.trim();

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `avatars/${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("post-images").upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        updates.profile_image = `${SUPABASE_URL}/storage/v1/object/public/post-images/${path}`;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
        if (updateErr) throw updateErr;
        await refreshProfile();
        setSuccess("Profil yangilandi ✓");
      } else {
        setSuccess("O'zgarish yo'q");
      }
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    }
    setSaving(false);
  };

  const currentImage = preview || profile.profile_image || "";

  return (
    <div className="container py-6 sm:py-8 max-w-lg space-y-6 px-4 sm:px-6">
      <button onClick={() => navigate("/profile")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Profilga qaytish
      </button>

      <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
        <div className="text-center space-y-1">
          <Pencil className="h-8 w-8 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Profilni tahrirlash</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          {/* Profile image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {currentImage ? (
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border">
                  <img src={currentImage} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-border">
                  {profile.firstname?.[0]}{profile.lastname?.[0] || ""}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            {imageFile && (
              <button type="button" onClick={() => { setImageFile(null); setPreview(""); }} className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" /> Rasmni bekor qilish
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ism</label>
            <input
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={firstname}
              onChange={e => setFirstname(e.target.value)}
              placeholder="Ismingiz"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Familiya</label>
            <input
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={lastname}
              onChange={e => setLastname(e.target.value)}
              placeholder="Familiyangiz"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-primary">{success}</p>}

          <button disabled={saving} type="submit" className="w-full h-11 sm:h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50">
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
