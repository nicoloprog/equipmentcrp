alter table public.equipment
  drop constraint if exists equipment_category_check;

alter table public.equipment
  add constraint equipment_category_check
  check (category in ('truck', 'trailer', 'drill', 'battery', 'machinery'));
