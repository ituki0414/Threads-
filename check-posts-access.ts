import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkAccess() {
  console.log('🔍 Checking post access...\n');

  // Get first account ID
  const { data: accounts } = await supabaseAdmin
    .from('accounts')
    .select('id')
    .limit(1);

  if (!accounts || accounts.length === 0) {
    console.log('❌ No accounts found');
    return;
  }

  const accountId = accounts[0].id;
  console.log(`✅ Using account ID: ${accountId}\n`);

  // Test with admin client
  console.log('📊 Testing with ADMIN client (service_role):');
  const { data: adminPosts, error: adminError } = await supabaseAdmin
    .from('posts')
    .select('id, state, published_at, scheduled_at')
    .eq('account_id', accountId)
    .in('state', ['scheduled', 'published'])
    .limit(10);

  if (adminError) {
    console.error('❌ Admin error:', adminError);
  } else {
    console.log(`✅ Admin can see ${adminPosts?.length} posts`);
    adminPosts?.slice(0, 3).forEach(p => {
      console.log(`  - ${p.id}: ${p.state}, ${p.published_at || p.scheduled_at}`);
    });
  }

  // Test with anon client
  console.log('\n📊 Testing with ANON client (public):');
  const { data: anonPosts, error: anonError } = await supabaseAnon
    .from('posts')
    .select('id, state, published_at, scheduled_at')
    .eq('account_id', accountId)
    .in('state', ['scheduled', 'published'])
    .limit(10);

  if (anonError) {
    console.error('❌ Anon error:', anonError);
  } else {
    console.log(`✅ Anon can see ${anonPosts?.length} posts`);
    anonPosts?.slice(0, 3).forEach(p => {
      console.log(`  - ${p.id}: ${p.state}, ${p.published_at || p.scheduled_at}`);
    });
  }

  // Compare
  console.log(`\n📊 Summary:`);
  console.log(`  Admin sees: ${adminPosts?.length || 0} posts`);
  console.log(`  Anon sees: ${anonPosts?.length || 0} posts`);
  if ((adminPosts?.length || 0) > (anonPosts?.length || 0)) {
    console.log('\n⚠️ WARNING: RLS policies are blocking some posts from anon users!');
  }
}

checkAccess();
