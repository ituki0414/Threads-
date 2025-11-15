import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllData() {
  console.log('=== 📊 Complete Database Diagnostic ===\n');

  // 1. Check all accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*');

  if (accountsError) {
    console.error('❌ Error fetching accounts:', accountsError);
    return;
  }

  console.log(`Total accounts: ${accounts?.length || 0}\n`);

  if (accounts && accounts.length > 0) {
    for (const acc of accounts) {
      console.log(`Account: @${acc.handle} (ID: ${acc.id})`);

      // Check posts for this account
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('account_id', acc.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error(`  ❌ Error fetching posts:`, postsError);
        continue;
      }

      console.log(`  Total posts: ${posts?.length || 0}`);

      if (posts && posts.length > 0) {
        const stateCount: Record<string, number> = {};
        posts.forEach(p => {
          stateCount[p.state] = (stateCount[p.state] || 0) + 1;
        });

        console.log(`  Posts by state:`, stateCount);

        // Show scheduled posts for November 2025
        const novScheduled = posts.filter(p =>
          p.scheduled_at &&
          p.scheduled_at.startsWith('2025-11') &&
          p.state === 'scheduled'
        );

        console.log(`  November 2025 scheduled posts: ${novScheduled.length}`);

        if (novScheduled.length > 0) {
          novScheduled.forEach(p => {
            console.log(`    - ${p.scheduled_at}: ${p.caption?.substring(0, 40)}...`);
          });
        }

        // Show recent posts
        console.log(`\n  Recent 5 posts:`);
        posts.slice(0, 5).forEach(p => {
          console.log(`    [${p.state}] ${p.caption?.substring(0, 50)}...`);
          console.log(`      Created: ${p.created_at}`);
          console.log(`      Scheduled: ${p.scheduled_at || 'N/A'}`);
          console.log(`      Published: ${p.published_at || 'N/A'}`);
        });
      }

      console.log('');
    }
  }

  // 2. Check for orphaned posts (posts without accounts)
  const { data: allPosts, error: allPostsError } = await supabase
    .from('posts')
    .select('account_id');

  if (!allPostsError && allPosts) {
    const accountIds = new Set(accounts?.map(a => a.id) || []);
    const orphanedPosts = allPosts.filter(p => !accountIds.has(p.account_id));

    if (orphanedPosts.length > 0) {
      console.log(`⚠️  Found ${orphanedPosts.length} orphaned posts (account_id doesn't exist)`);
    }
  }
}

checkAllData().catch(console.error);
