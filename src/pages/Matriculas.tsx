import React, { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Matrículas"
          subtitle={`Ano Lectivo ${currentYear?.name || new Date().getFullYear()}`}
          actions={[
            {
              label: 'Nova Matrícula',
              onClick: () => setShowWizard(true),
              icon: Plus,
            }
          ]}
        />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-500">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-500">Aprovadas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-500">Rejeitadas</p>
                  <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, BI ou nº matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDENTE">Pendentes</SelectItem>
                  <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                  <SelectItem value="APROVADA">Aprovadas</SelectItem>
                  <SelectItem value="REJEITADA">Rejeitadas</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Matrícula</TableHead>
                  <TableHead>Educando</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Propina</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
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
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment, index) => (
                    <motion.tr
                      key={enrollment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {enrollment.enrollment_number || '-'}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {enrollment.class ? (
                          <span>{enrollment.class.name}</span>
                        ) : (
                          <span className="text-muted-foreground">A definir</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatMZN(enrollment.monthly_fee)}
                        {enrollment.discount_percent > 0 && (
                          <span className="text-xs text-green-500 ml-1">
                            (-{enrollment.discount_percent}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(enrollment.enrollment_date).toLocaleDateString('pt-MZ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(enrollment.status)}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Matrícula</DialogTitle>
          </DialogHeader>
          
          {selectedEnrollment && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Matrícula</p>
                  <p className="text-xl font-mono font-bold">
                    {selectedEnrollment.enrollment_number || 'Pendente'}
                  </p>
                </div>
                {getStatusBadge(selectedEnrollment.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                <div>
                  <p className="text-muted-foreground text-sm">Observações</p>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">
                    {selectedEnrollment.notes}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                {selectedEnrollment.status === 'PENDENTE' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleApprove(selectedEnrollment.id);
                        setShowDetails(false);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar Matrícula
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleReject(selectedEnrollment.id);
                        setShowDetails(false);
                      }}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
