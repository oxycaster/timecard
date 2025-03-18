const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Path to records file
const RECORDS_FILE = path.join(__dirname, 'data', 'records.json');

const app = express();
const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Middleware
app.use(express.static(path.join(__dirname, '.')));
app.use(bodyParser.json());

// Helper function to read records from file
function readRecordsFromFile() {
    try {
        if (!fs.existsSync(RECORDS_FILE)) {
            fs.writeFileSync(RECORDS_FILE, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(RECORDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading records file:', error);
        return [];
    }
}

// Helper function to write records to file
function writeRecordsToFile(records) {
    try {
        const data = JSON.stringify(records, null, 2);
        fs.writeFileSync(RECORDS_FILE, data, 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing records file:', error);
        return false;
    }
}

// API endpoint to get records
app.get('/api/records', (req, res) => {
    const records = readRecordsFromFile();
    res.json(records);
});

// API endpoint to save records
app.post('/api/records', (req, res) => {
    const records = req.body;
    
    if (!Array.isArray(records)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid records format' 
        });
    }
    
    const success = writeRecordsToFile(records);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save records' 
        });
    }
});

// API endpoint for Slack webhook
app.post('/api/slack-webhook', async (req, res) => {
    try {
        const { action, time, hours } = req.body;
        
        if (!SLACK_WEBHOOK_URL) {
            return res.status(500).json({ 
                success: false, 
                message: 'Slack webhook URL not configured' 
            });
        }
        
        const timestamp = new Date(time);
        const formattedTime = timestamp.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let message = '';
        
        if (action === 'clock-in') {
            message = `🟢 *出勤しました* - ${formattedTime}`;
        } else if (action === 'clock-out') {
            message = `🔴 *退勤しました* - ${formattedTime}\n本日の勤務時間: ${hours} 時間`;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action' 
            });
        }
        
        // Send to Slack
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                channel: '#times_hironao',
                text: message
            })
        });
        
        if (!response.ok) {
            throw new Error(`Slack API error: ${response.statusText}`);
        }
        
        return res.json({ success: true });
    } catch (error) {
        console.error('Error sending to Slack:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
