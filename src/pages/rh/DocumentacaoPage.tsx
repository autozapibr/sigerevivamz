import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';

export default function DocumentacaoPage() {
  return (
    <MainLayout 
      title="Documentação RH" 
      subtitle="Documentos e certidões dos colaboradores"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Documentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: BI, NUIT, certificados, atestados médicos e outros documentos.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
