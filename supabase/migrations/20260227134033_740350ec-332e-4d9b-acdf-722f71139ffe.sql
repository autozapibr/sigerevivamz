-- Fix existing lesson plan titles and teacher_files to include the actual theme
-- Lesson plan id=5: Língua Portuguesa - 8ª A - Complemento Verbal e Nominal
UPDATE lesson_plans SET title = 'Língua Portuguesa - 8ª A - Complemento Verbal e Nominal' WHERE id = 5;
UPDATE teacher_files SET 
  file_name = 'Língua Portuguesa - 8ª A - Complemento Verbal e Nominal.html',
  description = 'Plano gerado automaticamente - Língua Portuguesa - 8ª A - Complemento Verbal e Nominal'
WHERE id = 3;

-- Lesson plan id=4: Geografia - 3ª Classe Única - O Sistema Solar
UPDATE lesson_plans SET title = 'Geografia - 3ª Classe Única - O Sistema Solar' WHERE id = 4;
UPDATE teacher_files SET 
  file_name = 'Geografia - 3ª Classe Única - O Sistema Solar.html',
  description = 'Plano gerado automaticamente - Geografia - 3ª Classe Única - O Sistema Solar'
WHERE id = 2;

-- Lesson plan id=3: Biologia - 7ª Classe B - O Cérebro Humano
UPDATE lesson_plans SET title = 'Biologia - 7ª Classe B - O Cérebro Humano' WHERE id = 3;
UPDATE teacher_files SET 
  file_name = 'Biologia - 7ª Classe B - O Cérebro Humano.html',
  description = 'Plano gerado automaticamente - Biologia - 7ª Classe B - O Cérebro Humano'
WHERE id = 1;