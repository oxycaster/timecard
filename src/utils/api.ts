import { TimeRecord } from '../types';

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
