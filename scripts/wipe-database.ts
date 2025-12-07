#!/usr/bin/env tsx

/**
 * WIPE DATABASE - Complete Database Reset
 * 
 * ⚠️  DANGER: This will DELETE ALL data!
 * - Drops all tables in public schema
 * - Removes all data completely
 * 
 * Note: Auth users and storage buckets must be manually deleted from Supabase Dashboard
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING;

if (!POSTGRES_URL) {
  console.error('❌ Error: POSTGRES_URL_NON_POOLING not found');
  process.exit(1);
}

async function wipeDatabase() {
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Verify we have castles table (safety check)
    const { rows: castlesCheck } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'castles';
    `);

    if (castlesCheck.length === 0) {
      console.error('❌ SAFETY CHECK FAILED: No "castles" table found!');
      console.error('⚠️  This is NOT the correct database. Aborting.');
      process.exit(1);
    }

    console.log('✅ Safety check passed (castles table found)\n');

    // Get all tables in public schema
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (tables.length === 0) {
      console.log('ℹ️  No tables to drop. Database is already empty.');
      return;
    }

    console.log(`🗑️  Preparing to drop ${tables.length} tables:\n`);
    tables.forEach((row: { table_name: string }) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n⚠️  Dropping all tables...\n');

    // Drop all tables (CASCADE to handle dependencies)
    await client.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    console.log('✅ All tables dropped successfully\n');

    // Drop all functions
    console.log('🗑️  Dropping all functions...\n');
    await client.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT proname, oidvectortypes(proargtypes) as argtypes
          FROM pg_proc 
          INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
          WHERE pg_namespace.nspname = 'public'
        ) 
        LOOP
          EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
        END LOOP;
      END $$;
    `);

    console.log('✅ All functions dropped\n');

    // Drop all sequences
    console.log('🗑️  Dropping all sequences...\n');
    await client.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') 
        LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    console.log('✅ All sequences dropped\n');

    // Verify everything is gone
    const { rows: remainingTables } = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';
    `);

    console.log(`\n✅ Database wiped successfully!`);
    console.log(`   Remaining tables: ${remainingTables[0].count}`);
    
    console.log('\n📋 Manual steps still required:');
    console.log('   1. Go to Supabase Dashboard > Authentication');
    console.log('   2. Delete all users manually');
    console.log('   3. Go to Storage and delete all buckets');
    console.log('   4. Run: npm run import:database');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  ⚠️  DATABASE WIPE - DESTROY ALL DATA  ⚠️            ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

wipeDatabase();
