import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookMarked, Settings } from 'lucide-react';
import { LessonPlanForm } from '@/components/lesson-plans/LessonPlanForm';
import { LessonPlanPreview } from '@/components/lesson-plans/LessonPlanPreview';
import { LessonPlanHistory } from '@/components/lesson-plans/LessonPlanHistory';
import { LessonPlanAdminConfig } from '@/components/lesson-plans/LessonPlanAdminConfig';
import { useLessonPlans, useLessonPlanMutations, type LessonPlan } from '@/hooks/useLessonPlans';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DOMPurify from 'dompurify';
import { useSearch } from '@/contexts/SearchContext';

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
  const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});
  const [currentClassId, setCurrentClassId] = useState<number | undefined>();
  const [currentSubjectId, setCurrentSubjectId] = useState<number | undefined>();
  const [currentClassName, setCurrentClassName] = useState('');
  const [currentSubjectName, setCurrentSubjectName] = useState('');
  const [viewingPlan, setViewingPlan] = useState<LessonPlan | null>(null);

  const isAdmin = user?.role && ['ADMIN', 'DIRETORIA'].includes(user.role);

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

    const result = await generatePlan.mutateAsync({
      formData,
      className,
      subjectName,
      teacherName: user?.name || '',
    });
    setGeneratedContent(result);
  };

  const handleSave = () => {
    const title = `${currentSubjectName || 'Plano'} - ${currentClassName || 'Turma'} - ${new Date().toLocaleDateString('pt-MZ')}`;
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
      <Tabs defaultValue="gerar">
        <TabsList>
          <TabsTrigger value="gerar" className="gap-1">
            <BookMarked className="h-4 w-4" /> Gerar Plano
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="config" className="gap-1">
              <Settings className="h-4 w-4" /> Configurações
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="gerar" className="space-y-6 mt-4">
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
                  isSaving={savePlan.isPending}
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
        </TabsContent>

        {isAdmin && (
          <TabsContent value="config" className="mt-4">
            <LessonPlanAdminConfig />
          </TabsContent>
        )}
      </Tabs>

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
