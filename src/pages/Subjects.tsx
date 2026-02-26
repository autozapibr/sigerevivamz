import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { motion } from 'framer-motion';
import { 
  Plus, Search, BookOpen, MoreHorizontal, 
  Edit, Trash2, Clock, Hash, Layers
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  useSubjectsList, 
  useCreateSubject, 
  useUpdateSubject, 
  useDeleteSubject,
  useSubjectsStats,
  type SubjectFilters 
} from '@/hooks/useSubjects';

export default function Subjects() {
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar disciplina ou código...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    workload: 0,
  });

  const filters: SubjectFilters = {
    search: searchTerm,
  };

  const { data: subjects = [], isLoading } = useSubjectsList(filters);
  const { data: stats } = useSubjectsStats();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      workload: 0,
    });
  };

  const handleCreate = async () => {
    await createSubject.mutateAsync({
      name: formData.name,
      code: formData.code || null,
      workload: formData.workload || null,
    });
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      workload: subject.workload || 0,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedSubject) {
      await updateSubject.mutateAsync({
        id: selectedSubject.id,
        name: formData.name,
        code: formData.code || null,
        workload: formData.workload || null,
      });
      setShowEditDialog(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (selectedSubject) {
      await deleteSubject.mutateAsync(selectedSubject.id);
      setShowDeleteDialog(false);
      setSelectedSubject(null);
    }
  };

  // Common subject colors for visual differentiation
  const getSubjectColor = (index: number) => {
    const colors = [
      'bg-blue-500/10 text-blue-500 border-blue-500/30',
      'bg-green-500/10 text-green-500 border-green-500/30',
      'bg-purple-500/10 text-purple-500 border-purple-500/30',
      'bg-orange-500/10 text-orange-500 border-orange-500/30',
      'bg-pink-500/10 text-pink-500 border-pink-500/30',
      'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
      'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      'bg-red-500/10 text-red-500 border-red-500/30',
    ];
    return colors[index % colors.length];
  };

  return (
    <MainLayout title="Disciplinas" subtitle="Gestão do currículo escolar">
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
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-500">Em Uso</p>
                  <p className="text-2xl font-bold text-green-500">{stats?.emUso || 0}</p>
                </div>
                <Layers className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-500">Sem Uso</p>
                  <p className="text-2xl font-bold text-orange-500">{stats?.semUso || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary">Carga Total</p>
                  <p className="text-2xl font-bold text-primary">{stats?.cargaHorariaTotal || 0}h</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nova Disciplina</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="hidden md:table-cell">Código</TableHead>
                  <TableHead className="hidden md:table-cell">Carga Horária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'Nenhuma disciplina encontrada com os filtros aplicados.'
                          : 'Nenhuma disciplina registada ainda.'}
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => { resetForm(); setShowCreateDialog(true); }}
                      >
                        Criar primeira disciplina
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects.map((subject, index) => (
                    <motion.tr
                      key={subject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSubjectColor(index).split(' ')[0]}`}>
                            <BookOpen className={`w-5 h-5 ${getSubjectColor(index).split(' ')[1]}`} />
                          </div>
                          <div>
                            <p className="font-medium">{subject.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {subject.code || 'Sem código'} • {subject.workload || 0}h/semana
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {subject.code ? (
                          <Badge variant="outline" className="font-mono">
                            {subject.code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{subject.workload || 0}h/semana</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                          Activa
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(subject)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedSubject(subject);
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

        {/* Quick Add Cards - Common Subjects */}
        {subjects.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Adicionar disciplinas comuns</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Português', code: 'PORT' },
                  { name: 'Matemática', code: 'MAT' },
                  { name: 'Inglês', code: 'ING' },
                  { name: 'Física', code: 'FIS' },
                  { name: 'Química', code: 'QUI' },
                  { name: 'Biologia', code: 'BIO' },
                  { name: 'História', code: 'HIST' },
                  { name: 'Geografia', code: 'GEO' },
                  { name: 'Educação Física', code: 'EDF' },
                  { name: 'Educação Visual', code: 'EDV' },
                ].map((subject, i) => (
                  <Button
                    key={subject.code}
                    variant="outline"
                    size="sm"
                    className={`${getSubjectColor(i)}`}
                    onClick={() => {
                      setFormData({ name: subject.name, code: subject.code, workload: 3 });
                      setShowCreateDialog(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {subject.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
              {showEditDialog ? 'Editar Disciplina' : 'Nova Disciplina'}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog 
                ? 'Actualize os dados da disciplina.' 
                : 'Configure a nova disciplina do currículo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Disciplina *</Label>
              <Input
                id="name"
                placeholder="Ex: Matemática"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  placeholder="Ex: MAT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workload">Carga Horária (h/semana)</Label>
                <Input
                  id="workload"
                  type="number"
                  min={0}
                  max={20}
                  placeholder="0"
                  value={formData.workload || ''}
                  onChange={(e) => setFormData({ ...formData, workload: Number(e.target.value) })}
                />
              </div>
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
              disabled={!formData.name || createSubject.isPending || updateSubject.isPending}
            >
              {(createSubject.isPending || updateSubject.isPending) 
                ? 'A guardar...' 
                : showEditDialog ? 'Guardar Alterações' : 'Criar Disciplina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Disciplina</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar a disciplina{' '}
              <strong>{selectedSubject?.name}</strong>? Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteSubject.isPending}
            >
              {deleteSubject.isPending ? 'A eliminar...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
