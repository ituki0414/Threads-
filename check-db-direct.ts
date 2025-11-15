import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://quimpewkazigzruqginy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aW1wZXdrYXppZ3pydXFnaW55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwMTEzMSwiZXhwIjoyMDc3Mzc3MTMxfQ.O_NQgq8A3aclXymZlOcNhFvVAFAwQ2v1Nk5chSVaXkU'
);

async function main() {
  console.log('🔍 Checking database...\n');

  // Check accounts
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('*');

  if (accError) {
    console.error('❌ Error fetching accounts:', accError);
  } else {
    console.log(`✅ Accounts found: ${accounts?.length || 0}`);
    accounts?.forEach(acc => {
      console.log(`  - ID: ${acc.id}, Handle: ${acc.handle}`);
    });
  }

  if (!accounts || accounts.length === 0) {
    console.log('\n❌ No accounts in database!');
    return;
  }

  const accountId = accounts[0].id;
  console.log(`\n📱 Using account: ${accounts[0].handle}\n`);

  // Check all posts for this account
  const { data: allPosts, error: allError } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accountId);

  if (allError) {
    console.error('❌ Error fetching all posts:', allError);
  } else {
    console.log(`✅ Total posts for this account: ${allPosts?.length || 0}`);

    const byState = allPosts?.reduce((acc, p) => {
      acc[p.state] = (acc[p.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('  By state:', byState);
  }

  // Check November 2025 scheduled posts
  const { data: novPosts, error: novError } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accountId)
    .eq('state', 'scheduled')
    .gte('scheduled_at', '2025-11-01T00:00:00Z')
    .lt('scheduled_at', '2025-12-01T00:00:00Z');

  if (novError) {
    console.error('❌ Error fetching November posts:', novError);
  } else {
    console.log(`\n📅 November 2025 scheduled posts: ${novPosts?.length || 0}`);

    novPosts?.forEach((p, i) => {
      const date = new Date(p.scheduled_at!);
      console.log(`\n${i + 1}. ${p.caption?.substring(0, 40) || '(no caption)'}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Scheduled: ${p.scheduled_at}`);
      console.log(`   Date (local): ${date.toLocaleString()}`);
      console.log(`   Date (UTC): ${date.toUTCString()}`);
      console.log(`   Day: ${date.getDate()}`);
    });
  }
}

main().catch(console.error);
