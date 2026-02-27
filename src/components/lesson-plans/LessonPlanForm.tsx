import React, { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Sparkles, X, Info, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useLessonPlanFields, type LessonPlanField } from '@/hooks/useLessonPlans';
import { useClasses, useSubjects } from '@/hooks/useGrades';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { supabase } from '@/integrations/supabase/client';

interface LessonPlanFormProps {
  onGenerate: (formData: Record<string, any>, classId?: number, subjectId?: number, className?: string, subjectName?: string) => void;
  isGenerating: boolean;
}

// Fields that get the AI assist button inside the textarea
const AI_ASSIST_FIELDS = ['versiculos_biblicos', 'ideia_guia', 'objetivos_competencias'];

export function LessonPlanForm({ onGenerate, isGenerating }: LessonPlanFormProps) {
  const { data: fields, isLoading: fieldsLoading } = useLessonPlanFields();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const { data: calendarEvents } = useCalendarEvents();
  
  const [classId, setClassId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [lessonDates, setLessonDates] = useState<Date[]>([]);
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

  const syncedCalendarItems = useMemo(() => {
    const classNum = classId ? Number(classId) : null;
    const subjectNum = subjectId ? Number(subjectId) : null;

    return (calendarEvents || []).filter((event) => {
      const isPedagogicEvent = event.type === 'Prova' || event.type === 'Evento';
      if (!isPedagogicEvent) return false;

      const classMatch = classNum ? (event.class_id === classNum || event.class_id === null) : true;
      const subjectMatch = subjectNum ? (event.subject_id === subjectNum || event.subject_id === null) : true;

      return classMatch && subjectMatch;
    });
  }, [calendarEvents, classId, subjectId]);

  const selectedDateConflicts = useMemo(() => {
    const selectedIso = new Set(lessonDates.map((d) => format(d, 'yyyy-MM-dd')));
    return syncedCalendarItems.filter((event) => selectedIso.has(event.date));
  }, [lessonDates, syncedCalendarItems]);

  const handleDateSelection = (dates: Date[] | undefined) => {
    const validDates = dates || [];
    setLessonDates(validDates);
    handleFieldChange('datas_aulas', validDates.map((d) => format(d, 'yyyy-MM-dd')));
  };

  const handleAiAssist = useCallback(async (fieldName: string) => {
    const tema = formValues['tema_aula'] || '';
    const principios = (formValues['principio'] as string[]) || [];
    const palavras = formValues['palavras_chave'] || '';
    const versiculos = formValues['versiculos_biblicos'] || '';
    const selectedSubject = subjects?.find(s => s.id === Number(subjectId));
    const selectedClass = classes?.find(c => c.id === Number(classId));

    if (!tema) {
      toast.error('Preencha o Tema da Aula primeiro.');
      return;
    }

    setAiLoadingField(fieldName);
    try {
      let prompt = '';

      if (fieldName === 'versiculos_biblicos') {
        prompt = `Cite exactamente 4 versículos bíblicos relacionados ao tema "${tema}"${principios.length ? `, princípios: ${principios.join(', ')}` : ''}${palavras ? `, palavras-chave: ${palavras}` : ''}.

REGRAS OBRIGATÓRIAS:
- 2 versículos do Antigo Testamento e 2 do Novo Testamento.
- Use a versão NAA (Nova Almeida Atualizada).
- Formato EXACTO para cada versículo (um por linha):
  Livro capítulo:versículo - Texto completo do versículo.
- NÃO inclua títulos, cabeçalhos, comentários, explicações ou categorias como "Antigo Testamento:" ou "Novo Testamento:".
- NÃO use markdown, HTML, negrito, itálico ou qualquer formatação.
- Apenas 4 linhas de texto puro, uma por versículo, nada mais.`;
      } else if (fieldName === 'ideia_guia') {
        prompt = `Gere exactamente 3 sugestões de Ideia-Guia AEP para o tema "${tema}", disciplina "${selectedSubject?.name || ''}"${principios.length ? `, princípios: ${principios.join(', ')}` : ''}${palavras ? `, palavras-chave: ${palavras}` : ''}.

REGRAS OBRIGATÓRIAS:
- Cada ideia-guia deve ser UMA frase que conecte o tema aos princípios bíblicos seleccionados.
- NÃO numere as frases (sem 1., 2., 3.).
- Separe cada ideia-guia por uma linha em branco.
- NÃO inclua títulos, cabeçalhos, comentários ou explicações.
- NÃO use markdown, HTML, negrito, itálico ou qualquer formatação.
- Apenas 3 frases separadas por linhas em branco, nada mais.`;
      } else if (fieldName === 'objetivos_competencias') {
        prompt = `Gere exactamente 4 itens para o tema "${tema}", disciplina "${selectedSubject?.name || ''}", turma "${selectedClass?.name || ''}"${principios.length ? `, princípios AEP: ${principios.join(', ')}` : ''}.

REGRAS OBRIGATÓRIAS:
- Itens 1 e 2: competências curriculares de Moçambique.
- Itens 3 e 4: objectivos ligados à AEP.
- Formato EXACTO: "1. ..." até "4. ..." (uma linha por item).
- NÃO inclua títulos, comentários, introduções ou explicações.
- NÃO use markdown, HTML, negrito ou itálico.
- Responda apenas com os 4 itens.`;
      }

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          mode: 'assist',
          prompt,
          assistFieldName: fieldName,
        },
      });

      if (error) throw error;
      const content = (data?.content || '')
        .replace(/```[\w]*\n?/g, '')  // remove ```html, ```xml, etc.
        .replace(/<[^>]*>/g, '')       // remove HTML tags
        .trim();
      handleFieldChange(fieldName, content);
      toast.success('Conteúdo gerado pela IA! Edite conforme necessário.');
    } catch (err: any) {
      toast.error('Erro ao gerar com IA', { description: err.message });
    } finally {
      setAiLoadingField(null);
    }
  }, [formValues, subjectId, classId, subjects, classes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classId || !subjectId) {
      toast.error('Selecione a Classe/Turma e a Disciplina.');
      return;
    }

    if (!formValues['tema_aula']?.trim()) {
      toast.error('O campo "Tema da Aula" é obrigatório.');
      return;
    }

    if (!formValues['num_aulas']) {
      toast.error('Selecione o número de aulas pretendido.');
      return;
    }

    const principios = (formValues['principio'] as string[]) || [];
    if (principios.length !== 2) {
      toast.error('Selecione exactamente 2 Princípios da AEP.');
      return;
    }

    const ferramentas = (formValues['ferramentas_aep'] as string[]) || [];
    if (ferramentas.length < 1) {
      toast.error('Selecione pelo menos 1 Ferramenta da AEP.');
      return;
    }

    const palavrasText = (formValues['palavras_chave'] || '').trim();
    const palavrasCount = palavrasText ? palavrasText.split(/[,;]+/).filter((w: string) => w.trim()).length : 0;
    if (palavrasCount < 3) {
      toast.error('Insira pelo menos 3 palavras-chave separadas por vírgula.');
      return;
    }

    if (lessonDates.length === 0) {
      toast.error('Seleccione pelo menos uma data de aula no calendário.');
      return;
    }

    const ideiaGuiaText = (formValues['ideia_guia'] || '').trim();
    const ideiaGuiaOpcoes = ideiaGuiaText
      .split(/\n\s*\n|\r?\n/)
      .map((linha: string) => linha.trim())
      .filter(Boolean);

    if (ideiaGuiaOpcoes.length > 1) {
      toast.error('Na Ideia-Guia, mantenha apenas uma opção final seleccionada.');
      return;
    }

    const selectedClass = classes?.find(c => c.id === Number(classId));
    const selectedSubject = subjects?.find(s => s.id === Number(subjectId));
    
    const labeledData: Record<string, any> = {
      'Data das Aulas': lessonDates
        .map((date) => format(date, 'dd/MM/yyyy', { locale: pt }))
        .join(', '),
    };

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
    if (fieldName === 'ferramentas_aep') return { min: 1, max: undefined, hint: 'Selecione pelo menos 1 ferramenta' };
    return { min: 1, max: undefined, hint: '' };
  };

  const renderField = (field: LessonPlanField) => {
    const value = formValues[field.field_name];
    const isAiLoading = aiLoadingField === field.field_name;
    const isOptional = !field.is_required;
    const hasAiAssist = AI_ASSIST_FIELDS.includes(field.field_name);

    // Select field
    if (field.field_type === 'select' && field.options?.length > 0) {
      return (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-xs font-semibold">
            {field.field_label} {!isOptional && <span className="text-destructive">*</span>}
            {isOptional && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}
          </Label>
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

    // Multiselect
    if (field.field_type === 'multiselect' && field.options?.length > 0) {
      const selected = (value as string[]) || [];
      const config = getMultiSelectConfig(field.field_name);
      return (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-xs font-semibold">
            {field.field_label} {!isOptional && <span className="text-destructive">*</span>}
            {isOptional && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}
          </Label>
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

    // Textarea fields
    if (field.field_type === 'textarea') {
      return (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-xs font-semibold">
            {field.field_label} {!isOptional && <span className="text-destructive">*</span>}
            {isOptional && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}
          </Label>
          <div className="relative">
            <Textarea
              value={value || ''}
              onChange={e => handleFieldChange(field.field_name, e.target.value)}
              placeholder={getPlaceholder(field.field_name)}
              rows={field.field_name === 'ideia_guia' || field.field_name === 'objetivos_competencias' ? 4 : 3}
              className={`text-sm ${hasAiAssist ? 'pb-10' : ''}`}
              disabled={isAiLoading}
            />
            {hasAiAssist && (
              <button
                type="button"
                onClick={() => handleAiAssist(field.field_name)}
                disabled={isAiLoading || isGenerating}
                className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>auxílio da</span>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>IA</span>
                  </>
                )}
                {isAiLoading && <span>Gerando...</span>}
              </button>
            )}
          </div>
          {field.field_name === 'palavras_chave' && (
            <p className="text-[11px] text-muted-foreground">Mínimo 3 palavras separadas por vírgula</p>
          )}
          {field.field_name === 'ideia_guia' && (
            <p className="text-[11px] text-muted-foreground">Se gerar 3 opções com IA, seleccione apenas 1 versão final.</p>
          )}
        </div>
      );
    }

    // Text input
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-xs font-semibold">
          {field.field_label} {!isOptional && <span className="text-destructive">*</span>}
          {isOptional && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}
        </Label>
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
          {/* Classe/Turma + Disciplina */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {fields?.find((f) => f.field_name === 'tema_aula') && renderField(fields.find((f) => f.field_name === 'tema_aula')!)}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {fields?.find((f) => f.field_name === 'num_aulas') && renderField(fields.find((f) => f.field_name === 'num_aulas')!)}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data das aulas <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="h-9 w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {lessonDates.length > 0
                      ? `${lessonDates.length} dia(s) seleccionado(s)`
                      : 'Seleccione múltiplos dias'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={lessonDates}
                    onSelect={handleDateSelection}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-[11px] text-muted-foreground">
                Sincronizado com Provas/Actividades da turma e disciplina seleccionadas.
              </p>
              {selectedDateConflicts.length > 0 && (
                <div className="text-[11px] text-muted-foreground">
                  Conflitos detectados: {selectedDateConflicts.slice(0, 3).map((event) => `${event.title} (${event.date})`).join(', ')}
                  {selectedDateConflicts.length > 3 ? ' ...' : ''}
                </div>
              )}
            </div>
          </div>

          {fields?.find((f) => f.field_name === 'principio') && renderField(fields.find((f) => f.field_name === 'principio')!)}
          {fields?.find((f) => f.field_name === 'objetivos_competencias') && renderField(fields.find((f) => f.field_name === 'objetivos_competencias')!)}
          {fields?.find((f) => f.field_name === 'palavras_chave') && renderField(fields.find((f) => f.field_name === 'palavras_chave')!)}
          {fields?.find((f) => f.field_name === 'versiculos_biblicos') && renderField(fields.find((f) => f.field_name === 'versiculos_biblicos')!)}
          {fields?.find((f) => f.field_name === 'ideia_guia') && renderField(fields.find((f) => f.field_name === 'ideia_guia')!)}
          {fields?.find((f) => f.field_name === 'ferramentas_aep') && renderField(fields.find((f) => f.field_name === 'ferramentas_aep')!)}

          {/* Campos adicionais activos não mapeados acima */}
          {fields
            ?.filter((f) => !['tema_aula', 'num_aulas', 'principio', 'objetivos_competencias', 'palavras_chave', 'versiculos_biblicos', 'ideia_guia', 'ferramentas_aep'].includes(f.field_name))
            .map(renderField)}

          <Button type="submit" disabled={isGenerating || !classId || !subjectId || lessonDates.length === 0} className="w-full mt-2">
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
      return 'Clique em "auxílio da IA" para gerar automaticamente ou escreva os seus...';
    case 'palavras_chave':
      return 'Ex: Ecossistema, Fotossíntese, Mordomia (mín. 3 palavras)';
    case 'versiculos_biblicos':
      return 'Clique em "auxílio da IA" para sugestões ou digite: Génesis 2:15, Colossenses 1:16';
    case 'ideia_guia':
      return 'Clique em "auxílio da IA" para 3 sugestões ou escreva a sua ideia-guia...';
    default:
      return '';
  }
}
