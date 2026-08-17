insert into public.site_admins (email)
values ('jucagrape@gmail.com')
on conflict (email) do nothing;

drop policy if exists "administrator deletes promotions" on public.site_promotions;
drop policy if exists "administrator inserts promotions" on public.site_promotions;
drop policy if exists "administrator updates promotions" on public.site_promotions;
drop policy if exists "authenticated reads active or administers" on public.site_promotions;

create policy "administrators delete promotions"
on public.site_promotions
for delete
to authenticated
using (
  exists (
    select 1
    from public.site_admins
    where email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

create policy "administrators insert promotions"
on public.site_promotions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.site_admins
    where email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

create policy "administrators update promotions"
on public.site_promotions
for update
to authenticated
using (
  exists (
    select 1
    from public.site_admins
    where email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.site_admins
    where email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

create policy "authenticated reads active or administers"
on public.site_promotions
for select
to authenticated
using (
  (
    active
    and now() >= starts_at
    and now() <= ends_at
  )
  or exists (
    select 1
    from public.site_admins
    where email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);
