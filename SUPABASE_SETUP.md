# Supabase Setup Guide for Flame Battles

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `flame-battles`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Instagram OAuth (for production)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 4. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire SQL schema from `README.md` (the section starting with `-- Create tables`)
3. Click "Run" to execute the schema

## 5. Set Up Row Level Security (RLS)

The RLS policies are included in the schema. They will be automatically applied when you run the SQL.

## 6. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers:
   - **Email**: Enable email confirmations
   - **Instagram**: Add your Instagram OAuth credentials
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

## 7. Set Up Storage (Optional)

1. Go to **Storage** → **Buckets**
2. Create buckets for:
   - `avatars` (for user profile pictures)
   - `beats` (for audio files)
   - `battles` (for battle recordings)

## 8. Test Your Setup

1. Restart your development server
2. Visit `http://localhost:3000`
3. Try signing up/signing in
4. Check the browser console for any errors

## 9. Production Deployment

For production, update your environment variables with:
- Production Supabase URL
- Production Instagram OAuth credentials
- Your production domain in `NEXT_PUBLIC_BASE_URL`

## Troubleshooting

### Common Issues:

1. **"Your project's URL and API key are required"**
   - Check that your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **RLS Policy Errors**
   - Make sure you're signed in when testing protected routes
   - Check that the policies are properly applied in the Supabase dashboard

3. **Authentication Issues**
   - Verify your redirect URLs are correct
   - Check that Instagram OAuth is properly configured

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Check the browser console for detailed error messages
