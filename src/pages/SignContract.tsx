import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SignaturePad } from '@/components/contracts/SignaturePad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  FileSignature, 
  Check, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface SignatureRequest {
  id: number;
  staff_name: string;
  contract_type: string;
  contract_number: string | null;
  contract_html: string;
  status: string;
  token_expires_at: string | null;
  signature_token: string;
}

export default function SignContract() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [signatureRequest, setSignatureRequest] = useState<SignatureRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const fetchSignatureRequest = async () => {
      if (!token) {
        setError('Token de assinatura inválido.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('contract_signatures')
          .select('*')
          .eq('signature_token', token)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Pedido de assinatura não encontrado.');
          return;
        }

        // Verificar se já foi assinado
        if (data.status === 'signed') {
          setError('Este contrato já foi assinado.');
          return;
        }

        // Verificar se expirou
        if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
          setError('O link de assinatura expirou. Por favor, solicite um novo link.');
          return;
        }

        // Verificar se foi cancelado
        if (data.status === 'cancelled' || data.status === 'expired') {
          setError('Este pedido de assinatura foi cancelado ou expirou.');
          return;
        }

        setSignatureRequest(data);
      } catch (err: any) {
        console.error('Error fetching signature request:', err);
        setError('Não foi possível carregar o contrato. Verifique o link e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchSignatureRequest();
  }, [token]);

  const handleSign = async () => {
    if (!signatureData || !signatureRequest) {
      return;
    }

    setIsSigning(true);
    try {
      const { error: updateError } = await supabase
        .from('contract_signatures')
        .update({
          signature_data: signatureData,
          signature_ip: 'remote',
          signature_user_agent: navigator.userAgent,
          signed_at: new Date().toISOString(),
          status: 'signed',
        })
        .eq('signature_token', token);

      if (updateError) throw updateError;

      setSigned(true);
    } catch (err: any) {
      console.error('Error signing contract:', err);
      setError('Não foi possível gravar a assinatura. Por favor, tente novamente.');
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <LoadingSpinner />
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Contrato Assinado!
            </h2>
            <p className="text-muted-foreground">
              A sua assinatura foi registada com sucesso. A Escola Reviva irá contactá-lo em breve.
            </p>
            <Button
              variant="outline"
              onClick={() => window.close()}
              className="mt-4"
            >
              Fechar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Não foi possível carregar
            </h2>
            <p className="text-muted-foreground">
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!signatureRequest) {
    return null;
  }

  const expiresAt = signatureRequest.token_expires_at 
    ? new Date(signatureRequest.token_expires_at)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Building2 className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Escola Reviva</h1>
          </div>
          <p className="text-muted-foreground">
            Sistema de Assinatura Digital de Contratos
          </p>
        </div>

        {/* Contract Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Assinatura de Contrato
                </CardTitle>
                <CardDescription className="mt-1">
                  Contrato para: <strong>{signatureRequest.staff_name}</strong>
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary">
                  {signatureRequest.contract_type.replace('_', ' ')}
                </Badge>
                {signatureRequest.contract_number && (
                  <span className="text-xs text-muted-foreground">
                    Nº {signatureRequest.contract_number}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {expiresAt && (
              <Alert className="mb-4">
                <Clock className="h-4 w-4" />
                <AlertTitle>Prazo de Assinatura</AlertTitle>
                <AlertDescription>
                  Este link expira em: {expiresAt.toLocaleDateString('pt-MZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </AlertDescription>
              </Alert>
            )}

            {/* Contract Preview */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Leia o contrato com atenção antes de assinar:
              </h3>
              <div 
                className="bg-white rounded-lg border shadow-inner p-6 max-h-96 overflow-y-auto text-black"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
                dangerouslySetInnerHTML={{ __html: signatureRequest.contract_html }}
              />
            </div>

            {/* Signature Area */}
            <div className="space-y-4">
              <h3 className="font-medium">A sua assinatura:</h3>
              <SignaturePad
                onSignatureChange={setSignatureData}
                disabled={isSigning}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.close()}
                  disabled={isSigning}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={!signatureData || isSigning}
                  size="lg"
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Assinar Contrato
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao assinar este documento, concorda com os termos e condições estabelecidos no contrato.
          <br />
          © {new Date().getFullYear()} Escola Reviva - Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
