import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Users, User, Phone, Mail, 
  MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX,
  Download, Upload, GraduationCap, Loader2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentForm, initialStudentFormData, type StudentFormData } from '@/components/students/StudentForm';
import { 
  useStudents, 
  useCreateStudent, 
  useUpdateStudent, 
  useDeleteStudent,
  useStudentsStats,
  type StudentFilters 
} from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useGrades';
import { formatPhone, formatBI } from '@/lib/validators/mozambique';

export function Students() {
  const navigate = useNavigate();
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar por nome, BI ou telefone...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [statusFilter, setStatusFilter] = useState<StudentFilters['status']>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<StudentFilters['gender']>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState<StudentFormData>({ ...initialStudentFormData });

  const filters: StudentFilters = {
    search: searchTerm,
    status: statusFilter,
    class_id: classFilter !== 'all' ? Number(classFilter) : null,
    gender: genderFilter,
  };

  const { data: students = [], isLoading, refetch } = useStudents(filters);
  const { data: stats } = useStudentsStats();
  const { data: classes = [] } = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const handleCreateStudent = async () => {
    await createStudent.mutateAsync({
      name: newStudent.name,
      birth_date: newStudent.birth_date || undefined,
      gender: newStudent.gender,
      phone: newStudent.phone || undefined,
      bi_number: newStudent.bi_number || undefined,
      nuit: newStudent.nuit || undefined,
      nationality: newStudent.nationality || undefined,
      email: newStudent.email || undefined,
      province: newStudent.province || undefined,
      district: newStudent.district || undefined,
      address: newStudent.address || undefined,
      class_id: newStudent.class_id,
      guardian: newStudent.guardian || undefined,
      health_notes: newStudent.health_notes || undefined,
      previous_school: newStudent.previous_school || undefined,
    });
    setShowCreateDialog(false);
    setNewStudent({ ...initialStudentFormData });
  };

  const handleDeleteStudent = async () => {
    await deleteStudent.mutateAsync(selectedStudent.id);
    setShowDeleteDialog(false);
    setSelectedStudent(null);
  };

  const handleToggleStatus = async (student: any) => {
    await updateStudent.mutateAsync({
      id: student.id,
      status: student.status === 'Ativo' ? 'Inativo' : 'Ativo',
    });
  };

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const getGenderLabel = (gender: string) => 
    gender === 'MASCULINO' ? 'M' : 'F';

  return (
    <MainLayout title="Educandos" subtitle="Gestão de educandos da instituição">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-500">Activos</p>
                  <p className="text-2xl font-bold text-green-500">{stats?.ativos || 0}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Masculino</p>
                  <p className="text-2xl font-bold text-blue-500">{stats?.masculino || 0}</p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-pink-500/10 border-pink-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-500">Feminino</p>
                  <p className="text-2xl font-bold text-pink-500">{stats?.feminino || 0}</p>
                </div>
                <User className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Ativo">Activos</SelectItem>
                    <SelectItem value="Inativo">Inactivos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas turmas</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={genderFilter || 'all'} onValueChange={(v) => setGenderFilter(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Novo Educando</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Educando</TableHead>
                  <TableHead className="hidden md:table-cell">BI</TableHead>
                  <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                  <TableHead className="hidden md:table-cell">Turma</TableHead>
                  <TableHead className="hidden lg:table-cell">Género</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Nenhum educando encontrado com os filtros aplicados.'
                          : 'Nenhum educando registado ainda.'}
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        Registar primeiro educando
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {student.photo_url && <AvatarImage src={student.photo_url} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {student.classes?.name || 'Sem turma'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {student.bi_number ? formatBI(student.bi_number) : '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {student.phone ? formatPhone(student.phone) : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.classes?.name || (
                          <span className="text-muted-foreground">Sem turma</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={
                          student.gender === 'MASCULINO' 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
                            : 'bg-pink-500/10 text-pink-500 border-pink-500/30'
                        }>
                          {getGenderLabel(student.gender || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          student.status === 'Ativo'
                            ? 'bg-green-500/10 text-green-500 border-green-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/students/${student.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                              {student.status === 'Ativo' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Educando</DialogTitle>
            <DialogDescription>
              Preencha os dados do educando organizados por secção.
            </DialogDescription>
          </DialogHeader>

          <StudentForm
            formData={newStudent}
            onChange={setNewStudent}
            classes={classes}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateStudent}
              disabled={!newStudent.name || createStudent.isPending}
            >
              {createStudent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {createStudent.isPending ? 'A registar...' : 'Registar Educando'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Educando</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar o educando{' '}
              <strong>{selectedStudent?.name}</strong>? Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStudent}
              disabled={deleteStudent.isPending}
            >
              {deleteStudent.isPending ? 'A eliminar...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
