import React, { useState, useEffect } from 'react';
import { Settings, BarChart, ShieldCheck, FileSignature, Lock } from 'lucide-react';
import { getSettings, updateSetting, getHardwareInfo, resetDatabase, isPinVaultEnabled, saveEncryptedVaultKey, deletePinVault } from '../../api/invoke';

export const IndustrialToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between border border-slate-400 p-4 bg-white/40 hover:bg-white/60 transition-colors cursor-pointer" onClick={onChange}>
    <span className="font-bold text-[11px] text-slate-800 tracking-widest uppercase">{label}</span>
    <button
      className={`w-12 h-6 border-2 relative transition-all duration-300 ${
        checked
          ? 'border-[#0ea5e9] bg-[#e0f2fe] shadow-[0_0_12px_rgba(14,165,233,0.4)]'
          : 'border-slate-400 bg-slate-200 grayscale'
      }`}
    >
      <div
        className={`absolute top-0 bottom-0 w-1/2 transition-all duration-300 ${
          checked ? 'bg-[#0ea5e9] left-1/2' : 'bg-slate-400 left-0'
        }`}
      />
    </button>
  </div>
);

export const DisabledInput = ({ label, value }) => (
  <div className="bg-slate-200/80 border-l-4 border-slate-400 p-3 opacity-80 pointer-events-none">
    <div className="text-[9px] font-bold text-slate-500 tracking-widest mb-1">{label}</div>
    <div className="text-sm font-black text-slate-800 font-mono">{value}</div>
  </div>
);

