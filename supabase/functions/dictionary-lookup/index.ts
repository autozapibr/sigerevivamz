import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface LookupResult {
  word: string;
  word_type: string | null;
  etymology: string | null;
  definition: string;
  definition_pt?: string;
  page_number: number | null;
  match_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { word, translate = false, exact = false } = body;

    if (!word || typeof word !== "string") {
      return new Response(
        JSON.stringify({ error: "Parâmetro 'word' é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanWord = word.toLowerCase().trim();
    let data: LookupResult | null = null;
    let matchType = "not_found";

    // 1. Busca exata
    const { data: exactMatch } = await supabase
      .from("dictionary_webster")
      .select("word, word_type, etymology, definition, page_number")
      .eq("word", cleanWord)
      .single();

    if (exactMatch) {
      data = { ...exactMatch, match_type: "exact" };
      matchType = "exact";
    }

    // 2. Fallback: LIKE prefix (a menos que exact=true)
    if (!data && !exact) {
      const { data: prefixMatch } = await supabase
        .from("dictionary_webster")
        .select("word, word_type, etymology, definition, page_number")
        .ilike("word", `${cleanWord}%`)
        .order("word", { ascending: true })
        .limit(1)
        .single();

      if (prefixMatch) {
        data = { ...prefixMatch, match_type: "prefix" };
        matchType = "prefix";
      }
    }

    // 3. Fallback: trigram similarity
    if (!data && !exact) {
      const { data: fuzzyMatch } = await supabase
        .from("dictionary_webster")
        .select("word, word_type, etymology, definition, page_number")
        .textSearch("word", cleanWord, { config: "portuguese" })
        .limit(1)
        .single();

      if (fuzzyMatch) {
        data = { ...fuzzyMatch, match_type: "similar" };
        matchType = "similar";
      }
    }

    // 4. Se encontrou e pediu tradução, busca o cache
    if (data && translate) {
      const { data: trans } = await supabase
        .from("dictionary_translations")
        .select("definition_pt")
        .eq("word_id", (
          await supabase
            .from("dictionary_webster")
            .select("id")
            .eq("word", data.word)
            .single()
        ).data?.id)
        .single();

      if (trans) {
        data.definition_pt = trans.definition_pt;
      }
    }

    // 5. Registra a consulta para estatísticas
    await supabase.from("dictionary_queries").insert({
      word: cleanWord,
      found: !!data,
      source: matchType,
    }).maybeSingle();

    if (!data) {
      return new Response(
        JSON.stringify({ word: cleanWord, found: false, error: "Palavra não encontrada no dicionário." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ...data, found: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Dictionary lookup error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
