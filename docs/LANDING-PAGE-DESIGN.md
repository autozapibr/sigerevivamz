# Design da Landing Page — SiGER / Escola Reviva

**Última revisão:** 14 de Setembro de 2026  
**Implementação:** `src/pages/LandingPage.tsx`

## 1. Objectivo e mensagem

A página pública apresenta o **SiGER — Sistema de Gestão Escolar Reviva** e conduz o utilizador autenticado para `/login`. A primeira dobra comunica imediatamente a marca, a Escola Reviva, o contexto moçambicano e a oferta de gestão escolar.

Informação institucional apresentada:

- escola de carácter social e sem fins lucrativos;
- missão: **Restaurar Vidas e Valores**;
- contexto: Moçambique, com padrão operacional em Nampula;
- localização: MZN, BI, NUIT, telefone +258, termos escolares PT-MZ;
- conformidade e relatórios alinhados ao MEC;
- diferencial pedagógico AEP com metodologia PRRR.

## 2. Estrutura

```text
Header sticky: logotipo | tema | Entrar
Hero com fotografia: SiGER + proposta + acesso
Funcionalidades: 8 cartões
AEP: conteúdo PRRR + logotipo + galeria
Missão: texto + 4 compromissos
CTA institucional
Footer: marca e autoria
```

| Secção | Comportamento |
|---|---|
| Header | `max-w-7xl`, fundo translúcido com blur, borda inferior, logotipo e acções. |
| Hero | Imagem local em full-bleed com overlay da cor de fundo; conteúdo `max-w-2xl`; espaçamento `py-20 sm:py-32 lg:py-40`. |
| Funcionalidades | Faixa `surface`; 1, 2 ou 4 colunas; cartões individuais. |
| AEP | Uma coluna em mobile e duas em desktop; grelha PRRR e galeria. |
| Missão | Texto, descrição e checklist; desenho sem cartão exterior. |
| CTA | Faixa `primary`, texto `primary-foreground`, botão secundário. |
| Footer | Coluna em mobile e linha a partir de `sm`. |

## 3. Conteúdo funcional

Os oito cartões são: Gestão de Educandos, Gestão Pedagógica, Gestão Financeira, Relatórios MEC, Presenças e Calendário, Segurança e Controlo, Comunicação e Matrículas Online.

PRRR:

| Etapa | Descrição |
|---|---|
| Pesquisar | Investigar as fontes e definir conceitos. |
| Raciocinar | Analisar princípios e aplicações. |
| Relacionar | Conectar a aprendizagem com a vida. |
| Registar | Documentar e aplicar o conhecimento. |

## 4. Cores e tema

A landing usa os mesmos tokens semânticos descritos em [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md). Verde `primary` representa a marca; `background`, `surface`, `card`, `muted` e `border` constroem a hierarquia.

A página inicia em modo escuro e possui um toggle local. Ao contrário da área autenticada, essa escolha não é persistida pelo `useTheme`; ao sair da página, prevalece a preferência global guardada na aplicação.

## 5. Tipografia

- Família: Inter, com fallback do sistema.
- H1: `text-4xl sm:text-5xl lg:text-6xl`, extra-bold, duas linhas.
- H2: `text-3xl sm:text-4xl`, bold.
- Texto de abertura: `text-lg sm:text-xl`.
- Títulos de cartões: `text-lg`, semibold.
- Descrições: `text-sm`, `muted-foreground`.
- Badges: `text-xs`, fundo `primary/10`.

## 6. Imagens

| Asset | Uso | Texto alternativo |
|---|---|---|
| `escola-reviva-logo.png` | Header e footer | Escola Reviva |
| `hero-kids.jpg` | Fundo do hero | Crianças da Escola Reviva |
| `aep-logo.png` | Secção AEP | Escola Reviva — Abordagem Educacional por Princípios |
| `kids-classroom.jpg` | Galeria | Educandos na sala de aula |
| `kids-learning.jpg` | Galeria | Crianças aprendendo |

As imagens são locais, não hotlinks. Fotografias usam `object-cover`; logotipos preservam proporção.

## 7. Responsividade

| Elemento | Base | `sm` ≥640 | `lg` ≥1024 |
|---|---|---|---|
| Contentor | `px-4` | `px-6` | `px-6` |
| Funcionalidades | 1 coluna | 2 colunas | 4 colunas |
| AEP | 1 coluna | 1 coluna | 2 colunas |
| PRRR | 2 colunas | 2 colunas | 2 colunas |
| Marca textual do header | oculta | visível | visível |
| Footer | coluna | linha | linha |

O contentor principal usa `overflow-x-hidden`. O hero mantém uma indicação visual clara de continuidade para a secção seguinte em ecrãs usuais.

## 8. Movimento

Framer Motion aplica entrada por opacidade e deslocamento curto:

- hero: `y: 40 → 0`, 0,7 s;
- cabeçalhos: `y: 20 → 0`, uma vez ao entrar na viewport;
- cartões: cascata de 0,08 s;
- secção AEP: entradas laterais de 30 px;
- CTA: fade com escala 0,95 → 1;
- tema: rotação curta ao tocar.

Novas animações devem respeitar `prefers-reduced-motion`.

## 9. Acessibilidade e SEO

- Um `h1` e hierarquia semântica de títulos.
- Textos alternativos nas imagens.
- Nome acessível no toggle de tema.
- Links externos com `noopener noreferrer`.
- Texto sobre `primary` usa `primary-foreground`.
- `index.html` define `lang="pt-MZ"`, viewport, título, descrição, canonical, Open Graph, Twitter Card e JSON-LD.

A nomenclatura oficial na interface e documentação é **MEC**. Metadados antigos que ainda mencionem MINEDH devem ser tratados como dívida de conteúdo, não como referência editorial.

## 10. Regras de manutenção

1. Manter imagens no fluxo de assets do projecto.
2. Usar tokens em vez de cores locais.
3. Preservar um único H1 e a proposta clara no primeiro ecrã.
4. Testar 360 px, 768 px e 1440 px.
5. Rever contraste nos dois temas.
6. Actualizar este documento quando secções, mensagens ou assets mudarem.
