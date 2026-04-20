import { z } from 'zod';

/**
 * Validações específicas para o contexto moçambicano
 * SGE REVIVA - Sistema de Gestão Escolar
 */

// Regex patterns para validações moçambicanas
export const PATTERNS = {
  // BI: ##### ##### ### (13 dígitos com espaços)
  BI: /^\d{5}\s\d{5}\s\d{3}$/,
  // NUIT: #########X (9 dígitos + letra de controlo)
  NUIT: /^\d{9}[A-Z]$/,
  // Telefone moçambicano: +258 ## ### ####
  PHONE: /^\+258\s\d{2}\s\d{3}\s\d{4}$/,
  // Código postal: #### (4 dígitos)
  POSTAL_CODE: /^\d{4}$/,
};

// Máscaras de formatação
export const MASKS = {
  // BI agora aceita letras e números (livre, até 20 caracteres)
  BI: (value: string): string => {
    return value.replace(/[^0-9A-Za-z\s]/g, '').toUpperCase().slice(0, 20);
  },

  // NUIT / Outro Documento: livre alfanumérico, facultativo
  NUIT: (value: string): string => {
    return value.replace(/[^0-9A-Za-z\s\-\/]/g, '').toUpperCase().slice(0, 20);
  },

  PHONE: (value: string): string => {
    let numbers = value.replace(/\D/g, '');
    
    // Add country code if not present
    if (!numbers.startsWith('258')) {
      numbers = '258' + numbers;
    }
    
    numbers = numbers.slice(0, 12); // 258 + 9 digits (telemóvel moçambicano)
    
    if (numbers.length <= 3) return `+${numbers}`;
    if (numbers.length <= 5) return `+${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    if (numbers.length <= 8) return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5)}`;
    return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8)}`;
  },

  POSTAL_CODE: (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 4);
  },
};

// Validadores Zod customizados
export const biValidator = z
  .string()
  .regex(PATTERNS.BI, 'Formato de BI inválido. Use: ##### ##### ###')
  .optional()
  .or(z.literal(''));

export const nuitValidator = z
  .string()
  .regex(PATTERNS.NUIT, 'Formato de NUIT inválido. Use: #########X')
  .optional()
  .or(z.literal(''));

export const phoneValidator = z
  .string()
  .regex(PATTERNS.PHONE, 'Formato de telefone inválido. Use: +258 ## ### ####')
  .optional()
  .or(z.literal(''));

export const postalCodeValidator = z
  .string()
  .regex(PATTERNS.POSTAL_CODE, 'Código postal deve ter 4 dígitos')
  .optional()
  .or(z.literal(''));

// Sistema de avaliação moçambicano (0-20)
export const gradeValidator = z
  .number()
  .min(0, 'A nota mínima é 0')
  .max(20, 'A nota máxima é 20');

// Função para verificar se BI é válido (checksum básico)
export const validateBI = (bi: string): boolean => {
  const cleaned = bi.replace(/\s/g, '');
  if (cleaned.length !== 13) return false;
  
  // Validação básica: todos dígitos
  return /^\d{13}$/.test(cleaned);
};

// Função para verificar se NUIT é válido (algoritmo de controlo)
export const validateNUIT = (nuit: string): boolean => {
  if (!PATTERNS.NUIT.test(nuit)) return false;
  
  const numbers = nuit.slice(0, 9);
  const checkLetter = nuit.slice(9);
  
  // Cálculo simplificado do dígito de controlo
  const sum = numbers.split('').reduce((acc, digit, index) => {
    return acc + parseInt(digit) * (9 - index);
  }, 0);
  
  const remainder = sum % 23;
  const expectedLetter = String.fromCharCode(65 + remainder); // A=0, B=1, etc.
  
  return checkLetter === expectedLetter;
};

// Províncias de Moçambique
export const PROVINCES = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado',
] as const;

export type Province = typeof PROVINCES[number];

// Distritos principais (sample)
export const DISTRICTS_BY_PROVINCE: Record<Province, string[]> = {
  'Maputo Cidade': ['KaMpfumo', 'Nlhamankulu', 'KaMaxakeni', 'KaMubukwana', 'KaNyaka'],
  'Maputo Província': ['Matola', 'Boane', 'Moamba', 'Marracuene', 'Namaacha'],
  'Gaza': ['Xai-Xai', 'Chókwè', 'Chibuto', 'Manjacaze', 'Bilene'],
  'Inhambane': ['Inhambane', 'Maxixe', 'Massinga', 'Vilankulo', 'Inhassoro'],
  'Sofala': ['Beira', 'Dondo', 'Nhamatanda', 'Buzi', 'Gorongosa'],
  'Manica': ['Chimoio', 'Manica', 'Gondola', 'Sussundenga', 'Macossa'],
  'Tete': ['Tete', 'Moatize', 'Cahora Bassa', 'Changara', 'Mutarara'],
  'Zambézia': ['Quelimane', 'Mocuba', 'Milange', 'Gurué', 'Alto Molócuè'],
  'Nampula': ['Nampula', 'Nacala', 'Ilha de Moçambique', 'Angoche', 'Monapo'],
  'Niassa': ['Lichinga', 'Cuamba', 'Mandimba', 'Sanga', 'Majune'],
  'Cabo Delgado': ['Pemba', 'Montepuez', 'Mueda', 'Mocímboa da Praia', 'Palma'],
};

// Formatadores para exibição
export const formatPhone = (value: string): string => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 9) {
    return `+258 ${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
  }
  if (numbers.length === 12 && numbers.startsWith('258')) {
    return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8)}`;
  }
  return value;
};

export const formatBI = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)} ${cleaned.slice(10)}`;
  }
  return value;
};

// Conversor para formato WhatsApp (apenas dígitos, com código do país)
export const toWhatsAppFormat = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');
  if (!digits.startsWith('258') && digits.length === 9) {
    digits = '258' + digits;
  }
  return digits;
};

// Formatador de moeda moçambicana
export const formatMZN = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
  }).format(value);
};

// Classificação do sistema moçambicano (0-20)
export const getGradeClassification = (grade: number): {
  label: string;
  color: string;
  passed: boolean;
} => {
  if (grade >= 16) return { label: 'Excelente', color: 'text-green-600', passed: true };
  if (grade >= 14) return { label: 'Bom', color: 'text-blue-600', passed: true };
  if (grade >= 10) return { label: 'Suficiente', color: 'text-yellow-600', passed: true };
  if (grade >= 5) return { label: 'Insuficiente', color: 'text-orange-600', passed: false };
  return { label: 'Mau', color: 'text-red-600', passed: false };
};
