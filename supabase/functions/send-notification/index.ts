import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NotificationSchema = z.object({
  type: z.enum(["whatsapp", "sms"]),
  phone: z.string().min(9).max(20),
  message: z.string().min(1).max(2000),
  studentId: z.number().int().positive().optional(),
  tuitionFeeId: z.number().int().positive().optional(),
  agreementId: z.number().int().positive().optional(),
  recipientName: z.string().min(1).max(200).optional(),
});

const BulkRequestSchema = z.object({
  notifications: z.array(NotificationSchema).max(50).optional(),
}).passthrough();

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- AUTHENTICATION ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado. Por favor, faça login." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    // --- AUTHORIZATION ---
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const allowedRoles = ["ADMIN", "DIRETORIA", "FINANCEIRO", "SECRETARIA"];
    const userRoles = roleData?.map((r: { role: string }) => r.role) || [];
    if (!userRoles.some((role: string) => allowedRoles.includes(role))) {
      return new Response(
        JSON.stringify({ error: "Sem permissão para enviar notificações." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- INPUT VALIDATION ---
    const rawBody = await req.json();
    let notifications: z.infer<typeof NotificationSchema>[];

    if (rawBody.notifications) {
      const parsed = BulkRequestSchema.parse(rawBody);
      notifications = parsed.notifications || [];
    } else {
      notifications = [NotificationSchema.parse(rawBody)];
    }

    // --- SERVICE CLIENT (for DB writes and reading non-sensitive config) ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Read sensitive credentials from Supabase Secrets (env vars)
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Configuração da API de mensagens não encontrada",
          details: "Configure as variáveis EVOLUTION_API_URL e EVOLUTION_API_KEY nos Supabase Secrets",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read non-sensitive config (instance name) from DB
    const { data: integrationData } = await supabase
      .from("integration_settings")
      .select("instance_name")
      .eq("integration_name", "evolution_api")
      .single();

    const EVOLUTION_INSTANCE = integrationData?.instance_name || "SGE-REVIVA";

    const results: Array<{ success: boolean; phone: string; messageId?: string; error?: string }> = [];

    for (const notification of notifications) {
      const { type, phone, message, studentId, tuitionFeeId, agreementId, recipientName } = notification;

      let cleanPhone = phone.replace(/\D/g, "");
      if (!cleanPhone.startsWith("258")) {
        cleanPhone = "258" + cleanPhone;
      }

      try {
        let externalId: string | undefined;
        let externalResponse: Record<string, unknown> | undefined;
        let status: "ENVIADO" | "FALHOU" = "ENVIADO";

        if (type === "whatsapp") {
          const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify({ number: cleanPhone, text: message }),
          });

          const responseData = await evolutionResponse.json();

          if (!evolutionResponse.ok) {
            console.error("Evolution API error:", responseData);
            status = "FALHOU";
            externalResponse = responseData;
          } else {
            externalId = responseData.key?.id || responseData.messageId;
            externalResponse = responseData;
          }
        } else {
          console.log(`SMS placeholder to ${cleanPhone}`);
        }

        // Log communication with authenticated user
        await supabase.from("communication_history").insert({
          student_id: studentId,
          tuition_fee_id: tuitionFeeId,
          agreement_id: agreementId,
          communication_type: type.toUpperCase(),
          recipient_name: recipientName || "Encarregado",
          recipient_phone: cleanPhone,
          message_content: message,
          status,
          external_id: externalId,
          external_response: externalResponse,
          sent_by: userId,
          sent_at: new Date().toISOString(),
        });

        results.push({
          success: status === "ENVIADO",
          phone: cleanPhone,
          messageId: externalId,
          error: status === "FALHOU" ? "Falha ao enviar mensagem" : undefined,
        });
      } catch (err) {
        console.error(`Error sending to ${cleanPhone}:`, err);
        results.push({
          success: false,
          phone: cleanPhone,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        message: `${successCount} mensagem(ns) enviada(s), ${failCount} falha(s)`,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Dados inválidos",
          details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
