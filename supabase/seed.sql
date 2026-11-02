-- Тестовое меню из макета Figma.
-- Цены: доллары из макета ×4 с округлением, записаны в грошах (1400 = 14 zł).
-- Фото добавим на этапе 3.

insert into public.categories (name, slug, sort_order) values
  ('Coffee, Drinks',      'coffee-drinks',       1),
  ('Fresh From the Oven', 'fresh-from-the-oven', 2),
  ('Breakfast All Day',   'breakfast-all-day',   3),
  ('Something Sweet',     'something-sweet',     4);

insert into public.dishes (category_id, name, slug, description, price_grosze, sort_order)
select c.id, d.name, d.slug, d.description, d.price_grosze, d.sort_order
from (values
  ('coffee-drinks', 'Drip Coffee',         'drip-coffee',         'Batch-brewed, changes with the single-origin.', 1400, 1),
  ('coffee-drinks', 'Flat White',          'flat-white',          'Double ristretto, steamed to 55°C.',            1900, 2),
  ('coffee-drinks', 'Cortado',             'cortado',             'Equal parts espresso and warm milk.',           1700, 3),
  ('coffee-drinks', 'Iced Tonic Espresso', 'iced-tonic-espresso', 'Double shot over tonic, orange peel.',          2000, 4),
  ('coffee-drinks', 'Matcha Latte',        'matcha-latte',        'Ceremonial grade, steamed oat milk.',           2100, 5),

  ('fresh-from-the-oven', 'Brown Butter Croissant',          'brown-butter-croissant',      'Laminated dough, browned butter.',               2200, 1),
  ('fresh-from-the-oven', 'Pistachio Cardamom Bun',          'pistachio-cardamom-bun',      'Sweet dough, crushed pistachio.',                2400, 2),
  ('fresh-from-the-oven', 'Sourdough Toast, Ricotta & Honey', 'sourdough-toast-ricotta-honey', 'House sourdough, whipped ricotta, local honey.', 3400, 3),
  ('fresh-from-the-oven', 'Granola Bowl',                    'granola-bowl',                'House granola, yoghurt, seasonal fruit.',        3000, 4),

  ('breakfast-all-day', 'Shakshuka',                   'shakshuka',                   'Two eggs, slow peppers, torn sourdough.',   4800, 1),
  ('breakfast-all-day', 'Soup of the Day',             'soup-of-the-day',             'Ask what''s on the board today.',          3600, 2),
  ('breakfast-all-day', 'Grain Bowl',                  'grain-bowl',                  'Farro, roasted vegetables, tahini, herbs.', 5400, 3),
  ('breakfast-all-day', 'Grilled Cheese on Sourdough', 'grilled-cheese-on-sourdough', 'Three cheese, caramelized onion.',          3800, 4),

  ('something-sweet', 'Olive Oil Cake',         'olive-oil-cake',         'Citrus glaze, flaky salt.',           2600, 1),
  ('something-sweet', 'Chocolate Rye Cookie',   'chocolate-rye-cookie',   'Dark chocolate, toasted rye flour.',  1400, 2),
  ('something-sweet', 'Seasonal Fruit Galette', 'seasonal-fruit-galette', 'Whatever''s ripe this week.',         2800, 3)
) as d (category_slug, name, slug, description, price_grosze, sort_order)
join public.categories c on c.slug = d.category_slug;
