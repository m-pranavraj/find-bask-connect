# Lost and Found Platform

A complete, full-stack lost and found platform with multi-tenant organization support, verification workflows, and location-based features.

## 🌟 Features

### Core Functionality
- ✅ **Post Found Items** - Users can report items they've found with photos, location, and descriptions
- ✅ **Search & Filter** - Advanced search with category, location, and date filters
- ✅ **Item Claims** - Secure 5-step verification process for claiming items
- ✅ **Verification Workflow** - Finders can review, approve, or reject claims with proof validation
- ✅ **SMS Notifications** - Automatic SMS alerts when claims are approved/rejected (optional Twilio integration)
- ✅ **Messaging System** - Direct chat between finders and claimants
- ✅ **User Profiles** - Track items found, items claimed, and reputation scores

### Multi-Tenant Organization System
- 🏢 **Organization Registration** - Malls, colleges, universities can register their spaces
- 🔒 **Data Isolation** - Each organization has separate item databases
- 📍 **Location-Based Access** - GPS radius-based access control for organization items
- 👥 **Organization Admins** - Dedicated admin panel for each organization
- 🌍 **Hybrid Model** - Public items accessible to everyone + private organization items

### Admin Features
- 👨‍💼 **Admin Dashboard** - Manage users, items, verifications, and organizations
- ✅ **Approve Organizations** - Review and approve organization registrations
- 🔐 **Role-Based Access** - Admin, moderator, and user roles with proper RLS policies
- 📊 **Analytics** - View statistics on items, users, and verifications

### Security & Authentication
- 🔐 **Email/Password Authentication** - Secure user authentication
- 🔑 **Google OAuth** - Sign in with Google (requires setup)
- 🔒 **Row-Level Security** - Supabase RLS policies on all tables
- 🛡️ **Role-Based Permissions** - Secure role management with security definer functions
- 📱 **SMS Verification** - Optional Twilio integration for phone verification

### UI/UX
- 🎨 **Modern Design** - Beautiful, responsive UI with dark/light themes
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌓 **Theme Toggle** - Persistent dark/light mode preference
- 🔍 **SEO Optimized** - Meta tags, sitemap, structured data for search engines
- 🗺️ **Interactive Location Search** - LocationIQ-powered address autocomplete (India-focused)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📋 Configuration

**Important:** Before deploying to production, you must configure external services. See [CONFIGURATION.md](./CONFIGURATION.md) for detailed setup instructions.

### Required Setup:
1. ✅ **LocationIQ API** - Already configured with default key
2. ⚠️ **Google OAuth** - Manual setup required for "Sign in with Google"
3. ⚠️ **Email Settings** - Configure SMTP for production emails
4. ⚠️ **First Admin User** - Create via SQL after first signup
5. ⚠️ **Site URLs** - Update in auth settings with your domain

### Optional Setup:
- 📱 **Twilio SMS** - For claim approval notifications
- 🌐 **Custom Domain** - Connect your own domain via Lovable

**👉 See [CONFIGURATION.md](./CONFIGURATION.md) for step-by-step instructions**

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend (Lovable Cloud / Supabase)
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Edge Functions** - Serverless backend logic
- **Row-Level Security** - Database security policies
- **Storage** - File uploads (images, documents)
- **Realtime** - Real-time subscriptions

### External APIs
- **LocationIQ** - Location search and geocoding
- **Twilio** - SMS notifications (optional)
- **Google OAuth** - Social authentication (optional)

---

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── Footer.tsx      # Footer component
│   │   ├── LocationSearch.tsx # Location autocomplete
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Landing page
│   │   ├── Search.tsx      # Search items page
│   │   ├── PostItem.tsx    # Post found item
│   │   ├── ItemDetails.tsx # Item detail + claim
│   │   ├── MyFinds.tsx     # Finder dashboard
│   │   ├── Organizations.tsx # Organization registration
│   │   ├── Admin.tsx       # Admin dashboard
│   │   └── Auth.tsx        # Login/signup
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication hook
│   │   └── use-toast.ts    # Toast notifications
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client & types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/          # Edge functions
│   │   └── send-sms-notification/ # SMS notification function
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── public/
│   ├── sitemap.xml         # SEO sitemap
│   └── robots.txt          # SEO robots file
├── CONFIGURATION.md        # Setup guide
└── README.md              # This file
```

---

## 🗄️ Database Schema

### Main Tables
- **`profiles`** - Extended user information
- **`user_roles`** - Role assignments (admin, moderator, user)
- **`items`** - Found items posted by users
- **`verification_requests`** - Claim submissions with proof
- **`messages`** - Direct messages between users
- **`reviews`** - User ratings and feedback
- **`organizations`** - Registered organizations (malls, colleges, etc.)
- **`organization_admins`** - Organization admin assignments

### Storage Buckets
- **`item-images`** - Photos of found items (public)
- **`verification-docs`** - Proof documents for claims (private)

---

## 🔐 Security

### Authentication
- Secure password hashing via Supabase Auth
- Google OAuth integration (optional)
- JWT-based sessions with automatic refresh
- Email verification (configurable)

### Database Security
- Row-Level Security (RLS) on all tables
- Security definer functions for role checks
- No direct auth.users table access
- Separate user_roles table for privilege management

### API Security
- All API keys stored as Supabase secrets
- CORS properly configured on edge functions
- Input validation on all forms
- File upload size limits and type restrictions

---

## 🎯 User Flows

### Public User Flow
1. Browse public items on search page
2. Find their lost item
3. Sign up / login
4. Submit claim with verification proof
5. Wait for finder review
6. Receive SMS when approved
7. Arrange handover with finder

### Finder Flow
1. Find an item
2. Sign up / login
3. Post item with photo and location
4. Receive claim submissions
5. Review proof documents
6. Approve/reject claim
7. SMS sent to claimant automatically
8. Arrange handover

### Organization Flow
1. Register organization at `/organizations`
2. Wait for admin approval
3. Get organization admin access
4. Post items visible only to organization members
5. Location-based access control enforced
6. Manage organization-specific lost & found

### Admin Flow
1. Create admin role via SQL
2. Access admin dashboard
3. Manage users, items, verifications
4. Approve organization registrations
5. Assign organization admins
6. View platform statistics

---

## 🚢 Deployment

### Via Lovable (Recommended)
1. Click "Publish" in Lovable editor
2. Your app is live at `https://yourproject.lovable.app`
3. Configure custom domain if needed

