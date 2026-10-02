-- ========================================================
-- LPG App: Initial Database Schema (Supabase / Postgres)
-- ========================================================

-- Customers (NO Supabase Auth / login — identified only by phone number,
-- captured once at checkout and remembered on-device)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  full_name text,
  created_at timestamptz default now()
);

-- Saved addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  label text default 'Home',
  address_line text not null,
  pincode text,
  city text,
  state text,
  latitude double precision,
  longitude double precision,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Cylinder catalog (category, kg/type, price range)
create table if not exists public.cylinder_prices (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('domestic','commercial','industrial')),
  label text not null,              -- e.g. "14.2 kg", "425 kg", "Jumbo"
  min_price numeric(10,2),
  max_price numeric(10,2),
  price_on_request boolean default false,
  effective_from date default current_date,
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,           -- human-friendly ID, e.g. LPG-20260927-0001
  customer_id uuid references public.customers(id),
  category text not null check (category in ('domestic','commercial','industrial')),
  cylinder_label text not null,
  quantity int not null default 1,
  address_id uuid references public.addresses(id),
  preferred_date date,
  preferred_slot text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','received','forwarded','out_for_delivery','delivered','cancelled')),
  advance_amount numeric(10,2) default 50.00,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments log (audit trail, separate from orders for reconciliation)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount numeric(10,2),
  currency text default 'INR',
  status text,               -- created, authorized, captured, failed, refunded
  raw_payload jsonb,
  created_at timestamptz default now()
);

-- Complaints / support tickets
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  customer_id uuid references public.customers(id),
  category text,             -- leak, short delivery, delay, other
  description text,
  status text default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz default now()
);

-- Admin/customer-care staff (separate from customers, role-based)
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('staff','super_admin')),
  created_at timestamptz default now()
);

-- Order number generator
create sequence if not exists order_number_seq start 1;
create or replace function public.generate_order_number()
returns text as $$
begin
  return 'LPG-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
end;
$$ language plpgsql;

create or replace function public.set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on public.orders;
create trigger trg_set_order_number
before insert on public.orders
for each row execute function public.set_order_number();

-- ========================================================
-- Row Level Security
-- ========================================================
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.complaints enable row level security;
alter table public.cylinder_prices enable row level security;
alter table public.admin_users enable row level security;

-- No direct client access to customers/addresses/orders/complaints/payments —
-- there is no customer login/session to check identity against. All
-- customer-facing reads and writes go through Edge Functions (which use the
-- service role key and apply their own phone-based checks). RLS being
-- enabled with no policy here means anon-key access is denied by default.

-- Prices are public read (shown in the app before any order is placed)
create policy "prices_public_read" on public.cylinder_prices
  for select using (is_active = true);

-- Admin users: staff/super_admin can read & manage everything.
-- (Service role key, used by the admin panel's backend calls, bypasses RLS entirely,
--  so these policies mainly protect direct client access.)
create policy "admin_full_orders" on public.orders
  for all using (exists (select 1 from public.admin_users a where a.id = auth.uid()));
create policy "admin_full_prices" on public.cylinder_prices
  for all using (exists (select 1 from public.admin_users a where a.id = auth.uid() and a.role = 'super_admin'));
create policy "admin_full_complaints" on public.complaints
  for all using (exists (select 1 from public.admin_users a where a.id = auth.uid()));

-- ========================================================
-- Seed starter price data (admin edits these monthly)
-- ========================================================
insert into public.cylinder_prices (category, label, min_price, max_price, price_on_request) values
  ('domestic', '4 kg', 280, 350, false),
  ('domestic', '12 kg', 780, 950, false),
  ('domestic', '14.2 kg', 913, 994, false),
  ('commercial', '5 kg', 700, 850, false),
  ('commercial', '17 kg', 2350, 2700, false),
  ('commercial', '19 kg', 2700, 2996, false),
  ('commercial', '21 kg', 2950, 3300, false),
  ('commercial', '33 kg', 4600, 5200, false),
  ('commercial', '47.5 kg', 6748, 7486, false),
  ('industrial', '33 kg', 4600, 5200, false),
  ('industrial', '425 kg', null, null, true),
  ('industrial', '450 kg', null, null, true),
  ('industrial', 'Jumbo', null, null, true),
  ('industrial', 'Maxima', null, null, true)
on conflict do nothing;
