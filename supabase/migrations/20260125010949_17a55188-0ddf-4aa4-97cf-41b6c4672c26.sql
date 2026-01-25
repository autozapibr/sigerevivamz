-- Resetar sequências para evitar conflitos de ID
SELECT setval(pg_get_serial_sequence('transactions', 'id'), COALESCE((SELECT MAX(id) FROM transactions), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('tuition_fees', 'id'), COALESCE((SELECT MAX(id) FROM tuition_fees), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('students', 'id'), COALESCE((SELECT MAX(id) FROM students), 0) + 1, false);

-- Inserir transações de receita para Janeiro 2026
INSERT INTO transactions (type, amount, description, date, category_id) VALUES
('Receita', 45000.00, 'Propinas - Janeiro 2026 (Lote 1)', '2026-01-02', 1),
('Receita', 38000.00, 'Propinas - Janeiro 2026 (Lote 2)', '2026-01-05', 1),
('Receita', 52000.00, 'Propinas - Janeiro 2026 (Lote 3)', '2026-01-08', 1),
('Receita', 25000.00, 'Taxas de Matrícula', '2026-01-03', 2),
('Receita', 15000.00, 'Taxas de Matrícula', '2026-01-10', 2),
('Receita', 8500.00, 'Venda de Uniformes', '2026-01-06', 3),
('Receita', 12000.00, 'Venda de Material Escolar', '2026-01-12', 3),
('Receita', 35000.00, 'Propinas - Janeiro 2026 (Lote 4)', '2026-01-15', 1),
('Receita', 28000.00, 'Propinas - Janeiro 2026 (Lote 5)', '2026-01-18', 1),
('Receita', 18000.00, 'Propinas - Janeiro 2026 (Lote 6)', '2026-01-20', 1);

-- Inserir transações de despesa para Janeiro 2026
INSERT INTO transactions (type, amount, description, date, category_id) VALUES
('Despesa', 85000.00, 'Salários - Janeiro 2026', '2026-01-25', 101),
('Despesa', 15000.00, 'Material Didáctico', '2026-01-08', 102),
('Despesa', 8500.00, 'Conta de Electricidade - Janeiro', '2026-01-15', 104),
('Despesa', 4200.00, 'Conta de Água - Janeiro', '2026-01-15', 104),
('Despesa', 12000.00, 'Manutenção Predial', '2026-01-22', 103),
('Despesa', 6500.00, 'Material de Limpeza', '2026-01-10', 102);

-- Inserir propinas para os estudantes existentes (meses de 2026)
INSERT INTO tuition_fees (student_id, month, amount, due_date, status)
SELECT id, '2026-01', 3500.00, '2026-01-10', 
  CASE WHEN random() > 0.3 THEN 'Pago'::tuition_status ELSE 'Pendente'::tuition_status END
FROM students LIMIT 6;

-- Adicionar mais educandos para ter dados suficientes
INSERT INTO students (name, age, gender, status, nationality, province, district, class_id) VALUES
('João Carlos Machava', 15, 'MASCULINO', 'Ativo', 'Moçambicana', 'Maputo Cidade', 'KaMpfumo', 1),
('Maria Helena Sitoe', 14, 'FEMININO', 'Ativo', 'Moçambicana', 'Maputo', 'Matola', 1),
('Pedro António Cossa', 16, 'MASCULINO', 'Ativo', 'Moçambicana', 'Gaza', 'Xai-Xai', 2),
('Ana Beatriz Langa', 15, 'FEMININO', 'Ativo', 'Moçambicana', 'Inhambane', 'Maxixe', 2),
('Carlos Manuel Tembe', 17, 'MASCULINO', 'Ativo', 'Moçambicana', 'Sofala', 'Beira', 3),
('Teresa Isabel Mutemba', 16, 'FEMININO', 'Ativo', 'Moçambicana', 'Manica', 'Chimoio', 3),
('Francisco José Nhantumbo', 15, 'MASCULINO', 'Ativo', 'Moçambicana', 'Tete', 'Tete', 4),
('Joana Maria Manjate', 14, 'FEMININO', 'Ativo', 'Moçambicana', 'Zambézia', 'Quelimane', 4),
('Manuel Alberto Matsinhe', 16, 'MASCULINO', 'Ativo', 'Moçambicana', 'Nampula', 'Nampula', 5),
('Catarina Sofia Magaia', 15, 'FEMININO', 'Ativo', 'Moçambicana', 'Cabo Delgado', 'Pemba', 5),
('António Rafael Massinga', 17, 'MASCULINO', 'Ativo', 'Moçambicana', 'Niassa', 'Lichinga', 6),
('Isabel Helena Mabjaia', 16, 'FEMININO', 'Ativo', 'Moçambicana', 'Maputo Cidade', 'KaMaxaquene', 6),
('Domingos Paulo Guebuza', 15, 'MASCULINO', 'Ativo', 'Moçambicana', 'Maputo', 'Boane', 7),
('Luísa Marta Chissano', 14, 'FEMININO', 'Ativo', 'Moçambicana', 'Gaza', 'Chokwe', 7),
('Miguel Fernando Mondlane', 16, 'MASCULINO', 'Ativo', 'Moçambicana', 'Inhambane', 'Inhambane', 8);