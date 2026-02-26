import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Eye, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { type LessonPlan } from '@/hooks/useLessonPlans';

interface LessonPlanHistoryProps {
  plans: LessonPlan[];
  onView: (plan: LessonPlan) => void;
  onDelete: (id: number) => void;
  onFinalize: (id: number) => void;
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  rascunho: { label: 'Rascunho', variant: 'secondary' },
  finalizado: { label: 'Finalizado', variant: 'default' },
  arquivado: { label: 'Arquivado', variant: 'outline' },
};

export function LessonPlanHistory({ plans, onView, onDelete, onFinalize }: LessonPlanHistoryProps) {
  if (!plans?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Nenhum plano de aula gerado ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Planos ({plans.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {plans.map(plan => {
              const status = statusMap[plan.status] || statusMap.rascunho;
              return (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(plan.created_at), "dd MMM yyyy 'às' HH:mm", { locale: pt })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => onView(plan)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {plan.status === 'rascunho' && (
                      <Button variant="ghost" size="icon" onClick={() => onFinalize(plan.id)}>
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDelete(plan.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
