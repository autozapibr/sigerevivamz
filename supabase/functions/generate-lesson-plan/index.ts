import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch word definition from Webster's 1828 Dictionary
async function fetchWebsterDefinition(word: string): Promise<string | null> {
  try {
    const url = `https://webstersdictionary1828.com/Dictionary/${encodeURIComponent(word)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "SGE-REVIVA-LessonPlanGenerator/1.0" },
    });
    if (!response.ok) return null;

    const html = await response.text();
    
    // Extract definition from the page HTML
    const defMatch = html.match(/<p[^>]*class="[^"]*defword[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                     html.match(/<div[^>]*class="[^"]*definition[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/<p[^>]*>([\s\S]{50,500}?)<\/p>/i);
    
    if (defMatch) {
      // Strip HTML tags
      const cleanDef = defMatch[1].replace(/<[^>]+>/g, "").trim();
      if (cleanDef.length > 20) {
        return cleanDef.substring(0, 800);
      }
    }
    return null;
  } catch (err) {
    console.warn(`Error fetching Webster definition for "${word}":`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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
      }
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

    // Extract key words from the topic/subject for Webster 1828 lookup
    let websterContext = "";
    try {
      const tema = (formData as Record<string, any>)["Tema da Aula"] || 
                   (formData as Record<string, any>)["tema_aula"] || 
                   subjectName || "";
      
      if (tema) {
        // Extract meaningful words (skip short/common words)
        const stopWords = new Set(["de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "a", "o", "e", "ou", "um", "uma", "para", "com", "por", "se", "que", "os", "as", "ao", "à", "é", "são"]);
        const words = tema.split(/[\s,;:]+/)
          .map((w: string) => w.trim())
          .filter((w: string) => w.length > 3 && !stopWords.has(w.toLowerCase()));
        
        // Lookup up to 3 key words
        const lookupWords = words.slice(0, 3);
        const definitions: string[] = [];
        
        for (const word of lookupWords) {
          console.log(`Looking up Webster 1828 definition for: ${word}`);
          const def = await fetchWebsterDefinition(word);
          if (def) {
            definitions.push(`**${word}** (Webster 1828): ${def}`);
          }
        }
        
        if (definitions.length > 0) {
          websterContext = "\n\n=== DEFINIÇÕES DO DICIONÁRIO NOAH WEBSTER 1828 ===\nAs seguintes definições foram consultadas no Dicionário Webster 1828 (webstersdictionary1828.com). Utilize estas definições no passo PESQUISAR do plano de aula, traduzindo para o Português de Moçambique:\n\n" + definitions.join("\n\n");
        }
      }
    } catch (err) {
      console.warn("Error fetching Webster definitions:", err);
    }

    const fullSystemPrompt = systemPrompt + trainingContext + websterContext;

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

INSTRUÇÕES IMPORTANTES:
1. No passo PESQUISAR, inclua SEMPRE a definição das palavras-chave do tema consultadas no Dicionário Noah Webster 1828, traduzidas para o Português de Moçambique.
2. Utilize as ferramentas AEP selecionadas pelo professor como parte da metodologia do plano.
3. Inclua referências bíblicas da versão NAA (Nova Almeida Atualizada) alinhadas ao princípio escolhido.
4. Consulte e siga o material de referência AEP fornecido no contexto do sistema.
5. Busque na base curricular nacional de Moçambique as 2 competências que devem ser desenvolvidas com este tema.
6. Se a Ideia-Guia não foi fornecida, gere 3 sugestões no início do plano.
7. Se os Objectivos/Competências não foram fornecidos, gere-os automaticamente.
8. Organize o plano seguindo os 4 passos PRRR: PESQUISAR → RACIOCINAR → RELACIONAR → REGISTAR.

FORMATO DE SAÍDA:
- Retorne HTML bem formatado com estilos inline para impressão.
- Use emojis/ícones para tornar o plano visualmente atrativo: 📖 para pesquisar, 🧠 para raciocinar, 🔗 para relacionar, ✍️ para registar, 📌 para objectivos, 🔑 para palavras-chave, ✝️ para versículos, 💡 para ideia-guia, 🛠️ para ferramentas.
- Use numeração, recuos, bullets e tamanhos de fonte diferenciados.
- Use <h1> para título principal, <h2> para secções dos 4 passos, <h3> para sub-secções.
- Use <blockquote> para versículos bíblicos.
- Use <table> para tabelas de dados quando aplicável.
- Use <ul>/<ol> para listas organizadas.
- O plano deve ser completo e detalhado, pronto para o professor utilizar em sala de aula.`;

    // Determine API endpoint and key based on provider
    let apiUrl: string;
    let apiKey: string;
    let requestModel = model;

    if (llmProvider === "openai") {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      const { data: openaiSetting } = await serviceClient
        .from("integration_settings")
        .select("api_key")
        .eq("integration_name", "openai")
        .single();
      apiKey = openaiSetting?.api_key || Deno.env.get("OPENAI_API_KEY") || "";
      if (!apiKey) throw new Error("Chave API da OpenAI não configurada.");
    } else if (llmProvider === "google") {
      const { data: googleSetting } = await serviceClient
        .from("integration_settings")
        .select("api_key")
        .eq("integration_name", "google_ai")
        .single();
      const googleKey = googleSetting?.api_key;
      if (!googleKey) throw new Error("Chave API do Google AI não configurada.");

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
