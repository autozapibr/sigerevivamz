-- Garantir que o professor Abubacar (ID 44) está vinculado ao usuário correto
UPDATE public.profiles 
SET teacher_id = 44 
WHERE user_id = 'a65b8d45-8cc8-4498-8200-3060f05b7aed';

-- Limpar atribuições antigas para evitar duplicados ou conflitos durante o teste
DELETE FROM public.class_curriculum WHERE teacher_id = 44;

-- Atribuir Biologia (ID 33) e Língua Francesa (ID 30) às turmas 10ª (ID 40) e 12ª (ID 41)
-- 10ª Classe - Biologia
INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id, shift, weekly_hours)
VALUES (40, 33, 44, 'Manhã', 2);

-- 10ª Classe - Língua Francesa
INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id, shift, weekly_hours)
VALUES (40, 30, 44, 'Manhã', 2);

-- 12ª Classe - Biologia
INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id, shift, weekly_hours)
VALUES (41, 33, 44, 'Manhã', 2);

-- 12ª Classe - Língua Francesa
INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id, shift, weekly_hours)
VALUES (41, 30, 44, 'Manhã', 2);
