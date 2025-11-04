import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function CalendarioProvasPage() {
  return (
    <MainLayout 
      title="Calendário de Provas" 
      subtitle="Agendamento e gestão de avaliações"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendário de Provas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Agendamento de provas, testes e avaliações periódicas.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
