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
          age: number | null
          class_id: number | null
          guardian: string | null
          id: number
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["student_status"] | null
        }
        Insert: {
          age?: number | null
          class_id?: number | null
          guardian?: string | null
          id?: number
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
        }
        Update: {
          age?: number | null
          class_id?: number | null
          guardian?: string | null
          id?: number
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
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
      payment_status: ["Pago", "Pendente"],
      scholarship_type: ["Percentagem", "Valor Fixo"],
      student_status: ["Ativo", "Inativo"],
      teacher_status: ["Ativo", "Inativo"],
      transaction_type: ["Receita", "Despesa"],
      tuition_status: ["Pago", "Atrasado", "Pendente"],
    },
  },
} as const
