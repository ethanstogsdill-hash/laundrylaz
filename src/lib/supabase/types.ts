// Database schema types for Fresh Laundry Cafe Supabase tables
// These types mirror the Postgres schema and are used by the Supabase client
// for type-safe queries. Regenerate with `supabase gen types typescript` if
// the remote schema changes.

// ---------------------------------------------------------------------------
// Enum helpers
// ---------------------------------------------------------------------------

export type UserRole = "customer" | "admin";

export type SlotType = "pickup" | "delivery";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "washing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "not_required"
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded";

export type ReferralStatus = "pending" | "completed" | "expired";

export type CreditTransactionType =
  | "referral_bonus"
  | "referral_reward"
  | "order_payment";

export type SmsMessageType =
  | "order_confirmed"
  | "pickup_completed"
  | "payment_requested"
  | "payment_received"
  | "out_for_delivery"
  | "delivered"
  | "pickup_reminder";

export type SmsStatus = "queued" | "sent" | "delivered" | "failed" | "undelivered";

// ---------------------------------------------------------------------------
// Row / Insert / Update helpers per table
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          referral_code: string | null;
          referred_by: string | null;
          stripe_customer_id: string | null;
          credit_balance_cents: number;
          sms_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // references auth.users.id
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          referral_code?: string | null;
          referred_by?: string | null;
          stripe_customer_id?: string | null;
          credit_balance_cents?: number;
          sms_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          referral_code?: string | null;
          referred_by?: string | null;
          stripe_customer_id?: string | null;
          credit_balance_cents?: number;
          sms_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_referred_by_fkey";
            columns: ["referred_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          street: string;
          apt: string | null;
          city: string;
          state: string;
          zip: string;
          delivery_instructions: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          street: string;
          apt?: string | null;
          city: string;
          state: string;
          zip: string;
          delivery_instructions?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          street?: string;
          apt?: string | null;
          city?: string;
          state?: string;
          zip?: string;
          delivery_instructions?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      time_slots: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          slot_type: SlotType;
          capacity: number;
          booked: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          slot_type: SlotType;
          capacity: number;
          booked?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          slot_type?: SlotType;
          capacity?: number;
          booked?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          user_id: string;
          address_id: string;
          pickup_slot_id: string;
          delivery_slot_id: string | null;
          status: OrderStatus;
          weight_lbs: number | null;
          base_fee_cents: number;
          per_lb_rate_cents: number;
          total_cents: number | null;
          credits_applied_cents: number;
          payment_status: PaymentStatus;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address_id: string;
          pickup_slot_id: string;
          delivery_slot_id?: string | null;
          status?: OrderStatus;
          weight_lbs?: number | null;
          base_fee_cents: number;
          per_lb_rate_cents: number;
          total_cents?: number | null;
          credits_applied_cents?: number;
          payment_status?: PaymentStatus;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address_id?: string;
          pickup_slot_id?: string;
          delivery_slot_id?: string | null;
          status?: OrderStatus;
          weight_lbs?: number | null;
          base_fee_cents?: number;
          per_lb_rate_cents?: number;
          total_cents?: number | null;
          credits_applied_cents?: number;
          payment_status?: PaymentStatus;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_pickup_slot_id_fkey";
            columns: ["pickup_slot_id"];
            isOneToOne: false;
            referencedRelation: "time_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_slot_id_fkey";
            columns: ["delivery_slot_id"];
            isOneToOne: false;
            referencedRelation: "time_slots";
            referencedColumns: ["id"];
          },
        ];
      };

      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          old_status: OrderStatus | null;
          new_status: OrderStatus;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          old_status?: OrderStatus | null;
          new_status: OrderStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          old_status?: OrderStatus | null;
          new_status?: OrderStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      payments: {
        Row: {
          id: string;
          order_id: string;
          stripe_payment_intent_id: string;
          amount_cents: number;
          status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          stripe_payment_intent_id: string;
          amount_cents: number;
          status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          stripe_payment_intent_id?: string;
          amount_cents?: number;
          status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };

      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referee_id: string;
          referral_code_used: string;
          reward_cents: number;
          status: ReferralStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referee_id: string;
          referral_code_used: string;
          reward_cents: number;
          status?: ReferralStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referee_id?: string;
          referral_code_used?: string;
          reward_cents?: number;
          status?: ReferralStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referee_id_fkey";
            columns: ["referee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount_cents: number;
          type: CreditTransactionType;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_cents: number;
          type: CreditTransactionType;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_cents?: number;
          type?: CreditTransactionType;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      sms_log: {
        Row: {
          id: string;
          user_id: string | null;
          phone: string;
          message_type: SmsMessageType;
          message_body: string;
          twilio_sid: string | null;
          status: SmsStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          phone: string;
          message_type: SmsMessageType;
          message_body: string;
          twilio_sid?: string | null;
          status?: SmsStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          phone?: string;
          message_type?: SmsMessageType;
          message_body?: string;
          twilio_sid?: string | null;
          status?: SmsStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sms_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      increment_credit_balance: {
        Args: {
          user_id_input: string;
          amount_input: number;
        };
        Returns: undefined;
      };
    };

    Enums: {
      user_role: UserRole;
      slot_type: SlotType;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      referral_status: ReferralStatus;
      credit_transaction_type: CreditTransactionType;
      sms_message_type: SmsMessageType;
      sms_status: SmsStatus;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ---------------------------------------------------------------------------
// Convenience type aliases
// ---------------------------------------------------------------------------

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Per-table row shortcuts
export type Profile = Tables<"profiles">;
export type Address = Tables<"addresses">;
export type TimeSlot = Tables<"time_slots">;
export type Order = Tables<"orders">;
export type OrderStatusHistory = Tables<"order_status_history">;
export type Payment = Tables<"payments">;
export type Referral = Tables<"referrals">;
export type CreditTransaction = Tables<"credit_transactions">;
export type SmsLogEntry = Tables<"sms_log">;
