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
      client_driver_affiliations: {
        Row: {
          client_id: string
          created_at: string
          driver_id: string
          id: string
          invite_code: string | null
          last_ride_at: string | null
          source: string
          total_revenue: number
          total_rides: number
        }
        Insert: {
          client_id: string
          created_at?: string
          driver_id: string
          id?: string
          invite_code?: string | null
          last_ride_at?: string | null
          source?: string
          total_revenue?: number
          total_rides?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          driver_id?: string
          id?: string
          invite_code?: string | null
          last_ride_at?: string | null
          source?: string
          total_revenue?: number
          total_rides?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_driver_affiliations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_driver_affiliations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          allow_door_drop: boolean | null
          barcode: string | null
          barcode_scanned_delivery: boolean | null
          barcode_scanned_pickup: boolean | null
          batch_id: string | null
          created_at: string | null
          delivered_at: string | null
          driver_id: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          estimated_price: number | null
          final_price: number | null
          id: string
          is_scheduled: boolean | null
          merchant_id: string | null
          merchant_order_ref: string | null
          package_description: string | null
          package_size: string | null
          picked_up_at: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          pin_code: string | null
          pin_verified: boolean | null
          proof_photo_url: string | null
          rider_id: string
          scheduled_slot_end: string | null
          scheduled_slot_start: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          allow_door_drop?: boolean | null
          barcode?: string | null
          barcode_scanned_delivery?: boolean | null
          barcode_scanned_pickup?: boolean | null
          batch_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          is_scheduled?: boolean | null
          merchant_id?: string | null
          merchant_order_ref?: string | null
          package_description?: string | null
          package_size?: string | null
          picked_up_at?: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          pin_code?: string | null
          pin_verified?: boolean | null
          proof_photo_url?: string | null
          rider_id: string
          scheduled_slot_end?: string | null
          scheduled_slot_start?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_door_drop?: boolean | null
          barcode?: string | null
          barcode_scanned_delivery?: boolean | null
          barcode_scanned_pickup?: boolean | null
          batch_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_lat?: number
          dropoff_lng?: number
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          is_scheduled?: boolean | null
          merchant_id?: string | null
          merchant_order_ref?: string | null
          package_description?: string | null
          package_size?: string | null
          picked_up_at?: string | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          pin_code?: string | null
          pin_verified?: boolean | null
          proof_photo_url?: string | null
          rider_id?: string
          scheduled_slot_end?: string | null
          scheduled_slot_start?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "delivery_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_batches: {
        Row: {
          completed_at: string | null
          completed_deliveries: number | null
          created_at: string | null
          driver_id: string
          id: string
          optimized_route: Json | null
          started_at: string | null
          status: string | null
          total_deliveries: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_deliveries?: number | null
          created_at?: string | null
          driver_id: string
          id?: string
          optimized_route?: Json | null
          started_at?: string | null
          status?: string | null
          total_deliveries?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_deliveries?: number | null
          created_at?: string | null
          driver_id?: string
          id?: string
          optimized_route?: Json | null
          started_at?: string | null
          status?: string | null
          total_deliveries?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dispatch_queue: {
        Row: {
          affiliated_driver_id: string | null
          assigned_at: string | null
          assigned_driver_id: string | null
          attempt_count: number | null
          created_at: string | null
          current_offered_to: string | null
          current_search_radius_km: number | null
          drivers_contacted: string[] | null
          drivers_declined: string[] | null
          expires_at: string | null
          id: string
          max_attempts: number | null
          max_search_radius_km: number | null
          offer_expires_at: string | null
          offered_at: string | null
          pickup_lat: number
          pickup_lng: number
          priority: number | null
          ride_id: string
          source: string | null
          status: string | null
          updated_at: string | null
          vehicle_type_required: string | null
        }
        Insert: {
          affiliated_driver_id?: string | null
          assigned_at?: string | null
          assigned_driver_id?: string | null
          attempt_count?: number | null
          created_at?: string | null
          current_offered_to?: string | null
          current_search_radius_km?: number | null
          drivers_contacted?: string[] | null
          drivers_declined?: string[] | null
          expires_at?: string | null
          id?: string
          max_attempts?: number | null
          max_search_radius_km?: number | null
          offer_expires_at?: string | null
          offered_at?: string | null
          pickup_lat: number
          pickup_lng: number
          priority?: number | null
          ride_id: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type_required?: string | null
        }
        Update: {
          affiliated_driver_id?: string | null
          assigned_at?: string | null
          assigned_driver_id?: string | null
          attempt_count?: number | null
          created_at?: string | null
          current_offered_to?: string | null
          current_search_radius_km?: number | null
          drivers_contacted?: string[] | null
          drivers_declined?: string[] | null
          expires_at?: string | null
          id?: string
          max_attempts?: number | null
          max_search_radius_km?: number | null
          offer_expires_at?: string | null
          offered_at?: string | null
          pickup_lat?: number
          pickup_lng?: number
          priority?: number | null
          ride_id?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type_required?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_queue_affiliated_driver_id_fkey"
            columns: ["affiliated_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_queue_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_queue_current_offered_to_fkey"
            columns: ["current_offered_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_queue_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_availability_log: {
        Row: {
          created_at: string | null
          driver_id: string
          duration_minutes: number | null
          earnings_during_session: number | null
          id: string
          rides_during_session: number | null
          went_offline_at: string | null
          went_online_at: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          duration_minutes?: number | null
          earnings_during_session?: number | null
          id?: string
          rides_during_session?: number | null
          went_offline_at?: string | null
          went_online_at: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          duration_minutes?: number | null
          earnings_during_session?: number | null
          id?: string
          rides_during_session?: number | null
          went_offline_at?: string | null
          went_online_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_availability_log_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_invite_codes: {
        Row: {
          code: string
          created_at: string
          driver_id: string
          id: string
          is_active: boolean
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          driver_id: string
          id?: string
          is_active?: boolean
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          driver_id?: string
          id?: string
          is_active?: boolean
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_invite_codes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_levels: {
        Row: {
          acceptance_rate: number
          avg_rating: number
          cancellation_rate: number
          commission_rate: number
          composite_score: number
          created_at: string
          driver_id: string
          evaluated_at: string
          id: string
          level: string
          punctuality_rate: number
          quarter: string
          total_rides: number
        }
        Insert: {
          acceptance_rate?: number
          avg_rating?: number
          cancellation_rate?: number
          commission_rate?: number
          composite_score?: number
          created_at?: string
          driver_id: string
          evaluated_at?: string
          id?: string
          level?: string
          punctuality_rate?: number
          quarter: string
          total_rides?: number
        }
        Update: {
          acceptance_rate?: number
          avg_rating?: number
          cancellation_rate?: number
          commission_rate?: number
          composite_score?: number
          created_at?: string
          driver_id?: string
          evaluated_at?: string
          id?: string
          level?: string
          punctuality_rate?: number
          quarter?: string
          total_rides?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_levels_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_monthly_scores: {
        Row: {
          acceptance_rate: number
          avg_rating: number
          club_redistributions: number
          composite_score: number
          created_at: string
          driver_id: string
          id: string
          month: string
          punctuality_rate: number
          rank: number | null
          total_rides: number
        }
        Insert: {
          acceptance_rate?: number
          avg_rating?: number
          club_redistributions?: number
          composite_score?: number
          created_at?: string
          driver_id: string
          id?: string
          month: string
          punctuality_rate?: number
          rank?: number | null
          total_rides?: number
        }
        Update: {
          acceptance_rate?: number
          avg_rating?: number
          club_redistributions?: number
          composite_score?: number
          created_at?: string
          driver_id?: string
          id?: string
          month?: string
          punctuality_rate?: number
          rank?: number | null
          total_rides?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_monthly_scores_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_of_month: {
        Row: {
          acceptance_rate: number
          avg_rating: number
          badge_expires_at: string | null
          bonus_amount: number
          club_redistributions: number
          commission_rate: number
          composite_score: number
          created_at: string
          driver_id: string
          id: string
          month: string
          punctuality_rate: number
          total_rides: number
        }
        Insert: {
          acceptance_rate?: number
          avg_rating?: number
          badge_expires_at?: string | null
          bonus_amount?: number
          club_redistributions?: number
          commission_rate?: number
          composite_score?: number
          created_at?: string
          driver_id: string
          id?: string
          month: string
          punctuality_rate?: number
          total_rides?: number
        }
        Update: {
          acceptance_rate?: number
          avg_rating?: number
          badge_expires_at?: string | null
          bonus_amount?: number
          club_redistributions?: number
          commission_rate?: number
          composite_score?: number
          created_at?: string
          driver_id?: string
          id?: string
          month?: string
          punctuality_rate?: number
          total_rides?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_of_month_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      driver_zones: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string | null
          driver_id: string
          id: string
          is_active: boolean | null
          priority: number | null
          radius_km: number | null
          zone_name: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string | null
          driver_id: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          radius_km?: number | null
          zone_name: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string | null
          driver_id?: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          radius_km?: number | null
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_zones_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_compensations: {
        Row: {
          amount: number
          compensation_type: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          incident_id: string | null
          is_used: boolean | null
          user_id: string
        }
        Insert: {
          amount?: number
          compensation_type?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          incident_id?: string | null
          is_used?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number
          compensation_type?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          incident_id?: string | null
          is_used?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_compensations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_compensations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          client_id: string | null
          compensation_amount: number | null
          compensation_type: string | null
          created_at: string
          description: string | null
          driver_id: string | null
          id: string
          incident_type: string
          lat: number | null
          lng: number | null
          replacement_driver_id: string | null
          reported_by: string
          resolution: string | null
          resolved_at: string | null
          status: string
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          created_at?: string
          description?: string | null
          driver_id?: string | null
          id?: string
          incident_type: string
          lat?: number | null
          lng?: number | null
          replacement_driver_id?: string | null
          reported_by: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          created_at?: string
          description?: string | null
          driver_id?: string | null
          id?: string
          incident_type?: string
          lat?: number | null
          lng?: number | null
          replacement_driver_id?: string | null
          reported_by?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_replacement_driver_id_fkey"
            columns: ["replacement_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      map_alerts: {
        Row: {
          alert_type: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          lat: number
          lng: number
          reporter_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          lat: number
          lng: number
          reporter_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          lat?: number
          lng?: number
          reporter_id?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          api_key: string
          contact_email: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          api_key: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          api_key?: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      netting_ledger: {
        Row: {
          created_at: string | null
          creditor_driver_id: string
          debtor_driver_id: string
          dispatch_id: string
          id: string
          netting_amount: number
          netting_rate: number
          ride_amount: number
          ride_id: string | null
          settled_at: string | null
          settlement_method: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          creditor_driver_id: string
          debtor_driver_id: string
          dispatch_id: string
          id?: string
          netting_amount: number
          netting_rate: number
          ride_amount: number
          ride_id?: string | null
          settled_at?: string | null
          settlement_method?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          creditor_driver_id?: string
          debtor_driver_id?: string
          dispatch_id?: string
          id?: string
          netting_amount?: number
          netting_rate?: number
          ride_amount?: number
          ride_id?: string | null
          settled_at?: string | null
          settlement_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "netting_ledger_creditor_driver_id_fkey"
            columns: ["creditor_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "netting_ledger_debtor_driver_id_fkey"
            columns: ["debtor_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "netting_ledger_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "private_dispatch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "netting_ledger_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
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
      pricing_rules: {
        Row: {
          base_fare: number
          cancellation_fee: number | null
          id: string
          is_active: boolean | null
          minimum_fare: number
          night_surcharge: number | null
          per_km_rate: number
          per_minute_rate: number
          updated_at: string | null
          vehicle_type: string
          waiting_per_minute: number | null
          weekend_surcharge: number | null
        }
        Insert: {
          base_fare: number
          cancellation_fee?: number | null
          id?: string
          is_active?: boolean | null
          minimum_fare: number
          night_surcharge?: number | null
          per_km_rate: number
          per_minute_rate: number
          updated_at?: string | null
          vehicle_type: string
          waiting_per_minute?: number | null
          weekend_surcharge?: number | null
        }
        Update: {
          base_fare?: number
          cancellation_fee?: number | null
          id?: string
          is_active?: boolean | null
          minimum_fare?: number
          night_surcharge?: number | null
          per_km_rate?: number
          per_minute_rate?: number
          updated_at?: string | null
          vehicle_type?: string
          waiting_per_minute?: number | null
          weekend_surcharge?: number | null
        }
        Relationships: []
      }
      private_dispatch: {
        Row: {
          client_display_name: string | null
          created_at: string | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          estimated_price: number | null
          expires_at: string | null
          id: string
          netting_amount: number | null
          netting_rate: number | null
          netting_settled: boolean | null
          notes: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          receiver_driver_id: string | null
          ride_id: string | null
          scheduled_time: string | null
          sender_driver_id: string
          status: string | null
          updated_at: string | null
          vehicle_type_required: string | null
        }
        Insert: {
          client_display_name?: string | null
          created_at?: string | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_price?: number | null
          expires_at?: string | null
          id?: string
          netting_amount?: number | null
          netting_rate?: number | null
          netting_settled?: boolean | null
          notes?: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          receiver_driver_id?: string | null
          ride_id?: string | null
          scheduled_time?: string | null
          sender_driver_id: string
          status?: string | null
          updated_at?: string | null
          vehicle_type_required?: string | null
        }
        Update: {
          client_display_name?: string | null
          created_at?: string | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_price?: number | null
          expires_at?: string | null
          id?: string
          netting_amount?: number | null
          netting_rate?: number | null
          netting_settled?: boolean | null
          notes?: string | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          receiver_driver_id?: string | null
          ride_id?: string | null
          scheduled_time?: string | null
          sender_driver_id?: string
          status?: string | null
          updated_at?: string | null
          vehicle_type_required?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_dispatch_receiver_driver_id_fkey"
            columns: ["receiver_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_dispatch_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_dispatch_sender_driver_id_fkey"
            columns: ["sender_driver_id"]
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
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
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
      surge_zones: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          radius_km: number | null
          reason: string | null
          starts_at: string | null
          surge_multiplier: number | null
          zone_name: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          radius_km?: number | null
          reason?: string | null
          starts_at?: string | null
          surge_multiplier?: number | null
          zone_name: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          radius_km?: number | null
          reason?: string | null
          starts_at?: string | null
          surge_multiplier?: number | null
          zone_name?: string
        }
        Relationships: []
      }
      tatfleet_sync_log: {
        Row: {
          attempts: number | null
          created_at: string | null
          driver_id: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          next_retry_at: string | null
          payload: Json
          response_body: Json | null
          response_status: number | null
          ride_id: string
          status: string | null
          tatfleet_reference_id: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          driver_id: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          payload: Json
          response_body?: Json | null
          response_status?: number | null
          ride_id: string
          status?: string | null
          tatfleet_reference_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          driver_id?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          payload?: Json
          response_body?: Json | null
          response_status?: number | null
          ride_id?: string
          status?: string | null
          tatfleet_reference_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tatfleet_sync_log_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tatfleet_sync_log_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_ratings: {
        Row: {
          badges: string[] | null
          comment: string | null
          created_at: string
          criteria_scores: Json | null
          id: string
          is_revealed: boolean | null
          overall_score: number
          ratee_id: string
          rater_id: string
          rater_role: string
          trip_id: string
          trip_type: string
          updated_at: string
        }
        Insert: {
          badges?: string[] | null
          comment?: string | null
          created_at?: string
          criteria_scores?: Json | null
          id?: string
          is_revealed?: boolean | null
          overall_score: number
          ratee_id: string
          rater_id: string
          rater_role: string
          trip_id: string
          trip_type?: string
          updated_at?: string
        }
        Update: {
          badges?: string[] | null
          comment?: string | null
          created_at?: string
          criteria_scores?: Json | null
          id?: string
          is_revealed?: boolean | null
          overall_score?: number
          ratee_id?: string
          rater_id?: string
          rater_role?: string
          trip_id?: string
          trip_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_ratings_ratee_id_fkey"
            columns: ["ratee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_warnings: {
        Row: {
          created_at: string
          id: string
          incident_id: string | null
          is_active: boolean | null
          reason: string | null
          suspended_until: string | null
          user_id: string
          warning_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id?: string | null
          is_active?: boolean | null
          reason?: string | null
          suspended_until?: string | null
          user_id: string
          warning_type: string
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string | null
          is_active?: boolean | null
          reason?: string | null
          suspended_until?: string | null
          user_id?: string
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warnings_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_warnings_user_id_fkey"
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
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      earth: { Args: never; Returns: number }
      find_nearest_drivers: {
        Args: {
          p_exclude_drivers?: string[]
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
          p_vehicle_type?: string
        }
        Returns: {
          current_lat: number
          current_lng: number
          distance_km: number
          driver_id: string
          driver_name: string
          rating: number
          user_id: string
          vehicle_type: string
        }[]
      }
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
