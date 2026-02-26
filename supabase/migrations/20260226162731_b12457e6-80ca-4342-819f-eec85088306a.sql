-- Update the ferramentas_aep field with all 12 AEP tools
UPDATE public.lesson_plan_fields
SET options = ARRAY[
  '4 Passos (Pesquisar, Raciocinar, Relacionar, Registrar)',
  'Fichamento',
  'Caderno de Registro',
  'Linha do Tempo',
  'Pesquisa Bíblica',
  'Raciocínio e Registro',
  'Dissertação',
  'Tabela T (Causa e Efeito)',
  'Vocabulário / Definição de Palavras (Webster 1828)',
  'Mapa de Ideias',
  'Composição / Redação',
  'Quadro Comparativo'
],
field_label = 'Ferramentas AEP (selecione 2 ou mais)',
updated_at = now()
WHERE field_name = 'ferramentas_aep';