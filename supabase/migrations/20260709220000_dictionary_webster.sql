-- Migration: Noah Webster 1828 Dictionary
-- Cria a estrutura para armazenar e consultar o dicionário

-- 1. Tabela principal: definições em inglês
CREATE TABLE IF NOT EXISTS public.dictionary_webster (
  id SERIAL PRIMARY KEY,
  word TEXT UNIQUE NOT NULL,
  word_type TEXT,                    -- n., v., a., adv., etc.
  etymology TEXT,                    -- [L. educatio], etc.
  definition TEXT NOT NULL,          -- definição completa
  page_number INTEGER,               -- página no original
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dictionary_word 
  ON public.dictionary_webster USING btree (word);
CREATE INDEX IF NOT EXISTS idx_dictionary_word_trgm 
  ON public.dictionary_webster USING gin (word gin_trgm_ops);

-- 2. Cache de traduções PT-BR
CREATE TABLE IF NOT EXISTS public.dictionary_translations (
  id SERIAL PRIMARY KEY,
  word_id INTEGER NOT NULL REFERENCES public.dictionary_webster(id) ON DELETE CASCADE,
  definition_pt TEXT NOT NULL,        -- definição traduzida
  translated_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'llm',          -- 'llm', 'manual', 'batch'
  UNIQUE(word_id)
);

CREATE INDEX IF NOT EXISTS idx_dict_translations_word_id 
  ON public.dictionary_translations(word_id);

-- 3. Tabela de cache de consultas (para estatísticas)
CREATE TABLE IF NOT EXISTS public.dictionary_queries (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  found BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'exact',        -- 'exact', 'fuzzy', 'not_found'
  requested_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dict_queries_word 
  ON public.dictionary_queries(word);
CREATE INDEX IF NOT EXISTS idx_dict_queries_date 
  ON public.dictionary_queries(requested_at);

-- 4. Enable RLS
ALTER TABLE public.dictionary_webster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dictionary_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dictionary_queries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: leitura permitida para todos autenticados
CREATE POLICY "Dictionary select for authenticated" 
  ON public.dictionary_webster FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Dictionary translations select for authenticated" 
  ON public.dictionary_translations FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Dictionary queries insert for authenticated" 
  ON public.dictionary_queries FOR INSERT 
  TO authenticated WITH CHECK (true);

-- 6. Serviço: permitir tudo pra service_role (upload dos dados)
CREATE POLICY "Dictionary all for service_role" 
  ON public.dictionary_webster FOR ALL 
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Dictionary translations all for service_role" 
  ON public.dictionary_translations FOR ALL 
  TO service_role USING (true) WITH CHECK (true);

-- 7. Função de busca (para usar direto do banco)
CREATE OR REPLACE FUNCTION public.search_dictionary(search_word TEXT)
RETURNS TABLE (
  word TEXT,
  word_type TEXT,
  etymology TEXT,
  definition TEXT,
  page_number INTEGER,
  match_type TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- 1. Tenta busca exata
  RETURN QUERY
  SELECT d.word, d.word_type, d.etymology, d.definition, d.page_number, 'exact'::TEXT
  FROM public.dictionary_webster d
  WHERE d.word = lower(search_word);
  
  IF NOT FOUND THEN
    -- 2. Tenta LIKE (começa com a palavra)
    RETURN QUERY
    SELECT d.word, d.word_type, d.etymology, d.definition, d.page_number, 'prefix'::TEXT
    FROM public.dictionary_webster d
    WHERE d.word LIKE lower(search_word) || '%'
    ORDER BY length(d.word) ASC
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    -- 3. Tenta trigram (similaridade)
    RETURN QUERY
    SELECT d.word, d.word_type, d.etymology, d.definition, d.page_number, 'similar'::TEXT
    FROM public.dictionary_webster d
    WHERE d.word % lower(search_word)
    ORDER BY similarity(d.word, lower(search_word)) DESC
    LIMIT 1;
  END IF;
END;
$$;
