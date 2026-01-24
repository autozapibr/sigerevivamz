export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: number
          is_current: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: never
          is_current?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: never
          is_current?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          class_id: number | null
          created_at: string | null
          date: string
          description: string | null
          id: number
          subject_id: number | null
          title: string
          type: Database["public"]["Enums"]["calendar_event_type"]
        }
        Insert: {
          class_id?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: number
          subject_id?: number | null
          title: string
          type: Database["public"]["Enums"]["calendar_event_type"]
        }
        Update: {
          class_id?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: number
          subject_id?: number | null
          title?: string
          type?: Database["public"]["Enums"]["calendar_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      class_curriculum: {
        Row: {
          class_id: number
          subject_id: number
          teacher_id: number
        }
        Insert: {
          class_id: number
          subject_id: number
          teacher_id: number
        }
        Update: {
          class_id?: number
          subject_id?: number
          teacher_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_curriculum_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_curriculum_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_curriculum_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          id: number
          name: string
          teacher_id: number | null
          year: number
        }
        Insert: {
          id?: number
          name: string
          teacher_id?: number | null
          year: number
        }
        Update: {
          id?: number
          name?: string
          teacher_id?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          amount: number | null
          date: string | null
          discount: number | null
          id: number
          status: Database["public"]["Enums"]["payment_status"] | null
          student_name: string | null
        }
        Insert: {
          amount?: number | null
          date?: string | null
          discount?: number | null
          id?: number
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_name?: string | null
        }
        Update: {
          amount?: number | null
          date?: string | null
          discount?: number | null
          id?: number
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_name?: string | null
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          id: number
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          id?: number
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          id?: number
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: []
      }
      grades: {
        Row: {
          final_exam: number | null
          nota1: number | null
          nota2: number | null
          student_id: number
          subject_id: number
        }
        Insert: {
          final_exam?: number | null
          nota1?: number | null
          nota2?: number | null
          student_id: number
          subject_id: number
        }
        Update: {
          final_exam?: number | null
          nota1?: number | null
          nota2?: number | null
          student_id?: number
          subject_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          bi_number: string | null
          created_at: string | null
          district: string | null
          email: string | null
          full_name: string
          id: number
          is_primary: boolean | null
          nuit: string | null
          occupation: string | null
          phone: string
          phone_alt: string | null
          province: string | null
          relationship: string
          updated_at: string | null
          workplace: string | null
        }
        Insert: {
          address?: string | null
          bi_number?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          full_name: string
          id?: never
          is_primary?: boolean | null
          nuit?: string | null
          occupation?: string | null
          phone: string
          phone_alt?: string | null
          province?: string | null
          relationship: string
          updated_at?: string | null
          workplace?: string | null
        }
        Update: {
          address?: string | null
          bi_number?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          full_name?: string
          id?: never
          is_primary?: boolean | null
          nuit?: string | null
          occupation?: string | null
          phone?: string
          phone_alt?: string | null
          province?: string | null
          relationship?: string
          updated_at?: string | null
          workplace?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          id: number
          name: string
          type: Database["public"]["Enums"]["scholarship_type"]
          value: number
        }
        Insert: {
          id?: number
          name: string
          type: Database["public"]["Enums"]["scholarship_type"]
          value: number
        }
        Update: {
          id?: number
          name?: string
          type?: Database["public"]["Enums"]["scholarship_type"]
          value?: number
        }
        Relationships: []
      }
      student_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size: number | null
          file_url: string
          id: number
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          student_id: number
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size?: number | null
          file_url: string
          id?: never
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          student_id: number
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_size?: number | null
          file_url?: string
          id?: never
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          student_id?: number
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          academic_year_id: number
          approved_at: string | null
          approved_by: string | null
          class_id: number | null
          created_at: string | null
          discount_percent: number | null
          enrollment_date: string | null
          enrollment_fee: number | null
          enrollment_number: string | null
          id: number
          monthly_fee: number | null
          notes: string | null
          status: Database["public"]["Enums"]["enrollment_status"] | null
          student_id: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id: number
          approved_at?: string | null
          approved_by?: string | null
          class_id?: number | null
          created_at?: string | null
          discount_percent?: number | null
          enrollment_date?: string | null
          enrollment_fee?: number | null
          enrollment_number?: string | null
          id?: never
          monthly_fee?: number | null
          notes?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: number
          approved_at?: string | null
          approved_by?: string | null
          class_id?: number | null
          created_at?: string | null
          discount_percent?: number | null
          enrollment_date?: string | null
          enrollment_fee?: number | null
          enrollment_number?: string | null
          id?: never
          monthly_fee?: number | null
          notes?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          created_at: string | null
          guardian_id: number
          id: number
          is_primary: boolean | null
          student_id: number
        }
        Insert: {
          created_at?: string | null
          guardian_id: number
          id?: never
          is_primary?: boolean | null
          student_id: number
        }
        Update: {
          created_at?: string | null
          guardian_id?: number
          id?: never
          is_primary?: boolean | null
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scholarships: {
        Row: {
          scholarship_id: number
          student_id: number
        }
        Insert: {
          scholarship_id: number
          student_id: number
        }
        Update: {
          scholarship_id?: number
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scholarships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          age: number | null
          bi_number: string | null
          birth_date: string | null
          class_id: number | null
          created_at: string | null
          district: string | null
          email: string | null
          enrollment_status:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          guardian: string | null
          health_notes: string | null
          id: number
          name: string
          nationality: string | null
          nuit: string | null
          phone: string | null
          photo_url: string | null
          previous_school: string | null
          province: string | null
          status: Database["public"]["Enums"]["student_status"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          bi_number?: string | null
          birth_date?: string | null
          class_id?: number | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          enrollment_status?:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          guardian?: string | null
          health_notes?: string | null
          id?: number
          name: string
          nationality?: string | null
          nuit?: string | null
          phone?: string | null
          photo_url?: string | null
          previous_school?: string | null
          province?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          bi_number?: string | null
          birth_date?: string | null
          class_id?: number | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          enrollment_status?:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          guardian?: string | null
          health_notes?: string | null
          id?: number
          name?: string
          nationality?: string | null
          nuit?: string | null
          phone?: string | null
          photo_url?: string | null
          previous_school?: string | null
          province?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          id: number
          name: string
          workload: number | null
        }
        Insert: {
          code?: string | null
          id?: number
          name: string
          workload?: number | null
        }
        Update: {
          code?: string | null
          id?: number
          name?: string
          workload?: number | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          email: string | null
          id: number
          name: string
          phone: string | null
          qualifications: string | null
          status: Database["public"]["Enums"]["teacher_status"] | null
        }
        Insert: {
          email?: string | null
          id?: number
          name: string
          phone?: string | null
          qualifications?: string | null
          status?: Database["public"]["Enums"]["teacher_status"] | null
        }
        Update: {
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
          qualifications?: string | null
          status?: Database["public"]["Enums"]["teacher_status"] | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: number | null
          date: string
          description: string | null
          id: number
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          category_id?: number | null
          date: string
          description?: string | null
          id?: number
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          category_id?: number | null
          date?: string
          description?: string | null
          id?: number
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_fees: {
        Row: {
          amount: number | null
          due_date: string | null
          id: number
          month: string
          status: Database["public"]["Enums"]["tuition_status"] | null
          student_id: number
        }
        Insert: {
          amount?: number | null
          due_date?: string | null
          id?: number
          month: string
          status?: Database["public"]["Enums"]["tuition_status"] | null
          student_id: number
        }
        Update: {
          amount?: number | null
          due_date?: string | null
          id?: number
          month?: string
          status?: Database["public"]["Enums"]["tuition_status"] | null
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tuition_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "ADMIN"
        | "DIRETORIA"
        | "SECRETARIA"
        | "FINANCEIRO"
        | "PROFESSOR"
        | "PEDAGOGICO"
        | "ENCARREGADO"
      calendar_event_type: "Feriado" | "Evento" | "Prova" | "Prazo"
      document_type:
        | "BI"
        | "NUIT"
        | "CERTIDAO_NASCIMENTO"
        | "CERTIFICADO_HABILITACOES"
        | "DECLARACAO_ESCOLA_ANTERIOR"
        | "ATESTADO_MEDICO"
        | "FOTO"
        | "OUTRO"
      enrollment_status:
        | "PENDENTE"
        | "EM_ANALISE"
        | "APROVADA"
        | "REJEITADA"
        | "CANCELADA"
      gender_type: "MASCULINO" | "FEMININO"
      payment_status: "Pago" | "Pendente"
      scholarship_type: "Percentagem" | "Valor Fixo"
      student_status: "Ativo" | "Inativo"
      teacher_status: "Ativo" | "Inativo"
      transaction_type: "Receita" | "Despesa"
      tuition_status: "Pago" | "Atrasado" | "Pendente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "ADMIN",
        "DIRETORIA",
        "SECRETARIA",
        "FINANCEIRO",
        "PROFESSOR",
        "PEDAGOGICO",
        "ENCARREGADO",
      ],
      calendar_event_type: ["Feriado", "Evento", "Prova", "Prazo"],
      document_type: [
        "BI",
        "NUIT",
        "CERTIDAO_NASCIMENTO",
        "CERTIFICADO_HABILITACOES",
        "DECLARACAO_ESCOLA_ANTERIOR",
        "ATESTADO_MEDICO",
        "FOTO",
        "OUTRO",
      ],
      enrollment_status: [
        "PENDENTE",
        "EM_ANALISE",
        "APROVADA",
        "REJEITADA",
        "CANCELADA",
      ],
      gender_type: ["MASCULINO", "FEMININO"],
      payment_status: ["Pago", "Pendente"],
      scholarship_type: ["Percentagem", "Valor Fixo"],
      student_status: ["Ativo", "Inativo"],
      teacher_status: ["Ativo", "Inativo"],
      transaction_type: ["Receita", "Despesa"],
      tuition_status: ["Pago", "Atrasado", "Pendente"],
    },
  },
} as const
