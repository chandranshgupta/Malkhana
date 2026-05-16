import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  HardDrive, 
  Smartphone, 
  Video, 
  Usb, 
  Cloud, 
  FileCode2, 
  AlertTriangle, 
  Terminal as TerminalIcon, 
  UploadCloud 
} from 'lucide-react';

const AssetButton = ({ type, icon: Icon, label, assetType, setAssetType }) => (
  <button
    onClick={() => setAssetType(type)}
    className={`aspect-square border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
      assetType === type 
        ? 'border-slate-800 bg-slate-800 text-white shadow-[4px_4px_0px_rgba(100,116,139,0.5)] scale-105 z-10 relative' 
        : 'border-slate-400 bg-white/60 text-slate-600 hover:border-slate-600 hover:bg-white/90 shadow-[2px_2px_0px_rgba(100,116,139,0.1)]'
    }`}
  >
    <Icon size={32} strokeWidth={assetType === type ? 2 : 1.5} />
    <span className="font-bold text-xs tracking-widest">{label}</span>
    {type === 'FILES' && <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500"></div>}
  </button>
);

export const NewIngestionWorkflow = () => {
  // State for all workflow forms
  const [caseAnchor, setCaseAnchor] = useState('EXISTING'); // 'EXISTING' | 'NEW'
  const [assetType, setAssetType] = useState(null); // 'DISK' | 'MOBILE' | 'CCTV' | 'PENDRIVE' | 'CLOUD' | 'FILES'
  const [formData, setFormData] = useState({
    cnr: '', fir: '', io: '', jurisdiction: '',
    fileName: '', fileFormat: '', fileSource: '',
    imei: '', os: '', iccid: '', extractionType: 'LOGICAL',
    camId: '', timeOffset: '', fps: '', codec: '',
    size: '', fs: '', serial: '', vidpid: '',
    sealNum: '', condition: '',
    writeBlocker: false, sourceDrive: '/dev/sdX'
  });
  
  // Terminal Logic
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hashComplete, setHashComplete] = useState(false);
  const terminalRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const updateForm = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const startTerminalProcess = () => {
    if (assetType !== 'FILES' && !formData.writeBlocker) return;
    setIsProcessing(true);
    setLogs(["[SYSTEM] Connecting to secure ingestion daemon..."]);
    
    let sequence = [];
    if (assetType === 'FILES') {
      sequence = [
        "[+] Ingesting designated logical files...",
        `[+] Target: ${formData.fileName || 'UNKNOWN_FILE.DAT'}`,
        "[+] Allocating memory buffer...",
        "[+] Calculating cryptographic hash (SHA-256)...",
        "[~] Hashing... 45%",
        "[~] Hashing... 100%",
        "[!] SHA-256: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
        "[+] Committed to immutable ledger. Ingestion complete."
      ];
    } else {
      sequence = [
        `[+] Validating hardware intercept on ${formData.sourceDrive}...`,
        "[+] Write-Blocker Status: ENGAGED & LOCKED (Read-Only)",
        `[+] Executing: dc3dd if=${formData.sourceDrive} of=/vault/images/img.dd hash=sha256`,
        "[~] Copying... 5%",
        "[~] Copying... 42%",
        "[~] Copying... 89%",
        "[~] Copying... 100%",
        "[!] SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "[+] Physical asset safe to disconnect. Image secured."
      ];
    }

    sequence.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === sequence.length - 1) {
          setIsProcessing(false);
          setHashComplete(true);
        }
      }, (index + 1) * 800);
    });
  };



  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10 bg-[#f4f7f9]/50 backdrop-blur-[1px]">
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Main Header */}
        <div className="mb-12 border-b-2 border-slate-800 pb-4 relative">
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
            <Plus size={36} className="text-slate-500" strokeWidth={3}/> 
            NEW_INGESTION
          </h2>
          <p className="text-sm text-slate-600 mt-2 tracking-widest uppercase font-bold">Structured Forensic Ingestion Protocol</p>
        </div>

        {/* --- STAGE 1: CASE ANCHOR --- */}
        <section className="mb-12 bg-white border border-slate-400 shadow-[4px_4px_0px_rgba(100,116,139,0.15)] relative p-8">
           <div className="absolute -left-3 top-8 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rotate-[-90deg] tracking-widest">STAGE_1</div>
           <h3 className="text-lg font-black tracking-widest border-b border-slate-300 pb-2 mb-6">CASE ANCHOR_</h3>
           
           <div className="flex border-2 border-slate-800 w-full mb-6 relative bg-slate-100">
             <div className={`absolute top-0 bottom-0 w-1/2 bg-slate-800 transition-transform duration-300 ${caseAnchor === 'NEW' ? 'translate-x-full' : 'translate-x-0'}`}></div>
             <button onClick={() => setCaseAnchor('EXISTING')} className={`flex-1 py-4 font-bold uppercase tracking-widest z-10 transition-colors ${caseAnchor === 'EXISTING' ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}>LINK_EXISTING_CASE</button>
             <button onClick={() => setCaseAnchor('NEW')} className={`flex-1 py-4 font-bold uppercase tracking-widest z-10 transition-colors ${caseAnchor === 'NEW' ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}>INITIATE_NEW_CASE</button>
           </div>

           <div className="bg-slate-50 p-6 border border-slate-300 min-h-[120px] transition-all">
             {caseAnchor === 'EXISTING' ? (
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-2">COMPUTERIZED NODE RECORD (CNR)</label>
                 <input type="text" value={formData.cnr} onChange={e=>updateForm('cnr', e.target.value)} className="w-full bg-white border-2 border-slate-400 p-3 text-lg font-mono font-bold uppercase outline-none focus:border-slate-800" placeholder="e.g. DL-2026-X8890" />
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-500 mb-2">FIR / CRIME NUMBER</label>
                   <input type="text" value={formData.fir} onChange={e=>updateForm('fir', e.target.value)} className="w-full bg-white border-2 border-slate-400 p-3 font-mono font-bold uppercase outline-none focus:border-slate-800" placeholder="REQUIRED" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-2">INVESTIGATING OFFICER (IO)</label>
                   <input type="text" value={formData.io} onChange={e=>updateForm('io', e.target.value)} className="w-full bg-white border-2 border-slate-400 p-3 font-mono font-bold uppercase outline-none focus:border-slate-800" placeholder="REQUIRED" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-2">JURISDICTION / STATION</label>
                   <input type="text" value={formData.jurisdiction} onChange={e=>updateForm('jurisdiction', e.target.value)} className="w-full bg-white border-2 border-slate-400 p-3 font-mono font-bold uppercase outline-none focus:border-slate-800" placeholder="REQUIRED" />
                 </div>
               </div>
             )}
           </div>
        </section>

        {/* --- STAGE 2: CLASSIFICATION --- */}
        <section className="mb-12 bg-white border border-slate-400 shadow-[4px_4px_0px_rgba(100,116,139,0.15)] relative p-8">
           <div className="absolute -left-3 top-8 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rotate-[-90deg] tracking-widest">STAGE_2</div>
           <h3 className="text-lg font-black tracking-widest border-b border-slate-300 pb-2 mb-6">CLASSIFICATION_</h3>
           
           <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              <AssetButton type="DISK" icon={HardDrive} label="DISK" assetType={assetType} setAssetType={setAssetType} />
              <AssetButton type="MOBILE" icon={Smartphone} label="MOBILE" assetType={assetType} setAssetType={setAssetType} />
              <AssetButton type="CCTV" icon={Video} label="CCTV" assetType={assetType} setAssetType={setAssetType} />
              <AssetButton type="PENDRIVE" icon={Usb} label="USB" assetType={assetType} setAssetType={setAssetType} />
              <AssetButton type="CLOUD" icon={Cloud} label="CLOUD" assetType={assetType} setAssetType={setAssetType} />
              <AssetButton type="FILES" icon={FileCode2} label="FILES" assetType={assetType} setAssetType={setAssetType} />
           </div>

           {/* Dynamic Matrix based on Selection */}
           <div className="min-h-[150px]">
             {!assetType && (
               <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 font-bold text-sm tracking-widest p-8">
                 AWAITING_CLASSIFICATION_INPUT
               </div>
             )}

             {assetType === 'FILES' && (
               <div className="bg-amber-50 border-2 border-amber-500 p-6 shadow-inner">
                 <h4 className="text-amber-700 font-black tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={18}/> LOGICAL FILES PROTOCOL ENGAGED</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                     <label className="block text-[10px] font-bold text-amber-900 mb-1">FILE TITLE / DESCRIPTION</label>
                     <input type="text" value={formData.fileName} onChange={e=>updateForm('fileName', e.target.value)} className="w-full bg-white border border-amber-300 p-2 font-mono uppercase text-sm outline-none focus:border-amber-600" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-amber-900 mb-1">FORMAT (e.g., PDF, MP4)</label>
                     <input type="text" value={formData.fileFormat} onChange={e=>updateForm('fileFormat', e.target.value)} className="w-full bg-white border border-amber-300 p-2 font-mono uppercase text-sm outline-none focus:border-amber-600" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-amber-900 mb-1">SOURCE ORIGIN</label>
                     <input type="text" value={formData.fileSource} onChange={e=>updateForm('fileSource', e.target.value)} className="w-full bg-white border border-amber-300 p-2 font-mono uppercase text-sm outline-none focus:border-amber-600" placeholder="e.g. Scanned Copy" />
                   </div>
                 </div>
               </div>
             )}

             {assetType === 'MOBILE' && (
               <div className="bg-slate-50 border border-slate-300 p-6 grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">IMEI NUMBER</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">OS TYPE / VERSION</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">ICCID (SIM)</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">EXTRACTION GOAL</label><select className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white"><option>LOGICAL</option><option>PHYSICAL</option><option>FILE_SYSTEM</option></select></div>
               </div>
             )}

             {(assetType === 'DISK' || assetType === 'PENDRIVE') && (
               <div className="bg-slate-50 border border-slate-300 p-6 grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">CAPACITY SIZE</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" placeholder="e.g. 500GB" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">FILESYSTEM DETECTED</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" placeholder="NTFS / EXT4" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">SERIAL NUMBER</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">VID/PID</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
               </div>
             )}

             {assetType === 'CCTV' && (
               <div className="bg-slate-50 border border-slate-300 p-6 grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">CAMERA ID / LOCATION</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">TIME OFFSET TO IST</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" placeholder="e.g. -00:05:12" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">NATIVE FPS</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" /></div>
                 <div><label className="block text-[10px] font-bold text-slate-500 mb-1">CODEC FORMAT</label><input type="text" className="w-full border border-slate-400 p-2 font-mono text-sm uppercase" placeholder="H.264 / H.265" /></div>
               </div>
             )}
           </div>
        </section>

        {/* --- STAGE 3: PHYSICAL CUSTODY LOGGING --- */}
        {assetType !== 'FILES' && assetType !== 'CLOUD' && assetType !== null && (
          <section className="mb-12 bg-white border border-slate-400 shadow-[4px_4px_0px_rgba(100,116,139,0.15)] relative p-8">
             <div className="absolute -left-3 top-8 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rotate-[-90deg] tracking-widest">STAGE_3</div>
             <h3 className="text-lg font-black tracking-widest border-b border-slate-300 pb-2 mb-6">PHYSICAL CUSTODY LOG_</h3>
             
             <div className="grid grid-cols-2 gap-8">
               <div className="col-span-2">
                 <label className="block text-[10px] font-bold text-slate-500 mb-2">SEAL NUMBER</label>
                 <input type="text" value={formData.sealNum} onChange={e=>updateForm('sealNum', e.target.value)} className="w-full bg-[#f8fafc] border-2 border-slate-400 p-4 text-4xl font-mono font-black tracking-[0.2em] uppercase outline-none focus:border-slate-800 text-center shadow-inner placeholder:text-slate-300" placeholder="SL-0000" />
               </div>
               
               <div className="relative">
                 <label className="flex justify-between text-[10px] font-bold text-slate-500 mb-2">
                   PHYSICAL CONDITION <span className="text-red-600 bg-red-100 px-1 border border-red-200">MANDATORY</span>
                 </label>
                 <textarea rows="3" value={formData.condition} onChange={e=>updateForm('condition', e.target.value)} className={`w-full bg-white border-2 p-3 font-mono text-sm uppercase outline-none resize-none ${!formData.condition ? 'border-red-400 bg-red-50 focus:border-red-600' : 'border-slate-400 focus:border-slate-800'}`} placeholder="e.g. Screen cracked, casing intact..." />
               </div>

               <div>
                 <label className="block text-[10px] font-bold text-slate-500 mb-2">DATE/TIME OF SEIZURE (IST FIXED)</label>
                 <div className="w-full bg-slate-200 border-2 border-slate-400 p-3 text-lg font-mono font-bold uppercase text-slate-600 pointer-events-none flex items-center justify-between">
                   <span>2026-04-15</span>
                   <span>15:05:00</span>
                 </div>
                 <p className="text-[9px] text-slate-400 mt-2 text-right">SYSTEM TIME LOCKED. CANNOT BE OVERRIDDEN.</p>
               </div>
             </div>
          </section>
        )}

        {/* --- STAGE 4: HARDWARE INTERFACING (TERMINAL) --- */}
        {assetType && (
          <section className="bg-slate-900 border-4 border-slate-800 shadow-[8px_8px_0px_rgba(30,41,59,1)] relative p-8 text-white">
            <div className="absolute -left-4 top-8 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rotate-[-90deg] tracking-widest border border-slate-800">STAGE_4</div>
            <h3 className="text-lg font-black tracking-widest border-b border-slate-700 pb-2 mb-6 flex items-center gap-3 text-slate-200">
              <TerminalIcon size={20} className="text-[#0ea5e9]" /> ZERO-TRUST TERMINAL_
            </h3>

            {/* Contextual Inputs before Execution */}
            {assetType === 'FILES' ? (
              <div className="mb-6 border-2 border-dashed border-slate-600 bg-slate-800/50 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                 <UploadCloud size={32} className="text-slate-400 mb-4" />
                 <span className="font-bold tracking-widest text-sm text-slate-300">DROP_LOGICAL_FILES_HERE</span>
              </div>
            ) : (
              <div className="mb-6 grid grid-cols-2 gap-6 items-end border-b border-slate-700 pb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2">SOURCE BLOCK DEVICE</label>
                  <select value={formData.sourceDrive} onChange={e=>updateForm('sourceDrive', e.target.value)} className="w-full bg-slate-800 border border-slate-600 p-3 font-mono text-sm text-white outline-none focus:border-[#0ea5e9]">
                    <option>/dev/sdb (1.0 TB)</option>
                    <option>/dev/sdc (256 GB)</option>
                    <option>/dev/nvme0n1 (512 GB)</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group bg-slate-800 p-3 border border-slate-600 hover:border-[#0ea5e9] transition-colors">
                    <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${formData.writeBlocker ? 'border-[#0ea5e9]' : 'border-slate-500'}`}>
                      <div className={`w-full h-full bg-[#0ea5e9] transition-transform duration-100 ${formData.writeBlocker ? 'scale-100' : 'scale-0'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.writeBlocker} onChange={() => updateForm('writeBlocker', !formData.writeBlocker)} />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">WRITE_BLOCKER_ENGAGED</span>
                  </label>
                </div>
              </div>
            )}

            {/* Terminal Window */}
            <div 
              ref={terminalRef}
              className="bg-black border border-slate-700 h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed mb-6"
            >
              <div className="text-slate-500 mb-4">
                root@malkhana-vault-sys:~# system_ready<br/>
                Awaiting ingestion command sequence...
              </div>
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('[!]') || log.includes('SHA-256') ? 'text-[#0ea5e9] font-bold' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
              {isProcessing && <div className="text-slate-500 animate-pulse mt-2">_</div>}
            </div>

            {/* Action Button */}
            <button 
              onClick={startTerminalProcess}
              disabled={isProcessing || hashComplete || (assetType !== 'FILES' && !formData.writeBlocker)}
              className={`w-full py-4 font-black tracking-widest transition-all uppercase border-2 flex items-center justify-center gap-2 ${
                isProcessing || hashComplete
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : assetType !== 'FILES' && !formData.writeBlocker
                    ? 'bg-red-900/20 text-red-500 border-red-900/50 cursor-not-allowed'
                    : 'bg-[#0ea5e9] text-slate-900 border-[#0ea5e9] hover:bg-[#38bdf8] hover:border-[#38bdf8] shadow-[4px_4px_0px_rgba(2,132,199,0.3)] cursor-pointer'
              }`}
            >
              {isProcessing ? 'PROCESSING_SEIZURE...' : hashComplete ? 'INGESTION_LOGGED' : assetType === 'FILES' ? 'INITIATE_HASH_SEQUENCE' : 'BEGIN_IMAGING_PROTOCOL'}
            </button>
            
            {!formData.writeBlocker && assetType !== 'FILES' && !isProcessing && !hashComplete && (
              <p className="text-red-400 text-[10px] font-bold mt-3 text-center tracking-widest uppercase animate-pulse">
                ! HARDWARE WRITE-BLOCKER MUST BE ENGAGED BEFORE IMAGING !
              </p>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
