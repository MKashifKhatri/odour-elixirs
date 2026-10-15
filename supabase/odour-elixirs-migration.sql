-- Odour Elixirs business records and editable storefront content.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_is_verified boolean;
begin
  account_is_verified := coalesce(new.email_confirmed_at is not null or new.raw_app_meta_data->>'provider' = 'google', false);
  insert into public.profiles (id, name, email, is_verified, verify_code, verify_code_expiry)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    account_is_verified,
    case when account_is_verified then null else nullif(new.raw_user_meta_data->>'verify_code', '') end,
    case when account_is_verified then null else nullif(new.raw_user_meta_data->>'verify_code_expiry', '')::timestamptz end
  )
  on conflict (id) do update set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    email = excluded.email,
    is_verified = public.profiles.is_verified or excluded.is_verified,
    verify_code = case when public.profiles.is_verified or excluded.is_verified then null else coalesce(public.profiles.verify_code, excluded.verify_code) end,
    verify_code_expiry = case when public.profiles.is_verified or excluded.is_verified then null else coalesce(public.profiles.verify_code_expiry, excluded.verify_code_expiry) end;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter table public.products add column if not exists cost_price numeric(10,2) not null default 0 check (cost_price >= 0);
alter table public.products add column if not exists fragrance_notes text[] not null default '{}';
alter table public.products add column if not exists concentration text;
alter table public.products add column if not exists longevity text;

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

create table if not exists public.business_expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other',
  amount numeric(12,2) not null check (amount > 0),
  spent_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_change integer not null check (quantity_change <> 0),
  reason text not null,
  order_id uuid references public.customer_orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key default 'storefront' check (id = 'storefront'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_content (id, content) values ('storefront', '{
  "seoTitle":"Odour Elixirs | Fragrance for Your Own Kind of Presence",
  "seoDescription":"Thoughtfully composed fragrances with character, warmth and a memorable trail. Discover Odour Elixirs and find a scent that feels like you.",
  "heroEyebrow":"Fragrance for your own kind of presence",
  "heroTitle":"Some things stay after you leave.",
  "heroDescription":"Thoughtfully composed scents with character, warmth and a trail that feels unmistakably yours.",
  "heroImage":"/brand/bottle-amber.svg",
  "primaryCta":"Discover the collection",
  "secondaryCta":"Find your notes",
  "announcement":"Complimentary fragrance guidance on WhatsApp",
  "collectionTitle":"Find the one that feels like you.",
  "collectionDescription":"Explore our signature scents, each with its own mood, character and memorable trail.",
  "storyTitle":"Made for the way you want to be remembered.",
  "storyDescription":"We believe fragrance is personal. It belongs to your rituals, your turning points and the small moments that become your story.",
  "storyCardOne":"Notes that draw you in.",
  "storyCardTwo":"A signature that stays.",
  "helpTitle":"Need help choosing a fragrance?",
  "helpDescription":"Talk with us directly. We’ll help you find a scent that feels right.",
  "whatsappNumber":"919427868790",
  "faq":[],
  "testimonials":[]
}'::jsonb) on conflict (id) do nothing;

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
alter table public.business_expenses enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.site_content enable row level security;

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
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content for select using (true);

notify pgrst, 'reload schema';

-- Guest and admin writes use server routes with the service-role key. Keep that key server-only.
