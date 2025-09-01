# Fix Storage RLS Policies - Manual Steps

Since the SQL approach gives a permission error, we need to set up the storage policies through the Supabase Dashboard.

## Step 1: Go to Storage Policies in Supabase Dashboard

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** → **Policies**
3. Find the **audio** bucket
4. Click **"New Policy"**

## Step 2: Create Upload Policy

**Policy Name:** `Allow authenticated users to upload audio files`

**Policy Type:** `INSERT`

**Target Roles:** `authenticated`

**Policy Definition:**
```sql
bucket_id = 'audio'
```

## Step 3: Create Read Policy

**Policy Name:** `Allow authenticated users to read audio files`

**Policy Type:** `SELECT`

**Target Roles:** `authenticated`

**Policy Definition:**
```sql
bucket_id = 'audio'
```

## Step 4: Create Update Policy

**Policy Name:** `Allow users to update their own audio files`

**Policy Type:** `UPDATE`

**Target Roles:** `authenticated`

**Policy Definition:**
```sql
bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Step 5: Create Delete Policy

**Policy Name:** `Allow users to delete their own audio files`

**Policy Type:** `DELETE`

**Target Roles:** `authenticated`

**Policy Definition:**
```sql
bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Alternative: Use Service Role Key

If you want to use the service role key approach, you can also:

1. Go to **Settings** → **API**
2. Copy your **Service Role Key** (not the anon key)
3. Use that in a script with admin privileges

But the Dashboard approach above should work for most cases.
