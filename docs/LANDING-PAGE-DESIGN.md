# Documentação de Design — Landing Page SiGER / Escola Reviva

Referência técnica completa da página pública `src/pages/LandingPage.tsx`.
Todos os valores aqui documentados foram extraídos directamente de
`src/pages/LandingPage.tsx`, `src/index.css`, `tailwind.config.ts` e `index.html`.

- Última revisão: Agosto de 2026
- Ano lectivo em vigor: 2026
- Autoria do sistema: AutoZapi — Soluções em TI, AI e Automações

---

## 1. Identidade e informação institucional

### Escola Reviva

- Escola de carácter social, sem fins lucrativos, em Moçambique (contexto padrão: Nampula).
- Missão comunicada na página: **"Restaurar Vidas e Valores"** — transformação pela educação.
- Badge institucional do hero: `Escola Reviva · Moçambique`.

### SiGER — Sistema de Gestão Escolar Reviva

- Plataforma de gestão escolar: educandos, professores, avaliações, propinas e relatórios.
- Conformidade com as directrizes do **MEC** (Ministério da Educação e Cultura de Moçambique).
- Escala de avaliação **0–20**; moeda **MZN (Metical)**.
- Localização PT-MZ: validações de **BI**, **NUIT** e telemóvel **+258**.

### AEP — Abordagem Educacional por Princípios

Diferencial pedagógico apresentado na página. Parte do raciocínio sobre verdades
bíblicas, identifica os fundamentos do conhecimento e conduz à reflexão de
causa-efeito, desenvolvendo entendimento realizador e carácter cristão.
Integra filosofia, currículo e metodologia cristãs envolvendo família, igreja e escola.

Metodologia **PRRR** (grelha de 4 cartões na página):

| Letra | Etapa | Descrição usada na página |
| --- | --- | --- |
| P | Pesquisar | Investigar as fontes e definir conceitos |
| R | Raciocinar | Analisar princípios e suas aplicações |
| R | Relacionar | Conectar o aprendizado com a vida |
| R | Registar | Documentar e aplicar o conhecimento |

Link externo de referência: `https://aecep.org.br/aep` (AECEP), aberto em nova aba.

### Funcionalidades comunicadas (8 cartões)

| Ícone (lucide) | Título | Descrição |
| --- | --- | --- |
| `Users` | Gestão de Educandos | Cadastro completo, histórico académico, documentos e acompanhamento individualizado. |
| `BookOpen` | Gestão Pedagógica | Planos de aula com IA, lançamento de notas (0-20), currículo e calendário de provas. |
| `CreditCard` | Gestão Financeira | Propinas, cobranças, caixa, relatórios financeiros e recibos em MZN. |
| `BarChart3` | Relatórios MEC | Relatórios padronizados conforme directrizes do MEC. |
| `Calendar` | Presenças e Calendário | Controlo de frequência, eventos escolares e calendário académico integrado. |
| `Shield` | Segurança e Controlo | Perfis de acesso (Diretoria, Secretaria, Professor, Encarregado) com RLS. |
| `Bell` | Comunicação | Avisos, notificações e comunicação com encarregados de educação. |
| `GraduationCap` | Matrículas Online | Processo de matrícula digital com documentos, turmas e propinas integrados. |

### Argumentos da secção Missão (checklist)

1. Localizado para Moçambique (MZN, BI, NUIT)
2. Relatórios conforme o MEC
3. Acessível em qualquer dispositivo
4. Segurança com controlo de acesso por perfil

### Rodapé

`© 2026 SiGER - Sistema de Gestão Escolar Reviva` + crédito "Feito com ❤️ por
AutoZapi Soluções em TI, AI e Automações" (`https://autozapi.com`).

---

## 2. Estrutura de layout

