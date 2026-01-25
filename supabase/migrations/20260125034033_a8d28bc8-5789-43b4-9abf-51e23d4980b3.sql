-- =====================================================
-- SEED DATA COMPLETO PARA SIMULAÇÃO DO SGE REVIVA
-- Dados fictícios moçambicanos para testar todas as funcionalidades
-- =====================================================

-- 1. ANO ACADÉMICO (garantir que existe 2026 como atual)
INSERT INTO public.academic_years (name, start_date, end_date, is_current)
VALUES ('2026', '2026-02-01', '2026-12-15', true)
ON CONFLICT DO NOTHING;

-- Atualizar para garantir que 2026 é o atual
UPDATE public.academic_years SET is_current = false WHERE name != '2026';
UPDATE public.academic_years SET is_current = true WHERE name = '2026';

-- 2. CATEGORIAS FINANCEIRAS (garantir todas existem)
INSERT INTO public.financial_categories (name, type) VALUES
  ('Propinas', 'Receita'),
  ('Taxa de Matrícula', 'Receita'),
  ('Material Escolar', 'Receita'),
  ('Uniformes', 'Receita'),
  ('Atividades Extra', 'Receita'),
  ('Doações', 'Receita'),
  ('Salários', 'Despesa'),
  ('Material Didático', 'Despesa'),
  ('Manutenção', 'Despesa'),
  ('Água e Luz', 'Despesa'),
  ('Equipamentos', 'Despesa'),
  ('Transporte', 'Despesa')
ON CONFLICT DO NOTHING;

-- 3. DISCIPLINAS (garantir variedade)
INSERT INTO public.subjects (name, code, workload) VALUES
  ('Português', 'PORT', 6),
  ('Matemática', 'MAT', 6),
  ('Inglês', 'ING', 4),
  ('Ciências Naturais', 'CN', 4),
  ('História', 'HIST', 3),
  ('Geografia', 'GEO', 3),
  ('Educação Física', 'EF', 2),
  ('Educação Visual', 'EV', 2),
  ('Física', 'FIS', 4),
  ('Química', 'QUIM', 4),
  ('Biologia', 'BIO', 4),
  ('Filosofia', 'FIL', 2),
  ('Educação Moral', 'EM', 2)
ON CONFLICT DO NOTHING;

-- 4. PROFESSORES (adicionar mais)
INSERT INTO public.teachers (name, email, phone, bi_number, gender, status, qualifications, hire_date, salary, contract_type, province, district) VALUES
  ('Maria Fernanda Lopes', 'maria.lopes@escola.mz', '+258841234567', '123456789AB', 'Feminino', 'Ativo', 'Licenciatura em Letras', '2020-02-01', 45000, 'Efectivo', 'Maputo', 'KaMpfumo'),
  ('João Pedro Machava', 'joao.machava@escola.mz', '+258842345678', '234567890BC', 'Masculino', 'Ativo', 'Licenciatura em Matemática', '2019-03-15', 48000, 'Efectivo', 'Maputo', 'Matola'),
  ('Ana Cristina Tembe', 'ana.tembe@escola.mz', '+258843456789', '345678901CD', 'Feminino', 'Ativo', 'Mestrado em Educação', '2018-01-10', 52000, 'Efectivo', 'Gaza', 'Xai-Xai'),
  ('Carlos Manuel Sitoe', 'carlos.sitoe@escola.mz', '+258844567890', '456789012DE', 'Masculino', 'Ativo', 'Licenciatura em Física', '2021-02-20', 44000, 'Prazo', 'Maputo', 'Boane'),
  ('Fátima Zacarias Nhaca', 'fatima.nhaca@escola.mz', '+258845678901', '567890123EF', 'Feminino', 'Ativo', 'Licenciatura em Química', '2022-01-05', 43000, 'Prazo', 'Inhambane', 'Maxixe'),
  ('Roberto Alfredo Cossa', 'roberto.cossa@escola.mz', '+258846789012', '678901234FG', 'Masculino', 'Ativo', 'Bacharelato em Educação Física', '2020-08-01', 38000, 'Efectivo', 'Maputo', 'KaMubukwana'),
  ('Teresa Joaquim Macie', 'teresa.macie@escola.mz', '+258847890123', '789012345GH', 'Feminino', 'Inativo', 'Licenciatura em História', '2017-03-01', 46000, 'Efectivo', 'Sofala', 'Beira'),
  ('Miguel Ângelo Cumbe', 'miguel.cumbe@escola.mz', '+258848901234', '890123456HI', 'Masculino', 'Ativo', 'Licenciatura em Geografia', '2023-02-01', 42000, 'Prazo', 'Nampula', 'Nampula')
