import { z } from "zod";

export type User = {
  user: string;
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_verified: boolean;
  verify_code: string | null;
  verify_code_expiry: string | null;
  forgot_password_token: string | null;
  forgot_password_token_expiry: string | null;
}

export interface Address {
  id?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
  phone_number: string;
}

export interface AuthUser {
  user: string;
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  phone_number?: string;
  address?: Address;
  addresses?: Address[];
}

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  size: string | null;
  fabric: string | null;
  color: string[];
  weight: string | null;
  brand?: string | null;
  subcategory?: string | null;
  sizes?: string[];
  compare_at_price?: number | null;
  specs?: Record<string, string>;
  fragrance_notes?: string[];
  concentration?: string | null;
  longevity?: string | null;
  warranty?: string | null;
  available?: boolean;
  available_quantity?: number;
  variants?: ProductVariant[];
  price: number;
  description: string;
  featured: boolean;
  is_active: boolean;
  category?: {
    name: string;
    slug?: string;
  };
  quantity?: number;
  stock?: number;
  cost_price?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductVariant = {
  id?: string;
  size: string;
  size_ml?: number | null;
  color?: string;
  cost_price?: number;
  selling_price?: number;
  stock_quantity?: number;
  stock?: number;
  sku?: string;
  is_active?: boolean;
  available?: boolean;
  available_quantity?: number;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
  image: string;
}

export interface OrderInfo {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  shipping_info: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  products: Product[];
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  order?: OrderInfo;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'AUTHORIZED' | 'CAPTURED';
  created_at: string;
  updated_at: string;
}


export const checkoutFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must contain at least 2 characters(s)",
  }),
  email: z.string().email(),
  phoneNumber: z.string().min(10, {
    message: "Invalid phone number",
  }),
  addressLine: z.string().min(2, {
    message: "Address too short",
  }),
  city: z.string().min(2, {
    message: "Invalid city",
  }),
  state: z.string().min(2, {
    message: "Invalid state",
  }),
  country: z.string().optional(),
  zipcode: z.string().min(6, {
    message: "Invalid zipcode",
  }),
});

export const invoiceSchema = checkoutFormSchema.extend({
  products: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
});
