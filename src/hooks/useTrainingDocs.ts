import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TrainingDoc {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string | null;
  is_active: boolean | null;
}

export function useTrainingDocs() {
  return useQuery({
    queryKey: ['training-docs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_plan_training_docs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TrainingDoc[];
    },
  });
}

export function useTrainingDocsMutations() {
  const queryClient = useQueryClient();

  const uploadDoc = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowed = ['pdf', 'docx', 'doc', 'txt', 'md'];
      if (!ext || !allowed.includes(ext)) {
        throw new Error('Formato não suportado. Use PDF, DOCX, TXT ou MD.');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Ficheiro muito grande. Máximo 10MB.');
      }

      const filePath = `training/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('aep-training-docs')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await supabase
        .from('lesson_plan_training_docs')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type || `application/${ext}`,
          uploaded_by: user?.id,
        });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-docs'] });
      toast.success('Documento de treino carregado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao carregar documento', { description: error.message });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (doc: TrainingDoc) => {
      const { error: storageError } = await supabase.storage
        .from('aep-training-docs')
        .remove([doc.file_path]);
      if (storageError) console.warn('Storage delete error:', storageError);

      const { error: dbError } = await supabase
        .from('lesson_plan_training_docs')
        .delete()
        .eq('id', doc.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-docs'] });
      toast.success('Documento removido.');
    },
    onError: (error) => {
      toast.error('Erro ao remover documento', { description: error.message });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase
        .from('lesson_plan_training_docs')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-docs'] });
    },
  });

  return { uploadDoc, deleteDoc, toggleActive };
}
