create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  encrypted_profile bytea not null,
  updated_at timestamptz not null default now()
);

alter table public.nutrition_profiles enable row level security;
revoke all on public.nutrition_profiles from anon, authenticated;
grant all on public.nutrition_profiles to service_role;

select vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'gymratai_nutrition_data_key',
  'Encryption key for GymRatAi nutrition profile payloads'
)
where not exists (
  select 1 from vault.decrypted_secrets
  where name = 'gymratai_nutrition_data_key'
);

create or replace function public.save_nutrition_profile(p_user_id uuid, p_profile jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'gymratai_nutrition_data_key';

  if v_key is null then
    raise exception 'Nutrition profile encryption key is unavailable';
  end if;

  insert into public.nutrition_profiles (user_id, encrypted_profile, updated_at)
  values (
    p_user_id,
    extensions.pgp_sym_encrypt(p_profile::text, v_key, 'cipher-algo=aes256'),
    now()
  )
  on conflict (user_id) do update
  set encrypted_profile = excluded.encrypted_profile,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.get_nutrition_profile(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
  v_profile jsonb;
begin
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'gymratai_nutrition_data_key';

  if v_key is null then
    raise exception 'Nutrition profile encryption key is unavailable';
  end if;

  select extensions.pgp_sym_decrypt(encrypted_profile, v_key)::jsonb
  into v_profile
  from public.nutrition_profiles
  where user_id = p_user_id;

  return v_profile;
end;
$$;

revoke all on function public.save_nutrition_profile(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.get_nutrition_profile(uuid) from public, anon, authenticated;
grant execute on function public.save_nutrition_profile(uuid, jsonb) to service_role;
grant execute on function public.get_nutrition_profile(uuid) to service_role;
