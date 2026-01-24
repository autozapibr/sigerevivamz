import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  StudentEnrollment, 
  AcademicYear, 
  Guardian, 
  StudentDocument,
  EnrollmentFormData,
  DocumentType 
} from '@/types/enrollment';

// Fetch academic years
export function useAcademicYears() {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as AcademicYear[];
    },
  });
}

// Fetch current academic year
export function useCurrentAcademicYear() {
  return useQuery({
    queryKey: ['current-academic-year'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_current', true)
        .single();
      
      if (error) throw error;
      return data as AcademicYear;
    },
  });
}

// Fetch enrollments with related data
export function useStudentEnrollments(filters?: { 
  status?: string; 
  academic_year_id?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['student-enrollments', filters],
    queryFn: async () => {
      let query = supabase
        .from('student_enrollments')
        .select(`
          *,
          students (
            id, name, phone, bi_number, nuit, birth_date, gender, 
            province, district, photo_url, enrollment_status
          ),
          academic_years (id, name, is_current),
          classes (id, name, year)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status as any);
      }
      if (filters?.academic_year_id) {
        query = query.eq('academic_year_id', filters.academic_year_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Apply search filter client-side for flexibility
      let results = data as any[];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(e => 
          e.students?.name?.toLowerCase().includes(searchLower) ||
          e.enrollment_number?.toLowerCase().includes(searchLower) ||
          e.students?.bi_number?.includes(filters.search)
        );
      }
      
      return results.map(e => ({
        ...e,
        student: e.students,
        academic_year: e.academic_years,
        class: e.classes,
      })) as StudentEnrollment[];
    },
  });
}

// Fetch single enrollment
export function useEnrollmentDetails(enrollmentId: number | null) {
  return useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;
      
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          students (*),
          academic_years (*),
          classes (*)
        `)
        .eq('id', enrollmentId)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        student: data.students,
        academic_year: data.academic_years,
        class: data.classes,
      } as StudentEnrollment;
    },
    enabled: !!enrollmentId,
  });
}

// Fetch student documents
export function useStudentDocuments(studentId: number | null) {
  return useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudentDocument[];
    },
    enabled: !!studentId,
  });
}

// Fetch student guardians
export function useStudentGuardians(studentId: number | null) {
  return useQuery({
    queryKey: ['student-guardians', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_guardians')
        .select(`
          *,
          guardians (*)
        `)
        .eq('student_id', studentId);
      
      if (error) throw error;
      return data.map(sg => sg.guardians) as Guardian[];
    },
    enabled: !!studentId,
  });
}

// Create new enrollment (full flow)
export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (formData: EnrollmentFormData & { academic_year_id: number }) => {
      // 1. Create or update student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          name: formData.full_name,
          phone: formData.phone,
          bi_number: formData.bi_number,
          nuit: formData.nuit,
          birth_date: formData.birth_date,
          gender: formData.gender,
          nationality: formData.nationality,
          province: formData.province,
          district: formData.district,
          address: formData.address,
          email: formData.email,
          health_notes: formData.health_notes,
          previous_school: formData.previous_school,
          guardian: formData.guardian.full_name,
          enrollment_status: 'PENDENTE',
          status: 'Ativo',
          class_id: formData.class_id,
        })
        .select()
        .single();
      
      if (studentError) throw studentError;
      
      // 2. Create guardian
      const { data: guardian, error: guardianError } = await supabase
        .from('guardians')
        .insert({
          full_name: formData.guardian.full_name,
          relationship: formData.guardian.relationship,
          bi_number: formData.guardian.bi_number,
          nuit: formData.guardian.nuit,
          phone: formData.guardian.phone,
          phone_alt: formData.guardian.phone_alt,
          email: formData.guardian.email,
          occupation: formData.guardian.occupation,
          workplace: formData.guardian.workplace,
          address: formData.guardian.address,
          province: formData.guardian.province,
          district: formData.guardian.district,
          is_primary: true,
        })
        .select()
        .single();
      
      if (guardianError) throw guardianError;
      
      // 3. Link student to guardian
      const { error: linkError } = await supabase
        .from('student_guardians')
        .insert({
          student_id: student.id,
          guardian_id: guardian.id,
          is_primary: true,
        });
      
      if (linkError) throw linkError;
      
      // 4. Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: student.id,
          academic_year_id: formData.academic_year_id,
          class_id: formData.class_id,
          monthly_fee: formData.monthly_fee,
          enrollment_fee: formData.enrollment_fee,
          discount_percent: formData.discount_percent,
          status: 'PENDENTE',
        })
        .select()
        .single();
      
      if (enrollmentError) throw enrollmentError;
      
      return { student, guardian, enrollment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Matrícula criada!',
        description: 'A matrícula foi registada com sucesso e está pendente de análise.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar matrícula',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update enrollment status
export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      status, 
      notes 
    }: { 
      enrollmentId: number; 
      status: string; 
      notes?: string;
    }) => {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      if (status === 'APROVADA') {
        updateData.approved_at = new Date().toISOString();
        // approved_by will be set by RLS context
      }
      
      const { error } = await supabase
        .from('student_enrollments')
        .update(updateData)
        .eq('id', enrollmentId);
      
      if (error) throw error;
      
      // Also update student status if approved
      if (status === 'APROVADA') {
        const { data: enrollment } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .eq('id', enrollmentId)
          .single();
        
        if (enrollment) {
          await supabase
            .from('students')
            .update({ enrollment_status: 'APROVADA' })
            .eq('id', enrollment.student_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Status atualizado',
        description: 'O estado da matrícula foi alterado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      studentId, 
      file, 
      documentType,
      documentName 
    }: { 
      studentId: number; 
      file: File; 
      documentType: DocumentType;
      documentName: string;
    }) => {
      // Upload to storage
      const filePath = `${studentId}/${documentType}_${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(filePath);
      
      // Save document record
      const { data, error } = await supabase
        .from('student_documents')
        .insert({
          student_id: studentId,
          document_type: documentType,
          document_name: documentName,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as StudentDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      toast({
        title: 'Documento carregado',
        description: 'O documento foi anexado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao carregar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (documentId: number) => {
      // Get document info first
      const { data: doc, error: fetchError } = await supabase
        .from('student_documents')
        .select('file_url, student_id')
        .eq('id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Extract file path from URL
      const urlParts = doc.file_url.split('/');
      const filePath = `${doc.student_id}/${urlParts[urlParts.length - 1]}`;
      
      // Delete from storage
      await supabase.storage
        .from('student-documents')
        .remove([filePath]);
      
      // Delete record
      const { error } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      toast({
        title: 'Documento removido',
        description: 'O documento foi eliminado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
