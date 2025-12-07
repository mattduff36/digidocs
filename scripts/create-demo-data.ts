import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo user names
const DEMO_EMPLOYEES = [
  { firstName: 'James', lastName: 'Harrison', id: 'EMP001' },
  { firstName: 'Oliver', lastName: 'Thompson', id: 'EMP002' },
  { firstName: 'William', lastName: 'Matthews', id: 'EMP003' },
  { firstName: 'George', lastName: 'Anderson', id: 'EMP004' },
  { firstName: 'Charlie', lastName: 'Roberts', id: 'EMP005' },
  { firstName: 'Thomas', lastName: 'Edwards', id: 'EMP006' },
  { firstName: 'Jack', lastName: 'Phillips', id: 'EMP007' },
  { firstName: 'Harry', lastName: 'Mitchell', id: 'EMP008' },
  { firstName: 'Oscar', lastName: 'Campbell', id: 'EMP009' },
  { firstName: 'Jacob', lastName: 'Turner', id: 'EMP010' },
  { firstName: 'Noah', lastName: 'Parker', id: 'EMP011' },
  { firstName: 'Arthur', lastName: 'Collins', id: 'EMP012' },
  { firstName: 'Henry', lastName: 'Bennett', id: 'EMP013' },
  { firstName: 'Leo', lastName: 'Hughes', id: 'EMP014' }
];

const DEMO_CONTRACTORS = [
  { firstName: 'Michael', lastName: 'Davis', id: 'CON001' },
  { firstName: 'Daniel', lastName: 'Wilson', id: 'CON002' },
  { firstName: 'Samuel', lastName: 'Moore', id: 'CON003' },
  { firstName: 'Joshua', lastName: 'Taylor', id: 'CON004' },
  { firstName: 'Alexander', lastName: 'White', id: 'CON005' }
];

const DEMO_MANAGERS = [
  { firstName: 'Sarah', lastName: 'Johnson', id: 'MGR001' },
  { firstName: 'Emma', lastName: 'Williams', id: 'MGR002' },
  { firstName: 'Sophie', lastName: 'Brown', id: 'MGR003' }
];

const DEMO_ADMIN = [
  { firstName: 'David', lastName: 'Clarke', id: 'ADM001' }
];

// Sample vehicles
const SAMPLE_VEHICLES = [
  { reg: 'BD21ABC', type: 'Van', category: 'Commercial' },
  { reg: 'CD22DEF', type: 'Truck', category: 'HGV' },
  { reg: 'EF23GHI', type: 'Excavator', category: 'Plant' },
  { reg: 'GH24JKL', type: 'Van', category: 'Commercial' },
  { reg: 'IJ25MNO', type: 'Pickup Truck', category: 'Commercial' },
  { reg: 'KL26PQR', type: 'Dumper', category: 'Plant' },
  { reg: 'MN27STU', type: 'Van', category: 'Commercial' },
  { reg: 'OP28VWX', type: 'Truck', category: 'HGV' },
  { reg: 'QR29YZA', type: 'Loader', category: 'Plant' },
  { reg: 'ST30BCD', type: 'Van', category: 'Commercial' },
  { reg: 'UV31EFG', type: 'Truck', category: 'HGV' },
  { reg: 'WX32HIJ', type: 'Van', category: 'Commercial' },
  { reg: 'YZ33KLM', type: 'Forklift', category: 'Plant' }
];

// Sample job numbers
const JOB_NUMBERS = ['J2025-001', 'J2025-002', 'J2025-003', 'J2025-004', 'J2025-005', 'J2025-006', 'YARD'];

