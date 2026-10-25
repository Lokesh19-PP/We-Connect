import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Automatically load .env.local if not already in environment
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvLocal();

// Read configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('<') || serviceRoleKey.includes('<')) {
  console.error('Error: Valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env.local file.');
  process.exit(1);
}

// Clean and normalize supabaseUrl
const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabase = createClient(cleanUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});



interface UserSeedSpec {
  email: string;
  password: string;
  name: string;
  role:
    | 'procurement'
    | 'production'
    | 'engineering'
    | 'stores'
    | 'quality'
    | 'finance'
    | 'management'
    | 'workshop_owner'
    | 'workshop_staff'
    | 'admin';
  workshopId: string | null;
}

const TEST_USERS: UserSeedSpec[] = [
  { email: 'procurement@test.com', password: 'test1234', name: 'Amitabh Sen', role: 'procurement', workshopId: null },
  { email: 'production@test.com', password: 'test1234', name: 'Rahul Joshi', role: 'production', workshopId: null },
  { email: 'engineering@test.com', password: 'test1234', name: 'Priya Sharma', role: 'engineering', workshopId: null },
  { email: 'stores@test.com', password: 'test1234', name: 'Rajendra More', role: 'stores', workshopId: null },
  { email: 'quality@test.com', password: 'test1234', name: 'Deepak Joshi', role: 'quality', workshopId: null },
  { email: 'finance@test.com', password: 'test1234', name: 'Nikhil Ranade', role: 'finance', workshopId: null },
  { email: 'management@test.com', password: 'test1234', name: 'Executive Director', role: 'management', workshopId: null },
  { email: 'admin@test.com', password: 'test1234', name: 'System Admin', role: 'admin', workshopId: null },
  { email: 'workshopA@test.com', password: 'test1234', name: 'Ramesh Shinde', role: 'workshop_owner', workshopId: 'c0000000-0000-0000-0000-000000000001' },
  { email: 'workshopB@test.com', password: 'test1234', name: 'Suresh Patil', role: 'workshop_staff', workshopId: 'c0000000-0000-0000-0000-000000000002' },
];

async function seedUsers() {
  console.log('--- Starting User Seeding ---');

  // List existing users to avoid duplicate attempts
  const { data: userListData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list existing auth users:', listError.message);
    process.exit(1);
  }

  const existingMap = new Map<string, string>();
  for (const u of userListData.users) {
    if (u.email) {
      existingMap.set(u.email.toLowerCase(), u.id);
    }
  }

  for (const spec of TEST_USERS) {
    let authUserId = existingMap.get(spec.email.toLowerCase());

    if (!authUserId) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: spec.email,
        password: spec.password,
        email_confirm: true,
        user_metadata: { name: spec.name, role: spec.role },
      });

      if (createError) {
        console.error(`Failed to create Auth user ${spec.email}:`, createError.message);
        continue;
      }
      authUserId = newUser.user.id;
      console.log(`Created Auth user: ${spec.email}`);
    } else {
      console.log(`Found existing Auth user: ${spec.email}`);
    }

    // Upsert into public.users table
    const { error: upsertError } = await supabase.from('users').upsert({
      id: authUserId,
      name: spec.name,
      email: spec.email,
      role: spec.role,
      workshop_id: spec.workshopId,
    });

    if (upsertError) {
      console.error(`Failed to link public.users for ${spec.email}:`, upsertError.message);
    } else {
      console.log(`Linked public.users profile: ${spec.email} -> ${spec.role}`);
    }
  }

  console.log('\n======================================================');
  console.log('              TEST LOGINS CREATED');
  console.log('======================================================');
  console.table(
    TEST_USERS.map((u) => ({
      Email: u.email,
      Password: u.password,
      Role: u.role,
      WorkshopId: u.workshopId || 'N/A',
    }))
  );
  console.log('======================================================\n');
}

seedUsers().catch((err) => {
  console.error('Unhandled error during user seeding:', err);
  process.exit(1);
});
