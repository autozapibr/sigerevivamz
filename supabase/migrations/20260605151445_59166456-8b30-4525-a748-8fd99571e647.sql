-- Check if columns exist before adding them to avoid errors during re-runs
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_signatures' AND column_name = 'staff_id') THEN
        ALTER TABLE public.contract_signatures ADD COLUMN staff_id BIGINT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract_signatures' AND column_name = 'staff_type') THEN
        ALTER TABLE public.contract_signatures ADD COLUMN staff_type TEXT;
    END IF;
END $$;

-- Update RLS policies if necessary (assuming they already exist for the table)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_signatures TO authenticated;
-- GRANT ALL ON public.contract_signatures TO service_role;