```text
┌───────────────────────────────────────────────┐
│ HEADER  sticky · blur · borda inferior        │
├───────────────────────────────────────────────┤
│ HERO    imagem de fundo + gradiente lateral   │
├───────────────────────────────────────────────┤
│ FUNCIONALIDADES  bg-surface · grelha 8 cards  │
├───────────────────────────────────────────────┤
│ AEP     2 colunas: texto+PRRR | logo+galeria  │
├───────────────────────────────────────────────┤
│ MISSÃO  texto + checklist                     │
├───────────────────────────────────────────────┤
│ CTA     bg-primary · centrado                 │
├───────────────────────────────────────────────┤
│ FOOTER  bg-card · logo + créditos             │
└───────────────────────────────────────────────┘
```

Contentor base do documento: `min-h-screen bg-background text-foreground overflow-x-hidden`.

| Secção | Contentor | Espaçamento vertical | Grelha / notas |
| --- | --- | --- | --- |
| Header | `max-w-7xl mx-auto px-4 sm:px-6` | `py-[16px]` | `sticky top-0 z-50`, `bg-background/80 backdrop-blur-lg`, `border-b border-border`; logotipo + bloco textual (oculto em mobile) à esquerda, toggle de tema + botão "Entrar" à direita |
| Hero | `max-w-7xl mx-auto px-4 sm:px-6` | `py-20 sm:py-32 lg:py-40` | Imagem absoluta `object-cover` + overlay `bg-gradient-to-r from-background via-background/85 to-background/40`; conteúdo limitado a `max-w-2xl`; badge, H1, parágrafo `max-w-lg`, CTA |
| Funcionalidades | `max-w-7xl mx-auto px-4 sm:px-6`, `bg-surface` | `py-20 sm:py-28` | Cabeçalho centrado (`mb-16`) + `grid sm:grid-cols-2 lg:grid-cols-4 gap-6`; cartão: `bg-card rounded-xl border border-border p-6`, ícone em caixa `h-12 w-12 rounded-lg bg-primary/10` |
| AEP | `max-w-7xl mx-auto px-4 sm:px-6`, `border-b border-border` | `py-20 sm:py-28` | `grid lg:grid-cols-2 gap-12 items-center`; coluna esquerda: badge "Nosso Diferencial", H2, 2 parágrafos, `grid grid-cols-2 gap-4` PRRR, link AECEP; coluna direita: `aep-logo` (`max-w-sm rounded-2xl shadow-xl`) + 2 fotos `h-40 object-cover rounded-2xl` |
| Missão | `max-w-7xl mx-auto px-4 sm:px-6` | `py-20 sm:py-28` | `grid lg:grid-cols-2 gap-12 items-center` (conteúdo apenas na primeira coluna); lista `space-y-4` com ícones `CheckCircle2` |
| CTA | `max-w-4xl mx-auto px-4 sm:px-6 text-center`, `bg-primary` | `py-16 sm:py-20` | Ícone `GraduationCap h-12 w-12` (opacidade 80%), H2, parágrafo `max-w-xl`, botão `variant="secondary"` |
| Footer | `max-w-7xl mx-auto px-4 sm:px-6`, `bg-card`, `border-t` | `py-8` | `flex flex-col sm:flex-row items-center justify-between gap-4` |

---

## 3. Cores — modo escuro e claro

Todos os valores são **tokens semânticos HSL** definidos em `src/index.css` e
expostos ao Tailwind em `tailwind.config.ts`. Nunca usar cores fixas
(`text-white`, `bg-black`, `bg-[#...]`) nos componentes.

### Modo claro (`:root`)

| Token | HSL | Hex aprox. | Uso |
| --- | --- | --- | --- |
| `--primary` | `152 45% 28%` | `#276848` | Verde institucional: H1 "SiGER", botões, ícones, CTA |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre verde |
| `--primary-light` | `148 38% 42%` | `#42946C` | Gradientes e hovers |
| `--primary-dark` | `152 55% 20%` | `#173F2C` | Gradiente do hero |
| `--background` | `0 0% 100%` | `#FFFFFF` | Fundo da página |
| `--foreground` | `222 47% 11%` | `#0F172A` | Texto principal |
| `--surface` | `220 14% 98%` | `#F9FAFB` | Fundo da secção Funcionalidades |
| `--card` | `0 0% 100%` | `#FFFFFF` | Cartões e footer |
| `--muted` | `220 14% 96%` | `#F1F3F6` | Fundo do botão de tema |
| `--muted-foreground` | `220 9% 46%` | `#6B7280` | Texto secundário |
| `--accent` | `152 30% 95%` | `#EDF7F1` | Realces suaves |
| `--border` / `--input` | `220 13% 91%` | `#E4E7EB` | Bordas e separadores |
| `--ring` | `152 45% 28%` | `#276848` | Anel de foco |
| `--success` | `152 60% 40%` | `#29A36B` | Estados positivos |
| `--warning` | `38 92% 50%` | `#F59E0B` | Alertas |
| `--destructive` / `--error` | `0 84% 60%` | `#EF4444` | Erros |
| `--info` | `213 94% 68%` | `#5FA8FA` | Informação |

