import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "whatsapp" | "sms";
  phone: string;
  message: string;
  studentId?: number;
  tuitionFeeId?: number;
  agreementId?: number;
  recipientName?: string;
}

interface BulkNotificationRequest {
  notifications: NotificationRequest[];
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch Evolution API credentials from integration_settings table
    const { data: integrationData, error: integrationError } = await supabase
      .from("integration_settings")
      .select("api_url, api_key, instance_name")
      .eq("integration_name", "evolution_api")
      .single();

    if (integrationError || !integrationData?.api_url || !integrationData?.api_key) {
      console.error("Evolution API credentials not configured:", integrationError);
      return new Response(
        JSON.stringify({ 
          error: "Configuração da API de mensagens não encontrada",
          details: "Configure a Evolution API nas Configurações > Integrações"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const EVOLUTION_API_URL = integrationData.api_url;
    const EVOLUTION_API_KEY = integrationData.api_key;
    const EVOLUTION_INSTANCE = integrationData.instance_name || "SGE-REVIVA";
    const body = await req.json();

    // Handle single or bulk notifications
    const notifications: NotificationRequest[] = body.notifications || [body];
    const results: Array<{ success: boolean; phone: string; messageId?: string; error?: string }> = [];

    for (const notification of notifications) {
      const { type, phone, message, studentId, tuitionFeeId, agreementId, recipientName } = notification;

      // Clean and format phone number for Mozambique
      let cleanPhone = phone.replace(/\D/g, "");
      
      // Add Mozambique country code if not present
      if (!cleanPhone.startsWith("258")) {
        cleanPhone = "258" + cleanPhone;
      }

      try {
        let externalId: string | undefined;
        let externalResponse: Record<string, unknown> | undefined;
        let status: "ENVIADO" | "FALHOU" = "ENVIADO";

        if (type === "whatsapp") {
          // Send via Evolution API
          const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
              number: cleanPhone,
              text: message,
            }),
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
          // SMS placeholder - integrate with SMS gateway
          console.log(`SMS would be sent to ${cleanPhone}: ${message}`);
          // For now, mark as sent (implement SMS gateway later)
        }

        // Log communication in database
        const { error: logError } = await supabase
          .from("communication_history")
          .insert({
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
            sent_at: new Date().toISOString(),
          });

        if (logError) {
          console.error("Error logging communication:", logError);
        }

        results.push({
          success: status === "ENVIADO",
          phone: cleanPhone,
          messageId: externalId,
          error: status === "FALHOU" ? "Falha ao enviar mensagem" : undefined,
        });

      } catch (err) {
        console.error(`Error sending to ${phone}:`, err);
        results.push({
          success: false,
          phone,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        message: `${successCount} mensagem(ns) enviada(s), ${failCount} falha(s)`,
        results,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
