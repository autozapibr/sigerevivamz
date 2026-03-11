import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type CalendarEventType = 'Feriado' | 'Evento' | 'Prova' | 'Prazo' | 'Actividade';

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  type: CalendarEventType;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  is_all_day: boolean;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  color: string | null;
  class_id: number | null;
  subject_id: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  classes?: {
    id: number;
    name: string;
  };
  subjects?: {
    id: number;
    name: string;
  };
}

export interface CalendarEventInsert {
  title: string;
  description?: string | null;
  date: string;
  type: CalendarEventType;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  is_all_day?: boolean;
  color?: string;
  class_id?: number | null;
  subject_id?: number | null;
}

export function useCalendarEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          classes:class_id (id, name),
          subjects:subject_id (id, name)
        `)
        .order('date', { ascending: true });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useCalendarEventsByMonth(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  return useCalendarEvents(startDate, endDate);
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: CalendarEventInsert) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento criado com sucesso',
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

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: number }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento actualizado',
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

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento eliminado',
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

// Feriados oficiais de Moçambique 2026
export const MOZAMBIQUE_HOLIDAYS_2026 = [
  { date: '2026-01-01', title: 'Ano Novo', type: 'Feriado' as const },
  { date: '2026-02-03', title: 'Dia dos Heróis Moçambicanos', type: 'Feriado' as const },
  { date: '2026-04-07', title: 'Dia da Mulher Moçambicana', type: 'Feriado' as const },
  { date: '2026-04-03', title: 'Sexta-feira Santa', type: 'Feriado' as const },
  { date: '2026-05-01', title: 'Dia Internacional do Trabalhador', type: 'Feriado' as const },
  { date: '2026-06-25', title: 'Dia da Independência Nacional', type: 'Feriado' as const },
  { date: '2026-09-07', title: 'Dia da Vitória', type: 'Feriado' as const },
  { date: '2026-09-25', title: 'Dia das Forças Armadas', type: 'Feriado' as const },
  { date: '2026-10-04', title: 'Dia da Paz e Reconciliação', type: 'Feriado' as const },
  { date: '2026-12-25', title: 'Dia da Família', type: 'Feriado' as const },
];

// Keep backward compatibility
export const MOZAMBIQUE_HOLIDAYS_2025 = MOZAMBIQUE_HOLIDAYS_2026;
