const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Helper function to convert Date to ISO string (in JST)
const toISOString = (date) => {
  // Add 9 hours to convert from UTC to JST
  const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  return jstDate.toISOString();
};

const app = express();
const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'records.json');

// Helper function to read data
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { records: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { records: [] };
  }
};

// Helper function to write data
const writeData = (data) => {
  try {
    const dirPath = path.dirname(DATA_FILE);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

// Helper function to send Slack notification
const sendSlackNotification = async (message) => {
  if (!SLACK_WEBHOOK_URL) {
    console.log('Slack webhook URL not configured. Skipping notification.');
    return;
  }

  try {
    // Use dynamic import for node-fetch (ES Module)
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message,
        channel: '#timecard-notifications' // Change this to your desired channel
      })
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    console.log('Slack notification sent successfully');
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
};

// API Routes
// Get all records
app.get('/api/records', (req, res) => {
  const data = readData();
  res.json(data);
});

// Clock in
app.post('/api/clock-in', (req, res) => {
  const data = readData();
  const now = new Date();

  // Check if there's already an active session
  const activeSession = data.records.find(record => 
    record.clockOut === null && 
    new Date(record.date).toDateString() === now.toDateString()
  );

  if (activeSession) {
    return res.status(400).json({ error: 'Already clocked in' });
  }

  const newRecord = {
    id: uuidv4(),
    clockIn: toISOString(now),
    clockOut: null,
    date: toISOString(now).split('T')[0]
  };

  data.records.push(newRecord);

  if (writeData(data)) {
    // Send Slack notification
    const timeString = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    sendSlackNotification(`🟢 出勤しました (${timeString})`);

    res.status(201).json(newRecord);
  } else {
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// Clock out
app.post('/api/clock-out/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();

  const recordIndex = data.records.findIndex(record => record.id === id);

  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  if (data.records[recordIndex].clockOut !== null) {
    return res.status(400).json({ error: 'Already clocked out' });
  }

  const now = new Date();
  data.records[recordIndex].clockOut = toISOString(now);

  if (writeData(data)) {
    // Calculate duration in hours and minutes
    const startTime = new Date(data.records[recordIndex].clockIn);
    const endTime = now;
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    // Send Slack notification
    const timeString = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const durationString = `${hours}時間${minutes}分`;
    sendSlackNotification(`🔴 退勤しました (${timeString}) - 勤務時間: ${durationString}`);

    res.json(data.records[recordIndex]);
  } else {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
