import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, CheckCircle, XCircle, Clock, 
  Eye, FileText, User, Phone, Calendar, MoreHorizontal,
  Download, RefreshCw
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useStudentEnrollments, 
  useUpdateEnrollmentStatus,
  useAcademicYears 
} from '@/hooks/useEnrollments';
import { EnrollmentWizard } from '@/components/enrollment/EnrollmentWizard';
import { formatMZN } from '@/lib/validators/mozambique';
import { STATUS_LABELS, type EnrollmentStatus } from '@/types/enrollment';

export default function Matriculas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrDirector = user?.role === 'ADMIN' || user?.role === 'DIRETORIA';
  
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const { data: academicYears = [] } = useAcademicYears();
  const currentYear = academicYears.find(y => y.is_current);
  
  const { data: enrollments = [], isLoading, refetch } = useStudentEnrollments({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    academic_year_id: currentYear?.id,
    search: searchTerm,
  });
  
  const updateStatus = useUpdateEnrollmentStatus();
  
  // Stats
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'PENDENTE').length,
    approved: enrollments.filter(e => e.status === 'APROVADA').length,
    rejected: enrollments.filter(e => e.status === 'REJEITADA').length,
  };
  
  const handleApprove = async (enrollmentId: number) => {
    await updateStatus.mutateAsync({ 
      enrollmentId, 
      status: 'APROVADA' 
    });
  };
  
  const handleReject = async (enrollmentId: number) => {
    await updateStatus.mutateAsync({ 
      enrollmentId, 
      status: 'REJEITADA',
      notes: 'Documentação incompleta ou inválida'
    });
  };
  
  const handleViewDetails = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowDetails(true);
  };
  
  const getStatusBadge = (status: EnrollmentStatus) => {
    const config = STATUS_LABELS[status];
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };
  
  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Gestão de Matrículas"
          subtitle={`Ano Lectivo ${currentYear?.name || new Date().getFullYear()}`}
          actions={[
            ...(isAdminOrDirector ? [{
              label: 'Configurar',
              onClick: () => navigate('/configuracoes/matriculas'),
              icon: Settings,
              variant: 'outline' as const,
            }] : []),
            {
              label: 'Nova Matrícula',
              onClick: () => setShowWizard(true),
              icon: Plus,
            }
          ]}
        />
        
        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-yellow-500">Pendentes</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-green-500">Aprovadas</p>
                  <p className="text-xl md:text-2xl font-bold text-green-500">{stats.approved}</p>
                </div>
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-red-500">Rejeitadas</p>
                  <p className="text-xl md:text-2xl font-bold text-red-500">{stats.rejected}</p>
                </div>
                <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters - Responsive */}
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou BI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 md:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDENTE">Pendentes</SelectItem>
                    <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                    <SelectItem value="APROVADA">Aprovadas</SelectItem>
                    <SelectItem value="REJEITADA">Rejeitadas</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma matrícula encontrada.
                </p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setShowWizard(true)}
                >
                  Criar primeira matrícula
                </Button>
              </CardContent>
            </Card>
          ) : (
            enrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{enrollment.student?.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {enrollment.enrollment_number || 'Pendente'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Turma</p>
                        <p className="font-medium truncate">
                          {enrollment.class?.name || 'A definir'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Propina</p>
                        <p className="font-medium">
                          {formatMZN(enrollment.monthly_fee)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(enrollment.enrollment_date).toLocaleDateString('pt-MZ')}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(enrollment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {enrollment.status === 'PENDENTE' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-500"
                              onClick={() => handleApprove(enrollment.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleReject(enrollment.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Desktop Table View */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Nº Matrícula</th>
                    <th className="text-left p-4 font-medium">Educando</th>
                    <th className="text-left p-4 font-medium">Turma</th>
                    <th className="text-left p-4 font-medium">Propina</th>
                    <th className="text-left p-4 font-medium">Data</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Nenhuma matrícula encontrada com os filtros aplicados.'
                            : 'Nenhuma matrícula registada ainda.'}
                        </p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => setShowWizard(true)}
                        >
                          Criar primeira matrícula
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment, index) => (
                      <motion.tr
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 font-mono text-sm">
                          {enrollment.enrollment_number || '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{enrollment.student?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {enrollment.student?.bi_number || 'Sem BI'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {enrollment.class ? (
                            <span>{enrollment.class.name}</span>
                          ) : (
                            <span className="text-muted-foreground">A definir</span>
                          )}
                        </td>
                        <td className="p-4">
                          {formatMZN(enrollment.monthly_fee)}
                          {enrollment.discount_percent > 0 && (
                            <span className="text-xs text-green-500 ml-1">
                              (-{enrollment.discount_percent}%)
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(enrollment.enrollment_date).toLocaleDateString('pt-MZ')}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(enrollment.status)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(enrollment)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/students/${enrollment.student_id}`)}>
                                <User className="w-4 h-4 mr-2" />
                                Ficha do Educando
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {enrollment.status === 'PENDENTE' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleApprove(enrollment.id)}
                                    className="text-green-500"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReject(enrollment.id)}
                                    className="text-red-500"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeitar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* New Enrollment Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <EnrollmentWizard 
            onComplete={() => {
              setShowWizard(false);
              refetch();
            }}
            onCancel={() => setShowWizard(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Enrollment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Matrícula</DialogTitle>
          </DialogHeader>
          
          {selectedEnrollment && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Matrícula</p>
                  <p className="text-xl font-mono font-bold">
                    {selectedEnrollment.enrollment_number || 'Pendente'}
                  </p>
                </div>
                {getStatusBadge(selectedEnrollment.status)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Educando</p>
                  <p className="font-medium">{selectedEnrollment.student?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">BI</p>
                  <p className="font-medium">{selectedEnrollment.student?.bi_number || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Turma</p>
                  <p className="font-medium">{selectedEnrollment.class?.name || 'A definir'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ano Lectivo</p>
                  <p className="font-medium">{selectedEnrollment.academic_year?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa de Matrícula</p>
                  <p className="font-medium">{formatMZN(selectedEnrollment.enrollment_fee)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Propina Mensal</p>
                  <p className="font-medium">
                    {formatMZN(selectedEnrollment.monthly_fee)}
                    {selectedEnrollment.discount_percent > 0 && (
                      <span className="text-green-500 ml-1">
                        (-{selectedEnrollment.discount_percent}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de Registo</p>
                  <p className="font-medium">
                    {new Date(selectedEnrollment.created_at).toLocaleDateString('pt-MZ')}
                  </p>
                </div>
                {selectedEnrollment.approved_at && (
                  <div>
                    <p className="text-muted-foreground">Data de Aprovação</p>
                    <p className="font-medium">
                      {new Date(selectedEnrollment.approved_at).toLocaleDateString('pt-MZ')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedEnrollment.notes && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{selectedEnrollment.notes}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
                {selectedEnrollment.status === 'PENDENTE' && (
                  <>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleReject(selectedEnrollment.id);
                        setShowDetails(false);
                      }}
                    >
                      Rejeitar
                    </Button>
                    <Button 
                      onClick={() => {
                        handleApprove(selectedEnrollment.id);
                        setShowDetails(false);
                      }}
                    >
                      Aprovar Matrícula
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
