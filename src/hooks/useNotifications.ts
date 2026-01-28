import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { 
  TicketCategory, 
  TicketStatus, 
  TicketPriority, 
  getCategoryLabel, 
  getStatusLabel,
  CATEGORY_DEPARTMENT_ROUTING 
} from './useTickets';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  link?: string;
  ticket_id?: number;
  category?: TicketCategory;
  source: 'ticket' | 'message'; // To differentiate ticket notifications from message notifications
}

// Map user roles to departments they can see
const ROLE_DEPARTMENT_ACCESS: Record<UserRole, string[]> = {
  ADMIN: ['ADMIN', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO'],
  DIRETORIA: ['ADMIN', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO'],
  SECRETARIA: ['SECRETARIA'],
  FINANCEIRO: ['FINANCEIRO'],
  PROFESSOR: ['PEDAGOGICO'],
  PEDAGOGICO: ['PEDAGOGICO'],
  ENCARREGADO: [],
  ALUNO: [],
};

// Map priority to notification type
const PRIORITY_TO_TYPE: Record<TicketPriority, Notification['type']> = {
  BAIXA: 'info',
  NORMAL: 'info',
  ALTA: 'warning',
  URGENTE: 'error',
};

// Hook para buscar notificações do usuário (baseado em tickets + mensagens)
export function useNotifications() {
  const { user } = useAuth();
  
  return useSupabaseQuery<Notification[]>(
    ['notifications', user?.id, user?.role],
    async () => {
      if (!user) {
        return { data: [], error: null };
      }

      const notifications: Notification[] = [];

      // 1. Fetch message notifications from ticket_notifications table
      // Filter by recipient_role matching user's role OR created_by_role matching user's role
      const { data: messageNotifications, error: msgError } = await supabase
        .from('ticket_notifications')
        .select('*, tickets!ticket_notifications_ticket_id_fkey(ticket_number, status, category)')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!msgError && messageNotifications) {
        // Filter notifications relevant to this user
        const relevantNotifications = messageNotifications.filter((notif: any) => {
          // If recipient_role matches user's role
          if (notif.recipient_role === user.role) return true;
          
          // If user is staff and notification is for their department
          const allowedDepts = ROLE_DEPARTMENT_ACCESS[user.role] || [];
          if (allowedDepts.includes(notif.recipient_role)) return true;
          
          // ADMIN and DIRETORIA see all
          if (user.role === 'ADMIN' || user.role === 'DIRETORIA') return true;
          
          return false;
        });

        relevantNotifications.forEach((notif: any) => {
          // Skip if ticket is closed
          if (notif.tickets?.status === 'FECHADO') return;
          
          notifications.push({
            id: `msg-${notif.id}`,
            user_id: notif.user_id || 'anonymous',
            title: `Nova resposta - ${notif.tickets?.ticket_number || 'Ticket'}`,
            message: notif.message,
            type: 'info',
            read: notif.is_read,
            created_at: notif.created_at,
            link: '/comunicacao',
            ticket_id: notif.ticket_id,
            category: notif.tickets?.category,
            source: 'message',
          });
        });
      }

      // 2. Also fetch open tickets assigned to user's department (existing behavior)
      let ticketQuery = supabase
        .from('tickets')
        .select('*')
        .in('status', ['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO'])
        .order('created_at', { ascending: false })
        .limit(50);

      const allowedDepartments = ROLE_DEPARTMENT_ACCESS[user.role] || [];

      if (user.role === 'ENCARREGADO' || user.role === 'ALUNO') {
        // Only show their own tickets
        const userId = user.id?.startsWith('dev-') ? null : user.id;
        if (userId) {
          ticketQuery = ticketQuery.eq('created_by', userId);
        } else {
          // For dev mode, match by role in created_by_role
          ticketQuery = ticketQuery.eq('created_by_role', user.role);
        }
      } else if (allowedDepartments.length > 0) {
        ticketQuery = ticketQuery.in('assigned_department', allowedDepartments);
      }

      const { data: tickets, error: ticketError } = await ticketQuery;

      if (!ticketError && tickets) {
        tickets.forEach((ticket: any) => {
          // Avoid duplicate if already have message notification for this ticket
          if (!notifications.some(n => n.ticket_id === ticket.id)) {
            notifications.push({
              id: `ticket-${ticket.id}`,
              user_id: user.id,
              title: `${ticket.ticket_number || 'Ticket'}: ${ticket.title}`,
              message: `${getCategoryLabel(ticket.category)} • ${getStatusLabel(ticket.status)} • Por: ${ticket.created_by_name}`,
              type: PRIORITY_TO_TYPE[ticket.priority as TicketPriority] || 'info',
              read: ticket.status !== 'ABERTO',
              created_at: ticket.created_at,
              link: '/comunicacao',
              ticket_id: ticket.id,
              category: ticket.category,
              source: 'ticket',
            });
          }
        });
      }

      // Sort by date descending
      notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: notifications, error: null };
    },
    { enabled: !!user }
  );
}

// Hook para contar notificações não lidas
export function useUnreadNotificationCount() {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter(n => !n.read).length;
}

// Hook para marcar notificação como lida
export function useMarkAsRead() {
  return useSupabaseMutation<Notification, string>(
    async (id) => {
      // Check if it's a message notification or ticket notification
      if (id.startsWith('msg-')) {
        const msgId = parseInt(id.replace('msg-', ''));
        const { error } = await supabase
          .from('ticket_notifications')
          .update({ is_read: true })
          .eq('id', msgId);
        
        if (error) return { data: null as any, error };
      } else {
        // Update ticket status to EM_ANDAMENTO when marked as read
        const ticketId = parseInt(id.replace('ticket-', ''));
        const { error } = await supabase
          .from('tickets')
          .update({ status: 'EM_ANDAMENTO' })
          .eq('id', ticketId)
          .eq('status', 'ABERTO');

        if (error) return { data: null as any, error };
      }
      
      return { data: null as any, error: null };
    },
    {
      invalidateQueries: [['notifications'], ['tickets'], ['ticket-notifications']],
    }
  );
}

// Hook para deletar notificação (fecha o ticket)
export function useDeleteNotification() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      if (id.startsWith('msg-')) {
        // Just mark as read for message notifications
        const msgId = parseInt(id.replace('msg-', ''));
        const { error } = await supabase
          .from('ticket_notifications')
          .update({ is_read: true })
          .eq('id', msgId);
        
        if (error) return { data: null as any, error };
      } else {
        // Close the ticket
        const ticketId = parseInt(id.replace('ticket-', ''));
        const { error } = await supabase
          .from('tickets')
          .update({ 
            status: 'FECHADO',
            closed_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        if (error) return { data: null as any, error };
      }
      
      return { data: null as any, error: null };
    },
    {
      invalidateQueries: [['notifications'], ['tickets'], ['ticket-notifications']],
    }
  );
}
