import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function ContratosPage() {
  return (
    <MainLayout 
      title="Contratos" 
      subtitle="Contratos de trabalho e termos"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Modelos de contratos, termos de voluntariado e responsabilidades.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
