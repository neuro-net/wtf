import React, { useEffect, useState, useMemo } from 'react';
import { DailyLog, UserSettings } from '../types';
import { generateHealthInsight } from '../services/geminiService';
import { BENZO_DATA } from '../constants';
import { Activity, Droplets, Pill, CalendarCheck, Sparkles, Loader2, TrendingDown, TrendingUp, Minus, Terminal } from 'lucide-react';

interface DashboardProps {
  logs: DailyLog[];
  settings: UserSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, settings }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (logs.length > 0 && !insight) {
        setLoadingInsight(true);
        const result = await generateHealthInsight(logs);
        setInsight(result);
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [logs.length]);

  const todayStr = new Date().toISOString().split('T')[0];
  const loggedToday = logs.some(l => l.date === todayStr);

  let alcoholFreeStreak = 0;
  for (const log of logs) {
    if (!log.alcoholConsumed) {
      alcoholFreeStreak++;
    } else {
      break;
    }
  }

  const last7Days = logs.slice(0, 7);
  const medTotals: Record<string, number> = {};

  last7Days.forEach(log => {
    log.medications.forEach(med => {
      medTotals[med.medicationId] = (medTotals[med.medicationId] || 0) + med.amount;
    });
  });

  const topMedAverages = Object.entries(medTotals).map(([id, total]) => {
    const info = BENZO_DATA.find(b => b.id === id);
    return {
      name: info?.name.split('(')[0].trim() || id,
      unit: info?.unit || 'mg',
      color: info?.color || '#cbd5e1',
      avg: (total / (last7Days.length || 1)).toFixed(1)
    };
  }).sort((a, b) => Number(b.avg) - Number(a.avg));

  const trendData = useMemo(() => {
    const currentPeriod = logs.slice(0, 7);
    const prevPeriod = logs.slice(7, 14);
    
    const getAvg = (periodLogs: DailyLog[], medId: string) => {
      const total = periodLogs.reduce((sum, log) => {
        const entry = log.medications.find(m => m.medicationId === medId);
        return sum + (entry ? entry.amount : 0);
      }, 0);
      return periodLogs.length > 0 ? total / periodLogs.length : 0;
    };

    return BENZO_DATA.map(med => {
      const currAvg = getAvg(currentPeriod, med.id);
      const prevAvg = getAvg(prevPeriod, med.id);
      const diff = currAvg - prevAvg;
      
      let trendType: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
      if (diff > 0.05) trendType = 'UP';
      if (diff < -0.05) trendType = 'DOWN';

      return {
        ...med,
        currAvg: currAvg.toFixed(2),
        prevAvg: prevAvg.toFixed(2),
        trendType,
        hasData: currAvg > 0 || prevAvg > 0
      };
    }).filter(item => item.hasData); 
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 border-b border-red-900 pb-4">
        <h1 className="text-3xl font-bold text-red-500 uppercase tracking-[0.1em] text-shadow-red">
          Target: {settings.name}
        </h1>
        <p className="text-red-800 text-xs tracking-widest mt-1">STATUS: RECOVERY PROTOCOL ACTIVE</p>
      </header>

      {/* AI Insight Card */}
      <div className="border border-red-500 bg-red-950/10 p-6 relative overflow-hidden group hover:bg-red-950/20 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <Terminal size={64} className="text-red-500" />
        </div>
        <h3 className="flex items-center gap-2 text-red-500 font-bold mb-4 uppercase tracking-wider text-sm border-b border-red-900/50 pb-2 w-fit">
          <Sparkles size={16} /> Tactical Analysis (AI)
        </h3>
        {loadingInsight ? (
           <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse">
             <Loader2 className="animate-spin" size={16} /> PROCESSING DATA STREAM...
           </div>
        ) : (
          <p className="text-red-100 font-mono leading-relaxed text-sm">
            <span className="text-red-500 mr-2">{'>'}</span>
            {insight || "INSUFFICIENT DATA FOR ANALYSIS. CONTINUE LOGGING."}
            <span className="animate-pulse ml-1">_</span>
          </p>
        )}
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Log Status */}
        <div className={`p-6 border ${loggedToday ? 'border-green-500 bg-green-900/10' : 'border-red-900 bg-black'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 border ${loggedToday ? 'border-green-500 text-green-500' : 'border-red-800 text-red-800'}`}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Daily Log</p>
          <h4 className={`text-2xl font-bold mt-1 ${loggedToday ? 'text-green-500' : 'text-red-500'}`}>
            {loggedToday ? "COMPLETE" : "PENDING"}
          </h4>
        </div>

        {/* Card 2: Alcohol Free Streak */}
        <div className="p-6 border border-red-900 bg-black relative">
           <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-red-900"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 border border-cyan-700 text-cyan-500">
              <Droplets size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Sober Streak</p>
          <h4 className="text-2xl font-bold text-cyan-400 mt-1">
            {alcoholFreeStreak} <span className="text-xs font-normal text-cyan-700">DAYS</span>
          </h4>
        </div>

        {/* Card 3: Top Med Summary */}
        <div className="p-6 border border-red-900 bg-black">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 border border-purple-700 text-purple-500">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Primary Load</p>
          
          {topMedAverages.length > 0 ? (
            <div>
              <h4 className="text-2xl font-bold text-purple-400 mt-1">
                {topMedAverages[0].avg} <span className="text-xs font-normal text-purple-700">{topMedAverages[0].unit}</span>
              </h4>
              <p className="text-[10px] text-red-600 mt-1 uppercase">{topMedAverages[0].name}</p>
            </div>
          ) : (
             <h4 className="text-2xl font-bold text-red-800 mt-1">0 mg</h4>
          )}
        </div>

        {/* Card 4: Total Entries */}
        <div className="p-6 border border-red-900 bg-black">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 border border-red-800 text-red-800">
              <Pill size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Data Points</p>
          <h4 className="text-2xl font-bold text-red-500 mt-1">
            {logs.length}
          </h4>
        </div>
      </div>

      {/* Trend Section */}
      <div className="border border-red-900 bg-black">
        <div className="p-4 border-b border-red-900 bg-red-950/20 flex justify-between items-center">
          <h3 className="text-md font-bold text-red-500 flex items-center gap-2 uppercase tracking-widest">
              <Activity size={18} /> 
              7-Day Trends
          </h3>
          <span className="text-[10px] text-red-800 uppercase animate-pulse">Live Feed</span>
        </div>
        
        <div>
          {trendData.length === 0 ? (
            <div className="p-8 text-center text-red-900 uppercase text-sm">No recent data streams found.</div>
          ) : (
            <div className="divide-y divide-red-900/50">
              {trendData.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-red-900/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                    <div>
                      <p className="font-bold text-red-100 text-sm uppercase">{item.name}</p>
                      <p className="text-[10px] text-red-800">PREV AVG: {item.prevAvg}mg</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <span className="text-xl font-bold text-white">{item.currAvg}</span>
                       <span className="text-xs text-red-700 ml-1">mg/day</span>
                    </div>
                    
                    <div className={`flex items-center gap-1 px-2 py-1 border text-xs font-bold w-24 justify-center uppercase
                      ${item.trendType === 'DOWN' ? 'border-green-600 text-green-500 bg-green-900/20' : ''}
                      ${item.trendType === 'UP' ? 'border-red-600 text-red-500 bg-red-900/20' : ''}
                      ${item.trendType === 'FLAT' ? 'border-red-900 text-red-800' : ''}
                    `}>
                      {item.trendType === 'DOWN' && <><TrendingDown size={14} /> </>}
                      {item.trendType === 'UP' && <><TrendingUp size={14} /> </>}
                      {item.trendType === 'FLAT' && <><Minus size={14} /> </>}
                      {item.trendType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};