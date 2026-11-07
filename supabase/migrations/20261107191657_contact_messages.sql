-- Сообщения из формы «Send a message» на странице контактов.
-- Оставить сообщение может любой посетитель, читает и отмечает прочитанным — только админ.

create table public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 2 and 80),
  email       text not null check (char_length(email) <= 200),
  message     text not null check (char_length(message) between 5 and 2000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

revoke all on public.contact_messages from anon, authenticated;
grant insert (name, email, message) on public.contact_messages to anon, authenticated;
grant select, update (is_read) on public.contact_messages to authenticated;

alter table public.contact_messages enable row level security;

create policy "Anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (is_read = false);
create policy "Admin reads messages" on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "Admin updates messages" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
