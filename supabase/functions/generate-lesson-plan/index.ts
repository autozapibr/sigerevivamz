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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    let isAuthenticated = false;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      
      // Skip auth validation if the token is the anon key itself (demo mode)
      if (token !== supabaseAnonKey) {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });

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
        isAuthenticated = true;
      }
    }

    // In demo mode (no auth), still allow the function to proceed

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
    const llmProvider = configMap["llm_provider"] || "lovable_ai";
    let model = configMap["model"] || "google/gemini-3-flash-preview";
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
            const isTextBased = doc.mime_type?.includes("text") || 
              doc.file_name.endsWith(".txt") || 
              doc.file_name.endsWith(".md");

            if (isTextBased) {
              const { data: fileData, error: dlError } = await serviceClient.storage
                .from("aep-training-docs")
                .download(doc.file_path);

              if (!dlError && fileData) {
                const text = await fileData.text();
                const trimmed = text.length > 3000 ? text.substring(0, 3000) + "\n...[truncado]" : text;
                docContents.push(`--- Documento: ${doc.file_name} ---\n${trimmed}`);
              }
            } else {
              docContents.push(`--- Documento de referência: ${doc.file_name} (formato ${doc.mime_type}) ---\nEste documento contém material sobre a Abordagem Educacional por Princípios (AEP).`);
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

    const fullSystemPrompt = systemPrompt + trainingContext;

    // Build user prompt
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

    // Determine API endpoint and key based on provider
    let apiUrl: string;
    let apiKey: string;
    let requestModel = model;

    if (llmProvider === "openai") {
      // Direct OpenAI
      apiUrl = "https://api.openai.com/v1/chat/completions";
      // Get key from integration_settings
      const { data: openaiSetting } = await serviceClient
        .from("integration_settings")
        .select("api_key")
        .eq("integration_name", "openai")
        .single();
      apiKey = openaiSetting?.api_key || Deno.env.get("OPENAI_API_KEY") || "";
      if (!apiKey) throw new Error("Chave API da OpenAI não configurada.");
    } else if (llmProvider === "google") {
      // Direct Google AI Studio - uses generateContent endpoint
      const { data: googleSetting } = await serviceClient
        .from("integration_settings")
        .select("api_key")
        .eq("integration_name", "google_ai")
        .single();
      const googleKey = googleSetting?.api_key;
      if (!googleKey) throw new Error("Chave API do Google AI não configurada.");

      // Google AI uses a different API format
      const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleKey}`;
      
      const googleResponse = await fetch(googleApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: fullSystemPrompt + "\n\n" + userPrompt }] }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (!googleResponse.ok) {
        const errText = await googleResponse.text();
        console.error("Google AI error:", googleResponse.status, errText);
        throw new Error("Erro ao gerar plano de aula com Google AI: " + errText);
      }

      const googleData = await googleResponse.json();
      const generatedContent = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return new Response(
        JSON.stringify({ success: true, content: generatedContent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Lovable AI Gateway (default)
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");
      // Model already has prefix like google/gemini-... or openai/gpt-...
      requestModel = model;
    }

    // OpenAI-compatible call (Lovable Gateway or direct OpenAI)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: requestModel,
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
      console.error("AI error:", response.status, errorText);
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
