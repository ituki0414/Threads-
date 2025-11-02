import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPendingPosts() {
  // Check count with head: true
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'pending');

  console.log('📊 Pending posts count:', count);
  if (error) console.log('❌ Error:', error);

  // Also check all states
  const { data: allStates } = await supabase
    .from('posts')
    .select('state');

  const stateCounts = allStates?.reduce((acc: any, post: any) => {
    acc[post.state] = (acc[post.state] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📈 All states count:');
  Object.entries(stateCounts || {}).forEach(([state, count]) => {
    console.log(`  ${state}: ${count}`);
  });
}

checkPendingPosts();
