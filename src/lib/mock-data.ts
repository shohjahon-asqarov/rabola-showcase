import type { Tables, Enums } from "@/integrations/supabase/types";

export type UserRole = Enums<"app_role">;

export type Profile = Tables<"profiles"> & {
  role?: UserRole;
};

export type Post = Tables<"posts"> & {
  profiles?: Profile | null;
};

export type Comment = Tables<"comments"> & {
  profiles?: Profile | null;
};

export type Group = Tables<"groups"> & {
  profiles?: Profile | null;
  members_count?: number;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  moderator: "Moderator",
  teacher: "Ustoz",
  student: "O'quvchi",
};

export const roleColors: Record<UserRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  moderator: "bg-warning/10 text-warning",
  teacher: "bg-primary/10 text-primary",
  student: "bg-muted text-muted-foreground",
};
