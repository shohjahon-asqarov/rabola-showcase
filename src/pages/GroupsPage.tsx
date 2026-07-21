import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Users, Crown, Plus, Search, Globe, Lock } from "lucide-react";
import type { Profile } from "@/lib/mock-data";
import { useState } from "react";

export default function GroupsPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const canCreateGroup = role === "teacher" || role === "admin" || role === "moderator";

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*");
      if (error) throw error;
      const teacherIds = [...new Set(data.map(g => g.teacher_id))];
      const { data: teachers } = await supabase.from("profiles").select("*").in("user_id", teacherIds);
      return data.map(g => ({ ...g, profiles: teachers?.find(t => t.user_id === g.teacher_id) || null }));
    },
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return (data || []) as Profile[];
    },
  });

  const filteredGroups = search
    ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  if (isLoading) return <div className="p-16 text-center"><span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /></div>;

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Akademik Guruhlar</h1>
          <p className="text-sm text-muted-foreground mt-1">iTech Academy ichidagi barcha faol o'quv va hamkorlik guruhlari.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="Nomi yoki ID bo'yicha..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {canCreateGroup && (
            <Link to="/groups/create" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Yangi guruh
            </Link>
          )}
        </div>
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-16 text-muted-foreground rounded-xl border border-border bg-card">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Guruhlar topilmadi</p>
          {canCreateGroup && <p className="text-sm mt-1">Yangi guruh yarating.</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredGroups.map((group, gi) => {
          const teacher = group.profiles;
          const members = allProfiles.filter(p => p.group_id === group.id);

          return (
            <div
              key={group.id}
              className="rounded-xl border border-border bg-card p-5 space-y-3 opacity-0 animate-fade-up hover:shadow-md transition-all"
              style={{ animationDelay: `${gi * 0.08}s`, animationFillMode: "forwards" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base">{group.name}</h2>
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {teacher?.firstname} {teacher?.lastname}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary">Ochiq</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {members.length} a'zo
                </span>
                <span className="text-xs text-muted-foreground">#{Math.floor(Math.random() * 9000 + 1000)}</span>
              </div>

              <Link
                to={`/groups/${group.id}`}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                <Users className="h-4 w-4" /> Qo'shilish
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
