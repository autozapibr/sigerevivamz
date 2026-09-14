# Design System e Experiência — SiGER

**Última revisão:** 14 de Setembro de 2026  
**Âmbito:** aplicação autenticada, componentes partilhados, impressão e relação com a landing page.

## 1. Direcção visual

O SiGER transmite confiança institucional, clareza operacional e proximidade humana. A interface é minimalista, profissional, mobile-first e localizada para Moçambique. Verde é a cor institucional; azuis aparecem pontualmente na navegação e na pauta, enquanto cores de estado mantêm significado funcional.

- Interface: **Inter**.
- PDFs de planos de aula: **Work Sans Light 300**.
- Tema inicial para novos utilizadores: escuro.
- Ícones: `lucide-react`.
- Componentes: shadcn/ui sobre Radix UI.
- Movimento: Framer Motion, curto e funcional.
- Raio base: `0.75rem`.

## 2. Tokens semânticos

As cores vivem em `src/index.css` e são expostas pelo `tailwind.config.ts`. Componentes devem usar papéis semânticos como `background`, `foreground`, `card`, `primary`, `muted`, `border`, `success` e `destructive`, em vez de valores visuais locais.

### Tema claro

| Papel | HSL | Uso |
|---|---:|---|
| `background` | `0 0% 100%` | Fundo principal. |
| `foreground` | `222 47% 11%` | Texto principal. |
| `primary` | `152 45% 28%` | Marca, CTA, selecção e foco. |
| `primary-light` | `148 38% 42%` | Gradientes e ênfase. |
| `primary-dark` | `152 55% 20%` | Profundidade institucional. |
| `secondary` | `220 14% 96%` | Acções secundárias. |
| `surface` | `220 14% 98%` | Faixas e áreas neutras. |
| `card` | `0 0% 100%` | Cartões. |
| `muted` | `220 14% 96%` | Controlo discreto. |
| `muted-foreground` | `220 9% 46%` | Texto secundário. |
| `accent` | `152 30% 95%` | Realce suave. |
| `border` / `input` | `220 13% 91%` | Separadores e campos. |
| `success` | `152 60% 40%` | Sucesso. |
| `warning` | `38 92% 50%` | Alerta. |
| `destructive` | `0 84% 60%` | Erro e eliminação. |
| `info` | `213 94% 68%` | Informação. |

### Tema escuro

| Papel | HSL | Uso |
|---|---:|---|
| `background` | `222 47% 8%` | Fundo principal. |
| `foreground` | `210 20% 98%` | Texto principal. |
| `primary` | `152 45% 45%` | Marca com contraste ampliado. |
| `primary-light` | `148 38% 55%` | Realce. |
| `primary-dark` | `152 50% 35%` | Profundidade. |
| `secondary` | `222 47% 11%` | Acções secundárias. |
| `surface` / `card` | `222 40% 10%` | Superfícies. |
| `surface-elevated` | `222 35% 12%` | Elevação. |
| `muted` / `border` / `input` | `217 33% 17%` | Neutros e separadores. |
| `muted-foreground` | `215 20% 65%` | Texto secundário. |
| `accent` | `152 30% 15%` | Realce discreto. |

A sidebar possui tokens próprios (`sidebar-background`, `sidebar-foreground`, `sidebar-primary`, `sidebar-accent`, `sidebar-border`, `sidebar-ring`) para manter contraste nos dois temas.

## 3. Tipografia

| Elemento | Escala global |
|---|---|
| `h1` | `text-3xl md:text-4xl`, bold |
| `h2` | `text-2xl md:text-3xl`, semibold |
| `h3` | `text-xl md:text-2xl`, semibold |
| `h4` | `text-lg md:text-xl`, medium |
| Corpo | Inter regular, cor `foreground` |
| Apoio | Tamanho menor, cor `muted-foreground` |

Não escalar fonte continuamente com a largura do ecrã. Rótulos e botões devem quebrar linha quando necessário, nunca sobrepor conteúdo.

## 4. Estrutura interna

```text
┌──────────────┬────────────────────────────────────┐
│ Sidebar      │ Header fixo                        │
│ retrátil     ├────────────────────────────────────┤
│ e modular    │ Conteúdo com rolagem vertical      │
│              │ p-3 / sm:p-4 / md:p-6              │
│              ├────────────────────────────────────┤
│              │ Rodapé institucional               │
└──────────────┴────────────────────────────────────┘
```

### Sidebar

- Agrupa Gestão Escolar, Pedagógico, Financeiro, Recursos Humanos, Sistema e Configurações.
- Os módulos visíveis dependem da função autenticada.
- Funciona como acordeão: ao abrir uma secção, a anterior fecha.
- Pode recolher para ícones; clicar num ícone recolhido expande a secção correspondente.
- Preserva a posição vertical durante a navegação na sessão.
- A barra de rolagem usa tons azuis discretos conforme a decisão visual actual.
- Em mobile transforma-se em painel acionado pelo botão de menu à esquerda do cabeçalho.

