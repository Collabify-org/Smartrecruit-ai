
-- Profiles (named "profiles" to avoid colliding with auth.users; semantically the "users" table requested)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'trial',
  usage_jd integer not null default 0,
  usage_talent integer not null default 0,
  usage_interview integer not null default 0,
  trial_expires_at timestamptz,
  billing_date timestamptz,
  created_at timestamptz not null default now()
);

create table public.jd_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_name text,
  mode text,
  content text,
  created_at timestamptz not null default now()
);

create table public.talent_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  jd_input text,
  results text,
  created_at timestamptz not null default now()
);

create table public.interview_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  jd_input text,
  questions text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.jd_history enable row level security;
alter table public.talent_history enable row level security;
alter table public.interview_history enable row level security;

-- Profiles policies
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- History policies (read only on client; writes happen via service-role edge function)
create policy "Users view own jd history" on public.jd_history for select using (auth.uid() = user_id);
create policy "Users view own talent history" on public.talent_history for select using (auth.uid() = user_id);
create policy "Users view own interview history" on public.interview_history for select using (auth.uid() = user_id);

-- Auto-create profile on signup with 3-day trial
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan, trial_expires_at)
  values (new.id, new.email, 'trial', now() + interval '3 days');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