### Modo escuro (`.dark`) — usado por omissão na landing

| Token | HSL | Hex aprox. | Uso |
| --- | --- | --- | --- |
| `--primary` | `152 45% 45%` | `#3FA774` | Verde mais luminoso para contraste |
| `--primary-light` | `148 38% 55%` | `#69BD94` | Gradientes |
| `--primary-dark` | `152 50% 35%` | `#2D8659` | Profundidade |
| `--background` | `222 47% 8%` | `#0B111E` | Fundo da página |
| `--foreground` | `210 20% 98%` | `#F8FAFC` | Texto principal |
| `--surface` | `222 40% 10%` | `#0F1524` | Secção Funcionalidades |
| `--surface-elevated` | `222 35% 12%` | `#141A29` | Superfícies elevadas |
| `--card` / `--popover` | `222 40% 10%` | `#0F1524` | Cartões e footer |
| `--muted` | `217 33% 17%` | `#1D283A` | Fundos neutros |
| `--muted-foreground` | `215 20% 65%` | `#94A3B8` | Texto secundário |
| `--accent` | `152 30% 15%` | `#1B3128` | Realces |
| `--accent-foreground` | `152 45% 60%` | `#63C495` | Texto sobre realce |
| `--border` / `--input` | `217 33% 17%` | `#1D283A` | Bordas |
| `--ring` | `152 45% 45%` | `#3FA774` | Anel de foco |

### Gradientes, sombras e raio

```css
--gradient-primary: linear-gradient(135deg, hsl(152 45% 28%) 0%, hsl(148 38% 42%) 100%);
--gradient-hero:    linear-gradient(135deg, hsl(152 45% 28%) 0%, hsl(152 55% 20%) 100%);
--gradient-subtle:  linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 14% 98%) 100%);

--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-primary: 0 10px 30px -10px hsl(152 45% 28% / 0.3);
--shadow-glow: 0 0 40px hsl(148 38% 42% / 0.3);

--radius: 0.75rem; /* lg; md = radius-2px; sm = radius-4px */
```

No modo escuro, `--gradient-subtle`, `--shadow-primary` e `--shadow-glow` são
redefinidos com menor opacidade (0.2 / 0.15).

### Comportamento de tema na landing

- Ao montar, a página **força o modo escuro**: remove `light` e adiciona `dark` em `document.documentElement`.
- O estado local `isDark` inicia em `true`; o toggle no header alterna as classes `light`/`dark`.
- Ícones: `Sun` quando escuro (indicando a acção "ir para claro") e `Moon` quando claro.
- Cor do tema do navegador (`index.html`): `#2D5F3F`.

---

## 4. Tipografia

- Família única: **Inter**, importada do Google Fonts em `src/index.css` (pesos 300, 400, 500, 600, 700, 800) e também pré-ligada em `index.html`.
- Fallback: `system-ui, sans-serif` (`fontFamily.sans` em `tailwind.config.ts`).
- Ajustes globais: `antialiased`, `scroll-smooth`, `font-feature-settings: "cv11", "ss01"`, `text-rendering: optimizeLegibility`.

### Escala global (`@layer base` em `index.css`)

| Elemento | Classes |
| --- | --- |
| `h1` | `text-3xl md:text-4xl font-bold tracking-tight` |
| `h2` | `text-2xl md:text-3xl font-semibold tracking-tight` |
| `h3` | `text-xl md:text-2xl font-semibold` |
| `h4` | `text-lg md:text-xl font-medium` |

