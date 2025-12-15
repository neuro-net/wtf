import React, { useState, useEffect } from 'react';
import { BENZO_DATA } from '../constants';
import { DailyLog, TakenMedication } from '../types';
import { Plus, Trash2, Save, Calendar, AlertTriangle, Terminal, MessageSquare, BrainCircuit } from 'lucide-react';

interface TrackerProps {
  onSave: (log: DailyLog) => void;
  logs: DailyLog[];
  readOnly?: boolean;
}

export const Tracker: React.FC<TrackerProps> = ({ onSave, logs, readOnly }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(todayStr);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  
  const [alcoholConsumed, setAlcoholConsumed] = useState(false);
  const [alcoholUnits, setAlcoholUnits] = useState(0);
  const [medications, setMedications] = useState<TakenMedication[]>([]);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<number>(5);
  
  const [selectedMedId, setSelectedMedId] = useState(BENZO_DATA[0].id);
  const [customMedName, setCustomMedName] = useState('');
  const [medAmount, setMedAmount] = useState<string>('');
  const [medReason, setMedReason] = useState('');

  // Auto-load data if a log exists for the selected date
  useEffect(() => {
    const foundLog = logs.find(l => l.date === date);
    if (foundLog) {
      setCurrentLogId(foundLog.id);
      setAlcoholConsumed(foundLog.alcoholConsumed);
      setAlcoholUnits(foundLog.alcoholUnits);
      setMedications(foundLog.medications);
      setNotes(foundLog.notes || '');
      setMood(foundLog.mood || 5);
    } else {
      setCurrentLogId(null);
      setAlcoholConsumed(false);
      setAlcoholUnits(0);
      setMedications([]);
      setNotes('');
      setMood(5);
    }
  }, [date, logs]);

  const handleAddMedication = () => {
    if (!medAmount || isNaN(Number(medAmount))) return;
    
    const finalCustomName = selectedMedId === 'other' 
      ? (customMedName.trim() || 'Other') 
      : undefined;

    setMedications([
      ...medications, 
      { 
        medicationId: selectedMedId, 
        amount: Number(medAmount),
        customName: finalCustomName,
        reason: medReason.trim() || undefined
      }
    ]);
    
    setMedAmount('');
    setCustomMedName('');
    setMedReason('');
    if (selectedMedId === 'other') setSelectedMedId(BENZO_DATA[0].id);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyLog = {
      id: currentLogId || Math.random().toString(36).substr(2, 9),
      date,
      alcoholConsumed,
      alcoholUnits: alcoholConsumed ? alcoholUnits : 0,
      medications,
      notes,
      mood,
      timestamp: new Date(date).getTime()
    };
    onSave(newLog);
  };

  if (readOnly) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-800 p-8 text-center border border-red-900 bg-black">
        <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest">Access Denied</h2>
        <p className="font-mono">Read-only protocol engaged.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border border-red-900 bg-black relative shadow-[0_0_30px_rgba(239,68,68,0.1)]">
      {/* Decorative HUD corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-red-500"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-red-500"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-500"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500"></div>

      <div className="p-4 border-b border-red-900 bg-red-950/20 flex items-center gap-2">
        <Terminal size={18} className="text-red-500" />
        <h2 className="text-lg font-bold text-red-500 uppercase tracking-widest">
          Daily_Check_In_Protocol
        </h2>
        {currentLogId && <span className="ml-auto text-xs text-red-400 bg-red-900/20 px-2 py-1 border border-red-500 animate-pulse">EDITING EXISTING ENTRY</span>}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Date Selection */}
        <div>
          <label className="block text-xs font-bold text-red-700 uppercase mb-2 tracking-widest">Timestamp</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 cyber-input text-lg"
            required
          />
        </div>

        {/* Mood Section */}
        <div className="p-4 border border-red-900/50 bg-black">
           <label className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase mb-4 tracking-widest">
             <BrainCircuit size={16} /> Psycho-Emotional Status Level
           </label>
           
           <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMood(val)}
                  className={`flex-1 h-12 border transition-all relative group
                    ${val <= mood 
                      ? 'bg-red-600 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                      : 'bg-black border-red-900/50 hover:bg-red-900/20'
                    }
                  `}
                >
                  <span className={`absolute inset-0 flex items-center justify-center font-bold text-sm
                     ${val <= mood ? 'text-black' : 'text-red-900'}
                  `}>
                    {val}
                  </span>
                </button>
              ))}
           </div>
           <div className="flex justify-between mt-2 text-[10px] text-red-800 uppercase font-bold tracking-widest">
             <span>Critical Failure</span>
             <span>Nominal</span>
             <span>Optimal</span>
           </div>
        </div>

        {/* Medication Section */}
        <div className="p-4 border border-red-900/50 bg-red-950/5 relative">
          <div className="absolute -top-3 left-4 bg-black px-2 text-xs text-red-500 font-bold uppercase tracking-widest">Medication Log</div>
          
          <div className="space-y-2 mb-6 mt-2">
            {medications.map((med, idx) => {
               const medInfo = BENZO_DATA.find(b => b.id === med.medicationId);
               const displayName = med.medicationId === 'other' && med.customName 
                 ? `${med.customName} (Other)`
                 : medInfo?.name;

               return (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-red-900/30 hover:border-red-500/50 transition-colors bg-black gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span className="text-red-500 font-bold">{'>'}</span>
                        <span className="font-medium text-red-100 uppercase">{displayName}</span>
                        <span className="text-red-600 font-mono">[{med.amount}{medInfo?.unit}]</span>
                      </div>
                      {med.reason && (
                        <span className="text-[10px] text-red-400 pl-6 uppercase tracking-wider">
                          // REASON: {med.reason}
                        </span>
                      )}
                    </div>
                    <button type="button" onClick={() => removeMedication(idx)} className="text-red-800 hover:text-red-500 self-end sm:self-center">
                      <Trash2 size={16} />
                    </button>
                 </div>
               );
            })}
            {medications.length === 0 && <p className="text-sm text-red-900 font-mono text-center py-2">{'>'} NULL LIST</p>}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold text-red-800 mb-1 uppercase">Substance</label>
                <select 
                  value={selectedMedId} 
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full p-2.5 cyber-input text-red-100 rounded-none uppercase"
                >
                  {BENZO_DATA.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full sm:w-1/4">
                <label className="block text-xs font-bold text-red-800 mb-1 uppercase">Dosage (mg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0" 
                  value={medAmount}
                  onChange={(e) => setMedAmount(e.target.value)}
                  className="w-full p-2.5 cyber-input text-red-100 rounded-none"
                />
              </div>

              <div className="w-full sm:flex-1">
                 <label className="block text-xs font-bold text-red-800 mb-1 uppercase">Reason (Optional)</label>
                 <input 
                  type="text" 
                  placeholder="e.g., Stress, Sleep..." 
                  value={medReason}
                  onChange={(e) => setMedReason(e.target.value)}
                  className="w-full p-2.5 cyber-input text-red-100 rounded-none uppercase"
                />
              </div>
            </div>
            
            {/* Conditional "Other" Name Input */}
            {selectedMedId === 'other' && (
              <div className="animate-in fade-in">
                <label className="block text-xs font-bold text-red-800 mb-1 uppercase">Specific Name</label>
                <input 
                  type="text" 
                  placeholder="IDENTIFY SUBSTANCE..." 
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  className="w-full p-2.5 cyber-input rounded-none"
                />
              </div>
            )}

            <button 
              type="button" 
              onClick={handleAddMedication}
              className="w-full p-2.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Entry
            </button>
          </div>
        </div>

        {/* Alcohol Section */}
        <div className={`p-4 border transition-colors relative ${alcoholConsumed ? 'border-red-500 bg-red-950/20' : 'border-red-900/50 bg-black'}`}>
           <div className="absolute -top-3 left-4 bg-black px-2 text-xs text-red-500 font-bold uppercase tracking-widest">Alcohol Check</div>
          
          <div className="flex items-center gap-3 mb-4 mt-2">
             <AlertTriangle className={alcoholConsumed ? "text-red-500 animate-pulse" : "text-red-900"} />
             <p className="text-sm text-red-400 font-mono uppercase">Ethanol ingestion detected?</p>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setAlcoholConsumed(false)}
              className={`flex-1 py-3 px-4 font-bold border uppercase tracking-wider transition-all ${!alcoholConsumed ? 'border-green-500 text-green-500 bg-green-900/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-red-900 text-red-900 hover:border-red-700'}`}
            >
              Negative
            </button>
            <button
              type="button"
              onClick={() => setAlcoholConsumed(true)}
              className={`flex-1 py-3 px-4 font-bold border uppercase tracking-wider transition-all ${alcoholConsumed ? 'border-red-500 text-red-500 bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-red-900 text-red-900 hover:border-red-700'}`}
            >
              Affirmative
            </button>
          </div>

          {alcoholConsumed && (
            <div className="animate-in slide-in-from-top-2 pt-4 border-t border-red-900">
              <label className="block text-xs font-bold text-red-500 mb-2 uppercase tracking-widest">
                Unit Count
              </label>
              <input 
                type="number" 
                min="0" 
                step="0.5"
                value={alcoholUnits} 
                onChange={(e) => setAlcoholUnits(Number(e.target.value))}
                className="w-full p-3 cyber-input text-red-500 font-bold"
              />
              <p className="text-[10px] text-red-500 mt-2 uppercase blink">{'>'}{'>'} WARNING: RECOVERY COMPROMISED</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-red-700 mb-2 uppercase tracking-widest">Subjective Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-3 cyber-input resize-none"
            placeholder="ENTER ADDITIONAL DATA..."
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold text-lg uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <Save size={20} /> Commit_Log
        </button>
      </form>
    </div>
  );
};