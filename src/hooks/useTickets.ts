import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TicketStatus = 'ABERTO' | 'EM_ANDAMENTO' | 'AGUARDANDO' | 'RESOLVIDO' | 'FECHADO';
export type TicketPriority = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
export type TicketCategory = 'SECRETARIA' | 'RECLAMACAO' | 'INFORMACAO' | 'SUGESTAO' | 'SUPORTE' | 'FINANCEIRO' | 'PEDAGOGICO' | 'RH' | 'OUTRO';

// Routing configuration: category -> department
export const CATEGORY_DEPARTMENT_ROUTING: Record<TicketCategory, string> = {
  SECRETARIA: 'SECRETARIA',
  SUGESTAO: 'SECRETARIA',
  RECLAMACAO: 'SECRETARIA',
  RH: 'SECRETARIA',
  INFORMACAO: 'SECRETARIA',
  FINANCEIRO: 'FINANCEIRO',
  SUPORTE: 'ADMIN',
  PEDAGOGICO: 'PEDAGOGICO',
  OUTRO: 'SECRETARIA', // Default to secretaria
};

export const getDepartmentForCategory = (category: TicketCategory): string => {
  return CATEGORY_DEPARTMENT_ROUTING[category] || 'SECRETARIA';
};

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string | null;
  created_by_name: string;
  created_by_role: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  assigned_department: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: string | null;
  sender_name: string;
  sender_role: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketNotification {
  id: number;
  ticket_id: number;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  recipient_role: string | null;
  recipient_name: string | null;
}

export interface CreateTicketData {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  created_by_name: string;
  created_by_role?: string;
}

export interface CreateMessageData {
  ticket_id: number;
  sender_name: string;
  sender_role?: string;
  message: string;
  is_internal?: boolean;
}

// Fetch all tickets
export function useTickets(filters?: { status?: TicketStatus; category?: TicketCategory }) {
  const filterKey = JSON.stringify(filters || {});
  return useSupabaseQuery<Ticket[]>(
    ['tickets', filterKey],
    async () => {
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      return { data: data as Ticket[] | null, error };
    }
  );
}

// Fetch single ticket with messages
export function useTicket(id: number | null) {
  const ticketKey = id ? String(id) : 'null';
  return useSupabaseQuery<Ticket>(
    ['ticket', ticketKey],
    async () => {
      if (!id) return { data: null, error: null };
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      return { data: data as Ticket | null, error };
    },
    { enabled: !!id }
  );
}

// Fetch ticket messages
export function useTicketMessages(ticketId: number | null) {
  const ticketKey = ticketId ? String(ticketId) : 'null';
  return useSupabaseQuery<TicketMessage[]>(
    ['ticket-messages', ticketKey],
    async () => {
      if (!ticketId) return { data: [], error: null };
      
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      return { data: data as TicketMessage[] | null, error };
    },
    { enabled: !!ticketId }
  );
}

// Fetch ticket notifications
export function useTicketNotifications() {
  const { user } = useAuth();
  
  return useSupabaseQuery<TicketNotification[]>(
    ['ticket-notifications', user?.id],
    async () => {
      const { data, error } = await supabase
        .from('ticket_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      return { data: data as TicketNotification[] | null, error };
    },
    { enabled: !!user }
  );
}

// Fetch unread notification count
export function useUnreadNotificationCount() {
  const { user } = useAuth();
  
  return useSupabaseQuery<number>(
    ['ticket-notifications-count', user?.id],
    async () => {
      const { count, error } = await supabase
        .from('ticket_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      return { data: count ?? 0, error };
    },
    { enabled: !!user }
  );
}

// Create ticket
export function useCreateTicket() {
  const { user } = useAuth();
  
  return useSupabaseMutation<Ticket, CreateTicketData>(
    async (data) => {
      // Auto-route to department based on category
      const assigned_department = getDepartmentForCategory(data.category);
      
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          created_by_name: data.created_by_name,
          created_by_role: data.created_by_role || null,
          created_by: user?.id?.startsWith('dev-') ? null : (user?.id || null),
          assigned_department,
          status: 'ABERTO',
        })
        .select()
        .single();
      
      return { data: ticket as Ticket, error };
    },
    {
      invalidateQueries: [['tickets']],
    }
  );
}

