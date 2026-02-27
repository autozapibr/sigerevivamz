import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated and has permission
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller role
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    const allowedRoles = ["ADMIN", "DIRETORIA", "SECRETARIA"];
    if (!callerRole || !allowedRoles.includes(callerRole.role)) {
      return new Response(JSON.stringify({ error: "Sem permissão para gerir utilizadores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...payload } = await req.json();

    // LIST USERS
    if (action === "list") {
      const { data: roles, error: rolesErr } = await adminClient
        .from("user_roles")
        .select("user_id, role");

      if (rolesErr) throw rolesErr;

      const { data: { users }, error: usersErr } = await adminClient.auth.admin.listUsers({
        perPage: 500,
      });

      if (usersErr) throw usersErr;

      const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) || []);

      const result = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.email?.split("@")[0] || "",
        role: roleMap.get(u.id) || "ALUNO",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed: !!u.email_confirmed_at,
      }));

      return new Response(JSON.stringify({ users: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE USER
    if (action === "create") {
      const { email, password, full_name, role } = payload;

      if (!email || !password || !full_name || !role) {
        return new Response(JSON.stringify({ error: "Campos obrigatórios: email, password, full_name, role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // SECRETARIA can only create certain roles
      if (callerRole.role === "SECRETARIA" && ["ADMIN", "DIRETORIA"].includes(role)) {
        return new Response(JSON.stringify({ error: "Secretaria não pode criar utilizadores Admin ou Diretoria" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      });

      if (createErr) throw createErr;

      // Assign role
      const { error: roleErr } = await adminClient
        .from("user_roles")
        .insert({ user_id: newUser.user.id, role });

      if (roleErr) throw roleErr;

      // Create profile
      await adminClient
        .from("profiles")
        .upsert({ user_id: newUser.user.id, full_name });

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE USER
    if (action === "delete") {
      const { user_id } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent self-deletion
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Não pode eliminar a própria conta" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: delErr } = await adminClient.auth.admin.deleteUser(user_id);
      if (delErr) throw delErr;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE ROLE
    if (action === "update_role") {
      const { user_id, role } = payload;
      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: "user_id e role obrigatórios" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (callerRole.role === "SECRETARIA" && ["ADMIN", "DIRETORIA"].includes(role)) {
        return new Response(JSON.stringify({ error: "Secretaria não pode atribuir Admin ou Diretoria" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert role
      const { error: upsertErr } = await adminClient
        .from("user_roles")
        .upsert({ user_id, role }, { onConflict: "user_id,role" });

      // If user already had a different role, update it
      if (upsertErr) {
        await adminClient
          .from("user_roles")
          .update({ role })
          .eq("user_id", user_id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESET PASSWORD
    if (action === "reset_password") {
      const { user_id, new_password } = payload;
      if (!user_id || !new_password) {
        return new Response(JSON.stringify({ error: "user_id e new_password obrigatórios" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: resetErr } = await adminClient.auth.admin.updateUserById(user_id, {
        password: new_password,
      });

      if (resetErr) throw resetErr;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Acção inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
