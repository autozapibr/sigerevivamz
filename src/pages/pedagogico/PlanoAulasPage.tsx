import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked } from 'lucide-react';

export default function PlanoAulasPage() {
  return (
    <MainLayout 
      title="Plano de Aulas" 
      subtitle="Planejamento pedagógico e conteúdos programáticos"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5" />
            Plano de Aulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Planeamento de aulas, conteúdos e objectivos pedagógicos.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
