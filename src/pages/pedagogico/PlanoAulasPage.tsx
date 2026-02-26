import React, { useState } from 'react';
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

export default function PlanoAulasPage() {
  const { user } = useAuth();
  const { data: plans } = useLessonPlans();
  const { generatePlan, savePlan, updatePlanStatus, deletePlan } = useLessonPlanMutations();
  
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LessonPlanForm
                onGenerate={handleGenerate}
                isGenerating={generatePlan.isPending}
              />
              {generatedContent && (
                <LessonPlanPreview
                  content={generatedContent}
                  onSave={handleSave}
                  isSaving={savePlan.isPending}
                />
              )}
            </div>
            <div>
              <LessonPlanHistory
                plans={plans || []}
                onView={setViewingPlan}
                onDelete={id => deletePlan.mutate(id)}
                onFinalize={id => updatePlanStatus.mutate({ id, status: 'finalizado' })}
              />
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
