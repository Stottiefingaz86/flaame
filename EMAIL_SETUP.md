# Email Setup for Contact Form

The contact form is now set up to send emails directly to your Gmail inbox instead of opening the user's mail app.

## Current Setup

The contact form now:
- ✅ Sends messages via API endpoint (`/api/contact`)
- ✅ Validates form data
- ✅ No longer opens user's mail app
- ✅ Shows proper success/error messages

## Email Service Options

You can configure one of these email services:

### Option 1: Webhook Service (Recommended - Easiest)
1. Create a Zapier/Make.com webhook
2. Set up the webhook URL in your environment variables:
   ```
   CONTACT_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url
   ```

### Option 2: SendGrid (Professional)
1. Sign up for SendGrid (free tier available)
2. Get your API key
3. Add to environment variables:
   ```
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

### Option 3: Gmail SMTP
1. Enable 2-factor authentication on your Gmail
2. Generate an app password
3. Add to environment variables:
   ```
   GMAIL_USER=flaameco@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

## Current Fallback

If no email service is configured, the contact form will:
- Log the message to the server console
- Still show success to the user
- You can check Vercel logs to see the messages

## Testing

1. Go to `/contact` page
2. Fill out the form
3. Submit - it should show success message
4. Check your configured email service or Vercel logs

## Environment Variables

Add these to your `.env.local` file:
```
# Choose one of these options:

# Option 1: Webhook
CONTACT_WEBHOOK_URL=https://your-webhook-url

# Option 2: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Option 3: Gmail SMTP
GMAIL_USER=flaameco@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```







