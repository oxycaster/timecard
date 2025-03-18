// DOM Elements
const currentTimeEl = document.getElementById('current-time');
const clockInBtn = document.getElementById('clock-in');
const clockOutBtn = document.getElementById('clock-out');
const statusEl = document.getElementById('status');
const todayInEl = document.getElementById('today-in');
const todayOutEl = document.getElementById('today-out');
const todayHoursEl = document.getElementById('today-hours');
const monthlyHoursEl = document.getElementById('monthly-hours');
const remainingHoursEl = document.getElementById('remaining-hours');
const progressBarEl = document.getElementById('progress-bar');
const recordsBodyEl = document.getElementById('records-body');

// Constants
const STORAGE_KEY = 'timecard_records';
const CONTRACT_HOURS = 128;

// State
let records = [];
let currentStatus = 'out'; // 'in' or 'out'
let todayRecords = []; // Array of records for today
let currentSession = null; // Current active session

// Initialize
async function init() {
    await loadRecords();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    updateUI();
    setupEventListeners();
    checkTodayRecord();
}

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = formatDateTime(now);
}

// Format date and time
function formatDate(date) {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatTime(date) {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

// Calculate hours between two dates
function calculateHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
}

// Load records from server
async function loadRecords() {
    try {
        const response = await fetch('/api/records');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        records = data;
    } catch (error) {
        console.error('Error loading records:', error);
        // If loading fails, try to use localStorage as fallback
        const storedRecords = localStorage.getItem(STORAGE_KEY);
        if (storedRecords) {
            records = JSON.parse(storedRecords);
        }
    }
}

// Save records to server
async function saveRecords() {
    try {
        const response = await fetch('/api/records', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(records)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Also save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving records:', error);
        // If saving to server fails, at least save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
}

// Check if there are records for today and determine current status
function checkTodayRecord() {
    const today = formatDate(new Date());
    
    // Filter records for today
    todayRecords = records.filter(record => 
        formatDate(new Date(record.date)) === today
    );
    
    // Check if there's an active session (clock-in without clock-out)
    currentSession = todayRecords.find(record => !record.clockOut);
    
    if (currentSession) {
        currentStatus = 'in';
    } else {
        currentStatus = 'out';
    }
    
    updateStatusDisplay();
}

// Update status display
function updateStatusDisplay() {
    if (currentStatus === 'in') {
        statusEl.textContent = '出勤中';
        statusEl.style.color = '#2ecc71';
        clockInBtn.disabled = true;
        clockOutBtn.disabled = false;
    } else {
        statusEl.textContent = '未出勤';
        statusEl.style.color = '#e74c3c';
        clockInBtn.disabled = false;
        clockOutBtn.disabled = false;
    }
}

// Clock in
async function clockIn() {
    if (currentStatus === 'in') {
        alert('すでに出勤中です。先に退勤してください。');
        return;
    }
    
    const now = new Date();
    
    // Create new record for this session
    currentSession = {
        date: now.toISOString(),
        clockIn: now.toISOString(),
        clockOut: null,
        hours: 0
    };
    
    records.push(currentSession);
    todayRecords.push(currentSession);
    saveRecords();
    
    // Update UI
    currentStatus = 'in';
    updateUI();
    
    // Send to Slack
    try {
        await sendToSlack('clock-in');
    } catch (error) {
        console.error('Failed to send to Slack:', error);
    }
}

// Clock out
async function clockOut() {
    if (currentStatus !== 'in') {
        alert('出勤していません。');
        return;
    }
    
    const now = new Date();
    
    // Update current session
    currentSession.clockOut = now.toISOString();
    currentSession.hours = calculateHours(currentSession.clockIn, currentSession.clockOut);
    
    saveRecords();
    
    // Update UI
    currentStatus = 'out';
    currentSession = null;
    updateUI();
    
    // Send to Slack
    try {
        await sendToSlack('clock-out');
    } catch (error) {
        console.error('Failed to send to Slack:', error);
    }
}

// Send notification to Slack
async function sendToSlack(action) {
    try {
        const response = await fetch('/api/slack-webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                time: new Date().toISOString(),
                hours: action === 'clock-out' ? currentSession.hours : 0
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Slack notification sent:', data);
    } catch (error) {
        console.error('Error sending Slack notification:', error);
        // Continue with the app even if Slack notification fails
    }
}

// Update UI with current data
function updateUI() {
    updateStatusDisplay();
    updateTodayDisplay();
    updateMonthlyDisplay();
    updateRecordsTable();
}

// Update today's display
function updateTodayDisplay() {
    // Get the sessions list element
    const sessionsListEl = document.getElementById('today-sessions');
    sessionsListEl.innerHTML = ''; // Clear previous content
    
    if (todayRecords.length > 0) {
        // For the main display, show the current or latest session
        const latestRecord = currentSession || todayRecords[todayRecords.length - 1];
        
        todayInEl.textContent = latestRecord.clockIn ? formatTime(new Date(latestRecord.clockIn)) : '-';
        todayOutEl.textContent = latestRecord.clockOut ? formatTime(new Date(latestRecord.clockOut)) : '-';
        
        // Calculate total hours for today
        const totalHoursToday = todayRecords.reduce((sum, record) => sum + (record.hours || 0), 0);
        todayHoursEl.textContent = `${totalHoursToday.toFixed(2)} 時間`;
        
        // Create a list of all sessions for today
        if (todayRecords.length > 1 || (todayRecords.length === 1 && todayRecords[0].clockOut)) {
            const sessionsHeader = document.createElement('h3');
            sessionsHeader.textContent = '本日のセッション一覧';
            sessionsListEl.appendChild(sessionsHeader);
            
            // Sort sessions by time (oldest first)
            const sortedSessions = [...todayRecords].sort((a, b) => new Date(a.clockIn) - new Date(b.clockIn));
            
            // Add each session to the list
            sortedSessions.forEach((session, index) => {
                const sessionItem = document.createElement('div');
                sessionItem.className = 'session-item';
                
                const sessionTime = document.createElement('div');
                sessionTime.className = 'session-time';
                
                const clockInTime = formatTime(new Date(session.clockIn));
                const clockOutTime = session.clockOut ? formatTime(new Date(session.clockOut)) : '進行中';
                sessionTime.textContent = `セッション ${index + 1}: ${clockInTime} - ${clockOutTime}`;
                
                const sessionHours = document.createElement('div');
                sessionHours.className = 'session-hours';
                sessionHours.textContent = session.hours ? `${session.hours.toFixed(2)} 時間` : '';
                
                sessionItem.appendChild(sessionTime);
                sessionItem.appendChild(sessionHours);
                sessionsListEl.appendChild(sessionItem);
            });
        }
    } else {
        todayInEl.textContent = '-';
        todayOutEl.textContent = '-';
        todayHoursEl.textContent = '-';
    }
}

// Update monthly display
function updateMonthlyDisplay() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter records for current month
    const monthRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    // Calculate total hours
    const totalHours = monthRecords.reduce((sum, record) => sum + (record.hours || 0), 0);
    const remainingHours = Math.max(0, CONTRACT_HOURS - totalHours);
    const progressPercentage = Math.min(100, (totalHours / CONTRACT_HOURS) * 100);
    
    // Update display
    monthlyHoursEl.textContent = totalHours.toFixed(2);
    remainingHoursEl.textContent = remainingHours.toFixed(2);
    progressBarEl.style.width = `${progressPercentage}%`;
    
    // Change progress bar color based on percentage
    if (progressPercentage < 50) {
        progressBarEl.style.backgroundColor = '#3498db'; // Blue
    } else if (progressPercentage < 80) {
        progressBarEl.style.backgroundColor = '#f39c12'; // Orange
    } else if (progressPercentage < 100) {
        progressBarEl.style.backgroundColor = '#e67e22'; // Dark Orange
    } else {
        progressBarEl.style.backgroundColor = '#27ae60'; // Green
    }
}

// Update records table
function updateRecordsTable() {
    // Clear table
    recordsBodyEl.innerHTML = '';
    
    // Sort records by date and time (newest first)
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add records to table
    sortedRecords.forEach(record => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(new Date(record.date));
        
        const clockInCell = document.createElement('td');
        clockInCell.textContent = record.clockIn ? formatTime(new Date(record.clockIn)) : '-';
        
        const clockOutCell = document.createElement('td');
        clockOutCell.textContent = record.clockOut ? formatTime(new Date(record.clockOut)) : '-';
        
        const hoursCell = document.createElement('td');
        hoursCell.textContent = record.hours ? `${record.hours} 時間` : '-';
        
        row.appendChild(dateCell);
        row.appendChild(clockInCell);
        row.appendChild(clockOutCell);
        row.appendChild(hoursCell);
        
        recordsBodyEl.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    clockInBtn.addEventListener('click', clockIn);
    clockOutBtn.addEventListener('click', clockOut);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
        console.error('Initialization error:', error);
    });
});
