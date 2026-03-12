-- ============================================================
-- SGE REVIVA - MIGRAÇÃO COMPLETA - PARTE 3: DADOS
-- Data: 2026-03-12
-- Projecto Supabase: ghwhbdpdkstxejofztny (siger-cloud)
-- ============================================================
-- INSTRUÇÕES: Executar DEPOIS de 01-schema.sql e 02-rls-policies.sql
-- NOTA: Os IDs são preservados com OVERRIDING SYSTEM VALUE
-- ============================================================

-- ===================== academic_years =====================
INSERT INTO public.academic_years OVERRIDING SYSTEM VALUE VALUES
(1, '2025', '2025-02-01', '2025-12-15', false, '2026-01-24 20:35:18.591596+00'),
(2, '2026', '2026-02-01', '2026-12-15', true, '2026-01-25 03:40:31.830676+00');
SELECT setval(pg_get_serial_sequence('academic_years', 'id'), (SELECT MAX(id) FROM academic_years));

-- ===================== teachers =====================
INSERT INTO public.teachers OVERRIDING SYSTEM VALUE (id, name, email, phone, qualifications, status, contract_type, payment_method, created_at, updated_at) VALUES
(1, 'Carlos Neto', 'carlos.neto@reviva.com', '84 111 2222', 'Licenciatura em Pedagogia', 'Ativo', 'Efectivo', 'bank', '2026-01-24 22:22:21.902144+00', '2026-01-24 22:22:21.902144+00'),
(2, 'Fernanda Alves', 'fernanda.alves@reviva.com', '82 333 4444', 'Mestrado em Matemática', 'Ativo', 'Efectivo', 'bank', '2026-01-24 22:22:21.902144+00', '2026-01-24 22:22:21.902144+00'),
(3, 'Mariana Lima', 'mariana.lima@reviva.com', '86 555 6666', 'Licenciatura em Letras', 'Ativo', 'Efectivo', 'bank', '2026-01-24 22:22:21.902144+00', '2026-01-24 22:22:21.902144+00'),
(4, 'Ricardo Sousa', 'ricardo.sousa@reviva.com', '87 888 9999', 'Doutoramento em Ciências', 'Inativo', 'Efectivo', 'bank', '2026-01-24 22:22:21.902144+00', '2026-01-24 22:22:21.902144+00'),
(9, 'Raquel Cossa', 'professor449@escola.co.mz', '+258 85 202 3325', 'Licenciatura em Ensino de Português', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01.836313+00', '2026-01-25 01:09:01.836313+00'),
(10, 'Maria Manjate', 'professor341@escola.co.mz', '+258 87 337 4663', 'Licenciatura em Pedagogia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01.836313+00', '2026-01-25 01:09:01.836313+00'),
(11, 'José Massinga', 'professor542@escola.co.mz', '+258 86 150 9739', 'Mestrado em Educação', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01.836313+00', '2026-01-25 01:09:01.836313+00'),
(12, 'Helena Tembe', 'professor408@escola.co.mz', '+258 87 178 3254', 'Mestrado em Educação', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01.836313+00', '2026-01-25 01:09:01.836313+00'),
(13, 'Maria Fernanda Lopes', 'mflopes@escola.co.mz', '+258 84 521 3847', 'Mestrado em Letras', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(14, 'João Pedro Machava', 'jpmachava@escola.co.mz', '+258 87 632 9154', 'Licenciatura em Matemática', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(15, 'Ana Cristina Sitoe', 'acsitoe@escola.co.mz', '+258 82 743 6281', 'Licenciatura em Biologia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(16, 'Roberto Carlos Tembe', 'rctembe@escola.co.mz', '+258 86 854 7392', 'Doutoramento em Física', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(17, 'Esperança Mondlane', 'emondlane@escola.co.mz', '+258 85 965 8413', 'Licenciatura em História', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(18, 'Francisco Cossa', 'fcossa@escola.co.mz', '+258 84 176 9524', 'Mestrado em Geografia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(19, 'Graça Helena Langa', 'ghlanga@escola.co.mz', '+258 87 287 0635', 'Licenciatura em Educação Física', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(20, 'Manuel António Mutemba', 'mamutemba@escola.co.mz', '+258 82 398 1746', 'Licenciatura em Artes Visuais', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(21, 'Teresa Beatriz Nguenha', 'tbnguenha@escola.co.mz', '+258 86 409 2857', 'Mestrado em Química', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(22, 'Carlos Alberto Chissano', 'cachissano@escola.co.mz', '+258 85 510 3968', 'Licenciatura em Filosofia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(23, 'Rosa Maria Bila', 'rmbila@escola.co.mz', '+258 84 621 4079', 'Licenciatura em Inglês', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00'),
(24, 'Fernando José Guebuza', 'fjguebuza@escola.co.mz', '+258 87 732 5180', 'Mestrado em Educação Moral', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31.830676+00', '2026-01-25 03:40:31.830676+00');
SELECT setval(pg_get_serial_sequence('teachers', 'id'), (SELECT MAX(id) FROM teachers));

-- ===================== classes =====================
INSERT INTO public.classes OVERRIDING SYSTEM VALUE VALUES
(1, '5ª Classe A', 2024, 1),
(2, '7ª Classe B', 2024, 4),
(3, '3ª Classe Única', 2024, 3),
(4, '8ª A', 8, NULL),
(5, '8ª B', 8, NULL),
(6, '9ª A', 9, NULL),
(7, '9ª B', 9, NULL),
(8, '10ª A', 10, NULL),
(9, '10ª B', 10, NULL),
(10, '11ª A', 11, NULL),
(11, '12ª A', 12, NULL),
(12, '8ª Classe A', 2026, 3),
(13, '8ª Classe B', 2026, 20),
(14, '9ª Classe A', 2026, 17),
(15, '9ª Classe B', 2026, 1),
(16, '10ª Classe A', 2026, 23),
(17, '10ª Classe B', 2026, 24),
(18, '11ª Classe A', 2026, 13),
(19, '12ª Classe A', 2026, 16);
SELECT setval(pg_get_serial_sequence('classes', 'id'), (SELECT MAX(id) FROM classes));

-- ===================== subjects =====================
INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES
(1, 'Matemática', 'MAT01', 80),
(2, 'Língua Portuguesa', 'LP01', 100),
(3, 'Ciências Naturais', 'CN01', 60),
(4, 'História', 'HIS01', 50),
(5, 'Geografia', 'GEO01', 50),
(6, 'Educação Física', 'EDF001', 60),
(7, 'Inglês', 'ING001', 80),
(8, 'Educação Visual', 'EDV001', 60),
(9, 'Matemática', 'MAT001', 120),
(10, 'Português', 'POR001', 100),
(11, 'História', 'HIS001', 80),
(12, 'Geografia', 'GEO001', 80),
(13, 'Ciências Naturais', 'CIE001', 100),
(14, 'Português', 'PORT', 6),
(15, 'Matemática', 'MAT', 6),
(16, 'Inglês', 'ING', 4),
(17, 'Ciências Naturais', 'CN', 4),
(18, 'História', 'HIST', 3),
(19, 'Geografia', 'GEO', 3),
(20, 'Educação Física', 'EF', 2),
(21, 'Educação Visual', 'EV', 2),
(22, 'Física', 'FIS', 4),
(23, 'Química', 'QUIM', 4),
(24, 'Biologia', 'BIO', 4),
(25, 'Filosofia', 'FIL', 2),
(26, 'Educação Moral', 'EM', 2);
SELECT setval(pg_get_serial_sequence('subjects', 'id'), (SELECT MAX(id) FROM subjects));

-- ===================== students =====================
INSERT INTO public.students OVERRIDING SYSTEM VALUE (id, name, phone, guardian, age, class_id, status, gender, nationality, province, district, enrollment_status) VALUES
(1, 'Ana Silva', '84 123 4567', 'João Silva', 10, 1, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(2, 'Bruno Costa', '82 987 6543', 'Maria Costa', 12, 2, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(4, 'David Martins', '84 111 2233', 'Sofia Martins', 10, 1, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(5, 'Elisa Ferreira', '82 444 5566', 'Rui Ferreira', 11, 2, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(6, 'Fábio Gomes', '87 777 8899', 'Cátia Gomes', 7, 3, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(7, 'Aluno Teste Final', '84 888 7777', 'Responsável Final', 9, 1, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(8, 'João Carlos Machava', NULL, NULL, 15, 1, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo Cidade', 'KaMpfumo', 'PENDENTE'),
(9, 'Maria Helena Sitoe', NULL, NULL, 14, 1, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo', 'Matola', 'PENDENTE'),
(10, 'Pedro António Cossa', NULL, NULL, 16, 2, 'Ativo', 'MASCULINO', 'Moçambicana', 'Gaza', 'Xai-Xai', 'PENDENTE'),
(11, 'Ana Beatriz Langa', NULL, NULL, 15, 2, 'Ativo', 'FEMININO', 'Moçambicana', 'Inhambane', 'Maxixe', 'PENDENTE'),
(12, 'Carlos Manuel Tembe', NULL, NULL, 17, 3, 'Ativo', 'MASCULINO', 'Moçambicana', 'Sofala', 'Beira', 'PENDENTE'),
(13, 'Teresa Isabel Mutemba', NULL, NULL, 16, 3, 'Ativo', 'FEMININO', 'Moçambicana', 'Manica', 'Chimoio', 'PENDENTE'),
(14, 'Alberto José Mondlane', NULL, NULL, 14, 1, 'Ativo', 'MASCULINO', 'Moçambicana', 'Tete', 'Tete', 'PENDENTE'),
(15, 'Helena Maria Nguenha', NULL, NULL, 13, 2, 'Ativo', 'FEMININO', 'Moçambicana', 'Zambézia', 'Quelimane', 'PENDENTE'),
(16, 'Fernando Carlos Chissano', NULL, NULL, 15, 3, 'Ativo', 'MASCULINO', 'Moçambicana', 'Nampula', 'Nampula', 'PENDENTE'),
(17, 'Esperança Rosa Langa', NULL, NULL, 16, 1, 'Ativo', 'FEMININO', 'Moçambicana', 'Cabo Delgado', 'Pemba', 'PENDENTE'),
(18, 'José Manuel Guebuza', NULL, NULL, 14, 2, 'Ativo', 'MASCULINO', 'Moçambicana', 'Niassa', 'Lichinga', 'PENDENTE'),
(19, 'Graça Helena Bila', NULL, NULL, 15, 3, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo Cidade', 'KaMubukwana', 'PENDENTE'),
(20, 'Roberto Carlos Machava', NULL, NULL, 13, 1, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo', 'Boane', 'PENDENTE'),
(21, 'Rosa Maria Tembe', NULL, NULL, 14, 2, 'Ativo', 'FEMININO', 'Moçambicana', 'Gaza', 'Chokwé', 'PENDENTE'),
(22, 'Manuel António Sitoe', NULL, NULL, 16, 3, 'Ativo', 'MASCULINO', 'Moçambicana', 'Inhambane', 'Inhambane', 'PENDENTE'),
(23, 'Amélia Fernanda Machava', NULL, NULL, 14, 12, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo Cidade', 'KaMpfumo', 'PENDENTE'),
(24, 'Bernardo Rafael Sitoe', NULL, NULL, 13, 12, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo', 'Matola', 'PENDENTE'),
(25, 'Carolina Isabel Tembe', NULL, NULL, 14, 13, 'Ativo', 'FEMININO', 'Moçambicana', 'Gaza', 'Xai-Xai', 'PENDENTE'),
(26, 'Daniel José Langa', NULL, NULL, 13, 13, 'Ativo', 'MASCULINO', 'Moçambicana', 'Inhambane', 'Maxixe', 'PENDENTE'),
(27, 'Eva Maria Mondlane', NULL, NULL, 15, 14, 'Ativo', 'FEMININO', 'Moçambicana', 'Sofala', 'Beira', 'PENDENTE'),
(28, 'Francisco Carlos Cossa', NULL, NULL, 14, 14, 'Ativo', 'MASCULINO', 'Moçambicana', 'Manica', 'Chimoio', 'PENDENTE'),
(29, 'Graça Helena Nguenha', NULL, NULL, 15, 15, 'Ativo', 'FEMININO', 'Moçambicana', 'Tete', 'Tete', 'PENDENTE'),
(30, 'Hélio Manuel Chissano', NULL, NULL, 14, 15, 'Ativo', 'MASCULINO', 'Moçambicana', 'Zambézia', 'Quelimane', 'PENDENTE'),
(31, 'Inês Catarina Guebuza', NULL, NULL, 16, 16, 'Ativo', 'FEMININO', 'Moçambicana', 'Nampula', 'Nampula', 'PENDENTE'),
(32, 'João Pedro Bila', NULL, NULL, 15, 16, 'Ativo', 'MASCULINO', 'Moçambicana', 'Cabo Delgado', 'Pemba', 'PENDENTE'),
(33, 'Kátia Rosa Machava', NULL, NULL, 16, 17, 'Ativo', 'FEMININO', 'Moçambicana', 'Niassa', 'Lichinga', 'PENDENTE'),
(34, 'Luís Fernando Tembe', NULL, NULL, 15, 17, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo Cidade', 'KaMubukwana', 'PENDENTE'),
(35, 'Maria Esperança Sitoe', NULL, NULL, 17, 18, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo', 'Boane', 'PENDENTE'),
(36, 'Nelson José Mondlane', NULL, NULL, 16, 18, 'Ativo', 'MASCULINO', 'Moçambicana', 'Gaza', 'Chokwé', 'PENDENTE'),
(37, 'Olga Maria Langa', NULL, NULL, 18, 19, 'Ativo', 'FEMININO', 'Moçambicana', 'Inhambane', 'Inhambane', 'PENDENTE'),
(38, 'Paulo António Cossa', NULL, NULL, 17, 19, 'Ativo', 'MASCULINO', 'Moçambicana', 'Sofala', 'Beira', 'PENDENTE'),
(39, 'Rita Helena Mutemba', NULL, NULL, 14, 12, 'Ativo', 'FEMININO', 'Moçambicana', 'Manica', 'Chimoio', 'PENDENTE'),
(40, 'Samuel Carlos Nguenha', NULL, NULL, 15, 14, 'Ativo', 'MASCULINO', 'Moçambicana', 'Tete', 'Tete', 'PENDENTE'),
(41, 'Teresa Rosa Chissano', NULL, NULL, 16, 16, 'Ativo', 'FEMININO', 'Moçambicana', 'Zambézia', 'Quelimane', 'PENDENTE');
SELECT setval(pg_get_serial_sequence('students', 'id'), (SELECT MAX(id) FROM students));

-- ===================== guardians =====================
INSERT INTO public.guardians OVERRIDING SYSTEM VALUE (id, full_name, relationship, phone, bi_number, nuit, occupation, province, phone_alt, email, address, workplace, is_primary) VALUES
(1, 'Joana Ana Machava', 'Tio', '+258 84 955 3229', '03870 417390 3', '051963054', 'Motorista', 'Maputo Cidade', NULL, NULL, NULL, NULL, true),
(2, 'Ana Isabel Magaia', 'Avô', '+258 87 230 6499', '24944 556822 3', '895820116', 'Professor', 'Manica', '+258 85 973 9375', NULL, NULL, NULL, true),
(3, 'Inês Isabel Machava', 'Pai', '+258 85 709 3288', '30880 679070 8', '678052758', 'Agricultor', 'Maputo Cidade', NULL, NULL, NULL, NULL, true),
(4, 'Francisco Fernando Mondlane', 'Tio', '+258 86 799 0628', '98560 156484 6', '861913889', 'Médico', 'Manica', '+258 85 887 9555', NULL, NULL, NULL, true),
(5, 'Helena Catarina Manjate', 'Pai', '+258 84 340 8983', '55014 147621 0', '550871479', 'Empresário', 'Inhambane', '+258 86 466 0559', NULL, NULL, NULL, true),
(6, 'Beatriz Maria Mutemba', 'Pai', '+258 85 171 3241', '34232 070432 6', '506334005', 'Médico', 'Zambézia', NULL, NULL, NULL, NULL, true),
(7, 'António Machava', 'Pai', '+258861234567', 'AAA111222333', '111222333', 'Engenheiro', 'Maputo', '+258871234567', 'antonio.machava@email.mz', 'Av. 24 de Julho, 123', 'EDM', true),
(8, 'Lurdes Tembe', 'Mãe', '+258862345678', 'BBB222333444', '222333444', 'Enfermeira', 'Maputo', NULL, 'lurdes.tembe@email.mz', 'Rua do Bagamoyo, 456', 'Hospital Central', true),
(9, 'Fernando Sitoe', 'Pai', '+258863456789', 'CCC333444555', '333444555', 'Professor', 'Gaza', '+258873456789', 'fernando.sitoe@email.mz', 'Av. Eduardo Mondlane, 789', 'UEM', true),
(10, 'Graça Cossa', 'Mãe', '+258864567890', 'DDD444555666', '444555666', 'Médica', 'Maputo', NULL, 'graca.cossa@email.mz', 'Rua da Mesquita, 101', 'Clínica Privada', true),
(11, 'Manuel Langa', 'Avô', '+258865678901', 'EEE555666777', '555666777', 'Reformado', 'Inhambane', '+258875678901', 'manuel.langa@email.mz', 'Av. Acordos de Lusaka, 202', NULL, true),
(12, 'Rosa Mondlane', 'Mãe', '+258866789012', 'FFF666777888', '666777888', 'Comerciante', 'Maputo', NULL, 'rosa.mondlane@email.mz', 'Rua 3 de Fevereiro, 303', 'Mercado Central', true),
(13, 'José Chissano', 'Pai', '+258867890123', 'GGG777888999', '777888999', 'Advogado', 'Sofala', '+258877890123', 'jose.chissano@email.mz', 'Av. Julius Nyerere, 404', 'Escritório Próprio', true),
(14, 'Maria Guebuza', 'Mãe', '+258868901234', 'HHH888999000', '888999000', 'Empresária', 'Nampula', NULL, 'maria.guebuza@email.mz', 'Rua da Zambézia, 505', 'Empresa Própria', true),
(15, 'Alberto Nguenha', 'Pai', '+258869012345', 'III999000111', '999000111', 'Funcionário Público', 'Tete', '+258879012345', 'alberto.nguenha@email.mz', 'Av. Samora Machel, 606', 'Ministério', true),
(16, 'Esperança Bila', 'Mãe', '+258860123456', 'JJJ000111222', '000111222', 'Professora', 'Zambézia', NULL, 'esperanca.bila@email.mz', 'Rua 25 de Setembro, 707', 'Escola Primária', true),
(17, 'Carlos Mutemba', 'Pai', '+258861234560', 'KKK111222333', '111000222', 'Engenheiro', 'Cabo Delgado', '+258871234560', 'carlos.mutemba@email.mz', 'Av. da Independência, 808', 'Construtora', true),
(18, 'Helena Machava', 'Mãe', '+258862345670', 'LLL222333444', '222000333', 'Médica', 'Niassa', NULL, 'helena.machava@email.mz', 'Rua do Lago, 909', 'Hospital Provincial', true);
SELECT setval(pg_get_serial_sequence('guardians', 'id'), (SELECT MAX(id) FROM guardians));

-- ===================== student_guardians =====================
INSERT INTO public.student_guardians OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, true, '2026-01-25 01:09:03.705173+00'),
(2, 2, 2, true, '2026-01-25 01:09:03.705173+00'),
(3, 4, 3, true, '2026-01-25 01:09:03.705173+00'),
(4, 5, 4, true, '2026-01-25 01:09:03.705173+00'),
(5, 6, 5, true, '2026-01-25 01:09:03.705173+00'),
(6, 7, 6, true, '2026-01-25 01:09:03.705173+00');
SELECT setval(pg_get_serial_sequence('student_guardians', 'id'), (SELECT MAX(id) FROM student_guardians));

-- ===================== employees =====================
INSERT INTO public.employees OVERRIDING SYSTEM VALUE (id, name, role, email, phone, bi_number, nuit, gender, hire_date, salary, status, department, contract_type, province, district, bank_name, bank_account, payment_method) VALUES
(1, 'Helena Mondlane', 'Secretária', 'helena.mondlane@escola.mz', '+258851234567', '111222333AA', '123456789', 'Feminino', '2019-01-15', 35000, 'Ativo', 'Administração', 'Efectivo', 'Maputo', 'KaMpfumo', 'BCI', '123456789012', 'bank'),
(2, 'Alberto Chissano', 'Contabilista', 'alberto.chissano@escola.mz', '+258852345678', '222333444BB', '234567890', 'Masculino', '2018-06-01', 42000, 'Ativo', 'Finanças', 'Efectivo', 'Maputo', 'Matola', 'BIM', '234567890123', 'bank'),
(3, 'Graça Machel', 'Bibliotecária', 'graca.machel@escola.mz', '+258853456789', '333444555CC', '345678901', 'Feminino', '2020-03-01', 28000, 'Ativo', 'Biblioteca', 'Prazo', 'Gaza', 'Xai-Xai', 'Standard Bank', '345678901234', 'bank'),
(4, 'Manuel Nguenha', 'Vigilante', 'manuel.nguenha@escola.mz', '+258854567890', '444555666DD', '456789012', 'Masculino', '2021-01-10', 18000, 'Ativo', 'Segurança', 'Prazo', 'Maputo', 'Boane', NULL, NULL, 'mobile_money'),
(5, 'Rosa Bila', 'Servente', 'rosa.bila@escola.mz', '+258855678901', '555666777EE', '567890123', 'Feminino', '2022-02-15', 15000, 'Ativo', 'Limpeza', 'Prazo', 'Maputo', 'KaMubukwana', NULL, NULL, 'mobile_money'),
(6, 'Fernando Guebuza', 'Motorista', 'fernando.guebuza@escola.mz', '+258856789012', '666777888FF', '678901234', 'Masculino', '2019-08-01', 25000, 'Ativo', 'Transporte', 'Efectivo', 'Inhambane', 'Maxixe', 'BCI', '456789012345', 'bank'),
(7, 'Esperança Langa', 'Cozinheira', 'esperanca.langa@escola.mz', '+258857890123', '777888999GG', '789012345', 'Feminino', '2020-05-01', 20000, 'Ativo', 'Cantina', 'Prazo', 'Sofala', 'Beira', NULL, NULL, 'mobile_money'),
(8, 'Zacarias Maputo', 'Técnico TI', 'zacarias.maputo@escola.mz', '+258858901234', '888999000HH', '890123456', 'Masculino', '2023-01-10', 38000, 'Ativo', 'TI', 'Prazo', 'Nampula', 'Nampula', 'FNB', '567890123456', 'bank');
SELECT setval(pg_get_serial_sequence('employees', 'id'), (SELECT MAX(id) FROM employees));

-- ===================== financial_categories =====================
INSERT INTO public.financial_categories OVERRIDING SYSTEM VALUE VALUES
(1, 'Mensalidades', 'Receita'),
(2, 'Matrículas', 'Receita'),
(3, 'Uniformes', 'Receita'),
(4, 'Material Escolar', 'Receita'),
(5, 'Eventos', 'Receita'),
(6, 'Doações', 'Receita'),
(9, 'Manutenção', 'Despesa'),
(10, 'Água e Luz', 'Despesa'),
(11, 'Equipamentos', 'Despesa'),
(101, 'Salários', 'Despesa'),
(102, 'Material Didático', 'Despesa'),
(103, 'Alimentação', 'Despesa'),
(104, 'Utilities (Água, Luz, Internet)', 'Despesa'),
(105, 'Transporte', 'Despesa');
SELECT setval(pg_get_serial_sequence('financial_categories', 'id'), (SELECT MAX(id) FROM financial_categories));

-- ===================== scholarships =====================
INSERT INTO public.scholarships OVERRIDING SYSTEM VALUE VALUES
(1, 'Bolsa de Mérito Académico', 'Percentagem', 25),
(2, 'Apoio Social', 'Valor Fixo', 500),
(3, 'Bolsa de Desporto', 'Percentagem', 15);
SELECT setval(pg_get_serial_sequence('scholarships', 'id'), (SELECT MAX(id) FROM scholarships));

-- ===================== student_scholarships =====================
INSERT INTO public.student_scholarships VALUES (2, 1), (6, 2);

-- ===================== class_curriculum =====================
INSERT INTO public.class_curriculum VALUES
(1, 1, 2), (1, 2, 3), (2, 1, 2), (2, 3, 1), (2, 4, 1), (3, 2, 3), (3, 5, 1);

-- ===================== enrollments =====================
INSERT INTO public.enrollments OVERRIDING SYSTEM VALUE VALUES
(1, 'Ana Silva', '2024-01-10', 5000, 0, 'Pago'),
(2, 'Bruno Costa', '2024-01-11', 5000, 500, 'Pago'),
(3, 'Carla Dias', '2024-01-12', 5000, 0, 'Pago'),
(4, 'Novo Aluno', '2024-07-20', 5000, 0, 'Pendente');
SELECT setval(pg_get_serial_sequence('enrollments', 'id'), (SELECT MAX(id) FROM enrollments));

-- ===================== student_enrollments =====================
INSERT INTO public.student_enrollments OVERRIDING SYSTEM VALUE (id, student_id, academic_year_id, class_id, enrollment_number, enrollment_date, status, monthly_fee, enrollment_fee, discount_percent) VALUES
(5, 23, 2, 12, 'MAT-2026-00001', '2026-01-15', 'APROVADA', 2500, 1500, 0),
(6, 24, 2, 12, 'MAT-2026-00002', '2026-01-15', 'APROVADA', 2500, 1500, 0),
(7, 25, 2, 13, 'MAT-2026-00003', '2026-01-15', 'APROVADA', 2500, 1500, 10),
(8, 26, 2, 13, 'MAT-2026-00004', '2026-01-15', 'APROVADA', 2500, 1500, 0),
(9, 27, 2, 14, 'MAT-2026-00005', '2026-01-15', 'APROVADA', 2800, 1500, 0),
(10, 28, 2, 14, 'MAT-2026-00006', '2026-01-15', 'APROVADA', 2800, 1500, 0),
(11, 29, 2, 15, 'MAT-2026-00007', '2026-01-15', 'APROVADA', 2800, 1500, 0),
(12, 30, 2, 15, 'MAT-2026-00008', '2026-01-15', 'APROVADA', 2800, 1500, 10),
(13, 31, 2, 16, 'MAT-2026-00009', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(14, 32, 2, 16, 'MAT-2026-00010', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(15, 33, 2, 17, 'MAT-2026-00011', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(16, 34, 2, 17, 'MAT-2026-00012', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(17, 35, 2, 18, 'MAT-2026-00013', '2026-01-15', 'APROVADA', 3500, 1500, 10),
(18, 36, 2, 18, 'MAT-2026-00014', '2026-01-15', 'APROVADA', 3500, 1500, 0),
(19, 37, 2, 19, 'MAT-2026-00015', '2026-01-15', 'APROVADA', 4000, 1500, 0),
(20, 38, 2, 19, 'MAT-2026-00016', '2026-01-15', 'APROVADA', 4000, 1500, 0),
(21, 39, 2, 12, 'MAT-2026-00017', '2026-01-15', 'APROVADA', 2500, 1500, 0);
SELECT setval(pg_get_serial_sequence('student_enrollments', 'id'), (SELECT MAX(id) FROM student_enrollments));

-- ===================== calendar_events =====================
INSERT INTO public.calendar_events OVERRIDING SYSTEM VALUE (id, title, description, date, type, is_all_day, location, color, class_id, subject_id) VALUES
(1, 'Início do 2º Trimestre', 'Marca o começo do segundo trimestre letivo.', '2024-04-15', 'Evento', true, NULL, '#2D5F3F', NULL, NULL),
(2, 'Dia da Paz', 'Feriado nacional. Não haverá aulas.', '2024-04-04', 'Feriado', true, NULL, '#2D5F3F', NULL, NULL),
(3, 'Prova de Matemática - 7ª Classe', NULL, '2024-05-20', 'Prova', true, NULL, '#2D5F3F', 2, 1),
(4, 'Prazo Pagamento Mensalidade', 'Data limite para o pagamento da mensalidade de Maio sem multa.', '2024-05-05', 'Prazo', true, NULL, '#2D5F3F', NULL, NULL),
(5, 'Prazo Pagamento Mensalidade', 'Data limite para o pagamento da mensalidade de Junho sem multa.', '2024-06-05', 'Prazo', true, NULL, '#2D5F3F', NULL, NULL),
(6, 'Reunião de Pais e Mestres', 'Reunião para entrega de notas e discussão do desempenho dos alunos.', '2024-06-28', 'Evento', true, NULL, '#2D5F3F', NULL, NULL),
(7, 'Entrega de Boletins 1º Trimestre', 'Reunião com encarregados', '2026-04-28', 'Evento', false, 'Auditório', '#2D5F3F', NULL, NULL),
(8, 'Dia do Herói Moçambicano', 'Feriado Nacional', '2026-02-03', 'Feriado', true, NULL, '#DC2626', NULL, NULL),
(9, 'Prazo de Pagamento - Fevereiro', 'Último dia para pagamento sem multa', '2026-02-10', 'Prazo', true, 'Secretaria', '#EF4444', NULL, NULL),
(10, 'Feira de Ciências', 'Exposição de projetos dos alunos', '2026-03-20', 'Evento', true, 'Pátio Central', '#8B5CF6', NULL, NULL),
(11, 'Provas do 2º Trimestre', 'Início das provas trimestrais', '2026-07-06', 'Prova', true, 'Salas de Aula', '#F59E0B', NULL, NULL),
(12, 'Férias Escolares', 'Início das férias do meio do ano', '2026-07-20', 'Evento', true, NULL, '#06B6D4', NULL, NULL);
SELECT setval(pg_get_serial_sequence('calendar_events', 'id'), (SELECT MAX(id) FROM calendar_events));

-- ===================== announcements =====================
INSERT INTO public.announcements OVERRIDING SYSTEM VALUE (id, title, content, type, priority, target_audience, is_published, published_at) VALUES
(1, 'Bem-vindos ao Ano Lectivo 2026!', 'É com grande alegria que damos as boas-vindas a todos os educandos, encarregados de educação e corpo docente para mais um ano lectivo. Que 2026 seja repleto de aprendizagens e conquistas!', 'GERAL', 'ALTA', ARRAY['TODOS'], true, '2026-01-25 03:42:37.525367+00'),
(2, 'Calendário de Pagamentos 2026', 'Informamos que o pagamento das propinas deve ser efectuado até ao dia 10 de cada mês. Pagamentos após esta data incorrerão em multa de 5%.', 'PROPINAS', 'URGENTE', ARRAY['ENCARREGADOS'], true, '2026-01-25 03:42:37.525367+00'),
(3, 'Reunião de Pais - 8ª Classe', 'Convidamos todos os encarregados de educação dos alunos da 8ª classe para uma reunião no dia 08 de Fevereiro às 14h no Auditório.', 'REUNIAO', 'NORMAL', ARRAY['ENCARREGADOS'], true, '2026-01-25 03:42:37.525367+00'),
(4, 'Horário das Aulas', 'O horário das aulas para o 1º trimestre já está disponível na secretaria. Os professores podem consultar online através do sistema.', 'INFORMATIVO', 'NORMAL', ARRAY['PROFESSORES', 'ALUNOS'], true, '2026-01-25 03:42:37.525367+00'),
(5, 'Feira de Ciências 2026', 'Estão abertas as inscrições para a Feira de Ciências que acontecerá no dia 20 de Março. Os alunos interessados devem formar grupos de até 4 elementos.', 'EVENTO', 'BAIXA', ARRAY['ALUNOS', 'PROFESSORES'], true, '2026-01-25 03:42:37.525367+00'),
(6, 'Manutenção do Sistema', 'O sistema estará indisponível no dia 02/02 das 22h às 06h para manutenção programada.', 'INFORMATIVO', 'ALTA', ARRAY['TODOS'], false, NULL);
SELECT setval(pg_get_serial_sequence('announcements', 'id'), (SELECT MAX(id) FROM announcements));

-- ===================== integration_settings =====================
-- NOTA: As API keys abaixo são de exemplo. Substituir pelas chaves reais no novo projecto.
INSERT INTO public.integration_settings OVERRIDING SYSTEM VALUE (id, integration_name, api_key, api_url, instance_name, is_active, additional_config) VALUES
(1, 'evolution_api', NULL, 'https://evoapi.autozapi.com', 'SGE-REVIVA', false, '{"description":"WhatsApp Business API"}'),
(2, 'openai', NULL, NULL, NULL, false, '{"description":"OpenAI GPT API para geração de contratos"}'),
(3, 'google_ai', NULL, NULL, NULL, false, '{"description":"Google AI Studio (Gemini)"}');
SELECT setval(pg_get_serial_sequence('integration_settings', 'id'), (SELECT MAX(id) FROM integration_settings));

-- ===================== lesson_plan_config =====================
-- NOTA: O system_prompt (id=1) é muito longo e deve ser inserido manualmente via SQL Editor.
INSERT INTO public.lesson_plan_config OVERRIDING SYSTEM VALUE (id, config_key, config_value, description) VALUES
(2, 'model', 'google/gemini-2.5-flash', 'Modelo de IA a utilizar'),
(3, 'temperature', '0.2', 'Temperatura da geração (0-1)'),
(4, 'max_tokens', '16000', 'Máximo de tokens na resposta'),
(5, 'llm_provider', 'google', 'Provedor de IA (lovable_ai, openai, google)');
SELECT setval(pg_get_serial_sequence('lesson_plan_config', 'id'), (SELECT MAX(id) FROM lesson_plan_config));

-- ===================== lesson_plan_fields =====================
INSERT INTO public.lesson_plan_fields OVERRIDING SYSTEM VALUE (id, field_name, field_label, field_type, options, is_required, is_active, display_order) VALUES
(9, 'tema_aula', 'Tema da Aula', 'text', '{}', true, true, 1),
(10, 'objetivos_competencias', 'Objectivos e Competências', 'textarea', '{}', false, true, 2),
(11, 'num_aulas', 'Número de aulas pretendido', 'select', ARRAY['1','2','3','4','5','6','7','8','9'], true, true, 3),
(12, 'principio', 'Princípios da AEP', 'multiselect', ARRAY['Mordomia','Caráter','Semeadura e Colheita','Autogoverno','Soberania','Individualidade','União / Aliança'], true, true, 4),
(13, 'palavras_chave', 'Palavras-Chave', 'textarea', '{}', true, true, 5),
(14, 'versiculos_biblicos', 'Textos Bíblicos', 'textarea', '{}', false, true, 6),
(15, 'ideia_guia', 'Ideia-Guia', 'textarea', '{}', false, true, 7),
(16, 'ferramentas_aep', 'Ferramentas da AEP', 'multiselect', ARRAY['Fichário','Estudo de palavras (Webster)','Ensaio (produção textual)','Belas Artes','Clássicos literários','Biografias','Linha do tempo','Memoriais','Celebração','Avaliações e Revisões','Oportunidade de Serviço'], true, true, 8);
SELECT setval(pg_get_serial_sequence('lesson_plan_fields', 'id'), (SELECT MAX(id) FROM lesson_plan_fields));

-- ===================== db_ativo =====================
INSERT INTO public.db_ativo OVERRIDING SYSTEM VALUE VALUES (1, 1, now());
SELECT setval(pg_get_serial_sequence('db_ativo', 'id'), (SELECT MAX(id) FROM db_ativo));

-- ===================== DADOS VOLUMOSOS =====================
-- Os seguintes dados devem ser re-criados via Edge Function seed-data
-- ou inseridos manualmente via SQL Editor:
--
-- • grades (610+ registos) — re-gerar via seed-data
-- • attendance (1026+ registos) — re-gerar via seed-data
-- • tuition_fees (125+ registos) — re-gerar via seed-data
-- • transactions (46+ registos) — re-gerar via seed-data
-- • lesson_plans (5 registos com HTML grande)
-- • contract_signatures (2 registos com HTML grande)
-- • lesson_plan_config system_prompt (id=1, texto muito grande)
--
-- Os utilizadores (auth.users), profiles e user_roles serão criados
-- via Edge Function seed-users no novo projecto Supabase.
-- ============================================================