### Self-Hosting
If you want to self-host:

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting provider
```

**Note:** You'll need to set up your own Supabase project if self-hosting.

---

## 📱 SMS Notifications Setup

SMS notifications require Twilio. This is **optional** - the app works fine without it.

### Steps:
1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Get Account SID, Auth Token, and Phone Number
3. Add to Lovable Cloud secrets:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed instructions.

---

## 🌍 Multi-Tenant Organizations

### How It Works
- Organizations register via `/organizations` page
- Admin approves and creates organization admins
- Organizations post items with `organization_id`
- Items filtered by organization membership
- Location-based access (GPS radius)
- Public items have no `organization_id` → visible to all

### Use Cases
- 🏬 Shopping Malls - Lost & found for mall visitors
- 🎓 Universities - Campus-wide lost & found
- 🏥 Hospitals - Patient belongings management
- ✈️ Airports - Terminal-specific lost items
- 🏢 Corporate Offices - Office lost & found

---

## 🔧 Environment Variables

The following are auto-managed by Lovable Cloud:

```env
VITE_SUPABASE_URL=<auto-generated>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-generated>
VITE_SUPABASE_PROJECT_ID=<auto-generated>
```

For self-hosting, create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

## 🧪 Testing

### Authentication
- [x] Email/password signup
- [x] Email/password login
- [ ] Google OAuth (requires setup)
- [x] Password reset flow
- [x] Session persistence

### Core Features  
- [x] Post found item with image
- [x] Search and filter items
- [x] Claim item with verification
- [x] Finder review dashboard
- [x] Approve/reject claims
- [ ] SMS notifications (requires Twilio)

### Organizations
- [x] Register organization
- [x] Admin approve organization
- [x] Organization-specific items
- [x] Location-based filtering

---

## 📚 Documentation

- **Configuration Guide:** [CONFIGURATION.md](./CONFIGURATION.md)
- **Lovable Docs:** [docs.lovable.dev](https://docs.lovable.dev/)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **LocationIQ Docs:** [locationiq.com/docs](https://locationiq.com/docs)

---

## 🐛 Troubleshooting

### Location Search Not Working
- Check LocationIQ API key in `LocationSearch.tsx`
- Verify internet connection
- Check browser console for errors
- Try using your own LocationIQ API key

### Google Sign-In Not Working
- Verify OAuth credentials in Lovable Cloud backend
- Check redirect URIs match exactly
- Clear browser cache and cookies

### SMS Not Sending
- Verify Twilio credentials in Supabase secrets
- Check Twilio account balance
- Review edge function logs in Lovable Cloud

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed troubleshooting.

---

## 🤝 Contributing

This is a Lovable project. Changes should be made via:
1. Lovable editor (AI prompts)
2. Direct code editing in IDE
3. GitHub pull requests

All changes sync automatically.

---

## 📄 License

This project is created with Lovable. See [Lovable Terms](https://lovable.dev/terms) for more information.

---

## 🎉 Features Summary

✅ **Complete Authentication** - Email/password + Google OAuth  
✅ **Item Management** - Post, search, filter, view details  
✅ **Verification System** - 5-step proof submission + review  
✅ **SMS Notifications** - Twilio integration for claim status  
✅ **Multi-Tenancy** - Organizations with data isolation  
✅ **Location-Based** - GPS radius access control  
✅ **Admin Dashboard** - Full platform management  
✅ **Messaging** - Direct chat between users  
✅ **Dark/Light Theme** - Persistent theme preference  
✅ **SEO Optimized** - Meta tags, sitemap, structured data  
✅ **Mobile Responsive** - Works on all devices  

---

## 🚀 Next Steps

1. **Configure Required Services** - Follow [CONFIGURATION.md](./CONFIGURATION.md)
2. **Create First Admin** - Run SQL to add admin role
3. **Set Up Google OAuth** - Enable social login (optional)
4. **Configure SMS** - Add Twilio for notifications (optional)
5. **Deploy** - Click "Publish" in Lovable
6. **Add Custom Domain** - Connect your domain (optional)
7. **Test Everything** - Go through all user flows
8. **Launch!** 🎉

---

**Built with ❤️ using Lovable**
