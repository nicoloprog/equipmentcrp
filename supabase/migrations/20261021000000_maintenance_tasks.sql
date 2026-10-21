create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  title text not null,
  due_date date not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'due_soon', 'overdue', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists maintenance_tasks_equipment_id_idx
  on public.maintenance_tasks (equipment_id);

create index if not exists maintenance_tasks_status_due_date_idx
  on public.maintenance_tasks (status, due_date);

alter table public.maintenance_tasks enable row level security;

drop policy if exists "Authenticated users can read maintenance tasks" on public.maintenance_tasks;
create policy "Authenticated users can read maintenance tasks"
  on public.maintenance_tasks for select to authenticated using (true);

drop policy if exists "Authenticated users can create maintenance tasks" on public.maintenance_tasks;
create policy "Authenticated users can create maintenance tasks"
  on public.maintenance_tasks for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update maintenance tasks" on public.maintenance_tasks;
create policy "Authenticated users can update maintenance tasks"
  on public.maintenance_tasks for update to authenticated using (true) with check (true);
