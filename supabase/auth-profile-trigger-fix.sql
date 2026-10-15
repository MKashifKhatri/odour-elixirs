-- Apply after supabase-schema.sql and supabase/odour-elixirs-migration.sql.
-- Repairs signups for projects that already ran the earlier profile-trigger migration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_is_verified boolean;
begin
  account_is_verified := coalesce(new.email_confirmed_at is not null or new.raw_app_meta_data->>'provider' = 'google', false);
  insert into public.profiles (id, name, email, is_verified, verify_code, verify_code_expiry)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    account_is_verified,
    case when account_is_verified then null else nullif(new.raw_user_meta_data->>'verify_code', '') end,
    case when account_is_verified then null else nullif(new.raw_user_meta_data->>'verify_code_expiry', '')::timestamptz end
  )
  on conflict (id) do update set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    email = excluded.email,
    is_verified = public.profiles.is_verified or excluded.is_verified,
    verify_code = case when public.profiles.is_verified or excluded.is_verified then null else coalesce(public.profiles.verify_code, excluded.verify_code) end,
    verify_code_expiry = case when public.profiles.is_verified or excluded.is_verified then null else coalesce(public.profiles.verify_code_expiry, excluded.verify_code_expiry) end;
  return new;
end;
$$;

alter function public.update_updated_at_column() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
