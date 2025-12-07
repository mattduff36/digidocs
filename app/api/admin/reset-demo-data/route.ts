import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // SECURITY: Only allow superadmin
    if (user.email !== 'admin@mpdee.co.uk') {
      return NextResponse.json({ error: 'Forbidden: SuperAdmin only' }, { status: 403 });
    }
    
    console.log('🔄 Starting database reset and regeneration...');
    
    // Step 1: Delete all demo-related data (keeping only the superadmin user)
    const tablesToClear = [
      'timesheet_entries',
      'timesheets',
      'inspection_items',
      'vehicle_inspections',
      'inspection_photos',
      'absences',
      'rams_assignments',
      'rams_documents',
      'message_recipients',
      'messages',
      'actions',
      'audit_log',
    ];
    
    // Clear all tables
    for (const table of tablesToClear) {
      console.log(`  Clearing ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
      
      if (error && !error.message.includes('does not exist')) {
        console.error(`  ❌ Error clearing ${table}:`, error.message);
      }
    }
    
    // Delete all demo users (except superadmin)
    console.log('  Deleting demo user profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .neq('email', 'admin@mpdee.co.uk');
    
    if (profileError) {
      console.error('  ❌ Error deleting profiles:', profileError.message);
    }
    
    // Delete all vehicles
    console.log('  Deleting vehicles...');
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (vehicleError) {
      console.error('  ❌ Error deleting vehicles:', vehicleError.message);
    }
    
    console.log('✅ Database cleared successfully');
    
    // Step 2: Regenerate demo data by running the script
    console.log('🔄 Regenerating demo data...');
    
    try {
      // Run the demo data generation script
      const { stdout, stderr } = await execAsync('npm run create:demo-data', {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes timeout
      });
      
      if (stderr && !stderr.includes('npm')) {
        console.error('Script stderr:', stderr);
      }
      
      console.log('Script output:', stdout);
      console.log('✅ Demo data regenerated successfully');
      
      return NextResponse.json({ 
        success: true,
        message: 'Database reset and demo data regenerated successfully!',
        details: 'All demo accounts, vehicles, timesheets, inspections, and documents have been recreated.'
      });
      
    } catch (scriptError: any) {
      console.error('❌ Error running demo data script:', scriptError);
      return NextResponse.json({ 
        success: false,
        error: 'Database cleared but failed to regenerate demo data',
        details: scriptError.message,
        instruction: 'Please run "npm run create:demo-data" manually to regenerate demo data.'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ Error resetting database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database', details: error.message },
      { status: 500 }
    );
  }
}
