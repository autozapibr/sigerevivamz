-- Método de pagamento nos lançamentos do caixa, para a quebra por
-- Numerário / Carteira Móvel (e-Mola) / Banco nos relatórios.
-- Aplicado directamente no Supabase (SQL Editor). Idempotente.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Backfill: lançamentos antigos de propinas guardavam o método no fim da
-- descrição, ex.: "... (NUMERARIO)". Extrai para a nova coluna.
UPDATE public.transactions
SET payment_method = CASE
  WHEN description ILIKE '%(NUMERARIO)%' THEN 'NUMERARIO'
  WHEN description ILIKE '%(CARTEIRA_MOVEL)%' THEN 'CARTEIRA_MOVEL'
  WHEN description ILIKE '%(CONTA_BANCARIA)%' THEN 'CONTA_BANCARIA'
  ELSE payment_method
END
WHERE payment_method IS NULL
  AND description ~ '\((NUMERARIO|CARTEIRA_MOVEL|CONTA_BANCARIA)\)';

NOTIFY pgrst, 'reload schema';
