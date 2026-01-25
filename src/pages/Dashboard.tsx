import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, BookOpen, 
  TrendingUp, TrendingDown, ArrowUpRight, Calendar,
  UserCheck, ClipboardCheck, AlertCircle, Wallet, Building2,
  CreditCard, FileText, BarChart3
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: financial, isLoading: financialLoading } = useFinancialDashboard();

  const quickActions = [
    { title: 'Nova Matrícula', icon: GraduationCap, path: '/matriculas', color: 'bg-primary text-primary-foreground' },
    { title: 'Lançar Notas', icon: ClipboardCheck, path: '/avaliacoes', color: 'bg-blue-500 text-white' },
    { title: 'Registar Presença', icon: UserCheck, path: '/presencas', color: 'bg-amber-500 text-white' },
    { title: 'Ver Calendário', icon: Calendar, path: '/calendario', color: 'bg-purple-500 text-white' },
  ];

  return (
    <MainLayout title="Dashboard Executivo" subtitle="Visão geral do sistema">
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
                  Bom dia, {user?.name?.split(' ')[0] || 'Utilizador'}! 👋
                </h2>
                <p className="text-white/80 max-w-xl text-sm sm:text-base">
                  Bem-vindo ao SiGER - Sistema de Gestão Escolar Reviva. 
                  Aqui tens uma visão geral da tua escola.
                </p>
              </div>
              <div className="absolute right-0 top-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Different Modules */}
        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral" className="text-xs sm:text-sm">Geral</TabsTrigger>
            <TabsTrigger value="escolar" className="text-xs sm:text-sm">Escolar</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs sm:text-sm">Financeiro</TabsTrigger>
            <TabsTrigger value="rh" className="text-xs sm:text-sm">RH</TabsTrigger>
          </TabsList>

          {/* === TAB: GERAL (Overview) === */}
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

            {/* Quick Links for Secretaria */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acesso Rápido - Secretaria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                onClick={() => navigate('/rh/colaboradores')}
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

            {/* HR Quick Links */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acesso Rápido - Recursos Humanos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                      href="/rh/colaboradores"
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
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}