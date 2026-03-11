## Redesign da Visualização do Plano de Aula

### Problema

Os tamanhos de fonte estão desequilibrados: h2 a 13px vs body a 11px cria uma hierarquia visual pobre. O layout geral parece "comprimido" e pouco profissional para visualização em ecrã e impressão.

### Abordagem

Redesenhar a tipografia e espaçamento em ambos os componentes (`LessonPlanPreview.tsx` e `ArchivedPlanPreview.tsx`) com uma escala tipográfica mais harmoniosa e espaçamento generoso.

### Mudanças Tipográficas (nova escala)

```text
ATUAL                    →  NOVO
body:    11px             →  12px (base legível)
h2:      13px (700)       →  13px (700) — ratio 1.23x
h3:      12px (600)       →  13px (600) — ratio 1.12x
h4:      11px (600)       →  12px (600) — ratio 1.04x
p, li:   11px             →  12px
th:      10px             →  11px
td:      10px             →  11px
```

### Mudanças de Layout (visualização em ecrã)

- Aumentar padding interno do conteúdo (de `px-6/px-10` para `px-8/px-12`)
- Aumentar `py` de 5/6 para 8
- Remover inline `fontSize: 11px` e `fontWeight: 300` do div de conteúdo; usar `font-normal` (400) como base
- Melhorar espaçamento entre secções: h2 margin de `14px 0 6px` → `20px 0 8px`
- Blockquote com padding e border-radius mais generosos
- Tabelas com padding de células mais confortável

### Mudanças de Layout (PDF / A4_STYLES)

- Aplicar a mesma escala tipográfica no `A4_STYLES` (constante duplicada em ambos os ficheiros)
- Body font-weight de 300 → 400 para melhor legibilidade impressa
- Manter line-height 1.7

### Ficheiros a Editar

1. `**src/components/lesson-plans/LessonPlanPreview.tsx**` — A4_STYLES + div de conteúdo inline styles
2. `**src/components/lesson-plans/ArchivedPlanPreview.tsx**` — A4_STYLES + div de conteúdo inline styles

### Detalhes Técnicos

- A constante `A4_STYLES` está duplicada nos dois ficheiros; ambas serão atualizadas com os mesmos valores
- O inline style no div `dangerouslySetInnerHTML` será atualizado para `fontSize: 13px` e `fontWeight: 400`
- Os estilos de `prose prose-sm` no `LessonPlanPreview` serão mantidos mas complementados pela nova escala