import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao SGE REVIVA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema conectado ao Supabase. Configure a autenticação para começar.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
