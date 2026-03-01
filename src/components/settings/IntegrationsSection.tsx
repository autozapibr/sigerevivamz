import React, { useState } from 'react';
import { 
  MessageSquare, CheckCircle2, XCircle, Loader2, 
  TestTube, Info, Save, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useIntegrationSettings } from '@/hooks/useIntegrationSettings';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function IntegrationsSection() {
  const { settings, isLoading, updateSetting, testConnection, getIntegration } = useIntegrationSettings();
  
  const [evolutionInstance, setEvolutionInstance] = useState('');
  const [hasUnsavedEvolution, setHasUnsavedEvolution] = useState(false);

  React.useEffect(() => {
    const evolution = getIntegration('evolution_api');
    if (evolution) {
      setEvolutionInstance(evolution.instance_name || 'SGE-REVIVA');
    }
  }, [settings]);

  const evolution = getIntegration('evolution_api');

  const handleSaveEvolution = () => {
    updateSetting.mutate({
      integrationName: 'evolution_api',
      updates: {
        instance_name: evolutionInstance,
      },
    });
    setHasUnsavedEvolution(false);
  };

  const renderStatusBadge = (setting: typeof evolution) => {
    if (!setting) return <Badge variant="secondary">Não configurado</Badge>;
    
    if (setting.last_test_success === true) {
      return (
        <Badge className="bg-success text-success-foreground gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Conectado
        </Badge>
      );
    }
    
    if (setting.last_test_success === false) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Erro
        </Badge>
      );
    }
    
    return <Badge variant="outline">Pendente</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <MessageSquare className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Configure APIs externas para mensagens e comunicação</CardDescription>
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
            {renderStatusBadge(evolution)}
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              As credenciais sensíveis (URL e Chave da API) são geridas de forma segura nos{' '}
              <strong>Supabase Secrets</strong>. Apenas o nome da instância é configurável aqui.
              Para alterar a URL ou chave, aceda ao painel Supabase &gt; Settings &gt; Edge Functions &gt; Secrets.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="evolution-instance">Nome da Instância</Label>
              <Input 
                id="evolution-instance"
                placeholder="SGE-REVIVA"
                value={evolutionInstance}
                onChange={(e) => {
                  setEvolutionInstance(e.target.value);
                  setHasUnsavedEvolution(true);
                }}
              />
              <p className="text-xs text-muted-foreground">
                A instância deve estar criada e conectada na Evolution API
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSaveEvolution}
              disabled={updateSetting.isPending || !hasUnsavedEvolution}
              className="gap-2"
            >
              {updateSetting.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar
            </Button>
            
            <Button 
              onClick={() => testConnection.mutate('evolution_api')}
              disabled={testConnection.isPending}
              variant="outline"
              className="gap-2"
            >
              {testConnection.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Testar Conexão
            </Button>
          </div>
        </div>

        <Separator />

        {/* SMS Gateway - Future */}
        <div className="space-y-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
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
