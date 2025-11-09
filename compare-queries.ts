import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function compare() {
  const accId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Comparing two different queries...\n');

  // Query 1: From find-october-posts-account.ts (found 50 posts)
  console.log('Query 1: October posts >= 2025-10-01 and < 2025-11-01');
  const { data: query1, error: error1 } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accId)
    .gte('published_at', '2025-10-01')
    .lt('published_at', '2025-11-01');

  if (error1) {
    console.error('❌ Query 1 Error:', error1);
  } else {
    console.log(`✅ Query 1 result: ${query1?.length} posts\n`);
    query1?.slice(0, 3).forEach(p => {
      console.log(`  - ${p.published_at} - ${p.caption?.substring(0, 50)}`);
    });
  }

  // Query 2: From calendar page (found 0 Oct 30 posts)
  console.log('\n\nQuery 2: state in [scheduled, published]');
  const { data: query2, error: error2 } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accId)
    .in('state', ['scheduled', 'published']);

  if (error2) {
    console.error('❌ Query 2 Error:', error2);
  } else {
    console.log(`✅ Query 2 result: ${query2?.length} posts`);

    const oct2025 = query2?.filter(p => {
      const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date.getMonth() === 9 && date.getFullYear() === 2025;
    });

    console.log(`  October 2025 posts from query2: ${oct2025?.length}\n`);
    oct2025?.slice(0, 3).forEach(p => {
      const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
      console.log(`  - ${dateStr} - ${p.caption?.substring(0, 50)}`);
    });
  }

  // Check if the October posts are in query2
  console.log('\n\n🔍 Detailed analysis:');
  if (query1 && query2) {
    const oct1Ids = new Set(query1.map(p => p.id));
    const query2Ids = new Set(query2.map(p => p.id));

    const inBoth = query1.filter(p => query2Ids.has(p.id));
    const onlyIn1 = query1.filter(p => !query2Ids.has(p.id));

    console.log(`  Oct posts in BOTH queries: ${inBoth.length}`);
    console.log(`  Oct posts ONLY in query1: ${onlyIn1.length}`);

    if (onlyIn1.length > 0) {
      console.log('\n  Posts only in query1 (not fetched by calendar):');
      onlyIn1.slice(0, 5).forEach(p => {
        console.log(`    - ID: ${p.id}`);
        console.log(`      State: ${p.state}`);
        console.log(`      Published: ${p.published_at}`);
        console.log(`      Scheduled: ${p.scheduled_at}`);
        console.log(`      Caption: ${p.caption?.substring(0, 50)}`);
      });
    }
  }
}

compare();
