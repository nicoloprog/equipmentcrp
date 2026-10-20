create extension if not exists pgcrypto;

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  tag text not null unique,
  name text not null,
  category text not null check (category in ('truck', 'drill', 'battery')),
  status text not null default 'healthy' check (status in ('healthy', 'due_soon', 'overdue', 'warranty_expiring')),
  usage_value numeric,
  usage_unit text check (usage_unit in ('hours', 'miles', 'kilometers')),
  warranty_expiry date,
  photo_path text,
  created_at timestamptz not null default now()
);

alter table public.equipment enable row level security;

drop policy if exists "Authenticated users can read equipment" on public.equipment;
create policy "Authenticated users can read equipment"
  on public.equipment for select to authenticated using (true);

drop policy if exists "Authenticated users can create equipment" on public.equipment;
create policy "Authenticated users can create equipment"
  on public.equipment for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update equipment" on public.equipment;
create policy "Authenticated users can update equipment"
  on public.equipment for update to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('equipment-photos', 'equipment-photos', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read equipment photos" on storage.objects;
create policy "Authenticated users can read equipment photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'equipment-photos');

drop policy if exists "Authenticated users can upload equipment photos" on storage.objects;
create policy "Authenticated users can upload equipment photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'equipment-photos');
