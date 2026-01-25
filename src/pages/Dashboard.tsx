import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, BookOpen, DollarSign, 
  TrendingUp, TrendingDown, ArrowUpRight, Calendar,
  UserCheck, ClipboardCheck, AlertCircle, Wallet, Building2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useFinancialDashboard } from '@/hooks/useDashboardStats';
import {
  ChartCard,
  StudentDistributionChart,
  MonthlyFinancialChart,
  EnrollmentStatusChart,
  TuitionTrendChart,
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
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
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
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {change && (
                <div className={`flex items-center gap-1 text-sm ${
                  changeType === 'positive' ? 'text-success' : 
                  changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
                  {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              {icon}
            </div>
          </div>
          {onClick && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
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
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema">
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Banner */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary to-primary-dark border-0 text-white overflow-hidden relative">
            <CardContent className="p-8">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">
                  Bom dia, {user?.name?.split(' ')[0] || 'Utilizador'}! 👋
                </h2>
                <p className="text-white/80 max-w-xl">
                  Bem-vindo ao SiGER - Sistema de Gestão Escolar Reviva. 
                  Aqui tens uma visão geral da tua escola.
                </p>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Educandos Activos"
            value={stats?.counts.students || 0}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-primary"
            onClick={() => navigate('/students')}
            isLoading={statsLoading}
          />
          <StatCard
            title="Professores"
            value={stats?.counts.teachers || 0}
            icon={<UserCheck className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            onClick={() => navigate('/teachers')}
            isLoading={statsLoading}
          />
          <StatCard
            title="Turmas"
            value={stats?.counts.classes || 0}
            icon={<BookOpen className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            onClick={() => navigate('/turmas')}
            isLoading={statsLoading}
          />
          <StatCard
            title="Matrículas Pendentes"
            value={stats?.counts.pendingEnrollments || 0}
            icon={<AlertCircle className="w-6 h-6 text-white" />}
            color="bg-amber-500"
            onClick={() => navigate('/matriculas')}
            isLoading={statsLoading}
          />
          <StatCard
            title="Colaboradores"
            value={stats?.counts.employees || 0}
            icon={<Building2 className="w-6 h-6 text-white" />}
            color="bg-teal-500"
            onClick={() => navigate('/rh/colaboradores')}
            isLoading={statsLoading}
          />
        </div>

        {/* Financial Summary Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Receitas (mês)</p>
                    <p className="text-lg font-bold text-success">
                      {financialLoading ? <Skeleton className="h-6 w-20" /> : formatMZN(financial?.currentSummary.receitas || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Despesas (mês)</p>
                    <p className="text-lg font-bold text-destructive">
                      {financialLoading ? <Skeleton className="h-6 w-20" /> : formatMZN(financial?.currentSummary.despesas || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo (mês)</p>
                    <p className="text-lg font-bold text-primary">
                      {financialLoading ? <Skeleton className="h-6 w-20" /> : formatMZN(financial?.currentSummary.saldo || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-info/10 border-info/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <DollarSign className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa Adimplência</p>
                    <p className="text-lg font-bold text-info">
                      {financialLoading ? <Skeleton className="h-6 w-12" /> : `${financial?.currentSummary.taxaAdimplencia || 0}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <ChartCard title="Receitas vs Despesas" description="Últimos 6 meses">
              {financialLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <MonthlyFinancialChart data={financial?.monthlyData || []} />
              )}
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard title="Propinas - Tendência" description="Pagos vs Pendentes por mês">
              {financialLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <TuitionTrendChart data={financial?.tuitionTrend || []} />
              )}
            </ChartCard>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <ChartCard title="Distribuição por Género" description="Educandos matriculados">
              {statsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <StudentDistributionChart data={stats?.genderDistribution || []} />
              )}
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard title="Estado das Matrículas" description="Ano lectivo actual">
              {statsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <EnrollmentStatusChart data={stats?.enrollmentStatus || []} />
              )}
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard title="Educandos por Turma" description="Top 8 turmas">
              {statsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <ClassDistributionChart data={stats?.classDistribution || []} />
              )}
            </ChartCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Acções Rápidas</CardTitle>
              <CardDescription>Tarefas frequentes do dia-a-dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto py-6 flex-col gap-3 hover:shadow-md transition-all group"
                      onClick={() => navigate(action.path)}
                    >
                      <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium">{action.title}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Actividade Recente</CardTitle>
                <CardDescription>Últimas acções no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Nova matrícula registada', time: 'Há 5 minutos', type: 'success' },
                    { action: 'Notas lançadas - 10ª Classe A', time: 'Há 1 hora', type: 'info' },
                    { action: 'Pagamento de propina recebido', time: 'Há 2 horas', type: 'success' },
                    { action: 'Chamada registada - 8ª Classe B', time: 'Há 3 horas', type: 'info' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'success' ? 'bg-success' : 'bg-info'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
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
              <CardHeader>
                <CardTitle>Ano Lectivo 2025</CardTitle>
                <CardDescription>Progresso do ano escolar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    <span className="font-medium text-primary">65% concluído</span>
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

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Próximo evento</p>
                      <p className="font-medium">Exames do 2º Trimestre</p>
                    </div>
                    <Badge variant="secondary">15 Maio</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
