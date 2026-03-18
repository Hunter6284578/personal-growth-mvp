-- 用户资料表
create table if not exists profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null unique,
  character_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 想法/短内容表
create table if not exists thoughts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  content text not null,
  tags text[] default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 博客文章表
create table if not exists blog_posts (
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

-- 启用 RLS (行级安全策略)
alter table profiles enable row level security;
alter table thoughts enable row level security;
alter table blog_posts enable row level security;

-- Profiles 策略
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = user_id);

-- Thoughts 策略 (公开可见，用户管理自己的)
create policy "Public can view thoughts" on thoughts
  for select using (true);

create policy "Users can insert their own thoughts" on thoughts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own thoughts" on thoughts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own thoughts" on thoughts
  for delete using (auth.uid() = user_id);

-- Blog Posts 策略 (用户管理自己的文章，公开已发布的文章)
create policy "Users can view their own blog posts" on blog_posts
  for select using (auth.uid() = user_id);

create policy "Public can view published blog posts" on blog_posts
  for select using (status = 'published');

create policy "Users can insert their own blog posts" on blog_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own blog posts" on blog_posts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own blog posts" on blog_posts
  for delete using (auth.uid() = user_id);

-- 自动创建 Profile 的触发器
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, character_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- 检查触发器是否存在，如果不存在则创建
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
