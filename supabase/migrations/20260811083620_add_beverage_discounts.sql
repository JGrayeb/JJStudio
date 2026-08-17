alter table public.site_beverage_prices
drop constraint if exists site_beverage_prices_section_check;

alter table public.site_beverage_prices
add constraint site_beverage_prices_section_check
check (section in ('matcha', 'cold', 'hot', 'extras', 'shake', 'discounts'));

insert into public.site_beverage_prices (item_key, label, section, price, display_order)
values
  ('discount:eco-cup', 'Descuento Eco-Friendly por llevar termo', 'discounts', 30, 10),
  ('discount:client-percent', 'Descuento para clientes Nessty/JJ Studio', 'discounts', 20, 20)
on conflict (item_key) do update
set label = excluded.label,
    section = excluded.section,
    display_order = excluded.display_order;
