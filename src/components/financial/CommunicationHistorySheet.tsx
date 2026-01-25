import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Users,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCommunicationHistory, type CommunicationHistory } from '@/hooks/useCollections';
import { motion, AnimatePresence } from 'framer-motion';

interface CommunicationHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  studentName?: string;
}

const channelIcons: Record<string, typeof MessageSquare> = {
  WHATSAPP: MessageSquare,
  SMS: Send,
  TELEFONE: Phone,
  EMAIL: Mail,
  PRESENCIAL: Users,
};

const channelColors: Record<string, string> = {
  WHATSAPP: 'bg-green-600',
  SMS: 'bg-blue-600',
  TELEFONE: 'bg-orange-500',
  EMAIL: 'bg-purple-600',
  PRESENCIAL: 'bg-secondary',
};

const statusIcons: Record<string, typeof Check> = {
  ENVIADO: Check,
  ENTREGUE: CheckCheck,
  LIDO: CheckCheck,
  FALHOU: AlertCircle,
  AGENDADO: Clock,
};

const statusColors: Record<string, string> = {
  ENVIADO: 'text-muted-foreground',
  ENTREGUE: 'text-blue-500',
  LIDO: 'text-success',
  FALHOU: 'text-destructive',
  AGENDADO: 'text-warning',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '-';
    return format(date, "dd 'de' MMM, HH:mm", { locale: pt });
  } catch {
    return '-';
  }
}

export function CommunicationHistorySheet({
  open,
  onOpenChange,
  studentId,
  studentName,
}: CommunicationHistorySheetProps) {
  const { data: history = [], isLoading } = useCommunicationHistory(studentId || undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Comunicações
          </SheetTitle>
          <SheetDescription>
            {studentName ? `Comunicações com ${studentName}` : 'Todas as comunicações recentes'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhuma comunicação registada
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4 pr-4">
                <AnimatePresence>
                  {history.map((item, index) => {
                    const ChannelIcon = channelIcons[item.communication_type] || MessageSquare;
                    const StatusIcon = statusIcons[item.status] || Check;
                    const channelColor = channelColors[item.communication_type] || 'bg-muted';
                    const statusColor = statusColors[item.status] || 'text-muted-foreground';

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-8"
                      >
                        {/* Timeline line */}
                        {index < history.length - 1 && (
                          <div className="absolute left-3 top-10 bottom-0 w-px bg-border -translate-x-1/2" />
                        )}

                        {/* Channel icon */}
                        <div className={cn(
                          "absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center text-white",
                          channelColor
                        )}>
                          <ChannelIcon className="h-3 w-3" />
                        </div>

                        {/* Content */}
                        <div className="bg-card border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.recipient_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.recipient_phone}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <StatusIcon className={cn("h-3.5 w-3.5", statusColor)} />
                              <span className={cn("text-xs", statusColor)}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {item.message_content}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {item.communication_type}
                            </Badge>
                            <span>{formatDate(item.sent_at)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
