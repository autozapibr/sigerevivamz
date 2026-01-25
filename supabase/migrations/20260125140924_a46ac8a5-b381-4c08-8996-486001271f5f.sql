
-- Add temporary RLS policy for anon to insert categories (demo/dev mode)
CREATE POLICY "Anon can insert financial_categories for demo"
ON public.financial_categories
FOR INSERT
TO anon
WITH CHECK (true);

-- Add temporary RLS policy for anon to update categories (demo/dev mode)
CREATE POLICY "Anon can update financial_categories for demo"
ON public.financial_categories
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Add temporary RLS policy for anon to delete categories (demo/dev mode)
CREATE POLICY "Anon can delete financial_categories for demo"
ON public.financial_categories
FOR DELETE
TO anon
USING (true);
