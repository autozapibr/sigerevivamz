import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StaffDocument {
  id: number;
  staff_type: 'teacher' | 'employee';
  staff_id: number;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  is_verified: boolean | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  expiry_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type StaffDocumentInsert = Omit<StaffDocument, 'id' | 'created_at' | 'updated_at'>;

export const DOCUMENT_TYPES = [
  { value: 'BI', label: 'Bilhete de Identidade' },
  { value: 'NUIT', label: 'NUIT' },
  { value: 'CONTRACT', label: 'Contrato' },
  { value: 'CV', label: 'Curriculum Vitae' },
  { value: 'CERTIFICATE', label: 'Certificado/Diploma' },
  { value: 'MEDICAL', label: 'Atestado Médico' },
  { value: 'OTHER', label: 'Outro' },
];

export function useStaffDocuments(staffType: 'teacher' | 'employee', staffId: number | null) {
  return useQuery({
    queryKey: ['staff-documents', staffType, staffId],
    queryFn: async () => {
      if (!staffId) return [];

      const { data, error } = await supabase
        .from('staff_documents')
        .select('*')
        .eq('staff_type', staffType)
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StaffDocument[];
    },
    enabled: !!staffId,
  });
}

export function useAllStaffDocuments(filters: { 
  search?: string; 
  documentType?: string;
  staffType?: 'teacher' | 'employee' | 'all';
  isVerified?: boolean | 'all';
} = {}) {
  return useQuery({
    queryKey: ['all-staff-documents', filters],
    queryFn: async () => {
      let query = supabase
        .from('staff_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.staffType && filters.staffType !== 'all') {
        query = query.eq('staff_type', filters.staffType);
      }

      if (filters.documentType) {
        query = query.eq('document_type', filters.documentType);
      }

      if (filters.isVerified !== undefined && filters.isVerified !== 'all') {
        query = query.eq('is_verified', filters.isVerified);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as StaffDocument[];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(d =>
          d.document_name.toLowerCase().includes(searchLower) ||
          d.notes?.toLowerCase().includes(searchLower)
        );
      }

      return result;
    },
  });
}

export function useUploadStaffDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      file, 
      staffType, 
      staffId, 
      documentType, 
      documentName,
      notes,
      expiryDate
    }: { 
      file: File; 
      staffType: 'teacher' | 'employee'; 
      staffId: number;
      documentType: string;
      documentName: string;
      notes?: string;
      expiryDate?: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${staffType}_${staffId}_${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${staffType}s/${staffId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('staff-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('staff-files')
        .getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from('staff_documents')
        .insert({
          staff_type: staffType,
          staff_id: staffId,
          document_type: documentType,
          document_name: documentName,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          notes,
          expiry_date: expiryDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['staff-documents', variables.staffType, variables.staffId] 
      });
      queryClient.invalidateQueries({ queryKey: ['all-staff-documents'] });
      toast({
        title: 'Sucesso',
        description: 'Documento carregado com sucesso',
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

export function useVerifyDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ documentId, verified }: { documentId: number; verified: boolean }) => {
      const { data, error } = await supabase
        .from('staff_documents')
        .update({
          is_verified: verified,
          verified_at: verified ? new Date().toISOString() : null,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-staff-documents'] });
      toast({
        title: 'Sucesso',
        description: 'Estado do documento actualizado',
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

export function useDeleteStaffDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (document: StaffDocument) => {
      // Extract file path from URL
      const url = new URL(document.file_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('staff-files') + 1).join('/');

      // Delete from storage
      await supabase.storage.from('staff-files').remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('staff_documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-staff-documents'] });
      toast({
        title: 'Sucesso',
        description: 'Documento eliminado com sucesso',
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

// Upload photo for staff member
export function useUploadStaffPhoto() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      file, 
      staffType, 
      staffId 
    }: { 
      file: File; 
      staffType: 'teacher' | 'employee'; 
      staffId: number;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `photo_${Date.now()}.${fileExt}`;
      const filePath = `photos/${staffType}s/${staffId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('staff-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('staff-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
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
