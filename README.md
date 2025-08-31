# Flame Battles - Hip-Hop Battle Platform

A production-quality hip-hop battle platform built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features a flames currency system, exclusive avatars, beats marketplace, and profile customization.

## 🚀 Features

### Core Battle System
- **Dedicated Battle Pages**: Each battle has its own `/battle/[id]` page with full details
- **Vote Gate**: Results are hidden until users vote (costs 1 🔥 flame)
- **Lyrics Management**: Rappers can add/edit their lyrics (owner-only)
- **Audio Waveforms**: Interactive audio players using WaveSurfer.js
- **Sponsor Integration**: Configurable sponsor placements (hero, sidebar, footer)

### Flames Currency System (🔥)
- **Earn Flames**: Win battles (+25 🔥), draw (+5 🔥), daily check-ins (+1 🔥)
- **Spend Flames**: Purchase beats, avatars, and profile cosmetics
- **Wallet Management**: Real-time balance updates with transaction history

### Store & Customization
- **Avatar Store**: Purchase unique profile avatars
- **Beat Store**: Buy exclusive beats with audio previews
- **Profile Customization**: Equip avatars, badges, and theme colors
- **Inventory System**: Track owned items and licenses

### UI/UX
- **Dark Glass UI**: Spotify/Splice-inspired design with backdrop blur
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Framer Motion for micro-interactions
- **Flame Theme**: Consistent orange/red gradient branding

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Audio**: WaveSurfer.js
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hhba
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- 1) Add optional lyrics to each entry
   alter table public.battle_entries
     add column lyrics text;

   -- 2) Sponsors
   create table if not exists public.sponsors (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     logo_url text,
     link_url text,
     created_at timestamptz default now()
   );

   create type sponsor_slot as enum ('hero','sidebar','footer');

   create table if not exists public.battle_sponsors (
     battle_id uuid references public.battles(id) on delete cascade,
     sponsor_id uuid references public.sponsors(id) on delete cascade,
     slot sponsor_slot not null,
     priority int default 0,
     primary key (battle_id, sponsor_id, slot)
   );

   -- 3) Helper view: has current user voted in this battle?
   create or replace view public.votes_summary as
   select
     b.id as battle_id,
     v.voter_id,
     count(*) as ballots,
     coalesce(sum(v.weight),0) as total_weight
   from public.battles b
   left join public.votes v on v.battle_id = b.id
   group by 1,2;

   -- 4) Profile personalization (avatars, colors, icons)
   alter table public.profiles
     add column avatar_id uuid,
     add column profile_color text,
     add column profile_icon text;

   create table if not exists public.avatars (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     image_url text not null,
     cost_flames int not null default 0
   );

   -- 5) Beats marketplace with flame pricing
   alter table public.beats
     add column cost_flames int default 0;

   -- 6) Beat licenses
   create table if not exists public.beat_licenses (
     id uuid primary key default gen_random_uuid(),
     beat_id uuid references public.beats(id) on delete cascade,
     buyer_id uuid references auth.users(id) on delete cascade,
     granted_at timestamptz default now(),
     unique(beat_id, buyer_id)
   );

   -- 7) Cosmetics catalog
   create table if not exists public.cosmetics (
     id uuid primary key default gen_random_uuid(),
     kind text not null check (kind in ('badge','theme_color')),
     label text not null,
     value text not null,
     price_flames int not null default 0,
     created_at timestamptz default now()
   );

   -- 8) User inventory
   create table if not exists public.inventory (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) on delete cascade,
     item_kind text not null check (item_kind in ('avatar','badge','theme_color')),
     item_id uuid not null,
     acquired_at timestamptz default now()
   );

   -- 9) Transactions table
   create table if not exists public.transactions (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) on delete cascade,
     amount int not null,
     type text not null check (type in ('EARN','SPEND')),
     description text,
     created_at timestamptz default now()
   );

   -- 10) Economy settings
   create table if not exists public.economy_settings (
     id boolean primary key default true,
     win_reward_flames int not null default 25,
     draw_reward_flames int not null default 5
   );
   ```

5. **Set up Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   alter table public.battle_entries enable row level security;
   alter table public.votes enable row level security;
   alter table public.battle_sponsors enable row level security;
   alter table public.sponsors enable row level security;
   alter table public.avatars enable row level security;
   alter table public.beats enable row level security;
   alter table public.beat_licenses enable row level security;
   alter table public.cosmetics enable row level security;
   alter table public.inventory enable row level security;
   alter table public.transactions enable row level security;

   -- Battle entries: owner can update lyrics, everyone can read
   create policy "battle_entries_read" on public.battle_entries for select using (true);
   create policy "battle_entries_owner_update" on public.battle_entries for update using (auth.uid() = user_id);

   -- Votes: everyone can read, authed users can insert during voting
   create policy "votes_read" on public.votes for select using (true);
   create policy "votes_insert" on public.votes for insert with check (auth.uid() = voter_id);

   -- Sponsors: read public, write admin-only
   create policy "sponsors_read" on public.sponsors for select using (true);
   create policy "battle_sponsors_read" on public.battle_sponsors for select using (true);

   -- Avatars and beats: read public, write admin-only
   create policy "avatars_read" on public.avatars for select using (true);
   create policy "beats_read" on public.beats for select using (true);

   -- Licenses: owner can read and insert
   create policy "licenses_owner_read" on public.beat_licenses for select using (auth.uid() = buyer_id);
   create policy "licenses_owner_insert" on public.beat_licenses for insert with check (auth.uid() = buyer_id);

   -- Inventory: owner can read and insert
   create policy "inventory_owner_read" on public.inventory for select using (auth.uid() = user_id);
   create policy "inventory_owner_insert" on public.inventory for insert with check (auth.uid() = user_id);

   -- Cosmetics: read public, write admin-only
   create policy "cosmetics_read" on public.cosmetics for select using (true);

   -- Transactions: owner can read and insert
   create policy "transactions_owner_read" on public.transactions for select using (auth.uid() = user_id);
   create policy "transactions_owner_insert" on public.transactions for insert with check (auth.uid() = user_id);
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Routes

- `/` - Home page with feature showcase
- `/battle/[id]` - Individual battle page with voting and lyrics
- `/store/avatars` - Avatar marketplace
- `/store/beats` - Beat marketplace with audio previews
- `/profile/customize` - Profile customization page

## 🔥 Flames Economy

### Earning Flames
- **Win a battle**: +25 🔥
- **Draw**: +5 🔥
- **Daily check-in**: +1 🔥

### Spending Flames
- **Vote in battle**: -1 🔥
- **Buy avatars**: 10-100 🔥
- **Buy beats**: 25-200 🔥
- **Buy cosmetics**: 5-50 🔥

## 🎨 Customization

### Profile Items
- **Avatars**: Unique profile pictures
- **Badges**: Profile icons (crown, flame, etc.)
- **Theme Colors**: Custom color schemes

### Battle Features
- **Lyrics**: Add/edit your battle lyrics
- **Audio**: High-quality waveform players
- **Sponsors**: Configurable ad placements

## 🚀 Deployment

1. **Deploy to Vercel**
   ```bash
   npm run build
   ```

2. **Set environment variables** in your deployment platform

3. **Configure Supabase** with your production database

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Issues

If you encounter any issues, please create a new issue in the repository with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
