# Documentação do SiGER

Índice oficial da documentação do **Sistema de Gestão Escolar Reviva**, revisto em 14 de Setembro de 2026.

## Guias principais

| Documento | Conteúdo |
|---|---|
| [README do projecto](../README.md) | Visão geral, módulos, instalação e comandos. |
| [Arquitectura](./ARQUITETURA.md) | Camadas, fluxos, rotas, autenticação, Edge Functions e operação. |
| [Banco de dados](./BANCO-DE-DADOS.md) | Domínios, relações, RLS, funções, triggers, Storage e migrações. |
| [Design system](./DESIGN-SYSTEM.md) | Tokens, tipografia, área interna, responsividade e acessibilidade. |
| [Landing page](./LANDING-PAGE-DESIGN.md) | Estrutura e identidade da página pública. |
| [Migração histórica](./migration/README.md) | Fotografia SQL de Março de 2026 e respectivas limitações. |
| [Backup fictício](./BACKUP_DADOS_FICTICIOS_2026-03-01.md) | Registo histórico de dados de demonstração removidos. |

## Fonte de verdade

A ordem de confiança para decisões técnicas é:

1. esquema e policies activas no Supabase;
2. código actual em `src/` e `supabase/functions/`;
3. documentação principal acima;
4. SQL e backups históricos em `docs/migration/`.

Nunca copiar secrets, tokens, palavras-passe ou dados pessoais para a documentação. Alterações de banco de dados devem passar por migrações aprovadas e actualizar o guia correspondente.
