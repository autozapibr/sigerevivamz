import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, CheckCircle2, MessageSquare } from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TuitionFee } from '@/hooks/useFinancial';

export function getDaysOverdue(dueDate: string | null) {
  if (!dueDate) return 0;
  return differenceInDays(new Date(), parseISO(dueDate));
}

export function getUrgencyLevel(days: number): { label: string; color: string; bgColor: string } {
  if (days <= 7) {
    return { label: 'Baixa', color: 'text-warning', bgColor: 'bg-warning/10' };
  } else if (days <= 30) {
    return { label: 'Média', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
  } else if (days <= 60) {
    return { label: 'Alta', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  } else {
    return { label: 'Crítica', color: 'text-destructive', bgColor: 'bg-destructive/20' };
  }
}

interface DebtorCardProps {
  fee: TuitionFee;
  onPay: (fee: TuitionFee) => void;
  onContact: (fee: TuitionFee) => void;
  compact?: boolean;
}

export function DebtorCard({ fee, onPay, onContact, compact = false }: DebtorCardProps) {
  const daysOverdue = getDaysOverdue(fee.due_date);
  const urgency = getUrgencyLevel(daysOverdue);

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
      >
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {fee.student?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fee.student?.name}</p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(`${fee.month}-01`), 'MMM/yy', { locale: pt })}
            </p>
          </div>

          <Badge className={cn("text-xs shrink-0", urgency.bgColor, urgency.color)}>
            {daysOverdue}d
          </Badge>

          <p className="text-sm font-bold text-destructive shrink-0">
            {formatMZN(fee.amount || 0)}
          </p>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onContact(fee)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-7 px-2 bg-success hover:bg-success/90"
              onClick={() => onPay(fee)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {fee.student?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium truncate">{fee.student?.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(`${fee.month}-01`), 'MMMM yyyy', { locale: pt })}
                  </p>
                </div>
                <Badge className={cn("text-xs", urgency.bgColor, urgency.color)}>
                  {daysOverdue}d atraso
                </Badge>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-destructive">
                    {formatMZN(fee.amount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Venc: {fee.due_date ? format(parseISO(fee.due_date), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onContact(fee)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-success hover:bg-success/90"
                    onClick={() => onPay(fee)}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Pagar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
