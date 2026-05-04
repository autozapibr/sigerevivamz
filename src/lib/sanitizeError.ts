/**
 * Sanitize error messages to prevent leaking implementation details.
 * Maps known database/API error patterns to user-friendly Portuguese messages.
 */

const ERROR_PATTERNS: [RegExp, string][] = [
  [/violates row-level security/i, 'Sem permissão para esta operação.'],
  [/violates foreign key/i, 'Não é possível remover este registo pois está em uso.'],
  [/duplicate key|unique constraint/i, 'Este registo já existe.'],
  [/violates check constraint/i, 'Dados inválidos. Verifique os campos e tente novamente.'],
  [/column .+ does not exist/i, 'Erro interno. Contacte o suporte.'],
  [/relation .+ does not exist/i, 'Erro interno. Contacte o suporte.'],
  [/permission denied/i, 'Sem permissão para esta operação.'],
  [/JWT expired/i, 'Sessão expirada. Faça login novamente.'],
  [/invalid input syntax/i, 'Formato de dados inválido.'],
  [/too long for type/i, 'Texto demasiado longo. Reduza o conteúdo.'],
  [/null value in column/i, 'Campos obrigatórios em falta.'],
  [/timeout|TIMEOUT/i, 'Tempo limite excedido. Tente novamente.'],
  [/fetch failed|network/i, 'Erro de rede. Verifique a sua ligação.'],
];

const GENERIC_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente ou contacte o suporte.';

export function sanitizeErrorMessage(error: unknown): string {
  const msg =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : (error as any)?.message ?? '';

  for (const [pattern, friendly] of ERROR_PATTERNS) {
    if (pattern.test(msg)) return friendly;
  }

  return GENERIC_MESSAGE;
}