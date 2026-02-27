import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookMarked } from 'lucide-react';
import { LessonPlanForm } from '@/components/lesson-plans/LessonPlanForm';
import { LessonPlanPreview } from '@/components/lesson-plans/LessonPlanPreview';
import { LessonPlanHistory } from '@/components/lesson-plans/LessonPlanHistory';
import { useLessonPlans, useLessonPlanMutations, type LessonPlan } from '@/hooks/useLessonPlans';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DOMPurify from 'dompurify';
import { useSearch } from '@/contexts/SearchContext';
import { toast } from '@/hooks/use-toast';

const LESSON_PLAN_DRAFT_KEY = 'sge_lesson_plan_draft';

export default function PlanoAulasPage() {
  const { user } = useAuth();
  const { data: plans } = useLessonPlans();
  const { generatePlan, savePlan, updatePlanStatus, deletePlan } = useLessonPlanMutations();
  const { searchQuery, setPlaceholder, setSearchQuery } = useSearch();
  
  // Set contextual placeholder on mount, reset on unmount
  useEffect(() => {
    setPlaceholder('Pesquisar planos de aula por título, disciplina, turma...');
    setSearchQuery('');
    return () => {
      setPlaceholder('Pesquisar educandos, professores, turmas...');
      setSearchQuery('');
    };
  }, [setPlaceholder, setSearchQuery]);

  // Filter plans based on search query
  const filteredPlans = useMemo(() => {
    if (!plans || !searchQuery.trim()) return plans || [];
    const q = searchQuery.toLowerCase();
    return plans.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.teacher_name?.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  }, [plans, searchQuery]);

  const [generatedContent, setGeneratedContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});
  const [currentClassId, setCurrentClassId] = useState<number | undefined>();
  const [currentSubjectId, setCurrentSubjectId] = useState<number | undefined>();
  const [currentClassName, setCurrentClassName] = useState('');
  const [currentSubjectName, setCurrentSubjectName] = useState('');
  const [viewingPlan, setViewingPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LESSON_PLAN_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        generatedContent?: string;
        currentFormData?: Record<string, any>;
        currentClassId?: number;
        currentSubjectId?: number;
        currentClassName?: string;
        currentSubjectName?: string;
      };

      setGeneratedContent(draft.generatedContent || '');
      setCurrentFormData(draft.currentFormData || {});
      setCurrentClassId(draft.currentClassId);
      setCurrentSubjectId(draft.currentSubjectId);
      setCurrentClassName(draft.currentClassName || '');
      setCurrentSubjectName(draft.currentSubjectName || '');
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        LESSON_PLAN_DRAFT_KEY,
        JSON.stringify({
          generatedContent,
          currentFormData,
          currentClassId,
          currentSubjectId,
          currentClassName,
          currentSubjectName,
        })
      );
    } catch {
      // no-op
    }
  }, [generatedContent, currentFormData, currentClassId, currentSubjectId, currentClassName, currentSubjectName]);

  useEffect(() => {
    if (savePlan.isSuccess) {
      setIsSaved(true);
      try {
        sessionStorage.removeItem(LESSON_PLAN_DRAFT_KEY);
      } catch {
        // no-op
      }
    }
  }, [savePlan.isSuccess]);

  const handleGenerate = async (
    formData: Record<string, any>,
    classId?: number,
    subjectId?: number,
    className?: string,
    subjectName?: string
  ) => {
    setCurrentFormData(formData);
    setCurrentClassId(classId);
    setCurrentSubjectId(subjectId);
    setCurrentClassName(className || '');
    setCurrentSubjectName(subjectName || '');

    try {
      const result = await generatePlan.mutateAsync({
        formData,
        className,
        subjectName,
        teacherName: user?.name || '',
      });
      setGeneratedContent(result);
      setIsSaved(false);
    } catch (error: any) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: 'Erro ao gerar plano de aula',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    if (!generatedContent?.trim()) {
      toast({
        title: 'Nada para guardar',
        description: 'Gere primeiro um plano de aula completo.',
        variant: 'destructive',
      });
      return;
    }

    // Block save in demo/dev mode
    if (user?.id?.startsWith('dev-')) {
      toast({
        title: 'Sessão de demonstração',
        description: 'Guardar planos requer autenticação real. Use Imprimir ou Descarregar PDF.',
        variant: 'destructive',
      });
      return;
    }

    const temaAula = ((currentFormData as Record<string, unknown>)?.['tema_aula'] as string || '').trim();
    const datePart = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const title = `${currentSubjectName || 'Plano'} - ${currentClassName || 'Turma'} - ${temaAula || datePart}`;
    savePlan.mutate({
      title,
      class_id: currentClassId || null,
      subject_id: currentSubjectId || null,
      form_data: currentFormData,
      generated_content: generatedContent,
      teacher_name: user?.name || '',
    });
  };

  return (
    <MainLayout
      title="Plano de Aulas AEP"
      subtitle="Geração inteligente de planos de aula com Abordagem Educacional por Princípios"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form - 33% */}
          <div className="lg:col-span-4 space-y-6">
            <LessonPlanForm
              onGenerate={handleGenerate}
              isGenerating={generatePlan.isPending}
            />
            <LessonPlanHistory
              plans={filteredPlans}
              onView={setViewingPlan}
              onDelete={id => deletePlan.mutate(id)}
              onFinalize={id => updatePlanStatus.mutate({ id, status: 'finalizado' })}
            />
          </div>
          {/* Preview - 67% */}
          <div className="lg:col-span-8">
            {generatedContent ? (
              <LessonPlanPreview
                content={generatedContent}
                onSave={handleSave}
                onClose={() => { setGeneratedContent(''); setIsSaved(false); }}
                isSaving={savePlan.isPending}
                isSaved={isSaved}
                teacherName={user?.name || ''}
                className={currentClassName}
                subjectName={currentSubjectName}
              />
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[500px] bg-card/50">
                <BookMarked className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Pré-visualização do Plano</h3>
                <p className="text-sm text-muted-foreground/70 max-w-sm">
                  Preencha o formulário ao lado e clique em "Gerar Plano de Aula com IA" para visualizar o resultado aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View plan dialog */}
      <Dialog open={!!viewingPlan} onOpenChange={() => setViewingPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingPlan?.title}</DialogTitle>
          </DialogHeader>
          {viewingPlan && (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewingPlan.generated_content) }}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
