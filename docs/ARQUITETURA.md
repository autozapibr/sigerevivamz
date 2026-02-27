# 📚 SiGER — Documentação de Arquitetura Completa

**Sistema de Gestão Escolar Reviva**  
Versão: 1.0 | Data: Fevereiro 2026  
Desenvolvido por: [AutoZapi Soluções em TI, AI e Automações](https://autozapi.com)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitectura do Sistema](#3-arquitectura-do-sistema)
4. [Estrutura de Ficheiros](#4-estrutura-de-ficheiros)
5. [Módulos do Sistema](#5-módulos-do-sistema)
6. [Modelo de Dados (Base de Dados)](#6-modelo-de-dados-base-de-dados)
7. [Autenticação e Controlo de Acesso (RBAC)](#7-autenticação-e-controlo-de-acesso-rbac)
8. [Edge Functions (Backend Serverless)](#8-edge-functions-backend-serverless)
9. [Integrações Externas](#9-integrações-externas)
10. [Design System e UI](#10-design-system-e-ui)
11. [Segurança](#11-segurança)
12. [Rotas da Aplicação](#12-rotas-da-aplicação)
13. [Contas Master de Produção](#13-contas-master-de-produção)
14. [Deploy e Infraestrutura](#14-deploy-e-infraestrutura)
15. [Glossário](#15-glossário)

---

## 1. Visão Geral

O **SiGER** (Sistema de Gestão Escolar Reviva) é uma plataforma web completa de gestão escolar, desenvolvida especificamente para o contexto educacional de **Moçambique**. O sistema segue as directrizes do **MINEDH** (Ministério da Educação e Desenvolvimento Humano) e utiliza terminologia, moeda (Metical — MZN), sistema de avaliação (0–20) e validações de dados locais (BI, NUIT, telefone +258).

### Objectivos Principais

- **Gestão Académica:** Educandos, matrículas, turmas, disciplinas, avaliações e assiduidade
- **Gestão Financeira:** Propinas, livro caixa, cobranças inteligentes, relatórios financeiros
- **Gestão Pedagógica:** Plano de aulas (AEP), pauta digital, calendário de provas, currículo
- **Gestão de RH:** Professores, colaboradores, contratos digitais, documentação
- **Comunicação:** Anúncios, notificações, integração WhatsApp via Evolution API
- **Inteligência Artificial:** Geração automática de planos de aula com Gemini 2.5 Flash

### Âmbito do MVP

O MVP foca-se nos perfis de gestão: **Admin, Diretoria, Secretaria e Financeiro**. Os portais para Professores, Encarregados e Alunos estão planeados para uma segunda fase.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **Frontend** | React | 18.3 | Biblioteca UI |
| **Bundler** | Vite | 5.4 | Build e dev server |
| **Linguagem** | TypeScript | 5.8 | Tipagem estática |
| **Estilos** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Componentes UI** | shadcn/ui | — | Design system base |
| **Animações** | Framer Motion | 12.x | Animações declarativas |
| **Formulários** | React Hook Form + Zod | 7.x / 3.x | Validação e formulários |
| **Estado Servidor** | TanStack Query (React Query) | 5.x | Cache e sincronização |
| **Roteamento** | React Router DOM | 6.x | Navegação SPA |
| **Gráficos** | Recharts | 2.x | Visualização de dados |
| **Backend** | Supabase | — | BaaS (Postgres, Auth, Storage, Edge Functions) |
| **Edge Functions** | Deno (Supabase) | — | Lógica serverless |
| **IA** | Google AI (Gemini 2.5 Flash) | — | Geração de planos de aula |
| **WhatsApp** | Evolution API | — | Mensagens e notificações |
| **Exportação** | xlsx, html2pdf.js | — | Excel e PDF |

### Dependências Principais

```
react, react-dom, react-router-dom
@tanstack/react-query
@supabase/supabase-js
react-hook-form, @hookform/resolvers, zod
framer-motion, recharts
shadcn/ui (radix-ui primitives)
date-fns, lucide-react, sonner
xlsx, html2pdf.js, dompurify
```

---

## 3. Arquitectura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  React   │  │ Tailwind │  │  React   │  │   Framer    │  │
│  │  Router  │  │   CSS    │  │  Query   │  │   Motion    │  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └─────────────┘  │
│       │                           │                          │
│  ┌────┴───────────────────────────┴───────────────────────┐  │
│  │           AuthContext (RBAC + Session)                  │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼──────────────────────────────────┐
│                     SUPABASE CLOUD                           │
│  ┌────────────────────────┴───────────────────────────────┐  │
│  │              Supabase Auth (JWT)                        │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────┐  ┌────────┴───────┐  ┌───────────────────┐  │
│  │  Storage   │  │   PostgreSQL   │  │  Edge Functions   │  │
│  │  (Buckets) │  │  (RLS ativo)   │  │  (Deno Runtime)   │  │
│  └────────────┘  └────────────────┘  └────────┬──────────┘  │
└───────────────────────────────────────────────┼──────────────┘
                                                │
                            ┌───────────────────┼──────────┐
                            │   APIs EXTERNAS               │
                            │  ┌──────────┐ ┌────────────┐  │
                            │  │ Google   │ │ Evolution  │  │
                            │  │ AI API   │ │ API (WPP)  │  │
                            │  └──────────┘ └────────────┘  │
                            └───────────────────────────────┘
```

### Fluxo de Dados

1. O utilizador acede à SPA via browser
2. O `AuthContext` verifica a sessão via Supabase Auth
3. O role do utilizador é obtido da tabela `user_roles`
4. A navegação é filtrada pelo RBAC (`ROLE_PERMISSIONS`)
5. Dados são obtidos via Supabase JS SDK com React Query (cache 5min)
6. RLS no PostgreSQL garante segurança a nível de linha
7. Edge Functions processam lógica complexa (IA, notificações, contratos)

---

## 4. Estrutura de Ficheiros

```
src/
├── App.tsx                     # Roteamento principal e providers
├── main.tsx                    # Entry point
├── index.css                   # Design system (tokens CSS)
│
├── components/
│   ├── ui/                     # Componentes base shadcn/ui (~45 componentes)
│   ├── shared/                 # Componentes reutilizáveis de negócio
│   │   ├── DataTable.tsx       # Tabela genérica com ordenação/filtros
│   │   ├── StatsCard.tsx       # Card de métricas KPI
│   │   ├── CurrencyInput.tsx   # Input monetário (MZN)
│   │   ├── GradeInput.tsx      # Input de notas (0-20)
│   │   ├── MozambiqueInput.tsx # Inputs com máscaras MZ (BI, telefone)
│   │   ├── ProvinceSelector.tsx# Selector de províncias de Moçambique
│   │   ├── SearchFilter.tsx    # Barra de pesquisa com filtros
│   │   └── StatusBadge.tsx     # Badge de estado contextual
│   ├── auth/                   # Login e Registo
│   ├── layout/                 # MainLayout, AppSidebar, AppHeader
│   ├── students/               # StudentCard, StudentForm, PhotoCapture
│   ├── enrollment/             # Wizard de matrícula (5 steps)
│   ├── financial/              # Cobranças, recibos, relatórios, negociações
│   ├── contracts/              # Gerador, editor, assinatura digital
│   ├── lesson-plans/           # Formulário e preview de planos AEP
│   ├── attendance/             # Formulário de presença
│   ├── reports/                # Filtros, tabela e acções de relatórios
│   ├── rh/                     # StaffForm, DocumentUpload
│   ├── settings/               # Integrações, LLM, plano de aula config
│   ├── tickets/                # Sistema de tickets/suporte
│   └── dashboard/              # Gráficos e widgets do dashboard
│
├── contexts/
│   ├── AuthContext.tsx          # Autenticação e RBAC
│   └── SearchContext.tsx        # Pesquisa global
│
├── hooks/                      # ~30 custom hooks
│   ├── useStudents.ts          # CRUD educandos
│   ├── useTeachers.ts          # CRUD professores
│   ├── useClasses.ts           # CRUD turmas
│   ├── useGrades.ts            # Notas e avaliações
│   ├── useAttendance.ts        # Assiduidade
│   ├── useFinancial.ts         # Transacções financeiras
│   ├── useCollections.ts       # Cobranças inteligentes
│   ├── useEnrollments.ts       # Matrículas
│   ├── useLessonPlans.ts       # Planos de aula
│   ├── useContracts.ts         # Contratos digitais
│   ├── useEmployees.ts         # Colaboradores
│   ├── useNotifications.ts     # Notificações
│   ├── useAnnouncements.ts     # Anúncios
│   ├── useCalendarEvents.ts    # Calendário escolar
│   ├── useReports.ts           # Relatórios
│   ├── useIntegrationSettings.ts # Config de integrações
│   └── useTheme.ts             # Tema claro/escuro
│
├── pages/                      # ~35 páginas
│   ├── Dashboard.tsx           # Dashboard principal (multi-role)
│   ├── Students.tsx            # Lista de educandos
│   ├── StudentDetail.tsx       # Ficha individual
│   ├── Teachers.tsx            # Lista de professores
│   ├── Turmas.tsx              # Gestão de turmas
│   ├── Evaluations.tsx         # Pauta digital
│   ├── Attendance.tsx          # Assiduidade
│   ├── Financial.tsx           # Visão financeira geral
│   ├── Matriculas.tsx          # Matrículas
│   ├── financial/              # Sub-módulo financeiro (5 páginas)
│   ├── pedagogico/             # Sub-módulo pedagógico (4 páginas)
│   ├── rh/                     # Sub-módulo RH (3 páginas)
│   └── settings/               # Sub-módulo configurações (8 páginas)
│
├── types/
│   ├── auth.ts                 # UserRole, RBAC, permissões
│   ├── database.ts             # Tipos de domínio
│   └── enrollment.ts           # Tipos de matrícula
│
├── lib/
│   ├── utils.ts                # Utilitários (cn, formatação)
│   ├── sanitize.ts             # Sanitização HTML (DOMPurify)
│   ├── validators/
│   │   └── mozambique.ts       # Validações MZ (BI, NUIT, telefone)
│   └── exporters/
│       ├── financial-excel.ts  # Exportação Excel
│       ├── financial-pdf.ts    # Exportação PDF
│       └── index.ts            # Barrel export
│
└── integrations/
    └── supabase/
        ├── client.ts           # Cliente Supabase configurado
        └── types.ts            # Tipos gerados automaticamente

supabase/
├── config.toml                 # Configuração do projecto
└── functions/
    ├── generate-contract/      # Geração de contratos com IA
    ├── generate-lesson-plan/   # Geração de planos de aula com IA
    ├── manage-users/           # Gestão de utilizadores (admin)
    ├── seed-data/              # Dados de demonstração
    ├── seed-users/             # Contas master de produção
    └── send-notification/      # Envio WhatsApp/Email
```

---

## 5. Módulos do Sistema

### 5.1 Gestão Escolar
| Funcionalidade | Página | Descrição |
|---------------|--------|-----------|
| Dashboard | `/dashboard` | KPIs, gráficos, acções rápidas (filtrado por role) |
| Educandos | `/students` | CRUD completo, ficha individual, foto |
| Matrículas | `/matriculas` | Wizard de 5 etapas com número automático |
| Turmas | `/turmas` | Gestão de turmas e alocação |
| Disciplinas | `/disciplinas` | Cadastro de disciplinas e carga horária |
| Calendário | `/calendario` | Eventos escolares |
| Biblioteca | `/biblioteca` | Gestão de acervo |

### 5.2 Gestão Pedagógica
| Funcionalidade | Página | Descrição |
|---------------|--------|-----------|
| Pauta Digital | `/avaliacoes` | Lançamento de notas (ACS, ACP, ACF, média) |
| Assiduidade | `/presencas` | Registo de presenças diárias |
| Calendário de Provas | `/calendario-provas` | Agendamento com notificações automáticas |
| Plano de Aula AEP | `/plano-aulas` | Geração com IA (Gemini 2.5 Flash), metodologia PRRR |
| Arquivos | `/arquivos` | Ficheiros dos professores |
| Currículo | `/curriculo` | Atribuição professor-disciplina-turma |

### 5.3 Gestão Financeira
| Funcionalidade | Página | Descrição |
|---------------|--------|-----------|
| Visão Geral | `/financeiro` | Dashboard financeiro com KPIs |
| Livro Caixa | `/financeiro/caixa` | Entradas e saídas, categorias |
| Propinas | `/financeiro/propinas` | Gestão de mensalidades por educando |
| Cobranças | `/financeiro/cobrancas` | Cobranças inteligentes, negociações, lembretes |
| Relatórios | `/financeiro/relatorios` | Exportação Excel/PDF, gráficos |

### 5.4 Recursos Humanos
| Funcionalidade | Página | Descrição |
|---------------|--------|-----------|
| Professores | `/teachers` | Cadastro e gestão de docentes |
| Colaboradores | `/colaboradores` | Funcionários não-docentes |
| Utilizadores | `/rh/utilizadores` | Gestão de contas de acesso |
| Documentação | `/rh/documentacao` | Upload e verificação de documentos |
| Contratos | `/rh/contratos` | Geração, envio e assinatura digital |

### 5.5 Comunicação e Sistema
| Funcionalidade | Página | Descrição |
|---------------|--------|-----------|
| Comunicação | `/comunicacao` | Central de anúncios |
| Notificações | `/notificacoes` | Centro de notificações |
| Relatórios | `/relatorios` | Relatórios gerais MINEDH |

### 5.6 Configurações (ADMIN/DIRETORIA)
| Funcionalidade | Página | Descrição |
|---------------|--------|-----------|
| Aparência | `/configuracoes/aparencia` | Tema claro/escuro |
| Perfil | `/configuracoes/perfil` | Dados pessoais e região |
| Notificações | `/configuracoes/notificacoes` | Preferências de notificação |
| IA | `/configuracoes/ia` | Configuração do LLM (modelo, provider, temperatura) |
| Plano de Aula | `/configuracoes/plano-aulas` | Campos e templates do formulário AEP |
| Integrações | `/configuracoes/integracoes` | Evolution API, OpenAI/Google AI |
| Sistema | `/configuracoes/sistema` | Configurações gerais |

---

## 6. Modelo de Dados (Base de Dados)

### Tabelas Principais (PostgreSQL via Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                        NÚCLEO ACADÉMICO                         │
├─────────────────────────────────────────────────────────────────┤
│  students            → Educandos (dados pessoais, BI, NUIT)    │
│  classes             → Turmas (nome, ano, professor titular)    │
│  subjects            → Disciplinas (nome, código, carga)        │
│  academic_years      → Anos lectivos                            │
│  class_curriculum     → Relação turma-disciplina-professor      │
│  student_enrollments → Matrículas (número auto, valores, status)│
│  guardians           → Encarregados de educação                 │
│  student_guardians   → Relação educando-encarregado             │
│  student_documents   → Documentos de educandos                  │
│  student_scholarships→ Bolsas de estudo                         │
├─────────────────────────────────────────────────────────────────┤
│                    AVALIAÇÃO E ASSIDUIDADE                       │
├─────────────────────────────────────────────────────────────────┤
│  grades              → Notas (ACS, ACP, ACF, média trimestral)  │
│  attendance          → Presenças diárias                         │
│  student_attendance_stats → Vista agregada de assiduidade       │
├─────────────────────────────────────────────────────────────────┤
│                      GESTÃO FINANCEIRA                          │
├─────────────────────────────────────────────────────────────────┤
│  enrollments         → Pagamentos de matrícula                  │
│  tuition_fees        → Propinas mensais                         │
│  financial_categories→ Categorias (receita/despesa)             │
│  payment_agreements  → Acordos de pagamento                     │
│  agreement_installments → Parcelas de acordos                   │
│  communication_history → Histórico de cobranças enviadas        │
│  scheduled_reminders → Lembretes agendados                      │
├─────────────────────────────────────────────────────────────────┤
│                     RECURSOS HUMANOS                            │
├─────────────────────────────────────────────────────────────────┤
│  teachers            → Professores (dados, salário, contrato)   │
│  employees           → Colaboradores não-docentes               │
│  staff_documents     → Documentos de funcionários               │
│  contract_signatures → Contratos digitais e assinaturas         │
├─────────────────────────────────────────────────────────────────┤
│                  PEDAGÓGICO E COMUNICAÇÃO                        │
├─────────────────────────────────────────────────────────────────┤
│  lesson_plans        → Planos de aula gerados                   │
│  lesson_plan_fields  → Campos configuráveis do formulário       │
│  lesson_plan_config  → Configuração do LLM                      │
│  lesson_plan_training_docs → Documentos de treino da IA         │
│  teacher_files       → Ficheiros dos professores                │
│  calendar_events     → Eventos e provas                         │
│  exam_notifications  → Notificações de provas                   │
│  announcements       → Comunicados oficiais                     │
│  announcement_reads  → Leituras de comunicados                  │
├─────────────────────────────────────────────────────────────────┤
│                    SISTEMA E SEGURANÇA                           │
├─────────────────────────────────────────────────────────────────┤
│  profiles            → Perfis de utilizador                     │
│  user_roles          → Funções (RBAC) — tabela separada         │
│  integration_settings→ Configurações de APIs externas           │
│  scholarships        → Tipos de bolsa                           │
└─────────────────────────────────────────────────────────────────┘
```

### Vistas (Views)

| Vista | Descrição |
|-------|-----------|
| `student_attendance_stats` | Estatísticas agregadas de assiduidade por educando |
| `employees_public_info` | Dados públicos de colaboradores (sem salário/banco) |
| `contract_signatures_signing` | Vista restrita para fluxo de assinatura |

### Funções de Banco de Dados

| Função | Tipo | Descrição |
|--------|------|-----------|
| `has_role(uuid, app_role)` | SECURITY DEFINER | Verifica se utilizador tem um role específico |
| `has_any_role(uuid, app_role[])` | SECURITY DEFINER | Verifica se utilizador tem qualquer role de uma lista |
| `is_staff(uuid)` | SECURITY DEFINER | Verifica se é funcionário (ADMIN/DIRETORIA/SECRETARIA/FINANCEIRO/PROFESSOR/PEDAGOGICO) |
| `calculate_trimester_average(acs, acp, acf)` | IMMUTABLE | Calcula média trimestral: ACS×30% + ACP×30% + ACF×40% |
| `calculate_final_average(t1, t2, t3)` | IMMUTABLE | Calcula média final dos 3 trimestres |
| `classify_grade(nota)` | IMMUTABLE | Classifica: Excelente(≥18), Bom(≥14), Suficiente(≥10), Insuficiente(≥5), Mau(<5) |
| `generate_enrollment_number()` | TRIGGER | Gera número automático: MAT-YYYY-NNNNN |
| `generate_ticket_number()` | TRIGGER | Gera número automático: TKT-YYYY-NNNNN |
| `notify_exam_created()` | TRIGGER | Notifica professores, alunos e encarregados sobre provas |
| `update_updated_at_column()` | TRIGGER | Actualiza timestamp de modificação |

### Storage Buckets

| Bucket | Público | Conteúdo |
|--------|---------|----------|
| `student-documents` | Não | Certidões, BI, boletins |
| `staff-files` | Não | Documentos de funcionários |
| `teacher-files` | Não | Ficheiros dos professores |
| `aep-training-docs` | Não | Documentos de treino da IA para planos de aula |

---

## 7. Autenticação e Controlo de Acesso (RBAC)

### Provider de Autenticação

- **Supabase Auth** como fonte única de verdade
- Sessões persistidas via `localStorage`
- Auto-refresh de tokens JWT

### Roles do Sistema

| Role | Código | Descrição | Acesso a Módulos |
|------|--------|-----------|-----------------|
| Administrador | `ADMIN` | Super-admin | Todos (`*`) |
| Diretoria | `DIRETORIA` | Director(a) | Todos (`*`) |
| Secretaria | `SECRETARIA` | Secretário(a) | Escolar, RH |
| Financeiro | `FINANCEIRO` | Gestor financeiro | Financeiro |
| Professor | `PROFESSOR` | Docente | Pedagógico |
| Pedagógico | `PEDAGOGICO` | Coordenador | Pedagógico |
| Encarregado | `ENCARREGADO` | Pai/Mãe/Tutor | Portal Encarregado (futuro) |
| Aluno | `ALUNO` | Estudante | Portal Aluno (futuro) |

### Fluxo de Autenticação

```
1. Utilizador submete email + password
2. Supabase Auth valida credenciais → JWT
3. AuthContext recebe sessão via onAuthStateChange
4. fetchUserRole() consulta tabela user_roles
5. User object construído com role real do BD
6. ROLE_PERMISSIONS filtra módulos na sidebar
7. RLS no PostgreSQL filtra dados nas queries
```

### Arquitectura de Segurança RBAC

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend   │     │  Supabase    │     │   PostgreSQL     │
│  (sidebar,   │────▶│   Auth       │────▶│  RLS Policies    │
│   rotas)     │     │  (JWT)       │     │  has_role()      │
│              │     │              │     │  has_any_role()   │
│ ROLE_PERMS   │     │ user_roles   │     │  is_staff()      │
└──────────────┘     └──────────────┘     └──────────────────┘
    Camada 1             Camada 2              Camada 3
  (UI filtering)    (Authentication)     (Data enforcement)
```

**Princípio:** A segurança é aplicada em 3 camadas. Mesmo que o frontend seja comprometido, o RLS no PostgreSQL garante que os dados não são acessíveis.

---

## 8. Edge Functions (Backend Serverless)

Todas as Edge Functions correm em **Deno** no Supabase Edge Runtime.

### 8.1 `generate-lesson-plan`

**Propósito:** Gerar planos de aula AEP com Inteligência Artificial.

| Parâmetro | Descrição |
|-----------|-----------|
| Provider | Google AI (directo) com fallback Lovable AI Gateway |
| Modelo | `gemini-2.5-flash` |
| Temperatura | 0.2 (consistência alta) |
| Max Tokens | 12.000 |
| Formato | Markdown estruturado, 11 secções, metodologia PRRR |

**Fluxo:**
1. Frontend envia dados do formulário (disciplina, turma, tema, etc.)
2. Edge function carrega configuração da tabela `lesson_plan_config`
3. Carrega documentos de treino do bucket `aep-training-docs`
4. Constrói system prompt com contexto AEP
5. Chama API Google AI → gera plano em PT-MZ
6. Retorna Markdown ao frontend para preview e salvamento

### 8.2 `generate-contract`

**Propósito:** Gerar e processar contratos de trabalho com IA.

- Gera contratos baseados em templates e instruções customizadas
- Suporta assinatura digital via token UUID
- Fluxo de assinatura pública em `/assinar/:token`

### 8.3 `send-notification`

**Propósito:** Enviar notificações via WhatsApp e Email.

- Integra com Evolution API para WhatsApp
- Suporta templates de mensagem
- Regista histórico na tabela `communication_history`

### 8.4 `manage-users`

**Propósito:** Gestão administrativa de utilizadores.

- Criação, actualização e desactivação de contas
- Atribuição de roles
- Requer `SUPABASE_SERVICE_ROLE_KEY`

### 8.5 `seed-users`

**Propósito:** Criar contas master de produção.

- 7 contas com domínio `@escolareviva.com`
- Password inicial: `654321`
- Cria perfis e atribui roles automaticamente

### 8.6 `seed-data`

**Propósito:** Popular dados de demonstração para testes.

---

## 9. Integrações Externas

### 9.1 Google AI (Gemini)

| Configuração | Valor |
|-------------|-------|
| Endpoint | `generativelanguage.googleapis.com` |
| Modelo | `gemini-2.5-flash` |
| Secret | `OPENAI_API_KEY` (reutilizado para Google AI key) |
| Uso | Geração de planos de aula AEP |

### 9.2 Evolution API (WhatsApp)

| Configuração | Valor |
|-------------|-------|
| Secrets | `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` |
| Uso | Envio de mensagens WhatsApp para cobranças e notificações |
| Configuração via | Tabela `integration_settings` |

### 9.3 Configuração Dinâmica

As integrações são configuradas via UI em **Configurações → Integrações**, armazenadas na tabela `integration_settings`:

- `api_url` — URL da API
- `api_key` — Chave de autenticação
- `instance_name` — Nome da instância (Evolution API)
- `is_active` — Estado activo/inactivo
- `last_tested_at` / `last_test_success` — Resultado do último teste

---

## 10. Design System e UI

### Paleta de Cores

| Token | HSL | Hex Aproximado | Uso |
|-------|-----|----------------|-----|
| `--primary` | `152 45% 28%` | #2D5F3F | Cor principal (verde SiGER) |
| `--primary-light` | `148 38% 42%` | #4A7C59 | Variante clara |
| `--primary-dark` | `152 55% 20%` | #173D26 | Variante escura |
| `--background` | `0 0% 100%` | #FFFFFF | Fundo (light mode) |
| `--foreground` | `222 47% 11%` | #0F172A | Texto principal |
| `--destructive` | `0 84% 60%` | #EF4444 | Erro/Perigo |
| `--success` | `152 60% 40%` | #29A364 | Sucesso |
| `--warning` | `38 92% 50%` | #F59E0B | Alerta |

### Tipografia

- **Família:** Inter (Google Fonts)
- **Pesos:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

### Layout

- **Sidebar:** Retrátil (collapsible), com módulos agrupados em `Collapsible`
- **Header:** Fixo, com pesquisa global e notificações
- **Conteúdo:** Área principal responsiva (Mobile-First)
- **Tema:** Light + Dark mode via `next-themes`

### Componentes Customizados

| Componente | Descrição |
|-----------|-----------|
| `CurrencyInput` | Input monetário formatado em MZN |
| `GradeInput` | Input de notas com validação 0-20 |
| `MozambiqueInput` | Máscaras para BI e telefone moçambicano |
| `ProvinceSelector` | Dropdown das 11 províncias de Moçambique |
| `StatusBadge` | Badge de estado com cores contextuais |
| `DataTable` | Tabela genérica com ordenação, filtros e paginação |
| `StatsCard` | Card de métrica com ícone, valor e tendência |

---

## 11. Segurança

### Princípios de Segurança

1. **RLS Obrigatório:** Todas as tabelas com dados sensíveis têm Row Level Security activo
2. **RBAC em 3 Camadas:** Frontend (UI) → Auth (JWT) → PostgreSQL (RLS)
3. **Roles em Tabela Separada:** `user_roles` separada de `profiles` para prevenir escalação de privilégios
4. **SECURITY DEFINER:** Funções de verificação de roles usam `SET search_path = public`
5. **Sanitização:** DOMPurify para conteúdo HTML (contratos, planos de aula)
6. **Validação:** Zod no frontend + RLS no backend
7. **Anon Revogado:** Privilégios do role `anon` revogados em produção

### Políticas RLS por Tabela (Resumo)

| Tabela | SELECT | INSERT/UPDATE/DELETE |
|--------|--------|---------------------|
| `students` | Staff | ADMIN, DIRETORIA, SECRETARIA |
| `teachers` | Staff | ADMIN, DIRETORIA, SECRETARIA |
| `employees` | ADMIN, DIRETORIA, FINANCEIRO | ADMIN, DIRETORIA, SECRETARIA |
| `grades` | Staff | ADMIN, DIRETORIA, PROFESSOR, PEDAGOGICO |
| `attendance` | Staff | ADMIN, DIRETORIA, PROFESSOR, PEDAGOGICO |
| `financial_categories` | ADMIN, DIRETORIA, FINANCEIRO | ADMIN, DIRETORIA, FINANCEIRO |
| `payment_agreements` | ADMIN, DIRETORIA, FINANCEIRO, SECRETARIA | Idem |
| `lesson_plans` | ADMIN, DIRETORIA, PEDAGOGICO + próprio professor | Próprio professor |
| `profiles` | Próprio utilizador | Próprio utilizador |
| `integration_settings` | ADMIN, DIRETORIA | ADMIN, DIRETORIA |

### Secrets Configurados

| Secret | Uso |
|--------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API (edge functions) |
| `OPENAI_API_KEY` | Google AI / OpenAI para geração IA |
| `EVOLUTION_API_URL` | URL da Evolution API (WhatsApp) |
| `EVOLUTION_API_KEY` | Chave da Evolution API |
| `LOVABLE_API_KEY` | Fallback AI Gateway |
| `PINECONE_API_KEY` | Vectorização (futuro) |

---

## 12. Rotas da Aplicação

### Rotas Protegidas (requerem autenticação)

| Rota | Componente | Módulo |
|------|-----------|--------|
| `/dashboard` | Dashboard | Escolar |
| `/students` | Students | Escolar |
| `/students/:id` | StudentDetail | Escolar |
| `/matriculas` | Matriculas | Escolar |
| `/turmas` | Turmas | Escolar |
| `/disciplinas` | Subjects | Escolar |
| `/calendario` | CalendarioPage | Escolar |
| `/biblioteca` | BibliotecaPage | Escolar |
| `/avaliacoes` | Evaluations | Pedagógico |
| `/presencas` | Attendance | Pedagógico |
| `/calendario-provas` | CalendarioProvasPage | Pedagógico |
| `/plano-aulas` | PlanoAulasPage | Pedagógico |
| `/arquivos` | ArquivosPage | Pedagógico |
| `/curriculo` | CurriculoPage | Pedagógico |
| `/financeiro` | Financial | Financeiro |
| `/financeiro/dashboard` | FinancialDashboard | Financeiro |
| `/financeiro/caixa` | CaixaPage | Financeiro |
| `/financeiro/propinas` | PropinasPage | Financeiro |
| `/financeiro/cobrancas` | CobrancasPage | Financeiro |
| `/financeiro/relatorios` | RelatoriosFinanceirosPage | Financeiro |
| `/teachers` | Teachers | RH |
| `/colaboradores` | ColaboradoresPage | RH |
| `/rh/utilizadores` | UtilizadoresPage | RH |
| `/rh/documentacao` | DocumentacaoPage | RH |
| `/rh/contratos` | ContratosPage | RH |
| `/comunicacao` | ComunicacaoPage | Sistema |
| `/notificacoes` | Notifications | Sistema |
| `/relatorios` | Reports | Sistema |
| `/configuracoes/*` | Settings (8 sub-rotas) | Config |

### Rotas Públicas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/login` | LoginForm | Autenticação |
| `/register` | RegisterForm | Registo |
| `/assinar/:token` | SignContract | Assinatura digital de contratos |

---

## 13. Contas Master de Produção

| Email | Role | Descrição |
|-------|------|-----------|
| `admin@escolareviva.com` | ADMIN | Administrador Geral |
| `diretoria@escolareviva.com` | DIRETORIA | Director(a) Escolar |
| `secretaria@escolareviva.com` | SECRETARIA | Secretária Escolar |
| `financeiro@escolareviva.com` | FINANCEIRO | Gestor Financeiro |
| `professor@escolareviva.com` | PROFESSOR | Professor(a) Master |
| `responsavel@escolareviva.com` | ENCARREGADO | Encarregado de Educação |
| `aluno@escolareviva.com` | ALUNO | Aluno(a) Master |

**Password inicial:** `654321` (deve ser alterada no primeiro acesso)

---

## 14. Deploy e Infraestrutura

### Ambientes

| Ambiente | URL | Descrição |
|----------|-----|-----------|
| Preview (Teste) | `id-preview--*.lovable.app` | Ambiente de desenvolvimento |
| Produção | `sigerevivamz.lovable.app` | Publicado via Lovable |
| Domínio Próprio | A configurar | Domínio customizado |

### Serviços

| Serviço | Provider | Região |
|---------|----------|--------|
| Frontend Hosting | Lovable Platform | Global CDN |
| Base de Dados | Supabase (PostgreSQL 15) | — |
| Auth | Supabase Auth | — |
| Storage | Supabase Storage | — |
| Edge Functions | Supabase Edge (Deno) | — |
| DNS/SSL | Lovable (Let's Encrypt) | Automático |

### CI/CD

- **GitHub:** Repositório `Reviva-Moz/sigerevivamz`
- **Sincronização:** Bidireccional automática Lovable ↔ GitHub
- **Edge Functions:** Deploy automático ao salvar
- **Frontend:** Requer clique em "Publish → Update"

---

## 15. Glossário

| Termo | Significado |
|-------|------------|
| **ACS** | Avaliação Contínua Sistematizada (30%) |
| **ACP** | Avaliação Contínua de Provas (30%) |
| **ACF** | Avaliação Contínua Final (40%) |
| **AEP** | Abordagem de Ensino Progressivo |
| **PRRR** | Pesquisar, Raciocinar, Relacionar, Registar |
| **BI** | Bilhete de Identidade (documento moçambicano) |
| **NUIT** | Número Único de Identificação Tributária |
| **MZN** | Metical (moeda de Moçambique) |
| **MINEDH** | Ministério da Educação e Desenvolvimento Humano |
| **RLS** | Row Level Security (segurança a nível de linha) |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token |
| **SPA** | Single Page Application |
| **BaaS** | Backend as a Service |

---

**© 2026 SiGER — Sistema de Gestão Escolar Reviva**  
Desenvolvido por [AutoZapi Soluções em TI, AI e Automações](https://autozapi.com)
