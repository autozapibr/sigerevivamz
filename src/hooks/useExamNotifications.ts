import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ExamNotification {
  id: number;
  calendar_event_id: number;
  recipient_user_id: string | null;
  recipient_role: string | null;
  recipient_class_id: number | null;
  notification_type: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sent_via_whatsapp: boolean;
  whatsapp_sent_at: string | null;
  calendar_event?: {
    id: number;
    title: string;
    date: string;
    type: string;
    class_id: number | null;
    subject_id: number | null;
    classes?: { id: number; name: string } | null;
    subjects?: { id: number; name: string } | null;
  };
}

export function useExamNotifications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exam-notifications', user?.id, user?.role],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('exam_notifications')
        .select(`
          *,
          calendar_event:calendar_event_id (
            id, title, date, type, class_id, subject_id,
            classes:class_id (id, name),
            subjects:subject_id (id, name)
          )
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Filter by role - professors see all exam notifications for their role
      if (user.role === 'PROFESSOR' || user.role === 'PEDAGOGICO') {
        query = query.eq('recipient_role', 'PROFESSOR');
      } else if (user.role === 'ENCARREGADO') {
        // Parents see notifications for their students' classes
        // The recipient_role filter ensures they only see ENCARREGADO-targeted notifications
        query = query.eq('recipient_role', 'ENCARREGADO');
        // TODO: Further filter by student's class_id when student-guardian link is established
      } else if (user.role === 'ALUNO') {
        // Students see notifications for their class
        query = query.eq('recipient_role', 'ALUNO');
        // TODO: Filter by student's class_id when student-user link is established
      } else if (user.role === 'ADMIN' || user.role === 'DIRETORIA' || user.role === 'SECRETARIA') {
        // Staff can see all exam notifications
        query = query.in('recipient_role', ['PROFESSOR', 'ENCARREGADO', 'ALUNO']);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data as ExamNotification[];
    },
    enabled: !!user,
  });
}

export function useUnreadExamCount() {
  const { data: notifications = [] } = useExamNotifications();
  return notifications.filter(n => !n.is_read).length;
}

export function useMarkExamNotificationRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('exam_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useMarkAllExamNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from('exam_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('is_read', false)
        .eq('recipient_role', user.role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-notifications'] });
    },
  });
}
