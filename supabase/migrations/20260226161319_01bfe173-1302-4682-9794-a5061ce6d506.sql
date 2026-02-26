
-- Add llm_provider config if not exists
INSERT INTO public.lesson_plan_config (config_key, config_value, description)
VALUES ('llm_provider', 'lovable_ai', 'Provedor de IA (lovable_ai, openai, google)')
ON CONFLICT (config_key) DO NOTHING;

-- Add google_ai integration row if not exists
INSERT INTO public.integration_settings (integration_name, is_active, additional_config)
VALUES ('google_ai', false, '{"description": "Google AI Studio (Gemini)"}'::jsonb)
ON CONFLICT DO NOTHING;
