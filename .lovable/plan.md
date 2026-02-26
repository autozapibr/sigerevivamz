

## Problemas Identificados

1. **`\`\`\`html` aparece nos campos**: A IA retorna conteúdo envolvido em blocos markdown (` ```html ... ``` `). O regex atual (`/<[^>]*>/g`) remove tags HTML, mas **não** remove os delimitadores markdown ` ```html ` e ` ``` `.

2. **"Versículos Chaves" → "Textos Bíblicos"**: O label está armazenado na BD (`field_label = 'Versículos Chaves'` no registo id=14). Precisa ser atualizado na BD.

3. **Ferramentas da AEP marcado como opcional**: Apesar de `is_required = true` na BD, o código no formulário força `isOptional = true` na linha 154: `const isOptional = !field.is_required || field.field_name === 'ferramentas_aep'`. A hint também diz "(opcional)".

## Plano de Implementação

### 1. Corrigir strip de markdown nos campos de auxílio IA
**Ficheiro**: `src/components/lesson-plans/LessonPlanForm.tsx` (linha 85)

Alterar o regex de limpeza para também remover blocos ` ```html `, ` ```xml `, ` ``` `, etc.:
```typescript
const content = (data?.content || '')
  .replace(/```[\w]*\n?/g, '')  // remove ```html, ```xml, etc.
  .replace(/<[^>]*>/g, '')       // remove HTML tags
  .trim();
```

### 2. Adicionar instrução explícita nos prompts para NÃO usar markdown
**Ficheiro**: `src/components/lesson-plans/LessonPlanForm.tsx` (linhas 67-73)

Adicionar ao final de cada prompt de auxílio: `"Responda APENAS em texto puro, sem blocos de código, sem markdown, sem HTML."` para os 3 campos (versiculos, ideia_guia, objetivos).

### 3. Renomear "Versículos Chaves" → "Textos Bíblicos" na BD
Executar SQL:
```sql
UPDATE lesson_plan_fields SET field_label = 'Textos Bíblicos' WHERE id = 14;
```

### 4. Tornar Ferramentas da AEP obrigatório
**Ficheiro**: `src/components/lesson-plans/LessonPlanForm.tsx`

- Linha 154: remover `|| field.field_name === 'ferramentas_aep'` da condição `isOptional`
- Linha 147: alterar `min: 0` para `min: 1` e remover "(opcional)" da hint
- Adicionar validação no `handleSubmit` para verificar que pelo menos 1 ferramenta foi selecionada

