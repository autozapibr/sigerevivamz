import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MASTER_ACCOUNTS = [
  { email: "admin@escolareviva.com", full_name: "Administrador SIGER", role: "ADMIN" },
  { email: "diretoria@escolareviva.com", full_name: "Director Escolar", role: "DIRETORIA" },
  { email: "secretaria@escolareviva.com", full_name: "Secretária Escolar", role: "SECRETARIA" },
  { email: "financeiro@escolareviva.com", full_name: "Gestor Financeiro", role: "FINANCEIRO" },
  { email: "professor@escolareviva.com", full_name: "Professor Exemplo", role: "PROFESSOR" },
  { email: "responsavel@escolareviva.com", full_name: "Encarregado de Educação", role: "ENCARREGADO" },
  { email: "aluno@escolareviva.com", full_name: "Aluno Exemplo", role: "ALUNO" },
];

const DEFAULT_PASSWORD = "654321";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Safety: check if user_roles already has entries
    const { data: existingRoles, error: rolesErr } = await adminClient
      .from("user_roles")
      .select("id")
      .limit(1);

    if (rolesErr) throw rolesErr;

    // Optional: allow force re-seed via body param
    let force = false;
    try {
      const body = await req.json();
      force = body?.force === true;
    } catch {
      // no body, that's fine
    }

    if (existingRoles && existingRoles.length > 0 && !force) {
      return new Response(
        JSON.stringify({
          error: "Já existem utilizadores no sistema. Use force=true para recriar.",
          existing_count: existingRoles.length,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ email: string; status: string; user_id?: string; error?: string }> = [];

    for (const account of MASTER_ACCOUNTS) {
      try {
        // Check if user already exists
        const { data: { users: existingUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const existing = existingUsers?.find((u: any) => u.email === account.email);

        let userId: string;

        if (existing) {
          // Update existing user password and metadata
          const { error: updateErr } = await adminClient.auth.admin.updateUserById(existing.id, {
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: account.full_name, role: account.role },
          });
          if (updateErr) throw updateErr;
          userId = existing.id;
        } else {
          // Create new user
          const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
            email: account.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: account.full_name, role: account.role },
          });
          if (createErr) throw createErr;
          userId = newUser.user.id;
        }

        // Upsert role (delete old + insert new to handle role changes)
        await adminClient.from("user_roles").delete().eq("user_id", userId);
        const { error: roleErr } = await adminClient
          .from("user_roles")
          .insert({ user_id: userId, role: account.role });
        if (roleErr) throw roleErr;

        // Upsert profile
        const { error: profileErr } = await adminClient
          .from("profiles")
          .upsert({ user_id: userId, full_name: account.full_name });
        if (profileErr) throw profileErr;

        results.push({ email: account.email, status: "ok", user_id: userId });
      } catch (err: any) {
        results.push({ email: account.email, status: "error", error: err.message });
      }
    }

    const successCount = results.filter((r) => r.status === "ok").length;

    return new Response(
      JSON.stringify({
        message: `${successCount}/${MASTER_ACCOUNTS.length} contas criadas/atualizadas com sucesso`,
        password: DEFAULT_PASSWORD,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
