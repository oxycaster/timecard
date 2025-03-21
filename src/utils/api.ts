import { TimeRecord, SlackConfig } from '../types';

const API_URL = 'http://localhost:3000/api';

export const fetchRecords = async (): Promise<TimeRecord[]> => {
  try {
    const response = await fetch(`${API_URL}/records`);
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }
    const data = await response.json();
    return data.records;
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
};

export const clockIn = async (): Promise<TimeRecord | null> => {
  try {
    const response = await fetch(`${API_URL}/clock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to clock in');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clocking in:', error);
    return null;
  }
};

export const clockOut = async (id: string): Promise<TimeRecord | null> => {
  try {
    const response = await fetch(`${API_URL}/clock-out/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to clock out');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clocking out:', error);
    return null;
  }
};

export const fetchSlackConfig = async (): Promise<SlackConfig> => {
  try {
    const response = await fetch(`${API_URL}/slack-config`);
    if (!response.ok) {
      throw new Error('Failed to fetch Slack configuration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Slack configuration:', error);
    return { 
      webhookUrl: '', 
      channel: '',
      clockInMessage: '🟢 出勤しました (%time%)',
      clockOutMessage: '🔴 退勤しました (%time%)'
    };
  }
};

export const updateSlackConfig = async (config: SlackConfig): Promise<SlackConfig> => {
  try {
    const response = await fetch(`${API_URL}/slack-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to update Slack configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating Slack configuration:', error);
    return { 
      webhookUrl: '', 
      channel: '',
      clockInMessage: '🟢 出勤しました (%time%)',
      clockOutMessage: '🔴 退勤しました (%time%)'
    };
  }
};
