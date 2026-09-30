export interface ClassGroup {
  name: string;
  pattern?: string | null; // se o nome da turma contém isto → pertence ao grupo
  min?: number | null; // intervalo do número da classe (inclusivo)
  max?: number | null;
}

export const DEFAULT_CLASS_GROUPS: ClassGroup[] = [
  { name: 'PEPE', pattern: 'PEPE', min: null, max: null },
  { name: 'Primária', pattern: null, min: 1, max: 6 },
  { name: 'Secundária', pattern: null, min: 7, max: 9 },
];

export const UNGROUPED_LABEL = 'Outras';

// Extrai o número da classe a partir do nome da turma (ex.: "10ª Classe A" → 10).
export function extractClassLevel(className: string): number | null {
  const match = (className || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Determina o grupo/nível de uma turma pelo nome, segundo a configuração.
// Grupos por "pattern" (ex.: PEPE) têm prioridade sobre os por intervalo.
export function classGroupName(className: string, groups: ClassGroup[]): string {
  const name = (className || '').toLowerCase();

  for (const g of groups) {
    if (g.pattern && name.includes(g.pattern.toLowerCase())) {
      return g.name;
    }
  }

  const level = extractClassLevel(className);
  if (level !== null) {
    for (const g of groups) {
      if (g.min != null && g.max != null && level >= g.min && level <= g.max) {
        return g.name;
      }
    }
  }

  return UNGROUPED_LABEL;
}
