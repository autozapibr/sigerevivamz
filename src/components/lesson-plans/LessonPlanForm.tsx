import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';
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

  const handleMultiSelectToggle = (fieldName: string, option: string) => {
    const current = (formValues[fieldName] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    handleFieldChange(fieldName, updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate multiselect fields with minimum selections
    const multiselectFields = fields?.filter(f => f.field_type === 'multiselect') || [];
    for (const f of multiselectFields) {
      const selected = (formValues[f.field_name] as string[]) || [];
      if (f.is_required && selected.length < 2) {
        toast.error(`Selecione pelo menos 2 opções em "${f.field_label}".`);
        return;
      }
    }

    const selectedClass = classes?.find(c => c.id === Number(classId));
    const selectedSubject = subjects?.find(s => s.id === Number(subjectId));
    
    // Build form data with labels
    const labeledData: Record<string, any> = {};
    fields?.forEach(f => {
      if (formValues[f.field_name] !== undefined) {
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
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
          <p className="text-xs text-muted-foreground">Selecione pelo menos 2 ferramentas</p>
          <div className="flex flex-wrap gap-2">
            {field.options.map(opt => (
              <Badge
                key={opt}
                variant={selected.includes(opt) ? 'default' : 'outline'}
                className="cursor-pointer select-none text-xs"
                onClick={() => handleMultiSelectToggle(field.field_name, opt)}
              >
                {opt}
                {selected.includes(opt) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="text-xs text-muted-foreground">{selected.length} ferramenta(s) selecionada(s)</p>
          )}
        </div>
      );
    }

    if (field.field_type === 'textarea') {
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
          <Textarea
            value={value || ''}
            onChange={e => handleFieldChange(field.field_name, e.target.value)}
            placeholder={`Digite ${field.field_label.toLowerCase()}...`}
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
