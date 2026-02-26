import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useLessonPlanFields, type LessonPlanField } from '@/hooks/useLessonPlans';
import { useClasses, useSubjects } from '@/hooks/useGrades';

interface LessonPlanFormProps {
  onGenerate: (formData: Record<string, any>, classId?: number, subjectId?: number, className?: string, subjectName?: string) => void;
  isGenerating: boolean;
}

export function LessonPlanForm({ onGenerate, isGenerating }: LessonPlanFormProps) {
  const { data: fields, isLoading: fieldsLoading } = useLessonPlanFields();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  
  const [classId, setClassId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleMultiSelectToggle = (fieldName: string, option: string, maxSelections?: number) => {
    const current = (formValues[fieldName] as string[]) || [];
    if (current.includes(option)) {
      handleFieldChange(fieldName, current.filter(o => o !== option));
    } else {
      if (maxSelections && current.length >= maxSelections) {
        toast.error(`Máximo de ${maxSelections} selecções permitidas.`);
        return;
      }
      handleFieldChange(fieldName, [...current, option]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate principio field (exactly 2)
    const principioField = fields?.find(f => f.field_name === 'principio');
    if (principioField) {
      const selected = (formValues['principio'] as string[]) || [];
      if (selected.length !== 2) {
        toast.error('Selecione exactamente 2 Princípios da AEP.');
        return;
      }
    }

    // Validate multiselect fields with minimum selections (ferramentas)
    const ferramentasField = fields?.find(f => f.field_name === 'ferramentas_aep');
    if (ferramentasField) {
      const selected = (formValues['ferramentas_aep'] as string[]) || [];
      if (selected.length < 2) {
        toast.error('Selecione pelo menos 2 Ferramentas AEP.');
        return;
      }
    }

    // Validate required text fields
    const requiredFields = fields?.filter(f => f.is_required && f.field_type !== 'multiselect') || [];
    for (const f of requiredFields) {
      const val = formValues[f.field_name];
      if (!val || (typeof val === 'string' && !val.trim())) {
        toast.error(`O campo "${f.field_label}" é obrigatório.`);
        return;
      }
    }

    const selectedClass = classes?.find(c => c.id === Number(classId));
    const selectedSubject = subjects?.find(s => s.id === Number(subjectId));
    
    // Build form data with labels
    const labeledData: Record<string, any> = {};
    fields?.forEach(f => {
      if (formValues[f.field_name] !== undefined && formValues[f.field_name] !== '') {
        labeledData[f.field_label] = formValues[f.field_name];
      }
    });

    onGenerate(
      labeledData,
      classId ? Number(classId) : undefined,
      subjectId ? Number(subjectId) : undefined,
      selectedClass?.name,
      selectedSubject?.name
    );
  };

  const getMultiSelectConfig = (fieldName: string) => {
    if (fieldName === 'principio') return { min: 2, max: 2, hint: 'Selecione exactamente 2 princípios' };
    if (fieldName === 'ferramentas_aep') return { min: 2, max: undefined, hint: 'Selecione pelo menos 2 ferramentas' };
    return { min: 1, max: undefined, hint: '' };
  };

  const renderField = (field: LessonPlanField) => {
    const value = formValues[field.field_name];

    if (field.field_type === 'select' && field.options?.length > 0) {
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
          <Select value={value || ''} onValueChange={v => handleFieldChange(field.field_name, v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${field.field_label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
              <SelectItem value="__outro__">Outro (digitar)</SelectItem>
            </SelectContent>
          </Select>
          {value === '__outro__' && (
            <Input
              placeholder="Digite aqui..."
              onChange={e => handleFieldChange(field.field_name, e.target.value)}
            />
          )}
        </div>
      );
    }

    if (field.field_type === 'multiselect' && field.options?.length > 0) {
      const selected = (value as string[]) || [];
      const config = getMultiSelectConfig(field.field_name);
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            {config.hint}
          </p>
          <div className="flex flex-wrap gap-2">
            {field.options.map(opt => (
              <Badge
                key={opt}
                variant={selected.includes(opt) ? 'default' : 'outline'}
                className="cursor-pointer select-none text-xs py-1.5 px-3"
                onClick={() => handleMultiSelectToggle(field.field_name, opt, config.max)}
              >
                {opt}
                {selected.includes(opt) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selected.length} selecionada(s)
              {config.max && ` de ${config.max}`}
            </p>
          )}
        </div>
      );
    }

    if (field.field_type === 'textarea') {
      return (
        <div key={field.id} className="space-y-2">
          <Label>
            {field.field_label} {field.is_required && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            value={value || ''}
            onChange={e => handleFieldChange(field.field_name, e.target.value)}
            placeholder={getPlaceholder(field.field_name)}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div key={field.id} className="space-y-2">
        <Label>{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
        <Input
          value={value || ''}
          onChange={e => handleFieldChange(field.field_name, e.target.value)}
          placeholder={`Digite ${field.field_label.toLowerCase()}...`}
        />
      </div>
    );
  };

  if (fieldsLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando campos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gerar Plano de Aula AEP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe/Turma <span className="text-destructive">*</span></Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disciplina <span className="text-destructive">*</span></Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fields?.map(renderField)}

          <Button type="submit" disabled={isGenerating || !classId || !subjectId} className="w-full">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando plano de aula...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Gerar Plano de Aula com IA</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function getPlaceholder(fieldName: string): string {
  switch (fieldName) {
    case 'ideia_guia':
      return 'Ex: "A mordomia nos ensina a cuidar dos recursos naturais..." (deixe em branco para a IA sugerir 3 opções)';
    case 'palavras_chave':
      return 'Ex: Ecossistema, Fotossíntese, Mordomia, Criação (2 académicas + 2 bíblicas)';
    case 'versiculos_biblicos':
      return 'Ex: Génesis 2:15 (AT) e Colossenses 1:16-17 (NT) — deixe em branco para a IA sugerir';
    case 'objetivos_competencias':
      return 'Ex: Compreender o ciclo da água e relacionar com o princípio da mordomia...';
    default:
      return `Digite aqui...`;
  }
}
