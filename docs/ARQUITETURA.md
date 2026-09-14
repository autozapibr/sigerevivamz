# Arquitectura do SiGER

**Sistema de Gestão Escolar Reviva**  
**Última revisão:** 14 de Setembro de 2026  
**Autoria:** [AutoZapi — Soluções em TI, AI e Automações](https://autozapi.com)

## 1. Visão geral

O SiGER é uma aplicação web de gestão escolar criada para a Escola Reviva e localizada para Moçambique. Reúne gestão académica, pedagógica, financeira, recursos humanos, comunicação e apoio por inteligência artificial.

Princípios de domínio:

- português de Moçambique e terminologia MEC;
- moeda MZN, notas 0–20 e telefone `+258`;
- AEP — Abordagem Educacional por Princípios — com metodologia PRRR;
- segurança por Supabase Auth, RBAC e RLS;
- experiência mobile-first, especialmente para professores;
- ano lectivo corrente 2026, sem intervalos de data hardcoded.

## 2. Estado do produto

### Implementado

- landing pública, login, registo por convite e assinatura pública de contratos;
- dashboards por função;
- educandos, encarregados, professores, colaboradores, turmas e disciplinas;
- matrículas, rematrículas, períodos e taxas por etapa;
- pauta digital, assiduidade, calendário, currículo e planos AEP com IA;
- propinas, caixa, cobranças, acordos e relatórios financeiros;
- documentos privados, contratos digitais e arquivos docentes;
- anúncios, notificações e tickets com actualização em tempo real;
- configuração de perfis, módulos, integrações, auditoria, roadmap e backups;
- manifesto e ícones para instalação como aplicação web.

### Planeado

O funcionamento offline completo ainda não está activo. As Fases 9 e 10 planeiam service worker, PGlite/IndexedDB, ElectricSQL, fila de escritas, conflitos e testes offline. O manifesto actual torna a aplicação instalável, mas dados e operações continuam a depender da ligação ao Supabase.

## 3. Stack

| Camada | Tecnologia |
|---|---|
| Interface | React 18.3, TypeScript 5.8, Vite 5.4 |
| Rotas | React Router DOM 6 |
| Estado remoto | TanStack Query 5 |
| Formulários | React Hook Form, Zod |
| UI | Tailwind CSS 3.4, shadcn/ui, Radix UI, Lucide |
| Movimento e gráficos | Framer Motion, Recharts |
| Exportação | xlsx, html2pdf.js |
| Sanitização | DOMPurify |
| Backend | Supabase PostgreSQL, Auth, Storage, Realtime e Edge Functions Deno |
| IA | Lovable AI Gateway e DeepSeek configuráveis na função pedagógica |
| Comunicação | Evolution API/WhatsApp quando configurada |
| Hospedagem | Lovable e CDN global |

## 4. Visão por camadas

```text
Browser / PWA instalável
┌────────────────────────────────────────────────────────────┐
│ React Router → páginas lazy → componentes shadcn           │
│ AuthContext | SearchContext | estado local                 │
│ TanStack Query → hooks de domínio → Supabase JS            │
└────────────────────────────┬───────────────────────────────┘
                             │ HTTPS + JWT
Supabase                     │
┌────────────────────────────▼───────────────────────────────┐
│ Auth ─ user_roles ─ profiles                               │
│ PostgreSQL + RLS + funções + triggers                      │
│ Realtime para eventos seleccionados                        │
│ Storage privado para documentos e backups                  │
│ Edge Functions para IA, utilizadores, mensagens e backups  │
└────────────────────────────┬───────────────────────────────┘
                             │
                    APIs externas configuradas
```

O cliente Supabase persistente vive em `src/integrations/supabase/client.ts`. O `QueryClient` usa cache de cinco minutos, retenção de dez minutos, uma repetição de leitura e nenhuma repetição automática de mutação.

## 5. Arranque e providers

`src/main.tsx` monta `App`. Em `src/App.tsx`, a árvore principal é:

```text
ErrorBoundary
└── QueryClientProvider
    └── TooltipProvider
        ├── Toaster / Sonner
        └── BrowserRouter
            └── AuthProvider
                ├── CommandPalette
                └── AppRoutes
```

Páginas pesadas são carregadas com `React.lazy` e `Suspense`; dashboard, landing e 404 são carregados imediatamente. Rejeições não tratadas são interceptadas para impedir falha silenciosa da interface, sem substituir o tratamento local de erros.

## 6. Autenticação e autorização

1. O utilizador autentica-se com email e palavra-passe no Supabase Auth.
2. `AuthContext` observa a sessão e renova tokens automaticamente.
3. A função do utilizador é lida em `user_roles`.
4. `ROLE_PERMISSIONS` controla a navegação visível.
5. `ProtectedRoute` exige sessão; `FinancialRoute` bloqueia ENCARREGADO e ALUNO na área financeira.
6. O banco volta a validar todas as operações por RLS.

A interface nunca é a única barreira de segurança. Roles ficam numa tabela separada para impedir escalada por edição de perfil. A ligação opcional de `profiles` a professor, educando ou colaborador associa a conta à pessoa real.

### Professor

`profiles.teacher_id` identifica o docente. `class_curriculum` define as combinações de turma e disciplina. Pauta, assiduidade e planos devem consultar somente essas atribuições e os educandos das respectivas turmas. O mesmo limite precisa existir nas policies RLS.

## 7. Organização do código

```text
src/
├── App.tsx                 rotas, providers e carregamento lazy
├── main.tsx                entrada da SPA
├── index.css               tokens, temas, estados e impressão
├── assets/                 imagens locais da marca e landing
├── components/
│   ├── ui/                 base shadcn/Radix
│   ├── layout/             sidebar, header e layout interno
│   ├── shared/             tabela, inputs, estados e métricas
│   └── <domínio>/          auth, matrículas, finanças, RH, AEP, tickets
├── contexts/               autenticação e pesquisa contextual
├── hooks/                  consultas e mutações por domínio
├── integrations/supabase/  cliente e tipos gerados
├── lib/                    sanitização, validação e exportação
├── pages/                  páginas e submódulos
├── data/                   seed visual do roadmap
└── types/                  contratos TypeScript de aplicação

supabase/
├── config.toml
└── functions/
    ├── database-backup/
    ├── generate-contract/
    ├── generate-lesson-plan/
    ├── manage-users/
    ├── seed-users/
    └── send-notification/
```

## 8. Módulos e rotas

### Públicas

| Rota | Função |
|---|---|
| `/` | Landing institucional. |
| `/login` | Autenticação. |
| `/registar/:token` | Registo por convite. |
| `/assinar/:token` | Assinatura remota de contrato. |

### Gestão escolar

`/dashboard`, `/students`, `/students/:id`, `/students/:id/caderneta`, `/teachers`, `/turmas`, `/enrollments`, `/matriculas`, `/disciplinas`, `/calendario` e `/biblioteca`.

### Pedagógico

`/avaliacoes`, `/presencas`, `/calendario-provas`, `/plano-aulas`, `/curriculo` e `/arquivos`.

### Financeiro

`/financeiro`, `/financeiro/dashboard`, `/financeiro/caixa`, `/financeiro/propinas`, `/financeiro/cobrancas` e `/financeiro/relatorios`.

### Recursos humanos e comunicação

`/colaboradores`, `/rh/documentacao`, `/rh/contratos`, `/rh/utilizadores`, `/comunicacao`, `/notificacoes` e `/relatorios`.

### Configuração

`/configuracoes`, `/configuracoes/aparencia`, `/configuracoes/perfil`, `/configuracoes/notificacoes`, `/configuracoes/ia`, `/configuracoes/plano-aulas`, `/configuracoes/integracoes`, `/configuracoes/sistema`, `/configuracoes/roadmap`, `/configuracoes/backups`, `/configuracoes/auditoria`, `/configuracoes/matriculas` e `/configuracoes/perfis-utilizadores`.

Nem toda rota protegida possui um guard específico no router; a sidebar reduz exposição e o RLS deve impedir acesso indevido aos dados. Para páginas administrativas novas, preferir também um guard explícito de função.

## 9. Estado e dados

- **Servidor:** hooks TanStack Query encapsulam `select`, inserção, actualização, eliminação e invalidação.
- **Interface:** `useState`/`useReducer` para formulários, filtros e diálogos.
- **Global:** `AuthContext` e `SearchContext`.
- **Realtime:** subscrições são criadas em `useEffect` e removidas com `supabase.removeChannel`.
- **Erros:** mensagens técnicas são sanitizadas antes de chegar ao utilizador.

O limite padrão de 1000 linhas do Supabase deve ser considerado em relatórios e diagnósticos. Operações financeiras calculam saldo progressivo em ordem cronológica antes de filtrar.

## 10. Edge Functions

| Função | Responsabilidade | Autorização esperada |
|---|---|---|
| `generate-lesson-plan` | Gera planos AEP em PT-MZ, usa configuração e documentos institucionais. | ADMIN, DIRETORIA, PROFESSOR ou PEDAGOGICO; modo de demonstração controlado. |
| `generate-contract` | Apoia geração de contratos. | Utilizador autorizado. |
| `send-notification` | Envia mensagens por integrações configuradas. | Utilizador/função autorizada. |
| `manage-users` | Lista, cria, elimina, muda função e redefine palavra-passe. | ADMIN, DIRETORIA ou SECRETARIA com limites. |
| `seed-users` | Provisionamento controlado de contas iniciais. | Operação administrativa. |
| `database-backup` | Exporta tabelas para JSON privado e conserva 12 cópias. | ADMIN/DIRETORIA ou chamada interna. |

Secrets usados pelas funções permanecem no cofre do Supabase e nunca no frontend ou documentação. A lista actual inclui credenciais Supabase e chaves dos fornecedores de IA já configuradas.

## 11. Banco de dados e Storage

O modelo é descrito em [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md). Domínios centrais:

- identidade: `profiles`, `user_roles`, `role_module_access`;
- académico: `students`, `classes`, `subjects`, `class_curriculum`, matrículas e encarregados;
- pedagógico: `grades`, `attendance`, calendário e planos AEP;
- financeiro: propinas, transacções, cobranças e acordos;
- RH: professores, colaboradores, documentos e contratos;
- comunicação: anúncios, tickets e notificações;
- operação: auditoria, integrações, roadmap e backups.

Buckets privados: `student-documents`, `staff-files`, `teacher-files`, `aep-training-docs` e `database-backups`.

## 12. Design e responsividade

`MainLayout` combina sidebar retrátil, header sticky, conteúdo rolável e rodapé. Em mobile, o menu abre pela esquerda do header. Tema claro/escuro usa tokens HSL e preferência persistida; o padrão é escuro. Consulte [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) e [LANDING-PAGE-DESIGN.md](./LANDING-PAGE-DESIGN.md).

## 13. PWA e estratégia offline

Actualmente existem manifesto, ícones e metadados de instalação. Não existe service worker registado, base local nem sincronização bidireccional; portanto, o produto é **instalável e online-first**, não offline-first.

Arquitectura aprovada para evolução:

```text
React + TanStack Query
        ↓
PGlite / IndexedDB + outbox
        ↕
ElectricSQL auto-hospedado
        ↕
Supabase PostgreSQL + RLS
```

Antes de activar, é obrigatório resolver autenticação offline, filtros equivalentes ao RLS, soft delete, conflitos, anexos, observabilidade e testes de perda de rede.

## 14. Segurança

- RLS em dados sensíveis e policies por função e relação.
- `user_roles` separado de `profiles`.
- JWT validado antes de operações administrativas.
- `service_role` apenas dentro de Edge Functions.
- HTML de contratos e planos sanitizado.
- documentos e backups em buckets privados.
- auditoria de alterações críticas.
- funções privilegiadas com `search_path` fixo.
- inputs validados com Zod no cliente e regras no banco.

Nunca guardar API keys em tabelas de configuração ou no repositório. Qualquer mudança no banco deve incluir grants explícitos e revisão das policies.

## 15. Publicação e ambientes

| Ambiente | URL |
|---|---|
| Preview | `https://id-preview--cba9cf11-417e-4158-bda3-f65c0a319fc1.lovable.app` |
| Produção Lovable | `https://sigerevivamz.lovable.app` |
| Domínio principal | `https://escolareviva.com` |
| Alias | `https://www.escolareviva.com` |

O frontend é publicado pelo Lovable. Edge Functions são sincronizadas automaticamente. A aplicação usa um projecto Supabase externo já ligado; alterações de dados e segurança devem seguir o fluxo de migração aprovado.

## 16. Operação

- `npm run dev`: desenvolvimento local.
- `npm run build`: pacote de produção.
- `npm run lint`: análise estática.
- `npm run preview`: pré-visualização local do pacote.
- Backups: Edge Function `database-backup`, bucket privado, retenção de 12 ficheiros.
- Logs de funções: Supabase Dashboard.
- Roadmap funcional: `/configuracoes/roadmap`.

## 17. Glossário

| Termo | Significado |
|---|---|
| AEP | Abordagem Educacional por Princípios. |
| PRRR | Pesquisar, Raciocinar, Relacionar e Registar. |
| ACS / ACP / ACF | Componentes institucionais de avaliação com pesos 30% / 30% / 40%. |
| MEC | Ministério da Educação e Cultura. |
| MZN | Metical moçambicano. |
| RLS | Segurança a nível de linha no PostgreSQL. |
| RBAC | Controlo de acesso baseado em funções. |
| PWA | Aplicação web instalável. |