// Create message
export function useCreateMessage() {
  const { user } = useAuth();
  
  return useSupabaseMutation<TicketMessage, CreateMessageData>(
    async (data) => {
      const sender_id = user?.id?.startsWith('dev-') ? null : (user?.id || null);
      const { data: message, error } = await supabase
        .from('ticket_messages')
        .insert({
          ...data,
          sender_id,
        })
        .select()
        .single();
      
      return { data: message as TicketMessage, error };
    },
    {
      invalidateQueries: [['ticket-messages']],
    }
  );
}

// Update ticket status
export function useUpdateTicketStatus() {
  return useSupabaseMutation<Ticket, { id: number; status: TicketStatus }>(
    async ({ id, status }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === 'RESOLVIDO') {
        updates.resolved_at = new Date().toISOString();
      } else if (status === 'FECHADO') {
        updates.closed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data: data as Ticket, error };
    },
    {
      invalidateQueries: [['tickets'], ['ticket']],
    }
  );
}

// Assign ticket
export function useAssignTicket() {
  return useSupabaseMutation<Ticket, { id: number; assigned_to_name: string; assigned_department?: string }>(
    async ({ id, assigned_to_name, assigned_department }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          assigned_to_name,
          assigned_department,
          status: 'EM_ANDAMENTO' as TicketStatus,
        })
        .eq('id', id)
        .select()
        .single();
      
      return { data: data as Ticket, error };
    },
    {
      invalidateQueries: [['tickets'], ['ticket']],
    }
  );
}

// Mark notifications as read
export function useMarkNotificationsRead() {
  return useSupabaseMutation<void, number[]>(
    async (ids) => {
      const { error } = await supabase
        .from('ticket_notifications')
        .update({ is_read: true })
        .in('id', ids);
      
      return { data: undefined, error };
    },
    {
      invalidateQueries: [['ticket-notifications'], ['ticket-notifications-count']],
    }
  );
}

// Helper functions
export const getCategoryLabel = (category: TicketCategory): string => {
  const labels: Record<TicketCategory, string> = {
    SECRETARIA: 'Secretaria',
    RECLAMACAO: 'Reclamação',
    INFORMACAO: 'Pedido de Informação',
    SUGESTAO: 'Sugestão',
    SUPORTE: 'Suporte Técnico',
    FINANCEIRO: 'Financeiro',
    PEDAGOGICO: 'Pedagógico',
    RH: 'Recursos Humanos',
    OUTRO: 'Outro',
  };
  return labels[category] || category;
};

export const getPriorityLabel = (priority: TicketPriority): string => {
  const labels: Record<TicketPriority, string> = {
    BAIXA: 'Baixa',
    NORMAL: 'Normal',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
  };
  return labels[priority] || priority;
};

export const getStatusLabel = (status: TicketStatus): string => {
  const labels: Record<TicketStatus, string> = {
    ABERTO: 'Aberto',
    EM_ANDAMENTO: 'Em Andamento',
    AGUARDANDO: 'Aguardando',
    RESOLVIDO: 'Resolvido',
    FECHADO: 'Fechado',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    ABERTO: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    EM_ANDAMENTO: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    AGUARDANDO: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    RESOLVIDO: 'bg-green-500/10 text-green-500 border-green-500/20',
    FECHADO: 'bg-muted text-muted-foreground border-muted',
  };
  return colors[status] || '';
};

export const getPriorityColor = (priority: TicketPriority): string => {
  const colors: Record<TicketPriority, string> = {
    BAIXA: 'bg-slate-500/10 text-slate-500',
    NORMAL: 'bg-blue-500/10 text-blue-500',
    ALTA: 'bg-orange-500/10 text-orange-500',
    URGENTE: 'bg-red-500/10 text-red-500',
  };
  return colors[priority] || '';
};

export const getCategoryColor = (category: TicketCategory): string => {
  const colors: Record<TicketCategory, string> = {
    SECRETARIA: 'bg-cyan-500/10 text-cyan-500',
    RECLAMACAO: 'bg-red-500/10 text-red-500',
    INFORMACAO: 'bg-blue-500/10 text-blue-500',
    SUGESTAO: 'bg-green-500/10 text-green-500',
    SUPORTE: 'bg-purple-500/10 text-purple-500',
    FINANCEIRO: 'bg-emerald-500/10 text-emerald-500',
    PEDAGOGICO: 'bg-amber-500/10 text-amber-500',
    RH: 'bg-indigo-500/10 text-indigo-500',
    OUTRO: 'bg-slate-500/10 text-slate-500',
  };
  return colors[category] || '';
};
