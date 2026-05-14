-- Verificar se Língua Francesa existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Língua Francesa') THEN
        INSERT INTO public.subjects (name, code, workload) VALUES ('Língua Francesa', 'FRAN', 2);
    END IF;
END $$;

-- Atribuir professor Abubacar (ID 44) às disciplinas nas turmas correspondentes
-- 10ª Classe (ID 40)
INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id)
SELECT 40, id, 44 FROM public.subjects WHERE name IN ('Biologia', 'Língua Francesa')
ON CONFLICT DO NOTHING;

-- 12ª Classe (ID 41)
INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id)
SELECT 41, id, 44 FROM public.subjects WHERE name IN ('Biologia', 'Língua Francesa')
ON CONFLICT DO NOTHING;

-- Garantir que ele seja diretor de turma se necessário (opcional, mas ajuda na visibilidade das turmas)
-- UPDATE public.classes SET teacher_id = 44 WHERE id IN (40, 41);
