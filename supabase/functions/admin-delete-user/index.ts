import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: roleData } = await userClient.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") throw new Error("Not admin");

    const { action, targetUserId } = await req.json();
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (action === "delete_user") {
      // Delete user data then auth user
      await adminClient.from("likes").delete().eq("user_id", targetUserId);
      await adminClient.from("comments").delete().eq("user_id", targetUserId);
      await adminClient.from("posts").delete().eq("user_id", targetUserId);
      await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
      await adminClient.from("profiles").delete().eq("user_id", targetUserId);
      await adminClient.auth.admin.deleteUser(targetUserId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_all_users") {
      // Delete all non-admin users
      const { data: adminRoles } = await adminClient.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = (adminRoles || []).map((r: any) => r.user_id);

      // Get all non-admin profiles
      const { data: profiles } = await adminClient.from("profiles").select("user_id");
      const nonAdminIds = (profiles || []).filter((p: any) => !adminIds.includes(p.user_id)).map((p: any) => p.user_id);

      if (nonAdminIds.length > 0) {
        await adminClient.from("likes").delete().in("user_id", nonAdminIds);
        await adminClient.from("comments").delete().in("user_id", nonAdminIds);
        await adminClient.from("posts").delete().in("user_id", nonAdminIds);
        await adminClient.from("user_roles").delete().in("user_id", nonAdminIds);
        await adminClient.from("profiles").delete().in("user_id", nonAdminIds);
        for (const uid of nonAdminIds) {
          await adminClient.auth.admin.deleteUser(uid);
        }
      }

      // Also delete orphan posts/likes/comments
      await adminClient.from("likes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await adminClient.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      return new Response(JSON.stringify({ success: true, deleted: nonAdminIds.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ban_user") {
      await adminClient.from("profiles").update({ is_banned: true }).eq("user_id", targetUserId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unban_user") {
      await adminClient.from("profiles").update({ is_banned: false }).eq("user_id", targetUserId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
