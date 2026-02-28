import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const StaffInfoSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(100),
  bi_number: z.string().max(20).optional(),
  nuit: z.string().max(15).optional(),
  address: z.string().max(300).optional(),
  province: z.string().max(50).optional(),
  district: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),
  salary: z.number().min(0).max(100000000).optional(),
  contract_start: z.string().max(10).optional(),
  contract_end: z.string().max(10).optional(),
}).optional();

const ContractRequestSchema = z.object({
  type: z.enum(["generate", "customize"]),
  category: z.string().min(1).max(50),
  staffInfo: StaffInfoSchema,
  customInstructions: z.string().max(3000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Validate JWT and check user role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado. Por favor, faça login.' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado.' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (roleError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões.' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedRoles = ['ADMIN', 'DIRETORIA', 'SECRETARIA'];
    const userRoles = roleData?.map((r: { role: string }) => r.role) || [];
    if (!userRoles.some((role: string) => allowedRoles.includes(role))) {
      return new Response(
        JSON.stringify({ error: 'Sem permissão para gerar contratos.' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- INPUT VALIDATION ---
    const rawBody = await req.json();
    const { type, category, staffInfo, customInstructions } = ContractRequestSchema.parse(rawBody);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const categoryDescriptions: Record<string, string> = {
      trabalho: "contrato de trabalho formal com todas as cláusulas laborais obrigatórias",
      voluntariado: "termo de voluntariado para organização sem fins lucrativos (escola)",
      estagio: "contrato de estágio curricular ou profissional",
      prestacao_servicos: "contrato de prestação de serviços autónomos",
    };

    const systemPrompt = `É um especialista jurídico moçambicano especializado em contratos de trabalho e termos legais para organizações educacionais sem fins lucrativos.

CONTEXTO:
- Organização: ESCOLA REVIVA (escola sem fins lucrativos em Moçambique)
- Moeda: Metical Moçambicano (MZN/MT)
- Legislação: Lei do Trabalho de Moçambique

REGRAS:
1. Use linguagem formal e jurídica em português de Moçambique
2. Inclua todas as cláusulas obrigatórias pela legislação moçambicana
3. Mantenha placeholders no formato {{CAMPO}} para dados dinâmicos
4. Estruture o documento com cabeçalho, identificação, cláusulas e assinaturas
5. Para contratos de voluntariado, enfatize a natureza não remunerada e sem vínculo empregatício
6. Seja conciso mas completo

PLACEHOLDERS DISPONÍVEIS:
- {{NOME_COMPLETO}} - Nome do colaborador
- {{BI_NUMERO}} - Número do Bilhete de Identidade
- {{NUIT}} - Número Único de Identificação Tributária
- {{ENDERECO}} - Endereço completo
- {{TELEFONE}} - Telefone de contacto
- {{EMAIL}} - E-mail
- {{FUNCAO}} - Função/Cargo
- {{DATA_INICIO}} - Data de início
- {{DATA_FIM}} - Data de término (se aplicável)
- {{SALARIO}} - Valor da remuneração
- {{SALARIO_EXTENSO}} - Valor por extenso
- {{NUMERO_CONTRATO}} - Número do contrato
- {{DATA_ATUAL}} - Data de emissão`;

    let userPrompt = "";

    if (type === "generate") {
      userPrompt = `Gere um ${categoryDescriptions[category] || "contrato"} completo e profissional.

${staffInfo ? `
DADOS DO COLABORADOR (para referência, use os placeholders):
- Nome: ${staffInfo.name || "{{NOME_COMPLETO}}"}
- Função: ${staffInfo.role || "{{FUNCAO}}"}
- BI: ${staffInfo.bi_number || "{{BI_NUMERO}}"}
- NUIT: ${staffInfo.nuit || "{{NUIT}}"}
- Endereço: ${staffInfo.address || "{{ENDERECO}}"}, ${staffInfo.district || ""}, ${staffInfo.province || ""}
- Telefone: ${staffInfo.phone || "{{TELEFONE}}"}
- E-mail: ${staffInfo.email || "{{EMAIL}}"}
${staffInfo.salary ? `- Salário: ${staffInfo.salary} MZN` : ""}
${staffInfo.contract_start ? `- Início: ${staffInfo.contract_start}` : ""}
${staffInfo.contract_end ? `- Término: ${staffInfo.contract_end}` : ""}
` : ""}

${customInstructions ? `INSTRUÇÕES ADICIONAIS: ${customInstructions}` : ""}

Retorne APENAS o HTML do contrato, bem formatado com estilos inline para impressão.`;

    } else if (type === "customize") {
      userPrompt = `Com base no tipo de contrato "${categoryDescriptions[category] || category}", personalize ou crie cláusulas específicas conforme solicitado:

INSTRUÇÕES DO USUÁRIO:
${customInstructions || "Sem instruções adicionais."}

${staffInfo ? `
DADOS DISPONÍVEIS:
- Nome: ${staffInfo.name}
- Função: ${staffInfo.role}
` : ""}

Retorne APENAS o HTML formatado com as cláusulas ou modificações solicitadas.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
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
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar contrato com IA");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Dados inválidos",
          details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.error("Error in generate-contract function:", error);
    const msg = error instanceof Error ? error.message : "Erro ao processar requisição";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
