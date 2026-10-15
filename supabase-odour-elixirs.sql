-- Odour Elixirs customer, WhatsApp ordering, inventory, and CMS foundation.
-- Run after the existing Supabase catalog schema. This migration is safe to re-run.

create extension if not exists "uuid-ossp";

do $$ begin
  create type public.customer_source as enum ('website', 'whatsapp', 'walk_in', 'instagram', 'referral', 'other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.whatsapp_order_status as enum ('inquiry', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.manual_payment_status as enum ('unpaid', 'partial', 'paid');
exception when duplicate_object then null; end $$;

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null unique,
  email text,
  address text,
  city text,
  state text,
  postal_code text,
  source public.customer_source not null default 'website',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  auth_user_id uuid references auth.users(id) on delete set null,
  status public.whatsapp_order_status not null default 'inquiry',
  payment_status public.manual_payment_status not null default 'unpaid',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total numeric(12,2) not null check (total >= 0),
  amount_received numeric(12,2) not null default 0 check (amount_received >= 0),
  customer_note text,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_order_items (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_order_id uuid not null references public.whatsapp_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  variant_label text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  unit_cost numeric(12,2),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.manual_payments (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_order_id uuid not null references public.whatsapp_orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('cash', 'upi', 'bank_transfer', 'other')),
  received_on date not null default current_date,
  reference text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  expense_date date not null default current_date,
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values ('store', '{"business_name":"Odour Elixirs","whatsapp_number":"919427868790","currency":"INR"}'::jsonb)
on conflict (key) do nothing;

create index if not exists customers_auth_user_id_idx on public.customers(auth_user_id);
create index if not exists whatsapp_orders_customer_created_idx on public.whatsapp_orders(customer_id, created_at desc);
create index if not exists whatsapp_order_items_order_idx on public.whatsapp_order_items(whatsapp_order_id);

alter table public.customers enable row level security;
alter table public.whatsapp_orders enable row level security;
alter table public.whatsapp_order_items enable row level security;
alter table public.manual_payments enable row level security;
alter table public.expenses enable row level security;
alter table public.site_settings enable row level security;

-- Customer-facing writes happen only through validated server routes. Admin uses service role routes.
create policy "customers_can_view_own_record" on public.customers for select using (auth.uid() = auth_user_id);
create policy "users_can_view_own_whatsapp_orders" on public.whatsapp_orders for select using (auth.uid() = auth_user_id);
create policy "users_can_view_own_order_items" on public.whatsapp_order_items for select using (
  exists (select 1 from public.whatsapp_orders o where o.id = whatsapp_order_id and o.auth_user_id = auth.uid())
);
create policy "users_can_view_own_manual_payments" on public.manual_payments for select using (
  exists (select 1 from public.whatsapp_orders o where o.id = whatsapp_order_id and o.auth_user_id = auth.uid())
);
