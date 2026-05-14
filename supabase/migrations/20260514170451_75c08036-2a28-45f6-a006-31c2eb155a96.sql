-- Adicionar colunas para o sistema Moçambicano
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS acs1 NUMERIC,
ADD COLUMN IF NOT EXISTS acs2 NUMERIC,
ADD COLUMN IF NOT EXISTS acs3 NUMERIC,
ADD COLUMN IF NOT EXISTS at NUMERIC;

-- Comentários para documentação
COMMENT ON COLUMN public.grades.acs1 IS 'Primeira Avaliação Contínua e Sistemática';
COMMENT ON COLUMN public.grades.acs2 IS 'Segunda Avaliação Contínua e Sistemática';
COMMENT ON COLUMN public.grades.acs3 IS 'Terceira Avaliação Contínua e Sistemática';
COMMENT ON COLUMN public.grades.at IS 'Avaliação Trimestral';
