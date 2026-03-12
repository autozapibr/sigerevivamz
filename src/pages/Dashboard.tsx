import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, BookOpen, 
  TrendingUp, TrendingDown, ArrowUpRight, Calendar,
  UserCheck, ClipboardCheck, AlertCircle, Wallet, Building2,
  CreditCard, FileText, BarChart3, BookMarked, Clock
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useFinancialDashboard } from '@/hooks/useDashboardStats';
import {
  ChartCard,
  StudentDistributionChart,
  EnrollmentStatusChart,
  ClassDistributionChart,
} from '@/components/dashboard/DashboardCharts';
import { UserRole } from '@/types/auth';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import { PaymentProofDialog } from '@/components/financial/PaymentProofDialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function StatCard({ title, value, change, changeType = 'neutral', icon, color, onClick, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-14" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card 
        className={`relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 ${onClick ? 'hover:scale-[1.02]' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
              {change && (
                <div className={`flex items-center gap-1 text-xs ${
                  changeType === 'positive' ? 'text-success' : 
                  changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                  {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${color}`}>
              {icon}
            </div>
          </div>
          {onClick && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatMZN(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M MZN`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k MZN`;
  return `${value.toLocaleString('pt-MZ')} MZN`;
}

// Quick action button for modules
function ModuleQuickAction({ 
  icon: Icon, 
  label, 
  description,
  href,
  color = 'primary'
}: { 
  icon: React.ElementType; 
  label: string; 
  description: string;
  href: string;
  color?: string;
}) {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all group"
      onClick={() => navigate(href)}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}/10 group-hover:bg-${color}/20 transition-colors`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  );
}

// Define tabs available per role
function getAvailableTabs(role: UserRole | undefined): { value: string; label: string }[] {
  switch (role) {
    case 'ADMIN':
    case 'DIRETORIA':
      return [
        { value: 'geral', label: 'Geral' },
        { value: 'escolar', label: 'Escolar' },
        { value: 'financeiro', label: 'Financeiro' },
        { value: 'rh', label: 'RH' },
      ];
    case 'SECRETARIA':
      return [
        { value: 'geral', label: 'Geral' },
        { value: 'escolar', label: 'Escolar' },
      ];
    case 'FINANCEIRO':
      return [
        { value: 'geral', label: 'Geral' },
        { value: 'financeiro', label: 'Financeiro' },
      ];
    case 'PROFESSOR':
    case 'PEDAGOGICO':
      return [
        { value: 'pedagogico', label: 'Pedagógico' },
      ];
    case 'ENCARREGADO':
      return [
        { value: 'encarregado', label: 'Portal' },
      ];
    case 'ALUNO':
      return [
        { value: 'aluno', label: 'Portal do Aluno' },
      ];
    default:
      return [
        { value: 'geral', label: 'Geral' },
      ];
  }
}

function getDashboardTitle(role: UserRole | undefined): { title: string; subtitle: string } {
  switch (role) {
    case 'ADMIN':
    case 'DIRETORIA':
      return { title: 'Dashboard Executivo', subtitle: 'Visão geral do sistema' };
    case 'SECRETARIA':
      return { title: 'Dashboard Secretaria', subtitle: 'Gestão escolar e matrículas' };
    case 'FINANCEIRO':
      return { title: 'Dashboard Financeiro', subtitle: 'Gestão de receitas e despesas' };
    case 'PROFESSOR':
    case 'PEDAGOGICO':
      return { title: 'Dashboard Pedagógico', subtitle: 'Suas turmas e avaliações' };
    case 'ENCARREGADO':
      return { title: 'Portal do Encarregado', subtitle: 'Acompanhamento do educando' };
    case 'ALUNO':
      return { title: 'Portal do Aluno', subtitle: 'Calendário e provas' };
    default:
      return { title: 'Dashboard', subtitle: 'Bem-vindo ao sistema' };
  }
}

function getWelcomeMessage(role: UserRole | undefined): string {
  switch (role) {
    case 'ADMIN':
    case 'DIRETORIA':
      return 'Bem-vindo ao SiGER - Sistema de Gestão Escolar Reviva. Aqui tens uma visão geral da tua escola.';
    case 'SECRETARIA':
      return 'Bem-vindo ao SiGER. Gerencie matrículas, educandos e documentação escolar.';
    case 'FINANCEIRO':
      return 'Bem-vindo ao SiGER. Acompanhe as finanças, propinas e fluxo de caixa.';
    case 'PROFESSOR':
    case 'PEDAGOGICO':
      return 'Bem-vindo ao SiGER. Aceda às suas turmas, lance notas e registe presenças.';
    case 'ENCARREGADO':
      return 'Bem-vindo ao Portal do Encarregado. Acompanhe o progresso do seu educando.';
    case 'ALUNO':
      return 'Bem-vindo ao Portal do Aluno. Acompanha aqui o calendário escolar e as tuas provas.';
    default:
      return 'Bem-vindo ao SiGER - Sistema de Gestão Escolar Reviva.';
  }
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: financial, isLoading: financialLoading } = useFinancialDashboard();

  const availableTabs = useMemo(() => getAvailableTabs(user?.role), [user?.role]);
  const { title, subtitle } = useMemo(() => getDashboardTitle(user?.role), [user?.role]);
  const welcomeMessage = useMemo(() => getWelcomeMessage(user?.role), [user?.role]);
  const defaultTab = availableTabs[0]?.value || 'geral';
  const greeting = getTimeGreeting();
  const [paymentProofOpen, setPaymentProofOpen] = useState(false);
  const [paymentProofContext, setPaymentProofContext] = useState<{ student?: string; month?: string; amount?: number }>({});

  // Role-specific quick actions
  const quickActions = useMemo(() => {
    switch (user?.role) {
      case 'SECRETARIA':
        return [
          { title: 'Nova Matrícula', icon: GraduationCap, path: '/matriculas', color: 'bg-primary text-primary-foreground' },
          { title: 'Educandos', icon: Users, path: '/students', color: 'bg-blue-500 text-white' },
          { title: 'Turmas', icon: BookOpen, path: '/turmas', color: 'bg-purple-500 text-white' },
          { title: 'Relatórios', icon: FileText, path: '/relatorios', color: 'bg-amber-500 text-white' },
        ];
      case 'FINANCEIRO':
        return [
          { title: 'Propinas', icon: CreditCard, path: '/financeiro/propinas', color: 'bg-success text-white' },
          { title: 'Livro Caixa', icon: Wallet, path: '/financeiro/caixa', color: 'bg-primary text-primary-foreground' },
          { title: 'Cobranças', icon: AlertCircle, path: '/financeiro/cobrancas', color: 'bg-warning text-white' },
          { title: 'Relatórios', icon: BarChart3, path: '/financeiro/relatorios', color: 'bg-blue-500 text-white' },
        ];
      case 'PROFESSOR':
      case 'PEDAGOGICO':
        return [
          { title: 'Lançar Notas', icon: ClipboardCheck, path: '/avaliacoes', color: 'bg-primary text-primary-foreground' },
          { title: 'Registar Presença', icon: UserCheck, path: '/presencas', color: 'bg-amber-500 text-white' },
          { title: 'Minhas Turmas', icon: BookOpen, path: '/turmas', color: 'bg-purple-500 text-white' },
          { title: 'Calendário', icon: Calendar, path: '/calendario', color: 'bg-blue-500 text-white' },
        ];
      case 'ENCARREGADO':
        return [];
      default:
        return [
          { title: 'Nova Matrícula', icon: GraduationCap, path: '/matriculas', color: 'bg-primary text-primary-foreground' },
          { title: 'Lançar Notas', icon: ClipboardCheck, path: '/avaliacoes', color: 'bg-blue-500 text-white' },
          { title: 'Registar Presença', icon: UserCheck, path: '/presencas', color: 'bg-amber-500 text-white' },
          { title: 'Ver Calendário', icon: Calendar, path: '/calendario', color: 'bg-purple-500 text-white' },
        ];
    }
  }, [user?.role]);

  return (
    <MainLayout title={title} subtitle={subtitle}>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Banner */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary to-primary-dark border-0 text-white overflow-hidden relative">
            <CardContent className="p-6 sm:p-8">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  {user?.role === 'ENCARREGADO' 
                    ? `${greeting}, Pais! Que bom ter vocês aqui! 👋`
                    : `${greeting}, ${user?.name?.split(' ')[0] || 'Utilizador'}! 👋`
                  }
                </h2>
                <p className="text-white/80 max-w-xl text-sm sm:text-base">
                  {welcomeMessage}
                </p>
                {user?.role && (
                  <Badge variant="secondary" className="mt-3 bg-white/20 text-white hover:bg-white/30">
                    {user.role}
                  </Badge>
                )}
              </div>
              <div className="absolute right-0 top-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs based on user role */}
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* === TAB: GERAL (Overview) - For ADMIN, DIRETORIA, SECRETARIA, FINANCEIRO === */}
          <TabsContent value="geral" className="space-y-4 mt-4">
            {/* Key Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Educandos"
                value={stats?.counts.students || 0}
                icon={<Users className="w-5 h-5 text-white" />}
                color="bg-primary"
                onClick={() => navigate('/students')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Professores"
                value={stats?.counts.teachers || 0}
                icon={<UserCheck className="w-5 h-5 text-white" />}
                color="bg-blue-500"
                onClick={() => navigate('/teachers')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Turmas"
                value={stats?.counts.classes || 0}
                icon={<BookOpen className="w-5 h-5 text-white" />}
                color="bg-purple-500"
                onClick={() => navigate('/turmas')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Saldo Mensal"
                value={financialLoading ? '...' : formatMZN(financial?.currentSummary.saldo || 0)}
                icon={<Wallet className="w-5 h-5 text-white" />}
                color={(financial?.currentSummary.saldo || 0) >= 0 ? 'bg-success' : 'bg-destructive'}
                onClick={() => navigate('/financeiro')}
                isLoading={financialLoading}
              />
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acções Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.title}
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2 hover:shadow-md transition-all group"
                          onClick={() => navigate(action.path)}
                        >
                          <div className={`p-2 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium">{action.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity and Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Activity */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Actividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: 'Nova matrícula registada', time: 'Há 5 minutos', type: 'success' },
                        { action: 'Notas lançadas - 10ª Classe A', time: 'Há 1 hora', type: 'info' },
                        { action: 'Pagamento de propina recebido', time: 'Há 2 horas', type: 'success' },
                        { action: 'Chamada registada - 8ª Classe B', time: 'Há 3 horas', type: 'info' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.type === 'success' ? 'bg-success' : 'bg-info'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.action}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* School Year Progress */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ano Lectivo 2026</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">1º Trimestre</span>
                        <span className="font-medium text-success">Concluído</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">2º Trimestre</span>
                        <span className="font-medium text-primary">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">3º Trimestre</span>
                        <span className="font-medium text-muted-foreground">Por iniciar</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Próximo evento</p>
                          <p className="text-sm font-medium">Exames 2º Trimestre</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">15 Mai</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* === TAB: ESCOLAR (Secretaria Data) === */}
          <TabsContent value="escolar" className="space-y-4 mt-4">
            {/* Quick Links for Secretaria - FIRST */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acesso Rápido - Secretaria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ModuleQuickAction 
                      icon={Users} 
                      label="Educandos" 
                      description="Gestão de alunos"
                      href="/students"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={GraduationCap} 
                      label="Matrículas" 
                      description="Novas inscrições"
                      href="/matriculas"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={BookOpen} 
                      label="Turmas" 
                      description="Gestão de classes"
                      href="/turmas"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={FileText} 
                      label="Relatórios" 
                      description="Documentos e pautas"
                      href="/relatorios"
                      color="primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Secretaria Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Educandos Activos"
                value={stats?.counts.students || 0}
                icon={<Users className="w-5 h-5 text-white" />}
                color="bg-primary"
                onClick={() => navigate('/students')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Professores Activos"
                value={stats?.counts.teachers || 0}
                icon={<UserCheck className="w-5 h-5 text-white" />}
                color="bg-blue-500"
                onClick={() => navigate('/teachers')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Turmas"
                value={stats?.counts.classes || 0}
                icon={<BookOpen className="w-5 h-5 text-white" />}
                color="bg-purple-500"
                onClick={() => navigate('/turmas')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Matrículas Pendentes"
                value={stats?.counts.pendingEnrollments || 0}
                change={stats?.counts.pendingEnrollments ? 'Aguardando aprovação' : undefined}
                changeType={stats?.counts.pendingEnrollments ? 'negative' : 'neutral'}
                icon={<AlertCircle className="w-5 h-5 text-white" />}
                color="bg-warning"
                onClick={() => navigate('/matriculas')}
                isLoading={statsLoading}
              />
            </div>

            {/* Charts for Secretaria */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div variants={itemVariants}>
                <ChartCard title="Distribuição por Género" description="Educandos matriculados">
                  {statsLoading ? (
                    <Skeleton className="h-[180px] w-full" />
                  ) : (
                    <StudentDistributionChart data={stats?.genderDistribution || []} />
                  )}
                </ChartCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <ChartCard title="Estado das Matrículas" description="Ano lectivo actual">
                  {statsLoading ? (
                    <Skeleton className="h-[180px] w-full" />
                  ) : (
                    <EnrollmentStatusChart data={stats?.enrollmentStatus || []} />
                  )}
                </ChartCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <ChartCard title="Educandos por Turma" description="Top 8 turmas">
                  {statsLoading ? (
                    <Skeleton className="h-[180px] w-full" />
                  ) : (
                    <ClassDistributionChart data={stats?.classDistribution || []} />
                  )}
                </ChartCard>
              </motion.div>
            </div>
          </TabsContent>

          {/* === TAB: FINANCEIRO (Finance Summary) === */}
          <TabsContent value="financeiro" className="space-y-4 mt-4">
            {/* Financial Quick Links - FIRST */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acesso Rápido - Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ModuleQuickAction 
                      icon={CreditCard} 
                      label="Propinas" 
                      description="Gestão de mensalidades"
                      href="/financeiro/propinas"
                      color="success"
                    />
                    <ModuleQuickAction 
                      icon={Wallet} 
                      label="Livro Caixa" 
                      description="Receitas e despesas"
                      href="/financeiro/caixa"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={AlertCircle} 
                      label="Cobranças" 
                      description="Dívidas em atraso"
                      href="/financeiro/cobrancas"
                      color="warning"
                    />
                    <ModuleQuickAction 
                      icon={BarChart3} 
                      label="Relatórios" 
                      description="Análises financeiras"
                      href="/financeiro/relatorios"
                      color="primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Receitas (mês)"
                value={financialLoading ? '...' : formatMZN(financial?.currentSummary.receitas || 0)}
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                color="bg-success"
                onClick={() => navigate('/financeiro/caixa')}
                isLoading={financialLoading}
              />
              <StatCard
                title="Despesas (mês)"
                value={financialLoading ? '...' : formatMZN(financial?.currentSummary.despesas || 0)}
                icon={<TrendingDown className="w-5 h-5 text-white" />}
                color="bg-destructive"
                onClick={() => navigate('/financeiro/caixa')}
                isLoading={financialLoading}
              />
              <StatCard
                title="Saldo Mensal"
                value={financialLoading ? '...' : formatMZN(financial?.currentSummary.saldo || 0)}
                icon={<Wallet className="w-5 h-5 text-white" />}
                color={(financial?.currentSummary.saldo || 0) >= 0 ? 'bg-primary' : 'bg-destructive'}
                onClick={() => navigate('/financeiro')}
                isLoading={financialLoading}
              />
              <StatCard
                title="Taxa Adimplência"
                value={financialLoading ? '...' : `${financial?.currentSummary.taxaAdimplencia || 0}%`}
                icon={<CreditCard className="w-5 h-5 text-white" />}
                color="bg-info"
                onClick={() => navigate('/financeiro/propinas')}
                isLoading={financialLoading}
              />
            </div>

            {/* Link to Full Dashboard */}
            <motion.div variants={itemVariants}>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate('/financeiro')}
              >
                <BarChart3 className="h-4 w-4" />
                Ver Dashboard Financeiro Completo
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </TabsContent>

          {/* === TAB: RH (Human Resources) === */}
          <TabsContent value="rh" className="space-y-4 mt-4">
            {/* HR Quick Links - FIRST */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acesso Rápido - Recursos Humanos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ModuleQuickAction 
                      icon={UserCheck} 
                      label="Professores" 
                      description="Corpo docente"
                      href="/teachers"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={Building2} 
                      label="Colaboradores" 
                      description="Staff administrativo"
                      href="/colaboradores"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={FileText} 
                      label="Contratos" 
                      description="Gestão contratual"
                      href="/rh/contratos"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={ClipboardCheck} 
                      label="Documentação" 
                      description="Ficheiros e registos"
                      href="/rh/documentacao"
                      color="primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* HR Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Professores"
                value={stats?.counts.teachers || 0}
                icon={<UserCheck className="w-5 h-5 text-white" />}
                color="bg-blue-500"
                onClick={() => navigate('/teachers')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Colaboradores"
                value={stats?.counts.employees || 0}
                icon={<Building2 className="w-5 h-5 text-white" />}
                color="bg-teal-500"
                onClick={() => navigate('/colaboradores')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Total Staff"
                value={(stats?.counts.teachers || 0) + (stats?.counts.employees || 0)}
                icon={<Users className="w-5 h-5 text-white" />}
                color="bg-primary"
                isLoading={statsLoading}
              />
              <StatCard
                title="Turmas"
                value={stats?.counts.classes || 0}
                icon={<BookOpen className="w-5 h-5 text-white" />}
                color="bg-purple-500"
                onClick={() => navigate('/turmas')}
                isLoading={statsLoading}
              />
            </div>
          </TabsContent>

          {/* === TAB: PEDAGÓGICO (For Teachers) === */}
          <TabsContent value="pedagogico" className="space-y-4 mt-4">
            {/* Quick Links for Teachers - FIRST */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acesso Rápido - Pedagógico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ModuleQuickAction 
                      icon={ClipboardCheck} 
                      label="Lançar Notas" 
                      description="Pauta digital"
                      href="/avaliacoes"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={UserCheck} 
                      label="Presenças" 
                      description="Chamada digital"
                      href="/presencas"
                      color="success"
                    />
                    <ModuleQuickAction 
                      icon={BookOpen} 
                      label="Minhas Turmas" 
                      description="Ver turmas atribuídas"
                      href="/turmas"
                      color="primary"
                    />
                    <ModuleQuickAction 
                      icon={Calendar} 
                      label="Calendário" 
                      description="Provas e eventos"
                      href="/calendario-provas"
                      color="warning"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teacher Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Minhas Turmas"
                value={stats?.counts.classes || 0}
                icon={<BookOpen className="w-5 h-5 text-white" />}
                color="bg-primary"
                onClick={() => navigate('/turmas')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Total Educandos"
                value={stats?.counts.students || 0}
                icon={<Users className="w-5 h-5 text-white" />}
                color="bg-blue-500"
                onClick={() => navigate('/students')}
                isLoading={statsLoading}
              />
              <StatCard
                title="Aulas Hoje"
                value={4}
                icon={<Clock className="w-5 h-5 text-white" />}
                color="bg-amber-500"
                isLoading={false}
              />
              <StatCard
                title="Notas Pendentes"
                value={12}
                change="Aguardando lançamento"
                changeType="negative"
                icon={<AlertCircle className="w-5 h-5 text-white" />}
                color="bg-warning"
                onClick={() => navigate('/avaliacoes')}
                isLoading={false}
              />
            </div>

            {/* Teacher Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Próximas Aulas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { turma: '10ª Classe A', disciplina: 'Matemática', hora: '08:00 - 09:30' },
                        { turma: '9ª Classe B', disciplina: 'Matemática', hora: '09:45 - 11:15' },
                        { turma: '11ª Classe A', disciplina: 'Física', hora: '11:30 - 13:00' },
                        { turma: '8ª Classe A', disciplina: 'Matemática', hora: '14:00 - 15:30' },
                      ].map((aula, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookMarked className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{aula.turma}</p>
                            <p className="text-xs text-muted-foreground">{aula.disciplina}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{aula.hora}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ano Lectivo 2026</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">1º Trimestre</span>
                        <span className="font-medium text-success">Concluído</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">2º Trimestre</span>
                        <span className="font-medium text-primary">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">3º Trimestre</span>
                        <span className="font-medium text-muted-foreground">Por iniciar</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Próximo evento</p>
                          <p className="text-sm font-medium">Exames 2º Trimestre</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">15 Mai</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* === TAB: ENCARREGADO (Guardian Portal) === */}
          <TabsContent value="encarregado" className="space-y-4 mt-4">
            {/* Calendário Escolar & Provas - TOP */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Calendário Escolar & Provas
                      </CardTitle>
                      <CardDescription>Eventos e avaliações dos seus educandos (próximos 30 dias)</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate('/calendario')}
                    >
                      Ver Completo
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { evento: 'Prova de Matemática', data: '15 Mar', tipo: 'prova', turma: '10ª Classe A' },
                      { evento: 'Prova de Português', data: '18 Mar', tipo: 'prova', turma: '10ª Classe A' },
                      { evento: 'Reunião de Pais', data: '22 Mar', tipo: 'reuniao', turma: 'Geral' },
                      { evento: 'Feira de Ciências', data: '28 Mar', tipo: 'evento', turma: 'Geral' },
                      { evento: 'Prova de Física', data: '02 Abr', tipo: 'prova', turma: '10ª Classe A' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`p-2 rounded-lg ${
                          item.tipo === 'prova' ? 'bg-warning/10' :
                          item.tipo === 'reuniao' ? 'bg-blue-500/10' : 'bg-primary/10'
                        }`}>
                          <Calendar className={`h-4 w-4 ${
                            item.tipo === 'prova' ? 'text-warning' :
                            item.tipo === 'reuniao' ? 'text-blue-500' : 'text-primary'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.evento}</p>
                          <p className="text-xs text-muted-foreground">{item.turma}</p>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${
                          item.tipo === 'prova' ? 'bg-warning/20 text-warning' :
                          item.tipo === 'reuniao' ? 'bg-blue-500/20 text-blue-500' : ''
                        }`}>
                          {item.data}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Educando Info + Notas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Meu Educando</CardTitle>
                    <CardDescription>Informações gerais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">João Carlos Mondlane</p>
                        <p className="text-sm text-muted-foreground">10ª Classe A</p>
                        <Badge variant="secondary" className="mt-1">Nº 15</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Média Geral</p>
                        <p className="text-xl font-bold text-primary">14.5</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Frequência</p>
                        <p className="text-xl font-bold text-success">92%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notas por Disciplina */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                      Notas - 2º Trimestre
                    </CardTitle>
                    <CardDescription>Avaliações do seu educando</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { disciplina: 'Matemática', nota: 15, status: 'Bom' },
                        { disciplina: 'Português', nota: 13, status: 'Suficiente' },
                        { disciplina: 'Física', nota: 16, status: 'Bom' },
                        { disciplina: 'Biologia', nota: 12, status: 'Suficiente' },
                        { disciplina: 'História', nota: 14, status: 'Bom' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">{item.disciplina}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-xs ${
                              item.nota >= 14 ? 'bg-success/20 text-success' :
                              item.nota >= 10 ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                            }`}>
                              {item.nota}/20
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-3 gap-2"
                      onClick={() => navigate('/avaliacoes')}
                    >
                      Ver Todas as Notas
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Assiduidade + Situação Financeira */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Assiduidade */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      Assiduidade
                    </CardTitle>
                    <CardDescription>Registo de presenças do educando</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-success/10 text-center">
                        <p className="text-2xl font-bold text-success">85</p>
                        <p className="text-xs text-muted-foreground">Presenças</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 text-center">
                        <p className="text-2xl font-bold text-destructive">5</p>
                        <p className="text-xs text-muted-foreground">Faltas</p>
                      </div>
                      <div className="p-3 rounded-lg bg-warning/10 text-center">
                        <p className="text-2xl font-bold text-warning">2</p>
                        <p className="text-xs text-muted-foreground">Atrasos</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa de Presença</span>
                        <span className="font-medium text-success">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 gap-2"
                      onClick={() => navigate('/presencas')}
                    >
                      Ver Detalhes Completos
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Situação Financeira */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Situação Financeira
                    </CardTitle>
                    <CardDescription>Propinas do ano lectivo - João Carlos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-sm">Janeiro 2026</span>
                        </div>
                        <Badge variant="secondary" className="bg-success/20 text-success">Pago</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-sm">Fevereiro 2026</span>
                        </div>
                        <Badge variant="secondary" className="bg-success/20 text-success">Pago</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-warning" />
                          <span className="text-sm">Março 2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-warning/20 text-warning">Pendente</Badge>
                          <span className="text-xs text-muted-foreground">3.500 MZN</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="default" 
                        className="flex-1 gap-2"
                        onClick={() => navigate('/financeiro/propinas')}
                      >
                        <CreditCard className="h-4 w-4" />
                        Pagar / Enviar Comprovativo
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 gap-2"
                      onClick={() => navigate('/financeiro/propinas')}
                    >
                      Ver Histórico Completo
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* === TAB: ALUNO (Student Portal) === */}
          <TabsContent value="aluno" className="space-y-4 mt-4">
            <StudentDashboard />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
