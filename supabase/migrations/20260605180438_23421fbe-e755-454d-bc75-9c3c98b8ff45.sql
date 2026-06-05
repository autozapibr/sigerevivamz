-- Hardening Security Definer functions with search_path

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    seq_val INTEGER;
    new_number TEXT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT nextval('enrollment_number_seq') INTO seq_val;
    new_number := current_year || LPAD(seq_val::TEXT, 4, '0');
    NEW.enrollment_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
BEGIN
    SELECT nextval('ticket_number_seq') INTO seq_val;
    NEW.ticket_number := 'TCK-' || LPAD(seq_val::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.calculate_trimester_average(acs DECIMAL[], acp DECIMAL[], acf DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
    acs_avg DECIMAL;
    acp_avg DECIMAL;
BEGIN
    IF array_length(acs, 1) > 0 THEN
        SELECT AVG(v) INTO acs_avg FROM unnest(acs) v;
    ELSE
        acs_avg := 0;
    END IF;

    IF acp IS NOT NULL AND array_length(acp, 1) > 0 THEN
        SELECT AVG(v) INTO acp_avg FROM unnest(acp) v;
    ELSE
        acp_avg := 0;
    END IF;

    -- Formula MEC simplificada: (Média ACS * 0.4) + (ACP * 0.4) + (ACF * 0.2)
    RETURN ROUND((acs_avg * 0.4) + (acp_avg * 0.4) + (acf * 0.2), 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure RLS is enabled on all critical tables (re-run to be sure)
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;

-- Grant access to roadmap_items if not already
GRANT ALL ON public.roadmap_items TO service_role;
GRANT SELECT, UPDATE ON public.roadmap_items TO authenticated;
