import { formatDateForInput, parseDateFromInput, formatDateForDatabase, parseDateFromDatabase } from './lib/datetime-utils';

// Test scenario: User wants to schedule for 2025-11-19 04:00 JST
console.log('=== Test: 2025-11-19 04:00 JST ===\n');

// 1. User inputs in datetime-local
const userInput = '2025-11-19T04:00';
console.log('1. User input:', userInput);

// 2. Parse from input
const parsed = parseDateFromInput(userInput);
console.log('2. Parsed Date object:', parsed);
console.log('   Components:', {
  year: parsed.getFullYear(),
  month: parsed.getMonth() + 1,
  day: parsed.getDate(),
  hours: parsed.getHours(),
  minutes: parsed.getMinutes(),
});

// 3. Format for database
const dbFormat = formatDateForDatabase(parsed);
console.log('3. Database format:', dbFormat);

// 4. Simulate reading from database (PostgreSQL adds +00:00)
console.log('\n=== Simulating database read ===');
const dbFormatWithTz = dbFormat + '+00:00'; // PostgreSQL adds this
console.log('4a. From DB with TZ:', dbFormatWithTz);
const fromDb = parseDateFromDatabase(dbFormatWithTz);
console.log('4b. Parsed from DB:', fromDb);
console.log('   Components:', {
  year: fromDb.getFullYear(),
  month: fromDb.getMonth() + 1,
  day: fromDb.getDate(),
  hours: fromDb.getHours(),
  minutes: fromDb.getMinutes(),
});

// 5. Format for input display
const displayFormat = formatDateForInput(fromDb);
console.log('5. Display in input:', displayFormat);

// 6. Final verification
console.log('\n=== Verification ===');
console.log('Input matches display?', userInput === displayFormat);
console.log('Expected: 2025-11-19T04:00');
console.log('Got:     ', displayFormat);
