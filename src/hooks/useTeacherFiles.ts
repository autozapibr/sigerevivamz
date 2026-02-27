import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeacherFile {
  id: number;
  teacher_user_id: string;
  teacher_name: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  category: string;
  description: string | null;
  subject_id: number | null;
  class_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const FILE_CATEGORIES = [
  'Plano de Aula',
  'Relatório',
  'Teste/Prova',
  'Ficha de Exercícios',
  'Material Didáctico',
  'Pauta',
  'Outro',
] as const;

export { FILE_CATEGORIES };

export function useTeacherFiles(filters?: {
  teacherName?: string;
  category?: string;
  subjectId?: number;
  classId?: number;
}) {
  return useQuery({
    queryKey: ['teacher-files', filters],
    queryFn: async () => {
      let query = supabase
        .from('teacher_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.teacherName) {
        query = query.ilike('teacher_name', `%${filters.teacherName}%`);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.subjectId) {
        query = query.eq('subject_id', filters.subjectId);
      }
      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TeacherFile[];
    },
  });
}

export function useTeacherFileMutations() {
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async ({
      file,
      category,
      description,
      subjectId,
      classId,
    }: {
      file: File;
      category: string;
      description?: string;
      subjectId?: number;
      classId?: number;
    }) => {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('Ficheiro muito grande. Máximo 20MB.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizador não autenticado.');

      // Get user profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const teacherName = profile?.full_name || user.email || 'Professor';

      // Sanitize filename
      const sanitizedName = file.name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[()]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-files')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('teacher_files')
        .insert({
          teacher_user_id: user.id,
          teacher_name: teacherName,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          category,
          description: description || null,
          subject_id: subjectId || null,
          class_id: classId || null,
        });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-files'] });
      toast.success('Ficheiro carregado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao carregar ficheiro', { description: error.message });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (file: TeacherFile) => {
      await supabase.storage.from('teacher-files').remove([file.file_path]);
      const { error } = await supabase.from('teacher_files').delete().eq('id', file.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-files'] });
      toast.success('Ficheiro removido.');
    },
    onError: (error) => {
      toast.error('Erro ao remover ficheiro', { description: error.message });
    },
  });

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('teacher-files')
      .createSignedUrl(filePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  };

  return { uploadFile, deleteFile, getSignedUrl };
}
