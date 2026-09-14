# Actualização integral da documentação do SiGER

## Objectivo
Alinhar a documentação do projecto ao estado actual da aplicação em Setembro de 2026, cobrindo produto, arquitectura, design, dados, segurança, operação e evolução planeada.

## Entregáveis

1. **README principal**
   - Substituir o conteúdo genérico do Lovable por uma apresentação oficial do SiGER.
   - Documentar módulos, perfis, localização PT-MZ, instalação local, comandos, configuração, URLs e ligações para os restantes guias.
   - Separar claramente funcionalidades existentes de itens planeados, incluindo o modo offline híbrido.

2. **Arquitectura da aplicação**
   - Rever integralmente `docs/ARQUITETURA.md`.
   - Actualizar camadas, fluxo de autenticação, React Query, rotas, módulos, estrutura de ficheiros, Edge Functions, armazenamento, notificações em tempo real, backups e publicação.
   - Documentar o vínculo entre contas e registos de professores, educandos e colaboradores.
   - Remover credenciais, palavras-passe e afirmações obsoletas.

3. **Design e experiência**
   - Rever `docs/LANDING-PAGE-DESIGN.md` para reflectir exactamente a página actual.
   - Criar um guia de design global para a área interna: tokens semânticos, temas claro/escuro, tipografia, layout, sidebar, cabeçalho, estados, notas, responsividade, acessibilidade e impressão/PDF.
   - Registar as regras de localização e terminologia moçambicana.

4. **Banco de dados e segurança**
   - Criar `docs/BANCO-DE-DADOS.md` com o catálogo das tabelas por domínio, principais relações, enums, funções, triggers, buckets e estratégia RLS/RBAC.
   - Explicar o isolamento automático dos professores por `profiles.teacher_id` e `class_curriculum`.
   - Documentar matrículas e rematrículas, financeiro, auditoria, tickets, planos de aula e backups.
   - Não expor valores de secrets nem tratar ficheiros SQL históricos como estado garantido da produção.

5. **Índice e migração**
   - Criar `docs/README.md` como índice oficial da documentação.
   - Actualizar `docs/migration/README.md`, deixando claro que os SQL ali existentes são uma fotografia histórica e que alterações reais devem usar migrações aprovadas.
   - Preservar o backup fictício como registo histórico, sem o apresentar como esquema actual.

6. **Validação final**
   - Conferir nomes de rotas, módulos, funções, buckets, tabelas, URLs e versões contra o código e a configuração actual.
   - Procurar referências antigas relevantes, links quebrados, nomenclatura MINEDH e afirmações incorrectas sobre offline.
   - Validar Markdown e garantir que nenhum segredo ou credencial privada foi incluído.

## Limites
- Esta tarefa altera apenas documentação; não modifica a aplicação nem o banco de dados.
- Os SQL de `docs/migration/` permanecem como arquivo histórico, não como mecanismo activo de migração.
- O manifesto PWA actualmente permite instalação, mas o funcionamento offline completo continua planeado nas Fases 9 e 10 até existir service worker, base local e sincronização.
