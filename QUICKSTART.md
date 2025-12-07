# MPDEE Digidocs - Quick Start Guide

Get your skeleton app up and running in 10 minutes.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed

## 🚀 Setup Steps

### 1. Clone & Install (2 min)

```bash
git clone <your-repo-url>
cd digidocs
npm install
```

### 2. Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it (e.g., "digidocs-client-name")
4. Set a strong database password
5. Choose a region close to your users
6. Wait for project to be created (~2 minutes)

### 3. Configure Environment (2 min)

Create `.env.local` in the root directory:

```bash
# From Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# From Supabase Dashboard > Settings > Database > Connection String > URI
POSTGRES_URL_NON_POOLING=postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres

# Set to localhost for development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Import Database (2 min)

```bash
npm run import:database
```

Expected output:
```
✅ Connected successfully
✅ SQL file loaded
✅ SQL import completed!
✅ Found 20+ tables
✅ Found 3 roles
```

### 5. Create Storage Buckets (1 min)

In Supabase Dashboard > Storage:

1. Click "New Bucket"
2. Create these buckets:
   - `inspection-photos` (Public: ✅ ON)
   - `rams-documents` (Public: ❌ OFF)
   - `toolbox-talk-pdfs` (Public: ❌ OFF)

Then run this SQL (Supabase > SQL Editor):

```sql
-- Storage policies
CREATE POLICY "Authenticated users can upload inspection photos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'inspection-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view inspection photos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can upload RAMS" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'rams-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view RAMS" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'rams-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Managers can upload toolbox talks" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'toolbox-talk-pdfs' AND 
    EXISTS (SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.is_manager_admin = true)
  );

CREATE POLICY "Authenticated users can view toolbox talks" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'toolbox-talk-pdfs' AND auth.uid() IS NOT NULL);
```

### 6. Create Admin User

**In Supabase Dashboard > Authentication > Users:**

1. Click "Add User"
2. Enter email: `admin@example.com` (or your email)
3. Enter a strong password
4. Click "Create User"
5. **Copy the User ID** (UUID)

**In Supabase > SQL Editor, run:**

```sql
-- Replace YOUR_USER_ID_HERE with the UUID you copied
UPDATE profiles 
SET role = 'admin', 
    role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE id = 'YOUR_USER_ID_HERE';
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login with:**
- Email: admin@example.com (or whatever you used)
- Password: (the password you set)

## ✅ Verification

After logging in, you should see:

- ✅ App title: "MPDEE Digidocs"
- ✅ Navbar: "MPDEE Digidocs"
- ✅ Primary color: Professional Blue (#3b82f6), not yellow
- ✅ Theme matches your system (light/dark)
- ✅ Navigation links work: Dashboard, Timesheets, Inspections, Documents, Absence
- ✅ Admin links visible: Users, Vehicles

## 🎨 Customize for Client

### Change Branding

Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Client Name - Workforce Management",
  // ...
};
```

Edit `public/manifest.json`:
```json
{
  "name": "Client Name Workforce",
  "short_name": "Client",
  // ...
}
```

### Change Theme Color

Edit `app/globals.css`:
```css
:root {
  --primary: 217 91% 60%; /* Professional Blue */
  /* Change to client brand color */
  /* Example for red: --primary: 0 84% 60%; */
}
```

### Replace Favicons

Generate new favicons at [Favicon.io](https://favicon.io/) and replace:
- `/public/favicon.ico`
- `/public/icon-192x192.png`
- `/public/icon-512x512.png`
- `/public/apple-touch-icon*.png`

## 🚨 Troubleshooting

### "User not found" after login
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = 'your-user-id';

-- If not, create it manually
INSERT INTO profiles (id, full_name, role, role_id)
VALUES (
  'your-user-id',
  'Admin User',
  'admin',
  (SELECT id FROM roles WHERE name = 'admin')
);
```

### Database import fails
- Verify `POSTGRES_URL_NON_POOLING` is correct
- Make sure you're using the "Session mode" connection string, not "Transaction"
- Check your database password is correct

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Theme not switching
- The app uses system preference (light/dark)
- Check your OS/browser theme settings
- For manual theme toggle, you'd need to implement a ThemeProvider

## 📚 Documentation

- **Full README**: `README.md`
- **Migration Notes**: `MIGRATION_NOTES.md`
- **Verification Checklist**: `VERIFICATION_CHECKLIST.md`
- **Database Setup**: `database_exports/DATABASE-EXPORT-README.md`

## 🎯 Next Steps

1. ✅ Verify all functionality works (use VERIFICATION_CHECKLIST.md)
2. 🎨 Customize branding for your client
3. 🚀 Deploy to Vercel
4. 📱 Test on mobile devices
5. 🎉 Hand off to client

## 📞 Support

For issues:
1. Check documentation files
2. Review Supabase logs
3. Check browser console for errors
4. Review database RLS policies

---

**Built by MPDEE Ltd.** • Ready for rapid client deployment

