import React from 'react';
import { BookMarked } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LessonPlanAdminConfig } from '@/components/lesson-plans/LessonPlanAdminConfig';

export function LessonPlanConfigSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <BookMarked className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <CardTitle>Plano de Aulas AEP</CardTitle>
            <CardDescription>
              Configure os campos do formulário e o prompt da IA para geração de planos de aula
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">Apenas Admin</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <LessonPlanAdminConfig />
      </CardContent>
    </Card>
  );
}
