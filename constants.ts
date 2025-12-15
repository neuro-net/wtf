import { MedicationReference } from './types';

export const BENZO_DATA: MedicationReference[] = [
  {
    id: 'alprazolam',
    name: 'Alprazolam (Xanax)',
    halfLifeHours: '11-12',
    diazepamEquivalence: 20,
    unit: 'mg',
    color: '#ff00ff' // Neon Magenta
  },
  {
    id: 'clonazepam',
    name: 'Clonazepam (Klonopin)',
    halfLifeHours: '18-50',
    diazepamEquivalence: 20, 
    unit: 'mg',
    color: '#00ffff' // Neon Cyan
  },
  {
    id: 'diazepam',
    name: 'Diazepam (Valium)',
    halfLifeHours: '20-100',
    diazepamEquivalence: 1, 
    unit: 'mg',
    color: '#ffff00' // Neon Yellow
  },
  {
    id: 'lorazepam',
    name: 'Lorazepam (Ativan)',
    halfLifeHours: '10-20',
    diazepamEquivalence: 10, 
    unit: 'mg',
    color: '#00ff00' // Neon Green
  },
  {
    id: 'oxazepam',
    name: 'Oxazepam (Serax)',
    halfLifeHours: '4-15',
    diazepamEquivalence: 0.5, 
    unit: 'mg',
    color: '#3b82f6' // Bright Blue
  },
  {
    id: 'chlordiazepoxide',
    name: 'Chlordiazepoxide (Librium)',
    halfLifeHours: '5-30',
    diazepamEquivalence: 0.4, 
    unit: 'mg',
    color: '#f97316' // Bright Orange
  },
  {
    id: 'temazepam',
    name: 'Temazepam (Restoril)',
    halfLifeHours: '8-22',
    diazepamEquivalence: 0.5, 
    unit: 'mg',
    color: '#ec4899' // Pink
  },
  {
    id: 'other',
    name: 'Other',
    halfLifeHours: 'N/A',
    diazepamEquivalence: 0,
    unit: 'mg',
    color: '#94a3b8' // Slate-400
  }
];