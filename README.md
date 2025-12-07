# MPDEE Digidocs

Digital workforce management system for timesheets, inspections, documents, and absence tracking.

A Progressive Web App (PWA) for managing employee workflows with offline support, real-time synchronization, and comprehensive reporting.

## Features

- **Employee Timesheets**: Digital weekly timesheets with auto-calculated hours
- **Vehicle Inspections**: 26-point safety inspection checklists
- **Document Management**: Safety documents, risk assessments, and compliance forms
- **Absence Tracking**: Holiday and leave request management
- **Offline Support**: Work without internet, sync when connected
- **Real-time Updates**: Changes sync across devices instantly
- **Role-Based Access**: Admin, Manager, and Employee permissions
- **Digital Signatures**: Secure employee sign-offs
- **PDF & Excel Reports**: Generate professional reports
- **Mobile-First Design**: Optimized for tablets and smartphones
- **Light & Dark Themes**: Automatic theme switching based on device settings

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS 4, shadcn/ui components, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: TanStack Query, Zustand
- **Forms**: React Hook Form + Zod validation
- **PWA**: next-pwa with service workers
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Vercel account for deployment (optional)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd digidocs
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready (2-3 minutes)
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy and paste the entire contents of `database_exports/database-skeleton-export.sql`
5. Click "Run" to execute the schema
6. Follow the storage setup guide in `database_exports/DATABASE-EXPORT-README.md`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For direct database access (migrations)
POSTGRES_URL_NON_POOLING=your_postgres_connection_string

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Finding your Supabase credentials:**
- Go to your Supabase project
- Click "Settings" (gear icon)
- Go to "API"
- Copy "Project URL" and "anon public" key

### 4. Create First Admin User

1. Go to **Authentication** in Supabase dashboard
2. Click "Add User" > "Create new user"
3. Enter email and password
4. After user is created, go to **SQL Editor**
5. Run this query (replace with your user's ID):

```sql
UPDATE profiles 
SET role = 'admin', 
    role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE id = 'paste-user-id-here';
```

You can find the user ID in Authentication > Users table.

### 5. Generate Demo Data (Optional)

For demonstrations and testing, you can populate the database with sample data:

```bash
# First, set up storage buckets
npm run setup:demo-storage

# Then generate demo data (4 weeks of sample data)
npm run create:demo-data
```

This creates:
- 23 demo user accounts (14 employees, 5 contractors, 3 managers, 1 admin)
- 13 sample vehicles
- 3 RAMS documents with assignments
- 2 Toolbox Talk documents
- 76 timesheets with 532 entries
- 68 vehicle inspections
- 5 absence records

**Demo Account Credentials:**
- Email: `[firstname].[lastname]@digidocsdemo.com`
- Password: `Password123`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your admin account.

## Project Structure

```
digidocs/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages
│   │   └── login/              
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── dashboard/           # Main dashboard
│   │   ├── timesheets/          # Timesheet management
│   │   ├── inspections/         # Vehicle inspections
│   │   ├── rams/                # Document management
│   │   ├── absence/             # Absence tracking
│   │   ├── reports/             # Reports & exports
│   │   └── admin/               # Admin pages
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components (Navbar, etc.)
│   └── dashboard/               # Dashboard widgets
├── lib/
│   ├── supabase/                # Supabase clients & middleware
│   ├── utils/                   # Utility functions
│   ├── hooks/                   # React hooks
│   └── stores/                  # Zustand stores
├── types/                       # TypeScript type definitions
├── database_exports/            # Database schema and setup guides
└── public/                      # Static assets & PWA files
```

## Usage

### For Employees

1. **Log in** with your credentials
2. **Create Timesheet**: 
   - Click "New Timesheet" on dashboard
   - Fill in daily hours and remarks
   - Sign digitally
   - Submit for approval
3. **Vehicle Inspection**:
   - Click "New Vehicle Inspection"
   - Select vehicle and week
   - Mark daily checks (✓/X/0)
   - Add photos for defects
   - Submit
4. **Documents**:
   - View assigned safety documents
   - Read and sign when required

### For Managers

1. View all submitted timesheets and inspections
2. Review and approve/reject forms
3. Add comments for rejected forms
4. Upload and assign documents to employees
5. Generate reports for date ranges

### For Admins

- All manager functions
- User management
- Add/edit vehicles
- System configuration
- Role and permission management

## Development

### Adding New Form Fields

1. Update database schema in `database_exports/database-skeleton-export.sql`
2. Update TypeScript types in `types/`
3. Modify form components in `components/forms/`
4. Update validation schemas in `lib/validation/`

### Running Tests

```bash
npm run lint        # Check code quality
npm run test        # Run tests
npm run build       # Test production build
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy!

Vercel will automatically:
- Deploy on every git push
- Generate preview URLs for branches
- Handle serverless functions
- Configure custom domains

### Update Environment Variables

In Vercel dashboard:
- Go to Settings > Environment Variables
- Add all variables from `.env.local`
- Update `NEXT_PUBLIC_APP_URL` to your production URL

## Troubleshooting

### "User not found" error
- Ensure profile was created in database
- Check Supabase triggers are working
- Manually create profile if needed

### RLS policy errors
- Verify user role in database
- Check RLS policies in Supabase
- Test policies in SQL Editor

### Build errors
- Run `npm install` again
- Delete `.next` folder
- Check for TypeScript errors

## License

Proprietary - MPDEE Ltd.

## Version

**v2.1.0** - Production Ready (December 2025)
- Fully customizable digital forms management system
- Complete demo data generation for client demonstrations
- Aligned database schema with TypeScript types
- Comprehensive codebase cleanup and optimization
- Light and dark mode support with neutral branding
- Full offline PWA support with sync capabilities
- Role-based access control and permissions system

---

**Built by MPDEE Ltd.** for rapid client deployment
