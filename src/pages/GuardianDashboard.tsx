import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GuardianPortal } from '@/components/guardian/GuardianPortal';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function GuardianDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  // Verificar se é encarregado (poderia ter uma role específica)
  const isGuardian = user.role === 'ENCARREGADO' || user.email.includes('encarregado');

  if (!isGuardian) {
    return (
      <MainLayout title="Portal do Encarregado" subtitle="Acompanhamento dos educandos">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Esta área é exclusiva para encarregados de educação.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Bem-vindo, ${user.name}`} 
      subtitle="Acompanhe o progresso dos seus educandos"
    >
      <GuardianPortal />
    </MainLayout>
  );
}