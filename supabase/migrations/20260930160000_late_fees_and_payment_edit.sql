-- Multas de atraso (config) + campos para editar/estornar pagamento de propinas.
-- Aplicado directamente no Supabase (SQL Editor). Idempotente.

-- 1. Configuração de multas (linha única, id = 1)
CREATE TABLE IF NOT EXISTS public.late_fee_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'FIXED_ONCE',
    -- FIXED_ONCE | FIXED_MONTHLY | PERCENT_ONCE | PERCENT_MONTHLY | PERCENT_COMPOUND
  fixed_amount NUMERIC NOT NULL DEFAULT 50,
  percent NUMERIC NOT NULL DEFAULT 0,
  grace_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT late_fee_settings_singleton CHECK (id = 1)
);

INSERT INTO public.late_fee_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.late_fee_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "late_fee_settings_select" ON public.late_fee_settings;
CREATE POLICY "late_fee_settings_select" ON public.late_fee_settings
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "late_fee_settings_manage" ON public.late_fee_settings;
CREATE POLICY "late_fee_settings_manage" ON public.late_fee_settings
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'ADMIN'::public.app_role)
    OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
    OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
    OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'ADMIN'::public.app_role)
    OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
    OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
    OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
  );

-- 2. Campos de pagamento em tuition_fees (multa, desconto, valor pago, método,
--    e vínculo com o lançamento de receita — para estornar apagando o lançamento).
ALTER TABLE public.tuition_fees
  ADD COLUMN IF NOT EXISTS late_fee NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
