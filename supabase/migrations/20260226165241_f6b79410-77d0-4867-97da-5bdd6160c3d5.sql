
-- Update principio field to multiselect (allow 2 principles)
UPDATE lesson_plan_fields 
SET field_type = 'multiselect', 
    field_label = 'Princípios da AEP (selecione 2)',
    options = ARRAY['Mordomia', 'Caráter', 'Semeadura e Colheita', 'Autogoverno', 'Soberania', 'Individualidade', 'União / Aliança'],
    updated_at = now()
WHERE field_name = 'principio';

-- Make ideia_guia optional
UPDATE lesson_plan_fields 
SET is_required = false,
    field_label = 'Ideia-Guia (opcional - a IA sugere 3 opções se deixar em branco)',
    updated_at = now()
WHERE field_name = 'ideia_guia';

-- Update ferramentas_aep with correct 12 tools
UPDATE lesson_plan_fields 
SET options = ARRAY[
  '4 Passos (PRRR: Pesquisar, Raciocinar, Relacionar, Registrar)',
  'Fichamento',
  'Caderno de Registro',
  'Linha do Tempo',
  'Pesquisa Bíblica',
  'Raciocínio e Registro (4R)',
  'Dissertação',
  'Tabela T (Causa e Efeito)',
  'Vocabulário / Definição de Palavras (Webster 1828)',
  'Mapa de Ideias',
  'Composição / Redação',
  'Quadro Comparativo'
],
    updated_at = now()
WHERE field_name = 'ferramentas_aep';

-- Add Palavras-Chave field (4 keywords: 2 academic + 2 biblical)
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, display_order, is_required, is_active, options)
VALUES ('palavras_chave', 'Palavras-Chave (2 académicas + 2 bíblicas, separadas por vírgula)', 'textarea', 6, false, true, '{}');

-- Add Versículos Bíblicos field
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, display_order, is_required, is_active, options)
VALUES ('versiculos_biblicos', 'Versículos Bíblicos (1 AT + 1 NT, opcional - a IA sugere se deixar em branco)', 'textarea', 7, false, true, '{}');

-- Add Objectivos/Competências field
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, display_order, is_required, is_active, options)
VALUES ('objetivos_competencias', 'Objectivos / Competências (opcional)', 'textarea', 8, false, true, '{}');
