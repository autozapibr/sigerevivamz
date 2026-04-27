import React, { useState, useEffect } from 'react';
import {
  Brain, Save, Loader2, Info, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useIntegrationSettings } from '@/hooks/useIntegrationSettings';
import { useLessonPlanConfig, useLessonPlanMutations } from '@/hooks/useLessonPlans';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';

const LLM_PROVIDERS = [
  {
    id: 'lovable_ai',
    name: 'Lovable AI Gateway',
    description: 'Gateway integrado (Gemini + OpenAI). Chave pré-configurada automaticamente.',
    requiresKey: false,
    models: [
      { value: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro Preview' },
      { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Recomendado)' },
      { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
      { value: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'openai/gpt-5', label: 'GPT-5 (Premium)' },
      { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini (Equilibrado)' },
      { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano (Económico)' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI (Directo)',
    description: 'Conecte directamente à API da OpenAI com a sua chave.',
    requiresKey: true,
    keyPlaceholder: 'sk-...',
    models: [
      { value: 'gpt-5', label: 'GPT-5' },
      { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
  },
  {
    id: 'google',
    name: 'Google AI Studio (Gemini)',
    description: 'Conecte directamente à API do Google AI Studio.',
    requiresKey: true,
    keyPlaceholder: 'AIzaSy...',
    models: [
      { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (Directo)',
    description: 'Conecte directamente à API da DeepSeek (alternativa económica e potente).',
    requiresKey: true,
    keyPlaceholder: 'sk-...',
    models: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat (V3 — Recomendado)' },
      { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (R1 — Raciocínio profundo)' },
    ],
  },
];

export function LLMConfigSection() {
  const { isLoading } = useIntegrationSettings();
  const { data: lessonConfigs } = useLessonPlanConfig();
  const { saveConfig } = useLessonPlanMutations();

  const [selectedProvider, setSelectedProvider] = useState('lovable_ai');
  const [selectedModel, setSelectedModel] = useState('google/gemini-3-flash-preview');
  const [tempValue, setTempValue] = useState('0.4');
  const [maxTokensValue, setMaxTokensValue] = useState('4000');
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Load existing config
  useEffect(() => {
    if (lessonConfigs) {
      const map = Object.fromEntries(lessonConfigs.map(c => [c.config_key, c.config_value]));
      const savedModel = map['model'] || 'google/gemini-3-flash-preview';
      setSelectedModel(savedModel);
      setTempValue(map['temperature'] || '0.4');
      setMaxTokensValue(map['max_tokens'] || '4000');

      // Determine provider from model
      const savedProvider = map['llm_provider'] || 'lovable_ai';
      setSelectedProvider(savedProvider);
    }
  }, [lessonConfigs]);

  // API keys are now managed via Supabase Secrets, not DB

  const currentProvider = LLM_PROVIDERS.find(p => p.id === selectedProvider);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = LLM_PROVIDERS.find(p => p.id === providerId);
    if (provider?.models.length) {
      setSelectedModel(provider.models[0].value);
    }
    setHasUnsaved(true);
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    saveConfig.mutate({ key: 'llm_provider', value: selectedProvider });
    saveConfig.mutate({ key: 'model', value: selectedModel });
    saveConfig.mutate({ key: 'temperature', value: tempValue });
    saveConfig.mutate({ key: 'max_tokens', value: maxTokensValue });

    setHasUnsaved(false);
    toast.success('Configurações de IA guardadas!');
  };

  if (isLoading) {
    return <Card><CardContent className="py-8"><LoadingSpinner /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>Inteligência Artificial (LLM)</CardTitle>
            <CardDescription>
              Configure o provedor de IA usado para gerar planos de aula, contratos e outras funcionalidades
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">Apenas Admin</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Provedor de IA</Label>
          <RadioGroup value={selectedProvider} onValueChange={handleProviderChange} className="space-y-3">
            {LLM_PROVIDERS.map(provider => (
              <label
                key={provider.id}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedProvider === provider.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'hover:border-primary/40'
                }`}
              >
                <RadioGroupItem value={provider.id} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider.name}</span>
                    {provider.id === 'lovable_ai' && (
                      <Badge className="text-xs bg-primary/10 text-primary border-0">Recomendado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* API Key notice for external providers */}
        {currentProvider?.requiresKey && (
          <>
            <Separator />
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                As chaves da API ({currentProvider.name}) são geridas de forma segura nos{' '}
                <strong>Supabase Secrets</strong> (OPENAI_API_KEY / GOOGLE_AI_KEY / DEEPSEEK_API_KEY).
                Para alterar, aceda ao painel Supabase &gt; Settings &gt; Edge Functions &gt; Secrets.
              </AlertDescription>
            </Alert>
          </>
        )}

        {currentProvider?.id === 'lovable_ai' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              O Lovable AI Gateway já está configurado automaticamente. Não é necessário inserir chaves de API.
              Suporta modelos Gemini e GPT-5.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Model Selection */}
        <div className="space-y-3">
          <Label>Modelo de IA</Label>
          <Select value={selectedModel} onValueChange={v => { setSelectedModel(v); setHasUnsaved(true); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentProvider?.models.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced params */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Temperatura ({tempValue})</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={tempValue}
              onChange={e => { setTempValue(e.target.value); setHasUnsaved(true); }}
            />
            <p className="text-xs text-muted-foreground">0 = determinístico, 1 = criativo</p>
          </div>
          <div className="space-y-2">
            <Label>Max Tokens</Label>
            <Input
              type="number"
              step="500"
              min="1000"
              max="16000"
              value={maxTokensValue}
              onChange={e => { setMaxTokensValue(e.target.value); setHasUnsaved(true); }}
            />
            <p className="text-xs text-muted-foreground">Tamanho máximo da resposta</p>
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saveConfig.isPending || !hasUnsaved} className="gap-2">
            {saveConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Configurações de IA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
