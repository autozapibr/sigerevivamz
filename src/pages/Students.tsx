import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Users, User, Phone, Mail, 
  MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX,
  Download, Upload, GraduationCap
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentFilters['status']>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<StudentFilters['gender']>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    birth_date: '',
    gender: 'MASCULINO' as const,
    phone: '',
    bi_number: '',
    class_id: undefined as number | undefined,
    guardian: '',
    address: '',
  });

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
    await createStudent.mutateAsync(newStudent);
    setShowCreateDialog(false);
    setNewStudent({
      name: '',
      birth_date: '',
      gender: 'MASCULINO',
      phone: '',
      bi_number: '',
      class_id: undefined,
      guardian: '',
      address: '',
    });
  };

  const handleDeleteStudent = async () => {
    if (selectedStudent) {
      await deleteStudent.mutateAsync(selectedStudent.id);
      setShowDeleteDialog(false);
      setSelectedStudent(null);
    }
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, BI ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Educando</DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do educando. Poderá adicionar mais detalhes depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Ex: João Manuel Silva"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={newStudent.birth_date}
                  onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select 
                  value={newStudent.gender} 
                  onValueChange={(v) => setNewStudent({ ...newStudent, gender: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="+258 84 000 0000"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bi_number">Nº BI</Label>
                <Input
                  id="bi_number"
                  placeholder="00000000000A"
                  value={newStudent.bi_number}
                  onChange={(e) => setNewStudent({ ...newStudent, bi_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Turma</Label>
              <Select 
                value={newStudent.class_id?.toString() || ''} 
                onValueChange={(v) => setNewStudent({ ...newStudent, class_id: v ? Number(v) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardian">Encarregado de Educação</Label>
              <Input
                id="guardian"
                placeholder="Nome do encarregado"
                value={newStudent.guardian}
                onChange={(e) => setNewStudent({ ...newStudent, guardian: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateStudent}
              disabled={!newStudent.name || createStudent.isPending}
            >
              {createStudent.isPending ? 'A registar...' : 'Registar'}
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
