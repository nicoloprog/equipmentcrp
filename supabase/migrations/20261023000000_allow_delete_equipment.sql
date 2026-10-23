drop policy if exists "Authenticated users can delete equipment" on public.equipment;
create policy "Authenticated users can delete equipment"
  on public.equipment for delete to authenticated using (true);

drop policy if exists "Authenticated users can delete equipment photos" on storage.objects;
create policy "Authenticated users can delete equipment photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'equipment-photos');