### Escala específica da landing

| Uso | Classes | Notas |
| --- | --- | --- |
| H1 do hero | `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]` | Duas linhas: "SiGER" em `text-primary`, subtítulo em `text-foreground/90` |
| Parágrafo do hero | `text-lg sm:text-xl text-muted-foreground leading-relaxed` | Largura `max-w-lg` |
| H2 de secção | `text-3xl sm:text-4xl font-bold` | Funcionalidades, AEP, Missão, CTA |
| Subtítulo de secção | `text-lg text-muted-foreground` | Centrado, `max-w-2xl` |
| Título de cartão | `font-semibold text-lg` | — |
| Descrição de cartão | `text-sm text-muted-foreground leading-relaxed` | — |
| Badges | `text-xs font-medium text-primary` | Pílula `rounded-full bg-primary/10 px-4 py-1.5` |
| Letra PRRR | `text-2xl font-extrabold text-primary` | Com `text-sm` no nome e `text-xs` na descrição |
| Marca no header | `font-bold text-primary text-lg` + `text-sm text-muted-foreground` | — |
| Footer | `text-sm` (copyright) e `text-xs text-muted-foreground/60` (créditos) | — |

Documentos PDF gerados pelo sistema (planos de aula) usam **'Work Sans' Light 300** —
não Inter. A Inter aplica-se apenas à interface.

---

## 5. Responsividade

Abordagem **mobile-first**. Breakpoints Tailwind utilizados nesta página:

| Prefixo | Largura mínima | Alvo |
| --- | --- | --- |
| (base) | 0 px | Telemóvel |
| `sm` | 640 px | Telemóvel grande / tablet |
| `lg` | 1024 px | Portátil / desktop |

Largura máxima do conteúdo: `max-w-7xl` (1280 px), excepto o CTA (`max-w-4xl`, 896 px).
O contentor raiz aplica `overflow-x-hidden` para eliminar deslocamento horizontal.

| Elemento | Mobile (base) | `sm` (≥640) | `lg` (≥1024) |
| --- | --- | --- | --- |
| Padding horizontal | `px-4` | `px-6` | `px-6` |
| Padding vertical das secções | `py-20` | `py-28` | `py-28` |
| Hero (vertical) | `py-20` | `py-32` | `py-40` |
| CTA (vertical) | `py-16` | `py-20` | `py-20` |
| H1 do hero | `text-4xl` | `text-5xl` | `text-6xl` |
| H2 das secções | `text-3xl` | `text-4xl` | `text-4xl` |
| Grelha de funcionalidades | 1 coluna | 2 colunas | 4 colunas |
| Secções AEP e Missão | 1 coluna | 1 coluna | 2 colunas |
| Grelha PRRR | 2 colunas | 2 colunas | 2 colunas |
| Galeria de fotos AEP | 2 colunas (`h-40`) | 2 colunas | 2 colunas |
| Botões do hero | `flex-col` (empilhados) | `flex-row` | `flex-row` |
| Logotipo no header | `h-10` | `h-12` | `h-12` |
| Bloco "SiGER / Sistema de Gestão Escolar" | oculto (`hidden`) | visível (`sm:block`) | visível |
| Footer | `flex-col`, centrado | `flex-row`, `justify-between` | `flex-row` |

PWA: `index.html` declara `viewport width=device-width, initial-scale=1.0`,
`manifest.webmanifest`, `apple-touch-icon` e meta tags de web app para iOS.

---

## 6. Movimento e interacção

Biblioteca: **Framer Motion**.

```ts
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};
```

