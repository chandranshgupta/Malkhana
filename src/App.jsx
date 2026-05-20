import React, { useState, useEffect } from 'react';
import { Archive, Lock, ShieldCheck, FileText, Settings, Plus, Search, ScanLine, History, CheckCircle2, LogOut } from 'lucide-react';
import { BlueprintBackground } from './components/shared/BlueprintBackground';
import { EvidenceLog } from './components/EvidenceLog/EvidenceLog';
import { ActiveCustodyBoard } from './components/ActiveCustody/ActiveCustodyBoard';
import { SealedArchiveMatrix } from './components/SealedArchive/SealedArchiveMatrix';
import { ReportsDraftingTable } from './components/Reports/ReportsDraftingTable';
import { SystemSettings } from './components/SystemSettings/SystemSettings';
import { NewIngestionWorkflow } from './components/NewIngestion/NewIngestionWorkflow';
import { AuditTrail } from './components/Audit/AuditTrail';
import { FormCC1PrintSheet } from './components/Reports/FormCC1PrintSheet';
import { getAllUsers, authenticateUser, getSettings } from './api/invoke';

function LoginScreen({ users, onLoginSuccess }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) return;

    const checkLockout = () => {
      const remaining = new Date(lockoutUntil).getTime() - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setTimeLeft('');
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s`);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Set default selected user
  useEffect(() => {
    if (users && users.length > 0 && !selectedUser) {
      setSelectedUser(users[0].username);
    }
  }, [users, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutUntil) return;

    try {
      setError('');
      const authenticatedUser = await authenticateUser(selectedUser, password);
      onLoginSuccess(authenticatedUser);
    } catch (err) {
      console.error("Login failed:", err);
      if (err.startsWith('ACCOUNT_LOCKED|')) {
        const lockoutTime = err.split('|')[1];
        setLockoutUntil(lockoutTime);
        setError('ACCOUNT LOCKED OUT DUE TO EXCESSIVE FAILED ATTEMPTS');
      } else if (err.startsWith('INVALID_CREDENTIALS|')) {
        const attemptsLeft = err.split('|')[1];
        setError(`INVALID PASSWORD. ACCESS DENIED (${attemptsLeft} ATTEMPTS REMAINING)`);
      } else {
        setError(err.toUpperCase());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-200 font-mono">
      {/* Blueprint background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(to right, rgba(14, 165, 233, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.15) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Secure Auth container */}
      <div className="w-full max-w-md border-2 border-[#0ea5e9] bg-slate-900/90 p-8 shadow-[0_0_50px_rgba(14,165,233,0.3)] relative overflow-hidden">
        
        {/* Neon target crosshair lines */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#0ea5e9]"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#0ea5e9]"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#0ea5e9]"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#0ea5e9]"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-block border border-[#0ea5e9]/40 px-2 py-0.5 text-[10px] text-[#0ea5e9] font-bold tracking-widest bg-slate-950 mb-3">
            SECURE ACCESS PORTAL
          </div>
          <h2 className="text-2xl font-black tracking-widest text-[#0ea5e9]">MALKHANA_VAULT</h2>
          <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Section 63 BSA Forensic Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">
              SELECT OPERATOR
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200 outline-none focus:border-[#0ea5e9] font-bold uppercase"
            >
              {users.map(u => (
                <option key={u.id} value={u.username} className="bg-slate-900">
                  {u.full_name || u.username} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">
              CREDENTIAL_KEY (PASSWORD)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!!lockoutUntil}
              placeholder="ENTER SECURE PASSWORD"
              className="w-full bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-[#0ea5e9] font-bold tracking-widest"
            />
          </div>

          {error && (
            <div className={`p-3 border text-xs font-bold leading-relaxed flex flex-col gap-1 ${lockoutUntil ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-amber-950/40 border-amber-500 text-amber-400'}`}>
              <div>[!] {error}</div>
              {lockoutUntil && (
                <div className="text-sm font-black mt-2 text-center text-red-500 animate-pulse">
                  VAULT LOCKED: {timeLeft}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!!lockoutUntil}
            className={`w-full py-4 font-bold tracking-widest transition-all ${
              lockoutUntil 
                ? 'bg-red-950 border border-red-500/50 text-red-500 cursor-not-allowed' 
                : 'bg-[#0ea5e9] text-slate-950 hover:bg-[#38bdf8] shadow-[4px_4px_0px_rgba(14,165,233,0.3)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'
            }`}
          >
            {lockoutUntil ? 'PORTAL_LOCKED_OUT' : 'AUTHENTICATE_VAULT'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[8px] text-slate-600 flex justify-between tracking-widest uppercase">
          <span>HOST: LOCAL_VAULT</span>
          <span>CYPHER: AES-256-SQLCIPHER</span>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('EVIDENCE_LOG');
  const [printEvidenceId, setPrintEvidenceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCertEvidenceId, setActiveCertEvidenceId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: 'op_092',
    username: 'op_092',
    full_name: 'OPERATOR_092',
    designation: 'Malkhana In-charge',
    role: 'MALKHANA_INCHARGE'
  });

  // Load all users from DB
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const list = await getAllUsers();
        setUsers(list);
        if (list.length > 0) {
          const defaultOp = list.find(u => u.id === 'op_092') || list[0];
          setCurrentUser(defaultOp);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    fetchUsers();
  }, []);

  const [localLock, setLocalLock] = useState(false);

  // Load local_lock setting and listen to settings changes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsStr = await getSettings();
        const settings = JSON.parse(settingsStr);
        const lockSetting = settings.find(s => s.key === 'local_lock');
        if (lockSetting) {
          setLocalLock(lockSetting.value === 'true');
        }
      } catch (err) {
        console.error("Failed to fetch settings for auto-lock:", err);
      }
    };
    fetchSettings();

    const handleSettingChange = (e) => {
      setLocalLock(e.detail);
    };
    window.addEventListener('setting-local_lock-changed', handleSettingChange);
    return () => {
      window.removeEventListener('setting-local_lock-changed', handleSettingChange);
    };
  }, []);

  // Idle Timer (5 mins auto-lock) & Blur Screen Lock
  useEffect(() => {
    if (!isLoggedIn) return;

    let timeoutId;
    let blurTimeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLoggedIn(false);
      }, 5 * 60 * 1000); // 5 minutes
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, resetTimer);
    });

    const handleWindowBlur = () => {
      if (localLock) {
        setIsLoggedIn(false);
      } else {
        // Start a 5-minute background auto-lock timer when window is blurred
        if (blurTimeoutId) clearTimeout(blurTimeoutId);
        blurTimeoutId = setTimeout(() => {
          setIsLoggedIn(false);
        }, 5 * 60 * 1000); // 5 minutes grace period
      }
    };

    const handleWindowFocus = () => {
      // Clear the background auto-lock timer when user focuses the window again
      if (blurTimeoutId) {
        clearTimeout(blurTimeoutId);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (blurTimeoutId) clearTimeout(blurTimeoutId);
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, resetTimer);
      });
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLoggedIn, localLock]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-mono text-slate-800 flex overflow-hidden selection:bg-slate-300 selection:text-slate-900">
      <BlueprintBackground />

      {/* Render secure auth overlay if not logged in */}
      {!isLoggedIn && <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />}
      
      {/* Sidebar - z-10 index to allow modal z-stack overlays */}
      <div className="w-64 border-r border-slate-400 bg-opacity-50 flex flex-col pt-6 pb-6 z-10 relative bg-[#f4f7f9]">
        <div className="px-6 mb-8 flex flex-col gap-2 z-40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-500 flex-shrink-0">
              <div className="text-slate-200 text-[10px] text-center leading-tight font-black">
                {currentUser.id.substring(0, 4).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs truncate">{currentUser.full_name || currentUser.username}</div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser.designation || currentUser.role}</div>
            </div>
            
            {/* Brutalist Logout Button */}
            <button 
              onClick={handleLogout} 
              title="Lock Vault Portal"
              className="p-1 border border-slate-400 bg-white hover:bg-slate-100 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <button onClick={() => setCurrentView('EVIDENCE_LOG')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'EVIDENCE_LOG' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Archive size={16} /> EVIDENCE_LOG
          </button>
          <button onClick={() => setCurrentView('ACTIVE_CUSTODY')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'ACTIVE_CUSTODY' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Lock size={16} /> ACTIVE_CUSTODY
          </button>
          <button onClick={() => setCurrentView('SEALED_ARCHIVE')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SEALED_ARCHIVE' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <ShieldCheck size={16} /> SEALED_ARCHIVE
          </button>
          <button onClick={() => setCurrentView('REPORTS')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'REPORTS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <FileText size={16} /> REPORTS
          </button>
          <button onClick={() => setCurrentView('AUDIT_TRAIL')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'AUDIT_TRAIL' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <History size={16} /> AUDIT_TRAIL
          </button>
          <button onClick={() => setCurrentView('SYSTEM_SETTINGS')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SYSTEM_SETTINGS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'} mt-4`}>
            <Settings size={16} /> SYSTEM_SETTINGS
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <button onClick={() => setCurrentView('NEW_INGESTION')} className={`w-full flex items-center justify-center gap-2 py-3 border font-bold text-sm transition-all ${currentView === 'NEW_INGESTION' ? 'border-slate-800 bg-slate-800 text-white shadow-[2px_2px_0px_rgba(100,116,139,0.5)]' : 'border-slate-500 bg-white hover:bg-slate-50 shadow-[2px_2px_0px_rgba(100,116,139,0.5)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]'}`}>
            <Plus size={16} /> NEW_INGESTION
          </button>
        </div>
      </div>
      
      {/* Main Panel - z-20 layout stack */}
      <main className="flex-1 flex flex-col relative z-20 h-screen overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-400 py-4 px-8 flex items-center justify-between bg-[#f4f7f9] z-20 relative flex-shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-widest text-slate-800">MALKHANA_VAULT</h1>
            <nav className="hidden xl:flex items-center gap-6 text-xs font-bold pt-1">
              <button onClick={() => setCurrentView('EVIDENCE_LOG')} className={`transition-colors uppercase tracking-widest ${currentView === 'EVIDENCE_LOG' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>EVIDENCE_LOG</button>
              <button onClick={() => setCurrentView('ACTIVE_CUSTODY')} className={`transition-colors uppercase tracking-widest ${currentView === 'ACTIVE_CUSTODY' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>ACTIVE_CUSTODY</button>
              <button onClick={() => setCurrentView('SEALED_ARCHIVE')} className={`transition-colors uppercase tracking-widest ${currentView === 'SEALED_ARCHIVE' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>SEALED_ARCHIVE</button>
              <button onClick={() => setCurrentView('REPORTS')} className={`transition-colors uppercase tracking-widest ${currentView === 'REPORTS' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>REPORTS</button>
              <button onClick={() => setCurrentView('AUDIT_TRAIL')} className={`transition-colors uppercase tracking-widest ${currentView === 'AUDIT_TRAIL' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>AUDIT_TRAIL</button>
              <button onClick={() => setCurrentView('NEW_INGESTION')} className={`transition-colors uppercase tracking-widest ${currentView === 'NEW_INGESTION' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>NEW_INGESTION</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Global Search - Hidden in Sealed Archive as it has its own target search */}
            {currentView !== 'SEALED_ARCHIVE' && (
              <div className="relative flex items-center border-b border-slate-400 pb-1 w-64">
                <Search size={14} className="text-slate-400 absolute left-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="GLOBAL_CASE_SEARCH" 
                  className="bg-transparent border-none outline-none w-full pl-6 text-xs uppercase placeholder-slate-400 font-mono" 
                />
              </div>
            )}
            <button className="text-slate-600 hover:text-slate-800"><ScanLine size={18} /></button>
            <button onClick={() => setCurrentView('AUDIT_TRAIL')} className={`hover:text-slate-800 transition-colors ${currentView === 'AUDIT_TRAIL' ? 'text-[#0ea5e9]' : 'text-slate-600'}`} title="View Merkle Audit Trail">
              <History size={18} />
            </button>
          </div>
        </header>
        
        {/* View Switcher */}
        {currentView === 'EVIDENCE_LOG' && (
          <EvidenceLog 
            setCurrentView={setCurrentView} 
            currentUser={currentUser} 
            searchQuery={searchQuery} 
            onDraftCertificate={(id) => {
              setActiveCertEvidenceId(id);
              setCurrentView('REPORTS');
            }} 
          />
        )}
        {currentView === 'ACTIVE_CUSTODY' && <ActiveCustodyBoard currentUser={currentUser} />}
        {currentView === 'SEALED_ARCHIVE' && <SealedArchiveMatrix currentUser={currentUser} onPrintCC1={(id) => { setPrintEvidenceId(id); setCurrentView('PRINT_CC1'); }} />}
        {currentView === 'REPORTS' && (
          <ReportsDraftingTable 
            currentUser={currentUser} 
            initialEvidenceId={activeCertEvidenceId} 
            onClearInitial={() => setActiveCertEvidenceId(null)} 
          />
        )}
        {currentView === 'SYSTEM_SETTINGS' && <SystemSettings currentUser={currentUser} />}
        {currentView === 'NEW_INGESTION' && <NewIngestionWorkflow setCurrentView={setCurrentView} currentUser={currentUser} />}
        {currentView === 'AUDIT_TRAIL' && <AuditTrail onBack={() => setCurrentView('EVIDENCE_LOG')} />}
        {currentView === 'PRINT_CC1' && <FormCC1PrintSheet evidenceId={printEvidenceId} onBack={() => setCurrentView('SEALED_ARCHIVE')} />}

        {/* Bottom Metrics (Hidden on complex views to maximize space) */}
        {['EVIDENCE_LOG', 'ACTIVE_CUSTODY', 'SEALED_ARCHIVE'].includes(currentView) && (
          <div className="border-t border-slate-400 p-6 bg-[#f4f7f9] z-20 relative flex justify-between gap-4 mt-auto flex-shrink-0">
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-400"></div>
               <div className="text-[10px] font-bold text-slate-500 mb-1">STORAGE_UTILIZATION</div>
               <div className="text-3xl font-light">74.2 <span className="text-sm font-bold">TB</span></div>
               <div className="w-full bg-slate-200 h-1 mt-2"><div className="bg-slate-700 h-1 w-[74%]"></div></div>
            </div>
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-400"></div>
               <div className="text-[10px] font-bold text-slate-500 mb-1">ACTIVE_CUSTODY_ITEMS</div>
               <div className="text-3xl font-light">1,204</div>
            </div>
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="text-[10px] font-bold text-slate-500 mb-1">SEALED_ARCHIVE_COUNT</div>
               <div className="text-3xl font-light">18,592</div>
            </div>
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-400"></div>
               <div className="text-[10px] font-bold text-slate-500 mb-1">SYSTEM_HEALTH_INDEX</div>
               <div className="text-3xl font-light flex items-center gap-2">0.99 <CheckCircle2 size={24} className="text-slate-500" strokeWidth={1.5} /></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}