-- =====================================================================
-- Первая миграция: все таблицы сайта, правила доступа (RLS) и хранилище фото.
-- Деньги везде храним в грошах (целым числом): 14,50 zł → 1450.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Наборы допустимых значений (enum)
-- ---------------------------------------------------------------------

create type public.user_role as enum ('customer', 'admin');

create type public.order_type as enum ('delivery', 'pickup', 'dine_in');

create type public.order_status as enum (
  'pending_payment',   -- заказ создан, ждём оплату в Stripe
  'new',               -- оплачен, кафе ещё не взяло в работу
  'preparing',
  'ready',
  'out_for_delivery',  -- только для доставки
  'completed',
  'cancelled'
);


-- ---------------------------------------------------------------------
-- 2. Таблицы
-- ---------------------------------------------------------------------

create table public.categories (
  id          bigint generated always as identity primary key,
  name        text not null,
  slug        text not null unique,          -- часть адреса страницы: /menu#coffee-drinks
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.dishes (
  id            bigint generated always as identity primary key,
  category_id   bigint not null references public.categories (id) on delete restrict,
  name          text not null,
  slug          text not null unique,        -- адрес карточки: /menu/flat-white
  description   text not null default '',
  price_grosze  int  not null check (price_grosze > 0),
  image_url     text,
  is_available  boolean not null default true,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index dishes_category_id_idx on public.dishes (category_id);

-- Профиль создаётся автоматически при регистрации (см. триггер ниже)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create table public.addresses (
  id           bigint generated always as identity primary key,
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  label        text,                          -- «Home», «Work»
  street       text not null,
  apartment    text,
  postal_code  text not null check (postal_code ~ '^\d{2}-\d{3}$'),
  city         text not null default 'Warszawa',
  notes        text,
  created_at   timestamptz not null default now()
);
create index addresses_user_id_idx on public.addresses (user_id);

create table public.favorites (
  user_id     uuid   not null default auth.uid() references public.profiles (id) on delete cascade,
  dish_id     bigint not null references public.dishes (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, dish_id)
);

create table public.orders (
  -- uuid вместо 1, 2, 3…: номер чужого заказа невозможно угадать
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references public.profiles (id) on delete set null,  -- пусто у гостей
  order_type                  public.order_type not null,
  status                      public.order_status not null default 'pending_payment',

  customer_name               text not null,
  customer_phone              text not null,
  customer_email              text not null,

  delivery_street             text,
  delivery_apartment          text,
  delivery_postal_code        text,
  delivery_city               text,
  delivery_notes              text,

  table_number                int check (table_number > 0),
  scheduled_for               timestamptz,   -- выбранный слот; пусто для заказа за столиком

  subtotal_grosze             int not null check (subtotal_grosze >= 0),
  delivery_fee_grosze         int not null default 0 check (delivery_fee_grosze >= 0),
  total_grosze                int not null,

  stripe_checkout_session_id  text unique,
  paid_at                     timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- Сумма должна сходиться
  constraint orders_total_check check (total_grosze = subtotal_grosze + delivery_fee_grosze),
  -- Для доставки нужны адрес и время
  constraint orders_delivery_check check (
    order_type <> 'delivery'
    or (delivery_street is not null and delivery_postal_code is not null and scheduled_for is not null)
  ),
  -- Для самовывоза нужно время
  constraint orders_pickup_check check (order_type <> 'pickup' or scheduled_for is not null),
  -- Для заказа на месте нужен номер столика
  constraint orders_dine_in_check check (order_type <> 'dine_in' or table_number is not null)
);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id                 bigint generated always as identity primary key,
  order_id           uuid not null references public.orders (id) on delete cascade,
  dish_id            bigint references public.dishes (id) on delete set null,
  -- Название и цену копируем: если блюдо потом изменят, старый заказ не поменяется
  dish_name          text not null,
  unit_price_grosze  int  not null check (unit_price_grosze > 0),
  quantity           int  not null check (quantity > 0)
);
create index order_items_order_id_idx on public.order_items (order_id);

create table public.table_bookings (
  id            bigint generated always as identity primary key,
  name          text not null,
  email         text not null,
  phone         text not null,
  seats         int  not null check (seats >= 5),
  booking_date  date not null,
  booking_time  time not null,
  status        text not null default 'new' check (status in ('new', 'confirmed', 'declined')),
  created_at    timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 3. Автоматика (триггеры)
-- ---------------------------------------------------------------------

-- Обновляет updated_at при каждом изменении строки
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dishes_set_updated_at
  before update on public.dishes
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Когда человек регистрируется, создаём ему профиль
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Проверка «текущий пользователь — админ?» для правил доступа
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ---------------------------------------------------------------------
-- 4. Права доступа
-- Сначала забираем все права у посетителей (anon) и вошедших (authenticated),
-- потом выдаём только нужные. Сервер с секретным ключом работает в обход этих правил:
-- так создаются заказы, после того как сервер сам посчитал сумму.
-- ---------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

grant select on public.categories, public.dishes to anon, authenticated;
grant insert, update, delete on public.categories, public.dishes to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;  -- роль поменять нельзя

grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, delete on public.favorites to authenticated;

grant select on public.orders, public.order_items to authenticated;
grant update (status) on public.orders to authenticated;  -- только статус, и только админ (см. RLS)

grant insert on public.table_bookings, public.newsletter_subscribers to anon, authenticated;
grant select, update (status) on public.table_bookings to authenticated;
grant select on public.newsletter_subscribers to authenticated;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------
-- 5. RLS — «охранник» для каждой строки
-- ---------------------------------------------------------------------

alter table public.categories             enable row level security;
alter table public.dishes                 enable row level security;
alter table public.profiles               enable row level security;
alter table public.addresses              enable row level security;
alter table public.favorites              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.table_bookings         enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Меню видят все, меняет только админ
create policy "Anyone can read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "Admin manages categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can read dishes" on public.dishes
  for select to anon, authenticated using (true);
create policy "Admin manages dishes" on public.dishes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Профиль: свой видишь и меняешь, админ видит все
create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Адреса и избранное: только свои
create policy "Users manage own addresses" on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Users manage own favorites" on public.favorites
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Заказы: свои видишь, админ видит все и меняет статус
create policy "Users read own orders" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "Admin updates orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Users read own order items" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())
    )
  );

-- Бронь и рассылка: оставить заявку может любой, читает только админ
create policy "Anyone can request a booking" on public.table_bookings
  for insert to anon, authenticated with check (status = 'new');
create policy "Admin reads bookings" on public.table_bookings
  for select to authenticated using (public.is_admin());
create policy "Admin updates bookings" on public.table_bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy "Admin reads subscribers" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------
-- 6. Хранилище фото блюд
-- Публичная «папка»: смотреть фото может любой, загружать и удалять — только админ.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dish-photos', 'dish-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admin uploads dish photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'dish-photos' and public.is_admin());
create policy "Admin updates dish photos" on storage.objects
  for update to authenticated using (bucket_id = 'dish-photos' and public.is_admin());
create policy "Admin deletes dish photos" on storage.objects
  for delete to authenticated using (bucket_id = 'dish-photos' and public.is_admin());
