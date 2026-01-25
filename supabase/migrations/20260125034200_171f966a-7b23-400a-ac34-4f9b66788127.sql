-- =====================================================
-- SEED DATA PARTE 3: MATRÍCULAS E PROPINAS
-- =====================================================

-- 9. MATRÍCULAS (Student Enrollments)
INSERT INTO public.student_enrollments (student_id, academic_year_id, class_id, enrollment_number, enrollment_date, status, monthly_fee, enrollment_fee, discount_percent)
SELECT 
  s.id,
  (SELECT id FROM academic_years WHERE is_current = true LIMIT 1),
  s.class_id,
  'MAT-2026-' || LPAD(ROW_NUMBER() OVER (ORDER BY s.id)::TEXT, 5, '0'),
  '2026-01-15',
  s.enrollment_status,
  CASE 
    WHEN c.name LIKE '8%' THEN 2500
    WHEN c.name LIKE '9%' THEN 2800
    WHEN c.name LIKE '10%' THEN 3200
    WHEN c.name LIKE '11%' THEN 3500
    WHEN c.name LIKE '12%' THEN 4000
    ELSE 2500
  END,
  1500,
  CASE WHEN s.id % 5 = 0 THEN 10 ELSE 0 END
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
WHERE s.enrollment_status = 'APROVADA' AND s.class_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 10. PROPINAS (Tuition Fees) - Janeiro a Dezembro 2026
INSERT INTO public.tuition_fees (student_id, month, amount, due_date, status)
SELECT 
  s.id,
  TO_CHAR(DATE '2026-01-01' + ((m - 1) * INTERVAL '1 month'), 'YYYY-MM'),
  CASE 
    WHEN c.name LIKE '8%' THEN 2500
    WHEN c.name LIKE '9%' THEN 2800
    WHEN c.name LIKE '10%' THEN 3200
    WHEN c.name LIKE '11%' THEN 3500
    WHEN c.name LIKE '12%' THEN 4000
    ELSE 2500
  END,
  DATE '2026-01-10' + ((m - 1) * INTERVAL '1 month'),
  CASE 
    WHEN m = 1 AND s.id % 3 != 0 THEN 'Pago'::tuition_status
    WHEN m = 1 AND s.id % 3 = 0 THEN 'Atrasado'::tuition_status
    WHEN m = 2 THEN 'Pendente'::tuition_status
    ELSE 'Pendente'::tuition_status
  END
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
CROSS JOIN generate_series(1, 3) AS m  -- Apenas Jan, Fev, Mar para não sobrecarregar
WHERE s.status = 'Ativo' AND s.class_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 11. TRANSAÇÕES FINANCEIRAS (últimos 6 meses)
-- Receitas
INSERT INTO public.transactions (type, description, amount, date, category_id) VALUES
  -- Dezembro 2025
  ('Receita', 'Propinas Dezembro 2025 - Lote 1', 125000, '2025-12-15', (SELECT id FROM financial_categories WHERE name = 'Propinas' LIMIT 1)),
  ('Receita', 'Propinas Dezembro 2025 - Lote 2', 98000, '2025-12-20', (SELECT id FROM financial_categories WHERE name = 'Propinas' LIMIT 1)),
  ('Receita', 'Matrículas Novas 2026', 45000, '2025-12-28', (SELECT id FROM financial_categories WHERE name = 'Taxa de Matrícula' LIMIT 1)),
  
  -- Janeiro 2026
  ('Receita', 'Propinas Janeiro 2026 - Lote 1', 135000, '2026-01-10', (SELECT id FROM financial_categories WHERE name = 'Propinas' LIMIT 1)),
  ('Receita', 'Propinas Janeiro 2026 - Lote 2', 112000, '2026-01-15', (SELECT id FROM financial_categories WHERE name = 'Propinas' LIMIT 1)),
  ('Receita', 'Propinas Janeiro 2026 - Lote 3', 78000, '2026-01-20', (SELECT id FROM financial_categories WHERE name = 'Propinas' LIMIT 1)),
  ('Receita', 'Matrículas Janeiro', 67500, '2026-01-05', (SELECT id FROM financial_categories WHERE name = 'Taxa de Matrícula' LIMIT 1)),
  ('Receita', 'Venda de Uniformes', 35000, '2026-01-12', (SELECT id FROM financial_categories WHERE name = 'Uniformes' LIMIT 1)),
  ('Receita', 'Material Escolar', 28000, '2026-01-08', (SELECT id FROM financial_categories WHERE name = 'Material Escolar' LIMIT 1)),
  ('Receita', 'Doação Empresa XYZ', 50000, '2026-01-22', (SELECT id FROM financial_categories WHERE name = 'Doações' LIMIT 1)),
  
  -- Despesas Dezembro 2025
  ('Despesa', 'Salários Docentes Dezembro', 280000, '2025-12-28', (SELECT id FROM financial_categories WHERE name = 'Salários' LIMIT 1)),
  ('Despesa', 'Salários Funcionários Dezembro', 145000, '2025-12-28', (SELECT id FROM financial_categories WHERE name = 'Salários' LIMIT 1)),
  ('Despesa', 'Água e Luz Dezembro', 18500, '2025-12-20', (SELECT id FROM financial_categories WHERE name = 'Água e Luz' LIMIT 1)),
  ('Despesa', 'Material Didático', 25000, '2025-12-15', (SELECT id FROM financial_categories WHERE name = 'Material Didático' LIMIT 1)),
  
  -- Despesas Janeiro 2026
  ('Despesa', 'Salários Docentes Janeiro', 285000, '2026-01-28', (SELECT id FROM financial_categories WHERE name = 'Salários' LIMIT 1)),
  ('Despesa', 'Salários Funcionários Janeiro', 148000, '2026-01-28', (SELECT id FROM financial_categories WHERE name = 'Salários' LIMIT 1)),
  ('Despesa', 'Água e Luz Janeiro', 19200, '2026-01-20', (SELECT id FROM financial_categories WHERE name = 'Água e Luz' LIMIT 1)),
  ('Despesa', 'Manutenção Ar Condicionado', 35000, '2026-01-15', (SELECT id FROM financial_categories WHERE name = 'Manutenção' LIMIT 1)),
  ('Despesa', 'Computadores Novos', 120000, '2026-01-10', (SELECT id FROM financial_categories WHERE name = 'Equipamentos' LIMIT 1)),
  ('Despesa', 'Transporte Escolar', 45000, '2026-01-25', (SELECT id FROM financial_categories WHERE name = 'Transporte' LIMIT 1)),
  ('Despesa', 'Material Didático Janeiro', 32000, '2026-01-18', (SELECT id FROM financial_categories WHERE name = 'Material Didático' LIMIT 1)),
  
  -- Mais transações para variedade nos gráficos
  ('Receita', 'Atividades Extra-Curriculares', 22000, '2026-01-14', (SELECT id FROM financial_categories WHERE name = 'Atividades Extra' LIMIT 1)),
  ('Despesa', 'Reparação do Telhado', 55000, '2026-01-08', (SELECT id FROM financial_categories WHERE name = 'Manutenção' LIMIT 1))
ON CONFLICT DO NOTHING;