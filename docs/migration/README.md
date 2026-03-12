# Guia de Migração SGE REVIVA

**Última actualização:** 2026-03-12  
**Projecto Supabase:** `ghwhbdpdkstxejofztny` (siger-cloud)

## Ficheiros de Migração

| Ficheiro | Conteúdo | Linhas |
|---|---|---|
| `01-schema.sql` | 26 Enums, 42 Tabelas, 3 Views, 13 Functions, 12 Triggers | ~650 |
| `02-rls-policies.sql` | RLS enable (49 tabelas) + 60+ policies + Storage buckets e policies | ~350 |
| `03-data.sql` | Dados de seed para todas as tabelas principais | ~300 |

## Resumo da Base de Dados

### Tabelas (42)
| # | Tabela | Descrição |
|---|---|---|
| 1 | `profiles` | Perfis de utilizador (ligado a auth.users) |
| 2 | `user_roles` | Roles RBAC (ADMIN, DIRETORIA, etc.) |
| 3 | `academic_years` | Anos lectivos |
| 4 | `teachers` | Corpo docente |
| 5 | `classes` | Turmas |
| 6 | `subjects` | Disciplinas |
| 7 | `students` | Educandos |
| 8 | `guardians` | Encarregados de educação |
| 9 | `student_guardians` | Relação aluno-encarregado |
| 10 | `employees` | Funcionários (RH) |
| 11 | `financial_categories` | Categorias financeiras |
| 12 | `transactions` | Transacções financeiras |
| 13 | `tuition_fees` | Propinas |
| 14 | `enrollments` | Matrículas (legado) |
| 15 | `student_enrollments` | Matrículas (novo sistema) |
| 16 | `grades` | Notas/avaliações |
| 17 | `attendance` | Presenças |
| 18 | `scholarships` | Bolsas de estudo |
| 19 | `student_scholarships` | Bolsas por aluno |
| 20 | `class_curriculum` | Currículo por turma |
| 21 | `announcements` | Comunicados |
| 22 | `announcement_reads` | Leitura de comunicados |
| 23 | `calendar_events` | Calendário escolar |
| 24 | `contract_signatures` | Assinaturas de contratos |
| 25 | `student_documents` | Documentos de alunos |
| 26 | `staff_documents` | Documentos de funcionários |
| 27 | `communication_history` | Histórico de comunicações |
| 28 | `payment_agreements` | Acordos de pagamento |
| 29 | `agreement_installments` | Parcelas de acordos |
| 30 | `scheduled_reminders` | Lembretes agendados |
| 31 | `exam_notifications` | Notificações de provas |
| 32 | `integration_settings` | Configurações de integrações |
| 33 | `lesson_plan_config` | Config do gerador de planos |
| 34 | `lesson_plan_fields` | Campos do formulário de planos |
| 35 | `lesson_plan_training_docs` | Docs de treino para IA |
| 36 | `lesson_plans` | Planos de aula gerados |
| 37 | `registration_invitations` | Convites de registo |
| 38 | `tickets` | Sistema de tickets |
| 39 | `ticket_messages` | Mensagens de tickets |
| 40 | `ticket_notifications` | Notificações de tickets |
| 41 | `teacher_files` | Ficheiros de professores |
| 42 | `db_ativo` | Tabela de controle |

### Views (3)
- `student_attendance_stats` — Estatísticas de presença por aluno
- `employees_public_info` — Dados públicos de funcionários
- `contract_signatures_signing` — Contratos para assinatura

### Functions RBAC (3)
- `has_role(uuid, app_role)` — SECURITY DEFINER
- `has_any_role(uuid, app_role[])` — SECURITY DEFINER
- `is_staff(uuid)` — SECURITY DEFINER

### Storage Buckets (4)
- `student-documents` (privado)
- `staff-files` (privado)
- `aep-training-docs` (privado)
- `teacher-files` (privado)

## Passos para Migração

### 1. Preparar o novo projecto Supabase
- Criar conta/projecto em [supabase.com](https://supabase.com)
- Anotar: **Project ID**, **URL**, **Anon Key**, **Service Role Key**

### 2. Executar os scripts SQL (por ordem!)
No SQL Editor do novo projecto:
1. Executar `01-schema.sql` — cria toda a estrutura (enums, tabelas, views, functions, triggers)
2. Executar `02-rls-policies.sql` — activa RLS, cria policies e storage buckets
3. Executar `03-data.sql` — insere os dados de seed

### 3. Configurar Secrets
No Dashboard > Settings > Functions, adicionar:
- `OPENAI_API_KEY`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_URL`

### 4. Enviar credenciais ao Lovable
Partilhar:
- **Project ID** (ex: `abcdefghijklmnop`)
- **Anon Key** (começa com `eyJ...`)
- **URL** (ex: `https://abcdefghijklmnop.supabase.co`)

### 5. Reconectar a aplicação
Actualizar:
- `supabase/config.toml`
- `src/integrations/supabase/client.ts`
- `.env`

### 6. Criar utilizadores
Os utilizadores (auth.users) serão recriados via Edge Function `seed-users`.

## Dados NÃO incluídos no backup automático
(devem ser re-gerados ou inseridos manualmente)
- **grades** (610+ registos) — re-gerar via seed-data
- **attendance** (1026+ registos) — re-gerar via seed-data
- **tuition_fees** (125+ registos) — re-gerar via seed-data
- **transactions** (46+ registos) — re-gerar via seed-data
- **lesson_plans** (5 registos com HTML grande)
- **contract_signatures** (2 registos com HTML grande)
- **lesson_plan_config** system_prompt (id=1, texto muito grande)
- **API Keys** nas integration_settings (removidas por segurança)
