import { DailyLog, UserSettings } from '../types';

const LOGS_KEY = 'soberstats_logs';
const SETTINGS_KEY = 'soberstats_settings';

export const getLogs = (): DailyLog[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const saveLog = (log: DailyLog): DailyLog[] => {
  const logs = getLogs();
  // Check if update or new
  const existingIndex = logs.findIndex(l => l.id === log.id);
  
  let newLogs;
  if (existingIndex >= 0) {
    newLogs = [...logs];
    newLogs[existingIndex] = log;
  } else {
    newLogs = [...logs, log];
  }
  
  // Sort by date descending
  newLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
  return newLogs;
};

export const deleteLog = (id: string): DailyLog[] => {
  const logs = getLogs().filter(l => l.id !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return logs;
};

export const getSettings = (): UserSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return JSON.parse(stored);
  return { name: 'User', familyMode: false };
};

export const saveSettings = (settings: UserSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Seeder for demo purposes
export const seedData = () => {
  if (getLogs().length > 0) return;
  
  const logs: DailyLog[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Simulate tapering off alcohol, stabilizing benzo
    const alcoholConsumed = i > 10; // Drank 10+ days ago
    const alcoholUnits = alcoholConsumed ? Math.floor(Math.random() * 5) + 2 : 0;
    
    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      alcoholConsumed,
      alcoholUnits,
      medications: [
        { medicationId: 'diazepam', amount: 10 + (i > 20 ? 5 : 0) } // Tapering diazepam slightly
      ],
      mood: Math.floor(Math.random() * 6) + 3, // Random mood 3-9
      timestamp: d.getTime(),
      notes: i === 0 ? "Feeling okay today." : ""
    });
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};