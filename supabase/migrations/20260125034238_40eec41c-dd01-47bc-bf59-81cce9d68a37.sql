-- =====================================================
-- SEED DATA PARTE 4: PRESENÇAS E NOTAS
-- =====================================================

-- 12. PRESENÇAS (Attendance) - Últimos 10 dias letivos de Janeiro
INSERT INTO public.attendance (student_id, class_id, subject_id, date, status, observation)
SELECT 
  s.id,
  s.class_id,
  sub.id,
  d::date,
  CASE 
    WHEN RANDOM() < 0.85 THEN 'PRESENTE'
    WHEN RANDOM() < 0.92 THEN 'FALTA'
    WHEN RANDOM() < 0.97 THEN 'FALTA_JUSTIFICADA'
    ELSE 'ATRASO'
  END,
  CASE 
    WHEN RANDOM() < 0.1 THEN 'Chegou atrasado'
    WHEN RANDOM() < 0.05 THEN 'Apresentou atestado médico'
    ELSE NULL
  END
FROM students s
CROSS JOIN (
  SELECT id FROM subjects WHERE name IN ('Português', 'Matemática', 'Inglês') LIMIT 3
) sub
CROSS JOIN generate_series('2026-01-13'::date, '2026-01-24'::date, '1 day'::interval) AS d
WHERE s.class_id IS NOT NULL 
  AND s.status = 'Ativo'
  AND EXTRACT(DOW FROM d) NOT IN (0, 6)  -- Excluir fins de semana
ON CONFLICT DO NOTHING;

-- 13. NOTAS (Grades) - 1º Trimestre
INSERT INTO public.grades (student_id, subject_id, class_id, academic_year_id, trimestre, acs, acp, acf, media_trimestral, observation)
SELECT 
  s.id,
  sub.id,
  s.class_id,
  (SELECT id FROM academic_years WHERE is_current = true LIMIT 1),
  1,
  ROUND((RANDOM() * 8 + 8)::numeric, 1),  -- ACS: 8-16
  ROUND((RANDOM() * 8 + 8)::numeric, 1),  -- ACP: 8-16
  ROUND((RANDOM() * 10 + 8)::numeric, 1), -- ACF: 8-18
  NULL,  -- Será calculado pelo trigger ou aplicação
  CASE 
    WHEN RANDOM() < 0.1 THEN 'Aluno com bom desempenho'
    WHEN RANDOM() < 0.05 THEN 'Precisa de mais atenção'
    ELSE NULL
  END
FROM students s
CROSS JOIN (
  SELECT id FROM subjects WHERE name IN ('Português', 'Matemática', 'Inglês', 'Ciências Naturais', 'História', 'Geografia')
) sub
WHERE s.class_id IS NOT NULL AND s.status = 'Ativo'
ON CONFLICT DO NOTHING;

-- Atualizar média trimestral
UPDATE public.grades 
SET media_trimestral = ROUND(
  COALESCE(acs, 0) * 0.30 + 
  COALESCE(acp, 0) * 0.30 + 
  COALESCE(acf, 0) * 0.40, 
  2
)
WHERE media_trimestral IS NULL AND (acs IS NOT NULL OR acp IS NOT NULL OR acf IS NOT NULL);

-- 14. EVENTOS DO CALENDÁRIO
INSERT INTO public.calendar_events (title, description, date, type, is_all_day, color, location) VALUES
  ('Início do Ano Lectivo', 'Abertura oficial do ano lectivo 2026', '2026-02-01', 'Evento', true, '#2D5F3F', 'Escola'),
  ('Reunião de Pais - 8ª Classe', 'Apresentação do corpo docente e programa', '2026-02-08', 'Evento', false, '#4A7C59', 'Auditório'),
  ('Dia da Mulher Moçambicana', 'Feriado Nacional', '2026-04-07', 'Feriado', true, '#DC2626', NULL),
  ('Dia dos Trabalhadores', 'Feriado Nacional', '2026-05-01', 'Feriado', true, '#DC2626', NULL),
  ('Dia da Independência', 'Feriado Nacional - Celebração da Independência', '2026-06-25', 'Feriado', true, '#DC2626', NULL),
  ('Provas do 1º Trimestre', 'Início das provas trimestrais', '2026-04-14', 'Prova', true, '#F59E0B', 'Salas de Aula'),
  ('Entrega de Boletins 1º Trimestre', 'Reunião com encarregados', '2026-04-28', 'Evento', false, '#2D5F3F', 'Auditório'),
  ('Dia do Herói Moçambicano', 'Feriado Nacional', '2026-02-03', 'Feriado', true, '#DC2626', NULL),
  ('Prazo de Pagamento - Fevereiro', 'Último dia para pagamento sem multa', '2026-02-10', 'Prazo', true, '#EF4444', 'Secretaria'),
  ('Feira de Ciências', 'Exposição de projetos dos alunos', '2026-03-20', 'Evento', true, '#8B5CF6', 'Pátio Central'),
  ('Provas do 2º Trimestre', 'Início das provas trimestrais', '2026-07-06', 'Prova', true, '#F59E0B', 'Salas de Aula'),
  ('Férias Escolares', 'Início das férias do meio do ano', '2026-07-20', 'Evento', true, '#06B6D4', NULL)
ON CONFLICT DO NOTHING;

-- 15. COMUNICADOS
INSERT INTO public.announcements (title, content, type, priority, target_audience, is_published, published_at) VALUES
  ('Bem-vindos ao Ano Lectivo 2026!', 'É com grande alegria que damos as boas-vindas a todos os educandos, encarregados de educação e corpo docente para mais um ano lectivo. Que 2026 seja repleto de aprendizagens e conquistas!', 'GERAL', 'ALTA', ARRAY['TODOS'], true, NOW()),
  ('Calendário de Pagamentos 2026', 'Informamos que o pagamento das propinas deve ser efectuado até ao dia 10 de cada mês. Pagamentos após esta data incorrerão em multa de 5%.', 'PROPINAS', 'URGENTE', ARRAY['ENCARREGADOS'], true, NOW()),
  ('Reunião de Pais - 8ª Classe', 'Convidamos todos os encarregados de educação dos alunos da 8ª classe para uma reunião no dia 08 de Fevereiro às 14h no Auditório.', 'REUNIAO', 'NORMAL', ARRAY['ENCARREGADOS'], true, NOW()),
  ('Horário das Aulas', 'O horário das aulas para o 1º trimestre já está disponível na secretaria. Os professores podem consultar online através do sistema.', 'INFORMATIVO', 'NORMAL', ARRAY['PROFESSORES', 'ALUNOS'], true, NOW()),
  ('Feira de Ciências 2026', 'Estão abertas as inscrições para a Feira de Ciências que acontecerá no dia 20 de Março. Os alunos interessados devem formar grupos de até 4 elementos.', 'EVENTO', 'BAIXA', ARRAY['ALUNOS', 'PROFESSORES'], true, NOW()),
  ('Manutenção do Sistema', 'O sistema estará indisponível no dia 02/02 das 22h às 06h para manutenção programada.', 'INFORMATIVO', 'ALTA', ARRAY['TODOS'], false, NULL)
ON CONFLICT DO NOTHING;