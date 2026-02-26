import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Sparkles, X, Info, BookOpen, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useLessonPlanFields, type LessonPlanField } from '@/hooks/useLessonPlans';
import { useClasses, useSubjects } from '@/hooks/useGrades';
import { supabase } from '@/integrations/supabase/client';

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
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

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

  // AI helper to suggest Bible verses
  const handleAiSuggestVerses = useCallback(async () => {
    const tema = formValues['tema_aula'] || '';
    const principios = (formValues['principio'] as string[]) || [];
    const palavras = formValues['palavras_chave'] || '';
    
    if (!tema) {
      toast.error('Preencha o Tema da Aula primeiro.');
      return;
    }

    setAiLoadingField('versiculos_biblicos');
    try {
      const prompt = `Sugira 3 versículos bíblicos (versão NAA) relacionados ao tema "${tema}"${principios.length ? `, princípios: ${principios.join(', ')}` : ''}${palavras ? `, palavras-chave: ${palavras}` : ''}. Formato: Referência - Texto breve. Inclua AT e NT.`;
      
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          formData: { 'Pedido': prompt },
          className: '',
          subjectName: '',
          teacherName: '',
        },
      });
      
      if (error) throw error;
      // Extract plain text from response
      const content = (data?.content || '').replace(/<[^>]*>/g, '').trim();
      handleFieldChange('versiculos_biblicos', content);
      toast.success('Versículos sugeridos pela IA!');
    } catch (err: any) {
      toast.error('Erro ao buscar versículos', { description: err.message });
    } finally {
      setAiLoadingField(null);
    }
  }, [formValues]);

  // AI helper to suggest Ideia-Guia
  const handleAiSuggestIdeiaGuia = useCallback(async () => {
    const tema = formValues['tema_aula'] || '';
    const principios = (formValues['principio'] as string[]) || [];
    const palavras = formValues['palavras_chave'] || '';
    const versiculos = formValues['versiculos_biblicos'] || '';
    const selectedSubject = subjects?.find(s => s.id === Number(subjectId));
    
    if (!tema) {
      toast.error('Preencha o Tema da Aula primeiro.');
      return;
    }

    setAiLoadingField('ideia_guia');
    try {
      const prompt = `Gere 3 sugestões de Ideia-Guia AEP para o tema "${tema}", disciplina "${selectedSubject?.name || ''}"${principios.length ? `, princípios: ${principios.join(', ')}` : ''}${palavras ? `, palavras-chave: ${palavras}` : ''}${versiculos ? `, versículos: ${versiculos}` : ''}. Cada ideia-guia deve ser uma frase curta que conecte o tema ao princípio bíblico. Formato: numere 1, 2, 3. Sem HTML, texto puro.`;
      
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          formData: { 'Pedido': prompt },
          className: '',
          subjectName: selectedSubject?.name || '',
          teacherName: '',
        },
      });
      
      if (error) throw error;
      const content = (data?.content || '').replace(/<[^>]*>/g, '').trim();
      handleFieldChange('ideia_guia', content);
      toast.success('Ideias-Guia geradas! Edite, escolha ou acrescente.');
    } catch (err: any) {
      toast.error('Erro ao gerar Ideia-Guia', { description: err.message });
    } finally {
      setAiLoadingField(null);
    }
  }, [formValues, subjectId, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classId || !subjectId) {
      toast.error('Selecione a Classe/Turma e a Disciplina.');
      return;
    }

    // Validate tema_aula
    if (!formValues['tema_aula']?.trim()) {
      toast.error('O campo "Tema da Aula" é obrigatório.');
      return;
    }

    // Validate num_aulas
    if (!formValues['num_aulas']) {
      toast.error('Selecione o número de aulas pretendido.');
      return;
    }

    // Validate principio (exactly 2)
    const principios = (formValues['principio'] as string[]) || [];
    if (principios.length !== 2) {
      toast.error('Selecione exactamente 2 Princípios da AEP.');
      return;
    }

    // Validate palavras_chave (at least 3)
    const palavrasText = (formValues['palavras_chave'] || '').trim();
    const palavrasCount = palavrasText ? palavrasText.split(/[,;]+/).filter((w: string) => w.trim()).length : 0;
    if (palavrasCount < 3) {
      toast.error('Insira pelo menos 3 palavras-chave separadas por vírgula.');
      return;
    }

    // Validate ferramentas (at least 2)
    const ferramentas = (formValues['ferramentas_aep'] as string[]) || [];
    if (ferramentas.length < 2) {
      toast.error('Selecione pelo menos 2 Ferramentas da AEP.');
      return;
    }

    const selectedClass = classes?.find(c => c.id === Number(classId));
    const selectedSubject = subjects?.find(s => s.id === Number(subjectId));
    
    // Build labeled data
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
    const isAiLoading = aiLoadingField === field.field_name;

    // Select field (num_aulas)
    if (field.field_type === 'select' && field.options?.length > 0) {
      return (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-xs font-semibold">{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
          <Select value={value || ''} onValueChange={v => handleFieldChange(field.field_name, v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Multiselect (princípios, ferramentas)
    if (field.field_type === 'multiselect' && field.options?.length > 0) {
      const selected = (value as string[]) || [];
      const config = getMultiSelectConfig(field.field_name);
      return (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-xs font-semibold">{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            {config.hint}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {field.options.map(opt => (
              <Badge
                key={opt}
                variant={selected.includes(opt) ? 'default' : 'outline'}
                className="cursor-pointer select-none text-[11px] py-1 px-2.5 transition-all"
                onClick={() => handleMultiSelectToggle(field.field_name, opt, config.max)}
              >
                {opt}
                {selected.includes(opt) && <X className="ml-1 h-2.5 w-2.5" />}
              </Badge>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {selected.length} selecionada(s){config.max ? ` de ${config.max}` : ''}
            </p>
          )}
        </div>
      );
    }

    // Textarea fields with AI helpers
    if (field.field_type === 'textarea') {
      const showAiButton = field.field_name === 'versiculos_biblicos' || field.field_name === 'ideia_guia';
      const aiHandler = field.field_name === 'versiculos_biblicos' ? handleAiSuggestVerses : handleAiSuggestIdeiaGuia;
      const aiIcon = field.field_name === 'versiculos_biblicos' ? BookOpen : Lightbulb;
      const AiIcon = aiIcon;

      return (
        <div key={field.id} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">
              {field.field_label} {field.is_required && <span className="text-destructive">*</span>}
            </Label>
            {showAiButton && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary/80"
                      onClick={aiHandler}
                      disabled={isAiLoading || isGenerating}
                    >
                      {isAiLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <AiIcon className="h-3 w-3" />
                      )}
                      <Sparkles className="h-2.5 w-2.5" />
                      IA
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">
                      {field.field_name === 'versiculos_biblicos'
                        ? 'A IA sugere versículos relacionados ao tema, princípios e palavras-chave'
                        : 'A IA gera 3 sugestões de Ideia-Guia para editar, escolher ou acrescentar'
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Textarea
            value={value || ''}
            onChange={e => handleFieldChange(field.field_name, e.target.value)}
            placeholder={getPlaceholder(field.field_name)}
            rows={field.field_name === 'ideia_guia' ? 4 : 3}
            className="text-sm"
            disabled={isAiLoading}
          />
          {field.field_name === 'palavras_chave' && (
            <p className="text-[11px] text-muted-foreground">Mínimo 3 palavras separadas por vírgula</p>
          )}
        </div>
      );
    }

    // Text input (tema_aula)
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-xs font-semibold">{field.field_label} {field.is_required && <span className="text-destructive">*</span>}</Label>
        <Input
          value={value || ''}
          onChange={e => handleFieldChange(field.field_name, e.target.value)}
          placeholder={getPlaceholder(field.field_name)}
          className="h-9"
        />
      </div>
    );
  };

  if (fieldsLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando campos...</div>;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Gerar Plano de Aula AEP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Classe + Disciplina */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Classe/Turma <span className="text-destructive">*</span></Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Disciplina <span className="text-destructive">*</span></Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic fields from DB, ordered */}
          {fields?.map(renderField)}

          <Button type="submit" disabled={isGenerating || !classId || !subjectId} className="w-full mt-2">
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
    case 'tema_aula':
      return 'Ex: Ecossistemas e ciclo da água';
    case 'objetivos_competencias':
      return 'Opcional: a IA busca competências na base curricular nacional e objectivos AEP automaticamente';
    case 'palavras_chave':
      return 'Ex: Ecossistema, Fotossíntese, Mordomia (mín. 3 palavras)';
    case 'versiculos_biblicos':
      return 'Clique no botão IA para sugestões ou digite: Génesis 2:15, Colossenses 1:16';
    case 'ideia_guia':
      return 'Clique no botão IA para 3 sugestões ou escreva a sua ideia-guia...';
    default:
      return '';
  }
}