ON CONFLICT DO NOTHING;

-- 5. TURMAS (garantir várias)
INSERT INTO public.classes (name, year, teacher_id) VALUES
  ('8ª Classe A', 2026, (SELECT id FROM teachers WHERE name LIKE 'Maria%' LIMIT 1)),
  ('8ª Classe B', 2026, (SELECT id FROM teachers WHERE name LIKE 'João%' LIMIT 1)),
  ('9ª Classe A', 2026, (SELECT id FROM teachers WHERE name LIKE 'Ana%' LIMIT 1)),
  ('9ª Classe B', 2026, (SELECT id FROM teachers WHERE name LIKE 'Carlos%' LIMIT 1)),
  ('10ª Classe A', 2026, (SELECT id FROM teachers WHERE name LIKE 'Fátima%' LIMIT 1)),
  ('10ª Classe B', 2026, (SELECT id FROM teachers WHERE name LIKE 'Roberto%' LIMIT 1)),
  ('11ª Classe A', 2026, (SELECT id FROM teachers WHERE name LIKE 'Teresa%' LIMIT 1)),
  ('12ª Classe A', 2026, (SELECT id FROM teachers WHERE name LIKE 'Miguel%' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 6. FUNCIONÁRIOS (staff não-docente)
INSERT INTO public.employees (name, email, phone, bi_number, nuit, gender, role, department, status, hire_date, salary, contract_type, province, district, bank_name, bank_account, payment_method) VALUES
  ('Helena Mondlane', 'helena.mondlane@escola.mz', '+258851234567', '111222333AA', '123456789', 'Feminino', 'Secretária', 'Administração', 'Ativo', '2019-01-15', 35000, 'Efectivo', 'Maputo', 'KaMpfumo', 'BCI', '123456789012', 'bank'),
  ('Alberto Chissano', 'alberto.chissano@escola.mz', '+258852345678', '222333444BB', '234567890', 'Masculino', 'Contabilista', 'Finanças', 'Ativo', '2018-06-01', 42000, 'Efectivo', 'Maputo', 'Matola', 'BIM', '234567890123', 'bank'),
  ('Graça Machel', 'graca.machel@escola.mz', '+258853456789', '333444555CC', '345678901', 'Feminino', 'Bibliotecária', 'Biblioteca', 'Ativo', '2020-03-01', 28000, 'Prazo', 'Gaza', 'Xai-Xai', 'Standard Bank', '345678901234', 'bank'),
  ('Manuel Nguenha', 'manuel.nguenha@escola.mz', '+258854567890', '444555666DD', '456789012', 'Masculino', 'Vigilante', 'Segurança', 'Ativo', '2021-01-10', 18000, 'Prazo', 'Maputo', 'Boane', NULL, NULL, 'mobile_money'),
  ('Rosa Bila', 'rosa.bila@escola.mz', '+258855678901', '555666777EE', '567890123', 'Feminino', 'Servente', 'Limpeza', 'Ativo', '2022-02-15', 15000, 'Prazo', 'Maputo', 'KaMubukwana', NULL, NULL, 'mobile_money'),
  ('Fernando Guebuza', 'fernando.guebuza@escola.mz', '+258856789012', '666777888FF', '678901234', 'Masculino', 'Motorista', 'Transporte', 'Ativo', '2019-08-01', 25000, 'Efectivo', 'Inhambane', 'Maxixe', 'BCI', '456789012345', 'bank'),
  ('Esperança Langa', 'esperanca.langa@escola.mz', '+258857890123', '777888999GG', '789012345', 'Feminino', 'Cozinheira', 'Cantina', 'Ativo', '2020-05-01', 20000, 'Prazo', 'Sofala', 'Beira', NULL, NULL, 'mobile_money'),
  ('Zacarias Maputo', 'zacarias.maputo@escola.mz', '+258858901234', '888999000HH', '890123456', 'Masculino', 'Técnico de Informática', 'TI', 'Ativo', '2023-01-10', 38000, 'Prazo', 'Nampula', 'Nampula', 'FNB', '567890123456', 'bank')
ON CONFLICT DO NOTHING;