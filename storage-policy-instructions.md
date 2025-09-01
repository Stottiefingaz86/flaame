# 🚨 URGENT: Fix Storage RLS Policies - Manual Steps Required

**The battle creation is failing because storage policies are not set up correctly.**

## ✅ What I've Done:
- ✅ Fixed the `battleData` scope error in the code
- ✅ Made the audio bucket public
- ✅ Confirmed the bucket exists and works with service role
- ❌ **Cannot create storage policies programmatically** (Supabase limitation)

## 🔧 What You Need to Do:

### **Step 1: Go to Supabase Dashboard**
1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** → **Policies**
3. Find the **audio** bucket
4. Click **"New Policy"**

### **Step 2: Create These 4 Policies**

#### **Policy 1: Upload**
- **Name:** `Allow authenticated users to upload audio files`
- **Type:** `INSERT`
- **Roles:** `authenticated`
- **Definition:** `bucket_id = 'audio'`

#### **Policy 2: Read**
- **Name:** `Allow authenticated users to read audio files`
- **Type:** `SELECT`
- **Roles:** `authenticated`
- **Definition:** `bucket_id = 'audio'`

#### **Policy 3: Update**
- **Name:** `Allow users to update their own audio files`
- **Type:** `UPDATE`
- **Roles:** `authenticated`
- **Definition:** `bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]`

#### **Policy 4: Delete**
- **Name:** `Allow users to delete their own audio files`
- **Type:** `DELETE`
- **Roles:** `authenticated`
- **Definition:** `bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]`

## 🎯 **After Creating Policies:**
1. **Run the database schema fix:** `fix-battles-table-final.sql` in SQL Editor
2. **Test battle creation** - it should work!

## 🚨 **Why This is Critical:**
- Battle creation is **core functionality**
- Users can't upload tracks without these policies
- The app is currently broken for battle creation
- This is the **only remaining blocker**
