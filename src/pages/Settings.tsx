import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  return (
    <MainLayout title="Configurações" subtitle="Configure o sistema">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em desenvolvimento</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
