export type RoadmapPriority = 'alta' | 'media' | 'baixa';

export interface RoadmapSeedItem {
  id: string;
  phase: string;
  title: string;
  description: string;
  category: string;
  priority: RoadmapPriority;
  display_order: number;
}

export const PHASES: { key: string; label: string; subtitle: string }[] = [
  { key: 'fase_1', label: 'Fase 1 — Estabilização & Qualidade', subtitle: 'Correções, hardening e polimento do que já existe' },
  { key: 'fase_2', label: 'Fase 2 — Experiência do Utilizador', subtitle: 'UX/UI, mobile, acessibilidade e desempenho' },
  { key: 'fase_3', label: 'Fase 3 — Pedagógico Avançado (AEP)', subtitle: 'Plano de aula, avaliações, presenças e relatórios MEC' },
  { key: 'fase_4', label: 'Fase 4 — Financeiro Profissional', subtitle: 'Cobrança automática, conciliação e contabilidade' },
  { key: 'fase_5', label: 'Fase 5 — Comunicação & Portais', subtitle: 'Encarregados, alunos, WhatsApp e notificações' },
  { key: 'fase_6', label: 'Fase 6 — Recursos Humanos & Contratos', subtitle: 'Folha de salários, assinatura digital e processos' },
  { key: 'fase_7', label: 'Fase 7 — Inteligência & Automação', subtitle: 'IA, relatórios automáticos, previsões e BI' },
  { key: 'fase_8', label: 'Fase 8 — Escalabilidade & Multi-escola', subtitle: 'Multi-tenant, API pública e integrações MEC' },
];

