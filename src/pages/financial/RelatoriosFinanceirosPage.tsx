import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBar } from 'lucide-react';

export default function RelatoriosFinanceirosPage() {
  return (
    <MainLayout 
      title="Relatórios Financeiros" 
      subtitle="Demonstrativos e análises financeiras"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            Relatórios Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Balanços, DRE, fluxo de caixa e análises financeiras.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
