import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractRequest {
  type: "generate" | "customize";
  category: string;
  staffInfo?: {
    name: string;
    role: string;
    bi_number?: string;
    nuit?: string;
    address?: string;
    province?: string;
    district?: string;
    phone?: string;
    email?: string;
    salary?: number;
    contract_start?: string;
    contract_end?: string;
  };
  customInstructions?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, category, staffInfo, customInstructions }: ContractRequest = await req.json();

    const categoryDescriptions: Record<string, string> = {
      trabalho: "contrato de trabalho formal com todas as cláusulas laborais obrigatórias",
      voluntariado: "termo de voluntariado para organização sem fins lucrativos (escola)",
      estagio: "contrato de estágio curricular ou profissional",
      prestacao_servicos: "contrato de prestação de serviços autônomos",
    };

    const systemPrompt = `Você é um especialista jurídico moçambicano especializado em contratos de trabalho e termos legais para organizações educacionais sem fins lucrativos. 

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
${customInstructions}

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
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar contrato com IA");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-contract function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar requisição" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
