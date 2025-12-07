import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDemoStorage() {
  console.log('🚀 Setting up demo storage buckets...\n');

  try {
    // Check if buckets already exist
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const bucketsToCreate = [
      {
        name: 'rams-documents',
        config: {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        }
      },
      {
        name: 'toolbox-talks',
        config: {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['application/pdf']
        }
      }
    ];

    for (const bucket of bucketsToCreate) {
      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);

      if (bucketExists) {
        console.log(`✅ Bucket "${bucket.name}" already exists`);
      } else {
        console.log(`📦 Creating bucket "${bucket.name}"...`);
        const { error: createError } = await supabase.storage.createBucket(bucket.name, bucket.config);

        if (createError) {
          console.error(`❌ Error creating bucket "${bucket.name}":`, createError.message);
        } else {
          console.log(`✅ Bucket "${bucket.name}" created successfully`);
        }
      }
    }

    console.log('\n🎉 Demo storage setup complete!');

  } catch (error) {
    console.error('\n❌ Error setting up storage:', error);
    process.exit(1);
  }
}

setupDemoStorage();
