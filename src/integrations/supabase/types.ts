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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          common_diseases: string[] | null
          created_at: string
          growing_season: string | null
          id: string
          name_en: string
          name_hi: string
          name_mr: string
          soil_requirements: string | null
          water_needs: string | null
        }
        Insert: {
          common_diseases?: string[] | null
          created_at?: string
          growing_season?: string | null
          id?: string
          name_en: string
          name_hi: string
          name_mr: string
          soil_requirements?: string | null
          water_needs?: string | null
        }
        Update: {
          common_diseases?: string[] | null
          created_at?: string
          growing_season?: string | null
          id?: string
          name_en?: string
          name_hi?: string
          name_mr?: string
          soil_requirements?: string | null
          water_needs?: string | null
        }
        Relationships: []
      }
      expert_answers: {
        Row: {
          answer: string
          created_at: string
          expert_id: string
          id: string
          is_verified: boolean
          query_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          expert_id: string
          id?: string
          is_verified?: boolean
          query_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          expert_id?: string
          id?: string
          is_verified?: boolean
          query_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_answers_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "farmer_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer_en: string
          answer_hi: string
          answer_mr: string
          category: Database["public"]["Enums"]["faq_category"]
          created_at: string
          id: string
          question_en: string
          question_hi: string
          question_mr: string
        }
        Insert: {
          answer_en: string
          answer_hi: string
          answer_mr: string
          category: Database["public"]["Enums"]["faq_category"]
          created_at?: string
          id?: string
          question_en: string
          question_hi: string
          question_mr: string
        }
        Update: {
          answer_en?: string
          answer_hi?: string
          answer_mr?: string
          category?: Database["public"]["Enums"]["faq_category"]
          created_at?: string
          id?: string
          question_en?: string
          question_hi?: string
          question_mr?: string
        }
        Relationships: []
      }
      farmer_queries: {
        Row: {
          ai_response: string | null
          conversation_id: string | null
          created_at: string
          id: string
          question: string
          status: Database["public"]["Enums"]["query_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          question: string
          status?: Database["public"]["Enums"]["query_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_response?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          question?: string
          status?: Database["public"]["Enums"]["query_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmer_queries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      govt_offers: {
        Row: {
          created_at: string
          description_en: string | null
          description_hi: string | null
          description_mr: string | null
          discount_percent: number
          eligibility: string | null
          id: string
          name_en: string
          name_hi: string
          name_mr: string
          scheme_code: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          description_mr?: string | null
          discount_percent?: number
          eligibility?: string | null
          id?: string
          name_en: string
          name_hi: string
          name_mr: string
          scheme_code: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          description_mr?: string | null
          discount_percent?: number
          eligibility?: string | null
          id?: string
          name_en?: string
          name_hi?: string
          name_mr?: string
          scheme_code?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description_en: string | null
          description_hi: string | null
          description_mr: string | null
          discounted_price: number | null
          govt_offer_id: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name_en: string
          name_hi: string
          name_mr: string
          price: number
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          description_mr?: string | null
          discounted_price?: number | null
          govt_offer_id?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name_en: string
          name_hi: string
          name_mr: string
          price: number
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          description_mr?: string | null
          discounted_price?: number | null
          govt_offer_id?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name_en?: string
          name_hi?: string
          name_mr?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_govt_offer_id_fkey"
            columns: ["govt_offer_id"]
            isOneToOne: false
            referencedRelation: "govt_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          language: Database["public"]["Enums"]["app_language"]
          latitude: number | null
          location: string | null
          longitude: number | null
          primary_crop: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          primary_crop?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          primary_crop?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soil_types: {
        Row: {
          characteristics: string | null
          created_at: string
          id: string
          name_en: string
          name_hi: string
          name_mr: string
          suitable_crops: string[] | null
        }
        Insert: {
          characteristics?: string | null
          created_at?: string
          id?: string
          name_en: string
          name_hi: string
          name_mr: string
          suitable_crops?: string[] | null
        }
        Update: {
          characteristics?: string | null
          created_at?: string
          id?: string
          name_en?: string
          name_hi?: string
          name_mr?: string
          suitable_crops?: string[] | null
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          location: string | null
          message_en: string
          message_hi: string
          message_mr: string
          severity: Database["public"]["Enums"]["alert_severity"]
          title_en: string
          title_hi: string
          title_mr: string
          user_id: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          location?: string | null
          message_en: string
          message_hi: string
          message_mr: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          title_en: string
          title_hi: string
          title_mr: string
          user_id?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          location?: string | null
          message_en?: string
          message_hi?: string
          message_mr?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          title_en?: string
          title_hi?: string
          title_mr?: string
          user_id?: string | null
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
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_type:
        | "rain"
        | "heat_wave"
        | "storm"
        | "frost"
        | "drought"
        | "pest_outbreak"
      app_language: "en" | "hi" | "mr" | "kn"
      faq_category: "crops" | "soil" | "pests" | "seasons" | "water"
      product_category:
        | "seeds"
        | "fertilizers"
        | "pesticides"
        | "tools"
        | "irrigation"
      query_status: "pending" | "ai_answered" | "expert_verified" | "flagged"
      user_role: "farmer" | "expert"
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
      alert_severity: ["low", "medium", "high", "critical"],
      alert_type: [
        "rain",
        "heat_wave",
        "storm",
        "frost",
        "drought",
        "pest_outbreak",
      ],
      app_language: ["en", "hi", "mr", "kn"],
      faq_category: ["crops", "soil", "pests", "seasons", "water"],
      product_category: [
        "seeds",
        "fertilizers",
        "pesticides",
        "tools",
        "irrigation",
      ],
      query_status: ["pending", "ai_answered", "expert_verified", "flagged"],
      user_role: ["farmer", "expert"],
    },
  },
} as const
