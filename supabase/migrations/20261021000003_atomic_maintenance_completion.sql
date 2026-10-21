create or replace function public.complete_maintenance_plan(
  p_plan_id uuid,
  p_equipment_id uuid,
  p_completed_km numeric,
  p_completed_by uuid,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_log_id uuid;
begin
  if p_completed_by <> auth.uid() then
    raise exception 'You can only complete maintenance as the signed-in user';
  end if;

  update public.maintenance_plans
  set last_completed_km = p_completed_km,
      last_completed_date = current_date
  where id = p_plan_id
    and equipment_id = p_equipment_id
    and active = true;

  if not found then
    raise exception 'Maintenance rule was not found or is inactive';
  end if;

  insert into public.maintenance_logs (
    equipment_id,
    maintenance_plan_id,
    completed_km,
    completed_date,
    notes,
    completed_by
  ) values (
    p_equipment_id,
    p_plan_id,
    p_completed_km,
    current_date,
    p_notes,
    p_completed_by
  )
  returning id into new_log_id;

  return new_log_id;
end;
$$;

grant execute on function public.complete_maintenance_plan(uuid, uuid, numeric, uuid, text) to authenticated;
