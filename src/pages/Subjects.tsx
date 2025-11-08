import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Subjects() {
  return (
    <MainLayout title="Disciplinas" subtitle="Gestão de disciplinas">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Disciplinas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em desenvolvimento</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
