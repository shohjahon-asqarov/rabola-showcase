import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isBanned: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    gender: string;
    birthdate: string;
    region: string;
    username: string;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: "student",
  isAuthenticated: false,
  isBanned: false,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: r } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (p) {
      setProfile({ ...p, role: r?.role || "student" });
      setIsBanned(!!(p as any).is_banned);
      if ((p as any).is_banned) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        return;
      }
    }
    setRole((r?.role as UserRole) || "student");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          setTimeout(() => fetchProfile(u.id), 0);
        } else {
          setProfile(null);
          setRole("student");
          setIsBanned(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    
    // Check ban status
    if (data.user) {
      const { data: p } = await supabase.from("profiles").select("is_banned").eq("user_id", data.user.id).single();
      if (p?.is_banned) {
        await supabase.auth.signOut();
        return "Sizning hisobingiz ban qilingan. Administrator bilan bog'laning.";
      }
    }
    return null;
  };

  const register = async (data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    gender: string;
    birthdate: string;
    region: string;
    username: string;
  }): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          gender: data.gender,
          birthdate: data.birthdate,
          region: data.region,
          username: data.username,
        },
      },
    });
    return error ? error.message : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole("student");
    setIsBanned(false);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAuthenticated: !!user,
        isBanned,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
