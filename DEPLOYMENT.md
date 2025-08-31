# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Vercel account (free at vercel.com)
- Supabase project set up

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

## Step 3: Environment Variables

**Before deploying, add these environment variables in Vercel:**

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to get these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "Project URL" and "anon public" key

## Step 4: Instagram OAuth Setup

### Update Instagram App Settings:
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Select your Instagram app
3. Go to "Instagram Basic Display" → "Basic Display"
4. Add your Vercel domain to "Valid OAuth Redirect URIs":
   ```
   https://your-app-name.vercel.app/auth/callback
   ```

### Update Supabase Auth Settings:
1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Update the Site URL to your Vercel domain:
   ```
   https://your-app-name.vercel.app
   ```
4. Add your Vercel domain to "Redirect URLs":
   ```
   https://your-app-name.vercel.app/auth/callback
   ```

## Step 5: Deploy

1. **Click "Deploy"** in Vercel
2. **Wait for build to complete** (usually 2-3 minutes)
3. **Your app will be live at:** `https://your-app-name.vercel.app`

## Step 6: Test Instagram Login

1. Visit your deployed app
2. Go to the auth page
3. Try logging in with Instagram
4. It should now work properly!

## Troubleshooting

### Build Errors:
- Check that all environment variables are set
- Ensure your Supabase project is active
- Check the build logs in Vercel

### Instagram Login Issues:
- Verify redirect URIs are correct
- Check Supabase auth settings
- Ensure Instagram app is in "Live" mode

### Database Issues:
- Run the SQL schema in Supabase SQL Editor
- Check RLS policies are set up correctly

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ |

## Next Steps

After deployment:
1. Test all features (login, battles, beats, etc.)
2. Set up custom domain (optional)
3. Configure analytics (optional)
4. Set up monitoring (optional)

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check Supabase logs
3. Verify environment variables
4. Test locally first
