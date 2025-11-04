import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function CobrancasPage() {
  return (
    <MainLayout 
      title="Cobranças" 
      subtitle="Gestão de cobranças e inadimplência"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cobranças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Kanban de cobranças, controlo de inadimplência e lembretes automáticos.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
