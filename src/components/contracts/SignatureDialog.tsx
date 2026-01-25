import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SignaturePad } from './SignaturePad';
import { StaffContractData } from './ContractTemplates';
import { MozambiqueInput } from '@/components/shared/MozambiqueInput';
import { 
  PenTool, 
  Send, 
  Mail, 
  MessageCircle, 
  Link2, 
  Copy, 
  Check,
  Clock,
  Loader2,
  FileSignature,
} from 'lucide-react';

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffData: StaffContractData | null;
  templateId: string;
  contractHTML: string;
  onSignatureComplete: () => void;
}

export function SignatureDialog({
  open,
  onOpenChange,
  staffData,
  templateId,
  contractHTML,
  onSignatureComplete,
}: SignatureDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'direct' | 'remote'>('direct');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(staffData?.email || '');
  const [recipientPhone, setRecipientPhone] = useState(staffData?.phone || '');
  const [expiryDays, setExpiryDays] = useState(7);

  if (!staffData) return null;

  const createSignatureRequest = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + expiryDays);

      const { data, error } = await supabase
        .from('contract_signatures')
        .insert({
          staff_id: staffData.id,
          staff_type: staffData.staff_type,
          staff_name: staffData.name,
          contract_type: templateId,
          contract_number: staffData.contract_number,
          contract_html: contractHTML,
          token_expires_at: tokenExpiry.toISOString(),
          status: 'pending',
          created_by: userData?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      // Log error only in development mode
      if (import.meta.env.DEV) {
        console.error('Error creating signature request:', error);
      }
      throw error;
    }
  };

  const handleDirectSign = async () => {
    if (!signatureData) {
      toast({
        title: 'Assinatura em falta',
        description: 'Por favor, desenhe a sua assinatura antes de confirmar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSigning(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('contract_signatures')
        .insert({
          staff_id: staffData.id,
          staff_type: staffData.staff_type,
          staff_name: staffData.name,
          contract_type: templateId,
          contract_number: staffData.contract_number,
          contract_html: contractHTML,
          signature_data: signatureData,
          signature_ip: 'local',
          signature_user_agent: navigator.userAgent,
          signed_at: new Date().toISOString(),
          status: 'signed',
          sent_via: 'direct',
          created_by: userData?.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Contrato assinado!',
        description: `O contrato de ${staffData.name} foi assinado com sucesso.`,
      });

      onSignatureComplete();
      onOpenChange(false);
    } catch (error: any) {
      // Log error only in development mode
      if (import.meta.env.DEV) {
        console.error('Error signing contract:', error);
      }
      toast({
        title: 'Erro ao assinar',
        description: error.message || 'Não foi possível gravar a assinatura.',
        variant: 'destructive',
      });
    } finally {
      setIsSigning(false);
    }
  };

  const generateSignatureLink = async () => {
    setIsSending(true);
    try {
      const sigRequest = await createSignatureRequest();
      
      // Gerar o link público para assinatura
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/assinar/${sigRequest.signature_token}`;
      setSignatureLink(link);

      toast({
        title: 'Link gerado',
        description: 'O link de assinatura foi criado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link de assinatura.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    if (signatureLink) {
      navigator.clipboard.writeText(signatureLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    }
  };

  const handleSendWhatsApp = async () => {
    if (!signatureLink) {
      await generateSignatureLink();
    }
    
    const phone = recipientPhone.replace(/\D/g, '');
    if (!phone) {
      toast({
        title: 'Número em falta',
        description: 'Por favor, insira o número de telefone.',
        variant: 'destructive',
      });
      return;
    }

    // Actualizar o registo com informação de envio
    if (signatureLink) {
      const token = signatureLink.split('/').pop();
      await supabase
        .from('contract_signatures')
        .update({
          status: 'sent',
          sent_via: 'whatsapp',
          sent_to: phone,
          sent_at: new Date().toISOString(),
        })
        .eq('signature_token', token);
    }

    const message = encodeURIComponent(
      `Olá ${staffData.name},\n\n` +
      `A Escola Reviva solicita a sua assinatura digital no contrato.\n\n` +
      `📝 Tipo: ${templateId.replace('_', ' ')}\n` +
      `📄 Nº: ${staffData.contract_number || 'A definir'}\n\n` +
      `Por favor, aceda ao link abaixo para assinar:\n${signatureLink}\n\n` +
      `⏰ Este link expira em ${expiryDays} dias.\n\n` +
      `Atenciosamente,\nEscola Reviva`
    );

    window.open(`https://wa.me/258${phone}?text=${message}`, '_blank');
    
    toast({
      title: 'WhatsApp aberto',
      description: 'A mensagem está pronta para ser enviada.',
    });
  };

  const handleSendEmail = async () => {
    if (!signatureLink) {
      await generateSignatureLink();
    }

    if (!recipientEmail) {
      toast({
        title: 'E-mail em falta',
        description: 'Por favor, insira o endereço de e-mail.',
        variant: 'destructive',
      });
      return;
    }

    // Actualizar o registo com informação de envio
    if (signatureLink) {
      const token = signatureLink.split('/').pop();
      await supabase
        .from('contract_signatures')
        .update({
          status: 'sent',
          sent_via: 'email',
          sent_to: recipientEmail,
          sent_at: new Date().toISOString(),
        })
        .eq('signature_token', token);
    }

    const subject = encodeURIComponent('Assinatura Digital - Contrato Escola Reviva');
    const body = encodeURIComponent(
      `Prezado(a) ${staffData.name},\n\n` +
      `A Escola Reviva solicita a sua assinatura digital no seguinte contrato:\n\n` +
      `📝 Tipo de Contrato: ${templateId.replace('_', ' ')}\n` +
      `📄 Número do Contrato: ${staffData.contract_number || 'A definir'}\n\n` +
      `Por favor, aceda ao link abaixo para visualizar e assinar o documento:\n\n` +
      `${signatureLink}\n\n` +
      `⏰ Atenção: Este link expira em ${expiryDays} dias.\n\n` +
      `Se tiver dúvidas, contacte a secretaria da escola.\n\n` +
      `Atenciosamente,\n` +
      `Escola Reviva\n` +
      `Recursos Humanos`
    );

    window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: 'E-mail preparado',
      description: 'O seu cliente de e-mail foi aberto.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            Assinatura Digital
          </DialogTitle>
          <DialogDescription>
            Assinar contrato de <strong>{staffData.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'direct' | 'remote')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="gap-2">
              <PenTool className="w-4 h-4" />
              Assinatura Directa
            </TabsTrigger>
            <TabsTrigger value="remote" className="gap-2">
              <Send className="w-4 h-4" />
              Enviar Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              O colaborador pode assinar directamente no ecrã abaixo:
            </div>
            
            <SignaturePad
              onSignatureChange={setSignatureData}
              disabled={isSigning}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleDirectSign} 
                disabled={!signatureData || isSigning}
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A gravar...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Assinatura
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="remote" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Configurações do Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="colaborador@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                    <MozambiqueInput
                      id="phone"
                      mask="PHONE"
                      value={recipientPhone}
                      onChange={(value) => setRecipientPhone(value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry">Validade do link (dias)</Label>
                  <Input
                    id="expiry"
                    type="number"
                    min={1}
                    max={30}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>

            {signatureLink && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Link de Assinatura:</span>
                    <Badge variant="outline" className="text-xs">
                      Expira em {expiryDays} dias
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={signatureLink}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                onClick={generateSignatureLink}
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                Gerar Link
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSendWhatsApp}
                disabled={isSending}
                className="text-emerald-600 dark:text-emerald-400"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSendEmail}
                disabled={isSending}
                className="text-primary"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar E-mail
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
