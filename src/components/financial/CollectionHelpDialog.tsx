import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Percent,
  Phone,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Identificar Dívidas',
    description: 'O sistema lista automaticamente todas as propinas vencidas, organizadas por nível de urgência.',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    step: 2,
    title: 'Contactar Encarregado',
    description: 'Envie lembretes via WhatsApp, SMS ou telefone directamente pelo sistema.',
    icon: MessageSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    step: 3,
    title: 'Negociar (se necessário)',
    description: 'Crie acordos de pagamento com parcelamentos, promessas de data ou descontos para regularização.',
    icon: Percent,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    step: 4,
    title: 'Registar Pagamento',
    description: 'Quando o pagamento for recebido, registe-o para actualizar o histórico do aluno.',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

const URGENCY_LEVELS = [
  { label: 'Baixa', range: '1-7 dias', color: 'bg-warning/10 text-warning', description: 'Enviar lembrete gentil' },
  { label: 'Média', range: '8-30 dias', color: 'bg-orange-500/10 text-orange-500', description: 'Insistir no contacto' },
  { label: 'Alta', range: '31-60 dias', color: 'bg-destructive/10 text-destructive', description: 'Negociar pagamento' },
  { label: 'Crítica', range: '+60 dias', color: 'bg-destructive/20 text-destructive', description: 'Acção urgente necessária' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Envio Inteligente',
    description: 'Envie mensagens personalizadas em massa para vários encarregados de uma vez.',
  },
  {
    icon: FileText,
    title: 'Histórico Completo',
    description: 'Visualize todas as propinas, pagamentos e comunicações de cada aluno.',
  },
  {
    icon: Calendar,
    title: 'Acordos de Pagamento',
    description: 'Crie parcelamentos de 2-6x ou aplique descontos para regularização.',
  },
  {
    icon: Clock,
    title: 'Linha do Tempo',
    description: 'Veja todas as tentativas de contacto realizadas com cada devedor.',
  },
];

export function CollectionHelpDialog({ open, onOpenChange }: CollectionHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            Como funciona o Sistema de Cobranças
          </DialogTitle>
          <DialogDescription>
            Guia completo para recuperação de receitas da escola
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Workflow Steps */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Fluxo de Trabalho
              </h3>
              <div className="space-y-3">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg shrink-0', step.bgColor)}>
                      <step.icon className={cn('h-4 w-4', step.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Passo {step.step}
                        </Badge>
                        <h4 className="font-medium text-sm">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Urgency Levels */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Níveis de Urgência (Kanban)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <Card key={level.label} className="border">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={level.color}>{level.label}</Badge>
                        <span className="text-xs text-muted-foreground">{level.range}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Funcionalidades Disponíveis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <feature.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Tips */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Dicas Rápidas
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Clique no card de um devedor para ver todas as opções de acção.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Use "Envio Inteligente" para contactar vários encarregados de uma vez.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Consulte o "Histórico" antes de contactar para ver interacções anteriores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Ao negociar, o sistema cria parcelas automáticas com datas de vencimento.</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
