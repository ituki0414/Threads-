import { formatDateForInput, parseDateFromDatabase } from './lib/datetime-utils';

// Test with actual DB value from check-db-posts.ts output
const dbValue = '2025-11-14T15:00:00+00:00';

console.log('=== Testing existing DB value ===');
console.log('DB value:', dbValue);

const parsed = parseDateFromDatabase(dbValue);
console.log('\nParsed Date:');
console.log('  Internal (UTC):', parsed.toISOString());
console.log('  Local string:', parsed.toString());
console.log('  Components (local):', {
  year: parsed.getFullYear(),
  month: parsed.getMonth() + 1,
  day: parsed.getDate(),
  hours: parsed.getHours(),
  minutes: parsed.getMinutes(),
});

const inputDisplay = formatDateForInput(parsed);
console.log('\nDisplay in datetime-local input:', inputDisplay);

// What the user will see
console.log('\n=== User will see ===');
console.log('datetime-local input:', inputDisplay);
console.log('Meaning: JST', inputDisplay.replace('T', ' '));
