import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, User, GraduationCap, Wallet, FileText, Phone, 
  Mail, MapPin, Calendar, AlertCircle, CheckCircle, Clock,
  CreditCard, TrendingDown, TrendingUp, MessageSquare
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useStudentDocuments, useStudentGuardians } from '@/hooks/useEnrollments';
import { useTuitionFees } from '@/hooks/useFinancial';
import { usePaymentAgreements, useCommunicationHistory } from '@/hooks/useCollections';
import { formatMZN, formatBI, formatPhone } from '@/lib/validators/mozambique';
import { DOCUMENT_LABELS, STATUS_LABELS, type DocumentType, type EnrollmentStatus } from '@/types/enrollment';

function useStudentDetail(id: number | null) {
  return useQuery({
    queryKey: ['student-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes (id, name, year)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

function useStudentEnrollmentHistory(studentId: number | null) {
  return useQuery({
    queryKey: ['student-enrollment-history', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`*, academic_years (id, name), classes (id, name, year)`)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

function useStudentGrades(studentId: number | null) {
  return useQuery({
    queryKey: ['student-grades', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('grades')
        .select(`*, subjects (id, name, code), classes (id, name)`)
        .eq('student_id', studentId)
        .order('trimestre');
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

function useStudentAttendanceStats(studentId: number | null) {
  return useQuery({
    queryKey: ['student-attendance-detail', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data, error } = await supabase
        .from('student_attendance_stats')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id) : null;

  const { data: student, isLoading } = useStudentDetail(studentId);
  const { data: guardians = [] } = useStudentGuardians(studentId);
  const { data: documents = [] } = useStudentDocuments(studentId);
  const { data: enrollments = [] } = useStudentEnrollmentHistory(studentId);
  const { data: grades = [] } = useStudentGrades(studentId);
  const { data: attendanceStats } = useStudentAttendanceStats(studentId);
  const { data: allTuitions = [] } = useTuitionFees();
  const { data: agreements = [] } = usePaymentAgreements(studentId ?? undefined);
  const { data: commsHistory = [] } = useCommunicationHistory(studentId ?? undefined, 20);

  // Filter tuitions for this student
  const tuitions = allTuitions.filter(t => t.student_id === studentId);
  const paidTuitions = tuitions.filter(t => t.status === 'Pago');
  const pendingTuitions = tuitions.filter(t => t.status === 'Pendente');
  const overdueTuitions = tuitions.filter(t => t.status === 'Atrasado');
  const totalDebt = [...pendingTuitions, ...overdueTuitions].reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Educando não encontrado</h2>
          <Button variant="link" onClick={() => navigate('/students')}>
            Voltar à lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-16 w-16">
              {student.photo_url && <AvatarImage src={student.photo_url} />}
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {student.classes && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {student.classes.name}
                  </span>
                )}
                <Badge className={
                  student.status === 'Ativo'
                    ? 'bg-green-500/20 text-green-500 border-0'
                    : 'bg-red-500/20 text-red-500 border-0'
                }>
                  {student.status}
                </Badge>
                {student.enrollment_status && (
                  <Badge className={STATUS_LABELS[student.enrollment_status as EnrollmentStatus]?.color + ' border-0'}>
                    Matrícula: {STATUS_LABELS[student.enrollment_status as EnrollmentStatus]?.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Propinas Pagas</p>
                  <p className="text-lg font-bold">{paidTuitions.length}/{tuitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={totalDebt > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalDebt > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  {totalDebt > 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> : <TrendingUp className="w-4 h-4 text-green-500" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dívida</p>
                  <p className={`text-lg font-bold ${totalDebt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {formatMZN(totalDebt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Presença</p>
                  <p className="text-lg font-bold">{attendanceStats?.taxa_presenca ?? '-'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <FileText className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Documentos</p>
                  <p className="text-lg font-bold">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="text-xs md:text-sm">
              <User className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Dados Pessoais</span>
              <span className="md:hidden">Pessoal</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="text-xs md:text-sm">
              <GraduationCap className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Académico</span>
              <span className="md:hidden">Acad.</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs md:text-sm">
              <Wallet className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Financeiro</span>
              <span className="md:hidden">Financ.</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs md:text-sm">
              <FileText className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Documentos</span>
              <span className="md:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Data Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Informações Pessoais</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Nome Completo" value={student.name} />
                <InfoRow label="Data de Nascimento" value={student.birth_date ? new Date(student.birth_date).toLocaleDateString('pt-MZ') : '-'} />
                <InfoRow label="Género" value={student.gender === 'MASCULINO' ? 'Masculino' : student.gender === 'FEMININO' ? 'Feminino' : '-'} />
                <InfoRow label="Nacionalidade" value={student.nationality || 'Moçambicana'} />
                <InfoRow label="Bilhete de Identidade" value={student.bi_number ? formatBI(student.bi_number) : '-'} />
                <InfoRow label="NUIT" value={student.nuit || '-'} />
                <InfoRow label="Telefone" value={student.phone ? formatPhone(student.phone) : '-'} icon={<Phone className="w-3 h-3" />} />
                <InfoRow label="Email" value={student.email || '-'} icon={<Mail className="w-3 h-3" />} />
                <InfoRow label="Província" value={student.province || '-'} icon={<MapPin className="w-3 h-3" />} className="col-span-1" />
                <InfoRow label="Distrito" value={student.district || '-'} />
                <InfoRow label="Endereço" value={student.address || '-'} className="md:col-span-2" />
                <InfoRow label="Escola Anterior" value={student.previous_school || '-'} className="md:col-span-2" />
                {student.health_notes && (
                  <div className="md:col-span-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-xs text-yellow-500 font-medium mb-1">Informações de Saúde</p>
                    <p className="text-sm">{student.health_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guardian */}
            <Card>
              <CardHeader><CardTitle className="text-base">Encarregado(s) de Educação</CardTitle></CardHeader>
              <CardContent>
                {guardians.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {student.guardian ? `Encarregado: ${student.guardian}` : 'Nenhum encarregado registado.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {guardians.map((g: any, i: number) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm p-4 rounded-lg bg-muted/30">
                        <InfoRow label="Nome" value={g.full_name} />
                        <InfoRow label="Parentesco" value={g.relationship} />
                        <InfoRow label="Telefone" value={g.phone ? formatPhone(g.phone) : '-'} icon={<Phone className="w-3 h-3" />} />
                        <InfoRow label="Email" value={g.email || '-'} icon={<Mail className="w-3 h-3" />} />
                        {g.occupation && <InfoRow label="Profissão" value={g.occupation} />}
                        {g.workplace && <InfoRow label="Local de Trabalho" value={g.workplace} />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-4">
            {/* Enrollment History */}
            <Card>
              <CardHeader><CardTitle className="text-base">Histórico de Matrículas</CardTitle></CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem histórico de matrículas.</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{e.enrollment_number || 'Pendente'}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.academic_years?.name} • {e.classes?.name || 'Turma a definir'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={STATUS_LABELS[e.status as EnrollmentStatus]?.color + ' border-0 text-xs'}>
                            {STATUS_LABELS[e.status as EnrollmentStatus]?.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(e.enrollment_date).toLocaleDateString('pt-MZ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance */}
            {attendanceStats && (
              <Card>
                <CardHeader><CardTitle className="text-base">Frequência</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold">{attendanceStats.total_dias}</p>
                      <p className="text-xs text-muted-foreground">Total Dias</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-500/10">
                      <p className="text-2xl font-bold text-green-500">{attendanceStats.presencas}</p>
                      <p className="text-xs text-muted-foreground">Presenças</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-500/10">
                      <p className="text-2xl font-bold text-red-500">{attendanceStats.faltas}</p>
                      <p className="text-xs text-muted-foreground">Faltas</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                      <p className="text-2xl font-bold text-yellow-500">{attendanceStats.atrasos}</p>
                      <p className="text-xs text-muted-foreground">Atrasos</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <p className="text-2xl font-bold text-primary">{attendanceStats.taxa_presenca}%</p>
                      <p className="text-xs text-muted-foreground">Taxa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

             {/* Grades & Report Card */}
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0">
                 <CardTitle className="text-base">Notas & Aproveitamento</CardTitle>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => navigate(`/students/${studentId}/caderneta`)}
                   className="gap-2"
                 >
                   <FileText className="h-4 w-4" />
                   Ver Caderneta Completa
                 </Button>
               </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem notas registadas.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/30">
                        <tr>
                          <th className="text-left p-2">Disciplina</th>
                          <th className="text-center p-2">Trim.</th>
                          <th className="text-center p-2">ACS</th>
                          <th className="text-center p-2">ACP</th>
                          <th className="text-center p-2">ACF</th>
                          <th className="text-center p-2">MT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g: any, i: number) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">{g.subjects?.name}</td>
                            <td className="text-center p-2">{g.trimestre}º</td>
                            <td className="text-center p-2">{g.acs ?? '-'}</td>
                            <td className="text-center p-2">{g.acp ?? '-'}</td>
                            <td className="text-center p-2">{g.acf ?? '-'}</td>
                            <td className={`text-center p-2 font-semibold ${
                              (g.media_trimestral ?? 0) >= 10 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {g.media_trimestral ?? '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Propinas Pagas</p>
                  <p className="text-2xl font-bold text-green-500">{paidTuitions.length}</p>
                  <p className="text-xs text-green-500">
                    {formatMZN(paidTuitions.reduce((s, t) => s + (Number(t.amount) || 0), 0))}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500">{pendingTuitions.length}</p>
                  <p className="text-xs text-yellow-500">
                    {formatMZN(pendingTuitions.reduce((s, t) => s + (Number(t.amount) || 0), 0))}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-500">{overdueTuitions.length}</p>
                  <p className="text-xs text-red-500">{formatMZN(totalDebt)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tuition History */}
            <Card>
              <CardHeader><CardTitle className="text-base">Histórico de Propinas</CardTitle></CardHeader>
              <CardContent>
                {tuitions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem propinas geradas para este educando.</p>
                ) : (
                  <div className="space-y-2">
                    {tuitions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{t.month}</p>
                          <p className="text-xs text-muted-foreground">
                            Vencimento: {t.due_date ? new Date(t.due_date).toLocaleDateString('pt-MZ') : '-'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">{formatMZN(Number(t.amount) || 0)}</span>
                          <Badge className={
                            t.status === 'Pago' ? 'bg-green-500/20 text-green-500 border-0' :
                            t.status === 'Atrasado' ? 'bg-red-500/20 text-red-500 border-0' :
                            'bg-yellow-500/20 text-yellow-500 border-0'
                          }>
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Agreements */}
            {agreements.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Acordos de Pagamento</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agreements.map(a => (
                      <div key={a.id} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {a.installments}x de {formatMZN(Number(a.installment_amount) || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Original: {formatMZN(a.original_amount)} 
                              {a.discount_percent > 0 && ` → Desconto ${a.discount_percent}%`}
                            </p>
                          </div>
                          <Badge className={
                            a.status === 'CUMPRIDO' ? 'bg-green-500/20 text-green-500 border-0' :
                            a.status === 'ATIVO' ? 'bg-blue-500/20 text-blue-500 border-0' :
                            a.status === 'QUEBRADO' ? 'bg-red-500/20 text-red-500 border-0' :
                            'bg-yellow-500/20 text-yellow-500 border-0'
                          }>
                            {a.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communication History */}
            {commsHistory.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Histórico de Comunicações
                </CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {commsHistory.slice(0, 10).map(c => (
                      <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                        <Badge variant="outline" className="text-xs shrink-0">
                          {c.communication_type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{c.message_content}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.sent_at).toLocaleDateString('pt-MZ')} • {c.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Documentos do Educando</CardTitle></CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {DOCUMENT_LABELS[doc.document_type as DocumentType]}
                              {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.is_verified ? (
                            <Badge className="bg-green-500/20 text-green-500 border-0 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              Ver
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

// Helper component
function InfoRow({ label, value, icon, className }: { label: string; value: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-xs flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
