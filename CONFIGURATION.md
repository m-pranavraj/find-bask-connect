# Lost and Found - Configuration Guide

This guide will help you configure all the necessary services and APIs to make your Lost and Found application fully functional.

## 🚀 Quick Start Checklist

- [x] LocationIQ API (Already Configured)
- [ ] Set up Google OAuth (Sign in with Google)
- [ ] Configure Email Authentication
- [ ] Create First Admin User
- [ ] Update Site URLs

---

## 1. LocationIQ API Configuration ✅ (Already Configured)

The location search functionality uses LocationIQ API for address autocomplete and geocoding.

### Current Configuration:
- **API Key**: `pk.96a5bf877c32cb04ca7ebfdd8b613705` ✅ Already added
- **Location**: `src/components/LocationSearch.tsx`
- **Region**: Restricted to India (IN)
- **Features**: Autocomplete, geocoding, reverse geocoding

### About LocationIQ:
LocationIQ provides location-based services including:
- Address autocomplete (5 suggestions per search)
- Geocoding (convert addresses to coordinates)
- Search limited to India for better relevancy
- Deduplication of results automatically

### Free Tier Includes:
- ✅ 5,000 requests per day
- ✅ No credit card required
- ✅ No billing setup needed

### Optional: Use Your Own API Key

If you need more requests or want your own key:

1. **Sign up**: Visit https://my.locationiq.com/
2. **Get API Key**: Copy from dashboard
3. **Update Code**: Replace key in `src/components/LocationSearch.tsx` (line 30)
   ```typescript
   const LOCATIONIQ_API_KEY = 'your_new_api_key_here';
   ```

### API Dashboard:
- View usage: https://my.locationiq.com/dashboard/
- Documentation: https://locationiq.com/docs

---

## 2. Google OAuth Configuration (Sign in with Google)

### Steps:

1. **Go to Google Cloud Console**
   - Use the same project from Maps API setup
   - Go to: https://console.cloud.google.com/

2. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" → Click "Create"
   - Fill in:
     - **App name**: Lost and Found
     - **User support email**: your-email@example.com
     - **Developer contact**: your-email@example.com
   - Under "Authorized domains", add:
     ```
     lovable.app
     supabase.co
     ```
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click "Save and Continue"

3. **Create OAuth Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Lost and Found Web Client"
   - **Authorized JavaScript origins**:
     ```
     https://yourprojectid.lovable.app
     https://yoursite.lovable.app
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     https://jylbpbpvqpkiekfacyce.supabase.co/auth/v1/callback
     https://yourprojectid.lovable.app/auth/callback
     https://yoursite.lovable.app/auth/callback
     http://localhost:5173/auth/callback
     ```
   - Click "Create"
   - **Copy** the Client ID and Client Secret

4. **Configure in Lovable Cloud**
   - In your Lovable project, click "View Backend" button (provided below)
   - Go to **Users** → **Auth Settings** → **Google Settings**
   - Enable Google provider
   - Paste:
     - **Client ID**: (from Google Console)
     - **Client Secret**: (from Google Console)
   - Under **Authorized Redirect URLs**, add:
     ```
     https://yourprojectid.lovable.app
     https://yoursite.lovable.app
     http://localhost:5173
     ```
   - Click "Save"

<lov-actions>
  <lov-open-backend>View Backend</lov-open-backend>
</lov-actions>

---

## 3. Email Authentication Configuration

Email/password authentication is automatically configured, but you need to adjust settings for optimal user experience.

### Steps:

1. **Open Lovable Cloud Backend**
   - Click the "View Backend" button above

2. **Configure Auth Settings**
   - Go to **Users** → **Auth Settings** → **Email Settings**
   - **For Development/Testing**:
     - ✅ Enable "Auto-confirm email signups"
     - This allows users to sign up without email confirmation
   - **For Production**:
     - ❌ Disable "Auto-confirm email signups"
     - ✅ Configure SMTP settings for sending emails
     - ✅ Customize email templates (Welcome, Password Reset, etc.)

3. **Set Site URL and Redirect URLs**
   - Still in Auth Settings
   - Set **Site URL**: `https://yoursite.lovable.app`
   - Add **Redirect URLs**:
     ```
     https://yourprojectid.lovable.app/**
     https://yoursite.lovable.app/**
     http://localhost:5173/**
     ```

4. **Test Password Reset**
   - Go to `/forgot-password` on your site
   - Enter an email
   - Check spam folder if not received
   - Password reset link expires in 1 hour

---

## 4. Create First Admin User

By default, all users have the "user" role. You need to manually create the first admin.

### Method 1: Using Lovable Cloud Backend (Recommended)

1. **Sign up normally** on your site at `/auth`
2. **Note your user ID**:
   - Click "View Backend" button
   - Go to **Users** → **Users & Auth**
   - Find your user and copy the ID
