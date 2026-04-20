import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MASKS } from '@/lib/validators/mozambique';

type InputMask = 'BI' | 'NUIT' | 'PHONE' | 'POSTAL_CODE';

interface MozambiqueInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  mask: InputMask;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  // Para PHONE: mostrar checkbox "É WhatsApp?"
  showWhatsappToggle?: boolean;
  isWhatsapp?: boolean;
  onWhatsappChange?: (checked: boolean) => void;
}

export function MozambiqueInput({
  label,
  mask,
  value,
  onChange,
  error,
  showWhatsappToggle,
  isWhatsapp,
  onWhatsappChange,
  ...props
}: MozambiqueInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = MASKS[mask](rawValue);
    onChange(maskedValue);
  };

  const placeholders: Record<InputMask, string> = {
    BI: 'Ex: 110100123456A',
    NUIT: 'Ex: 123456789 ou outro documento',
    PHONE: '+258 ## ### ####',
    POSTAL_CODE: '####',
  };

  const isPhone = mask === 'PHONE';
  const showWhatsappIcon = isPhone && (isWhatsapp ?? true);

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
        {showWhatsappIcon && (
          <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success pointer-events-none" />
        )}
      </div>

      {isPhone && showWhatsappToggle && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${props.id || mask}-whatsapp`}
            checked={!!isWhatsapp}
            onCheckedChange={(checked) => onWhatsappChange?.(!!checked)}
          />
          <Label
            htmlFor={`${props.id || mask}-whatsapp`}
            className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer font-normal"
          >
            <MessageSquare className="h-3 w-3 text-success" />
            Este número tem WhatsApp
          </Label>
        </div>
      )}

      {isPhone && !showWhatsappToggle && value && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-success" />
          Formato compatível com WhatsApp
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
