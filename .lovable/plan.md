# Documentação de Design — Landing Page SiGER / Escola Reviva

Criar uma documentação técnica completa da landing page (`src/pages/LandingPage.tsx`), em duas entregas: um ficheiro Markdown versionado no projecto e um PDF formatado com a identidade SiGER para partilha.

## Entregas

1. `docs/LANDING-PAGE-DESIGN.md` — referência técnica no repositório.
2. `/mnt/documents/SiGER-Landing-Page-Design.pdf` — versão para download/partilha, gerada com ReportLab, fonte Unicode (DejaVu Sans) para acentuação PT-MZ, capa com verde institucional e swatches de cor.

## Conteúdo do documento

**1. Identidade e informação institucional**
- Escola Reviva (Moçambique, contexto Nampula), missão "Restaurar Vidas e Valores".
- SiGER — Sistema de Gestão Escolar Reviva; conformidade MEC, escala 0-20, moeda MZN, validações BI/NUIT/+258.
- AEP — Abordagem Educacional por Princípios e metodologia PRRR (Pesquisar, Raciocinar, Relacionar, Registar), com os 4 descritivos usados na página e o link AECEP.
- Perfis de acesso mencionados na página (Diretoria, Secretaria, Professor, Encarregado).
- Rodapé, autoria (AutoZapi) e ano lectivo 2026.

**2. Estrutura de layout (secção a secção)**
Header sticky com blur → Hero com imagem de fundo e gradiente → Funcionalidades (8 cards) → AEP (2 colunas + grelha PRRR + galeria) → Missão com checklist → CTA em fundo primário → Footer. Para cada secção: contentor `max-w-7xl`, paddings verticais, grelhas, e cópia de texto real.

**3. Cores — modo escuro e claro**
Tabela de tokens HSL retirados de `src/index.css`, com equivalente hex e uso:
- Light: `--primary 152 45% 28%`, `--background 0 0% 100%`, `--surface 220 14% 98%`, `--card`, `--muted`, `--border`, feedback (success/warning/error/info).
- Dark: `--primary 152 45% 45%`, `--background 222 47% 8%`, `--surface 222 40% 10%`, `--card 222 40% 10%`, `--muted 217 33% 17%`, `--border 217 33% 17%`.
- Gradientes (`--gradient-primary`, `--gradient-hero`, `--gradient-subtle`), sombras (`--shadow-sm` a `--shadow-xl`, `--shadow-primary`, `--shadow-glow`), raio `--radius: 0.75rem`.
- Nota: a landing força tema escuro ao montar, com toggle Sol/Lua no header.
- Regra do projecto: usar sempre tokens semânticos, nunca cores fixas.

**4. Tipografia**
Família Inter (pesos 300–800, Google Fonts), fallback `system-ui`; escala global h1–h4 de `index.css` e a escala específica do hero (`text-4xl → sm:5xl → lg:6xl`, `font-extrabold`, `leading-[1.1]`), corpo `text-lg/xl`, cards (título `text-lg`, descrição `text-sm`), badges `text-xs`, `font-feature-settings: "cv11","ss01"`.

**5. Responsividade**
Breakpoints Tailwind usados (`sm` 640, `lg` 1024), com tabela mobile/tablet/desktop por secção: grelha de features `1 → 2 → 4` colunas, secções AEP e Missão `1 → 2` colunas, padding `px-4 → sm:px-6`, paddings verticais `py-20 → sm:py-28`, botões `flex-col → sm:flex-row`, logotipo `h-10 → sm:h-12`, texto do header oculto em mobile, footer empilhado. Inclui `overflow-x-hidden` e abordagem mobile-first.

**6. Movimento e interacção**
Variantes Framer Motion (`fadeUp` com stagger de 0.08s), animações de entrada do hero (0.7s), `whileInView` com `viewport once`, deslocamentos laterais ±30px na secção AEP, `scale` no CTA, `whileTap` rotativo no toggle de tema, hover dos cards (sombra + borda `primary/30`).

**7. Assets e acessibilidade**
Inventário de imagens (`escola-reviva-logo.png`, `hero-kids.jpg`, `kids-classroom.jpg`, `kids-learning.jpg`, `aep-logo.png`, `siger-logo-transparent.png`) com uso e texto alternativo actual; notas de acessibilidade (H1 único, `aria-label` no toggle, `rel="noopener noreferrer"`, contraste) e resumo do SEO já presente em `index.html`.

## Notas técnicas

- Os valores documentados são extraídos directamente de `src/pages/LandingPage.tsx`, `src/index.css`, `tailwind.config.ts` e `index.html` — sem inventar tokens.
- Snippets de código curtos incluídos no Markdown para tokens e variantes de animação.
- Nenhum ficheiro de aplicação é alterado; apenas documentação nova.
- O PDF passa por verificação visual página a página antes da entrega.
