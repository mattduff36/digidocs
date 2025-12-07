#!/usr/bin/env tsx

/**
 * Import Skeleton Database Schema
 * 
 * This script imports the complete database schema from database_exports/database-skeleton-export.sql
 * into a fresh Supabase instance.
 * 
 * ⚠️  WARNING: This will DROP all existing tables and data!
 * 
 * Usage:
 *   npx tsx scripts/import-skeleton-database.ts
 * 
 * Requirements:
 *   - POSTGRES_URL_NON_POOLING in .env.local
 *   - Fresh/empty Supabase database
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING;

if (!POSTGRES_URL) {
  console.error('❌ Error: POSTGRES_URL_NON_POOLING not found in .env.local');
  console.error('\nPlease add your database connection string:');
  console.error('POSTGRES_URL_NON_POOLING="postgresql://postgres.[project-ref]:[password]@..."');
  process.exit(1);
}

async function importDatabase() {
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'database_exports', 'database-skeleton-export.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    console.log('📄 Reading database-skeleton-export.sql...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    console.log(`✅ SQL file loaded (${(sqlContent.length / 1024).toFixed(1)} KB)\n`);

    // Confirm before proceeding
    console.log('⚠️  WARNING: This will execute the complete database schema import.');
    console.log('⚠️  If tables already exist, some statements may fail (this is normal).\n');

    console.log('🚀 Executing SQL import...');
    console.log('⏳ This may take 30-60 seconds...\n');

    await client.query(sqlContent);

    console.log('✅ SQL import completed!\n');

    // Verify core tables were created
    console.log('🔍 Verifying database structure...');
    
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`✅ Found ${tables.length} tables:\n`);
    tables.forEach((row: { table_name: string }) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check for roles
    const { rows: roles } = await client.query(`SELECT name, display_name FROM roles ORDER BY name;`);
    console.log(`\n✅ Found ${roles.length} roles:`);
    roles.forEach((row: { name: string; display_name: string }) => {
      console.log(`   - ${row.name} (${row.display_name})`);
    });

    console.log('\n🎉 Database import completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up storage buckets (see DATABASE-EXPORT-README.md)');
    console.log('   2. Create your first admin user in Supabase Auth');
    console.log('   3. Update the user role: UPDATE profiles SET role = \'admin\', role_id = (SELECT id FROM roles WHERE name = \'admin\') WHERE id = \'<user-id>\';');

  } catch (error: unknown) {
    console.error('\n❌ Error during import:');
    if (error instanceof Error) {
      console.error(error.message);
      
      // Provide helpful context for common errors
      if (error.message.includes('already exists')) {
        console.log('\n💡 Note: Some "already exists" errors are normal if tables were previously created.');
        console.log('   The import may have partially succeeded. Check the table list above.');
      }
    } else {
      console.error(String(error));
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the import
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  MPDEE Digidocs - Database Skeleton Import           ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

importDatabase();

