export type UserRole = 'DIRETORIA' | 'SECRETARIA' | 'FINANCEIRO' | 'PROFESSOR' | 'ENCARREGADO';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: UserRole;
}

// Permissões por role
export const ROLE_PERMISSIONS = {
  DIRETORIA: ['*'] as const, // Acesso total
  SECRETARIA: ['students', 'classes', 'teachers', 'subjects', 'attendance', 'evaluations', 'reports'] as const,
  FINANCEIRO: ['students', 'financial', 'reports'] as const,
  PROFESSOR: ['attendance', 'evaluations', 'students.read'] as const,
  ENCARREGADO: ['students.read', 'evaluations.read', 'financial.read'] as const
};

export type Permission = 
  | 'students' | 'students.read' | 'students.write'
  | 'classes' | 'classes.read' | 'classes.write'
  | 'teachers' | 'teachers.read' | 'teachers.write'
  | 'subjects' | 'subjects.read' | 'subjects.write'
  | 'attendance' | 'attendance.read' | 'attendance.write'
  | 'evaluations' | 'evaluations.read' | 'evaluations.write'
  | 'financial' | 'financial.read' | 'financial.write'
  | 'reports' | 'reports.read' | 'reports.write'
  | '*';