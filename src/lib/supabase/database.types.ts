export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          is_admin: boolean;
          is_verified: boolean;
          verify_code: string | null;
          verify_code_expiry: string | null;
          forgot_password_token: string | null;
          forgot_password_token_expiry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          is_admin?: boolean;
          is_verified?: boolean;
          verify_code?: string | null;
          verify_code_expiry?: string | null;
          forgot_password_token?: string | null;
          forgot_password_token_expiry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          is_admin?: boolean;
          is_verified?: boolean;
          verify_code?: string | null;
          verify_code_expiry?: string | null;
          forgot_password_token?: string | null;
          forgot_password_token_expiry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          slug: string;
          featured: boolean;
          image: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          slug: string;
          featured?: boolean;
          image: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          slug?: string;
          featured?: boolean;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          category_id: string;
          description: string;
          featured: boolean;
          is_active: boolean;
          image: string;
          images: string[];
          price: number;
          quantity: number;
          slug: string;
          size: string | null;
          fabric: string | null;
          color: string[];
          weight: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id: string;
          description: string;
          featured?: boolean;
          is_active?: boolean;
          image: string;
          images?: string[];
          price: number;
          quantity: number;
          slug: string;
          size?: string | null;
          fabric?: string | null;
          color?: string[];
          weight?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string;
          description?: string;
          featured?: boolean;
          is_active?: boolean;
          image?: string;
          images?: string[];
          price?: number;
          quantity?: number;
          slug?: string;
          size?: string | null;
          fabric?: string | null;
          color?: string[];
          weight?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          products: Json;
          shipping_info: Json;
          total: number;
          status: string;
          payment_status: string;
          payment_method: string;
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          products: Json;
          shipping_info: Json;
          total?: number;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          products?: Json;
          shipping_info?: Json;
          total?: number;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          transaction_id?: string | null;
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
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
          amount: number;
          currency: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
          amount: number;
          currency: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          razorpay_payment_id?: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
          amount?: number;
          currency?: string;
          status?: string;
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
      addresses: {
        Row: {
          id: string;
          user_id: string;
          address: string | null;
          phone_number: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          zip_code: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address?: string | null;
          phone_number?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          zip_code?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address?: string | null;
          phone_number?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          zip_code?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
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
      brands: {
        Row: {
          id: string;
          name: string | null;
          slug: string | null;
          description: string | null;
          image: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          slug?: string | null;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          slug?: string | null;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      order_status: "pending" | "shipped" | "delivered";
      payment_status:
        | "PENDING"
        | "COMPLETED"
        | "FAILED"
        | "AUTHORIZED"
        | "CAPTURED";
      payment_method: "CASHFREE" | "RAZORPAY";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
