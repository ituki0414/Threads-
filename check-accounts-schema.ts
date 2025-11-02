import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAccountsSchema() {
  console.log('🔍 Checking accounts table schema...\n');

  // アカウント情報を取得（全カラム）
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!accounts || accounts.length === 0) {
    console.log('⚠️ No accounts found');
    return;
  }

  const account = accounts[0];
  console.log('📊 Account columns and values:');
  console.log(JSON.stringify(account, null, 2));
}

checkAccountsSchema();
