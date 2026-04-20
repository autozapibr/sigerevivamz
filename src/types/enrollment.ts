// Tipos para o módulo de Matrícula Digital

export type DocumentType = 
  | 'BI'
  | 'NUIT'
  | 'CERTIDAO_NASCIMENTO'
  | 'CERTIFICADO_HABILITACOES'
  | 'DECLARACAO_ESCOLA_ANTERIOR'
  | 'ATESTADO_MEDICO'
  | 'FOTO'
  | 'OUTRO';

export type EnrollmentStatus = 
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CANCELADA';

export type GenderType = 'MASCULINO' | 'FEMININO';

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Guardian {
  id: number;
  full_name: string;
  relationship: string;
  bi_number?: string;
  nuit?: string;
  phone: string;
  phone_alt?: string;
  email?: string;
  occupation?: string;
  workplace?: string;
  address?: string;
  province?: string;
  district?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentDocument {
  id: number;
  student_id: number;
  document_type: DocumentType;
  document_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: number;
  student_id: number;
  academic_year_id: number;
  class_id?: number;
  enrollment_number?: string;
  enrollment_date: string;
  status: EnrollmentStatus;
  monthly_fee: number;
  enrollment_fee: number;
  discount_percent: number;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: StudentWithDetails;
  academic_year?: AcademicYear;
  class?: { id: number; name: string; year: number };
}

export interface StudentWithDetails {
  id: number;
  name: string;
  age?: number;
  phone?: string;
  guardian?: string;
  class_id?: number;
  status?: string;
  bi_number?: string;
  nuit?: string;
  birth_date?: string;
  gender?: GenderType;
  nationality?: string;
  province?: string;
  district?: string;
  address?: string;
  email?: string;
  photo_url?: string;
  health_notes?: string;
  previous_school?: string;
  enrollment_status?: EnrollmentStatus;
  created_at?: string;
  updated_at?: string;
}

// Form data types
export interface EnrollmentFormData {
  // Step 1: Dados Pessoais
  full_name: string;
  birth_date: string;
  gender: GenderType;
  bi_number?: string;
  nuit?: string;
  nationality: string;
  province: string;
  district: string;
  address: string;
  phone?: string;
  email?: string;
  health_notes?: string;
  previous_school?: string;
  
  // Step 2: Encarregado
  guardian: {
    full_name: string;
    relationship: string;
    bi_number?: string;
    nuit?: string;
    phone: string;
    phone_is_whatsapp?: boolean;
    phone_alt?: string;
    phone_alt_is_whatsapp?: boolean;
    email?: string;
    occupation?: string;
    workplace?: string;
    address?: string;
    province?: string;
    district?: string;
  };
  
  // Step 3: Turma e Propinas
  class_id?: number;
  monthly_fee: number;
  enrollment_fee: number;
  discount_percent: number;
  
  // Step 4: Documentos (handled separately)
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  BI: 'Bilhete de Identidade',
  NUIT: 'NUIT',
  CERTIDAO_NASCIMENTO: 'Certidão de Nascimento',
  CERTIFICADO_HABILITACOES: 'Certificado de Habilitações',
  DECLARACAO_ESCOLA_ANTERIOR: 'Declaração da Escola Anterior',
  ATESTADO_MEDICO: 'Atestado Médico',
  FOTO: 'Fotografia 3x4',
  OUTRO: 'Outro Documento',
};

export const REQUIRED_DOCUMENTS: DocumentType[] = [
  'CERTIDAO_NASCIMENTO',
  'FOTO',
];

export const RELATIONSHIP_OPTIONS = [
  'Pai',
  'Mãe',
  'Avô',
  'Avó',
  'Tio',
  'Tia',
  'Irmão',
  'Irmã',
  'Tutor Legal',
  'Outro',
];

export const STATUS_LABELS: Record<EnrollmentStatus, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-blue-500/20 text-blue-400' },
  APROVADA: { label: 'Aprovada', color: 'bg-green-500/20 text-green-400' },
  REJEITADA: { label: 'Rejeitada', color: 'bg-red-500/20 text-red-400' },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-500/20 text-gray-400' },
};
