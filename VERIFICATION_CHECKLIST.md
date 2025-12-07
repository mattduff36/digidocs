# MPDEE Digidocs - Post-Migration Verification Checklist

Use this checklist to verify the skeleton app is working correctly after migration.

## ✅ Environment Setup

- [ ] `.env.local` file exists with all required variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `POSTGRES_URL_NON_POOLING` is set (optional, for migrations)
- [ ] `NEXT_PUBLIC_APP_URL` is set to correct URL

## ✅ Database Setup

- [ ] Run: `npm run import:database` to import schema
- [ ] Verify tables were created (should see 20+ tables in output)
- [ ] Created storage buckets:
  - [ ] `inspection-photos` (public)
  - [ ] `rams-documents` (private)
  - [ ] `toolbox-talk-pdfs` (private)
- [ ] Applied storage policies (see DATABASE-EXPORT-README.md)
- [ ] Created first admin user in Supabase Auth
- [ ] Updated user role to 'admin' in profiles table

## ✅ Build & Start

- [ ] Run: `npm install` (if not done already)
- [ ] Run: `npm run dev`
- [ ] App starts without errors
- [ ] Can access http://localhost:3000
- [ ] No console errors in browser

## ✅ Branding Verification

- [ ] Home page shows "MPDEE Digidocs"
- [ ] Login page shows "MPDEE Digidocs"
- [ ] Navbar shows "MPDEE Digidocs"
- [ ] No AVS yellow color visible (should be professional blue #3b82f6)
- [ ] Browser tab title shows "MPDEE Digidocs"
- [ ] App manifest shows "MPDEE Digidocs"

## ✅ Theme Testing

- [ ] **Light Mode**:
  - [ ] Set system theme to light
  - [ ] Reload app
  - [ ] Background is white/light gray
  - [ ] Text is dark/readable
  - [ ] Primary buttons are blue
  - [ ] Cards have light backgrounds

- [ ] **Dark Mode**:
  - [ ] Set system theme to dark
  - [ ] Reload app
  - [ ] Background is dark slate
  - [ ] Text is white/light
  - [ ] Primary buttons are blue
  - [ ] Cards have dark backgrounds

## ✅ Authentication

- [ ] Can access login page
- [ ] Can log in with admin credentials
- [ ] After login, redirected to `/dashboard`
- [ ] Can see user info (if logged in)
- [ ] Can sign out successfully

## ✅ Navigation (while logged in as admin)

- [ ] Dashboard link works
- [ ] Timesheets link works
- [ ] Inspections link works
- [ ] Documents link works (shows "Documents", not "RAMS")
- [ ] Absence link works
- [ ] Approvals link works (if manager/admin)
- [ ] Actions link works (if manager/admin)
- [ ] Reports link works (if manager/admin)
- [ ] Users link works (if admin)
- [ ] Vehicles link works (if admin)

## ✅ Core Functionality

### Timesheets
- [ ] Can view timesheet list page
- [ ] Can create new timesheet
- [ ] Form renders correctly
- [ ] Can save timesheet (check database or list page)

### Vehicle Inspections
- [ ] Can view inspections list page
- [ ] Can create new inspection
- [ ] Form renders correctly
- [ ] Can save inspection

### Documents (formerly RAMS)
- [ ] Can view documents list page
- [ ] Page header shows "Documents" (not "RAMS")
- [ ] Upload button visible (if manager/admin)
- [ ] Empty state displays correctly

### Absence
- [ ] Can view absence page
- [ ] Can request absence
- [ ] Form renders correctly

### Reports (Manager/Admin)
- [ ] Can access reports page
- [ ] Can select date range
- [ ] Can generate reports

### Admin (Admin only)
- [ ] Can access users page
- [ ] Can view user list
- [ ] Can access vehicles page
- [ ] Can view vehicle list

## ✅ Responsive Design

- [ ] Desktop (1920px): Layout looks good
- [ ] Tablet (768px): Layout adapts properly
- [ ] Mobile (375px): Layout is mobile-friendly
- [ ] Mobile navbar (hamburger menu) works
- [ ] Forms are usable on mobile

## ✅ Error Handling

- [ ] Try accessing `/timesheets/999` (non-existent)
  - [ ] Shows appropriate error or redirects
- [ ] Try logging in with wrong password
  - [ ] Shows error message
  - [ ] Can retry login

## ✅ Performance

- [ ] Initial page load < 3 seconds (dev mode)
- [ ] Navigation between pages is smooth
- [ ] No memory leaks visible in Chrome DevTools
- [ ] No console warnings about performance

## ✅ PWA Features (Optional - Production Only)

- [ ] PWA installs on mobile
- [ ] Offline page exists at `/offline`
- [ ] Service worker registers (check DevTools > Application > Service Workers)
- [ ] App icon appears on home screen

## 🐛 Known Issues to Ignore

1. **RAMS in URLs**: Internal routes still use `/rams`. This is fine - user-facing labels say "Documents"
2. **Database table names**: Tables still named `rams_documents`. This is fine for now
3. **TypeScript types**: May still reference "RAMS" internally. This is fine
4. **Console warnings**: Some hydration warnings in dev mode are expected with Next.js

## 📝 Notes

- If you encounter any issues, check:
  - Browser console for errors
  - Network tab for failed API requests
  - Supabase logs for database errors
  - Terminal for server errors

- Common fixes:
  - Clear browser cache and reload
  - Delete `.next` folder and restart dev server
  - Verify environment variables are set correctly
  - Check Supabase RLS policies are enabled

## ✅ Final Sign-Off

Once all checks pass:

- [ ] All critical functionality works
- [ ] Branding is correct
- [ ] Theme switching works
- [ ] Ready for client customization
- [ ] Ready for deployment

---

**Verification Date**: _______________  
**Verified By**: _______________  
**Status**: ⬜ Pass / ⬜ Fail / ⬜ Needs Work

---

## 🚀 Next Steps After Verification

1. Update favicons with client branding
2. Customize theme colors for client (if needed)
3. Deploy to Vercel
4. Configure production environment variables
5. Test production deployment
6. Hand off to client with documentation


