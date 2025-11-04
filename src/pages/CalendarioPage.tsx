import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function CalendarioPage() {
  return (
    <MainLayout 
      title="Calendário Escolar" 
      subtitle="Eventos, feriados e planejamento anual"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Calendário Escolar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Calendário anual, eventos escolares, feriados moçambicanos.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
