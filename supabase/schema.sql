-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase Auth users)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Inquiries (contact form submissions)
create table inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

-- Quotations
create table quotations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  service_interest text not null,
  project_details text not null,
  preferred_date date,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text not null,
  category text not null,
  images text[] default '{}',
  client text,
  completed_date date,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Testimonials
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  client_title text,
  company text,
  content text not null,
  rating smallint check (rating >= 1 and rating <= 5),
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Services
create table services (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  short_description text not null,
  full_description text not null,
  icon text,
  features text[] default '{}',
  order_index int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table inquiries enable row level security;
alter table quotations enable row level security;
alter table projects enable row level security;
alter table testimonials enable row level security;
alter table services enable row level security;

-- Authenticated admins can read/write everything
create policy "Admins full access on profiles"
  on profiles for all using (auth.role() = 'authenticated');

create policy "Admins full access on inquiries"
  on inquiries for all using (auth.role() = 'authenticated');

create policy "Admins full access on quotations"
  on quotations for all using (auth.role() = 'authenticated');

create policy "Admins full access on projects"
  on projects for all using (auth.role() = 'authenticated');

create policy "Admins full access on testimonials"
  on testimonials for all using (auth.role() = 'authenticated');

create policy "Admins full access on services"
  on services for all using (auth.role() = 'authenticated');

-- Public can insert inquiries and quotations
create policy "Public insert inquiries"
  on inquiries for insert with check (true);

create policy "Public insert quotations"
  on quotations for insert with check (true);

-- Public can read published services, projects, testimonials
create policy "Public read published services"
  on services for select using (published = true);

create policy "Public read published projects"
  on projects for select using (published = true);

create policy "Public read published testimonials"
  on testimonials for select using (published = true);
