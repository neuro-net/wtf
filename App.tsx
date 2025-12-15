import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, BarChart2, BookOpen, Settings, Menu, X, Cpu, Radio, Lock } from 'lucide-react';
import { ViewState, DailyLog, UserSettings } from './types';
import { getLogs, saveLog, getSettings, saveSettings } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { Tracker } from './components/Tracker';
import { Statistics } from './components/Statistics';
import { Reference } from './components/Reference';
import { SettingsView } from './components/SettingsView';
import { LockScreen } from './components/LockScreen';
import { THEMES } from './constants';

// Helper to convert hex to rgb for Tailwind opacity utilities
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '239, 68, 68';
};

function App() {
  // Initialize settings immediately to prevent flash of unlocked content
  const [settings, setSettingsState] = useState<UserSettings>(() => getSettings());
  const [logs, setLogs] = useState<DailyLog[]>([]);
  
  // Auth state: If password exists, start locked (false). If no password, start unlocked (true).
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !getSettings().password);
  
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize data (runs once)
  useEffect(() => {
    setLogs(getLogs());
    // We update settings again in useEffect to ensure sync, though lazy init covers initial render
    setSettingsState(getSettings());
  }, []);

  // Apply Theme CSS Variables
  useEffect(() => {
    const theme = THEMES[settings.theme] || THEMES['red_alert'];
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-rgb', hexToRgb(theme.primary));
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--bg', theme.background);
    root.style.setProperty('--muted-bg', theme.mutedBg);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--chart-grid', theme.chartGrid);
  }, [settings.theme]);

  const handleSaveLog = (log: DailyLog) => {
    const updatedLogs = saveLog(log);
    setLogs(updatedLogs);
    setView(ViewState.DASHBOARD);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // If locked, show Lock Screen
  if (!isAuthenticated && settings.password) {
    return (
      <LockScreen 
        correctPassword={settings.password} 
        onUnlock={() => setIsAuthenticated(true)} 
      />
    );
  }

  const NavItem = ({ target, icon: Icon, label }: { target: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(target);
        setIsMobileMenuOpen(false);
      }}
      className={`group flex items-center gap-3 w-full px-4 py-3 text-lg font-medium transition-all border-l-2 ${
        view === target 
          ? 'border-[var(--primary)] bg-[var(--muted-bg)] text-[var(--primary)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
          : 'border-transparent text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--muted-bg)]'
      }`}
    >
      <Icon size={20} className={view === target ? 'animate-pulse' : ''} />
      <span className="tracking-widest uppercase">{label}</span>
      {view === target && <span className="ml-auto text-xs animate-pulse">●</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--primary)] font-mono flex selection:bg-[var(--primary)] selection:text-[var(--bg)]">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)] px-4 py-3 flex justify-between items-center shadow-[0_4px_20px_rgba(var(--primary-rgb),0.1)]">
        <h1 className="text-xl font-bold text-[var(--primary)] tracking-[0.2em] flex items-center gap-2">
          <Cpu size={20} /> WTF_SYS
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[var(--primary)] hover:bg-[var(--muted-bg)]">
           {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 h-screen w-72 bg-[var(--bg)] border-r border-[var(--border)] p-0 flex flex-col z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-[var(--border)] mb-4 bg-[var(--muted-bg)]">
          <h1 className="text-4xl font-black italic text-[var(--primary)] tracking-tighter flex items-center gap-2 animate-pulse" style={{ textShadow: '0 0 10px rgba(var(--primary-rgb), 0.8)' }}>
            WTF
          </h1>
          <p className="text-xs text-[var(--secondary)] mt-2 tracking-widest">NEURAL NET LINKED</p>
          <p className="text-xs text-[var(--secondary)] tracking-widest">SYS.VER.1.0.4</p>
        </div>

        <nav className="flex-1 space-y-1 mt-4">
          <NavItem target={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem target={ViewState.TRACKER} icon={PlusCircle} label="Input_Log" />
          <NavItem target={ViewState.STATISTICS} icon={BarChart2} label="Analytics" />
          <NavItem target={ViewState.REFERENCE} icon={BookOpen} label="Database" />
          <NavItem target={ViewState.SETTINGS} icon={Settings} label="System_Cfg" />
        </nav>

        <div className="p-6 border-t border-[var(--border)] space-y-6">
           <div className="flex items-center gap-3 text-[var(--secondary)] text-xs uppercase tracking-widest">
             <Radio size={14} className="animate-pulse" />
             <span>Online</span>
           </div>
           
           {/* Lock Button (Manually lock) */}
           {settings.password && (
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="w-full py-2 border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <Lock size={12} /> Lock Terminal
              </button>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto max-w-7xl mx-auto w-full relative">
        {/* Decorative Corner bits */}
        <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-[var(--border)] pointer-events-none md:block hidden"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-[var(--border)] pointer-events-none md:block hidden"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-[var(--border)] pointer-events-none md:block hidden"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-[var(--border)] pointer-events-none md:block hidden"></div>

        {settings.familyMode && view !== ViewState.SETTINGS && (
           <div className="border border-yellow-600 text-yellow-500 bg-yellow-900/10 px-4 py-2 mb-8 text-sm flex items-center gap-2 tracking-widest uppercase">
             <Settings size={14} /> RESTRICTED VIEWING MODE ACTIVE
           </div>
        )}

        {view === ViewState.DASHBOARD && <Dashboard logs={logs} settings={settings} />}
        {view === ViewState.TRACKER && <Tracker onSave={handleSaveLog} readOnly={settings.familyMode} logs={logs} />}
        {view === ViewState.STATISTICS && <Statistics logs={logs} />}
        {view === ViewState.REFERENCE && <Reference />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSaveSettings={handleSaveSettings} />}
      </main>
    </div>
  );
}

export default App;