export type UserRole = 'ADMIN' | 'DIRETORIA' | 'SECRETARIA' | 'FINANCEIRO' | 'PROFESSOR' | 'PEDAGOGICO' | 'ENCARREGADO';

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

// Módulos do sistema
export type SystemModule = 
  | 'gestao_financeira'
  | 'gestao_escolar'
  | 'gestao_pedagogica'
  | 'gestao_rh'
  | 'configuracoes';

// Permissões por role (baseado em módulos)
export const ROLE_PERMISSIONS = {
  ADMIN: ['*'] as const, // Acesso total
  DIRETORIA: ['*'] as const, // Acesso total
  SECRETARIA: ['gestao_escolar', 'gestao_rh'] as const,
  FINANCEIRO: ['gestao_financeira'] as const,
  PROFESSOR: ['gestao_pedagogica'] as const,
  PEDAGOGICO: ['gestao_pedagogica'] as const,
  ENCARREGADO: ['portal_encarregado'] as const
};

export type Permission = 
  | 'gestao_financeira'
  | 'gestao_escolar'
  | 'gestao_pedagogica'
  | 'gestao_rh'
  | 'configuracoes'
  | 'portal_encarregado'
  | '*';