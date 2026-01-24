import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Contract {
  id: number;
  staff_type: 'teacher' | 'employee';
  staff_id: number;
  staff_name: string;
  staff_role: string;
  contract_number: string | null;
  contract_type: string | null;
  contract_start: string | null;
  contract_end: string | null;
  salary: number | null;
  status: string;
  photo_url: string | null;
}

export interface ContractFilters {
  search?: string;
  contractType?: string;
  status?: 'Activo' | 'A Expirar' | 'Expirado' | 'all';
}

export function useContracts(filters: ContractFilters = {}) {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: async () => {
      // Fetch teachers
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name, status, contract_number, contract_type, contract_start, contract_end, salary, photo_url')
        .not('contract_number', 'is', null);

      if (teachersError) throw teachersError;

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, role, status, contract_number, contract_type, contract_start, contract_end, salary, photo_url')
        .not('contract_number', 'is', null);

      if (employeesError) throw employeesError;

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Transform to contracts
      const teacherContracts: Contract[] = (teachers || []).map(t => {
        const endDate = t.contract_end ? new Date(t.contract_end) : null;
        let status = 'Activo';
        if (endDate) {
          if (endDate < now) status = 'Expirado';
          else if (endDate <= thirtyDaysFromNow) status = 'A Expirar';
        }
        return {
          id: t.id,
          staff_type: 'teacher' as const,
          staff_id: t.id,
          staff_name: t.name,
          staff_role: 'Professor',
          contract_number: t.contract_number,
          contract_type: t.contract_type,
          contract_start: t.contract_start,
          contract_end: t.contract_end,
          salary: t.salary,
          status,
          photo_url: t.photo_url,
        };
      });

      const employeeContracts: Contract[] = (employees || []).map(e => {
        const endDate = e.contract_end ? new Date(e.contract_end) : null;
        let status = 'Activo';
        if (endDate) {
          if (endDate < now) status = 'Expirado';
          else if (endDate <= thirtyDaysFromNow) status = 'A Expirar';
        }
        return {
          id: e.id,
          staff_type: 'employee' as const,
          staff_id: e.id,
          staff_name: e.name,
          staff_role: e.role,
          contract_number: e.contract_number,
          contract_type: e.contract_type,
          contract_start: e.contract_start,
          contract_end: e.contract_end,
          salary: e.salary,
          status,
          photo_url: e.photo_url,
        };
      });

      let allContracts = [...teacherContracts, ...employeeContracts];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allContracts = allContracts.filter(c =>
          c.staff_name.toLowerCase().includes(searchLower) ||
          c.contract_number?.toLowerCase().includes(searchLower) ||
          c.staff_role.toLowerCase().includes(searchLower)
        );
      }

      if (filters.contractType && filters.contractType !== 'all') {
        allContracts = allContracts.filter(c => c.contract_type === filters.contractType);
      }

      if (filters.status && filters.status !== 'all') {
        allContracts = allContracts.filter(c => c.status === filters.status);
      }

      // Sort by end date
      allContracts.sort((a, b) => {
        if (!a.contract_end) return 1;
        if (!b.contract_end) return -1;
        return new Date(a.contract_end).getTime() - new Date(b.contract_end).getTime();
      });

      return allContracts;
    },
  });
}

export function useContractsStats() {
  return useQuery({
    queryKey: ['contracts-stats'],
    queryFn: async () => {
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('contract_number, contract_end, status')
        .eq('status', 'Ativo');

      if (teachersError) throw teachersError;

      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('contract_number, contract_end, status')
        .eq('status', 'Ativo');

      if (employeesError) throw employeesError;

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const allStaff = [...(teachers || []), ...(employees || [])];
      const withContract = allStaff.filter(s => s.contract_number);

      let expiringCount = 0;
      let expiredCount = 0;

      withContract.forEach(s => {
        if (s.contract_end) {
          const endDate = new Date(s.contract_end);
          if (endDate < now) expiredCount++;
          else if (endDate <= thirtyDaysFromNow) expiringCount++;
        }
      });

      return {
        total: withContract.length,
        activos: withContract.length - expiredCount,
        aExpirar: expiringCount,
        expirados: expiredCount,
      };
    },
  });
}

export const CONTRACT_TYPES = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Prazo Determinado', label: 'Prazo Determinado' },
  { value: 'Prestação de Serviços', label: 'Prestação de Serviços' },
  { value: 'Estágio', label: 'Estágio' },
  { value: 'Voluntário', label: 'Voluntário' },
];
