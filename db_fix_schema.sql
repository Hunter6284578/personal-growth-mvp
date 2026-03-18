-- 开启 UUID 扩展（防止报错）
create extension if not exists "uuid-ossp";

-- 1. 重置 thoughts 表（先删除旧表，确保结构正确）
drop table if exists thoughts cascade;

create table thoughts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  content text not null,
  tags text[] default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 RLS
alter table thoughts enable row level security;

-- 2. 重置 blog_posts 表（先删除旧表，确保结构正确）
drop table if exists blog_posts cascade;

create table blog_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  title text not null,
  slug text not null,
  summary text,
  content text not null,
  tags text[] default null,
  status text check (status in ('draft', 'published')) default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 RLS
alter table blog_posts enable row level security;

-- 3. 重新应用权限策略

-- Thoughts 策略
create policy "Public can view thoughts" on thoughts for select using (true);
create policy "Users can insert their own thoughts" on thoughts for insert with check (auth.uid() = user_id);
create policy "Users can update their own thoughts" on thoughts for update using (auth.uid() = user_id);
create policy "Users can delete their own thoughts" on thoughts for delete using (auth.uid() = user_id);

-- Blog Posts 策略
create policy "Users can view their own blog posts" on blog_posts for select using (auth.uid() = user_id);
create policy "Public can view published blog posts" on blog_posts for select using (status = 'published');
create policy "Users can insert their own blog posts" on blog_posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own blog posts" on blog_posts for update using (auth.uid() = user_id);
create policy "Users can delete their own blog posts" on blog_posts for delete using (auth.uid() = user_id);

-- 4. 确保 Profiles 表存在（如果不重置它，至少保证它有 RLS）
create table if not exists profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null unique,
  character_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table profiles enable row level security;

-- Profiles 策略 (使用 DO 块避免重复创建报错，或者先删后建)
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles for update using (auth.uid() = user_id);

-- 5. 触发器 (自动创建 Profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, character_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing; -- 防止重复插入报错
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
