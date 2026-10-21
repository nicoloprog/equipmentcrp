alter table public.equipment add column if not exists current_km numeric;

create table if not exists public.maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  title text not null,
  interval_km numeric,
  interval_months integer,
  last_completed_km numeric not null default 0,
  last_completed_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint maintenance_plans_interval_check check (interval_km is not null or interval_months is not null)
);

create table if not exists public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  maintenance_plan_id uuid not null references public.maintenance_plans(id) on delete cascade,
  completed_km numeric not null,
  completed_date date not null default current_date,
  notes text,
  completed_by uuid not null references auth.users(id) on delete restrict
);

alter table public.maintenance_plans enable row level security;
alter table public.maintenance_logs enable row level security;

drop policy if exists "Authenticated users can read maintenance plans" on public.maintenance_plans;
create policy "Authenticated users can read maintenance plans" on public.maintenance_plans for select to authenticated using (true);
drop policy if exists "Authenticated users can create maintenance plans" on public.maintenance_plans;
create policy "Authenticated users can create maintenance plans" on public.maintenance_plans for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update maintenance plans" on public.maintenance_plans;
create policy "Authenticated users can update maintenance plans" on public.maintenance_plans for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated users can delete maintenance plans" on public.maintenance_plans;
create policy "Authenticated users can delete maintenance plans" on public.maintenance_plans for delete to authenticated using (true);

drop policy if exists "Authenticated users can read maintenance logs" on public.maintenance_logs;
create policy "Authenticated users can read maintenance logs" on public.maintenance_logs for select to authenticated using (true);
drop policy if exists "Authenticated users can create maintenance logs" on public.maintenance_logs;
create policy "Authenticated users can create maintenance logs" on public.maintenance_logs for insert to authenticated with check (completed_by = auth.uid());
