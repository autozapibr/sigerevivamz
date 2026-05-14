-- Primeiro, remover as atribuições antigas (10ª e 12ª Classe)
DELETE FROM public.class_curriculum 
WHERE teacher_id = 44;

-- Adicionar as novas atribuições para as turmas de 4ª Classe com a disciplina de Física (ID 35)
INSERT INTO public.class_curriculum (teacher_id, class_id, subject_id, shift, weekly_hours)
VALUES 
(44, 30, 35, 'Manhã', 2),
(44, 31, 35, 'Manhã', 2);