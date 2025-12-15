export interface MedicationReference {
  id: string;
  name: string;
  halfLifeHours: string;
  diazepamEquivalence: number; // 1mg of this = X mg of Diazepam
  unit: string;
  color: string;
}

export interface TakenMedication {
  medicationId: string;
  amount: number; // in mg usually
  customName?: string; // For 'other' category
  reason?: string; // Context for taking the med
}

export interface DailyLog {
  id: string;
  date: string; // ISO Date String YYYY-MM-DD
  alcoholConsumed: boolean;
  alcoholUnits: number;
  medications: TakenMedication[];
  notes?: string;
  mood?: number; // 1-10 scale
  timestamp: number;
}

export interface UserSettings {
  name: string;
  familyMode: boolean; // Read-only mode
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRACKER = 'TRACKER',
  STATISTICS = 'STATISTICS',
  REFERENCE = 'REFERENCE',
  SETTINGS = 'SETTINGS'
}