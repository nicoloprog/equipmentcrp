drop policy if exists "Authenticated users can delete equipment alerts" on public.equipment_alerts;
create policy "Authenticated users can delete equipment alerts"
  on public.equipment_alerts
  for delete
  to authenticated
  using (true);
