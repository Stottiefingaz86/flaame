# Flaame Platform Setup Guide

## 🚀 Complete Setup Instructions

### 1. Supabase Database Setup

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/qfeysqvdsziaucesgfwz

2. **Navigate to SQL Editor** and run the complete schema from `supabase-schema.sql`

3. **Set up Storage Buckets**:
   - Go to Storage → Buckets
   - Create bucket: `beats` (for audio files)
   - Create bucket: `avatars` (for profile pictures)
   - Create bucket: `battles` (for battle recordings)

4. **Configure Storage Policies**:
   ```sql
   -- Allow public read access to beats
   CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'beats');
   
   -- Allow authenticated users to upload beats
   CREATE POLICY "Authenticated users can upload beats" ON storage.objects FOR INSERT 
   WITH CHECK (bucket_id = 'beats' AND auth.role() = 'authenticated');
   
   -- Allow users to update their own uploads
   CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE 
   USING (bucket_id = 'beats' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 2. Environment Configuration

Your `.env.local` file is already configured with:
- ✅ Supabase URL and API keys
- ✅ File upload settings
- ⚠️ Instagram OAuth (needs to be configured for production)

### 3. Instagram OAuth Setup (Optional for Development)

For production, you'll need to:
1. Create a Facebook App at https://developers.facebook.com/
2. Add Instagram Basic Display
3. Configure OAuth redirect URLs
4. Add credentials to `.env.local`

### 4. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 Key Features Implemented

### ✅ Authentication System
- Instagram OAuth integration
- User profile management
- Session handling

### ✅ Battle System
- Create battles with 6-day creation period
- Upload battle entries with audio
- Voting system (1 flame per vote)
- Comments (only after voting)

### ✅ Beat Marketplace
- Upload original beats
- Copyright verification system
- Free and paid beats
- Beat licensing

### ✅ Economy System
- Flame currency (earn/spend)
- Transaction logging
- User rankings based on points (3 for win, 1 for draw, 0 for loss)

### ✅ Chat System
- Real-time chat with emojis
- Purchasable emojis with flames
- Battle challenges
- Minimizable interface

### ✅ Leaderboard
- Soccer table format with points
- Global, weekly, and tier rankings
- User verification badges

### ✅ Store
- Avatar customization
- Beat marketplace
- Flame purchases

## 🔧 Database Schema Overview

### Core Tables
- **profiles**: User profiles with Instagram integration
- **battles**: Battle information and status
- **battle_entries**: User submissions with audio
- **votes**: Voting records
- **comments**: Battle discussions
- **beats**: Beat marketplace
- **beat_licenses**: Beat ownership
- **transactions**: Flame economy tracking

### Security Features
- Row Level Security (RLS) on all tables
- User authentication required for sensitive operations
- Copyright verification for non-original content
- File upload validation and size limits

## 🎵 Beat Upload System

### Copyright Protection
1. **Original Content**: Auto-verified, immediately available
2. **Non-Original Content**: Requires manual verification
3. **File Validation**: Type and size restrictions
4. **User Accountability**: Uploader ID tracking

### Upload Process
1. User selects audio file (MP3, WAV, AAC up to 10MB)
2. Fills beat information (title, artist, BPM, key, genre)
3. Sets pricing (free or flame cost)
4. Declares originality
5. File uploaded to Supabase Storage
6. Database record created
7. Copyright verification if needed

## 🏆 Battle System

### Battle Lifecycle
1. **Creation**: 6-day entry period
2. **Active**: Users can submit entries
3. **Voting**: 1-day voting period
4. **Closed**: Results finalized

### Points System
- **Win**: 3 points
- **Draw**: 1 point  
- **Loss**: 0 points
- Rankings updated automatically

## 💰 Flame Economy

### Earning Flames
- Winning battles
- Daily check-ins
- Special events

### Spending Flames
- Voting in battles (1 flame)
- Purchasing beats
- Buying avatars and emojis
- Premium features

## 🚀 Next Steps

### For Production
1. Set up Instagram OAuth credentials
2. Configure custom domain
3. Set up email notifications
4. Add analytics tracking
5. Implement rate limiting
6. Set up monitoring and logging

### Additional Features to Consider
1. **Real-time notifications** for battle updates
2. **Battle tournaments** with brackets
3. **Producer profiles** with beat collections
4. **Social features** like following users
5. **Mobile app** development
6. **API documentation** for third-party integrations

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection in Network tab
3. Check database logs in Supabase dashboard
4. Ensure all environment variables are set correctly

The platform is now fully functional with a complete battle system, beat marketplace, and social features! 🎉
