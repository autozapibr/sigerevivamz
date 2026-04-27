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

/** Strip markdown code fences and stray HTML wrappers from AI output */
function cleanGeneratedHtml(raw: string): string {
  let cleaned = raw
    .replace(/^```html\s*/i, "")
    .replace(/^```\w*\s*/gm, "")
    .replace(/```\s*$/gm, "")
    .trim();
  return cleaned;
}

async function callLovableAi(systemPrompt: string, userPrompt: string, maxTokens: number, temperature: number, model: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
  if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      max_completion_tokens: maxTokens,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 402) throw new Error("PAYMENT_REQUIRED");
    const errText = await resp.text();
    console.error("AI error:", resp.status, errText);
    throw new Error("Erro ao gerar conteúdo com IA");
  }

  const data = await resp.json();
  return extractOpenAiCompatibleText(data?.choices?.[0]?.message?.content);
}

async function callDeepSeek(systemPrompt: string, userPrompt: string, maxTokens: number, temperature: number, model: string): Promise<string> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY") || "";
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY não configurada.");

  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 402) throw new Error("PAYMENT_REQUIRED");
    const errText = await resp.text();
    console.error("DeepSeek error:", resp.status, errText);
    throw new Error("Erro ao gerar conteúdo com DeepSeek: " + errText);
  }

  const data = await resp.json();
  return extractOpenAiCompatibleText(data?.choices?.[0]?.message?.content);
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
    const configMaxTokens = parseInt(configMap["max_tokens"] || "8192");

    // Strip provider prefix from model name for direct API calls
    const cleanModel = model.includes("/") ? model.split("/").pop()! : model;

    // ========== ASSIST MODE ==========
    if (mode === "assist") {
      console.log("Assist mode: generating field-specific content for:", assistFieldName);

      const assistSystemPrompt = `Você é um assistente pedagógico especializado na Abordagem Educacional por Princípios (AEP) para escolas cristãs em Moçambique.

REGRAS ABSOLUTAS:
- Responda APENAS com o conteúdo solicitado, nada mais.
- NÃO gere planos de aula completos.
- NÃO inclua cabeçalhos como "PLANO DE AULA", "OBJETIVOS", "FERRAMENTAS", etc.
- NÃO use markdown (sem \`\`\`, sem **, sem ##).
- NÃO use HTML (sem <div>, <p>, <h1>, etc.).
- Responda em texto puro simples.
- Use numeração simples (1., 2., 3.) quando aplicável.
- Seja conciso e directo.
- COMPLETE SEMPRE toda a resposta. Nunca corte no meio de uma frase.`;

      const assistUserPrompt = directPrompt || "";
      const assistMaxTokens = 3000;

      // Use AI for ALL assist fields - no hardcoded responses
      // This ensures biblical texts are relevant to the theme/principles
      let generatedContent = "";
      
      try {
        if (llmProvider === "google") {
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
            throw new Error("Google AI error");
          }

          const googleData = await googleResponse.json();
          generatedContent = extractGoogleGeneratedText(googleData);
        } else if (llmProvider === "openai") {
          const { data: openaiSetting } = await serviceClient
            .from("integration_settings")
            .select("api_key")
            .eq("integration_name", "openai")
            .single();
          const apiKey = openaiSetting?.api_key || Deno.env.get("OPENAI_API_KEY") || "";
          if (!apiKey) throw new Error("Chave API da OpenAI não configurada.");

          const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: cleanModel,
              messages: [
                { role: "system", content: assistSystemPrompt },
                { role: "user", content: assistUserPrompt },
              ],
              temperature: 0.3,
              max_tokens: assistMaxTokens,
              max_completion_tokens: assistMaxTokens,
            }),
          });

          if (!resp.ok) throw new Error("OpenAI error");
          const data = await resp.json();
          generatedContent = extractOpenAiCompatibleText(data?.choices?.[0]?.message?.content);
        } else if (llmProvider === "deepseek") {
          generatedContent = await callDeepSeek(assistSystemPrompt, assistUserPrompt, assistMaxTokens, 0.3, cleanModel);
        } else {
          // Lovable AI
          generatedContent = await callLovableAi(assistSystemPrompt, assistUserPrompt, assistMaxTokens, 0.3, model);
        }
      } catch (primaryErr: any) {
        if (primaryErr.message === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (primaryErr.message === "PAYMENT_REQUIRED") {
          return new Response(
            JSON.stringify({ error: "Créditos insuficientes." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Fallback to Lovable AI
        console.warn("Primary provider failed for assist, falling back to Lovable AI:", primaryErr.message);
        try {
          generatedContent = await callLovableAi(assistSystemPrompt, assistUserPrompt, assistMaxTokens, 0.3, "google/gemini-3-flash-preview");
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
          throw primaryErr;
        }
      }

      // Clean up any markdown/HTML artifacts
      generatedContent = generatedContent
        .replace(/```[\w]*\n?/g, "")
        .replace(/<[^>]*>/g, "")
        .trim();

      return new Response(
        JSON.stringify({ success: true, content: generatedContent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== FULL PLAN MODE (default) ==========
    // Ignore system_prompt from DB config — use unified prompt below as single source of truth
    const systemPrompt = `Você é um especialista em Abordagem Educacional por Princípios (AEP) para escolas cristãs em Moçambique. Gere planos de aula AEP completos, detalhados e prontos para uso em sala de aula.

REGRAS ABSOLUTAS DE LAYOUT:
- NÃO gere cabeçalhos institucionais (nome da escola, professor, turma, disciplina). Esses dados JÁ EXISTEM no documento — o frontend cria o cabeçalho.
- NÃO crie <div class="header-info">, tabelas de identificação, ou qualquer bloco com "Escola:", "Professor:", "Turma:", "Disciplina:".
- NÃO use <h1>. O título "PLANO DE AULA AEP" já existe no cabeçalho do documento.
- Comece DIRECTAMENTE com <h2>1. 💡 IDEIA-GUIA</h2> como primeira linha do seu output.
- Retorne APENAS HTML puro, sem markdown, sem code fences.`;

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
                const trimmed = text.length > 5000 ? text.substring(0, 5000) + "\n...[truncado]" : text;
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
          trainingContext = "\n\n=== MATERIAL DE REFERÊNCIA AEP ===\n" + docContents.join("\n\n");
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
          websterContext = "\n\n=== DEFINIÇÕES DO DICIONÁRIO NOAH WEBSTER 1828 ===\nUtilize estas definições no passo PESQUISAR, traduzindo para o Português de Moçambique:\n\n" + definitions.join("\n\n");
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

    const userPrompt = `Gere um plano de aula AEP COMPLETO com os seguintes dados:

Classe/Turma: ${className || "Não especificada"}
Disciplina: ${subjectName || "Não especificada"}
Professor: ${teacherName || "Não especificado"}

DADOS DO FORMULÁRIO:
${formEntries}

REGRAS DE IDIOMA E ESTILO:
- Escreva TODO o conteúdo em Português de Moçambique (PT-MZ).
- Prefira termos como: "actividade", "objectivo", "registo", "turma", "disciplina", "professor", "educando".

=== ESTRUTURA OBRIGATÓRIA (11 secções) ===

Comece DIRECTAMENTE com a secção 1. NÃO inclua cabeçalhos da escola/professor/turma/disciplina.

1. 💡 IDEIA-GUIA — Use apenas 1 ideia-guia final
2. 📌 OBJECTIVOS E COMPETÊNCIAS — 2 competências curriculares + 2 objectivos AEP
3. 🔑 PALAVRAS-CHAVE — As palavras-chave fornecidas
4. ✝️ TEXTOS BÍBLICOS — Versículos relevantes ao tema "${(formData as any)["Tema da Aula"] || (formData as any)["tema_aula"] || subjectName || ""}" (2 AT + 2 NT, versão NAA)
5. 🛠️ FERRAMENTAS AEP — Como cada ferramenta será utilizada
6. OS QUATRO PASSOS (PRRR) — Desenvolva extensivamente:
   📖 PASSO 1 — PESQUISAR: Definições Webster 1828, pesquisa bíblica, académica, perguntas orientadoras
   🧠 PASSO 2 — RACIOCINAR: Análise crítica, conexão princípios bíblicos, discussão guiada
   🔗 PASSO 3 — RELACIONAR: Aplicação prática em Moçambique, actividades colaborativas
   ✍️ PASSO 4 — REGISTAR: Actividades de registo, produção individual/grupo
7. 📚 MATERIAIS UTILIZADOS
8. 🔧 RECURSOS ADICIONAIS
9. 📝 AVALIAÇÕES — Critérios, instrumentos, formativa e somativa
10. 📋 OBSERVAÇÕES — Notas para o professor
11. 🎯 CONCLUSÃO — APLICAÇÃO FINAL — Síntese que entrelaça conteúdo com princípios AEP

=== EXEMPLO DE OUTPUT (primeiras 2 secções) ===
<h2>1. 💡 IDEIA-GUIA</h2>
<p>A criação revela a ordem e o propósito de Deus em cada elemento da natureza.</p>

<h2>2. 📌 OBJECTIVOS E COMPETÊNCIAS</h2>
<h3>Competências Curriculares</h3>
<ul>
<li>Identificar os componentes do ecossistema local.</li>
<li>Analisar relações de interdependência entre seres vivos.</li>
</ul>
<h3>Objectivos AEP</h3>
<ul>
<li>Reconhecer a soberania de Deus na criação.</li>
<li>Desenvolver responsabilidade individual na preservação ambiental.</li>
</ul>
=== FIM DO EXEMPLO ===

FORMATO DE SAÍDA:
- HTML puro, pronto para impressão A4. Fonte "Work Sans" (300 corpo, 600 títulos).
- <h2> para cada secção principal. <h3> para sub-secções dos 4 passos.
- <blockquote> para versículos bíblicos. <table> para dados tabulares.
- NÃO use markdown. NÃO envolva em code fences. NÃO use <h1>.
- O plano DEVE ser COMPLETO com TODAS as 11 secções. NÃO termine antes da secção 11.`;

    // Use higher token limit for full plan to ensure all 12 sections are generated
    const fullPlanMaxTokens = Math.max(configMaxTokens, 12000);

    // Determine API endpoint and key based on provider
    let generatedContent = "";

    if (llmProvider === "openai") {
      const { data: openaiSetting } = await serviceClient
        .from("integration_settings")
        .select("api_key")
        .eq("integration_name", "openai")
        .single();
      const apiKey = openaiSetting?.api_key || Deno.env.get("OPENAI_API_KEY") || "";
      if (!apiKey) throw new Error("Chave API da OpenAI não configurada.");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: cleanModel,
          messages: [
            { role: "system", content: fullSystemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: fullPlanMaxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI error:", response.status, errorText);
        throw new Error("Erro ao gerar plano de aula com OpenAI");
      }

      const data = await response.json();
      generatedContent = extractOpenAiCompatibleText(data?.choices?.[0]?.message?.content);
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
            maxOutputTokens: fullPlanMaxTokens,
          },
        }),
      });

      if (!googleResponse.ok) {
        const errText = await googleResponse.text();
        console.error("Google AI error:", googleResponse.status, errText);
        throw new Error("Erro ao gerar plano de aula com Google AI: " + errText);
      }

      const googleData = await googleResponse.json();
      generatedContent = extractGoogleGeneratedText(googleData);
    } else {
      // Lovable AI Gateway
      try {
        generatedContent = await callLovableAi(fullSystemPrompt, userPrompt, fullPlanMaxTokens, temperature, model);
      } catch (err: any) {
        if (err.message === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (err.message === "PAYMENT_REQUIRED") {
          return new Response(
            JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw err;
      }
    }

    // Clean markdown artifacts
    generatedContent = cleanGeneratedHtml(generatedContent);

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
