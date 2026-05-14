import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Users, Phone, Mail, 
  MoreHorizontal, Edit, Trash2, UserCheck, UserX,
  GraduationCap, BookOpen, Award, FileText
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useTeachers, 
  useCreateTeacher, 
  useUpdateTeacher, 
  useDeleteTeacher,
  useTeachersStats,
  type TeacherFilters 
} from '@/hooks/useTeachers';
import { StaffForm, initialStaffFormData, type StaffFormData } from '@/components/rh/StaffForm';
import { DocumentUploadDialog } from '@/components/rh/DocumentUploadDialog';
import { formatPhone } from '@/lib/validators/mozambique';
import { TeacherAssignmentsDialog } from '@/components/teachers/TeacherAssignmentsDialog';
import { useAllAssignments } from '@/hooks/useTeacherAssignments';

export default function Teachers() {
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar por nome, email ou telefone...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [statusFilter, setStatusFilter] = useState<TeacherFilters['status']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [formData, setFormData] = useState<StaffFormData>(initialStaffFormData);

  const filters: TeacherFilters = {
    search: searchTerm,
    status: statusFilter,
  };

  const { data: teachers = [], isLoading } = useTeachers(filters);
  const { data: stats } = useTeachersStats();
  const { data: allAssignments = [] } = useAllAssignments();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const resetForm = () => setFormData(initialStaffFormData);

  const handleCreate = async () => {
    await createTeacher.mutateAsync({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      qualifications: formData.qualifications || null,
      bi_number: formData.bi_number || null,
      nuit: formData.nuit || null,
      photo_url: formData.photo_url || null,
      hire_date: formData.hire_date || null,
      contract_number: formData.contract_number || null,
      contract_type: formData.contract_type || null,
      contract_start: formData.contract_start || null,
      contract_end: formData.contract_end || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      address: formData.address || null,
      province: formData.province || null,
      district: formData.district || null,
      birth_date: formData.birth_date || null,
      gender: formData.gender || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
      bank_name: formData.bank_name || null,
      bank_account: formData.bank_account || null,
      status: formData.status as 'Ativo' | 'Inativo',
    } as any);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      bi_number: teacher.bi_number || '',
      nuit: teacher.nuit || '',
      photo_url: teacher.photo_url || '',
      role: '',
      department: '',
      qualifications: teacher.qualifications || '',
      hire_date: teacher.hire_date || '',
      contract_number: teacher.contract_number || '',
      contract_type: teacher.contract_type || 'Efectivo',
      contract_start: teacher.contract_start || '',
      contract_end: teacher.contract_end || '',
      salary: teacher.salary?.toString() || '',
      address: teacher.address || '',
      province: teacher.province || '',
      district: teacher.district || '',
      birth_date: teacher.birth_date || '',
      gender: teacher.gender || '',
      emergency_contact: teacher.emergency_contact || '',
      emergency_phone: teacher.emergency_phone || '',
      bank_name: teacher.bank_name || '',
      bank_account: teacher.bank_account || '',
      payment_method: teacher.payment_method || 'bank',
      mobile_money_provider: teacher.mobile_money_provider || '',
      mobile_money_number: teacher.mobile_money_number || '',
      status: teacher.status || 'Ativo',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedTeacher) {
      await updateTeacher.mutateAsync({
        id: selectedTeacher.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        qualifications: formData.qualifications || null,
        bi_number: formData.bi_number || null,
        nuit: formData.nuit || null,
        photo_url: formData.photo_url || null,
        hire_date: formData.hire_date || null,
        contract_number: formData.contract_number || null,
        contract_type: formData.contract_type || null,
        contract_start: formData.contract_start || null,
        contract_end: formData.contract_end || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        address: formData.address || null,
        province: formData.province || null,
        district: formData.district || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        bank_name: formData.bank_name || null,
        bank_account: formData.bank_account || null,
        status: formData.status as 'Ativo' | 'Inativo',
      } as any);
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
                          <AvatarImage src={teacher.photo_url || undefined} />
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowAssignmentsDialog(true);
                          }}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Turmas e Disciplinas
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowDocumentDialog(true);
                          }}>
                            <FileText className="w-4 h-4 mr-2" />
                            Documentos
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

                    {(() => {
                      const teacherAssigns = allAssignments.filter(a => a.teacher_id === teacher.id);
                      if (teacherAssigns.length === 0) return null;
                      const totalH = teacherAssigns.reduce((s, a) => s + (a.weekly_hours || 0), 0);
                      return (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          <span>{teacherAssigns.length} atribuições · {totalH}h/semana</span>
                        </div>
                      );
                    })()}

                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="secondary" className={
                        teacher.status === 'Ativo'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-0'
                          : 'bg-destructive/10 text-destructive border-0'
                      }>
                        {teacher.status}
                      </Badge>
                      
                      {teacher.contract_number && (
                        <span className="text-xs text-muted-foreground">
                          {teacher.contract_number}
                        </span>
                      )}
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
        <DialogContent className="max-w-2xl max-h-[90vh]">
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

          <ScrollArea className="max-h-[60vh] pr-4">
            <StaffForm
              staffType="teacher"
              formData={formData}
              onChange={setFormData}
              isEdit={showEditDialog}
              staffId={selectedTeacher?.id}
            />
          </ScrollArea>

          <DialogFooter className="mt-4">
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
              {(createTeacher.isPending || updateTeacher.isPending) && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {showEditDialog ? 'Guardar' : 'Registar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Professor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o professor <strong>{selectedTeacher?.name}</strong>?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeacher.isPending ? 'A eliminar...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Upload Dialog */}
      {selectedTeacher && (
        <DocumentUploadDialog
          open={showDocumentDialog}
          onOpenChange={setShowDocumentDialog}
          staffType="teacher"
          staffId={selectedTeacher.id}
          staffName={selectedTeacher.name}
        />
      )}

      <TeacherAssignmentsDialog
        open={showAssignmentsDialog}
        onOpenChange={setShowAssignmentsDialog}
        teacher={selectedTeacher ? { id: selectedTeacher.id, name: selectedTeacher.name } : null}
      />
    </MainLayout>
  );
}
