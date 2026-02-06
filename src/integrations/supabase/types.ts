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
      driver_profiles: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          id: string
          insurance_number: string | null
          is_online: boolean | null
          is_verified: boolean | null
          license_number: string
          rating: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_color: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_year: number | null
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          insurance_number?: string | null
          is_online?: boolean | null
          is_verified?: boolean | null
          license_number: string
          rating?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_color?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_year?: number | null
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          insurance_number?: string | null
          is_online?: boolean | null
          is_verified?: boolean | null
          license_number?: string
          rating?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_color?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ride_tracking: {
        Row: {
          id: string
          lat: number
          lng: number
          ride_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          lat: number
          lng: number
          ride_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          lat?: number
          lng?: number
          ride_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_tracking_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          actual_distance: number | null
          actual_duration: number | null
          cancellation_reason: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string | null
          driver_id: string | null
          driver_rating: number | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          estimated_distance: number | null
          estimated_duration: number | null
          estimated_price: number | null
          final_price: number | null
          id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          rider_id: string
          rider_rating: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["ride_status"] | null
          surge_multiplier: number | null
          updated_at: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Insert: {
          actual_distance?: number | null
          actual_duration?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          estimated_distance?: number | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          rider_id: string
          rider_rating?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"] | null
          surge_multiplier?: number | null
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Update: {
          actual_distance?: number | null
          actual_duration?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          dropoff_address?: string
          dropoff_lat?: number
          dropoff_lng?: number
          estimated_distance?: number | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          rider_id?: string
          rider_rating?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"] | null
          surge_multiplier?: number | null
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          address: string
          created_at: string | null
          icon: string | null
          id: string
          lat: number
          lng: number
          name: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          icon?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      ride_status:
        | "searching"
        | "accepted"
        | "driver_arriving"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "rider" | "driver" | "admin"
      vehicle_type: "standard" | "premium" | "xl" | "moto"
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
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      ride_status: [
        "searching",
        "accepted",
        "driver_arriving",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["rider", "driver", "admin"],
      vehicle_type: ["standard", "premium", "xl", "moto"],
    },
  },
} as const
