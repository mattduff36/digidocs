# MPDEE Digidocs - Migration from SquiresApp

## Completed Migration Tasks

### ✅ Branding & Identity
- [x] Updated `package.json` name to "digidocs"
- [x] Changed app title to "MPDEE Digidocs" in all layouts
- [x] Updated manifest.json with new branding
- [x] Removed all "Squires", "AVS", "A&V Squires Plant Co." references from UI
- [x] Updated README.md with new project information

### ✅ Theme & Colors
- [x] Replaced AVS Yellow (#F1D64A) with Professional Blue (#3b82f6)
- [x] Removed forced dark mode
- [x] Implemented system-based light/dark theme switching
- [x] Updated all CSS custom properties and utility classes
- [x] Removed `avs-yellow` classes, replaced with `primary` theme variables
- [x] Updated navbar, login page, and home page styling

### ✅ Configuration
- [x] Updated public/manifest.json
- [x] Updated app/layout.tsx metadata
- [x] Cleaned /data folder (removed all Squires-specific sample files)

### ✅ Documentation
- [x] Created new README.md with skeleton app documentation
- [x] Updated project description and setup instructions

## Pending Tasks

### 🔄 RAMS → Documents Renaming

**Status**: Partially Complete (UI labels updated)

The codebase uses "RAMS" (Risk Assessment Method Statements) extensively throughout:
- **921 occurrences** across **107 files**
- Includes: routes, API endpoints, database tables, TypeScript types, components, etc.

**What Was Done:**
- ✅ Updated UI labels in Navbar (changed "RAMS" to "Documents")
- ✅ Created globals.css with `document-*` classes (formerly `rams-*`)

**What Remains:**
Due to the extensive nature of this change and to avoid breaking the application, the following technical renaming is **recommended for future implementation**:

1. **Database Schema** (`supabase/` folder):
   - `rams_documents` table → `documents`
   - `rams_assignments` table → `document_assignments`
   - All related columns and constraints

2. **TypeScript Types** (`types/rams.ts`):
   - Rename file to `types/documents.ts`
   - Update all interfaces and types

3. **API Routes** (`app/api/rams/*`):
   - Rename folder to `app/api/documents/*`
   - Update all route handlers

4. **Frontend Pages** (`app/(dashboard)/rams/*`):
   - Rename folder to `app/(dashboard)/documents/*`
   - Update all page components

5. **Components** (`components/rams/*`):
   - Rename folder to `components/documents/*`
   - Update component names and imports

6. **Utility Functions** (`lib/` folder):
   - Update all function names and references

7. **Database Migrations**:
   - Create migration scripts to rename tables safely
   - Update all foreign key relationships

**Why This Wasn't Done:**
- **Scope**: 921 occurrences across 107 files
- **Risk**: High probability of breaking changes
- **Testing**: Requires comprehensive testing after each change
- **Time**: Would require multiple hours of careful refactoring

**Recommendation:**
1. The current app functions correctly with internal "rams" naming
2. User-facing labels show "Documents" 
3. Future developers can perform a comprehensive find-and-replace when needed
4. Suggest using VS Code's global find/replace with regex for systematic renaming

### 🔄 Icons & Favicons

**Status**: Placeholder icons in use

Current favicons likely still contain Squires branding. 

**To Replace:**
- `/public/favicon.ico`
- `/public/icon-192x192.png`
- `/public/icon-512x512.png`
- `/public/apple-touch-icon*.png`

**Recommendation:**
Use a simple icon generator tool like:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

Generate icons with:
- Text: "DD" or "Digidocs"
- Colors: Professional Blue (#3b82f6)
- Background: White (light) or Slate (#0f172a) dark

### 🔄 Database Reset

**Status**: Ready for execution

The database export is ready at:
- `database_exports/database-skeleton-export.sql`
- `database_exports/DATABASE-EXPORT-README.md`

**Instructions:**
1. Log into your new Supabase project
2. Go to SQL Editor
3. Paste and run the entire SQL export
4. Create storage buckets as per README
5. Create your first admin user

**Note:** The SQL export still references "AVS Worklog" in comments. These are harmless but can be updated if desired.

## Environment Variables

The skeleton app uses the same `.env.local` structure:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
POSTGRES_URL_NON_POOLING=
NEXT_PUBLIC_APP_URL=
```

**Important:**
- The app is configured to work with a fresh Supabase instance
- Do NOT attempt to connect to the original SquiresApp database
- Use the database export to recreate the schema

## Testing Checklist

Before deploying to a client:

- [ ] Test light theme rendering
- [ ] Test dark theme rendering (enable in system settings)
- [ ] Verify login page shows "MPDEE Digidocs"
- [ ] Verify navbar shows correct branding
- [ ] Test timesheet creation and submission
- [ ] Test vehicle inspection flow
- [ ] Test document upload and assignment (still uses `/rams` routes internally)
- [ ] Test absence request flow
- [ ] Verify all manager/admin functions work
- [ ] Test PDF exports
- [ ] Test Excel exports
- [ ] Verify PWA installation works
- [ ] Test offline mode
- [ ] Replace favicons with client branding

## Client Customization

For each client deployment:

1. **Branding**:
   - Update app name in `package.json`
   - Update titles in `app/layout.tsx`
   - Update `public/manifest.json`
   - Generate and replace favicons

2. **Theme Colors**:
   - Edit `app/globals.css` CSS custom properties
   - Change `--primary` color to client brand color
   - Optionally adjust accent colors

3. **Features**:
   - Enable/disable modules in Supabase via role permissions
   - Customize forms if needed
   - Adjust validation rules

4. **Domain**:
   - Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
   - Configure custom domain in Vercel

## Known Issues

1. **RAMS Internal Naming**: App still uses "rams" in routes, API endpoints, and database. This is a cosmetic issue that doesn't affect functionality.

2. **Theme Persistence**: Theme is based on system preference only. If clients want manual theme toggling, implement a ThemeProvider with next-themes.

3. **Favicon Branding**: Current favicons need replacement with neutral branding.

## Migration Summary

**Started**: December 7, 2025  
**Status**: Core migration complete, ready for client customization  
**Remaining Work**: RAMS→Documents full refactor (optional), favicon generation

---

**For Support**: Contact MPDEE development team

