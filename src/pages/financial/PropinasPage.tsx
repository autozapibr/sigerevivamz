import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function PropinasPage() {
  return (
    <MainLayout 
      title="Matrículas & Propinas" 
      subtitle="Gestão de matrículas e mensalidades"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Matrículas & Propinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Configuração de taxas de matrícula e propinas (mensalidades).
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
