import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MASKS } from '@/lib/validators/mozambique';

type InputMask = 'BI' | 'NUIT' | 'PHONE' | 'POSTAL_CODE';

interface MozambiqueInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  mask: InputMask;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MozambiqueInput({
  label,
  mask,
  value,
  onChange,
  error,
  ...props
}: MozambiqueInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = MASKS[mask](rawValue);
    onChange(maskedValue);
  };

  const placeholders: Record<InputMask, string> = {
    BI: '##### ##### ###',
    NUIT: '#########X',
    PHONE: '+258 ## ### ####',
    POSTAL_CODE: '####',
  };

  const isPhone = mask === 'PHONE';

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          {...props}
          value={value}
          onChange={handleChange}
          placeholder={props.placeholder || placeholders[mask]}
          className={`${error ? 'border-destructive' : ''} ${isPhone ? 'pr-10' : ''}`}
        />
        {isPhone && (
          <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success pointer-events-none" />
        )}
      </div>
      {isPhone && value && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-success" />
          Formato compatível com WhatsApp
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
