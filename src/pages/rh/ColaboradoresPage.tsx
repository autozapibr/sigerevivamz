import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound } from 'lucide-react';

export default function ColaboradoresPage() {
  return (
    <MainLayout 
      title="Colaboradores" 
      subtitle="Gestão da equipe escolar"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="w-5 h-5" />
            Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Cadastro de colaboradores, funcionários e voluntários.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
