-- Restore demo permissions for anon role on all tables
-- This is TEMPORARY for development only - must be revoked before production

-- Grant SELECT, INSERT, UPDATE, DELETE to anon on core tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tuition_fees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_curriculum TO anon;

-- Grant sequence usage for inserts
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Add RLS policies for anon if they don't exist
DO $$
BEGIN
  -- transactions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Anon can view transactions for demo') THEN
    CREATE POLICY "Anon can view transactions for demo" ON public.transactions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Anon can insert transactions for demo') THEN
    CREATE POLICY "Anon can insert transactions for demo" ON public.transactions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Anon can update transactions for demo') THEN
    CREATE POLICY "Anon can update transactions for demo" ON public.transactions FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Anon can delete transactions for demo') THEN
    CREATE POLICY "Anon can delete transactions for demo" ON public.transactions FOR DELETE USING (true);
  END IF;

  -- tuition_fees
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_fees' AND policyname = 'Anon can view tuition_fees for demo') THEN
    CREATE POLICY "Anon can view tuition_fees for demo" ON public.tuition_fees FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_fees' AND policyname = 'Anon can insert tuition_fees for demo') THEN
    CREATE POLICY "Anon can insert tuition_fees for demo" ON public.tuition_fees FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_fees' AND policyname = 'Anon can update tuition_fees for demo') THEN
    CREATE POLICY "Anon can update tuition_fees for demo" ON public.tuition_fees FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_fees' AND policyname = 'Anon can delete tuition_fees for demo') THEN
    CREATE POLICY "Anon can delete tuition_fees for demo" ON public.tuition_fees FOR DELETE USING (true);
  END IF;

  -- students
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Anon can view students for demo') THEN
    CREATE POLICY "Anon can view students for demo" ON public.students FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Anon can insert students for demo') THEN
    CREATE POLICY "Anon can insert students for demo" ON public.students FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Anon can update students for demo') THEN
    CREATE POLICY "Anon can update students for demo" ON public.students FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Anon can delete students for demo') THEN
    CREATE POLICY "Anon can delete students for demo" ON public.students FOR DELETE USING (true);
  END IF;

  -- teachers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Anon can view teachers for demo') THEN
    CREATE POLICY "Anon can view teachers for demo" ON public.teachers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Anon can insert teachers for demo') THEN
    CREATE POLICY "Anon can insert teachers for demo" ON public.teachers FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Anon can update teachers for demo') THEN
    CREATE POLICY "Anon can update teachers for demo" ON public.teachers FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Anon can delete teachers for demo') THEN
    CREATE POLICY "Anon can delete teachers for demo" ON public.teachers FOR DELETE USING (true);
  END IF;

  -- subjects
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Anon can view subjects for demo') THEN
    CREATE POLICY "Anon can view subjects for demo" ON public.subjects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Anon can insert subjects for demo') THEN
    CREATE POLICY "Anon can insert subjects for demo" ON public.subjects FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Anon can update subjects for demo') THEN
    CREATE POLICY "Anon can update subjects for demo" ON public.subjects FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Anon can delete subjects for demo') THEN
    CREATE POLICY "Anon can delete subjects for demo" ON public.subjects FOR DELETE USING (true);
  END IF;
END $$;

-- Add paid_at column to tuition_fees if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tuition_fees' AND column_name = 'paid_at') THEN
    ALTER TABLE public.tuition_fees ADD COLUMN paid_at timestamp with time zone;
  END IF;
END $$;