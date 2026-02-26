import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Users, MoreHorizontal, BookOpen, 
  Edit, Trash2, UserPlus, User, Calendar, ChevronRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  useClassesList, 
  useCreateClass, 
  useUpdateClass, 
  useDeleteClass,
  useClassesStats,
  type ClassFilters 
} from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';

export default function Turmas() {
  const currentYear = new Date().getFullYear();
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar turma por nome...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [yearFilter, setYearFilter] = useState<string>(currentYear.toString());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    year: currentYear,
    teacher_id: undefined as number | undefined,
  });

  const filters: ClassFilters = {
    search: searchTerm,
    year: yearFilter && yearFilter !== 'all' ? Number(yearFilter) : null,
  };

  const { data: classes = [], isLoading } = useClassesList(filters);
  const { data: stats } = useClassesStats();
  const { data: teachers = [] } = useTeachers({ status: 'Ativo' });
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const resetForm = () => {
    setFormData({
      name: '',
      year: currentYear,
      teacher_id: undefined,
    });
  };

  const handleCreate = async () => {
    await createClass.mutateAsync(formData);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (classItem: any) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      year: classItem.year,
      teacher_id: classItem.teacher_id || undefined,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedClass) {
      await updateClass.mutateAsync({
        id: selectedClass.id,
        ...formData,
      });
      setShowEditDialog(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (selectedClass) {
      await deleteClass.mutateAsync(selectedClass.id);
      setShowDeleteDialog(false);
      setSelectedClass(null);
    }
  };

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  // Generate year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <MainLayout title="Turmas" subtitle="Gestão de turmas e alocação de educandos">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Turmas</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary">Ano {currentYear}</p>
                  <p className="text-2xl font-bold text-primary">{stats?.anoCorrente || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-500">Total Educandos</p>
                  <p className="text-2xl font-bold text-green-500">{stats?.totalEducandos || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-500">Turmas Vazias</p>
                  <p className="text-2xl font-bold text-orange-500">{stats?.vazias || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nova Turma</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-48" />
              </Card>
            ))
          ) : classes.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || yearFilter !== currentYear.toString()
                    ? 'Nenhuma turma encontrada com os filtros aplicados.'
                    : 'Nenhuma turma registada ainda.'}
                </p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => { resetForm(); setShowCreateDialog(true); }}
                >
                  Criar primeira turma
                </Button>
              </CardContent>
            </Card>
          ) : (
            classes.map((turma, index) => (
              <motion.div
                key={turma.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{turma.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Ano Lectivo: {turma.year}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(turma)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Adicionar Educandos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedClass(turma);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Teacher */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Director de Turma:</span>
                      {turma.teacher ? (
                        <span className="font-medium text-primary">
                          {turma.teacher.name}
                        </span>
                      ) : (
                        <span className="text-orange-500 dark:text-orange-400">Não atribuído</span>
                      )}
                    </div>

                    {turma.teacher?.email && (
                      <div className="text-xs text-muted-foreground pl-6">
                        {turma.teacher.email}
                      </div>
                    )}

                    {/* Students count */}
                    <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong className="text-lg">{turma.students_count || 0}</strong> educandos
                        </span>
                      </div>
                      <Badge variant="secondary" className={
                        (turma.students_count || 0) > 0 
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }>
                        {(turma.students_count || 0) > 0 ? 'Activa' : 'Vazia'}
                      </Badge>
                    </div>
                    
                    {/* Student avatars preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(5, turma.students_count || 0) }).map((_, i) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(turma.students_count || 0) > 5 && (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{(turma.students_count || 0) - 5}
                          </div>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-primary">
                        Ver Detalhes
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Editar Turma' : 'Nova Turma'}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog 
                ? 'Actualize os dados da turma.' 
                : 'Configure a nova turma para o ano lectivo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Turma *</Label>
              <Input
                id="name"
                placeholder="Ex: 10ª Classe A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Ano Lectivo *</Label>
              <Select 
                value={formData.year.toString()} 
                onValueChange={(v) => setFormData({ ...formData, year: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Director de Turma</Label>
              <Select 
                value={formData.teacher_id?.toString() || ''} 
                onValueChange={(v) => setFormData({ ...formData, teacher_id: v ? Number(v) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar professor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={!formData.name || createClass.isPending || updateClass.isPending}
            >
              {(createClass.isPending || updateClass.isPending) 
                ? 'A guardar...' 
                : showEditDialog ? 'Guardar Alterações' : 'Criar Turma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Turma</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar a turma{' '}
              <strong>{selectedClass?.name}</strong>? Esta acção não pode ser desfeita.
              {(selectedClass?.students_count || 0) > 0 && (
                <span className="block mt-2 text-orange-500">
                  Atenção: Esta turma tem {selectedClass?.students_count} educandos. 
                  Transfira-os antes de eliminar.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteClass.isPending}
            >
              {deleteClass.isPending ? 'A eliminar...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
