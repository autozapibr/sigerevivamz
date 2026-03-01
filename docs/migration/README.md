# Guia de Migração SGE REVIVA

## Ficheiros de Migração

| Ficheiro | Conteúdo |
|---|---|
| `01-schema.sql` | Enums, Tabelas, Views, Functions, Triggers |
| `02-rls-policies.sql` | RLS enable + todas as policies |
| `03-data.sql` | Dados das tabelas principais |

## Passos para Migração

### 1. Preparar o novo projecto Supabase
- Criar conta/projecto em [supabase.com](https://supabase.com)
- Anotar: **Project ID**, **URL**, **Anon Key**, **Service Role Key**

### 2. Executar os scripts SQL (ordem!)
No SQL Editor do novo projecto:
1. Executar `01-schema.sql` — cria toda a estrutura
2. Executar `02-rls-policies.sql` — activa RLS e cria policies
3. Executar `03-data.sql` — insere os dados

### 3. Criar Storage Buckets
No Dashboard > Storage, criar:
- `student-documents` (privado)
- `staff-files` (privado)
- `aep-training-docs` (privado)
- `teacher-files` (privado)

### 4. Configurar Secrets
No Dashboard > Settings > Functions, adicionar:
- `OPENAI_API_KEY`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_URL`

### 5. Enviar credenciais ao Lovable
Partilhar comigo:
- **Project ID** (ex: `abcdefghijklmnop`)
- **Anon Key** (começa com `eyJ...`)
- **URL** (ex: `https://abcdefghijklmnop.supabase.co`)

### 6. Reconectar a aplicação
Eu actualizo:
- `supabase/config.toml`
- `src/integrations/supabase/client.ts`
- `.env`

### 7. Criar utilizadores
Os utilizadores (auth.users) serão recriados via Edge Function `seed-users`.

## Dados NÃO incluídos no backup automático
(devem ser re-gerados ou inseridos manualmente)
- **grades** (610 registos) — re-gerar via seed-data
- **attendance** (1026 registos) — re-gerar via seed-data  
- **tuition_fees** (125 registos) — re-gerar via seed-data
- **transactions** (46 registos) — re-gerar via seed-data
- **lesson_plans** (5 registos com HTML grande)
- **contract_signatures** (2 registos com HTML grande)
- **lesson_plan_config** system_prompt (texto muito grande)
