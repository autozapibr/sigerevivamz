import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eraser, Check, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void;
  initialSignature?: string;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function SignaturePad({
  onSignatureChange,
  initialSignature,
  disabled = false,
  width = 500,
  height = 200,
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (initialSignature && sigCanvas.current) {
      sigCanvas.current.fromDataURL(initialSignature);
      setIsEmpty(false);
    }
  }, [initialSignature]);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      onSignatureChange(null);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      setIsEmpty(sigCanvas.current.isEmpty());
      onSignatureChange(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30">
      <CardContent className="p-4 space-y-3">
        <div className="text-sm text-muted-foreground text-center mb-2">
          Desenhe a sua assinatura abaixo
        </div>
        
        <div 
          className={`relative bg-white rounded-lg overflow-hidden mx-auto ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ width: Math.min(width, 500), height }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            penColor="#1a1a1a"
            canvasProps={{
              width: Math.min(width, 500),
              height,
              className: 'signature-canvas cursor-crosshair',
              style: {
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                touchAction: 'none',
              },
            }}
            onEnd={handleEnd}
          />
          
          {/* Linha guia */}
          <div 
            className="absolute bottom-8 left-8 right-8 border-b border-dashed border-gray-300 pointer-events-none"
          />
        </div>

        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled || isEmpty}
          >
            <Eraser className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => sigCanvas.current?.fromDataURL(initialSignature || '')}
            disabled={disabled || !initialSignature}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={disabled || isEmpty}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
