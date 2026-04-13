-- Run in Supabase SQL Editor → New Query

create table if not exists public.orders (
    id          bigint      primary key,
    total_price numeric     not null default 0,
    created_at  timestamptz,
    city        text        not null default '',
    status      text        not null default 'unknown'
);

create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_city_idx       on public.orders (city);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
