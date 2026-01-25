import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Settings2, ExternalLink, CheckCircle2, 
  XCircle, Loader2, TestTube, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationStatus {
  configured: boolean;
  lastTest?: Date;
  working?: boolean;
}

export function IntegrationsSection() {
  const [evolutionStatus, setEvolutionStatus] = useState<IntegrationStatus>({ configured: false });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestEvolution = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Test by calling the edge function with a simple ping
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'whatsapp',
          phone: '258840000000', // Test number
          message: 'Teste de conexão - SGE REVIVA',
          recipientName: 'Teste'
        }
      });

      if (error) {
        console.error('Evolution API test error:', error);
        setTestResult('error');
        toast.error('Falha na conexão', {
          description: error.message || 'Verifique as credenciais da Evolution API'
        });
      } else if (data?.error) {
        setTestResult('error');
        toast.error('Configuração inválida', {
          description: data.details || data.error
        });
      } else {
        setTestResult('success');
        setEvolutionStatus({ configured: true, lastTest: new Date(), working: true });
        toast.success('Conexão bem sucedida!', {
          description: 'A Evolution API está configurada correctamente'
        });
      }
    } catch (err) {
      console.error('Test error:', err);
      setTestResult('error');
      toast.error('Erro ao testar', {
        description: 'Não foi possível conectar à API'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <MessageSquare className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Configure APIs externas para mensagens automáticas</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Apenas Admin
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Evolution API Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-success" />
              </div>
              <div>
                <h4 className="font-medium">Evolution API</h4>
                <p className="text-xs text-muted-foreground">WhatsApp Business Unofficial</p>
              </div>
            </div>
            {testResult === 'success' ? (
              <Badge className="bg-success text-success-foreground gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Conectado
              </Badge>
            ) : testResult === 'error' ? (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" />
                Erro
              </Badge>
            ) : (
              <Badge variant="secondary">Não testado</Badge>
            )}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              As credenciais da Evolution API são configuradas nos <strong>Secrets do Supabase</strong> por segurança.
              Configure <code className="bg-muted px-1 rounded">EVOLUTION_API_URL</code> e <code className="bg-muted px-1 rounded">EVOLUTION_API_KEY</code>.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">URL da API</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value="EVOLUTION_API_URL" 
                  disabled 
                  className="font-mono text-xs bg-muted"
                />
                <Badge variant="outline" className="shrink-0">Secret</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Chave da API</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value="EVOLUTION_API_KEY" 
                  disabled 
                  className="font-mono text-xs bg-muted"
                  type="password"
                />
                <Badge variant="outline" className="shrink-0">Secret</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nome da Instância</Label>
            <Input 
              value="SGE-REVIVA" 
              disabled 
              className="font-mono text-xs bg-muted max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              A instância deve estar criada e conectada na Evolution API
            </p>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleTestEvolution}
              disabled={testing}
              variant="outline"
              className="gap-2"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              {testing ? 'A testar...' : 'Testar Conexão'}
            </Button>
            
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={() => window.open('https://supabase.com/dashboard/project/ryaiyvsklusqmvudpujv/settings/functions', '_blank')}
            >
              <Settings2 className="w-4 h-4" />
              Configurar Secrets
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* SMS Gateway - Future */}
        <div className="space-y-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Gateway SMS</h4>
                <p className="text-xs text-muted-foreground">Twilio / Vonage / Local</p>
              </div>
            </div>
            <Badge variant="secondary">Em breve</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Integração com gateway de SMS para envio de mensagens de texto. 
            Útil para encarregados que não utilizam WhatsApp.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
