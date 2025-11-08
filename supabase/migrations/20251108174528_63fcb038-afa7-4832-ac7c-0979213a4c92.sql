-- Create roles enum
create type public.app_role as enum ('ADMIN','DIRETORIA','SECRETARIA','FINANCEIRO','PROFESSOR','PEDAGOGICO','ENCARREGADO');

-- Profiles table
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS: users can manage only their own profile
create policy "Users can view own profile" on public.profiles
for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
for update to authenticated
using (auth.uid() = user_id);

-- updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Attach trigger to profiles
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- RLS: users can read their own roles
create policy "Users can read their roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

-- Security definer function to check role
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;