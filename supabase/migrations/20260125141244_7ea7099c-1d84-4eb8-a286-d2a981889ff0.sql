
-- TEMP (dev/demo): allow anon to write into financial_categories
GRANT INSERT, UPDATE, DELETE ON TABLE public.financial_categories TO anon;

-- If id uses a sequence/identity, anon also needs sequence privileges
DO $$
DECLARE
  seq_name text;
BEGIN
  SELECT pg_get_serial_sequence('public.financial_categories', 'id') INTO seq_name;
  IF seq_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO anon;', seq_name);
  END IF;
END $$;
