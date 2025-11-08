// deno-lint-ignore-file no-explicit-any
// Seed users and profiles with service role
// Endpoint: POST /functions/v1/seed-users
// Creates 4 users (DIRETORIA, SECRETARIA, FINANCEIRO, PROFESSOR) with password 123456

import { serve } from "https://deno.land/std@0.193.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "diretor@sge.mz", password: "123456", full_name: "Diretor SGE", role: "DIRETORIA" },
  { email: "secretaria@sge.mz", password: "123456", full_name: "Secretaria SGE", role: "SECRETARIA" },
  { email: "financeiro@sge.mz", password: "123456", full_name: "Financeiro SGE", role: "FINANCEIRO" },
  { email: "professor@sge.mz", password: "123456", full_name: "Professor SGE", role: "PROFESSOR" },
] as const;

type SeedResult = { email: string; role: string; status: "created" | "exists"; user_id: string };

async function findUserIdByEmail(email: string): Promise<string | null> {
  // List first 200 users and filter by email (sufficient for seeding in dev)
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  const user = data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  return user?.id ?? null;
}

async function ensureProfile(user_id: string, full_name: string) {
  const { error } = await adminClient.from("profiles").upsert(
    { user_id, full_name },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

async function ensureRole(user_id: string, role: string) {
  const { error } = await adminClient.from("user_roles").upsert(
    { user_id, role },
    { onConflict: "user_id,role" }
  );
  if (error) throw error;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const results: SeedResult[] = [];

    for (const u of USERS) {
      let userId = await findUserIdByEmail(u.email);
      let status: SeedResult["status"] = "exists";

      if (!userId) {
        const { data: created, error: createError } = await adminClient.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { full_name: u.full_name, role: u.role },
        });
        if (createError) throw createError;
        userId = created.user?.id || null;
        status = "created";
      }

      if (!userId) throw new Error(`Falha ao obter ID do usuário para ${u.email}`);

      await ensureProfile(userId, u.full_name);
      await ensureRole(userId, u.role);

      results.push({ email: u.email, role: u.role, status, user_id: userId });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        users: results,
        credentials: USERS.map((u) => ({ email: u.email, password: u.password, role: u.role })),
      }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
