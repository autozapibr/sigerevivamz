
-- Clear existing fields and re-insert with correct order and content
DELETE FROM lesson_plan_fields;

-- 1. Tema da Aula
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('tema_aula', 'Tema da Aula', 'text', '{}', true, true, 1);

-- 2. Objectivos e Competências
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('objetivos_competencias', 'Objectivos e Competências', 'textarea', '{}', false, true, 2);

-- 3. Número de aulas pretendido
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('num_aulas', 'Número de aulas pretendido', 'select', ARRAY['1','2','3','4','5','6','7','8','9'], true, true, 3);

-- 4. Princípios da AEP
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('principio', 'Princípios da AEP', 'multiselect', ARRAY['Mordomia','Caráter','Semeadura e Colheita','Autogoverno','Soberania','Individualidade','União / Aliança'], true, true, 4);

-- 5. Palavras-Chave
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('palavras_chave', 'Palavras-Chave', 'textarea', '{}', true, true, 5);

-- 6. Versículos Chaves
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('versiculos_biblicos', 'Versículos Chaves', 'textarea', '{}', false, true, 6);

-- 7. Ideia-Guia
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('ideia_guia', 'Ideia-Guia', 'textarea', '{}', false, true, 7);

-- 8. Ferramentas da AEP
INSERT INTO lesson_plan_fields (field_name, field_label, field_type, options, is_required, is_active, display_order)
VALUES ('ferramentas_aep', 'Ferramentas da AEP', 'multiselect', ARRAY['Fichário','Estudo de palavras (Webster)','Ensaio (produção textual)','Belas Artes','Clássicos literários','Biografias','Linha do tempo','Memoriais','Celebração','Avaliações e Revisões','Oportunidade de Serviço'], true, true, 8);
