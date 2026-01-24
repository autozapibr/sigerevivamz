import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AnnouncementType = 'GERAL' | 'URGENTE' | 'INFORMATIVO' | 'EVENTO' | 'REUNIAO' | 'PROPINAS';
export type AnnouncementPriority = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  target_audience: string[];
  class_ids: number[] | null;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementInsert {
  title: string;
  content: string;
  type: AnnouncementType;
  priority?: AnnouncementPriority;
  target_audience?: string[];
  class_ids?: number[] | null;
  is_published?: boolean;
  expires_at?: string | null;
}

export function useAnnouncements(onlyPublished: boolean = false) {
  return useQuery({
    queryKey: ['announcements', onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (onlyPublished) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (announcement: AnnouncementInsert) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          published_at: announcement.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Sucesso',
        description: 'Comunicado criado com sucesso',
      });
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

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: number }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update({
          ...updates,
          published_at: updates.is_published ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Sucesso',
        description: 'Comunicado actualizado com sucesso',
      });
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

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Sucesso',
        description: 'Comunicado eliminado',
      });
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

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, publish }: { id: number; publish: boolean }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update({
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Sucesso',
        description: variables.publish ? 'Comunicado publicado' : 'Comunicado despublicado',
      });
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
