# Banco de Dados e Segurança — SiGER

**Última revisão:** 14 de Setembro de 2026  
**Plataforma:** Supabase (PostgreSQL, Auth, Storage, Realtime e Edge Functions)  
**Projecto Supabase:** `ghwhbdpdkstxejofztny`

> Este documento descreve o estado funcional conhecido do projecto. Os ficheiros em `docs/migration/` são uma fotografia histórica para referência e não substituem o esquema activo nem migrações aprovadas.

## 1. Princípios

- A autenticação é fornecida pelo Supabase Auth; dados de domínio ficam no esquema `public`.
- Funções de acesso são guardadas exclusivamente em `user_roles`, nunca em `profiles`.
- Tabelas sensíveis usam Row Level Security (RLS).
- O frontend nunca usa a chave `service_role`; operações administrativas passam por Edge Functions autenticadas.
- Funções `SECURITY DEFINER` devem declarar `SET search_path = public` e ter finalidade restrita.
- Buckets de documentos e backups são privados.
- Alterações de estrutura devem ser feitas por migração aprovada, com `GRANT`, RLS e policies no mesmo ciclo.

## 2. Identidade, perfis e RBAC

### Tabelas centrais

| Tabela | Finalidade |
|---|---|
| `profiles` | Perfil público complementar da conta; liga `user_id` a `teacher_id`, `student_id` ou `employee_id` quando aplicável. |
| `user_roles` | Funções RBAC normalizadas por `user_id`. |
| `role_module_access` | Activação dinâmica de módulos por função. |
| `registration_invitations` | Convites com token, validade, função pretendida e consumo único. |
| `audit_log` | Registo append-only de alterações críticas. |

### Funções existentes

`ADMIN`, `DIRETORIA`, `SECRETARIA`, `FINANCEIRO`, `PROFESSOR`, `PEDAGOGICO`, `ENCARREGADO` e `ALUNO`.

As funções `has_role`, `has_any_role` e `is_staff` centralizam verificações usadas pelas policies. O frontend também oculta módulos sem permissão, mas essa camada é apenas de experiência; a autorização efectiva é feita no banco de dados.

### Ligação da conta ao cadastro

Uma conta de acesso deve ser vinculada ao registo real da pessoa:

```text
auth user (UUID)
       │
       ├── user_roles.user_id → função de acesso
       │
       └── profiles.user_id
               ├── teacher_id → teachers.id
               ├── student_id → students.id
               └── employee_id → employees.id
```

Este vínculo permite que o sistema determine automaticamente quais dados pertencem ao utilizador autenticado.

## 3. Isolamento de dados do professor

A atribuição pedagógica usa `class_curriculum`:

```text
profiles.teacher_id
        ↓
class_curriculum.teacher_id
        ├── class_id   → classes.id
        └── subject_id → subjects.id
                         + weekly_hours + shift
```

Para uma conta `PROFESSOR`, turmas e disciplinas devem ser obtidas a partir dessas atribuições. Educandos são limitados às turmas correspondentes. Pauta, assiduidade, planos de aula, calendário pedagógico e arquivos devem respeitar o mesmo conjunto. A filtragem do cliente melhora a navegação; as policies RLS são a barreira obrigatória contra acesso directo indevido.

Administradores, Direcção, Secretaria e área Pedagógica possuem escopos mais amplos conforme a função e a operação.

## 4. Catálogo por domínio

### 4.1 Académico e matrículas

| Tabela | Finalidade | Relações principais |
|---|---|---|
| `academic_years` | Anos lectivos e ano corrente. | Referenciada por matrículas, notas e taxas. |
| `education_levels` | Etapas de ensino. | Referenciada por taxas e períodos. |
| `education_level_fees` | Taxa de matrícula, rematrícula e propina por etapa/ano. | `education_level_id`, `academic_year_id`. |
| `enrollment_periods` | Janelas de abertura e fecho de matrícula/rematrícula. | Ano lectivo e etapa. |
| `classes` | Turmas, ano e professor titular. | `teacher_id`. |
| `subjects` | Disciplinas, código e carga horária. | Usada no currículo, notas e calendário. |
| `class_curriculum` | Relação turma–disciplina–professor. | `class_id`, `subject_id`, `teacher_id`. |
| `students` | Cadastro principal do educando. | `class_id`. |
| `guardians` | Encarregados de educação. | Ligação por `student_guardians`. |
| `student_guardians` | Relação N:N educando–encarregado. | `student_id`, `guardian_id`. |
| `student_enrollments` | Matrícula académica e rematrícula, número, taxas, desconto e estado. | Ano, turma, educando e matrícula anterior. |
| `enrollments` | Registos financeiros legados de matrícula. | Mantida por compatibilidade. |
| `student_documents` | Metadados de documentos do educando. | `student_id`; ficheiro em Storage. |
| `scholarships` | Tipos e valores de bolsas. | Ligação por `student_scholarships`. |
| `student_scholarships` | Bolsas atribuídas aos educandos. | `student_id`, `scholarship_id`. |

