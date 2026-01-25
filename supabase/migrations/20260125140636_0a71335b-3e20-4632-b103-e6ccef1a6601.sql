
-- Grant proper privileges for PostgREST roles
GRANT SELECT ON TABLE public.financial_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.financial_categories TO authenticated;

-- Ensure sequence privileges (if the id is backed by a sequence)
DO $$
DECLARE
  seq_name text;
BEGIN
  SELECT pg_get_serial_sequence('public.financial_categories', 'id') INTO seq_name;
  IF seq_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated;', seq_name);
  END IF;
END $$;
