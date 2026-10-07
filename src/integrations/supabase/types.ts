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
      app_settings: {
        Row: {
          company_name: string
          id: boolean
          logo_url: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
          whatsapp_template: string
        }
        Insert: {
          company_name?: string
          id?: boolean
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_template?: string
        }
        Update: {
          company_name?: string
          id?: boolean
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_template?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      machine_change_log: {
        Row: {
          created_at: string
          field: string
          id: string
          machine_id: string | null
          machine_label: string
          new_value: string | null
          old_value: string | null
          technical_last_validated_at: string | null
          technical_source: string | null
          user_id: string | null
          validator_id: string | null
        }
        Insert: {
          created_at?: string
          field: string
          id?: string
          machine_id?: string | null
          machine_label?: string
          new_value?: string | null
          old_value?: string | null
          technical_last_validated_at?: string | null
          technical_source?: string | null
          user_id?: string | null
          validator_id?: string | null
        }
        Update: {
          created_at?: string
          field?: string
          id?: string
          machine_id?: string | null
          machine_label?: string
          new_value?: string | null
          old_value?: string | null
          technical_last_validated_at?: string | null
          technical_source?: string | null
          user_id?: string | null
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machine_change_log_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_images: {
        Row: {
          ai_generated: boolean
          created_at: string
          id: string
          image_url: string
          is_main: boolean
          label: string | null
          machine_id: string
          sort_order: number
          storage_path: string | null
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          image_url: string
          is_main?: boolean
          label?: string | null
          machine_id: string
          sort_order?: number
          storage_path?: string | null
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          image_url?: string
          is_main?: boolean
          label?: string | null
          machine_id?: string
          sort_order?: number
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machine_images_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          applications: string[] | null
          brand: string
          bucket_capacity: string | null
          bucket_capacity_front: string | null
          bucket_capacity_rear: string | null
          category: string
          code: string | null
          condition: string | null
          created_at: string
          description: string | null
          digging_force: string | null
          dimensions: string | null
          display_name: string
          down_payment: number | null
          dump_height: string | null
          engine: string | null
          hours: string | null
          hydraulic_flow: string | null
          hydraulic_pressure: string | null
          hydraulic_system: string | null
          id: string
          installment: number | null
          location: string | null
          max_digging_depth: string | null
          max_reach: string | null
          max_speed: string | null
          model: string
          notes: string | null
          operating_weight: string | null
          power: string | null
          price: number | null
          qualities: string[] | null
          status: string
          status_bucket_capacity:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_dump_height:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_engine:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_hydraulic_flow:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_max_digging_depth:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_max_reach:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_operating_weight:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_power:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_transmission:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          tank_capacity: string | null
          technical_last_validated_at: string | null
          technical_source: string | null
          technical_validated_by: string | null
          transmission: string | null
          updated_at: string
          version_config: string | null
          year: number | null
        }
        Insert: {
          applications?: string[] | null
          brand: string
          bucket_capacity?: string | null
          bucket_capacity_front?: string | null
          bucket_capacity_rear?: string | null
          category: string
          code?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          digging_force?: string | null
          dimensions?: string | null
          display_name?: string
          down_payment?: number | null
          dump_height?: string | null
          engine?: string | null
          hours?: string | null
          hydraulic_flow?: string | null
          hydraulic_pressure?: string | null
          hydraulic_system?: string | null
          id?: string
          installment?: number | null
          location?: string | null
          max_digging_depth?: string | null
          max_reach?: string | null
          max_speed?: string | null
          model: string
          notes?: string | null
          operating_weight?: string | null
          power?: string | null
          price?: number | null
          qualities?: string[] | null
          status?: string
          status_bucket_capacity?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_dump_height?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_engine?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_hydraulic_flow?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_max_digging_depth?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_max_reach?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_operating_weight?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_power?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_transmission?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          tank_capacity?: string | null
          technical_last_validated_at?: string | null
          technical_source?: string | null
          technical_validated_by?: string | null
          transmission?: string | null
          updated_at?: string
          version_config?: string | null
          year?: number | null
        }
        Update: {
          applications?: string[] | null
          brand?: string
          bucket_capacity?: string | null
          bucket_capacity_front?: string | null
          bucket_capacity_rear?: string | null
          category?: string
          code?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          digging_force?: string | null
          dimensions?: string | null
          display_name?: string
          down_payment?: number | null
          dump_height?: string | null
          engine?: string | null
          hours?: string | null
          hydraulic_flow?: string | null
          hydraulic_pressure?: string | null
          hydraulic_system?: string | null
          id?: string
          installment?: number | null
          location?: string | null
          max_digging_depth?: string | null
          max_reach?: string | null
          max_speed?: string | null
          model?: string
          notes?: string | null
          operating_weight?: string | null
          power?: string | null
          price?: number | null
          qualities?: string[] | null
          status?: string
          status_bucket_capacity?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_dump_height?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_engine?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_hydraulic_flow?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_max_digging_depth?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_max_reach?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_operating_weight?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_power?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          status_transmission?:
            | Database["public"]["Enums"]["spec_validation_status"]
            | null
          tank_capacity?: string | null
          technical_last_validated_at?: string | null
          technical_source?: string | null
          technical_validated_by?: string | null
          transmission?: string | null
          updated_at?: string
          version_config?: string | null
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "vendedor"
      spec_validation_status: "confirmed" | "review" | "not_confirmed"
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
      app_role: ["admin", "vendedor"],
      spec_validation_status: ["confirmed", "review", "not_confirmed"],
    },
  },
} as const
