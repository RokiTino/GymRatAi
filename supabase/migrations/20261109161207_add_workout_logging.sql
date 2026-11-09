create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Workout' check (char_length(name) between 1 and 100),
  started_at timestamptz not null default now(),
  completed_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_completed_idx
  on public.workout_sessions (user_id, completed_at desc);

alter table public.workout_sessions enable row level security;

grant select, insert, update, delete on public.workout_sessions to authenticated;

create policy workout_sessions_select_own
  on public.workout_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy workout_sessions_insert_own
  on public.workout_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy workout_sessions_update_own
  on public.workout_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy workout_sessions_delete_own
  on public.workout_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_name text not null check (char_length(exercise_name) between 1 and 100),
  set_number integer not null check (set_number > 0),
  weight_kg numeric(7, 2) not null default 0 check (weight_kg >= 0),
  repetitions smallint not null check (repetitions between 1 and 1000),
  created_at timestamptz not null default now(),
  unique (session_id, exercise_name, set_number)
);

create index if not exists workout_sets_session_order_idx
  on public.workout_sets (session_id, set_number);

alter table public.workout_sets enable row level security;

grant select, insert, update, delete on public.workout_sets to authenticated;

create policy workout_sets_select_own_session
  on public.workout_sets for select to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions as session
      where session.id = workout_sets.session_id
        and session.user_id = (select auth.uid())
    )
  );

create policy workout_sets_insert_own_session
  on public.workout_sets for insert to authenticated
  with check (
    exists (
      select 1
      from public.workout_sessions as session
      where session.id = workout_sets.session_id
        and session.user_id = (select auth.uid())
    )
  );

create policy workout_sets_update_own_session
  on public.workout_sets for update to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions as session
      where session.id = workout_sets.session_id
        and session.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workout_sessions as session
      where session.id = workout_sets.session_id
        and session.user_id = (select auth.uid())
    )
  );

create policy workout_sets_delete_own_session
  on public.workout_sets for delete to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions as session
      where session.id = workout_sets.session_id
        and session.user_id = (select auth.uid())
    )
  );

create or replace function public.save_workout(
  p_name text,
  p_started_at timestamptz,
  p_sets jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_session_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to save a workout';
  end if;

  if p_sets is null or jsonb_typeof(p_sets) <> 'array' or jsonb_array_length(p_sets) = 0 then
    raise exception 'A workout must include at least one set';
  end if;

  insert into public.workout_sessions (user_id, name, started_at, completed_at)
  values ((select auth.uid()), coalesce(nullif(trim(p_name), ''), 'Workout'), coalesce(p_started_at, now()), now())
  returning id into v_session_id;

  insert into public.workout_sets (session_id, exercise_name, set_number, weight_kg, repetitions)
  select
    v_session_id,
    workout_set.exercise_name,
    workout_set.set_number,
    workout_set.weight_kg,
    workout_set.repetitions
  from jsonb_to_recordset(p_sets) as workout_set(
    exercise_name text,
    set_number integer,
    weight_kg numeric,
    repetitions smallint
  );

  return v_session_id;
end;
$$;

revoke all on function public.save_workout(text, timestamptz, jsonb) from public, anon;
grant execute on function public.save_workout(text, timestamptz, jsonb) to authenticated;
