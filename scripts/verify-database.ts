#!/usr/bin/env tsx

import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING;

if (!POSTGRES_URL) {
  console.error('❌ Error: POSTGRES_URL_NON_POOLING not found');
  process.exit(1);
}

async function verifyDatabase() {
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get database name
    const { rows: dbInfo } = await client.query(`SELECT current_database();`);
    console.log(`📊 Database: ${dbInfo[0].current_database}\n`);

    // Check for castles table
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'castles';
    `);

    if (tables.length > 0) {
      console.log('✅ Found "castles" table - This is the CORRECT database (mpdee-digidocs)\n');
      
      // List all tables
      const { rows: allTables } = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      console.log(`Current tables (${allTables.length}):`);
      allTables.forEach((row: { table_name: string }) => {
        console.log(`   - ${row.table_name}`);
      });
      
      return true;
    } else {
      console.log('❌ No "castles" table found - WRONG DATABASE!\n');
      console.log('⚠️  STOPPING - Will not proceed with wipe');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  } finally {
    await client.end();
  }
}

verifyDatabase();
