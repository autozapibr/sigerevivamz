import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Users, User, Phone, Mail, 
  MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX,
  GraduationCap, BookOpen, Award
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { 
  useTeachers, 
  useCreateTeacher, 
  useUpdateTeacher, 
  useDeleteTeacher,
  useTeachersStats,
  type TeacherFilters 
} from '@/hooks/useTeachers';
import { formatPhone } from '@/lib/validators/mozambique';

export default function Teachers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherFilters['status']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualifications: '',
    status: 'Ativo' as const,
  });

  const filters: TeacherFilters = {
    search: searchTerm,
    status: statusFilter,
  };

  const { data: teachers = [], isLoading } = useTeachers(filters);
  const { data: stats } = useTeachersStats();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      qualifications: '',
      status: 'Ativo',
    });
  };

  const handleCreate = async () => {
    await createTeacher.mutateAsync(formData);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      qualifications: teacher.qualifications || '',
      status: teacher.status,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedTeacher) {
      await updateTeacher.mutateAsync({
        id: selectedTeacher.id,
        ...formData,
      });
      setShowEditDialog(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (selectedTeacher) {
      await deleteTeacher.mutateAsync(selectedTeacher.id);
      setShowDeleteDialog(false);
      setSelectedTeacher(null);
    }
  };

  const handleToggleStatus = async (teacher: any) => {
    await updateTeacher.mutateAsync({
      id: teacher.id,
      status: teacher.status === 'Ativo' ? 'Inativo' : 'Ativo',
    });
  };

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <MainLayout title="Professores" subtitle="Gestão do corpo docente">
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
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary">Com Turmas</p>
                  <p className="text-2xl font-bold text-primary">{stats?.comTurmas || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-500">Sem Turmas</p>
                  <p className="text-2xl font-bold text-orange-500">{stats?.semTurmas || 0}</p>
                </div>
                <UserX className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
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

                <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Novo Professor</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : teachers.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Nenhum professor encontrado com os filtros aplicados.'
                    : 'Nenhum professor registado ainda.'}
                </p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => { resetForm(); setShowCreateDialog(true); }}
                >
                  Registar primeiro professor
                </Button>
              </CardContent>
            </Card>
          ) : (
            teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                            {getInitials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{teacher.name}</h3>
                          {teacher.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{teacher.email}</span>
                            </div>
                          )}
                          {teacher.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{formatPhone(teacher.phone)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(teacher)}>
                            {teacher.status === 'Ativo' ? (
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
                              setSelectedTeacher(teacher);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {teacher.qualifications && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Award className="w-3 h-3" />
                          Qualificações
                        </div>
                        <p className="text-sm line-clamp-2">{teacher.qualifications}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={
                        teacher.status === 'Ativo'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }>
                        {teacher.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Editar Professor' : 'Novo Professor'}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog 
                ? 'Actualize os dados do professor.' 
                : 'Preencha os dados do novo professor.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Ex: Dr. João Manuel Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="professor@escola.mz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="+258 84 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualificações</Label>
              <Textarea
                id="qualifications"
                placeholder="Ex: Licenciatura em Matemática, Mestrado em Educação..."
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                rows={3}
              />
            </div>

            {showEditDialog && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Activo</SelectItem>
                    <SelectItem value="Inativo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={showEditDialog ? handleUpdate : handleCreate}
              disabled={!formData.name || createTeacher.isPending || updateTeacher.isPending}
            >
              {(createTeacher.isPending || updateTeacher.isPending) 
                ? 'A guardar...' 
                : showEditDialog ? 'Guardar Alterações' : 'Registar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Professor</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar o professor{' '}
              <strong>{selectedTeacher?.name}</strong>? Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteTeacher.isPending}
            >
              {deleteTeacher.isPending ? 'A eliminar...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
