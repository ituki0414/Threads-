import { isSameDay } from 'date-fns';

// Test date matching logic
console.log('🧪 Testing date matching logic\n');

// Simulate a post date (UTC timestamp from database)
const postDateStr = '2025-10-30T07:32:37+00:00';
const postDate = new Date(postDateStr);

console.log('📅 Post date:');
console.log(`  Raw: ${postDateStr}`);
console.log(`  ISO: ${postDate.toISOString()}`);
console.log(`  Local: ${postDate.toLocaleDateString('ja-JP')} ${postDate.toLocaleTimeString('ja-JP')}`);
console.log(`  getFullYear(): ${postDate.getFullYear()}`);
console.log(`  getMonth(): ${postDate.getMonth()} (0-indexed, so 9 = October)`);
console.log(`  getDate(): ${postDate.getDate()}`);
console.log(`  getHours(): ${postDate.getHours()}`);

// Simulate a calendar cell date (local time)
const calendarDate = new Date(2025, 9, 30); // October 30, 2025 at midnight local time
console.log('\n📅 Calendar cell date (Oct 30, 2025 midnight):');
console.log(`  ISO: ${calendarDate.toISOString()}`);
console.log(`  Local: ${calendarDate.toLocaleDateString('ja-JP')} ${calendarDate.toLocaleTimeString('ja-JP')}`);
console.log(`  getFullYear(): ${calendarDate.getFullYear()}`);
console.log(`  getMonth(): ${calendarDate.getMonth()}`);
console.log(`  getDate(): ${calendarDate.getDate()}`);

// Test isSameDay
const matches = isSameDay(postDate, calendarDate);
console.log(`\n✅ isSameDay result: ${matches}`);

// Test with a different date
const wrongDate = new Date(2025, 9, 31); // October 31
const wrongMatches = isSameDay(postDate, wrongDate);
console.log(`❌ isSameDay(Oct 30 post, Oct 31 cell): ${wrongMatches}`);

// Test with same date but different time
const sameDate = new Date(2025, 9, 30, 23, 59, 59); // Oct 30, 11:59 PM
const sameMatches = isSameDay(postDate, sameDate);
console.log(`✅ isSameDay(Oct 30 post, Oct 30 11:59 PM): ${sameMatches}`);
