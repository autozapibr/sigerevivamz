import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';

export default function CurriculoPage() {
  return (
    <MainLayout 
      title="Currículo Escolar" 
      subtitle="Currículo oficial do MEC"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Currículo Escolar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Currículo moçambicano, competências e objectivos de aprendizagem.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
