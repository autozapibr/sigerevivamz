import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Users, User, Phone, Mail, 
  MoreHorizontal, Edit, Trash2, UserCheck, UserX,
  Briefcase, Building2, FileText
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
  useEmployees, 
  useCreateEmployee, 
  useUpdateEmployee, 
  useDeleteEmployee,
  useEmployeesStats,
  type EmployeeFilters 
} from '@/hooks/useEmployees';
import { StaffForm } from '@/components/rh/StaffForm';
import { DocumentUploadDialog } from '@/components/rh/DocumentUploadDialog';
import { formatPhone } from '@/lib/validators/mozambique';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  bi_number: '',
  nuit: '',
  photo_url: '',
  role: '',
  department: '',
  qualifications: '',
  hire_date: '',
  contract_number: '',
  contract_type: 'Efectivo',
  contract_start: '',
  contract_end: '',
  salary: '',
  address: '',
  province: '',
  district: '',
  birth_date: '',
  gender: '',
  emergency_contact: '',
  emergency_phone: '',
  bank_name: '',
  bank_account: '',
  status: 'Ativo',
};

export default function ColaboradoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeFilters['status']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormData);

  const filters: EmployeeFilters = {
    search: searchTerm,
    status: statusFilter,
  };

  const { data: employees = [], isLoading } = useEmployees(filters);
  const { data: stats } = useEmployeesStats();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const resetForm = () => setFormData(initialFormData);

  const handleCreate = async () => {
    await createEmployee.mutateAsync({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      bi_number: formData.bi_number || null,
      nuit: formData.nuit || null,
      photo_url: formData.photo_url || null,
      role: formData.role,
      department: formData.department || null,
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
      status: formData.status,
    });
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      bi_number: employee.bi_number || '',
      nuit: employee.nuit || '',
      photo_url: employee.photo_url || '',
      role: employee.role || '',
      department: employee.department || '',
      qualifications: '',
      hire_date: employee.hire_date || '',
      contract_number: employee.contract_number || '',
      contract_type: employee.contract_type || 'Efectivo',
      contract_start: employee.contract_start || '',
      contract_end: employee.contract_end || '',
      salary: employee.salary?.toString() || '',
      address: employee.address || '',
      province: employee.province || '',
      district: employee.district || '',
      birth_date: employee.birth_date || '',
      gender: employee.gender || '',
      emergency_contact: employee.emergency_contact || '',
      emergency_phone: employee.emergency_phone || '',
      bank_name: employee.bank_name || '',
      bank_account: employee.bank_account || '',
      status: employee.status || 'Ativo',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedEmployee) {
      await updateEmployee.mutateAsync({
        id: selectedEmployee.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        bi_number: formData.bi_number || null,
        nuit: formData.nuit || null,
        photo_url: formData.photo_url || null,
        role: formData.role,
        department: formData.department || null,
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
        status: formData.status,
      });
      setShowEditDialog(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (selectedEmployee) {
      await deleteEmployee.mutateAsync(selectedEmployee.id);
      setShowDeleteDialog(false);
      setSelectedEmployee(null);
    }
  };

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <MainLayout title="Colaboradores" subtitle="Gestão de funcionários e equipa de apoio">
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
                  <p className="text-sm text-primary">Funções</p>
                  <p className="text-2xl font-bold text-primary">{stats?.roles?.length || 0}</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Departamentos</p>
                  <p className="text-2xl font-bold text-blue-500">{stats?.departments?.length || 0}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
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
                  placeholder="Pesquisar por nome, função ou email..."
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
                  <span className="hidden sm:inline">Novo Colaborador</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid */}
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
          ) : employees.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Nenhum colaborador encontrado com os filtros aplicados.'
                    : 'Nenhum colaborador registado ainda.'}
                </p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => { resetForm(); setShowCreateDialog(true); }}
                >
                  Registar primeiro colaborador
                </Button>
              </CardContent>
            </Card>
          ) : (
            employees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage src={employee.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{employee.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {employee.role}
                          </Badge>
                          {employee.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{employee.email}</span>
                            </div>
                          )}
                          {employee.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{formatPhone(employee.phone)}</span>
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
                          <DropdownMenuItem onClick={() => handleEdit(employee)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDocumentDialog(true);
                          }}>
                            <FileText className="w-4 h-4 mr-2" />
                            Documentos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {employee.department && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        {employee.department}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="secondary" className={
                        employee.status === 'Ativo'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-0'
                          : 'bg-destructive/10 text-destructive border-0'
                      }>
                        {employee.status}
                      </Badge>
                      
                      {employee.contract_number && (
                        <span className="text-xs text-muted-foreground">
                          {employee.contract_number}
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
              {showEditDialog ? 'Editar Colaborador' : 'Novo Colaborador'}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog 
                ? 'Actualize os dados do colaborador.' 
                : 'Preencha os dados do novo colaborador.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <StaffForm
              staffType="employee"
              formData={formData}
              onChange={setFormData}
              isEdit={showEditDialog}
              staffId={selectedEmployee?.id}
            />
          </ScrollArea>

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
              disabled={!formData.name || !formData.role || createEmployee.isPending || updateEmployee.isPending}
            >
              {(createEmployee.isPending || updateEmployee.isPending) ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o colaborador "{selectedEmployee?.name}"? 
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Upload Dialog */}
      {selectedEmployee && (
        <DocumentUploadDialog
          open={showDocumentDialog}
          onOpenChange={setShowDocumentDialog}
          staffType="employee"
          staffId={selectedEmployee.id}
          staffName={selectedEmployee.name}
        />
      )}
    </MainLayout>
  );
}
