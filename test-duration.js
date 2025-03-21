// Test script to verify the duration calculation fix
// Test case 1: Exactly 2 minutes
console.log('Test case 1: Exactly 2 minutes');
const startTime1 = new Date('2025-03-22T04:46:00.000Z');
const endTime1 = new Date('2025-03-22T04:48:00.000Z');

// Original calculation (using Math.floor)
const durationMs1 = endTime1 - startTime1;
const durationMinutes1 = Math.floor(durationMs1 / (1000 * 60));
const hours1 = Math.floor(durationMinutes1 / 60);
const minutes1 = durationMinutes1 % 60;

console.log('Original calculation:');
console.log('Duration in milliseconds:', durationMs1);
console.log('Duration in minutes (Math.floor):', durationMinutes1);
console.log('Hours:', hours1);
console.log('Minutes:', minutes1);
console.log('Formatted duration:', `${hours1}時間${minutes1}分`);

// Fixed calculation (using Math.round)
const durationMinutes1Round = Math.round(durationMs1 / (1000 * 60));
const hours1Round = Math.floor(durationMinutes1Round / 60);
const minutes1Round = durationMinutes1Round % 60;

console.log('\nFixed calculation:');
console.log('Duration in minutes (Math.round):', durationMinutes1Round);
console.log('Hours:', hours1Round);
console.log('Minutes:', minutes1Round);
console.log('Formatted duration:', `${hours1Round}時間${minutes1Round}分`);

// Test case 2: 1 minute and 45 seconds (should round to 2 minutes)
console.log('\n\nTest case 2: 1 minute and 45 seconds');
const startTime2 = new Date('2025-03-22T04:46:00.000Z');
const endTime2 = new Date('2025-03-22T04:47:45.000Z');

// Original calculation (using Math.floor)
const durationMs2 = endTime2 - startTime2;
const durationMinutes2 = Math.floor(durationMs2 / (1000 * 60));
const hours2 = Math.floor(durationMinutes2 / 60);
const minutes2 = durationMinutes2 % 60;

console.log('Original calculation:');
console.log('Duration in milliseconds:', durationMs2);
console.log('Duration in minutes (Math.floor):', durationMinutes2);
console.log('Hours:', hours2);
console.log('Minutes:', minutes2);
console.log('Formatted duration:', `${hours2}時間${minutes2}分`);

// Fixed calculation (using Math.round)
const durationMinutes2Round = Math.round(durationMs2 / (1000 * 60));
const hours2Round = Math.floor(durationMinutes2Round / 60);
const minutes2Round = durationMinutes2Round % 60;

console.log('\nFixed calculation:');
console.log('Duration in milliseconds:', durationMs2);
console.log('Duration in minutes (Math.round):', durationMinutes2Round);
console.log('Hours:', hours2Round);
console.log('Minutes:', minutes2Round);
console.log('Formatted duration:', `${hours2Round}時間${minutes2Round}分`);
