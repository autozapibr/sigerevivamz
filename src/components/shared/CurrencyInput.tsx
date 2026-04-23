import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMZN } from '@/lib/validators/mozambique';

interface CurrencyInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Extrai apenas dígitos e vírgula de uma string,
 * retornando o valor numérico normalizado (ponto decimal) para o banco.
 * Formato de exibição: padrão moçambicano (1.234,56)
 */
function parseToRaw(display: string): string {
  // Remove tudo excepto dígitos e vírgula
  const clean = display.replace(/[^\d,]/g, '');
  // Separa parte inteira e decimal pela vírgula
  const parts = clean.split(',');
  const intPart = parts[0] || '0';
  const decPart = parts.length > 1 ? parts[1].slice(0, 2) : '';
  if (!decPart) return intPart;
  return `${intPart}.${decPart}`;
}

function formatDisplay(raw: string): string {
  // raw is the user's typed digits + optional comma
  // Remove tudo excepto dígitos e vírgula
  let clean = raw.replace(/[^\d,]/g, '');

  // Permitir apenas uma vírgula
  const commaIdx = clean.indexOf(',');
  if (commaIdx !== -1) {
    const before = clean.slice(0, commaIdx).replace(/,/g, '');
    const after = clean.slice(commaIdx + 1).replace(/,/g, '').slice(0, 2);
    clean = before + ',' + after;
  }

  // Separar inteira e decimal
  const parts = clean.split(',');
  let intPart = parts[0].replace(/^0+(?=\d)/, '') || '0';

  // Adicionar pontos de milhar
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (parts.length > 1) {
    return intPart + ',' + parts[1];
  }
  return intPart;
}

export function CurrencyInput({
  label = 'Valor',
  value,
  onChange,
  error,
  disabled = false,
  placeholder = '0,00',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync from external value when not focused
  React.useEffect(() => {
    if (isFocused) return;
    const num = parseFloat(String(value));
    if (!isNaN(num) && num > 0) {
      // Convert 1234.56 -> "1.234,56"
      const [intStr, decStr] = num.toFixed(2).split('.');
      const intFormatted = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setDisplayValue(intFormatted + ',' + decStr);
    } else if (String(value) === '' || String(value) === '0') {
      setDisplayValue('');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatDisplay(raw);
    setDisplayValue(formatted);

    // Enviar valor normalizado (ponto decimal) para o form
    const normalized = parseToRaw(raw);
    onChange(normalized);
  };

  const handleFocus = () => setIsFocused(true);

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(parseToRaw(displayValue));
    if (!isNaN(num) && num > 0) {
      const [intStr, decStr] = num.toFixed(2).split('.');
      const intFormatted = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setDisplayValue(intFormatted + ',' + decStr);
      onChange(num.toFixed(2));
    } else {
      setDisplayValue('');
      onChange('');
    }
  };

  const numericValue = parseFloat(String(value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {!isNaN(numericValue) && numericValue > 0 && (
          <span className="text-sm font-semibold text-green-600">
            {formatMZN(numericValue)}
          </span>
        )}
      </div>
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          MT
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`pl-12 ${error ? 'border-destructive' : ''}`}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
