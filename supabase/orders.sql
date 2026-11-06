-- Run this once in Supabase → SQL Editor.
-- Orders are written only by the server (service role key). RLS is on with no policies,
-- so the public anon key cannot read or write any orders.
create table if not exists public.orders (
  id                   bigint generated always as identity primary key,
  receipt              text not null unique,
  razorpay_order_id    text not null unique,
  razorpay_payment_id  text,
  status               text not null default 'pending' check (status in ('pending', 'paid')),
  amount_inr           integer not null check (amount_inr > 0),
  items                jsonb not null,
  name                 text not null,
  phone                text not null,
  email                text not null,
  address              text not null,
  city                 text not null,
  pin                  text not null,
  wedding_date         date,
  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);

alter table public.orders enable row level security;
