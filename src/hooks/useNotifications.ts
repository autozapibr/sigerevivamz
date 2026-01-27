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
}

// Map user roles to departments they can see
const ROLE_DEPARTMENT_ACCESS: Record<UserRole, string[]> = {
  ADMIN: ['ADMIN', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO'], // Can see all
  DIRETORIA: ['ADMIN', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO'], // Can see all
  SECRETARIA: ['SECRETARIA'],
  FINANCEIRO: ['FINANCEIRO'],
  PROFESSOR: ['PEDAGOGICO'],
  PEDAGOGICO: ['PEDAGOGICO'],
  ENCARREGADO: [], // Only sees own tickets
  ALUNO: [], // Only sees own tickets
};

// Map priority to notification type
const PRIORITY_TO_TYPE: Record<TicketPriority, Notification['type']> = {
  BAIXA: 'info',
  NORMAL: 'info',
  ALTA: 'warning',
  URGENTE: 'error',
};

// Hook para buscar notificações do usuário (baseado em tickets)
export function useNotifications() {
  const { user } = useAuth();
  
  return useSupabaseQuery<Notification[]>(
    ['notifications', user?.id, user?.role],
    async () => {
      if (!user) {
        return { data: [], error: null };
      }

      // Build query based on user role
      let query = supabase
        .from('tickets')
        .select('*')
        .in('status', ['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO'])
        .order('created_at', { ascending: false })
        .limit(50);

      const allowedDepartments = ROLE_DEPARTMENT_ACCESS[user.role] || [];

      // If user is ENCARREGADO, only show their own tickets
      if (user.role === 'ENCARREGADO') {
        query = query.eq('created_by', user.id);
      } else if (allowedDepartments.length > 0) {
        // Filter by departments the user can access
        query = query.in('assigned_department', allowedDepartments);
      }

      const { data: tickets, error } = await query;

      if (error) {
        console.error('Error fetching ticket notifications:', error);
        return { data: [], error };
      }

      // Transform tickets to notifications
      const notifications: Notification[] = (tickets || []).map((ticket: any) => ({
        id: ticket.id.toString(),
        user_id: user.id,
        title: `${ticket.ticket_number || 'Ticket'}: ${ticket.title}`,
        message: `${getCategoryLabel(ticket.category)} • ${getStatusLabel(ticket.status)} • Por: ${ticket.created_by_name}`,
        type: PRIORITY_TO_TYPE[ticket.priority as TicketPriority] || 'info',
        read: ticket.status !== 'ABERTO', // Consider "read" if not in ABERTO status
        created_at: ticket.created_at,
        link: '/comunicacao',
        ticket_id: ticket.id,
        category: ticket.category,
      }));

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

// Hook para marcar notificação como lida (atualiza status do ticket)
export function useMarkAsRead() {
  return useSupabaseMutation<Notification, string>(
    async (id) => {
      // Update ticket status to EM_ANDAMENTO when marked as read
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'EM_ANDAMENTO' })
        .eq('id', parseInt(id))
        .eq('status', 'ABERTO');

      if (error) {
        return { data: null as any, error };
      }
      
      return { data: null as any, error: null };
    },
    {
      invalidateQueries: [['notifications'], ['tickets']],
    }
  );
}

// Hook para deletar notificação (fecha o ticket)
export function useDeleteNotification() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      // Close the ticket when notification is deleted
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'FECHADO',
          closed_at: new Date().toISOString()
        })
        .eq('id', parseInt(id));

      if (error) {
        return { data: null as any, error };
      }
      
      return { data: null as any, error: null };
    },
    {
      invalidateQueries: [['notifications'], ['tickets']],
    }
  );
}
