import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  bi_number: string | null;
  nuit: string | null;
  photo_url: string | null;
  role: string;
  department: string | null;
  hire_date: string | null;
  contract_number: string | null;
  contract_type: string | null;
  contract_start: string | null;
  contract_end: string | null;
  salary: number | null;
  address: string | null;
  province: string | null;
  district: string | null;
  birth_date: string | null;
  gender: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  bank_name: string | null;
  bank_account: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type EmployeeInsert = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type EmployeeUpdate = Partial<EmployeeInsert>;

export interface EmployeeFilters {
  search?: string;
  status?: 'Ativo' | 'Inativo' | 'all';
  role?: string;
  department?: string;
}

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('*')
        .order('name');

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as Employee[];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(e =>
          e.name.toLowerCase().includes(searchLower) ||
          e.email?.toLowerCase().includes(searchLower) ||
          e.phone?.includes(searchLower) ||
          e.role?.toLowerCase().includes(searchLower)
        );
      }

      return result;
    },
  });
}

export function useEmployee(employeeId: number | null) {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      return data as Employee;
    },
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Sucesso',
        description: 'Colaborador registado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: EmployeeUpdate & { id: number }) => {
      const { data: updated, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Dados do colaborador actualizados',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employeeId: number) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Sucesso',
        description: 'Colaborador removido com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useEmployeesStats() {
  return useQuery({
    queryKey: ['employees-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, status, role, department');

      if (error) throw error;

      const employees = data as Employee[];
      const roles = [...new Set(employees.map(e => e.role))];
      const departments = [...new Set(employees.filter(e => e.department).map(e => e.department!))];

      return {
        total: employees.length,
        ativos: employees.filter(e => e.status === 'Ativo').length,
        inativos: employees.filter(e => e.status === 'Inativo').length,
        roles,
        departments,
      };
    },
  });
}