**Matrícula:** entrada de um novo educando. **Rematrícula:** continuidade de um educando existente, ligada por `previous_enrollment_id`. Períodos e valores são configuráveis por ano lectivo e etapa. Os valores aprovados alimentam a situação financeira do educando.

### 4.2 Avaliação, assiduidade e pedagogia

| Tabela | Finalidade |
|---|---|
| `grades` | ACS/ACP/ACF, campos complementares, médias, trimestre, turma e disciplina. |
| `attendance` | Presença por educando, turma, disciplina e data. |
| `pedagogical_settings` | Ano, trimestre e estado de libertação pedagógica. |
| `calendar_events` | Feriados, eventos, provas, prazos e actividades. |
| `exam_notifications` | Notificações geradas para provas. |
| `lesson_plans` | Planos AEP gerados e arquivados por professor. |
| `lesson_plan_config` | Parâmetros do motor de geração. |
| `lesson_plan_fields` | Campos configuráveis do formulário. |
| `lesson_plan_training_docs` | Metadados da base institucional AEP. |
| `teacher_files` | Produção e arquivos dos professores. |
| `dictionary_webster` / `dictionary_translations` / `dictionary_queries` | Apoio lexical e traduções para o fluxo pedagógico. |

A escala é 0–20. A regra institucional de referência é ACS 30%, ACP 30% e ACF 40%; a aplicação contém também campos e lógica evolutiva para ACS1–ACS3 e AT. Qualquer consolidação de fórmulas deve ser feita numa migração e nos cálculos do cliente em simultâneo.

### 4.3 Financeiro

| Tabela | Finalidade |
|---|---|
| `financial_categories` | Categorias de receita e despesa. |
| `transactions` | Movimentos do livro caixa. |
| `tuition_fees` | Propinas por educando e mês. |
| `payment_agreements` | Negociações, descontos e parcelamentos. |
| `agreement_installments` | Parcelas dos acordos. |
| `communication_history` | Histórico das cobranças e mensagens enviadas. |
| `scheduled_reminders` | Lembretes de vencimento e atraso. |

Valores são apresentados em MZN. Saldos progressivos devem ser calculados cronologicamente antes da aplicação de filtros de visualização.

### 4.4 Recursos humanos e contratos

| Tabela | Finalidade |
|---|---|
| `teachers` | Cadastro profissional, contratual e financeiro dos docentes. |
| `employees` | Cadastro de colaboradores não docentes. |
| `staff_documents` | Documentos de professores e colaboradores. |
| `contract_signatures` | Conteúdo, token, validade, estado e evidência de assinatura digital. |

Contratos externos são consultados pelo RPC restrito `get_contract_for_signing(token)`. Dados bancários, salariais e documentos devem permanecer acessíveis apenas às funções autorizadas.

### 4.5 Comunicação e operação

| Tabela | Finalidade |
|---|---|
| `announcements` / `announcement_reads` | Comunicados e confirmação individual de leitura. |
| `tickets` / `ticket_messages` / `ticket_notifications` | Atendimento interno, mensagens e alertas. |
| `integration_settings` | Configuração não-secreta de integrações. Chaves privadas devem usar secrets. |
| `roadmap_items` | Evolução funcional apresentada no sistema. |
| `db_ativo` | Controlo técnico temporizado. |

## 5. Relações essenciais

```text
academic_years ─┬─ student_enrollments ─ students ─ student_guardians ─ guardians
                ├─ grades
                └─ education_level_fees ─ education_levels ─ enrollment_periods

teachers ─ class_curriculum ─┬─ classes ─ students
                             └─ subjects ─ grades

students ─ tuition_fees ─ payment_agreements ─ agreement_installments

calendar_events ─ exam_notifications
tickets ─┬─ ticket_messages
         └─ ticket_notifications
```

## 6. Enums principais

- `app_role`: oito funções RBAC.
- `calendar_event_type`: `Feriado`, `Evento`, `Prova`, `Prazo`, `Actividade`.
- `enrollment_type`: `NEW`, `RENEWAL`.
- `enrollment_status`: `PENDENTE`, `EM_ANALISE`, `APROVADA`, `REJEITADA`, `CANCELADA`.
- `gender_type`: `MASCULINO`, `FEMININO`.
- `transaction_type`: `Receita`, `Despesa`.
- `tuition_status`: `Pago`, `Atrasado`, `Pendente`.
- `ticket_category`, `ticket_priority` e `ticket_status`: classificação e ciclo dos tickets.
- `communication_type`, `communication_status` e `reminder_type`: comunicação financeira.

