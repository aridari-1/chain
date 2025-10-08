-- Users
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  username text unique,
  email text,
  created_at timestamp default now()
);

-- Chains
create table if not exists chains (
  id uuid primary key default uuid_generate_v4(),
  type text check (type in ('global', 'friend')),
  max_clips int,
  creator_id uuid references users(id),
  created_at timestamp default now()
);

-- Clips
create table if not exists clips (
  id uuid primary key default uuid_generate_v4(),
  chain_id uuid references chains(id),
  user_id uuid references users(id),
  audio_url text,
  created_at timestamp default now()
);

-- Invites
create table if not exists invites (
  id uuid primary key default uuid_generate_v4(),
  chain_id uuid references chains(id),
  invite_link text unique,
  created_at timestamp default now()
);