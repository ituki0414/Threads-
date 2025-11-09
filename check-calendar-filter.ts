import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkFilter() {
  const accId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Checking filter used by calendar page...\n');

  // Same query as calendar page (lines 42-46)
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accId)
    .in('state', ['scheduled', 'published']);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total posts fetched: ${data?.length}\n`);

  // Same filter as lines 55-60 (Oct 30 check)
  const oct30Posts = data?.filter(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDate() === 30 && date.getMonth() === 9; // Month is 0-indexed, 9 = October
  });

  console.log(`🗓️ Oct 30 posts (ANY YEAR): ${oct30Posts?.length}\n`);
  oct30Posts?.forEach(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    const date = new Date(dateStr!);
    console.log(`  - ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`);
    console.log(`    ${p.caption?.substring(0, 60)}...`);
  });

  // With year check
  const oct30Posts2025 = data?.filter(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDate() === 30 && date.getMonth() === 9 && date.getFullYear() === 2025;
  });

  console.log(`\n🗓️ Oct 30 2025 posts (WITH YEAR): ${oct30Posts2025?.length}\n`);
  oct30Posts2025?.forEach(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    const date = new Date(dateStr!);
    console.log(`  - ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`);
    console.log(`    ${p.caption?.substring(0, 60)}...`);
  });

  // Break down by state
  console.log('\n📊 Posts by state:');
  const published = data?.filter(p => p.state === 'published').length;
  const scheduled = data?.filter(p => p.state === 'scheduled').length;
  console.log(`  published: ${published}`);
  console.log(`  scheduled: ${scheduled}`);

  // Check if there are posts with state 'pending' not being fetched
  const { data: allPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accId);

  const pending = allPosts?.filter(p => p.state === 'pending').length;
  const other = allPosts?.filter(p => !['published', 'scheduled', 'pending'].includes(p.state)).length;

  console.log(`\n📊 NOT fetched by calendar filter:`);
  console.log(`  pending: ${pending}`);
  console.log(`  other states: ${other}`);
  console.log(`\n📊 Total in DB: ${allPosts?.length}`);
  console.log(`📊 Fetched by calendar: ${data?.length}`);
  console.log(`📊 Missing: ${(allPosts?.length || 0) - (data?.length || 0)}`);
}

checkFilter();
