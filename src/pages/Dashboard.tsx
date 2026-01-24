import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, BookOpen, DollarSign, 
  TrendingUp, TrendingDown, ArrowUpRight, Calendar,
  UserCheck, ClipboardCheck, AlertCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

function StatCard({ title, value, change, changeType = 'neutral', icon, color, onClick }: StatCardProps) {
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [students, teachers, classes, pendingEnrollments] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'Ativo'),
        supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('status', 'Ativo'),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('student_enrollments').select('id', { count: 'exact', head: true }).eq('status', 'PENDENTE'),
      ]);
      
      return {
        students: students.count || 0,
        teachers: teachers.count || 0,
        classes: classes.count || 0,
        pendingEnrollments: pendingEnrollments.count || 0,
      };
    },
  });

  const quickActions = [
    { title: 'Nova Matrícula', icon: GraduationCap, path: '/matriculas', color: 'bg-primary text-primary-foreground' },
    { title: 'Lançar Notas', icon: ClipboardCheck, path: '/avaliacoes', color: 'bg-blue-500 text-white' },
    { title: 'Registar Presença', icon: UserCheck, path: '/presencas', color: 'bg-amber-500 text-white' },
    { title: 'Ver Calendário', icon: Calendar, path: '/calendario', color: 'bg-purple-500 text-white' },
  ];

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema">
      <motion.div 
        className="space-y-8"
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
                  Bom dia, {user?.name.split(' ')[0]}! 👋
                </h2>
                <p className="text-white/80 max-w-xl">
                  Bem-vindo ao SiGER - Sistema de Gestão Escolar Reviva. 
                  Aqui tens uma visão geral da tua escola.
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Educandos"
            value={stats?.students || 0}
            change="+12 este mês"
            changeType="positive"
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-primary"
            onClick={() => navigate('/students')}
          />
          <StatCard
            title="Professores Activos"
            value={stats?.teachers || 0}
            icon={<UserCheck className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            onClick={() => navigate('/teachers')}
          />
          <StatCard
            title="Turmas"
            value={stats?.classes || 0}
            icon={<BookOpen className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            onClick={() => navigate('/turmas')}
          />
          <StatCard
            title="Matrículas Pendentes"
            value={stats?.pendingEnrollments || 0}
            icon={<AlertCircle className="w-6 h-6 text-white" />}
            color="bg-amber-500"
            onClick={() => navigate('/matriculas')}
          />
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