export const ROADMAP_SEED: RoadmapSeedItem[] = [
  // ========== FASE 1 — ESTABILIZAÇÃO ==========
  { id: 'f1-01', phase: 'fase_1', category: 'Segurança', priority: 'alta', display_order: 1, title: 'Resolver avisos do Supabase Linter (Function Search Path / RLS)', description: 'Corrigir as 21 warnings do scan: definir search_path em funções SECURITY DEFINER e revisar políticas USING(true).' },
  { id: 'f1-02', phase: 'fase_1', category: 'Segurança', priority: 'alta', display_order: 2, title: 'Auditoria completa de RLS por tabela', description: 'Validar que cada tabela tem políticas mínimas adequadas por função (ADMIN, DIRETORIA, SECRETARIA, FINANCEIRO, PROFESSOR, etc.).' },
  { id: 'f1-03', phase: 'fase_1', category: 'Qualidade', priority: 'alta', display_order: 3, title: 'Padronização total de inputs monetários (MZN)', description: 'Garantir CurrencyInput em todos os formulários (Caixa, Propinas, Contratos, Matrículas, RH, Bolsas, Acordos).' },
  { id: 'f1-04', phase: 'fase_1', category: 'Qualidade', priority: 'alta', display_order: 4, title: 'Validação de telefone +258 / NUIT / BI em todos os formulários', description: 'Aplicar máscaras e validações Zod consistentes em Estudantes, Encarregados, Colaboradores, Professores.' },
  { id: 'f1-05', phase: 'fase_1', category: 'Estabilidade', priority: 'alta', display_order: 5, title: 'Tratamento global de erros e estados vazios', description: 'EmptyState consistente, ErrorBoundary por rota, mensagens em PT-MZ amigáveis.' },
  { id: 'f1-06', phase: 'fase_1', category: 'Performance', priority: 'media', display_order: 6, title: 'Otimização de queries React Query (staleTime + invalidações)', description: 'Revisar invalidações cruzadas, evitar refetch desnecessário e usar select para reduzir payload.' },
  { id: 'f1-07', phase: 'fase_1', category: 'Backup', priority: 'alta', display_order: 7, title: 'Rotina automática de backup da base de dados', description: 'Configurar exportação semanal automática (pg_dump via edge function) e armazenamento em bucket privado.' },
  { id: 'f1-08', phase: 'fase_1', category: 'Logs', priority: 'media', display_order: 8, title: 'Tabela de auditoria (audit_log) para acções críticas', description: 'Registar criação/edição/eliminação de matrículas, pagamentos, contratos e utilizadores.' },

  // ========== FASE 2 — UX/UI ==========
  { id: 'f2-01', phase: 'fase_2', category: 'Mobile', priority: 'alta', display_order: 1, title: 'Revisão mobile-first de todas as páginas', description: 'Garantir layout responsivo perfeito em telemóveis (380px+) — Caixa, Propinas, Pauta, Plano de Aula.' },
  { id: 'f2-02', phase: 'fase_2', category: 'Acessibilidade', priority: 'media', display_order: 2, title: 'Auditoria WCAG AA (contraste, foco, leitores de ecrã)', description: 'Adicionar aria-labels, navegação por teclado, contraste mínimo 4.5:1.' },
  { id: 'f2-03', phase: 'fase_2', category: 'Performance', priority: 'media', display_order: 3, title: 'Code splitting e lazy loading por rota', description: 'React.lazy + Suspense em rotas pesadas (Plano de Aula, Relatórios, RH).' },
  { id: 'f2-04', phase: 'fase_2', category: 'PWA', priority: 'baixa', display_order: 4, title: 'Transformar SiGER em PWA instalável', description: 'Manifest, service worker, ícones e modo offline básico para consulta.' },
  { id: 'f2-05', phase: 'fase_2', category: 'UX', priority: 'media', display_order: 5, title: 'Onboarding interativo para novos utilizadores', description: 'Tour guiado por papel (DIRETORIA, SECRETARIA, PROFESSOR, ENCARREGADO) na primeira sessão.' },
  { id: 'f2-06', phase: 'fase_2', category: 'UX', priority: 'baixa', display_order: 6, title: 'Atalhos de teclado globais (Cmd+K)', description: 'Command palette para navegação rápida e acções frequentes.' },
  { id: 'f2-07', phase: 'fase_2', category: 'UX', priority: 'media', display_order: 7, title: 'Histórico/undo em operações destrutivas', description: 'Toast com "Anular" em eliminações (matrículas, pagamentos, eventos).' },

  // ========== FASE 3 — PEDAGÓGICO ==========
  { id: 'f3-01', phase: 'fase_3', category: 'Plano de Aula', priority: 'alta', display_order: 1, title: 'Concertar quebra de página/linha no PDF AEP', description: 'Já em curso — validar em vários documentos reais e diferentes tamanhos.' },
  { id: 'f3-02', phase: 'fase_3', category: 'Plano de Aula', priority: 'media', display_order: 2, title: 'Edição manual do plano gerado antes de arquivar', description: 'Editor WYSIWYG (TipTap) com mesma escala tipográfica do PDF.' },
  { id: 'f3-03', phase: 'fase_3', category: 'Plano de Aula', priority: 'media', display_order: 3, title: 'Banco de planos partilhados entre professores', description: 'Marcar plano como "público" e permitir clonagem por outros professores da mesma disciplina.' },
  { id: 'f3-04', phase: 'fase_3', category: 'Avaliações', priority: 'alta', display_order: 4, title: 'Boletim trimestral oficial MEC (PDF)', description: 'Geração automática com ACS/ACP/ACF, médias trimestrais, faltas e observações por aluno e por turma.' },
  { id: 'f3-05', phase: 'fase_3', category: 'Avaliações', priority: 'alta', display_order: 5, title: 'Pauta digital com fecho de período e bloqueio', description: 'Director fecha trimestre; após isso só edita com justificação.' },
  { id: 'f3-06', phase: 'fase_3', category: 'Presenças', priority: 'alta', display_order: 6, title: 'Lançamento de presenças por turma com QR/lista rápida', description: 'Modo "lista" otimizado para mobile do professor; alerta automático ao encarregado em ausência.' },
  { id: 'f3-07', phase: 'fase_3', category: 'Calendário', priority: 'media', display_order: 7, title: 'Importação automática de feriados de Moçambique', description: 'Pré-popular feriados nacionais e religiosos do ano letivo.' },
  { id: 'f3-08', phase: 'fase_3', category: 'Currículo', priority: 'media', display_order: 8, title: 'Mapeamento curricular MEC por classe (1ª–12ª)', description: 'Carregar plano curricular oficial e ligar disciplinas, cargas horárias e conteúdos programáticos.' },

  // ========== FASE 4 — FINANCEIRO ==========
  { id: 'f4-01', phase: 'fase_4', category: 'Cobrança', priority: 'alta', display_order: 1, title: 'Geração automática mensal de propinas', description: 'Job mensal cria propinas para todos os matriculados activos com data de vencimento configurável.' },
  { id: 'f4-02', phase: 'fase_4', category: 'Cobrança', priority: 'alta', display_order: 2, title: 'Lembretes automáticos por WhatsApp (D-3, D-0, D+5, D+15)', description: 'Régua de cobrança configurável por director financeiro.' },
  { id: 'f4-03', phase: 'fase_4', category: 'Pagamento', priority: 'alta', display_order: 3, title: 'Integração M-Pesa e e-Mola para pagamento online', description: 'Permitir que encarregados paguem propinas pelo portal com confirmação automática.' },
  { id: 'f4-04', phase: 'fase_4', category: 'Conciliação', priority: 'media', display_order: 4, title: 'Importação de extracto BCI (CSV/OFX)', description: 'Conciliar pagamentos por referência e marcar propinas como pagas automaticamente.' },
  { id: 'f4-05', phase: 'fase_4', category: 'Recibos', priority: 'alta', display_order: 5, title: 'Recibo numerado e timbrado após cada pagamento', description: 'PDF assinado digitalmente, enviado por WhatsApp/email automaticamente.' },
  { id: 'f4-06', phase: 'fase_4', category: 'Relatórios', priority: 'media', display_order: 6, title: 'Demonstração de Resultados e Balanço mensal', description: 'Relatório contabilístico exportável para o gabinete de contabilidade externo.' },
  { id: 'f4-07', phase: 'fase_4', category: 'Bolsas', priority: 'media', display_order: 7, title: 'Gestão completa de bolsas e descontos', description: 'Tipos: irmãos, mérito, social, colaboradores. Aplicação automática nas propinas.' },

  // ========== FASE 5 — COMUNICAÇÃO & PORTAIS ==========
  { id: 'f5-01', phase: 'fase_5', category: 'Portal Encarregado', priority: 'alta', display_order: 1, title: 'Aplicação móvel (PWA) para encarregados', description: 'Versão otimizada para consulta de notas, faltas, finanças e comunicados.' },
  { id: 'f5-02', phase: 'fase_5', category: 'Portal Aluno', priority: 'media', display_order: 2, title: 'Centralizar provas, prazos e materiais no Portal do Aluno', description: 'Calendário, materiais carregados pelo professor e notas trimestrais.' },
  { id: 'f5-03', phase: 'fase_5', category: 'WhatsApp', priority: 'alta', display_order: 3, title: 'Templates de mensagem aprovados (Evolution API)', description: 'Biblioteca de templates: matrícula, recibo, lembrete, alerta de falta, comunicado.' },
  { id: 'f5-04', phase: 'fase_5', category: 'Comunicados', priority: 'media', display_order: 4, title: 'Comunicados segmentados por turma/classe/papel', description: 'Director envia comunicado para "10ª classe + encarregados"; entrega via in-app + WhatsApp.' },
  { id: 'f5-05', phase: 'fase_5', category: 'Tickets', priority: 'baixa', display_order: 5, title: 'SLA e estatísticas no sistema de tickets', description: 'Tempo médio de resposta, tickets em aberto por departamento, satisfação.' },
  { id: 'f5-06', phase: 'fase_5', category: 'E-mail', priority: 'media', display_order: 6, title: 'Domínio próprio de e-mail (Resend/SES)', description: 'Enviar comunicados a partir de @escolareviva.com com DKIM/SPF.' },

  // ========== FASE 6 — RH ==========
  { id: 'f6-01', phase: 'fase_6', category: 'Folha', priority: 'alta', display_order: 1, title: 'Folha de salários mensal automática', description: 'Cálculo INSS, IRPS, descontos e benefícios. Geração de recibo de salário em PDF.' },
  { id: 'f6-02', phase: 'fase_6', category: 'Folha', priority: 'media', display_order: 2, title: 'Pagamento por lote (BCI / M-Pesa / e-Mola)', description: 'Exportar ficheiro de pagamento em lote para o banco / carteira móvel.' },
  { id: 'f6-03', phase: 'fase_6', category: 'Contratos', priority: 'alta', display_order: 3, title: 'Renovação automática e alerta de fim de contrato', description: 'Notificar director 60/30/15 dias antes do fim do contrato.' },
  { id: 'f6-04', phase: 'fase_6', category: 'Assinatura', priority: 'media', display_order: 4, title: 'Assinatura digital com carimbo temporal verificável', description: 'Hash + timestamp, com página pública para validar autenticidade do contrato.' },
  { id: 'f6-05', phase: 'fase_6', category: 'Férias', priority: 'media', display_order: 5, title: 'Gestão de férias e ausências do pessoal', description: 'Pedido, aprovação e mapa anual de férias.' },
  { id: 'f6-06', phase: 'fase_6', category: 'Ponto', priority: 'baixa', display_order: 6, title: 'Registo de ponto biométrico/QR para colaboradores', description: 'Web check-in/out diário com geolocalização opcional.' },

  // ========== FASE 7 — IA & AUTOMAÇÃO ==========
  { id: 'f7-01', phase: 'fase_7', category: 'IA', priority: 'media', display_order: 1, title: 'Assistente IA contextual no dashboard', description: 'Chat lateral que responde sobre dados da escola (taxas, alunos em risco, inadimplência).' },
  { id: 'f7-02', phase: 'fase_7', category: 'IA', priority: 'media', display_order: 2, title: 'Previsão de inadimplência (alunos em risco)', description: 'Modelo simples de scoring com base em histórico de pagamentos.' },
  { id: 'f7-03', phase: 'fase_7', category: 'IA', priority: 'baixa', display_order: 3, title: 'Sugestão automática de planos de aula similares', description: 'Recomendar plano arquivado ao iniciar nova aula com tema parecido.' },
  { id: 'f7-04', phase: 'fase_7', category: 'BI', priority: 'media', display_order: 4, title: 'Dashboard executivo com KPIs e tendências', description: 'Receita YoY, taxa de aprovação por turma, evasão, ocupação por classe.' },
  { id: 'f7-05', phase: 'fase_7', category: 'Automação', priority: 'media', display_order: 5, title: 'Agendamento de relatórios por e-mail/WhatsApp', description: 'Director recebe relatório semanal/mensal automaticamente.' },

  // ========== FASE 8 — ESCALABILIDADE ==========
  { id: 'f8-01', phase: 'fase_8', category: 'Multi-tenant', priority: 'baixa', display_order: 1, title: 'Suporte multi-escola (school_id em todas as tabelas)', description: 'Permitir que o SiGER seja usado por outras escolas isoladas, com mesmo deploy.' },
  { id: 'f8-02', phase: 'fase_8', category: 'API', priority: 'baixa', display_order: 2, title: 'API pública documentada (REST/OpenAPI)', description: 'Permitir integrações de terceiros (apps móveis, portais provinciais).' },
  { id: 'f8-03', phase: 'fase_8', category: 'MEC', priority: 'media', display_order: 3, title: 'Exportação oficial de relatórios MEC', description: 'Formatos exigidos pelo MEC (matrícula, frequência, aproveitamento) prontos para envio.' },
  { id: 'f8-04', phase: 'fase_8', category: 'Infraestrutura', priority: 'media', display_order: 4, title: 'Domínio próprio + e-mail institucional para todos', description: 'Cada utilizador interno com @escolareviva.com.' },
  { id: 'f8-05', phase: 'fase_8', category: 'Infraestrutura', priority: 'baixa', display_order: 5, title: 'Monitorização (Sentry / Logs / Uptime)', description: 'Alertas de erro em produção e métricas de disponibilidade.' },
  { id: 'f8-06', phase: 'fase_8', category: 'Documentação', priority: 'media', display_order: 6, title: 'Manual do utilizador por papel (PDF + vídeo)', description: 'Documentação oficial entregável a novas escolas e novos colaboradores.' },
];