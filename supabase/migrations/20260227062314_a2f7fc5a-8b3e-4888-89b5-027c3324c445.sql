UPDATE lesson_plan_config SET config_value = 'lovable_ai', updated_at = now() WHERE config_key = 'llm_provider';
UPDATE lesson_plan_config SET config_value = 'google/gemini-2.5-pro', updated_at = now() WHERE config_key = 'model';
UPDATE lesson_plan_config SET config_value = '0.2', updated_at = now() WHERE config_key = 'temperature';
UPDATE lesson_plan_config SET config_value = '12000', updated_at = now() WHERE config_key = 'max_tokens';