### Header

- Altura de 64 px, posição sticky, fundo translúcido e blur.
- Mostra botão de menu em mobile, título opcional, sino de notificações, tema e menu do utilizador.
- O sino apresenta contagem e integra alertas em tempo real do sistema de tickets.
- O nome completo e email aparecem no menu; o cabeçalho usa primeiro nome em desktop.

### Conteúdo

- `MainLayout` controla largura, overflow e espaçamento.
- Cartões são usados para itens ou métricas, não para envolver secções inteiras.
- Tabelas densas devem permitir rolagem horizontal em mobile e preservar a coluna identificadora quando necessário.

## 5. Componentes e estados

- Usar `Button` do design system para acções.
- `DataTable` para listagens com pesquisa, ordenação ou paginação.
- `StatsCard` para KPIs, `StatusBadge` para estado e `EmptyState` para ausência de dados.
- `CurrencyInput` formata MZN.
- `MozambiqueInput` aplica padrões de BI, NUIT e telemóvel +258.
- `GradeInput` aceita notas de 0 a 20; a digitação deve ser concluída antes de guardar, inclusive em mobile.
- Toasts usam mensagens curtas em PT-MZ e nunca expõem erros técnicos sensíveis.

### Notas 0–20

| Intervalo | Classe visual | Contraste |
|---|---|---|
| 18–20 | Excelente, verde | Fundo forte e texto claro. |
| 14–17,99 | Bom, azul | Fundo forte e texto claro. |
| 10–13,99 | Suficiente, âmbar | Fundo claro e texto escuro. |
| 5–9,99 | Insuficiente, laranja | Fundo forte e texto claro. |
| 0–4,99 | Mau, vermelho | Fundo forte e texto claro. |

As tags usam aproximadamente `0.8rem`, peso extra-bold e espaçamento de letras para leitura rápida.

## 6. Responsividade

| Faixa | Comportamento esperado |
|---|---|
| Base, 0–639 px | Uma coluna; sidebar em painel; botão de menu visível; tabelas roláveis; acções sem sobreposição. |
| `sm`, ≥640 px | Duas colunas quando útil; títulos do header podem aparecer. |
| `md`, ≥768 px | Sidebar persistente; conteúdo com `p-6`; identidade completa do utilizador. |
| `lg`, ≥1024 px | Grelhas de gestão e relatórios mais densas. |
| `2xl`, ≥1400 px | Contentor Tailwind limitado a 1400 px quando utilizado. |

Verificar, no mínimo, 360×800, 768×1024 e 1440×900. Telemóveis e tablets são prioritários para professores.

## 7. Tema

`useTheme` guarda `light`, `dark` ou `system` em `localStorage` com a chave `sge-theme`. Sem preferência guardada, usa escuro. O tema de sistema reage a mudanças de `prefers-color-scheme`.

A landing mantém um controlo local e inicia em escuro; a área autenticada usa a preferência persistida. O ícone deve comunicar a acção disponível e todos os controlos por ícone devem ter nome acessível.

## 8. Acessibilidade

- Contraste mínimo WCAG AA para texto e estados.
- Foco visível por teclado com o token `ring`.
- Alvos de toque preferencialmente ≥40×40 px.
- `aria-label` em botões apenas com ícone.
- `alt` contextual em imagens de conteúdo e `alt=""` em decoração.
- Uma única `h1` por página e ordem semântica de títulos.
- Não depender apenas da cor para comunicar estado.
- Animações devem respeitar `prefers-reduced-motion` em novas implementações.

## 9. Impressão e PDF

- Elementos `.no-print` são ocultados na impressão.
- Planos AEP usam Work Sans Light 300 e regras próprias para evitar quebras inadequadas.
- Relatórios e recibos preservam MZN, datas PT-MZ e identificação institucional.
- Conteúdo HTML vindo de editores ou IA deve ser sanitizado com DOMPurify antes da apresentação.

## 10. Localização de interface

- Português de Moçambique, com contexto padrão de Nampula.
- Termos: educando, encarregado de educação, turma, propina, assiduidade, ano lectivo.
- Instituição pública de referência: MEC.
- Datas com `date-fns`, locale português e fuso `Africa/Maputo` quando necessário.
- Telemóvel no padrão `+258` com 12 dígitos.
- Moeda `MZN`/Metical e notas na escala 0–20.

## 11. Manutenção

1. Definir cores novas como tokens nos dois temas.
2. Preferir componentes shadcn existentes a controlos HTML isolados.
3. Não criar cartões aninhados ou secções flutuantes sem função clara.
4. Garantir estados de loading, vazio, erro, sucesso, disabled e foco.
5. Rever contraste de novas tags nos dois temas.
6. Testar cada alteração em mobile e desktop.
7. A landing possui guia específico em [LANDING-PAGE-DESIGN.md](./LANDING-PAGE-DESIGN.md).