export const SystemSettings = () => {
  const [imager, setImager] = useState('dc3dd');
  const [powerMode, setPowerMode] = useState('BALANCED');
  const [gpuOffload, setGpuOffload] = useState(false);
  const [threads, setThreads] = useState(16);
  const [bufferSize, setBufferSize] = useState(4096);

  const [sync, setSync] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [localLock, setLocalLock] = useState(false);

  const [multiSigner, setMultiSigner] = useState(true);
  const [approvalChain, setApprovalChain] = useState(true);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [pinVaultEnabled, setPinVaultEnabled] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinSetupPassword, setPinSetupPassword] = useState('');
  const [pinSetupPin, setPinSetupPin] = useState('');
  const [pinSetupConfirmPin, setPinSetupConfirmPin] = useState('');
  const [pinSetupError, setPinSetupError] = useState('');
  const [pinSetupLoading, setPinSetupLoading] = useState(false);

  // Locked settings from database
  const [lockedSettings, setLockedSettings] = useState({
    timezone: 'UTC+05:30 (IST_FIXED)',
    bsa_section_63_format: 'SEC_63_BSA_2023',
    append_only_audit: 'APPEND_ONLY_STRICT'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        settings.forEach(s => {
          switch(s.key) {
            case 'imager_tool': setImager(s.value); break;
            case 'thread_count': setThreads(parseInt(s.value, 10)); break;
            case 'gpu_offload': setGpuOffload(s.value === 'true'); break;
            case 'power_mode': setPowerMode(s.value); break;
            case 'buffer_size': setBufferSize(parseInt(s.value, 10)); break;
            case 'supabase_sync': setSync(s.value === 'true'); break;
            case 'auto_retry': setAutoRetry(s.value === 'true'); break;
            case 'local_lock': setLocalLock(s.value === 'true'); break;
            case 'multi_signer': setMultiSigner(s.value === 'true'); break;
            case 'approval_chain': setApprovalChain(s.value === 'true'); break;
            case 'timezone': setLockedSettings(p => ({...p, timezone: s.value})); break;
            case 'bsa_section_63_format': setLockedSettings(p => ({...p, bsa_section_63_format: s.value})); break;
            case 'append_only_audit': setLockedSettings(p => ({...p, append_only_audit: s.value})); break;
          }
        });
        const enabled = await isPinVaultEnabled();
        setPinVaultEnabled(enabled);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleUpdate = async (key, value) => {
    try {
      await updateSetting(key, value.toString());
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
    }
  };

  const handleImagerChange = (val) => {
    setImager(val);
    handleUpdate('imager_tool', val);
  };

  const handlePowerModeChange = (val) => {
    setPowerMode(val);
    handleUpdate('power_mode', val);
  };

  const handleGpuOffloadChange = () => {
    const newVal = !gpuOffload;
    setGpuOffload(newVal);
    handleUpdate('gpu_offload', newVal);
  };

  const handleThreadsChange = (e) => {
    const val = e.target.value;
    setThreads(val);
    handleUpdate('thread_count', val);
  };

  const handleBufferSizeChange = (e) => {
    const val = e.target.value;
    setBufferSize(val);
    handleUpdate('buffer_size', val);
  };

  const handleSyncChange = () => {
    const newVal = !sync;
    setSync(newVal);
    handleUpdate('supabase_sync', newVal);
  };

  const handleAutoRetryChange = () => {
    const newVal = !autoRetry;
    setAutoRetry(newVal);
    handleUpdate('auto_retry', newVal);
  };

  const handleLocalLockChange = () => {
    const newVal = !localLock;
    setLocalLock(newVal);
    handleUpdate('local_lock', newVal);
    window.dispatchEvent(new CustomEvent('setting-local_lock-changed', { detail: newVal }));
  };

  const handlePinVaultToggle = async () => {
    if (pinVaultEnabled) {
      if (confirm("DISABLE DEVICE QUICK PIN UNLOCK? THIS WILL DELETE THE ENCRYPTED KEY FILE.")) {
        try {
          await deletePinVault();
          setPinVaultEnabled(false);
        } catch (err) {
          alert("Error: " + err);
        }
      }
    } else {
      setPinSetupPassword('');
      setPinSetupPin('');
      setPinSetupConfirmPin('');
      setPinSetupError('');
      setShowPinSetup(true);
    }
  };

  const handlePinSetupSubmit = async (e) => {
    e.preventDefault();
    if (!pinSetupPassword) {
      setPinSetupError('MASTER PASSWORD IS REQUIRED');
      return;
    }
    if (pinSetupPin.length !== 6 || !/^\d+$/.test(pinSetupPin)) {
      setPinSetupError('PIN MUST BE EXACTLY 6 DIGITS');
      return;
    }
    if (pinSetupPin !== pinSetupConfirmPin) {
      setPinSetupError('PIN CONFIRMATION DOES NOT MATCH');
      return;
    }

    try {
      setPinSetupLoading(true);
      setPinSetupError('');
      await saveEncryptedVaultKey(pinSetupPin, pinSetupPassword);
      setPinVaultEnabled(true);
      setShowPinSetup(false);
      alert("DEVICE QUICK PIN UNLOCK SUCCESSFULLY ENABLED!");
    } catch (err) {
      console.error(err);
      setPinSetupError(String(err).toUpperCase());
    } finally {
      setPinSetupLoading(false);
    }
  };

  const handleMultiSignerChange = () => {
    const newVal = !multiSigner;
    setMultiSigner(newVal);
    handleUpdate('multi_signer', newVal);
  };

  const handleApprovalChainChange = () => {
    const newVal = !approvalChain;
    setApprovalChain(newVal);
    handleUpdate('approval_chain', newVal);
  };

  const handleAutoOptimize = async () => {
    try {
      const hw = await getHardwareInfo();
      const optimalCores = Math.min(64, Math.max(1, hw.logical_cores));
      // buffer allocation is half of total system memory, bounded to 512MB intervals
      const ramMb = hw.total_memory_gb * 1024;
      let optimalBuffer = Math.floor((ramMb / 2) / 512) * 512;
      optimalBuffer = Math.min(16384, Math.max(512, optimalBuffer));

      setPowerMode('TACTICAL');
      setGpuOffload(true);
      setThreads(optimalCores);
      setBufferSize(optimalBuffer);

      await Promise.all([
        updateSetting('power_mode', 'TACTICAL'),
        updateSetting('gpu_offload', 'true'),
        updateSetting('thread_count', optimalCores.toString()),
        updateSetting('buffer_size', optimalBuffer.toString())
      ]);

      alert(`SYSTEM AUTO-OPTIMIZATION COMPLETE:\n- Cores Allocated: ${optimalCores}\n- Buffer Size: ${optimalBuffer} MB\n- GPU Accel: ENABLED\n- Policy: TACTICAL`);
    } catch (error) {
      console.error("Auto optimization query failed:", error);
      handlePowerModeChange('TACTICAL');
      if (!gpuOffload) handleGpuOffloadChange();
      handleThreadsChange({ target: { value: 16 } });
      handleBufferSizeChange({ target: { value: 4096 } });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8 pb-20">
      <div className="max-w-5xl mx-auto space-y-10 relative">
        
        {/* Registration Marks overlay */}
        <div className="absolute -top-4 -left-4 w-4 h-4 border-t-2 border-l-2 border-slate-400"></div>
        <div className="absolute -top-4 -right-4 w-4 h-4 border-t-2 border-r-2 border-slate-400"></div>

        {/* 1. Header */}
        <div className="border-b-2 border-slate-800 pb-4 relative">
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-8 h-[1px] bg-slate-400"></div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
            SYSTEM_CONFIG
            <span className="text-sm font-bold text-slate-500 tracking-widest uppercase border border-slate-400 px-2 py-1 align-middle mt-2">
              v.4.1.0_STABLE
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-2 tracking-widest uppercase font-bold">Unified Configuration & Engine Architecture</p>
        </div>

        {/* 2. FORENSIC_ENGINE_&_TRIAGE */}
        <section className="bg-white/80 border border-slate-400 shadow-[6px_6px_0px_rgba(100,116,139,0.15)] relative">
          <div className="bg-slate-800 text-white px-4 py-2 font-bold text-sm tracking-widest flex items-center gap-2">
            <Settings size={16} /> SEC_1: FORENSIC_ENGINE_&_TRIAGE
          </div>
          
          <div className="p-6 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 tracking-widest">PRIMARY_IMAGER_DAEMON</label>
                <div className="flex border border-slate-400 w-full">
                  <button onClick={() => handleImagerChange('dc3dd')} className={`flex-1 py-2 text-xs font-bold transition-colors ${imager === 'dc3dd' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>dc3dd</button>
                  <div className="w-[1px] bg-slate-400"></div>
                  <button onClick={() => handleImagerChange('dd')} className={`flex-1 py-2 text-xs font-bold transition-colors ${imager === 'dd' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>dd (LEGACY)</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 tracking-widest">RESOURCE_LOADOUT_METER</label>
                <div className="flex w-full h-10 border border-slate-400 shadow-inner">
                  {['ECO', 'BALANCED', 'TACTICAL'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => handlePowerModeChange(mode)}
                      className={`flex-1 text-[10px] font-black tracking-widest border-r last:border-r-0 border-slate-400 transition-all ${
                        powerMode === mode 
                          ? mode === 'TACTICAL' ? 'bg-red-700 text-white' : 'bg-slate-700 text-white' 
                          : 'bg-white text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <IndustrialToggle label="ENABLE_GPU_OFFLOAD (CUDA/METAL)" checked={gpuOffload} onChange={handleGpuOffloadChange} />
            </div>

            <div className="space-y-6 flex flex-col">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest">MULTI_THREAD_HASHING</label>
                  <span className="text-xs font-black text-slate-800">{threads} CORES</span>
                </div>
                <input 
                  type="range" min="1" max="64" value={threads} onChange={handleThreadsChange}
                  className="w-full h-2 bg-slate-300 appearance-none outline-none focus:border-slate-800 accent-slate-800 rounded-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest">MEMORY_BUFFER_SIZE</label>
                  <span className="text-xs font-black text-slate-800">{bufferSize} MB</span>
                </div>
                <input 
                  type="range" min="512" max="16384" step="512" value={bufferSize} onChange={handleBufferSizeChange}
                  className="w-full h-2 bg-slate-300 appearance-none outline-none focus:border-slate-800 accent-slate-800 rounded-none cursor-pointer"
                />
              </div>

              <div className="mt-auto pt-4">
                <button 
                  onClick={handleAutoOptimize}
                  className="w-full py-4 border-2 border-slate-800 font-black tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors group"
                >
                  <BarChart size={16} className="text-slate-500 group-hover:text-white" /> AUTO_OPTIMIZE_TO_HOST
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SYNC_&_INTEGRITY and WORKFLOW_HIERARCHY */}
        <div className="grid grid-cols-2 gap-8">
          <section className="bg-white/80 border border-slate-400 shadow-[6px_6px_0px_rgba(100,116,139,0.15)] relative">
            <div className="bg-slate-700 text-white px-4 py-2 font-bold text-sm tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} /> SEC_2: SYNC_&_INTEGRITY
            </div>
            <div className="p-6 space-y-3">
              <IndustrialToggle label="SUPABASE_REMOTE_SYNC" checked={sync} onChange={handleSyncChange} />
              <IndustrialToggle label="AUTO_RETRY_PACKET_LOSS" checked={autoRetry} onChange={handleAutoRetryChange} />
              <IndustrialToggle label="LOCAL_SECRET_LOCKDOWN" checked={localLock} onChange={handleLocalLockChange} />
              <IndustrialToggle label="DEVICE_QUICK_PIN_UNLOCK" checked={pinVaultEnabled} onChange={handlePinVaultToggle} />
            </div>
          </section>

          <section className="bg-white/80 border border-slate-400 shadow-[6px_6px_0px_rgba(100,116,139,0.15)] relative">
            <div className="bg-slate-600 text-white px-4 py-2 font-bold text-sm tracking-widest flex items-center gap-2">
              <FileSignature size={16} /> SEC_3: WORKFLOW_HIERARCHY
            </div>
            <div className="p-6 space-y-3">
              <IndustrialToggle label="REQUIRE_MULTI_SIGNER" checked={multiSigner} onChange={handleMultiSignerChange} />
              <IndustrialToggle label="ENFORCE_APPROVAL_CHAIN" checked={approvalChain} onChange={handleApprovalChainChange} />
            </div>
          </section>
        </div>

        {/* 4. LEGAL_COMPLIANCE_LOCK */}
        <section className="border-4 border-slate-800 p-8 relative bg-slate-100 overflow-hidden shadow-[8px_8px_0px_rgba(30,41,59,1)]">
           {/* Brutalist Warning Border Overlay */}
           <div className="absolute inset-0 border-[8px] border-[repeating-linear-gradient(-45deg,#fbbf24,#fbbf24_15px,#0f172a_15px,#0f172a_30px)] opacity-60 pointer-events-none"></div>
           
           <h3 className="text-slate-900 font-black tracking-widest border-b-2 border-slate-400 pb-2 mb-6 flex items-center gap-3 relative z-10 text-xl">
             <Lock size={24} className="text-amber-600" strokeWidth={2.5} /> THE BEDROCK: LEGAL_COMPLIANCE_LOCK
           </h3>
           
           <p className="text-xs text-slate-700 font-bold uppercase mb-6 relative z-10">
             Warning: Core operational parameters locked. Modification requires Judicial Subpoena Override.
           </p>

           <div className="grid grid-cols-2 gap-6 relative z-10">
              <DisabledInput label="JURISDICTION_TIMEZONE" value={lockedSettings.timezone} />
              <DisabledInput label="TEMPORAL_FORMAT" value="24_HOUR_MILITARY" />
              <DisabledInput label="REQUIRED_DOCUMENT_TEMPLATE" value={lockedSettings.bsa_section_63_format} />
              <DisabledInput label="DATA_MUTABILITY_STATE" value={lockedSettings.append_only_audit === 'true' ? 'APPEND_ONLY_STRICT' : 'MUTABLE (WARNING)'} />
           </div>
        </section>

        {/* 5. DESTRUCTIVE_ACTIONS */}
        <section className="bg-white/80 border border-red-500 shadow-[6px_6px_0px_rgba(239,68,68,0.15)] relative">
          <div className="bg-red-700 text-white px-4 py-2 font-bold text-sm tracking-widest flex items-center gap-2">
            <Settings size={16} /> SEC_5: DESTRUCTIVE_ACTIONS
          </div>
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-[12px] text-red-600 tracking-widest uppercase mb-1">Restore Original Test Environment</h4>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Deletes the current database, clears all files in the evidence vault, and restores the original test database seeded with the three default mock cases (SSD, Galaxy phone, CCTV DVR).
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest text-xs border border-red-800 transition-colors shrink-0 shadow-[4px_4px_0px_rgba(185,28,28,0.3)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              RESTORE_TEST_ENVIRONMENT
            </button>
          </div>
        </section>

      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-red-600 p-6 lg:p-8 shadow-[12px_12px_0px_rgba(239,68,68,0.2)] w-full max-w-md relative font-mono">
            {/* Warning stripe top */}
            <div className="h-2 bg-[repeating-linear-gradient(-45deg,#ef4444,#ef4444_10px,#f59e0b_10px,#f59e0b_20px)] -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-6"></div>
            
            <h3 className="text-lg font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              [!] SYSTEM RESET WARNING
            </h3>
            
            <p className="text-xs text-slate-700 leading-relaxed mb-6">
              THIS ACTION WILL TOTALLY PURGE THE CURRENT MALKHANA VAULT DATABASE AND DISCARD ALL ACTIVE SECURE EVIDENCE ASSETS. 
              THE SYSTEM WILL RE-SEED THE DEFAULT TEST DATABASE AND REQUIRE RE-DECRYPTION WITH THE ORIGINAL MASTER PASSWORD.
            </p>
            
            <div className="flex gap-4">
              <button
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  try {
                    await resetDatabase();
                    window.location.reload();
                  } catch (err) {
                    console.error("Reset failed:", err);
                    alert("Reset failed: " + err);
                    setResetting(false);
                    setShowResetConfirm(false);
                  }
                }}
                className={`flex-1 py-3 text-xs font-black tracking-widest uppercase text-white transition-colors ${
                  resetting 
                    ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 border-2 border-red-800'
                }`}
              >
                {resetting ? 'RESETTING...' : 'CONFIRM_PURGE'}
              </button>
              
              <button
                disabled={resetting}
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 text-xs font-black tracking-widest uppercase bg-slate-200 hover:bg-slate-300 text-slate-700 border-2 border-slate-400 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-800 p-6 lg:p-8 shadow-[12px_12px_0px_rgba(15,23,42,1)] w-full max-w-md relative font-mono text-slate-800">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4">
              SETUP DEVICE QUICK PIN UNLOCK
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">
              THIS SECURELY STORES AN ENCRYPTED COPY OF THE VAULT KEY ON DISK, DECRYPTABLE BY A 6-DIGIT DEVICE PIN FOR FASTER STARTUP.
            </p>
            <form onSubmit={handlePinSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">
                  VAULT MASTER PASSWORD
                </label>
                <input
                  type="password"
                  value={pinSetupPassword}
                  onChange={(e) => setPinSetupPassword(e.target.value)}
                  placeholder="ENTER MASTER KEY"
                  className="w-full bg-slate-100 border border-slate-400 p-2 text-xs font-bold outline-none focus:border-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">
                    DEVICE PIN (6 DIGITS)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="\d*"
                    value={pinSetupPin}
                    onChange={(e) => setPinSetupPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="E.G. 123456"
                    className="w-full bg-slate-100 border border-slate-400 p-2 text-xs font-bold text-center outline-none focus:border-slate-800 tracking-widest"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">
                    CONFIRM PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="\d*"
                    value={pinSetupConfirmPin}
                    onChange={(e) => setPinSetupConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="RE-ENTER PIN"
                    className="w-full bg-slate-100 border border-slate-400 p-2 text-xs font-bold text-center outline-none focus:border-slate-800 tracking-widest"
                    required
                  />
                </div>
              </div>

              {pinSetupError && (
                <div className="p-2 border border-red-500 bg-red-50 text-[10px] font-bold text-red-600 uppercase">
                  [!] {pinSetupError}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={pinSetupLoading}
                  className={`flex-1 py-3 text-xs font-black tracking-widest uppercase text-white transition-colors ${
                    pinSetupLoading
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-900 border-2 border-slate-900'
                  }`}
                >
                  {pinSetupLoading ? 'ENCRYPTING...' : 'ENABLE_PIN_UNLOCK'}
                </button>
                <button
                  type="button"
                  disabled={pinSetupLoading}
                  onClick={() => setShowPinSetup(false)}
                  className="flex-1 py-3 text-xs font-black tracking-widest uppercase bg-slate-200 hover:bg-slate-300 text-slate-700 border-2 border-slate-400 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
