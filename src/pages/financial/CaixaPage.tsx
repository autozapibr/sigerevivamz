import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function CaixaPage() {
  return (
    <MainLayout 
      title="Livro Caixa" 
      subtitle="Registro de entradas e saídas financeiras"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Livro Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Registro de todas as movimentações financeiras da escola.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
