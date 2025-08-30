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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          entity: string
          entity_id: string
          id: string
          ip_address: unknown | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          entity: string
          entity_id: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          entity?: string
          entity_id?: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      case_notes: {
        Row: {
          attachments: string[] | null
          case_id: string
          content: string
          created_at: string | null
          created_by: string
          id: string
          type: Database["public"]["Enums"]["note_type"] | null
        }
        Insert: {
          attachments?: string[] | null
          case_id: string
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          type?: Database["public"]["Enums"]["note_type"] | null
        }
        Update: {
          attachments?: string[] | null
          case_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          type?: Database["public"]["Enums"]["note_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cases: {
        Row: {
          actual_close_date: string | null
          assigned_to: string[] | null
          case_number: string
          case_password: string | null
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          estimated_close_date: string | null
          id: string
          location: string | null
          priority: Database["public"]["Enums"]["case_priority"] | null
          status: Database["public"]["Enums"]["case_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to?: string[] | null
          case_number: string
          case_password?: string | null
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          estimated_close_date?: string | null
          id?: string
          location?: string | null
          priority?: Database["public"]["Enums"]["case_priority"] | null
          status?: Database["public"]["Enums"]["case_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string[] | null
          case_number?: string
          case_password?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          estimated_close_date?: string | null
          id?: string
          location?: string | null
          priority?: Database["public"]["Enums"]["case_priority"] | null
          status?: Database["public"]["Enums"]["case_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chain_of_custody: {
        Row: {
          action: Database["public"]["Enums"]["custody_action"]
          evidence_id: string
          handled_at: string | null
          handled_by: string
          id: string
          location: string | null
          notes: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["custody_action"]
          evidence_id: string
          handled_at?: string | null
          handled_by: string
          id?: string
          location?: string | null
          notes?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["custody_action"]
          evidence_id?: string
          handled_at?: string | null
          handled_by?: string
          id?: string
          location?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chain_of_custody_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_of_custody_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      evidence: {
        Row: {
          case_id: string
          category: string | null
          collected_at: string | null
          collected_by: string
          created_at: string | null
          description: string | null
          evidence_number: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          hash: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["evidence_status"] | null
          storage_location: string | null
          tags: string[] | null
          type: Database["public"]["Enums"]["evidence_type"]
          updated_at: string | null
        }
        Insert: {
          case_id: string
          category?: string | null
          collected_at?: string | null
          collected_by: string
          created_at?: string | null
          description?: string | null
          evidence_number?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          hash?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["evidence_status"] | null
          storage_location?: string | null
          tags?: string[] | null
          type: Database["public"]["Enums"]["evidence_type"]
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          category?: string | null
          collected_at?: string | null
          collected_by?: string
          created_at?: string | null
          description?: string | null
          evidence_number?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          hash?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["evidence_status"] | null
          storage_location?: string | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["evidence_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          id: string
          related_entity: string
          related_entity_id: string
          upload_path: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          id?: string
          related_entity: string
          related_entity_id: string
          upload_path: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          related_entity?: string
          related_entity_id?: string
          upload_path?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          case_id: string
          content: string
          file_path: string | null
          generated_at: string | null
          generated_by: string
          id: string
          is_final: boolean | null
          report_type: string | null
          title: string
        }
        Insert: {
          case_id: string
          content: string
          file_path?: string | null
          generated_at?: string | null
          generated_by: string
          id?: string
          is_final?: boolean | null
          report_type?: string | null
          title: string
        }
        Update: {
          case_id?: string
          content?: string
          file_path?: string | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          is_final?: boolean | null
          report_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      suspects: {
        Row: {
          address: string | null
          age: number | null
          arrest_date: string | null
          case_id: string
          cnic_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          criminal_history: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_arrested: boolean | null
          last_name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          arrest_date?: string | null
          case_id: string
          cnic_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          criminal_history?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_arrested?: boolean | null
          last_name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          arrest_date?: string | null
          case_id?: string
          cnic_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          criminal_history?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_arrested?: boolean | null
          last_name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suspects_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          badge_number: string | null
          created_at: string | null
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          badge_number?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          badge_number?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      victims: {
        Row: {
          address: string | null
          age: number | null
          case_id: string
          cnic_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          case_id: string
          cnic_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          case_id?: string
          cnic_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "victims_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_case_owner: {
        Args: { _case_id: string }
        Returns: boolean
      }
      is_evidence_owner: {
        Args: { _evidence_id: string }
        Returns: boolean
      }
    }
    Enums: {
      case_priority: "low" | "medium" | "high" | "critical"
      case_status: "open" | "active" | "closed" | "archived"
      custody_action:
        | "collected"
        | "transferred"
        | "analyzed"
        | "returned"
        | "archived"
      evidence_status: "collected" | "processing" | "analyzed" | "archived"
      evidence_type: "digital" | "physical"
      gender_type: "male" | "female" | "other" | "unknown"
      note_type: "note" | "update" | "finding" | "response"
      user_role: "admin" | "investigator" | "analyst" | "viewer"
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
      case_priority: ["low", "medium", "high", "critical"],
      case_status: ["open", "active", "closed", "archived"],
      custody_action: [
        "collected",
        "transferred",
        "analyzed",
        "returned",
        "archived",
      ],
      evidence_status: ["collected", "processing", "analyzed", "archived"],
      evidence_type: ["digital", "physical"],
      gender_type: ["male", "female", "other", "unknown"],
      note_type: ["note", "update", "finding", "response"],
      user_role: ["admin", "investigator", "analyst", "viewer"],
    },
  },
} as const
