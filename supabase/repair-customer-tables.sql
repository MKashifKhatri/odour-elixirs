-- Safe, repeatable repair for the website's customer and WhatsApp inquiry tables.
-- Run this in Supabase SQL Editor if the API reports that public.customers is
-- missing from the schema cache, or if the customer migration was only partly run.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  phone text not null unique,
  email text,
  address text,
  city text,
  state text,
  postal_code text,
  source text not null default 'website' check (source in ('website','whatsapp','walk_in','instagram','referral','manual')),
  notes text,
  status text not null default 'lead' check (status in ('lead','active','repeat')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','manual','walk_in','instagram')),
  status text not null default 'new' check (status in ('new','contacted','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','partial','paid','refunded')),
  estimated_total numeric(12,2) not null default 0 check (estimated_total >= 0),
  confirmed_total numeric(12,2) check (confirmed_total >= 0),
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.customer_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  product_slug_snapshot text,
  quantity integer not null check (quantity > 0),
  requested_unit_price numeric(12,2) not null check (requested_unit_price >= 0),
  confirmed_unit_price numeric(12,2) check (confirmed_unit_price >= 0),
  unit_cost_snapshot numeric(12,2) check (unit_cost_snapshot >= 0),
  size_snapshot text,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.customer_orders(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('cash','upi','bank_transfer','other')),
  note text,
  received_at timestamptz not null default now()
);

create index if not exists customers_auth_user_id_idx on public.customers(auth_user_id);
create index if not exists customers_created_at_idx on public.customers(created_at desc);
create index if not exists customer_orders_customer_created_idx on public.customer_orders(customer_id, created_at desc);
create index if not exists customer_orders_status_idx on public.customer_orders(status, created_at desc);
create index if not exists customer_order_items_order_idx on public.customer_order_items(order_id);
create index if not exists customer_payments_order_idx on public.customer_payments(order_id, received_at desc);

alter table public.customers enable row level security;
alter table public.customer_orders enable row level security;
alter table public.customer_order_items enable row level security;
alter table public.customer_payments enable row level security;

grant select, update on public.customers to authenticated;
grant select on public.customer_orders, public.customer_order_items, public.customer_payments to authenticated;
grant all on public.customers, public.customer_orders, public.customer_order_items, public.customer_payments to service_role;

drop policy if exists "customers_read_own" on public.customers;
create policy "customers_read_own" on public.customers for select using (auth_user_id = auth.uid());
drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own" on public.customers for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
drop policy if exists "orders_read_own" on public.customer_orders;
create policy "orders_read_own" on public.customer_orders for select using (exists (select 1 from public.customers c where c.id = customer_orders.customer_id and c.auth_user_id = auth.uid()));
drop policy if exists "order_items_read_own" on public.customer_order_items;
create policy "order_items_read_own" on public.customer_order_items for select using (exists (select 1 from public.customer_orders o join public.customers c on c.id = o.customer_id where o.id = customer_order_items.order_id and c.auth_user_id = auth.uid()));
drop policy if exists "payments_read_own" on public.customer_payments;
create policy "payments_read_own" on public.customer_payments for select using (exists (select 1 from public.customer_orders o join public.customers c on c.id = o.customer_id where o.id = customer_payments.order_id and c.auth_user_id = auth.uid()));

notify pgrst, 'reload schema';
