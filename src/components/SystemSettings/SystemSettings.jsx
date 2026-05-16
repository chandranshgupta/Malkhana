import React, { useState } from 'react';
import { Settings, BarChart, ShieldCheck, FileSignature, Lock } from 'lucide-react';

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

  const handleAutoOptimize = () => {
    setPowerMode('TACTICAL');
    setGpuOffload(true);
    setThreads(64);
    setBufferSize(16384);
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
                  <button onClick={() => setImager('dc3dd')} className={`flex-1 py-2 text-xs font-bold transition-colors ${imager === 'dc3dd' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>dc3dd</button>
                  <div className="w-[1px] bg-slate-400"></div>
                  <button onClick={() => setImager('dd')} className={`flex-1 py-2 text-xs font-bold transition-colors ${imager === 'dd' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>dd (LEGACY)</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 tracking-widest">RESOURCE_LOADOUT_METER</label>
                <div className="flex w-full h-10 border border-slate-400 shadow-inner">
                  {['ECO', 'BALANCED', 'TACTICAL'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPowerMode(mode)}
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

              <IndustrialToggle label="ENABLE_GPU_OFFLOAD (CUDA/METAL)" checked={gpuOffload} onChange={() => setGpuOffload(!gpuOffload)} />
            </div>

            <div className="space-y-6 flex flex-col">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest">MULTI_THREAD_HASHING</label>
                  <span className="text-xs font-black text-slate-800">{threads} CORES</span>
                </div>
                <input 
                  type="range" min="1" max="64" value={threads} onChange={(e) => setThreads(e.target.value)}
                  className="w-full h-2 bg-slate-300 appearance-none outline-none focus:border-slate-800 accent-slate-800 rounded-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest">MEMORY_BUFFER_SIZE</label>
                  <span className="text-xs font-black text-slate-800">{bufferSize} MB</span>
                </div>
                <input 
                  type="range" min="512" max="16384" step="512" value={bufferSize} onChange={(e) => setBufferSize(e.target.value)}
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
              <IndustrialToggle label="SUPABASE_REMOTE_SYNC" checked={sync} onChange={() => setSync(!sync)} />
              <IndustrialToggle label="AUTO_RETRY_PACKET_LOSS" checked={autoRetry} onChange={() => setAutoRetry(!autoRetry)} />
              <IndustrialToggle label="LOCAL_SECRET_LOCKDOWN" checked={localLock} onChange={() => setLocalLock(!localLock)} />
            </div>
          </section>

          <section className="bg-white/80 border border-slate-400 shadow-[6px_6px_0px_rgba(100,116,139,0.15)] relative">
            <div className="bg-slate-600 text-white px-4 py-2 font-bold text-sm tracking-widest flex items-center gap-2">
              <FileSignature size={16} /> SEC_3: WORKFLOW_HIERARCHY
            </div>
            <div className="p-6 space-y-3">
              <IndustrialToggle label="REQUIRE_MULTI_SIGNER" checked={multiSigner} onChange={() => setMultiSigner(!multiSigner)} />
              <IndustrialToggle label="ENFORCE_APPROVAL_CHAIN" checked={approvalChain} onChange={() => setApprovalChain(!approvalChain)} />
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
              <DisabledInput label="JURISDICTION_TIMEZONE" value="UTC+05:30 (IST_FIXED)" />
              <DisabledInput label="TEMPORAL_FORMAT" value="24_HOUR_MILITARY" />
              <DisabledInput label="REQUIRED_DOCUMENT_TEMPLATE" value="SEC_63_BSA_2023" />
              <DisabledInput label="DATA_MUTABILITY_STATE" value="APPEND_ONLY_STRICT" />
           </div>
        </section>

      </div>
    </div>
  );
};
