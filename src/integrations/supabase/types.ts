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
    PostgrestVersion: "14.5"
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
      agreement_installments: {
        Row: {
          agreement_id: number
          amount: number
          created_at: string | null
          due_date: string
          id: number
          installment_number: number
          paid: boolean | null
          paid_at: string | null
          payment_method: string | null
        }
        Insert: {
          agreement_id: number
          amount: number
          created_at?: string | null
          due_date: string
          id?: never
          installment_number: number
          paid?: boolean | null
          paid_at?: string | null
          payment_method?: string | null
        }
        Update: {
          agreement_id?: number
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: never
          installment_number?: number
          paid?: boolean | null
          paid_at?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_installments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "payment_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: number
          id: number
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: number
          id?: never
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: number
          id?: never
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          class_ids: number[] | null
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: number
          is_published: boolean | null
          priority: string
          published_at: string | null
          target_audience: string[]
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          class_ids?: number[] | null
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: never
          is_published?: boolean | null
          priority?: string
          published_at?: string | null
          target_audience?: string[]
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          class_ids?: number[] | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: never
          is_published?: boolean | null
          priority?: string
          published_at?: string | null
          target_audience?: string[]
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class_id: number
          created_at: string | null
          date: string
          id: number
          observation: string | null
          recorded_by: string | null
          status: string
          student_id: number
          subject_id: number | null
          updated_at: string | null
        }
        Insert: {
          class_id: number
          created_at?: string | null
          date?: string
          id?: never
          observation?: string | null
          recorded_by?: string | null
          status: string
          student_id: number
          subject_id?: number | null
          updated_at?: string | null
        }
        Update: {
          class_id?: number
          created_at?: string | null
          date?: string
          id?: never
          observation?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: number
          subject_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_role: string | null
          diff: Json | null
          id: number
          new_data: Json | null
          occurred_at: string
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          diff?: Json | null
          id?: never
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          diff?: Json | null
          id?: never
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          class_id: number | null
          color: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_time: string | null
          id: number
          is_all_day: boolean | null
          location: string | null
          recurrence: string | null
          start_time: string | null
          subject_id: number | null
          title: string
          type: Database["public"]["Enums"]["calendar_event_type"]
          updated_at: string | null
        }
        Insert: {
          class_id?: number | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_time?: string | null
          id?: never
          is_all_day?: boolean | null
          location?: string | null
          recurrence?: string | null
          start_time?: string | null
          subject_id?: number | null
          title: string
          type: Database["public"]["Enums"]["calendar_event_type"]
          updated_at?: string | null
        }
        Update: {
          class_id?: number | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string | null
          id?: never
          is_all_day?: boolean | null
          location?: string | null
          recurrence?: string | null
          start_time?: string | null
          subject_id?: number | null
          title?: string
          type?: Database["public"]["Enums"]["calendar_event_type"]
          updated_at?: string | null
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
            foreignKeyName: "calendar_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
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
          created_at: string | null
          id: number
          shift: string | null
          subject_id: number
          teacher_id: number
          updated_at: string | null
          weekly_hours: number | null
        }
        Insert: {
          class_id: number
          created_at?: string | null
          id?: number
          shift?: string | null
          subject_id: number
          teacher_id: number
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Update: {
          class_id?: number
          created_at?: string | null
          id?: number
          shift?: string | null
          subject_id?: number
          teacher_id?: number
          updated_at?: string | null
          weekly_hours?: number | null
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
            foreignKeyName: "class_curriculum_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
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
          id?: never
          name: string
          teacher_id?: number | null
          year: number
        }
        Update: {
          id?: never
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
      communication_history: {
        Row: {
          agreement_id: number | null
          communication_type: Database["public"]["Enums"]["communication_type"]
          created_at: string | null
          delivered_at: string | null
          external_id: string | null
          external_response: Json | null
          id: number
          message_content: string
          message_template: string | null
          read_at: string | null
          recipient_email: string | null
          recipient_name: string
          recipient_phone: string | null
          scheduled_at: string | null
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["communication_status"] | null
          student_id: number | null
          tuition_fee_id: number | null
        }
        Insert: {
          agreement_id?: number | null
          communication_type: Database["public"]["Enums"]["communication_type"]
          created_at?: string | null
          delivered_at?: string | null
          external_id?: string | null
          external_response?: Json | null
          id?: never
          message_content: string
          message_template?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_name: string
          recipient_phone?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["communication_status"] | null
          student_id?: number | null
          tuition_fee_id?: number | null
        }
        Update: {
          agreement_id?: number | null
          communication_type?: Database["public"]["Enums"]["communication_type"]
          created_at?: string | null
          delivered_at?: string | null
          external_id?: string | null
          external_response?: Json | null
          id?: never
          message_content?: string
          message_template?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["communication_status"] | null
          student_id?: number | null
          tuition_fee_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "communication_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_history_tuition_fee_id_fkey"
            columns: ["tuition_fee_id"]
            isOneToOne: false
            referencedRelation: "tuition_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          contract_html: string
          contract_number: string | null
          contract_type: string
          created_at: string | null
          created_by: string | null
          id: number
          sent_at: string | null
          sent_to: string | null
          sent_via: string | null
          signature_data: string | null
          signature_ip: string | null
          signature_token: string | null
          signature_user_agent: string | null
          signed_at: string | null
          staff_id: number
          staff_name: string
          staff_type: string
          status: string
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          contract_html: string
          contract_number?: string | null
          contract_type: string
          created_at?: string | null
          created_by?: string | null
          id?: never
          sent_at?: string | null
          sent_to?: string | null
          sent_via?: string | null
          signature_data?: string | null
          signature_ip?: string | null
          signature_token?: string | null
          signature_user_agent?: string | null
          signed_at?: string | null
          staff_id: number
          staff_name: string
          staff_type: string
          status?: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_html?: string
          contract_number?: string | null
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: never
          sent_at?: string | null
          sent_to?: string | null
          sent_via?: string | null
          signature_data?: string | null
          signature_ip?: string | null
          signature_token?: string | null
          signature_user_agent?: string | null
          signed_at?: string | null
          staff_id?: number
          staff_name?: string
          staff_type?: string
          status?: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      db_ativo: {
        Row: {
          criado_em: string | null
          id: number
          num: number
        }
        Insert: {
          criado_em?: string | null
          id?: never
          num: number
        }
        Update: {
          criado_em?: string | null
          id?: never
          num?: number
        }
        Relationships: []
      }
      dictionary_queries: {
        Row: {
          found: boolean | null
          id: number
          requested_at: string | null
          source: string | null
          word: string
        }
        Insert: {
          found?: boolean | null
          id?: number
          requested_at?: string | null
          source?: string | null
          word: string
        }
        Update: {
          found?: boolean | null
          id?: number
          requested_at?: string | null
          source?: string | null
          word?: string
        }
        Relationships: []
      }
      dictionary_translations: {
        Row: {
          definition_pt: string
          id: number
          source: string | null
          translated_at: string | null
          word_id: number
        }
        Insert: {
          definition_pt: string
          id?: number
          source?: string | null
          translated_at?: string | null
          word_id: number
        }
        Update: {
          definition_pt?: string
          id?: number
          source?: string | null
          translated_at?: string | null
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "dictionary_translations_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: true
            referencedRelation: "dictionary_webster"
            referencedColumns: ["id"]
          },
        ]
      }
      dictionary_webster: {
        Row: {
          created_at: string | null
          definition: string
          etymology: string | null
          id: number
          page_number: number | null
          word: string
          word_type: string | null
        }
        Insert: {
          created_at?: string | null
          definition: string
          etymology?: string | null
          id?: number
          page_number?: number | null
          word: string
          word_type?: string | null
        }
        Update: {
          created_at?: string | null
          definition?: string
          etymology?: string | null
          id?: number
          page_number?: number | null
          word?: string
          word_type?: string | null
        }
        Relationships: []
      }
      education_level_fees: {
        Row: {
          academic_year_id: number | null
          created_at: string | null
          education_level_id: number | null
          enrollment_fee: number
          id: number
          monthly_fee: number
          re_enrollment_fee: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: number | null
          created_at?: string | null
          education_level_id?: number | null
          enrollment_fee?: number
          id?: number
          monthly_fee?: number
          re_enrollment_fee?: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: number | null
          created_at?: string | null
          education_level_id?: number | null
          enrollment_fee?: number
          id?: number
          monthly_fee?: number
          re_enrollment_fee?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_level_fees_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_level_fees_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      education_levels: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          bi_number: string | null
          birth_date: string | null
          contract_end: string | null
          contract_number: string | null
          contract_start: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          district: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          gender: string | null
          hire_date: string | null
          id: number
          mobile_money_number: string | null
          mobile_money_provider: string | null
          name: string
          nuit: string | null
          payment_method: string | null
          phone: string | null
          photo_url: string | null
          province: string | null
          role: string
          salary: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bi_number?: string | null
          birth_date?: string | null
          contract_end?: string | null
          contract_number?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          district?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: never
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          name: string
          nuit?: string | null
          payment_method?: string | null
          phone?: string | null
          photo_url?: string | null
          province?: string | null
          role: string
          salary?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bi_number?: string | null
          birth_date?: string | null
          contract_end?: string | null
          contract_number?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          district?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: never
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          name?: string
          nuit?: string | null
          payment_method?: string | null
          phone?: string | null
          photo_url?: string | null
          province?: string | null
          role?: string
          salary?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      enrollment_periods: {
        Row: {
          academic_year_id: number | null
          created_at: string | null
          education_level_id: number | null
          end_date: string
          id: number
          is_active: boolean | null
          start_date: string
          type: Database["public"]["Enums"]["enrollment_type"]
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: number | null
          created_at?: string | null
          education_level_id?: number | null
          end_date: string
          id?: number
          is_active?: boolean | null
          start_date: string
          type: Database["public"]["Enums"]["enrollment_type"]
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: number | null
          created_at?: string | null
          education_level_id?: number | null
          end_date?: string
          id?: number
          is_active?: boolean | null
          start_date?: string
          type?: Database["public"]["Enums"]["enrollment_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_periods_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_periods_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
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
          id?: never
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_name?: string | null
        }
        Update: {
          amount?: number | null
          date?: string | null
          discount?: number | null
          id?: never
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_name?: string | null
        }
        Relationships: []
      }
      exam_notifications: {
        Row: {
          calendar_event_id: number
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          notification_type: string
          read_at: string | null
          recipient_class_id: number | null
          recipient_role: Database["public"]["Enums"]["app_role"] | null
          recipient_user_id: string | null
          sent_via_whatsapp: boolean | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          calendar_event_id: number
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message: string
          notification_type?: string
          read_at?: string | null
          recipient_class_id?: number | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          recipient_user_id?: string | null
          sent_via_whatsapp?: boolean | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          calendar_event_id?: number
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message?: string
          notification_type?: string
          read_at?: string | null
          recipient_class_id?: number | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          recipient_user_id?: string | null
          sent_via_whatsapp?: boolean | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_notifications_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_notifications_recipient_class_id_fkey"
            columns: ["recipient_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_notifications_recipient_class_id_fkey"
            columns: ["recipient_class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          id: number
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          id?: never
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          id?: never
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: []
      }
      grades: {
        Row: {
          academic_year_id: number | null
          acf: number | null
          acp: number | null
          acs: number | null
          acs1: number | null
          acs2: number | null
          acs3: number | null
          at: number | null
          class_id: number | null
          created_at: string | null
          final_exam: number | null
          media_final: number | null
          media_trimestral: number | null
          nota1: number | null
          nota2: number | null
          observation: string | null
          recorded_by: string | null
          student_id: number
          subject_id: number
          trimestre: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: number | null
          acf?: number | null
          acp?: number | null
          acs?: number | null
          acs1?: number | null
          acs2?: number | null
          acs3?: number | null
          at?: number | null
          class_id?: number | null
          created_at?: string | null
          final_exam?: number | null
          media_final?: number | null
          media_trimestral?: number | null
          nota1?: number | null
          nota2?: number | null
          observation?: string | null
          recorded_by?: string | null
          student_id: number
          subject_id: number
          trimestre?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: number | null
          acf?: number | null
          acp?: number | null
          acs?: number | null
          acs1?: number | null
          acs2?: number | null
          acs3?: number | null
          at?: number | null
          class_id?: number | null
          created_at?: string | null
          final_exam?: number | null
          media_final?: number | null
          media_trimestral?: number | null
          nota1?: number | null
          nota2?: number | null
          observation?: string | null
          recorded_by?: string | null
          student_id?: number
          subject_id?: number
          trimestre?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
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
      integration_settings: {
        Row: {
          additional_config: Json | null
          api_key: string | null
          api_url: string | null
          created_at: string | null
          created_by: string | null
          id: number
          instance_name: string | null
          integration_name: string
          is_active: boolean | null
          last_test_success: boolean | null
          last_tested_at: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          additional_config?: Json | null
          api_key?: string | null
          api_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: never
          instance_name?: string | null
          integration_name: string
          is_active?: boolean | null
          last_test_success?: boolean | null
          last_tested_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          additional_config?: Json | null
          api_key?: string | null
          api_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: never
          instance_name?: string | null
          integration_name?: string
          is_active?: boolean | null
          last_test_success?: boolean | null
          last_tested_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      lesson_plan_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          description: string | null
          id: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          description?: string | null
          id?: never
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          description?: string | null
          id?: never
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      lesson_plan_fields: {
        Row: {
          created_at: string | null
          display_order: number
          field_label: string
          field_name: string
          field_type: string
          id: number
          is_active: boolean | null
          is_required: boolean | null
          options: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          field_label: string
          field_name: string
          field_type?: string
          id?: never
          is_active?: boolean | null
          is_required?: boolean | null
          options?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          field_label?: string
          field_name?: string
          field_type?: string
          id?: never
          is_active?: boolean | null
          is_required?: boolean | null
          options?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_plan_training_docs: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: number
          is_active: boolean | null
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: never
          is_active?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: never
          is_active?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          class_id: number | null
          created_at: string | null
          form_data: Json
          generated_content: string
          id: number
          status: string
          subject_id: number | null
          teacher_id: string
          teacher_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          class_id?: number | null
          created_at?: string | null
          form_data?: Json
          generated_content: string
          id?: never
          status?: string
          subject_id?: number | null
          teacher_id: string
          teacher_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: number | null
          created_at?: string | null
          form_data?: Json
          generated_content?: string
          id?: never
          status?: string
          subject_id?: number | null
          teacher_id?: string
          teacher_name?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "lesson_plans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_agreements: {
        Row: {
          agreed_amount: number
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: number
          installment_amount: number | null
          installments: number | null
          notes: string | null
          original_amount: number
          promised_date: string | null
          status: Database["public"]["Enums"]["payment_agreement_status"] | null
          student_id: number
          tuition_fee_id: number
          updated_at: string | null
        }
        Insert: {
          agreed_amount: number
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: never
          installment_amount?: number | null
          installments?: number | null
          notes?: string | null
          original_amount: number
          promised_date?: string | null
          status?:
            | Database["public"]["Enums"]["payment_agreement_status"]
            | null
          student_id: number
          tuition_fee_id: number
          updated_at?: string | null
        }
        Update: {
          agreed_amount?: number
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: never
          installment_amount?: number | null
          installments?: number | null
          notes?: string | null
          original_amount?: number
          promised_date?: string | null
          status?:
            | Database["public"]["Enums"]["payment_agreement_status"]
            | null
          student_id?: number
          tuition_fee_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_agreements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payment_agreements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_agreements_tuition_fee_id_fkey"
            columns: ["tuition_fee_id"]
            isOneToOne: false
            referencedRelation: "tuition_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      pedagogical_settings: {
        Row: {
          academic_year: number
          created_at: string
          id: string
          release_status: Database["public"]["Enums"]["release_status"]
          released_at: string | null
          trimestre: number
          updated_at: string
        }
        Insert: {
          academic_year: number
          created_at?: string
          id?: string
          release_status?: Database["public"]["Enums"]["release_status"]
          released_at?: string | null
          trimestre: number
          updated_at?: string
        }
        Update: {
          academic_year?: number
          created_at?: string
          id?: string
          release_status?: Database["public"]["Enums"]["release_status"]
          released_at?: string | null
          trimestre?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          employee_id: number | null
          full_name: string | null
          student_id: number | null
          teacher_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          employee_id?: number | null
          full_name?: string | null
          student_id?: number | null
          teacher_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          employee_id?: number | null
          full_name?: string | null
          student_id?: number | null
          teacher_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_invitations: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          expires_at: string
          id: string
          intended_name: string | null
          intended_role: Database["public"]["Enums"]["app_role"]
          is_used: boolean
          notes: string | null
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          expires_at?: string
          id?: string
          intended_name?: string | null
          intended_role?: Database["public"]["Enums"]["app_role"]
          is_used?: boolean
          notes?: string | null
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          expires_at?: string
          id?: string
          intended_name?: string | null
          intended_role?: Database["public"]["Enums"]["app_role"]
          is_used?: boolean
          notes?: string | null
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          done_at: string | null
          done_by: string | null
          id: string
          is_done: boolean
          notes: string | null
          phase: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          done_at?: string | null
          done_by?: string | null
          id: string
          is_done?: boolean
          notes?: string | null
          phase: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          done_at?: string | null
          done_by?: string | null
          id?: string
          is_done?: boolean
          notes?: string | null
          phase?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_module_access: {
        Row: {
          id: number
          is_enabled: boolean
          module_key: string
          role: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: never
          is_enabled?: boolean
          module_key: string
          role: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: never
          is_enabled?: boolean
          module_key?: string
          role?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      scheduled_reminders: {
        Row: {
          agreement_id: number | null
          channel: Database["public"]["Enums"]["communication_type"] | null
          communication_id: number | null
          created_at: string | null
          id: number
          processed: boolean | null
          processed_at: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          scheduled_for: string
          student_id: number
          tuition_fee_id: number | null
        }
        Insert: {
          agreement_id?: number | null
          channel?: Database["public"]["Enums"]["communication_type"] | null
          communication_id?: number | null
          created_at?: string | null
          id?: never
          processed?: boolean | null
          processed_at?: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          scheduled_for: string
          student_id: number
          tuition_fee_id?: number | null
        }
        Update: {
          agreement_id?: number | null
          channel?: Database["public"]["Enums"]["communication_type"] | null
          communication_id?: number | null
          created_at?: string | null
          id?: never
          processed?: boolean | null
          processed_at?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          scheduled_for?: string
          student_id?: number
          tuition_fee_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reminders_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "payment_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reminders_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communication_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reminders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "scheduled_reminders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reminders_tuition_fee_id_fkey"
            columns: ["tuition_fee_id"]
            isOneToOne: false
            referencedRelation: "tuition_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          id: number
          name: string
          type: Database["public"]["Enums"]["scholarship_type"]
          value: number
        }
        Insert: {
          id?: never
          name: string
          type: Database["public"]["Enums"]["scholarship_type"]
          value: number
        }
        Update: {
          id?: never
          name?: string
          type?: Database["public"]["Enums"]["scholarship_type"]
          value?: number
        }
        Relationships: []
      }
      staff_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: number
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          staff_id: number
          staff_type: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: never
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          staff_id: number
          staff_type: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: never
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          staff_id?: number
          staff_type?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
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
          enrollment_type: Database["public"]["Enums"]["enrollment_type"] | null
          id: number
          monthly_fee: number | null
          notes: string | null
          previous_enrollment_id: number | null
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
          enrollment_type?:
            | Database["public"]["Enums"]["enrollment_type"]
            | null
          id?: never
          monthly_fee?: number | null
          notes?: string | null
          previous_enrollment_id?: number | null
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
          enrollment_type?:
            | Database["public"]["Enums"]["enrollment_type"]
            | null
          id?: never
          monthly_fee?: number | null
          notes?: string | null
          previous_enrollment_id?: number | null
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
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "student_enrollments_previous_enrollment_id_fkey"
            columns: ["previous_enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
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
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
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
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
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
          id?: never
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
          id?: never
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
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
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
          id?: never
          name: string
          workload?: number | null
        }
        Update: {
          code?: string | null
          id?: never
          name?: string
          workload?: number | null
        }
        Relationships: []
      }
      teacher_files: {
        Row: {
          category: string
          class_id: number | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: number
          mime_type: string | null
          subject_id: number | null
          teacher_name: string
          teacher_user_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          class_id?: number | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: never
          mime_type?: string | null
          subject_id?: number | null
          teacher_name: string
          teacher_user_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          class_id?: number | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: never
          mime_type?: string | null
          subject_id?: number | null
          teacher_name?: string
          teacher_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_files_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_files_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "teacher_files_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          bi_number: string | null
          birth_date: string | null
          contract_end: string | null
          contract_number: string | null
          contract_start: string | null
          contract_type: string | null
          created_at: string | null
          district: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          gender: string | null
          hire_date: string | null
          id: number
          mobile_money_number: string | null
          mobile_money_provider: string | null
          name: string
          nuit: string | null
          payment_method: string | null
          phone: string | null
          photo_url: string | null
          province: string | null
          qualifications: string | null
          salary: number | null
          status: Database["public"]["Enums"]["teacher_status"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bi_number?: string | null
          birth_date?: string | null
          contract_end?: string | null
          contract_number?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: never
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          name: string
          nuit?: string | null
          payment_method?: string | null
          phone?: string | null
          photo_url?: string | null
          province?: string | null
          qualifications?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["teacher_status"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bi_number?: string | null
          birth_date?: string | null
          contract_end?: string | null
          contract_number?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: never
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          name?: string
          nuit?: string | null
          payment_method?: string | null
          phone?: string | null
          photo_url?: string | null
          province?: string | null
          qualifications?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["teacher_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: number
          is_internal: boolean | null
          message: string
          sender_id: string | null
          sender_name: string
          sender_role: string | null
          ticket_id: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_internal?: boolean | null
          message: string
          sender_id?: string | null
          sender_name: string
          sender_role?: string | null
          ticket_id: number
        }
        Update: {
          created_at?: string | null
          id?: never
          is_internal?: boolean | null
          message?: string
          sender_id?: string | null
          sender_name?: string
          sender_role?: string | null
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          recipient_name: string | null
          recipient_role: string | null
          ticket_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message: string
          recipient_name?: string | null
          recipient_role?: string | null
          ticket_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message?: string
          recipient_name?: string | null
          recipient_role?: string | null
          ticket_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_notifications_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_department: string | null
          assigned_to: string | null
          assigned_to_name: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string
          created_by_role: string | null
          description: string
          id: number
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_department?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_name: string
          created_by_role?: string | null
          description: string
          id?: never
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_department?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string
          created_by_role?: string | null
          description?: string
          id?: never
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string | null
          title?: string
          updated_at?: string | null
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
          id?: never
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          category_id?: number | null
          date?: string
          description?: string | null
          id?: never
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
          paid_at: string | null
          status: Database["public"]["Enums"]["tuition_status"] | null
          student_id: number
        }
        Insert: {
          amount?: number | null
          due_date?: string | null
          id?: never
          month: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["tuition_status"] | null
          student_id: number
        }
        Update: {
          amount?: number | null
          due_date?: string | null
          id?: never
          month?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["tuition_status"] | null
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tuition_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_stats"
            referencedColumns: ["student_id"]
          },
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
          role?: Database["public"]["Enums"]["app_role"]
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
      contract_signatures_signing: {
        Row: {
          contract_html: string | null
          contract_type: string | null
          id: number | null
          signature_token: string | null
          staff_name: string | null
          status: string | null
          token_expires_at: string | null
        }
        Insert: {
          contract_html?: string | null
          contract_type?: string | null
          id?: number | null
          signature_token?: string | null
          staff_name?: string | null
          status?: string | null
          token_expires_at?: string | null
        }
        Update: {
          contract_html?: string | null
          contract_type?: string | null
          id?: number | null
          signature_token?: string | null
          staff_name?: string | null
          status?: string | null
          token_expires_at?: string | null
        }
        Relationships: []
      }
      employees_public_info: {
        Row: {
          contract_type: string | null
          created_at: string | null
          department: string | null
          district: string | null
          email: string | null
          gender: string | null
          hire_date: string | null
          id: number | null
          name: string | null
          phone: string | null
          photo_url: string | null
          province: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          district?: string | null
          email?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: number | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          province?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          district?: string | null
          email?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: number | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          province?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_attendance_stats: {
        Row: {
          atrasos: number | null
          class_id: number | null
          class_name: string | null
          faltas: number | null
          faltas_justificadas: number | null
          presencas: number | null
          student_id: number | null
          student_name: string | null
          taxa_presenca: number | null
          total_dias: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_final_average: {
        Args: { _t1: number; _t2: number; _t3: number }
        Returns: number
      }
      calculate_trimester_average:
        | {
            Args: { _acf: number; _acp: number; _acs: number }
            Returns: number
          }
        | {
            Args: { acf: number; acp: number[]; acs: number[] }
            Returns: number
          }
      classify_grade: { Args: { _grade: number }; Returns: string }
      consume_invitation: {
        Args: { _token: string; _user_id: string }
        Returns: boolean
      }
      get_contract_for_signing: {
        Args: { _token: string }
        Returns: {
          contract_html: string
          contract_type: string
          id: number
          staff_name: string
          status: string
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      supaon_cleanup_if_due: { Args: never; Returns: undefined }
      supaon_insert_next: { Args: never; Returns: undefined }
      validate_invitation: {
        Args: { _token: string }
        Returns: {
          email: string
          id: string
          intended_name: string
          intended_role: Database["public"]["Enums"]["app_role"]
          is_valid: boolean
        }[]
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
        | "ALUNO"
      calendar_event_type:
        | "Feriado"
        | "Evento"
        | "Prova"
        | "Prazo"
        | "Actividade"
      communication_status:
        | "ENVIADO"
        | "ENTREGUE"
        | "LIDO"
        | "FALHOU"
        | "AGENDADO"
      communication_type:
        | "WHATSAPP"
        | "SMS"
        | "TELEFONE"
        | "EMAIL"
        | "PRESENCIAL"
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
      enrollment_type: "NEW" | "RENEWAL"
      gender_type: "MASCULINO" | "FEMININO"
      payment_agreement_status:
        | "PENDENTE"
        | "ATIVO"
        | "CUMPRIDO"
        | "QUEBRADO"
        | "CANCELADO"
      payment_status: "Pago" | "Pendente"
      release_status: "draft" | "review" | "released"
      reminder_type:
        | "VENCIMENTO_PROXIMO"
        | "DIA_VENCIMENTO"
        | "ATRASO_LEVE"
        | "ATRASO_MODERADO"
        | "ATRASO_GRAVE"
        | "PARCELA_ACORDO"
      scholarship_type: "Percentagem" | "Valor Fixo"
      student_status: "Ativo" | "Inativo"
      teacher_status: "Ativo" | "Inativo"
      ticket_category:
        | "RECLAMACAO"
        | "INFORMACAO"
        | "SUGESTAO"
        | "SUPORTE"
        | "FINANCEIRO"
        | "PEDAGOGICO"
        | "RH"
        | "OUTRO"
        | "SECRETARIA"
      ticket_priority: "BAIXA" | "NORMAL" | "ALTA" | "URGENTE"
      ticket_status:
        | "ABERTO"
        | "EM_ANDAMENTO"
        | "AGUARDANDO"
        | "RESOLVIDO"
        | "FECHADO"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "ALUNO",
      ],
      calendar_event_type: [
        "Feriado",
        "Evento",
        "Prova",
        "Prazo",
        "Actividade",
      ],
      communication_status: [
        "ENVIADO",
        "ENTREGUE",
        "LIDO",
        "FALHOU",
        "AGENDADO",
      ],
      communication_type: [
        "WHATSAPP",
        "SMS",
        "TELEFONE",
        "EMAIL",
        "PRESENCIAL",
      ],
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
      enrollment_type: ["NEW", "RENEWAL"],
      gender_type: ["MASCULINO", "FEMININO"],
      payment_agreement_status: [
        "PENDENTE",
        "ATIVO",
        "CUMPRIDO",
        "QUEBRADO",
        "CANCELADO",
      ],
      payment_status: ["Pago", "Pendente"],
      release_status: ["draft", "review", "released"],
      reminder_type: [
        "VENCIMENTO_PROXIMO",
        "DIA_VENCIMENTO",
        "ATRASO_LEVE",
        "ATRASO_MODERADO",
        "ATRASO_GRAVE",
        "PARCELA_ACORDO",
      ],
      scholarship_type: ["Percentagem", "Valor Fixo"],
      student_status: ["Ativo", "Inativo"],
      teacher_status: ["Ativo", "Inativo"],
      ticket_category: [
        "RECLAMACAO",
        "INFORMACAO",
        "SUGESTAO",
        "SUPORTE",
        "FINANCEIRO",
        "PEDAGOGICO",
        "RH",
        "OUTRO",
        "SECRETARIA",
      ],
      ticket_priority: ["BAIXA", "NORMAL", "ALTA", "URGENTE"],
      ticket_status: [
        "ABERTO",
        "EM_ANDAMENTO",
        "AGUARDANDO",
        "RESOLVIDO",
        "FECHADO",
      ],
      transaction_type: ["Receita", "Despesa"],
      tuition_status: ["Pago", "Atrasado", "Pendente"],
    },
  },
} as const
