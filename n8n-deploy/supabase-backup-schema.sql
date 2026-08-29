-- Cafe Brewm backup tables (Supabase Postgres)
-- Run this once in the Supabase SQL Editor before wiring up the n8n backup nodes.

create table if not exists orders_backup (
  id bigint generated always as identity primary key,
  order_number bigint,
  day text,
  date text,
  time text,
  customer text,
  items text,
  subtotal numeric,
  discount numeric,
  tax numeric,
  total numeric,
  cost numeric,
  profit numeric,
  payment_method text,
  order_type text,
  note text,
  staff text,
  created_at timestamptz default now()
);
create unique index if not exists orders_backup_order_number_idx on orders_backup (order_number);

create table if not exists customers_backup (
  id bigint generated always as identity primary key,
  name text unique,
  last_visit_day text,
  last_visit_date text,
  last_visit_time text,
  last_order_total numeric,
  last_payment_method text,
  last_order_type text,
  updated_at timestamptz default now()
);

create table if not exists inventory_backup (
  id bigint generated always as identity primary key,
  name text unique,
  category text,
  quantity numeric,
  unit text,
  low_stock_threshold numeric,
  last_updated timestamptz default now()
);

create table if not exists shifts_backup (
  id bigint generated always as identity primary key,
  staff_name text,
  day_in text,
  date_in text,
  time_in text,
  time_in_ts text,
  status text,
  day_out text,
  date_out text,
  time_out text,
  time_out_ts text,
  updated_at timestamptz default now()
);
create index if not exists shifts_backup_staff_status_idx on shifts_backup (staff_name, status);
