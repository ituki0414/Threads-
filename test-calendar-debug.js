/**
 * Test script to verify calendar data flow
 * Opens Chrome to localhost:3000/calendar with console visible
 */

const { exec } = require('child_process');

console.log('🔍 Opening calendar page for debugging...');
console.log('📋 Check the browser console for debug logs');
console.log('');
console.log('Look for these logs:');
console.log('  ✅ Fetched posts from Supabase');
console.log('  🔍 November 14-15, 2025 posts count');
console.log('  📊 MonthView - Total posts received');
console.log('');

// Open Chrome with DevTools
exec('open -a "Google Chrome" http://localhost:3000/calendar', (error) => {
  if (error) {
    console.error('❌ Failed to open Chrome:', error);
    console.log('💡 Please manually open: http://localhost:3000/calendar');
  } else {
    console.log('✅ Chrome opened');
    console.log('💡 Open DevTools (Cmd+Option+I) and check the Console tab');
  }
});
