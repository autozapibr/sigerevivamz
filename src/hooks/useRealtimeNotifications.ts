import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Subscribe to realtime changes on tickets, messages and notifications.
 * Invalidates relevant queries and shows in-app toasts when new events arrive.
 * Mount once globally (e.g. in MainLayout).
 */
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket-notifications'] });
      qc.invalidateQueries({ queryKey: ['ticket-notifications-count'] });
      qc.invalidateQueries({ queryKey: ['ticket-messages'] });
    };

    const channel = supabase
      .channel('realtime-tickets-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets' }, (payload: any) => {
        invalidate();
        const t = payload.new;
        toast({
          title: `Novo ticket: ${t.ticket_number ?? ''}`,
          description: `${t.title} — por ${t.created_by_name}`,
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets' }, () => {
        invalidate();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages' }, (payload: any) => {
        invalidate();
        const m = payload.new;
        if (m.sender_name !== user.name) {
          toast({
            title: 'Nova resposta num ticket',
            description: `${m.sender_name}: ${String(m.message || '').slice(0, 80)}`,
          });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_notifications' }, () => {
        invalidate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc, toast]);
}
