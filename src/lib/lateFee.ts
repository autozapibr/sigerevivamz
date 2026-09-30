import { differenceInDays, parseISO } from 'date-fns';

export type LateFeeMode =
  | 'FIXED_ONCE'
  | 'FIXED_MONTHLY'
  | 'PERCENT_ONCE'
  | 'PERCENT_MONTHLY'
  | 'PERCENT_COMPOUND';

export interface LateFeeSettings {
  id: number;
  mode: LateFeeMode;
  fixed_amount: number;
  percent: number;
  grace_days: number;
  is_active: boolean;
  updated_at?: string | null;
}

export const LATE_FEE_MODE_LABELS: Record<LateFeeMode, string> = {
  FIXED_ONCE: 'Valor fixo único',
  FIXED_MONTHLY: 'Valor fixo por mês de atraso',
  PERCENT_ONCE: 'Percentual único (% da propina)',
  PERCENT_MONTHLY: 'Percentual por mês de atraso',
  PERCENT_COMPOUND: 'Percentual composto (juros sobre juros)',
};

export const LATE_FEE_MODE_HELP: Record<LateFeeMode, string> = {
  FIXED_ONCE: 'Cobra o valor fixo uma única vez, independente de quantos meses de atraso.',
  FIXED_MONTHLY: 'Multiplica o valor fixo pelos meses de atraso (ex.: 50 MT × 3 = 150 MT).',
  PERCENT_ONCE: 'Cobra a percentagem sobre a propina, uma única vez.',
  PERCENT_MONTHLY: 'Cobra a percentagem sobre a propina por cada mês de atraso (juros simples).',
  PERCENT_COMPOUND: 'Juros compostos: a percentagem incide mês a mês sobre o acumulado.',
};

/**
 * Nº de meses de atraso (começa em 1 assim que passa o vencimento + dias de tolerância).
 */
export function monthsLate(dueDate: string | null, graceDays: number, today: Date = new Date()): number {
  if (!dueDate) return 0;
  const daysLate = differenceInDays(today, parseISO(dueDate)) - (graceDays || 0);
  if (daysLate <= 0) return 0;
  return Math.max(1, Math.ceil(daysLate / 30));
}

/**
 * Calcula a multa de atraso de uma propina, de acordo com a configuração activa.
 * Retorna 0 se já estiver paga, se não houver atraso, ou se a multa estiver desactivada.
 */
export function calculateLateFee(params: {
  amount: number | null;
  dueDate: string | null;
  status: string | null;
  settings: LateFeeSettings | null | undefined;
  today?: Date;
}): number {
  const { amount, dueDate, status, settings } = params;
  const today = params.today ?? new Date();

  if (!settings || !settings.is_active) return 0;
  if (status === 'Pago') return 0;

  const months = monthsLate(dueDate, settings.grace_days, today);
  if (months <= 0) return 0;

  const base = Number(amount) || 0;
  const p = Number(settings.percent) || 0;
  const f = Number(settings.fixed_amount) || 0;

  let fee = 0;
  switch (settings.mode) {
    case 'FIXED_ONCE':
      fee = f;
      break;
    case 'FIXED_MONTHLY':
      fee = f * months;
      break;
    case 'PERCENT_ONCE':
      fee = base * (p / 100);
      break;
    case 'PERCENT_MONTHLY':
      fee = base * (p / 100) * months;
      break;
    case 'PERCENT_COMPOUND':
      fee = base * (Math.pow(1 + p / 100, months) - 1);
      break;
    default:
      fee = 0;
  }

  return Math.round(fee * 100) / 100;
}
