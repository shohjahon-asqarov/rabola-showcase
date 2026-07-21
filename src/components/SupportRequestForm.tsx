import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";

export default function SupportRequestForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!user || !message.trim()) {
      toast({ title: "Xatolik", description: "Xabarni yozing", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("support_requests").insert({
        user_id: user.id,
        message: message.trim(),
      } as any);
      if (error) throw error;

      // Send notification to all admins and teachers
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "teacher", "moderator"]);

      if (adminRoles) {
        const notifications = adminRoles.map(r => ({
          user_id: r.user_id,
          title: "Yangi so'rov keldi",
          message: message.trim().slice(0, 100),
          type: "support_request",
        }));
        await supabase.from("notifications").insert(notifications as any);
      }

      toast({ title: "Muvaffaqiyat", description: "So'rovingiz yuborildi" });
      setMessage("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["support-requests"] });
    } catch (err: any) {
      toast({ title: "Xatolik", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-11 rounded-xl border border-border bg-card text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
      >
        <MessageSquare className="h-4 w-4" /> So'rov yuborish
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" /> So'rov yuborish
      </h3>
      <textarea
        rows={3}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Muammoingizni yozing..."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => { setOpen(false); setMessage(""); }}
          className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" /> Yuborish
            </>
          )}
        </button>
      </div>
    </div>
  );
}
