import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    
    const defMatch = html.match(/<p[^>]*class="[^"]*defword[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                     html.match(/<div[^>]*class="[^"]*definition[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/<p[^>]*>([\s\S]{50,500}?)<\/p>/i);
    
    if (defMatch) {
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

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function extractGoogleGeneratedText(googleData: any): string {
  const parts = googleData?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function extractOpenAiCompatibleText(content: any): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item: any) => (typeof item?.text === "string" ? item.text : ""))
      .join("")
      .trim();
  }
  return "";
}

function isAssistResponseComplete(prompt: string, content: string): boolean {
  const nonEmptyLines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  if (prompt.includes("Apenas 4 linhas")) {
    return nonEmptyLines.length >= 4;
  }

  if (prompt.includes("Apenas 3 frases")) {
    return nonEmptyLines.length >= 3;
  }

  if (prompt.includes("\"1. ...\" até \"4. ...\"")) {
    return [1, 2, 3, 4].every((n) => new RegExp(`^\\s*${n}\\.\\s+`, "m").test(content));
  }

  return nonEmptyLines.length > 0;
}

async function fallbackAssistWithLovableAi(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
  if (!apiKey) return null;

  try {
    const fallbackResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
        max_completion_tokens: maxTokens,
      }),
    });

    if (!fallbackResponse.ok) return null;
    const fallbackData = await fallbackResponse.json();
    const fallbackContent = extractOpenAiCompatibleText(fallbackData?.choices?.[0]?.message?.content);
    return fallbackContent || null;
  } catch {
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
    const supabasePublishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const tokenPayload = decodeJwtPayload(token);
      const isAnonDemoToken =
        token === supabaseAnonKey ||
        token === supabasePublishableKey ||
        (tokenPayload?.role === "anon" && !tokenPayload?.sub);

      if (!isAnonDemoToken) {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });

        const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
        const userId = claimsData?.claims?.sub as string | undefined;

        if (claimsError || !userId) {
          return new Response(
            JSON.stringify({ error: "Token inválido." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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

    const body = await req.json();
    const { formData, className, subjectName, teacherName, mode, prompt: directPrompt, assistFieldName } = body;

    // Fetch admin config
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: configs } = await serviceClient
      .from("lesson_plan_config")
      .select("config_key, config_value");

    const configMap: Record<string, string> = {};
    configs?.forEach((c: any) => {
      configMap[c.config_key] = c.config_value;
    });

    const llmProvider = configMap["llm_provider"] || "lovable_ai";
    let model = configMap["model"] || "google/gemini-3-flash-preview";
    const temperature = parseFloat(configMap["temperature"] || "0.4");
    const maxTokens = parseInt(configMap["max_tokens"] || "4000");

    // Strip provider prefix from model name for direct API calls
    const cleanModel = model.includes("/") ? model.split("/").pop()! : model;

    // ========== ASSIST MODE ==========
    // When mode === 'assist', we use a simple system prompt and the direct prompt
    // without all the full lesson plan generation context.
    if (mode === "assist") {
      console.log("Assist mode: generating field-specific content");

      const assistSystemPrompt = `Você é um assistente pedagógico especializado na Abordagem Educacional por Princípios (AEP) para escolas cristãs em Moçambique.

REGRAS ABSOLUTAS:
- Responda APENAS com o conteúdo solicitado, nada mais.
- NÃO gere planos de aula completos.
- NÃO inclua cabeçalhos como "PLANO DE AULA", "OBJETIVOS", "FERRAMENTAS", etc.
- NÃO use markdown (sem \`\`\`, sem **, sem ##).
- NÃO use HTML (sem <div>, <p>, <h1>, etc.).
- Responda em texto puro simples.
- Use numeração simples (1., 2., 3.) quando aplicável.
- Seja conciso e directo.`;

      const assistUserPrompt = directPrompt || "";
      const assistMaxTokens = 2200;
      const temaMatch = assistUserPrompt.match(/tema\s+"([^"]+)"/i);
      const temaDaAula = temaMatch?.[1]?.trim() || "o tema da aula";

      // Respostas determinísticas para evitar cortes em campos críticos
      if (assistFieldName === "versiculos_biblicos") {
        const content = [
          "Génesis 2:15 - O Senhor Deus tomou o homem e o colocou no jardim do Éden para o cultivar e o guardar.",
          "Salmos 19:1 - Os céus proclamam a glória de Deus e o firmamento anuncia as obras das suas mãos.",
          "Romanos 1:20 - Os atributos invisíveis de Deus, o seu eterno poder e a sua divindade, claramente se reconhecem, desde a criação do mundo, sendo percebidos por meio das coisas que foram criadas.",
          "João 1:3 - Todas as coisas foram feitas por intermédio dele, e sem ele nada do que foi feito se fez.",
        ].join("\n");

        return new Response(
          JSON.stringify({ success: true, content }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (assistFieldName === "objetivos_competencias") {
        const content = [
          `1. Identificar e explicar os factores essenciais do processo de ${temaDaAula} no contexto do currículo nacional.`,
          `2. Aplicar conceitos de ${temaDaAula} para interpretar situações práticas do quotidiano e do meio ambiente local.`,
          `3. Reconhecer, à luz da AEP, a responsabilidade de mordomia na gestão dos recursos relacionados a ${temaDaAula}.`,
          `4. Demonstrar atitudes de carácter e autogoverno ao usar o conhecimento de ${temaDaAula} para servir a comunidade.`,
        ].join("\n");

        return new Response(
          JSON.stringify({ success: true, content }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (assistFieldName === "ideia_guia") {
        const content = [
          `A ${temaDaAula} revela a soberania de Deus na provisão para a vida e na ordem que sustenta toda a criação.`,
          `Compreender ${temaDaAula} é reconhecer a sabedoria divina e assumir a responsabilidade de mordomia sobre os recursos que Deus confiou ao ser humano.`,
          `O estudo de ${temaDaAula} testemunha o poder criador de Deus e mostra como toda a criação funciona em interdependência segundo os Seus princípios.`,
        ].join("\n\n");

        return new Response(
          JSON.stringify({ success: true, content }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call AI with minimal context
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

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${googleKey}`;
        
        const googleResponse = await fetch(googleApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: assistSystemPrompt + "\n\n" + assistUserPrompt }] }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: assistMaxTokens,
            },
          }),
        });

        if (!googleResponse.ok) {
          const errText = await googleResponse.text();
          console.error("Google AI assist error:", googleResponse.status, errText);
          throw new Error("Erro ao gerar conteúdo com Google AI: " + errText);
        }

        const googleData = await googleResponse.json();
        let generatedContent = extractGoogleGeneratedText(googleData);

        if (!isAssistResponseComplete(assistUserPrompt, generatedContent)) {
          const fallbackContent = await fallbackAssistWithLovableAi(assistSystemPrompt, assistUserPrompt, assistMaxTokens);
          if (fallbackContent) generatedContent = fallbackContent;
        }

        return new Response(
          JSON.stringify({ success: true, content: generatedContent }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
        apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
        if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");
        requestModel = model;
      }

      const assistRequestBody: Record<string, unknown> = {
        model: requestModel,
        messages: [
          { role: "system", content: assistSystemPrompt },
          { role: "user", content: assistUserPrompt },
        ],
        temperature: 0.3,
        max_tokens: assistMaxTokens,
      };

      // Compatibility for newer OpenAI-style reasoning models
      assistRequestBody.max_completion_tokens = assistMaxTokens;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assistRequestBody),
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
        console.error("AI assist error:", response.status, errorText);
        throw new Error("Erro ao gerar conteúdo com IA");
      }

      const data = await response.json();
      let generatedContent = extractOpenAiCompatibleText(data?.choices?.[0]?.message?.content);

      if (!isAssistResponseComplete(assistUserPrompt, generatedContent)) {
        const fallbackContent = await fallbackAssistWithLovableAi(assistSystemPrompt, assistUserPrompt, assistMaxTokens);
        if (fallbackContent) generatedContent = fallbackContent;
      }

      return new Response(
        JSON.stringify({ success: true, content: generatedContent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== FULL PLAN MODE (default) ==========
    const systemPrompt = configMap["system_prompt"] || "Gere um plano de aula AEP.";

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

    // Extract key words for Webster 1828 lookup
    let websterContext = "";
    try {
      const tema = (formData as Record<string, any>)["Tema da Aula"] || 
                   (formData as Record<string, any>)["tema_aula"] || 
                   subjectName || "";
      
      if (tema) {
        const stopWords = new Set(["de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "a", "o", "e", "ou", "um", "uma", "para", "com", "por", "se", "que", "os", "as", "ao", "à", "é", "são"]);
        const words = tema.split(/[\s,;:]+/)
          .map((w: string) => w.trim())
          .filter((w: string) => w.length > 3 && !stopWords.has(w.toLowerCase()));
        
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

      const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${googleKey}`;
      
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
      const generatedContent = extractGoogleGeneratedText(googleData);

      return new Response(
        JSON.stringify({ success: true, content: generatedContent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
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
