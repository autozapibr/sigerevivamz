-- Create integration_settings table for storing API credentials
CREATE TABLE public.integration_settings (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    integration_name text NOT NULL UNIQUE,
    api_url text,
    api_key text,
    instance_name text,
    is_active boolean DEFAULT false,
    last_tested_at timestamp with time zone,
    last_test_success boolean,
    additional_config jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Only ADMIN and DIRETORIA can manage integration settings
CREATE POLICY "Admin can manage integration_settings"
ON public.integration_settings
FOR ALL
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

-- Create trigger for updated_at
CREATE TRIGGER update_integration_settings_updated_at
BEFORE UPDATE ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default integrations
INSERT INTO public.integration_settings (integration_name, instance_name, additional_config)
VALUES 
    ('evolution_api', 'SGE-REVIVA', '{"description": "WhatsApp Business API"}'),
    ('openai', NULL, '{"description": "OpenAI GPT API para geração de contratos"}');

-- Add comment for documentation
COMMENT ON TABLE public.integration_settings IS 'Stores API credentials for external integrations. Sensitive payment keys should remain in Supabase Secrets.';