// Helper functions
function getWeekEnding(weeksAgo: number): string {
  const date = new Date('2025-12-07'); // Today's date
  date.setDate(date.getDate() - (weeksAgo * 7));
  // Get the Sunday of that week
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function getDateForWeek(weekEnding: string, dayOfWeek: number): string {
  const date = new Date(weekEnding);
  // dayOfWeek: 1=Monday, 7=Sunday
  date.setDate(date.getDate() - (7 - dayOfWeek));
  return date.toISOString().split('T')[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getTimesheetStatus(): string {
  const rand = Math.random();
  if (rand < 0.10) return 'draft';
  if (rand < 0.40) return 'submitted';
  if (rand < 0.70) return 'approved';
  if (rand < 0.75) return 'rejected';
  return 'processed';
}

// PDF Generation Functions
async function createRAMSPDF(title: string, description: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Title
  page.drawText('RISK ASSESSMENT METHOD STATEMENT', {
    x: 50,
    y: 792,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  // Document Title
  page.drawText(title, {
    x: 50,
    y: 750,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  // Description
  page.drawText(description, {
    x: 50,
    y: 720,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });

  // Content sections
  const sections = [
    { title: '1. HAZARDS IDENTIFIED:', content: '• Manual handling injuries\n• Falls from height\n• Slips, trips and falls\n• Contact with plant and equipment\n• Adverse weather conditions' },
    { title: '2. CONTROL MEASURES:', content: '• All operatives to wear appropriate PPE\n• Site induction completed for all personnel\n• Regular toolbox talks conducted\n• Equipment inspected before use\n• Emergency procedures in place' },
    { title: '3. EMERGENCY PROCEDURES:', content: '• First aid kit located in site office\n• Emergency contact numbers displayed\n• All incidents to be reported immediately\n• Trained first aiders on site' }
  ];

  let yPosition = 680;
  for (const section of sections) {
    page.drawText(section.title, {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    yPosition -= 20;

    const lines = section.content.split('\n');
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0, 0, 0)
      });
      yPosition -= 15;
    }
    yPosition -= 20;
  }

  // Footer
  page.drawText('This document must be read and understood by all personnel', {
    x: 50,
    y: 50,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function createToolboxTalkPDF(title: string, content: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Title
  page.drawText('TOOLBOX TALK', {
    x: 50,
    y: 792,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  // Talk Title
  page.drawText(title, {
    x: 50,
    y: 750,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  // Date
  const today = new Date().toLocaleDateString('en-GB');
  page.drawText(`Date: ${today}`, {
    x: 50,
    y: 720,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });

  // Content
  const lines = content.split('\n');
  let yPosition = 680;
  for (const line of lines) {
    if (yPosition < 100) break; // Don't overflow page
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    yPosition -= 20;
  }

  // Signature section
  page.drawText('ATTENDANCE SIGNATURE REQUIRED', {
    x: 50,
    y: 150,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  page.drawText('This toolbox talk must be read and signed by all attending personnel', {
    x: 50,
    y: 50,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Create demo users
async function createDemoUsers() {
  console.log('👥 Creating demo users...\n');

  const allUsers = [
    ...DEMO_EMPLOYEES.map(u => ({ ...u, role: 'employee' })),
    ...DEMO_CONTRACTORS.map(u => ({ ...u, role: 'employee' })), // Contractors use employee role
    ...DEMO_MANAGERS.map(u => ({ ...u, role: 'manager' })),
    ...DEMO_ADMIN.map(u => ({ ...u, role: 'admin' }))
  ];

  const createdUsers: any[] = [];

  for (const user of allUsers) {
    const email = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@digidocsdemo.com`;
    const fullName = `${user.firstName} ${user.lastName}`;
    
    console.log(`📝 Creating: ${fullName} (${user.id}) - ${user.role}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Password123',
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          employee_id: user.id
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.code === 'email_exists') {
          console.log(`   ℹ️  User already exists, updating profile...`);
          const { data: allUsers } = await supabase.auth.admin.listUsers();
          const foundUser = allUsers?.users.find(u => u.email === email);
          if (foundUser) {
            // Get the appropriate role_id
            const { data: roles } = await supabase
              .from('roles')
              .select('id, name')
              .eq('name', user.role)
              .single();

            if (roles) {
              // Upsert the profile for existing user
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({ 
                  id: foundUser.id,
                  role: user.role,
                  role_id: roles.id,
                  employee_id: user.id,
                  full_name: fullName
                }, { 
                  onConflict: 'id'
                });
                
              if (upsertError) {
                console.error(`   ❌ Error updating profile:`, upsertError.message);
              } else {
                createdUsers.push({ ...user, id: foundUser.id, email, fullName });
                console.log(`   ✅ Profile updated successfully`);
              }
            }
          }
        } else {
          console.error(`   ❌ Error:`, authError.message);
        }
      } else if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the appropriate role_id
        const { data: roles } = await supabase
          .from('roles')
          .select('id, name')
          .eq('name', user.role)
          .single();

        if (roles) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: user.role,
              role_id: roles.id,
              employee_id: user.id,
              full_name: fullName
            })
            .eq('id', authData.user.id);
            
          if (updateError) {
            console.error(`   ❌ Error updating profile:`, updateError.message);
          } else {
            createdUsers.push({ ...user, id: authData.user.id, email, fullName });
            console.log(`   ✅ Created successfully`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  return createdUsers;
}

// Create vehicles
async function createVehicles() {
  console.log('\n🚗 Creating sample vehicles...\n');
  const createdVehicles: any[] = [];

  // First, create or get vehicle category
  const { data: existingCategory } = await supabase
    .from('vehicle_categories')
    .select('id')
    .eq('name', 'General')
    .single();

  let categoryId = existingCategory?.id;

  if (!categoryId) {
    const { data: newCategory } = await supabase
      .from('vehicle_categories')
      .insert({ name: 'General', description: 'General purpose vehicles' })
      .select()
      .single();
    categoryId = newCategory?.id;
  }

  for (const vehicle of SAMPLE_VEHICLES) {
    console.log(`📝 Creating vehicle: ${vehicle.reg} (${vehicle.type})`);
    
    const { data, error } = await supabase
      .from('vehicles')
      .upsert({
        reg_number: vehicle.reg,
        vehicle_type: vehicle.type,
        category_id: categoryId,
        status: 'active'
      }, { onConflict: 'reg_number' })
      .select()
      .single();
      
    if (error) {
      console.error(`   ❌ Error:`, error.message);
    } else {
      createdVehicles.push(data);
      console.log(`   ✅ Created successfully`);
    }
  }

  return createdVehicles;
}

// Create RAMS documents
async function createRAMSDocuments(managers: any[]) {
  console.log('\n📋 Creating RAMS documents...\n');

  const ramsDocuments = [
    {
      title: 'Working at Heights Safety Procedures',
      description: 'Comprehensive safety guidelines for all work at heights including scaffolding, ladders, and elevated platforms.'
    },
    {
      title: 'Excavation and Groundworks Risk Assessment',
      description: 'Risk assessment and method statement for excavation work, including shoring, services, and confined spaces.'
    },
    {
      title: 'Site Safety Induction and PPE Requirements',
      description: 'Site-specific safety induction covering general safety rules, emergency procedures, and mandatory PPE.'
    }
  ];

  const createdRAMS: any[] = [];

  for (let i = 0; i < ramsDocuments.length; i++) {
    const doc = ramsDocuments[i];
    const manager = managers[i % managers.length];
    
    console.log(`📝 Creating RAMS: ${doc.title}`);
    
    try {
      // Generate PDF
      const pdfBuffer = await createRAMSPDF(doc.title, doc.description);
      const fileName = `rams-${Date.now()}-${i}.pdf`;
      const filePath = `rams/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('rams-documents')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error(`   ❌ Upload error:`, uploadError.message);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('rams-documents')
        .getPublicUrl(filePath);

      // Insert into database
      const { data, error } = await supabase
        .from('rams_documents')
        .insert({
          title: doc.title,
          description: doc.description,
          file_name: fileName,
          file_path: filePath,
          file_size: pdfBuffer.length,
          file_type: 'pdf',
          uploaded_by: manager.id,
          is_active: true,
          version: 1
        })
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Database error:`, error.message);
      } else {
        createdRAMS.push(data);
        console.log(`   ✅ Created successfully`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  return createdRAMS;
}

// Assign RAMS to employees
async function assignRAMSToEmployees(ramsDocuments: any[], employees: any[], managers: any[]) {
  console.log('\n📎 Assigning RAMS to employees...\n');

  for (const rams of ramsDocuments) {
    console.log(`📝 Assigning: ${rams.title}`);
    
    // Assign to random subset of employees (50-80%)
    const numToAssign = randomInt(Math.floor(employees.length * 0.5), Math.floor(employees.length * 0.8));
    const assignedEmployees = employees.slice(0, numToAssign);
    const manager = randomElement(managers);

    for (const employee of assignedEmployees) {
      const status = randomElement(['pending', 'read', 'read', 'signed', 'signed']); // More signed than pending
      
      const assignment: any = {
        rams_document_id: rams.id,
        employee_id: employee.id,
        assigned_by: manager.id,
        status: status
      };

      if (status === 'read') {
        assignment.read_at = new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000).toISOString();
      } else if (status === 'signed') {
        assignment.read_at = new Date(Date.now() - randomInt(5, 25) * 24 * 60 * 60 * 1000).toISOString();
        assignment.signed_at = new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000).toISOString();
        assignment.signature_data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      }

      const { error } = await supabase
        .from('rams_assignments')
        .upsert(assignment, { onConflict: 'rams_document_id,employee_id' });

      if (error) {
        console.error(`   ❌ Error assigning to ${employee.fullName}:`, error.message);
      }
    }
    console.log(`   ✅ Assigned to ${assignedEmployees.length} employees`);
  }
}

// Create Toolbox Talk messages
async function createToolboxTalks(managers: any[], employees: any[]) {
  console.log('\n📢 Creating Toolbox Talk messages...\n');

  const toolboxTalks = [
    {
      subject: 'Winter Weather Safety and Cold Working Conditions',
      body: 'Key Points:\n• Dress appropriately for cold conditions\n• Watch for ice and slippery surfaces\n• Take regular warm-up breaks\n• Report any cold-related health concerns\n• Ensure vehicles are winter-ready\n\nRemember: Your safety is our priority. If conditions become unsafe, stop work and notify your supervisor.'
    },
    {
      subject: 'Manual Handling and Lifting Techniques',
      body: 'Key Points:\n• Assess the load before lifting\n• Keep your back straight, bend at the knees\n• Hold load close to your body\n• Avoid twisting while carrying\n• Use mechanical aids where possible\n• Ask for help with heavy or awkward loads\n\nProper lifting technique prevents injuries. Never attempt to lift more than you can safely handle.'
    }
  ];

  for (let i = 0; i < toolboxTalks.length; i++) {
    const talk = toolboxTalks[i];
    const manager = managers[i % managers.length];
    
    console.log(`📝 Creating Toolbox Talk: ${talk.subject}`);
    
    try {
      // Generate PDF
      const pdfBuffer = await createToolboxTalkPDF(talk.subject, talk.body);
      const fileName = `toolbox-talk-${Date.now()}-${i}.pdf`;
      const filePath = `toolbox-talks/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('toolbox-talks')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error(`   ❌ Upload error:`, uploadError.message);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('toolbox-talks')
        .getPublicUrl(filePath);

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          type: 'TOOLBOX_TALK',
          subject: talk.subject,
          body: talk.body,
          priority: 'HIGH',
          sender_id: manager.id,
          pdf_url: urlData.publicUrl,
          pdf_file_path: filePath,
          created_via: 'web'
        })
        .select()
        .single();

      if (messageError) {
        console.error(`   ❌ Message error:`, messageError.message);
        continue;
      }

      // Create recipients for all employees
      const recipients = employees.map(emp => ({
        message_id: message.id,
        user_id: emp.id,
        status: randomElement(['PENDING', 'SHOWN', 'SHOWN', 'SIGNED', 'SIGNED']),
        ...(Math.random() > 0.3 && { first_shown_at: new Date(Date.now() - randomInt(1, 15) * 24 * 60 * 60 * 1000).toISOString() }),
        ...(Math.random() > 0.5 && { 
          signed_at: new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000).toISOString(),
          signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        })
      }));

      const { error: recipientsError } = await supabase
        .from('message_recipients')
        .insert(recipients);

      if (recipientsError) {
        console.error(`   ❌ Recipients error:`, recipientsError.message);
      } else {
        console.log(`   ✅ Created and sent to ${employees.length} employees`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }
}

// Create absence records and tracking
interface AbsenceRecord {
  employee: any;
  startDate: string;
  endDate: string;
  reason: string;
  days: string[];
}

async function createAbsenceRecords(employees: any[], managers: any[]): Promise<AbsenceRecord[]> {
  console.log('\n🏥 Creating absence records...\n');

  // Get absence reasons
  const { data: absenceReasons } = await supabase
    .from('absence_reasons')
    .select('*')
    .eq('is_active', true);

  if (!absenceReasons || absenceReasons.length === 0) {
    console.log('⚠️  No absence reasons found. Skipping absence creation.');
    return [];
  }

  const absenceRecords: AbsenceRecord[] = [];

  // Create 4-5 realistic absence records
  const absenceConfigs = [
    { type: 'Sickness', days: 3, weeksAgo: 3 },
    { type: 'Annual leave', days: 5, weeksAgo: 2 },
    { type: 'Medical appointment', days: 0.5, weeksAgo: 1 },
    { type: 'Sickness', days: 2, weeksAgo: 0 },
    { type: 'Annual leave', days: 1, weeksAgo: 1 }
  ];

  for (let i = 0; i < absenceConfigs.length; i++) {
    const config = absenceConfigs[i];
    const employee = employees[i % employees.length];
    const manager = randomElement(managers);
    
    const reason = absenceReasons.find(r => r.name === config.type);
    if (!reason) continue;

    const baseDate = new Date('2025-12-07');
    baseDate.setDate(baseDate.getDate() - (config.weeksAgo * 7) - randomInt(0, 6));
    
    const startDate = baseDate.toISOString().split('T')[0];
    const isHalfDay = config.days === 0.5;
    
    let endDate = startDate;
    if (!isHalfDay && config.days > 1) {
      const end = new Date(baseDate);
      end.setDate(end.getDate() + config.days - 1);
      endDate = end.toISOString().split('T')[0];
    }

    // Generate list of dates
    const absenceDates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      absenceDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    console.log(`📝 Creating absence: ${employee.fullName} - ${config.type} (${config.days} days)`);

    const { error } = await supabase
      .from('absences')
      .insert({
        profile_id: employee.id,
        date: startDate,
        end_date: endDate,
        reason_id: reason.id,
        duration_days: config.days,
        is_half_day: isHalfDay,
        half_day_session: isHalfDay ? randomElement(['AM', 'PM']) : null,
        notes: config.type === 'Sickness' ? 'Flu symptoms' : null,
        status: 'approved',
        created_by: employee.id,
        approved_by: manager.id,
        approved_at: new Date(Date.now() - randomInt(1, 5) * 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) {
      console.error(`   ❌ Error:`, error.message);
    } else {
      absenceRecords.push({
        employee,
        startDate,
        endDate,
        reason: config.type,
        days: absenceDates
      });
      console.log(`   ✅ Created successfully`);
    }
  }

  return absenceRecords;
}

// Create timesheets
async function createTimesheets(employees: any[], managers: any[], vehicles: any[], absenceRecords: AbsenceRecord[]) {
  console.log('\n📅 Creating timesheets for 4 weeks...\n');

  let totalTimesheets = 0;
  let totalEntries = 0;

  // Create a map of absences by employee and date for quick lookup
  const absenceMap = new Map<string, Set<string>>();
  for (const absence of absenceRecords) {
    if (!absenceMap.has(absence.employee.id)) {
      absenceMap.set(absence.employee.id, new Set());
    }
    for (const date of absence.days) {
      absenceMap.get(absence.employee.id)!.add(date);
    }
  }

  for (let week = 0; week < 4; week++) {
    const weekEnding = getWeekEnding(week);
    console.log(`Week ${4 - week} ending: ${weekEnding}`);

    for (const employee of employees) {
      const vehicle = randomElement(vehicles);
      const status = getTimesheetStatus();
      const manager = randomElement(managers);
      
      // Calculate timestamps based on status
      let submittedAt = null;
      let reviewedBy = null;
      let reviewedAt = null;

      if (['submitted', 'approved', 'rejected', 'processed'].includes(status)) {
        submittedAt = new Date(Date.now() - (week * 7 + 6) * 24 * 60 * 60 * 1000).toISOString();
      }
      
      if (['approved', 'rejected', 'processed'].includes(status)) {
        reviewedBy = manager.id;
        reviewedAt = new Date(Date.now() - (week * 7 + 5) * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data: timesheet, error: timesheetError } = await supabase
        .from('timesheets')
        .insert({
          user_id: employee.id,
          reg_number: vehicle.reg_number,
          week_ending: weekEnding,
          status: status,
          submitted_at: submittedAt,
          reviewed_by: reviewedBy,
          reviewed_at: reviewedAt,
          manager_comments: status === 'rejected' ? 'Please correct hours for Monday' : null
        })
        .select()
        .single();

      if (timesheetError) {
        if (!timesheetError.message.includes('duplicate key value')) {
          console.error(`   ❌ Error creating timesheet for ${employee.fullName}:`, timesheetError.message);
        }
        continue;
      }

      totalTimesheets++;

      // Create entries for each day (Monday-Sunday)
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const entryDate = getDateForWeek(weekEnding, dayOfWeek);
        const hasAbsence = absenceMap.get(employee.id)?.has(entryDate);
        const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;
        
        let didNotWork = hasAbsence || (isWeekend && Math.random() < 0.7); // 70% of weekends off
        let timeStarted = null;
        let timeFinished = null;
        let dailyTotal = null;
        let jobNumber = null;
        let workingInYard = false;

        if (!didNotWork) {
          const startHour = randomInt(6, 8);
          const duration = randomInt(8, 10);
          timeStarted = `${String(startHour).padStart(2, '0')}:00:00`;
          timeFinished = `${String(startHour + duration).padStart(2, '0')}:00:00`;
          dailyTotal = duration + (Math.random() < 0.3 ? 0.5 : 0);
          workingInYard = Math.random() < 0.15;
          jobNumber = workingInYard ? 'YARD' : randomElement(JOB_NUMBERS);
        }

        const { error: entryError } = await supabase
          .from('timesheet_entries')
          .insert({
            timesheet_id: timesheet.id,
            day_of_week: dayOfWeek,
            date: entryDate,
            time_started: timeStarted,
            time_finished: timeFinished,
            working_in_yard: workingInYard,
            did_not_work: didNotWork,
            daily_total: dailyTotal,
            job_number: jobNumber,
            shift_type: 'day',
            remarks: hasAbsence ? 'Absent' : (didNotWork ? null : null)
          });

        if (!entryError) {
          totalEntries++;
        }
      }
    }
    console.log(`   ✅ Week ${4 - week} completed`);
  }

  console.log(`\n   📊 Total: ${totalTimesheets} timesheets, ${totalEntries} entries`);
}

// Create vehicle inspections
async function createInspections(employees: any[], vehicles: any[], managers: any[]) {
  console.log('\n🔍 Creating vehicle inspections for 4 weeks...\n');

  const INSPECTION_ITEMS = [
    'Fuel - and ad-blu', 'Mirrors - includes Class V & Class VI', 'Safety Equipment - Cameras & Audible Alerts',
    'Warning Signage - VRU Sign', 'FORS Stickers', 'Oil', 'Water', 'Battery', 'Tyres', 'Brakes',
    'Steering', 'Lights', 'Reflectors', 'Indicators', 'Wipers', 'Washers', 'Horn', 'Markers',
    'Sheets / Ropes / Chains', 'Security of Load', 'Side underbar/Rails', 'Brake Hoses',
    'Couplings Secure', 'Electrical Connections', 'Trailer No. Plate', 'Nil Defects'
  ];

  // 90% of employees have vehicles
  const employeesWithVehicles = employees.slice(0, Math.floor(employees.length * 0.9));

  let totalInspections = 0;

  for (let week = 0; week < 4; week++) {
    const weekEnding = getWeekEnding(week);
    const startDate = getDateForWeek(weekEnding, 1);
    const endDate = weekEnding;
    
    console.log(`Week ${4 - week}: ${startDate} to ${endDate}`);

    for (const employee of employeesWithVehicles) {
      const vehicle = randomElement(vehicles);
      const manager = randomElement(managers);
      const hasDefects = Math.random() < 0.25; // 25% have defects

      const { data: inspection, error: inspectionError } = await supabase
        .from('vehicle_inspections')
        .insert({
          vehicle_id: vehicle.id,
          user_id: employee.id,
          week_ending: weekEnding,
          mileage: randomInt(50000, 150000),
          checked_by: employee.fullName,
          defects_comments: hasDefects ? 'Minor defects noted and logged' : null,
          action_taken: hasDefects ? 'Reported to workshop' : null,
          status: 'submitted',
          submitted_at: new Date(Date.now() - (week * 7 + 6) * 24 * 60 * 60 * 1000).toISOString(),
          reviewed_by: manager.id,
          reviewed_at: new Date(Date.now() - (week * 7 + 5) * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (inspectionError) {
        // console.error(`   ❌ Error creating inspection:`, inspectionError.message);
        continue;
      }

      totalInspections++;

      // Create inspection items (26 items x 7 days)
      const defectItems = hasDefects ? 
        Array.from({ length: randomInt(1, 3) }, () => randomInt(1, 26)) : 
        [];

      for (let itemNum = 1; itemNum <= 26; itemNum++) {
        for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
          const isDefect = defectItems.includes(itemNum);
          
          await supabase
            .from('inspection_items')
            .insert({
              inspection_id: inspection.id,
              item_number: itemNum,
              day_of_week: dayOfWeek,
              status: isDefect ? 'attention' : 'ok'
            });
        }
      }

      // Create actions for defects
      if (hasDefects) {
        for (const itemNum of defectItems) {
          await supabase
            .from('actions')
            .insert({
              inspection_id: inspection.id,
              title: `${vehicle.reg_number}: ${INSPECTION_ITEMS[itemNum - 1]}`,
              description: 'Defect found during inspection - requires attention',
              priority: randomElement(['low', 'medium', 'high']),
              status: randomElement(['pending', 'pending', 'in_progress']),
              actioned: false,
              created_by: manager.id
            });
        }
      }
    }
    console.log(`   ✅ Week ${4 - week} completed - ${employeesWithVehicles.length} inspections`);
  }

  console.log(`\n   📊 Total: ${totalInspections} inspections`);
}

// Main execution
async function createDemoData() {
  console.log('🎬 Creating comprehensive demo data for DigiDocs...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Create users
    const users = await createDemoUsers();
    if (users.length === 0) {
      console.error('❌ No users created, aborting...');
      return;
    }

    const employees = users.filter(u => u.role === 'employee');
    const managers = users.filter(u => u.role === 'manager');
    const admins = users.filter(u => u.role === 'admin');

    // 2. Create vehicles
    const vehicles = await createVehicles();
    if (vehicles.length === 0) {
      console.error('❌ No vehicles created, aborting...');
      return;
    }

    // 3. Create RAMS documents
    const ramsDocuments = await createRAMSDocuments(managers);
    
    // 4. Assign RAMS to employees
    if (ramsDocuments.length > 0) {
      await assignRAMSToEmployees(ramsDocuments, employees, managers);
    }

    // 5. Create Toolbox Talks
    await createToolboxTalks(managers, employees);

    // 6. Create absence records (this must come before timesheets)
    const absenceRecords = await createAbsenceRecords(employees, managers);

    // 7. Create timesheets (uses absence data)
    await createTimesheets(employees, managers, vehicles, absenceRecords);

    // 8. Create inspections
    await createInspections(employees, vehicles, managers);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Demo data created successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${employees.length} employees created`);
    console.log(`   • ${managers.length} managers created`);
    console.log(`   • ${admins.length} administrator created`);
    console.log(`   • ${vehicles.length} vehicles created`);
    console.log(`   • ${ramsDocuments.length} RAMS documents uploaded`);
    console.log(`   • 2 Toolbox Talks created and distributed`);
    console.log(`   • ${absenceRecords.length} absence records created`);
    console.log(`   • 4 weeks of timesheet data`);
    console.log(`   • 4 weeks of inspection data`);
    console.log('\n💡 Login credentials:');
    console.log('   Email: [firstname].[surname]@digidocsdemo.com');
    console.log('   Password: Password123');
    console.log('\n   Example: james.harrison@digidocsdemo.com');
    console.log('   Manager: sarah.johnson@digidocsdemo.com');
    console.log('   Admin: david.clarke@digidocsdemo.com');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }
}

// Export for use in API routes
export { createDemoData };

// Only run if called directly (not imported)
if (require.main === module) {
  createDemoData();
}
