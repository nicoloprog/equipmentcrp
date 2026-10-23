create or replace function public.delete_equipment(p_equipment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  delete from public.equipment
  where id = p_equipment_id
  returning id into deleted_id;

  return deleted_id;
end;
$$;

revoke all on function public.delete_equipment(uuid) from public;
grant execute on function public.delete_equipment(uuid) to authenticated;
