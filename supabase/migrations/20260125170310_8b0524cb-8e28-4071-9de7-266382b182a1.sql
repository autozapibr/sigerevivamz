-- Allow demo users (anonymous) to manage integration_settings for testing
CREATE POLICY "Anon can manage integration_settings for demo"
ON public.integration_settings
FOR ALL
USING (true)
WITH CHECK (true);