create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  inspector_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('passed', 'failed')),
  checks jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.equipment_alerts (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.inspections enable row level security;
alter table public.equipment_alerts enable row level security;

drop policy if exists "Authenticated users can read inspections" on public.inspections;
create policy "Authenticated users can read inspections" on public.inspections for select to authenticated using (true);
drop policy if exists "Users can create inspections" on public.inspections;
create policy "Users can create inspections" on public.inspections for insert to authenticated with check (inspector_id = auth.uid());

drop policy if exists "Authenticated users can read equipment alerts" on public.equipment_alerts;
create policy "Authenticated users can read equipment alerts" on public.equipment_alerts for select to authenticated using (true);
drop policy if exists "Users can create equipment alerts" on public.equipment_alerts;
create policy "Users can create equipment alerts" on public.equipment_alerts for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "Authenticated users can update equipment alerts" on public.equipment_alerts;
create policy "Authenticated users can update equipment alerts" on public.equipment_alerts for update to authenticated using (true) with check (true);
