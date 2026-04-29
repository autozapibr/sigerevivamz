
-- ============================================================
-- FASE 1 ROADMAP — Hardening de Segurança & Auditoria
-- ============================================================

-- 1) FIX search_path em funções SECURITY DEFINER faltantes (supaon_*)
CREATE OR REPLACE FUNCTION public.supaon_insert_next()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE v_next int8;
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM public.db_ativo) THEN 0
              ELSE COALESCE(MAX(num), -1) + 1 END
  INTO v_next FROM public.db_ativo;
  IF v_next IS NULL THEN v_next := 0; END IF;
  INSERT INTO public.db_ativo (num) VALUES (v_next);
END;
$function$;

CREATE OR REPLACE FUNCTION public.supaon_cleanup_if_due()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE v_first_one_at timestamptz;
BEGIN
  SELECT criado_em INTO v_first_one_at FROM public.db_ativo
  WHERE num = 1 ORDER BY criado_em ASC LIMIT 1;
  IF v_first_one_at IS NULL THEN RETURN; END IF;
  IF now() >= (v_first_one_at + interval '7 days') THEN
    DELETE FROM public.db_ativo;
    PERFORM cron.unschedule('supaon_limpeza');
  END IF;
END;
$function$;

-- 2) REVOGAR EXECUTE de anon/public/authenticated em funções SECURITY DEFINER
--    e re-conceder apenas onde necessário (RLS/Cliente)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated;',
                   r.proname, r.args);
  END LOOP;
END$$;

-- Re-conceder a authenticated apenas as funções legitimamente chamadas pelo cliente / RLS
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[])      TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid)                      TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_trimester_average(numeric, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_final_average(numeric, numeric, numeric)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.classify_grade(numeric)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_invitation(uuid, uuid)      TO authenticated;

-- Funções públicas (token-based — usadas antes de login):
GRANT EXECUTE ON FUNCTION public.validate_invitation(uuid)           TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_contract_for_signing(uuid)      TO anon, authenticated;

-- 3) FIX policies WITH CHECK (true) em tickets/ticket_messages
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;
CREATE POLICY "Authenticated can create tickets"
  ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can send ticket messages" ON public.ticket_messages;
CREATE POLICY "Authenticated can send ticket messages"
  ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4) AUDIT LOG — registo de acções críticas
CREATE TABLE IF NOT EXISTS public.audit_log (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id      UUID,
  actor_email   TEXT,
  actor_role    TEXT,
  action        TEXT NOT NULL,           -- INSERT | UPDATE | DELETE
  table_name    TEXT NOT NULL,
  record_id     TEXT,
  old_data      JSONB,
  new_data      JSONB,
  diff          JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_time
  ON public.audit_log (table_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor
  ON public.audit_log (actor_id, occurred_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit_log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

-- audit_log é só append por triggers (SECURITY DEFINER); ninguém pode mexer manualmente
-- (não criamos policies de INSERT/UPDATE/DELETE => negado por defeito)

-- 5) FUNÇÃO genérica de auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor_id   UUID := auth.uid();
  v_actor_email TEXT;
  v_actor_role TEXT;
  v_record_id  TEXT;
  v_old        JSONB;
  v_new        JSONB;
BEGIN
  BEGIN
    SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;
  EXCEPTION WHEN OTHERS THEN v_actor_email := NULL;
  END;

  SELECT role::text INTO v_actor_role
  FROM public.user_roles WHERE user_id = v_actor_id LIMIT 1;

  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_record_id := COALESCE((v_old->>'id'), NULL);
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE((v_new->>'id'), (v_old->>'id'));
  ELSE -- INSERT
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE((v_new->>'id'), NULL);
  END IF;

  INSERT INTO public.audit_log (
    actor_id, actor_email, actor_role, action, table_name, record_id, old_data, new_data
  ) VALUES (
    v_actor_id, v_actor_email, v_actor_role, TG_OP, TG_TABLE_NAME, v_record_id, v_old, v_new
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.audit_trigger_fn() FROM PUBLIC, anon, authenticated;

-- 6) ANEXAR triggers de auditoria às tabelas críticas
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'student_enrollments',
    'enrollments',
    'payment_agreements',
    'agreement_installments',
    'contract_signatures',
    'employees',
    'teachers',
    'students',
    'user_roles',
    'registration_invitations',
    'integration_settings',
    'roadmap_items'
  ]) LOOP
    -- só anexa se a tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I;', t, t);
      EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I
           FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();',
        t, t
      );
    END IF;
  END LOOP;
END$$;
