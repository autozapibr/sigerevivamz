// Backup semanal automático da base de dados (apenas tabelas de domínio público)
// Exporta para o bucket privado `database-backups` em formato JSON.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Tabelas a incluir no backup (NUNCA tabelas de sistema/auth)
const BACKUP_TABLES = [
  "academic_years",
  "classes",
  "subjects",
  "students",
  "guardians",
  "student_guardians",
  "student_enrollments",
  "enrollments",
  "teachers",
  "employees",
  "attendance",
  "grades",
  "calendar_events",
  "announcements",
  "lesson_plans",
  "lesson_plan_config",
  "lesson_plan_fields",
  "financial_categories",
  "payment_agreements",
  "agreement_installments",
  "scholarships",
  "student_scholarships",
  "contract_signatures",
  "communication_history",
  "scheduled_reminders",
  "exam_notifications",
  "user_roles",
  "registration_invitations",
  "role_module_access",
  "integration_settings",
  "roadmap_items",
  "audit_log",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // Auth: aceita JWT de ADMIN/DIRETORIA OU chamada interna do pg_cron
  // (pg_cron envia o anon key como apikey + um body opcional)
  const authHeader = req.headers.get("authorization") ?? "";
  const isCron = req.headers.get("x-cron-secret") === Deno.env.get("CRON_SECRET");

  let isAuthorizedHuman = false;
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (user) {
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const allowed = (roles ?? []).some(
        (r: any) => r.role === "ADMIN" || r.role === "DIRETORIA",
      );
      isAuthorizedHuman = allowed;
    }
  }

  if (!isCron && !isAuthorizedHuman) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const snapshot: Record<string, unknown[]> = {};
    const counts: Record<string, number> = {};

    for (const table of BACKUP_TABLES) {
      const { data, error } = await admin
        .from(table)
        .select("*")
        .limit(50000);
      if (error) {
        console.error(`[backup] erro ao ler ${table}:`, error.message);
        snapshot[table] = [];
        counts[table] = 0;
        continue;
      }
      snapshot[table] = data ?? [];
      counts[table] = (data ?? []).length;
    }

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${ts}.json`;
    const payload = JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        version: 1,
        counts,
        data: snapshot,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });

    // Garantir bucket
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === "database-backups")) {
      await admin.storage.createBucket("database-backups", { public: false });
    }

    const { error: upErr } = await admin.storage
      .from("database-backups")
      .upload(filename, blob, {
        contentType: "application/json",
        upsert: false,
      });
    if (upErr) throw upErr;

    // Limpeza: manter apenas os últimos 12 backups (≈3 meses semanais)
    const { data: list } = await admin.storage
      .from("database-backups")
      .list("", { limit: 1000, sortBy: { column: "name", order: "desc" } });
    if (list && list.length > 12) {
      const toDelete = list.slice(12).map((f) => f.name);
      await admin.storage.from("database-backups").remove(toDelete);
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return new Response(
      JSON.stringify({
        success: true,
        filename,
        tables: BACKUP_TABLES.length,
        total_rows: total,
        counts,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("[backup] falhou:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});