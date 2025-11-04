import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LibraryBig } from 'lucide-react';

export default function BibliotecaPage() {
  return (
    <MainLayout 
      title="Biblioteca" 
      subtitle="Gestão de livros e empréstimos"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LibraryBig className="w-5 h-5" />
            Biblioteca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento: Catálogo de livros, controlo de empréstimos e devoluções.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