3. **Open SQL Editor**:
   - In backend, go to **Database** → **SQL Editor**
   - Run this query (replace `YOUR_USER_ID`):
     ```sql
     INSERT INTO public.user_roles (user_id, role)
     VALUES ('YOUR_USER_ID', 'admin');
     ```
4. **Verify**:
   - Log out and log back in
   - You should now see the "Admin Dashboard" in navigation

### Method 2: Using SQL (Alternative)

If you know your email, run this query:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Add admin role (use the ID from above)
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-id-from-above', 'admin');
```

---

## 5. Update Site URLs

Replace placeholder URLs with your actual domain throughout the project.

### Files to Update:

1. **CONFIGURATION.md** (this file):
   - Replace `https://yoursite.lovable.app` with your published domain
   - Replace `https://yourprojectid.lovable.app` with your preview domain

2. **src/components/SEO.tsx**:
   - Line 21: Update `canonicalUrl` base URL

3. **Get Your URLs**:
   - **Preview URL**: `https://[your-project-id].lovable.app`
   - **Published URL**: Available after clicking "Publish" in Lovable
   - **Custom Domain**: Set up in Project Settings → Domains

---

## 6. Optional: Configure Custom Domain

### Steps:

1. **In Lovable**:
   - Go to Project Settings → Domains
   - Click "Connect Domain"
   - Follow the instructions to add DNS records

2. **Update Configurations**:
   - Add your custom domain to Google OAuth redirect URIs
   - Add to Lovable Cloud Auth Settings redirect URLs
   - Update `SEO.tsx` with your custom domain

---

## 🔒 Security Checklist

Before going to production, ensure:

- [x] LocationIQ API configured and working
- [ ] OAuth redirect URIs only include your domains (remove localhost)
- [ ] Email confirmation is enabled (disable auto-confirm)
- [ ] SMTP is configured for sending emails
- [ ] First admin user is created
- [ ] Row-Level Security (RLS) policies are active on all tables
- [ ] HTTPS is enabled on your custom domain

---

## 🎯 Testing Checklist

Test all features before launch:

### Authentication
- [ ] Sign up with email/password works
- [ ] Login with email/password works
- [ ] Sign in with Google works
- [ ] Forgot password sends email
- [ ] Password reset link works
- [ ] Logout works

### Core Features
- [ ] Post a found item (with location search)
- [ ] Search for items (filters work)
- [ ] View item details
- [ ] Send verification request (with file uploads)
- [ ] Admin can approve/reject verifications
- [ ] Messaging between users works

### UI/UX
- [ ] Dark/light theme toggle works
- [ ] Theme persists after refresh
- [ ] Mobile responsive design works
- [ ] All navigation links work
- [ ] Footer links work

---

## 📊 Database Schema

Your project uses these main tables:

### Tables:
- `profiles` - User profile information
- `user_roles` - User role assignments (user, admin)
- `items` - Found items posted by users
- `verification_requests` - Claims for found items
- `messages` - Direct messages between users
- `reviews` - User ratings and feedback

### Storage Buckets:
- `item-images` - Photos of found items (public)
- `verification-docs` - Proof documents for claims (private)

---

## 🆘 Troubleshooting

### Location Search Not Working
- Check browser console for API errors
- Verify internet connection is working
- Ensure LocationIQ API key is valid
- Check if daily request limit (5,000) was reached
- Try using your own LocationIQ API key if needed

### Google Sign-In Not Working
- Verify OAuth credentials in Lovable Cloud backend
- Check redirect URIs match exactly (no trailing slashes)
- Clear browser cache and cookies
- Check that consent screen is configured

### Password Reset Email Not Received
- Check spam/junk folder
- Verify SMTP is configured in Lovable Cloud
- Check that "Auto-confirm" is disabled for production
- Ensure Site URL is set correctly

### "Requested path is invalid" Error
- Check Site URL in Auth Settings
- Verify all redirect URLs are added
- Ensure URLs don't have trailing slashes
- Clear browser cookies and try again

### Admin Dashboard Not Showing
- Verify you added your user to `user_roles` table
- Log out and log back in
- Check browser console for role-related errors

---

## 📞 Support & Resources

- **Lovable Documentation**: https://docs.lovable.dev/
- **Lovable Discord Community**: https://discord.com/channels/1119885301872070706/1280461670979993613
- **LocationIQ Documentation**: https://locationiq.com/docs
- **LocationIQ Dashboard**: https://my.locationiq.com/dashboard/
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## 🎉 You're All Set!

Once you've completed all the configuration steps, your Lost and Found platform should be fully functional. Test thoroughly before launching to users.

**Remember to:**
- Keep your API keys secure
- Never commit secrets to version control
- Monitor your API usage quotas
- Back up your database regularly

Good luck with your launch! 🚀