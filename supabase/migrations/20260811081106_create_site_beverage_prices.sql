create table if not exists public.site_beverage_prices (
  item_key text primary key,
  label text not null,
  section text not null check (section in ('matcha', 'cold', 'hot', 'extras', 'shake')),
  price numeric(10, 2) not null check (price >= 0 and price <= 100000),
  display_order smallint not null default 0,
  updated_at timestamp with time zone not null default now()
);

alter table public.site_beverage_prices enable row level security;

revoke all on table public.site_beverage_prices from anon, authenticated;
grant select on table public.site_beverage_prices to anon, authenticated;
grant update (price, updated_at) on table public.site_beverage_prices to authenticated;
grant all on table public.site_beverage_prices to service_role;

drop policy if exists "anonymous reads beverage prices" on public.site_beverage_prices;
drop policy if exists "authenticated reads beverage prices" on public.site_beverage_prices;
drop policy if exists "administrators update beverage prices" on public.site_beverage_prices;

create policy "anonymous reads beverage prices"
on public.site_beverage_prices
for select
to anon
using (true);

create policy "authenticated reads beverage prices"
on public.site_beverage_prices
for select
to authenticated
using (true);

create policy "administrators update beverage prices"
on public.site_beverage_prices
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

insert into public.site_beverage_prices (item_key, label, section, price, display_order)
values
  ('matcha:premium', 'Matcha Premium', 'matcha', 145, 10),
  ('matcha:ceremonial', 'Matcha Ceremonial', 'matcha', 165, 20),
  ('cold:cold-latte', 'Cold Latte', 'cold', 110, 10),
  ('cold:cold-americano', 'Cold Americano', 'cold', 95, 20),
  ('cold:cold-chai', 'Cold Chai', 'cold', 110, 30),
  ('hot:hot-espresso', 'Hot Espresso', 'hot', 65, 10),
  ('hot:hot-americano', 'Hot Americano', 'hot', 65, 20),
  ('hot:hot-latte', 'Hot Latte', 'hot', 75, 30),
  ('hot:hot-chai', 'Hot Chai', 'hot', 75, 40),
  ('hot:hot-matcha', 'Hot Matcha', 'hot', 85, 50),
  ('extras:espresso-shot', 'Shot de espresso', 'extras', 10, 10),
  ('extras:protein', 'Scoop de proteína', 'extras', 20, 20),
  ('extras:creatine', 'Creatina monohidratada ELEMENTAL', 'extras', 15, 30),
  ('extras:caramel', 'Caramel drizzle', 'extras', 5, 40),
  ('shake:protein-shake', 'Protein Shake', 'shake', 65, 10)
on conflict (item_key) do update
set label = excluded.label,
    section = excluded.section,
    display_order = excluded.display_order;
