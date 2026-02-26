import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Plus, Save, Trash2, GripVertical, Brain, X } from 'lucide-react';
import {
  useAllLessonPlanFields,
  useLessonPlanConfig,
  useLessonPlanMutations,
  type LessonPlanField,
} from '@/hooks/useLessonPlans';

export function LessonPlanAdminConfig() {
  const { data: fields } = useAllLessonPlanFields();
  const { data: configs } = useLessonPlanConfig();
  const { saveField, deleteField, saveConfig } = useLessonPlanMutations();

  // Prompt config state
  const [promptValue, setPromptValue] = useState('');
  const [modelValue, setModelValue] = useState('google/gemini-2.5-flash');
  const [tempValue, setTempValue] = useState('0.4');
  const [maxTokensValue, setMaxTokensValue] = useState('4000');

  useEffect(() => {
    if (configs) {
      const map = Object.fromEntries(configs.map(c => [c.config_key, c.config_value]));
      setPromptValue(map['system_prompt'] || '');
      setModelValue(map['model'] || 'google/gemini-2.5-flash');
      setTempValue(map['temperature'] || '0.4');
      setMaxTokensValue(map['max_tokens'] || '4000');
    }
  }, [configs]);

  const handleSavePrompt = () => {
    saveConfig.mutate({ key: 'system_prompt', value: promptValue });
  };

  const handleSaveModel = () => {
    saveConfig.mutate({ key: 'model', value: modelValue });
    saveConfig.mutate({ key: 'temperature', value: tempValue });
    saveConfig.mutate({ key: 'max_tokens', value: maxTokensValue });
  };

  return (
    <Tabs defaultValue="fields" className="space-y-4">
      <TabsList>
        <TabsTrigger value="fields">Campos do Formulário</TabsTrigger>
        <TabsTrigger value="prompt">Prompt da IA</TabsTrigger>
        <TabsTrigger value="model">Modelo & Parâmetros</TabsTrigger>
      </TabsList>

      <TabsContent value="fields">
        <FieldsManager fields={fields || []} saveField={saveField} deleteField={deleteField} />
      </TabsContent>

      <TabsContent value="prompt">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Prompt do Sistema (AEP)
            </CardTitle>
            <CardDescription>
              Configure as instruções que a IA segue para gerar os planos de aula. 
              Use placeholders e defina a estrutura obrigatória do plano AEP.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={promptValue}
              onChange={e => setPromptValue(e.target.value)}
              rows={16}
              className="font-mono text-sm"
              placeholder="Digite o prompt do sistema..."
            />
            <Button onClick={handleSavePrompt} disabled={saveConfig.isPending}>
              <Save className="mr-2 h-4 w-4" /> Guardar Prompt
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="model">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modelo de IA</Label>
              <Select value={modelValue} onValueChange={setModelValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Rápido)</SelectItem>
                  <SelectItem value="google/gemini-3-flash-preview">Gemini 3 Flash Preview</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Avançado)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperatura ({tempValue})</Label>
                <Input type="number" step="0.1" min="0" max="1" value={tempValue} onChange={e => setTempValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input type="number" step="500" min="1000" max="8000" value={maxTokensValue} onChange={e => setMaxTokensValue(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSaveModel} disabled={saveConfig.isPending}>
              <Save className="mr-2 h-4 w-4" /> Guardar Configurações
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function FieldsManager({
  fields,
  saveField,
  deleteField,
}: {
  fields: LessonPlanField[];
  saveField: any;
  deleteField: any;
}) {
  const [editingField, setEditingField] = useState<Partial<LessonPlanField> | null>(null);
  const [newOption, setNewOption] = useState('');

  const handleSave = () => {
    if (!editingField?.field_name || !editingField?.field_label) return;
    saveField.mutate(editingField, {
      onSuccess: () => setEditingField(null),
    });
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setEditingField(prev => ({
      ...prev,
      options: [...(prev?.options || []), newOption.trim()],
    }));
    setNewOption('');
  };

  const removeOption = (opt: string) => {
    setEditingField(prev => ({
      ...prev,
      options: (prev?.options || []).filter(o => o !== opt),
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Campos do Formulário AEP</CardTitle>
          <CardDescription>Configure os campos que o professor preenche para gerar o plano de aula.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingField({
              field_name: '',
              field_label: '',
              field_type: 'text',
              options: [],
              is_required: true,
              is_active: true,
              display_order: (fields?.length || 0) + 1,
            })}>
              <Plus className="mr-1 h-4 w-4" /> Novo Campo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingField?.id ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
            </DialogHeader>
            {editingField && (
              <FieldEditor
                field={editingField}
                onChange={setEditingField}
                onSave={handleSave}
                isSaving={saveField.isPending}
                newOption={newOption}
                setNewOption={setNewOption}
                addOption={addOption}
                removeOption={removeOption}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {fields.map(field => (
            <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{field.field_label}</p>
                  <p className="text-xs text-muted-foreground">
                    {field.field_type} • {field.field_name} • Ordem: {field.display_order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={field.is_active ? 'default' : 'outline'}>
                  {field.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setEditingField({ ...field })}>
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Editar Campo</DialogTitle>
                    </DialogHeader>
                    {editingField && editingField.id === field.id && (
                      <FieldEditor
                        field={editingField}
                        onChange={setEditingField}
                        onSave={handleSave}
                        isSaving={saveField.isPending}
                        newOption={newOption}
                        setNewOption={setNewOption}
                        addOption={addOption}
                        removeOption={removeOption}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => deleteField.mutate(field.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FieldEditor({
  field,
  onChange,
  onSave,
  isSaving,
  newOption,
  setNewOption,
  addOption,
  removeOption,
}: {
  field: Partial<LessonPlanField>;
  onChange: (f: Partial<LessonPlanField>) => void;
  onSave: () => void;
  isSaving: boolean;
  newOption: string;
  setNewOption: (v: string) => void;
  addOption: () => void;
  removeOption: (opt: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome interno (snake_case)</Label>
          <Input value={field.field_name || ''} onChange={e => onChange({ ...field, field_name: e.target.value })} placeholder="ex: principio" />
        </div>
        <div className="space-y-2">
          <Label>Label (visível)</Label>
          <Input value={field.field_label || ''} onChange={e => onChange({ ...field, field_label: e.target.value })} placeholder="ex: Princípio AEP" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={field.field_type || 'text'} onValueChange={v => onChange({ ...field, field_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="textarea">Texto longo</SelectItem>
              <SelectItem value="select">Seleção única</SelectItem>
              <SelectItem value="multiselect">Seleção múltipla</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ordem</Label>
          <Input type="number" value={field.display_order || 0} onChange={e => onChange({ ...field, display_order: Number(e.target.value) })} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={field.is_required ?? true} onCheckedChange={v => onChange({ ...field, is_required: v })} />
          <Label>Obrigatório</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={field.is_active ?? true} onCheckedChange={v => onChange({ ...field, is_active: v })} />
          <Label>Ativo</Label>
        </div>
      </div>

      {(field.field_type === 'select' || field.field_type === 'multiselect') && (
        <div className="space-y-2">
          <Label>Opções</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {field.options?.map(opt => (
              <Badge key={opt} variant="secondary" className="gap-1">
                {opt}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeOption(opt)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="Nova opção..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())} />
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button onClick={onSave} disabled={isSaving} className="w-full">
        <Save className="mr-2 h-4 w-4" /> Guardar Campo
      </Button>
    </div>
  );
}
