import React from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Send, X, Clock, User, Tag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Ticket,
  TicketMessage,
  TicketStatus,
  useTicketMessages,
  useCreateMessage,
  useUpdateTicketStatus,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  getCategoryLabel,
  getCategoryColor,
} from '@/hooks/useTickets';

const messageSchema = z.object({
  message: z.string().min(1, 'A mensagem não pode estar vazia').max(2000),
});

interface TicketDetailProps {
  ticket: Ticket;
  onClose?: () => void;
}

export function TicketDetail({ ticket, onClose }: TicketDetailProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: messages = [], isLoading: loadingMessages } = useTicketMessages(ticket.id);
  const createMessage = useCreateMessage();
  const updateStatus = useUpdateTicketStatus();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Mark related ticket notifications as read when opening this ticket
  React.useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('ticket_notifications')
          .update({ is_read: true })
          .eq('ticket_id', ticket.id)
          .eq('is_read', false);
      } catch {}
    })();
  }, [ticket.id]);

  const form = useForm<{ message: string }>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: '' },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (data: { message: string }) => {
    try {
      await createMessage.mutateAsync({
        ticket_id: ticket.id,
        sender_name: user?.name || 'Utilizador Anónimo',
        sender_role: user?.role,
        message: data.message,
      });
      form.reset();
      toast({ title: 'Mensagem enviada!' });
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status });
      toast({
        title: 'Estado actualizado',
        description: `Ticket agora está "${getStatusLabel(status)}"`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao actualizar estado',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const isStaff = user?.role && ['ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO'].includes(user.role);

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {ticket.ticket_number}
              </Badge>
              <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                {getPriorityLabel(ticket.priority)}
              </Badge>
              <Badge className={cn("text-xs", getCategoryColor(ticket.category))}>
                {getCategoryLabel(ticket.category)}
              </Badge>
            </div>
            <CardTitle className="text-lg">{ticket.title}</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <Badge className={cn("text-sm border", getStatusColor(ticket.status))}>
            {getStatusLabel(ticket.status)}
          </Badge>

          {isStaff && ticket.status !== 'FECHADO' && (
            <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alterar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABERTO">Aberto</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                <SelectItem value="RESOLVIDO">Resolvido</SelectItem>
                <SelectItem value="FECHADO">Fechado</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Criado por: <strong className="text-foreground">{ticket.created_by_name}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
          </div>
        </div>
      </CardHeader>

      {/* Description */}
      <div className="px-6 py-4 bg-muted/30 border-b">
        <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma resposta ainda</p>
            <p className="text-xs text-muted-foreground">Seja o primeiro a responder</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_name === user?.name}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Reply form */}
      {ticket.status !== 'FECHADO' && (
        <div className="p-4 border-t bg-background">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <Textarea
              placeholder="Escreva sua resposta..."
              className="min-h-[60px] resize-none flex-1"
              {...form.register('message')}
            />
            <Button type="submit" size="icon" disabled={createMessage.isPending}>
              {createMessage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Closed message */}
      {ticket.status === 'FECHADO' && (
        <div className="p-4 border-t bg-muted/30 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">Este ticket foi encerrado</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// Message bubble component
function MessageBubble({ message, isOwn }: { message: TicketMessage; isOwn: boolean }) {
  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className={cn(
          "text-xs",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {getInitials(message.sender_name)}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex-1 max-w-[80%]", isOwn && "text-right")}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">{message.sender_name}</span>
          {message.sender_role && (
            <span className="text-[10px] text-muted-foreground capitalize">
              ({message.sender_role.toLowerCase()})
            </span>
          )}
        </div>
        <div
          className={cn(
            "inline-block px-4 py-2 rounded-2xl text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-muted text-foreground rounded-tl-md"
          )}
        >
          <p className="whitespace-pre-wrap">{message.message}</p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {format(new Date(message.created_at), "dd/MM 'às' HH:mm", { locale: pt })}
        </p>
      </div>
    </div>
  );
}
