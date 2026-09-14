# Arquivo Histórico de Migração — SiGER

**Fotografia original:** 12 de Março de 2026  
**Aviso revisto:** 14 de Setembro de 2026

Os ficheiros desta pasta preservam uma fotografia histórica do esquema, das policies e dos dados de demonstração existentes em Março de 2026. **Não representam integralmente o banco de dados activo** e não devem ser executados cegamente sobre produção.

## Conteúdo

| Ficheiro | Natureza |
|---|---|
| `01-schema.sql` | Esquema histórico: enums, tabelas, funções, views e triggers. |
| `02-rls-policies.sql` | Policies e buckets correspondentes àquela fotografia. |
| `03-data.sql` | Dados de demonstração daquele período. |

Desde essa fotografia foram acrescentados, entre outros, taxas por etapa, períodos de matrícula/rematrícula, configurações pedagógicas, auditoria, permissões de módulos, roadmap e backups. Também houve reforços de isolamento por professor e de segurança dos buckets.

## Uso seguro

- Consultar estes ficheiros para contexto histórico ou recuperação controlada.
- Para alterar o projecto ligado, usar uma migração nova e aprovada.
- Antes de restaurar noutro projecto, gerar uma fotografia actual do esquema e comparar objecto a objecto.
- Nunca restaurar chaves de API, tokens, palavras-passe ou outros secrets.
- Não modificar `auth`, `storage`, `realtime`, `supabase_functions` ou `vault` directamente.
- Recriar utilizadores por fluxo administrativo autorizado, não por `INSERT` em `auth.users`.

## Requisitos para novas tabelas públicas

Na mesma migração e nesta ordem:

1. `CREATE TABLE public.<nome>`;
2. `GRANT` mínimo a `authenticated`, `service_role` e, somente se público, `anon`;
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`;
4. policies por operação;
5. índices, timestamps e auditoria quando aplicável.

## Fonte de verdade

Consulte [Banco de Dados e Segurança](../BANCO-DE-DADOS.md). Em caso de divergência, o esquema e as policies activas no Supabase prevalecem sobre este arquivo.
