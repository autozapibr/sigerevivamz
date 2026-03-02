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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_agents: {
        Row: {
          avatar: string | null
          channels: string[] | null
          conversations: number | null
          created_at: string
          description: string | null
          id: string
          knowledge_bases: string[] | null
          language: string | null
          last_active: string | null
          model: string
          name: string
          personality: string | null
          provider: string
          response_time: string | null
          satisfaction: number | null
          status: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          channels?: string[] | null
          conversations?: number | null
          created_at?: string
          description?: string | null
          id?: string
          knowledge_bases?: string[] | null
          language?: string | null
          last_active?: string | null
          model?: string
          name: string
          personality?: string | null
          provider?: string
          response_time?: string | null
          satisfaction?: number | null
          status?: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          channels?: string[] | null
          conversations?: number | null
          created_at?: string
          description?: string | null
          id?: string
          knowledge_bases?: string[] | null
          language?: string | null
          last_active?: string | null
          model?: string
          name?: string
          personality?: string | null
          provider?: string
          response_time?: string | null
          satisfaction?: number | null
          status?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          agent_id: string | null
          audience: number | null
          channel: string
          created_at: string
          delivered: number | null
          flow_id: string | null
          id: string
          message: string | null
          name: string
          opened: number | null
          replied: number | null
          schedule_type: string | null
          scheduled_at: string | null
          segment: string | null
          sent: number | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
          whatsapp_group: string | null
        }
        Insert: {
          agent_id?: string | null
          audience?: number | null
          channel?: string
          created_at?: string
          delivered?: number | null
          flow_id?: string | null
          id?: string
          message?: string | null
          name: string
          opened?: number | null
          replied?: number | null
          schedule_type?: string | null
          scheduled_at?: string | null
          segment?: string | null
          sent?: number | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          whatsapp_group?: string | null
        }
        Update: {
          agent_id?: string | null
          audience?: number | null
          channel?: string
          created_at?: string
          delivered?: number | null
          flow_id?: string | null
          id?: string
          message?: string | null
          name?: string
          opened?: number | null
          replied?: number | null
          schedule_type?: string | null
          scheduled_at?: string | null
          segment?: string | null
          sent?: number | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          whatsapp_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_columns: {
        Row: {
          color: string
          created_at: string
          id: string
          sort_order: number
          title: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          assignee: string | null
          avatar: string | null
          channel: string | null
          column_id: string
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          phone: string | null
          score: number | null
          sort_order: number
          tags: string[] | null
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          assignee?: string | null
          avatar?: string | null
          channel?: string | null
          column_id: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          phone?: string | null
          score?: number | null
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          assignee?: string | null
          avatar?: string | null
          channel?: string | null
          column_id?: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          phone?: string | null
          score?: number | null
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_leads: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          extracted_at: string | null
          id: string
          location: string | null
          name: string
          phone: string | null
          score: number | null
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          extracted_at?: string | null
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          score?: number | null
          source?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          extracted_at?: string | null
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          score?: number | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flow_edges: {
        Row: {
          created_at: string
          flow_id: string
          id: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          created_at?: string
          flow_id: string
          id?: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          created_at?: string
          flow_id?: string
          id?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_edges_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_nodes: {
        Row: {
          config: Json | null
          created_at: string
          flow_id: string
          id: string
          label: string | null
          position_x: number
          position_y: number
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          flow_id: string
          id?: string
          label?: string | null
          position_x?: number
          position_y?: number
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          flow_id?: string
          id?: string
          label?: string | null
          position_x?: number
          position_y?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_nodes_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          last_connected_at: string | null
          meow_api_key: string | null
          meow_auto_reconnect: boolean | null
          meow_base_url: string | null
          meow_instance_id: string | null
          meow_webhook_url: string | null
          meta_access_token: string | null
          meta_api_version: string | null
          meta_app_id: string | null
          meta_app_secret: string | null
          meta_business_account_id: string | null
          meta_phone_number_id: string | null
          meta_verify_token: string | null
          meta_webhook_url: string | null
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_connected_at?: string | null
          meow_api_key?: string | null
          meow_auto_reconnect?: boolean | null
          meow_base_url?: string | null
          meow_instance_id?: string | null
          meow_webhook_url?: string | null
          meta_access_token?: string | null
          meta_api_version?: string | null
          meta_app_id?: string | null
          meta_app_secret?: string | null
          meta_business_account_id?: string | null
          meta_phone_number_id?: string | null
          meta_verify_token?: string | null
          meta_webhook_url?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_connected_at?: string | null
          meow_api_key?: string | null
          meow_auto_reconnect?: boolean | null
          meow_base_url?: string | null
          meow_instance_id?: string | null
          meow_webhook_url?: string | null
          meta_access_token?: string | null
          meta_api_version?: string | null
          meta_app_id?: string | null
          meta_app_secret?: string | null
          meta_business_account_id?: string | null
          meta_phone_number_id?: string | null
          meta_verify_token?: string | null
          meta_webhook_url?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_owns_flow: { Args: { _flow_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
