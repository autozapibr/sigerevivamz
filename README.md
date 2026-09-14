# SiGER — Sistema de Gestão Escolar Reviva

Plataforma web de gestão escolar da **Escola Reviva**, localizada para Moçambique e desenvolvida pela [AutoZapi](https://autozapi.com).

[Produção](https://escolareviva.com) · [Aplicação Lovable](https://sigerevivamz.lovable.app) · [Documentação](./docs/README.md)

## Sobre

O SiGER centraliza a operação académica, pedagógica, financeira e administrativa da escola. Usa português de Moçambique, MZN, escala de avaliação 0–20, validações locais e a metodologia AEP/PRRR.

### Módulos

- **Gestão escolar:** educandos, encarregados, matrículas, rematrículas, turmas, disciplinas, calendário e biblioteca.
- **Pedagógico:** pauta digital, assiduidade, currículo, provas, planos de aula AEP com IA e arquivos docentes.
- **Financeiro:** propinas, livro caixa, cobranças, acordos, lembretes e relatórios.
- **Recursos humanos:** professores, colaboradores, documentação, contratos e assinatura digital.
- **Comunicação:** anúncios, notificações e tickets em tempo real.
- **Administração:** utilizadores, perfis, permissões, integrações, auditoria, backups e roadmap.

## Funções de acesso

`ADMIN`, `DIRETORIA`, `SECRETARIA`, `FINANCEIRO`, `PROFESSOR`, `PEDAGOGICO`, `ENCARREGADO` e `ALUNO`.

A autorização combina navegação por função, Supabase Auth e RLS no PostgreSQL. Contas são ligadas a cadastros reais por `profiles`; professores recebem apenas turmas, disciplinas e educandos atribuídos em `class_curriculum`.

## Tecnologia

- React 18, TypeScript 5 e Vite 5;
- Tailwind CSS, shadcn/ui e Radix UI;
- React Router e TanStack Query;
- React Hook Form e Zod;
- Supabase PostgreSQL, Auth, Storage, Realtime e Edge Functions;
- Framer Motion, Recharts, xlsx e html2pdf.js.

## Execução local

### Requisitos

- Node.js 20 ou superior;
- npm;
- acesso autorizado ao projecto Supabase ligado.

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:8080`.

### Variáveis de ambiente

O ambiente ligado fornece:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

Não colocar `SUPABASE_SERVICE_ROLE_KEY`, chaves de IA ou credenciais de integrações no frontend. Secrets privados pertencem à configuração das Edge Functions.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | Servidor local com actualização automática. |
| `npm run build` | Pacote optimizado de produção. |
| `npm run build:dev` | Pacote em modo development. |
| `npm run lint` | Verificação estática. |
| `npm run preview` | Pré-visualização local do pacote. |

## Estrutura resumida

```text
src/
├── components/     interface por domínio e componentes shadcn
├── contexts/       autenticação e pesquisa
├── hooks/          consultas e mutações Supabase
├── integrations/   cliente e tipos gerados
├── lib/            validação, sanitização e exportação
├── pages/          rotas da aplicação
└── types/          tipos de domínio

supabase/functions/ Edge Functions Deno
docs/               arquitectura, design e dados
public/             manifesto, ícones e ficheiros públicos
```

## PWA e offline

O SiGER possui manifesto e ícones, podendo ser instalado no telemóvel ou computador. Em Setembro de 2026, continua **online-first**: ainda não existe service worker, base local ou sincronização de escritas. A implementação gratuita e auto-hospedada está planeada nas Fases 9 e 10 do roadmap.

## Segurança

- RLS obrigatório para dados sensíveis;
- funções de acesso numa tabela separada (`user_roles`);
- buckets de documentos e backups privados;
- operações administrativas em Edge Functions autenticadas;
- sanitização de HTML e validação de inputs;
- auditoria para operações críticas;
- secrets nunca versionados nem documentados com valores.

## Documentação

- [Índice](./docs/README.md)
- [Arquitectura](./docs/ARQUITETURA.md)
- [Banco de dados e segurança](./docs/BANCO-DE-DADOS.md)
- [Design system](./docs/DESIGN-SYSTEM.md)
- [Landing page](./docs/LANDING-PAGE-DESIGN.md)
- [Arquivo histórico de migração](./docs/migration/README.md)

## Ambientes

- Produção: <https://escolareviva.com>
- Alias: <https://www.escolareviva.com>
- Lovable: <https://sigerevivamz.lovable.app>

A publicação do frontend é gerida pelo Lovable. O backend está ligado a um projecto Supabase externo.

## Licença e propriedade

Projecto privado da Escola Reviva. Não reutilizar dados, marca ou código sem autorização.
