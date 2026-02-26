import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Token inválido." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check role
    const userId = claimsData.user.id;
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const allowedRoles = ["ADMIN", "DIRETORIA", "PROFESSOR", "PEDAGOGICO"];
    const userRoles = roleData?.map((r: any) => r.role) || [];
    if (!userRoles.some((r: string) => allowedRoles.includes(r))) {
      return new Response(
        JSON.stringify({ error: "Sem permissão para gerar planos de aula." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { formData, className, subjectName, teacherName } = await req.json();

    // Fetch admin config
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: configs } = await serviceClient
      .from("lesson_plan_config")
      .select("config_key, config_value");

    const configMap: Record<string, string> = {};
    configs?.forEach((c: any) => {
      configMap[c.config_key] = c.config_value;
    });

    const systemPrompt = configMap["system_prompt"] || "Gere um plano de aula AEP.";
    const model = configMap["model"] || "google/gemini-2.5-flash";
    const temperature = parseFloat(configMap["temperature"] || "0.4");
    const maxTokens = parseInt(configMap["max_tokens"] || "4000");

    // Fetch active training documents content
    let trainingContext = "";
    try {
      const { data: trainingDocs } = await serviceClient
        .from("lesson_plan_training_docs")
        .select("file_name, file_path, mime_type")
        .eq("is_active", true);

      if (trainingDocs && trainingDocs.length > 0) {
        const docContents: string[] = [];

        for (const doc of trainingDocs) {
          try {
            // Only read text-based files directly
            const isTextBased = doc.mime_type?.includes("text") || 
              doc.file_name.endsWith(".txt") || 
              doc.file_name.endsWith(".md");

            if (isTextBased) {
              const { data: fileData, error: dlError } = await serviceClient.storage
                .from("aep-training-docs")
                .download(doc.file_path);

              if (!dlError && fileData) {
                const text = await fileData.text();
                // Limit each doc to ~3000 chars to avoid token overflow
                const trimmed = text.length > 3000 ? text.substring(0, 3000) + "\n...[truncado]" : text;
                docContents.push(`--- Documento: ${doc.file_name} ---\n${trimmed}`);
              }
            } else {
              // For PDF/DOCX, include filename as reference
              docContents.push(`--- Documento de referência: ${doc.file_name} (formato ${doc.mime_type}) ---\nEste documento contém material sobre a Abordagem Educacional por Princípios (AEP). Use os princípios da AEP conforme descrito no prompt do sistema.`);
            }
          } catch (docErr) {
            console.warn(`Error reading training doc ${doc.file_name}:`, docErr);
          }
        }

        if (docContents.length > 0) {
          trainingContext = "\n\n=== MATERIAL DE REFERÊNCIA AEP ===\nOs seguintes documentos contêm informações sobre a Abordagem Educacional por Princípios que deve utilizar como base:\n\n" + docContents.join("\n\n");
        }
      }
    } catch (err) {
      console.warn("Error fetching training docs:", err);
    }

    // Build full system prompt with training context
    const fullSystemPrompt = systemPrompt + trainingContext;

    // Build user prompt from form data
    const formEntries = Object.entries(formData as Record<string, string | string[]>)
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return `- ${key}: ${displayValue}`;
      })
      .join("\n");

    const userPrompt = `Gere um plano de aula AEP completo com os seguintes dados:

Classe/Turma: ${className || "Não especificada"}
Disciplina: ${subjectName || "Não especificada"}
Professor: ${teacherName || "Não especificado"}

DADOS DO FORMULÁRIO:
${formEntries}

Retorne APENAS o HTML do plano de aula, bem formatado com estilos inline para impressão.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar plano de aula com IA");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-lesson-plan:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar requisição" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
