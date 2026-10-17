
-- Sherpherd Academy
-- Initial database structure for Supabase.
-- Review and harden access policies before using real school records.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'pending'
    check (role in ('pending', 'admin', 'teacher', 'parent')),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_number text not null unique,
  first_name text not null,
  last_name text not null,
  class_name text,
  guardian_name text,
  guardian_phone text,
  date_of_birth date,
  admission_date date,
  status text not null default 'Active'
    check (status in ('Active', 'Inactive', 'Graduated', 'Withdrawn')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  staff_number text not null unique,
  full_name text not null,
  email text,
  phone text,
  job_title text,
  status text not null default 'Active'
    check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null
    check (status in ('Present', 'Absent', 'Late', 'Excused')),
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'NGN',
  payment_reference text unique,
  payment_date date not null default current_date,
  payment_method text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists students_class_name_idx
  on public.students(class_name);

create index if not exists attendance_date_idx
  on public.attendance(attendance_date);

create index if not exists attendance_student_idx
  on public.attendance(student_id);

create index if not exists fee_payments_student_idx
  on public.fee_payments(student_id);

-- Enable row-level security.
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.staff enable row level security;
alter table public.attendance enable row level security;
alter table public.fee_payments enable row level security;
alter table public.announcements enable row level security;

-- Minimal safe starting point: authenticated users can read their own profile.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- No student, staff, attendance, payment, or announcement policies
-- are added here intentionally. Those tables remain inaccessible through
-- the public client API until proper role-aware policies are designed.
--
-- Important:
-- 1. Do not allow users to assign themselves the admin role.
-- 2. Create profiles through a trusted signup workflow or protected trigger.
-- 3. Restrict each table by role and, where applicable, student/parent links.
-- 4. Never expose the service_role key in browser JavaScript.
