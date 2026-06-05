import React from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import { getCategoryColor, getCategoryLabel } from '@/hooks/useTickets';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationBell() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const unread = notifications.filter((n) => !n.read);
  const unreadCount = unread.length;

  const handleClick = async (notif: typeof notifications[number]) => {
    setOpen(false);
    // Mark message-source notification as read
    if (notif.source === 'message') {
      try { await markAsRead.mutateAsync(notif.id); } catch {}
    }
    if (notif.ticket_id) {
      navigate('/comunicacao', { state: { ticketId: notif.ticket_id } });
    } else if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    const ids = unread
      .filter((n) => n.source === 'message')
      .map((n) => parseInt(n.id.replace('msg-', '')))
      .filter((n) => !Number.isNaN(n));
    if (ids.length > 0) {
      await supabase.from('ticket_notifications').update({ is_read: true }).in('id', ids);
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['ticket-notifications'] });
      qc.invalidateQueries({ queryKey: ['ticket-notifications-count'] });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center border-2 border-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="text-sm font-semibold">Notificações</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} por ler` : 'Tudo em dia'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">A carregar...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">Sem notificações</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-accent transition-colors',
                    !n.read && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      n.read ? 'bg-muted' : 'bg-primary'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate flex-1">{n.title}</p>
                        {n.category && (
                          <Badge className={cn('text-[10px] shrink-0', getCategoryColor(n.category))}>
                            {getCategoryLabel(n.category)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => { setOpen(false); navigate('/notificacoes'); }}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