| Elemento | Animação |
| --- | --- |
| Conteúdo do hero | `initial {opacity:0, y:40}` → `animate {opacity:1, y:0}`, duração 0.7 s |
| Cabeçalho de secção | `whileInView` com `y:20` → `0`, duração 0.5 s, `viewport {once:true}` |
| Cartões (features e PRRR) | Variante `fadeUp` com `custom={i}` — cascata de 0.08 s por item |
| Coluna de texto da AEP | Entrada lateral `x:-30` → `0`, duração 0.6 s |
| Coluna de imagens da AEP | Entrada lateral `x:30` → `0`, duração 0.6 s |
| Bloco do CTA | `scale 0.95` → `1` com fade, duração 0.5 s |
| Toggle de tema | `whileTap {scale:0.9, rotate:180}`, transição 0.3 s |

Estados de interacção (Tailwind):

- Cartões de funcionalidade: `hover:shadow-lg hover:border-primary/30 transition-all duration-300`; a caixa do ícone passa de `bg-primary/10` para `bg-primary/20` via `group-hover`.
- Botão de tema: `bg-muted hover:bg-muted/80 transition-colors`.
- Links de texto: `text-primary hover:underline`.
- Todas as animações recorrem apenas a `opacity` e `transform`, mantendo o desempenho em dispositivos modestos.

---

## 7. Assets e acessibilidade

### Inventário de imagens (`src/assets/`)

| Ficheiro | Uso | Texto alternativo |
| --- | --- | --- |
| `escola-reviva-logo.png` | Logotipo no header e no footer | "Escola Reviva" |
| `escola-reviva-logo.webp` | Variante optimizada do logotipo | — |
| `hero-kids.jpg` | Fundo do hero | "Crianças da Escola Reviva" |
| `aep-logo.png` | Destaque da secção AEP | "Escola Reviva - Abordagem Educacional por Princípios" |
| `kids-classroom.jpg` | Galeria AEP (esquerda) | "Educandos na sala de aula" |
| `kids-learning.jpg` | Galeria AEP (direita) | "Crianças aprendendo" |
| `siger-logo-transparent.png` | Marca SiGER (importado na página) | — |

Ícones: **lucide-react** — `GraduationCap`, `Users`, `BookOpen`, `CreditCard`,
`BarChart3`, `Calendar`, `Shield`, `Bell`, `ArrowRight`, `CheckCircle2`, `Sun`, `Moon`.

### Acessibilidade

- Um único `h1` na página; hierarquia `h2` → `h3`/`h4` respeitada.
- Todas as imagens de conteúdo têm `alt` descritivo em português.
- O toggle de tema tem `aria-label` dinâmico ("Mudar para modo claro/escuro").
- Links externos usam `target="_blank"` com `rel="noopener noreferrer"`.
- Utilitário `.focus-ring` disponível em `index.css` (`ring-2 ring-primary/20 ring-offset-2`).
- Contraste: textos sobre `bg-primary` usam `--primary-foreground` (branco); no modo escuro o verde é clareado para `152 45% 45%` de modo a manter legibilidade.
- Alvos de toque com pelo menos 40 px (botões `p-2` em ícones de 20 px, botões `size="lg"`).

### SEO já configurado em `index.html`

- `lang="pt-MZ"`.
- `<title>`: "SiGER - Sistema de Gestão Escolar Reviva | Moçambique".
- Meta `description`, `keywords`, `author`, `robots: index, follow`, `theme-color`.
- `canonical`: `https://sigerevivamz.lovable.app`.
- Open Graph completo (`og:title`, `og:description`, `og:type`, `og:locale pt_MZ`, `og:site_name`, `og:image`) e Twitter `summary_large_image`.
- JSON-LD `WebApplication` com categoria `EducationalApplication`, autor AutoZapi, preço 0 MZN e `inLanguage: pt-MZ`.

---

## Regras de manutenção

1. Alterar cores apenas em `src/index.css` (tokens) e expor em `tailwind.config.ts`; nunca introduzir valores hex nos componentes.
2. Preservar a paridade claro/escuro: qualquer token novo tem de existir em `:root` e em `.dark`.
3. Manter a escala tipográfica Inter e a hierarquia de títulos aqui descrita.
4. Validar sempre nas três larguras de referência (360 px, 768 px, 1440 px) antes de publicar.
5. Ao substituir imagens, manter as proporções (`object-cover`, `h-40` na galeria) e actualizar o texto alternativo.