import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          send({ error: 'Unauthorized', progress: 0 });
          controller.close();
          return;
        }
        
        // SECURITY: Only allow superadmin
        if (user.email !== 'admin@mpdee.co.uk') {
          send({ error: 'Forbidden: SuperAdmin only', progress: 0 });
          controller.close();
          return;
        }
        
        console.log('🔄 Starting database reset and regeneration...');
        send({ stage: 'Starting reset...', progress: 2 });
        
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
        
        // Allocate only 15% for database clearing (2-17%)
        let currentProgress = 2;
        const progressPerTable = 15 / (tablesToClear.length + 2); // +2 for profiles and vehicles
        
        // Clear all tables
        for (const table of tablesToClear) {
          console.log(`  Clearing ${table}...`);
          send({ stage: `Clearing ${table}...`, progress: Math.round(currentProgress) });
          
          const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          
          if (error && !error.message.includes('does not exist')) {
            console.error(`  ❌ Error clearing ${table}:`, error.message);
          }
          
          currentProgress += progressPerTable;
        }
        
        // Delete all demo users (except superadmin)
        console.log('  Deleting demo user profiles...');
        send({ stage: 'Deleting demo user profiles...', progress: Math.round(currentProgress) });
        
        // Use user.id instead of email to identify superadmin
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .neq('id', user.id);
        
        if (profileError) {
          console.error('  ❌ Error deleting profiles:', profileError.message);
        }
        
        currentProgress += progressPerTable;
        
        // Delete all vehicles
        console.log('  Deleting vehicles...');
        send({ stage: 'Deleting vehicles...', progress: Math.round(currentProgress) });
        
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (vehicleError) {
          console.error('  ❌ Error deleting vehicles:', vehicleError.message);
        }
        
        console.log('✅ Database cleared successfully');
        send({ stage: 'Database cleared, starting demo data generation...', progress: 18 });
        
        // Step 2: Regenerate demo data by running the script
        // This takes 80% of the progress bar (20-100%)
        console.log('🔄 Regenerating demo data...');
        
        try {
          // Start the script and simulate progress during execution
          send({ stage: 'Creating demo users and roles...', progress: 25 });
          
          // Run script in background while updating progress
          const scriptPromise = execAsync('npm run create:demo-data', {
            cwd: process.cwd(),
            timeout: 300000, // 5 minutes timeout
          });
          
          // Gradually increment progress while script runs
          const progressInterval = setInterval(() => {
            currentProgress += 1;
            if (currentProgress < 95) {
              const stages = [
                { min: 25, max: 35, stage: 'Creating demo users and roles...' },
                { min: 35, max: 45, stage: 'Setting up vehicles...' },
                { min: 45, max: 60, stage: 'Generating RAMS documents...' },
                { min: 60, max: 70, stage: 'Creating toolbox talks...' },
                { min: 70, max: 85, stage: 'Generating timesheets (4 weeks)...' },
                { min: 85, max: 95, stage: 'Creating vehicle inspections...' },
              ];
              
              const currentStage = stages.find(s => currentProgress >= s.min && currentProgress < s.max);
              if (currentStage) {
                send({ stage: currentStage.stage, progress: Math.round(currentProgress) });
              }
            }
          }, 800); // Update every 800ms
          
          // Wait for script to complete
          const { stdout, stderr } = await scriptPromise;
          clearInterval(progressInterval);
          
          if (stderr && !stderr.includes('npm')) {
            console.error('Script stderr:', stderr);
          }
          
          console.log('Script output:', stdout);
          console.log('✅ Demo data regenerated successfully');
          
          send({ stage: 'Finalizing demo data...', progress: 97 });
          
          // Final completion
          setTimeout(() => {
            send({ 
              stage: 'Complete! ✓', 
              progress: 100,
              success: true,
              message: 'Database reset and demo data regenerated successfully!'
            });
            controller.close();
          }, 500);
          
        } catch (scriptError: any) {
          console.error('❌ Error running demo data script:', scriptError);
          send({ 
            error: 'Database cleared but failed to regenerate demo data',
            details: scriptError.message,
            progress: 50
          });
          controller.close();
        }
        
      } catch (error: any) {
        console.error('❌ Error resetting database:', error);
        send({ 
          error: 'Failed to reset database',
          details: error.message,
          progress: 0
        });
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