## 7. Funções e automações

| Função | Responsabilidade |
|---|---|
| `calculate_trimester_average` | Cálculo de média trimestral; existem assinaturas distintas para o modelo legado e o modelo com listas. |
| `calculate_final_average` | Média dos trimestres disponíveis. |
| `classify_grade` | Excelente ≥18, Bom ≥14, Suficiente ≥10, Insuficiente ≥5, Mau <5. |
| `generate_enrollment_number` | Gera número de matrícula antes da inserção. |
| `generate_ticket_number` | Gera número do ticket antes da inserção. |
| `notify_exam_created` | Cria alertas quando uma prova é agendada. |
| `notify_ticket_message` | Cria alerta para nova resposta de ticket. |
| `validate_invitation` / `consume_invitation` | Validação e consumo atómico de convites. |
| `audit_trigger_fn` | Regista alterações em entidades críticas. |
| `handle_updated_at` / `update_updated_at_column` | Actualiza timestamps. |

Triggers de auditoria cobrem, entre outras, matrículas, educandos, professores, colaboradores, contratos, acordos, convites, perfis de acesso e roadmap. Triggers de `updated_at` mantêm datas de modificação; triggers de notificação tratam provas e mensagens de tickets.

## 8. Storage

Todos os buckets abaixo são privados:

| Bucket | Conteúdo |
|---|---|
| `student-documents` | Documentos dos educandos. |
| `staff-files` | Documentos de RH. |
| `teacher-files` | Arquivos e produção docente. |
| `aep-training-docs` | Fontes institucionais para planos AEP. |
| `database-backups` | Backups JSON gerados pelo sistema. |

A tabela guarda metadados; o ficheiro fica no bucket. Downloads devem usar sessão autorizada ou URL assinada de curta duração.

## 9. Edge Functions e privilégios

- `manage-users`: usa privilégios administrativos internamente após validar JWT e função do chamador.
- `seed-users`: provisionamento controlado de contas.
- `generate-lesson-plan`: valida acesso pedagógico e usa secrets dos fornecedores de IA.
- `generate-contract`: geração de conteúdo contratual.
- `send-notification`: envio por integrações externas.
- `database-backup`: leitura administrativa das tabelas e gravação no bucket privado; conserva os 12 backups mais recentes.

Secrets são identificados apenas pelo nome e nunca documentados com valores. Configuração pública e credenciais privadas não devem ser misturadas em `integration_settings`.

## 10. RLS: matriz conceptual

| Área | Leitura | Escrita |
|---|---|---|
| Gestão escolar | Equipa autorizada; professor apenas no seu escopo | ADMIN/DIRETORIA/SECRETARIA conforme entidade |
| Pedagógico | Gestão pedagógica e professor atribuído | Professor atribuído e funções de supervisão |
| Financeiro | ADMIN/DIRETORIA/FINANCEIRO; Secretaria onde necessário | Funções financeiras autorizadas |
| RH | ADMIN/DIRETORIA e funções delegadas | Funções administrativas autorizadas |
| Portal | Próprio educando/encarregado e relações permitidas | Geralmente leitura; operações explícitas e limitadas |
| Configuração e auditoria | ADMIN/DIRETORIA | ADMIN/DIRETORIA; auditoria sem edição pelo cliente |

A matriz é um resumo. A policy activa de cada tabela é a fonte operacional e deve ser inspecionada antes de qualquer alteração.

## 11. Migrações e manutenção

Para qualquer nova tabela em `public`, usar esta ordem:

1. `CREATE TABLE`;
2. `GRANT` mínimo para `authenticated`, `anon` somente quando realmente público, e `service_role` quando necessário;
3. `ENABLE ROW LEVEL SECURITY`;
4. policies por operação e função;
5. índices para chaves de pesquisa e joins;
6. trigger de `updated_at` e auditoria quando aplicável.

Não editar manualmente `src/integrations/supabase/types.ts`; o ficheiro é gerado a partir do esquema. Não alterar os esquemas reservados `auth`, `storage`, `realtime`, `supabase_functions` ou `vault`.

## 12. Offline e sincronização

Em Setembro de 2026, o esquema principal permanece online-first no Supabase. As Fases 9 e 10 do roadmap planeiam PGlite/IndexedDB, ElectricSQL auto-hospedado, outbox, soft delete, resolução de conflitos e filtros equivalentes ao RLS. Nenhuma destas camadas deve ser considerada activa até service worker, persistência local, sincronização e testes de conflito estarem concluídos.
