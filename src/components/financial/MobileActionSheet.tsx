import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Phone,
  CheckCircle2,
  FileText,
  Calendar,
  Percent,
  Clock,
  Send,
  X,
  User,
} from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { getDaysOverdue, getUrgencyLevel, formatMonthSafe } from './DebtorCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { TuitionFee } from '@/hooks/useFinancial';

interface MobileActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: TuitionFee | null;
  onPay: () => void;
  onNegotiate: () => void;
  onWhatsApp: () => void;
  onSMS: () => void;
  onCall: () => void;
  onViewHistory: () => void;
  onViewProfile?: () => void;
}

export function MobileActionSheet({
  open,
  onOpenChange,
  fee,
  onPay,
  onNegotiate,
  onWhatsApp,
  onSMS,
  onCall,
  onViewHistory,
  onViewProfile,
}: MobileActionSheetProps) {
  if (!fee) return null;

  const daysOverdue = getDaysOverdue(fee.due_date);
  const urgency = getUrgencyLevel(daysOverdue);

  const actions = [
    {
      id: 'pay',
      icon: CheckCircle2,
      label: 'Registar Pagamento',
      description: 'Marcar como pago',
      color: 'bg-success text-white',
      onClick: onPay,
    },
    {
      id: 'negotiate',
      icon: Percent,
      label: 'Negociar',
      description: 'Parcelar ou dar desconto',
      color: 'bg-primary text-primary-foreground',
      onClick: onNegotiate,
    },
    {
      id: 'whatsapp',
      icon: MessageSquare,
      label: 'WhatsApp',
      description: 'Enviar lembrete automático',
      color: 'bg-green-600 text-white',
      onClick: onWhatsApp,
    },
    {
      id: 'sms',
      icon: Send,
      label: 'SMS',
      description: 'Enviar SMS de cobrança',
      color: 'bg-blue-600 text-white',
      onClick: onSMS,
    },
    {
      id: 'call',
      icon: Phone,
      label: 'Ligar',
      description: 'Fazer chamada telefónica',
      color: 'bg-secondary text-secondary-foreground',
      onClick: onCall,
    },
    {
      id: 'history',
      icon: Clock,
      label: 'Histórico',
      description: 'Ver comunicações anteriores',
      color: 'bg-muted text-foreground',
      onClick: onViewHistory,
    },
    ...(onViewProfile ? [{
      id: 'profile',
      icon: User,
      label: 'Perfil Completo',
      description: 'Ver ficha financeira',
      color: 'bg-secondary text-secondary-foreground',
      onClick: onViewProfile,
    }] : []),
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {fee.student?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-left truncate">
                {fee.student?.name}
              </DrawerTitle>
              <DrawerDescription className="text-left">
                {formatMonthSafe(fee.month)} • {fee.student?.guardian || 'Encarregado'}
              </DrawerDescription>
            </div>
            <Badge className={cn("shrink-0", urgency.bgColor, urgency.color)}>
              {daysOverdue}d atraso
            </Badge>
          </div>
        </DrawerHeader>

        {/* Amount Summary */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <div>
              <p className="text-sm text-muted-foreground">Valor em Dívida</p>
              <p className="text-2xl font-bold text-destructive">
                {formatMZN(fee.amount || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Vencimento</p>
              <p className="text-sm font-medium">
                {fee.due_date ? new Date(fee.due_date).toLocaleDateString('pt-MZ') : '-'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <AnimatePresence>
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "h-auto w-full flex-col gap-2 py-4 px-3 border-2",
                    action.id === 'pay' && "border-success/50",
                    action.id === 'negotiate' && "border-primary/50",
                    action.id === 'whatsapp' && "border-green-600/50"
                  )}
                  onClick={() => {
                    action.onClick();
                    if (action.id !== 'negotiate' && action.id !== 'pay' && action.id !== 'history') {
                      onOpenChange(false);
                    }
                  }}
                >
                  <div className={cn("p-2 rounded-lg", action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full gap-2">
              <X className="h-4 w-4" />
              Fechar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
