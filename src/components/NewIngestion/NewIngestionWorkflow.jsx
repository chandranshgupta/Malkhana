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
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { getAllCases, createCase, ingestEvidence, detectDevices } from '../../api/invoke';

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

export const NewIngestionWorkflow = ({ setCurrentView }) => {
  // State for all workflow forms
  const [caseAnchor, setCaseAnchor] = useState('EXISTING'); // 'EXISTING' | 'NEW'
  const [assetType, setAssetType] = useState(null); // 'DISK' | 'MOBILE' | 'CCTV' | 'USB' | 'CLOUD' | 'FILES'
  const [formData, setFormData] = useState({
    cnr: '', fir: '', io: '', jurisdiction: '',
    fileName: '', fileFormat: '', fileSource: '',
    imei: '', os: '', iccid: '', extractionType: 'LOGICAL',
    camId: '', timeOffset: '', fps: '', codec: '',
    size: '', fs: '', serial: '', vidpid: '',
    sealNum: '', condition: '',
    writeBlocker: false, sourceDrive: '/dev/sdb (1.0 TB)',
    deviceMake: '', deviceModel: '', deviceColor: '',
    witness1Name: '', witness1Contact: '',
    witness2Name: '', witness2Contact: '',
    faradayIsolation: false, videoRecordingRef: ''
  });
  
  const [simulationSourcePath, setSimulationSourcePath] = useState('');
  
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [computedHashes, setComputedHashes] = useState({ sha256: '', md5: '' });

  // USB/Disk auto-detection
  const [detectedDevices, setDetectedDevices] = useState([]);
  const [detecting, setDetecting] = useState(false);

  const refreshDrives = async () => {
    setDetecting(true);
    try {
      const list = await detectDevices();
      setDetectedDevices(list);
      if (list.length > 0) {
        updateForm('sourceDrive', list[0].path);
        updateForm('deviceModel', list[0].model || list[0].name);
        updateForm('size', `${(list[0].size_bytes / (1024*1024*1024)).toFixed(1)} GB`);
      }
    } catch (err) {
      console.error("Failed to detect devices:", err);
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    if (assetType && assetType !== 'FILES') {
      refreshDrives();
    }
  }, [assetType]);

  const handleDeviceChange = (path) => {
    updateForm('sourceDrive', path);
    const dev = detectedDevices.find(d => d.path === path);
    if (dev) {
      updateForm('deviceModel', dev.model || dev.name);
      updateForm('size', `${(dev.size_bytes / (1024*1024*1024)).toFixed(1)} GB`);
    }
  };

  // Load existing cases on mount
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const list = await getAllCases();
        setCases(list);
        if (list.length > 0) {
          setSelectedCaseId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load cases:", err);
      }
    };
    fetchCases();
  }, []);

  const selectSimulationSource = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      if (selected) {
        setSimulationSourcePath(selected);
        // Autofill Make and Model with filename for easier testing
        const name = selected.split(/[/\\]/).pop() || 'DRIVE';
        updateForm('deviceModel', name);
      }
    } catch (err) {
      console.error("Simulation file selection error:", err);
    }
  };

  const selectIngestionFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      if (selected) {
        setSelectedFilePath(selected);
        // Extract filename and extension
        const parts = selected.split(/[/\\]/);
        const name = parts[parts.length - 1];
        const extParts = name.split('.');
        const ext = extParts.length > 1 ? extParts[extParts.length - 1] : 'DAT';
        setFormData(p => ({
          ...p,
          fileName: name,
          fileFormat: ext.toUpperCase(),
          fileSource: "Logical File Seizure"
        }));
      }
    } catch (err) {
      console.error("File selection error:", err);
    }
  };
  
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

  const startTerminalProcess = async () => {
    if (assetType !== 'FILES' && !formData.writeBlocker) return;
    
    // Validation
    if (caseAnchor === 'EXISTING' && !selectedCaseId) {
      alert("Please select a case to link.");
      return;
    }
    if (caseAnchor === 'NEW' && (!formData.fir || !formData.io || !formData.jurisdiction)) {
      alert("Please fill in FIR, IO and Jurisdiction for the new case.");
      return;
    }
    if (assetType === 'FILES' && !selectedFilePath) {
      alert("Please select a file to ingest.");
      return;
    }
    if (assetType !== 'FILES' && !simulationSourcePath) {
      alert("Please select a sector/device source file for imaging.");
      return;
    }

    setIsProcessing(true);
    setLogs(["[SYSTEM] Connecting to secure ingestion daemon..."]);
    
    let unlisten = null;
    try {
      // 1. Resolve case ID
      let caseId = selectedCaseId;
      if (caseAnchor === 'NEW') {
        setLogs(prev => [...prev, "[SYSTEM] Initiating new case entry in database..."]);
        caseId = await createCase(formData.cnr, formData.fir, formData.io, formData.jurisdiction);
        setLogs(prev => [...prev, `[SYSTEM] New case initiated: ID = ${caseId}`]);
      }
      
      let hashes = { sha256: '', md5: '' };
      
      if (assetType === 'FILES' && selectedFilePath) {
        setLogs(prev => [...prev, "[SYSTEM] Invoking Rust hashing engine (SHA-256 + MD5)..."]);
        hashes = await invoke('hash_file', { path: selectedFilePath });
        setLogs(prev => [...prev, `[!] SHA-256: ${hashes.sha256}`, `[!] MD5: ${hashes.md5}`]);
      } else {
        // Set up real bit-stream copying!
        setLogs(prev => [
          ...prev, 
          `[+] Target Source Sector: ${simulationSourcePath}`,
          `[+] Destination Path: AUTO_GENERATING...`
        ]);

        // Auto-generate destination path in scratch/seized_images folder
        const timestamp = new Date().getTime();
        const cleanName = (simulationSourcePath.split(/[/\\]/).pop() || 'image').replace(/\s+/g, '_');
        const destPath = `d:/Carrer/Projects/Malkhana/scratch/seized_images/${assetType}_${timestamp}_${cleanName}.raw`;

        setLogs(prev => [...prev, `[+] Destination Path Set: ${destPath}`]);
        setLogs(prev => [...prev, `[+] Listening to progress events...`]);

        // Listen to progress events from Rust
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = await listen('imaging-progress', (event) => {
          const progress = event.payload;
          setLogs(prev => {
            const cleanPrev = prev.filter(l => !l.startsWith('[~]'));
            return [
              ...cleanPrev,
              `[~] Copying... ${progress.percentage.toFixed(1)}% (${(progress.bytes_copied / (1024*1024)).toFixed(1)} MB / ${(progress.total_bytes / (1024*1024)).toFixed(1)} MB) | Speed: ${progress.speed_mb_s.toFixed(2)} MB/s | ETA: ${progress.eta_seconds.toFixed(0)}s`
            ];
          });
        });

        setLogs(prev => [...prev, `[+] Executing forensic image acquisition...`]);
        const result = await invoke('acquire_forensic_image', {
          source: simulationSourcePath,
          destination: destPath
        });

        hashes = { sha256: result.sha256, md5: result.md5 };
        setLogs(prev => [
          ...prev,
          `[!] SHA-256: ${result.sha256}`,
          `[!] MD5: ${result.md5}`,
          `[+] Imaging complete via ${result.engine} engine. Bytes copied: ${result.bytes_copied}`
        ]);
      }
      setComputedHashes(hashes);

      // Serialize witness and device metadata
      const device_metadata = JSON.stringify({
        witness1_name: formData.witness1Name || '',
        witness1_contact: formData.witness1Contact || '',
        witness2_name: formData.witness2Name || '',
        witness2_contact: formData.witness2Contact || '',
        faraday_isolation: formData.faradayIsolation || false,
        video_recording_ref: formData.videoRecordingRef || '',
        extraction_type: formData.extractionType,
        os_version: formData.os,
        iccid: formData.iccid,
        time_offset: formData.timeOffset,
        fps: formData.fps,
        codec: formData.codec,
        fs_detected: formData.fs,
        vidpid: formData.vidpid,
        capacity: formData.size,
      });

      // Write to database
      setLogs(prev => [...prev, "[+] Saving evidence record to SQLCipher database..."]);
      const input = {
        case_id: caseId,
        asset_type: assetType,
        title: assetType === 'FILES' ? (formData.fileName || 'Logical File') : `${assetType} Seizure (${formData.deviceModel || 'Forensic Device'})`,
        description: assetType === 'FILES' ? formData.fileSource : `Forensic seizure copy`,
        tags: JSON.stringify([assetType]),
        device_make: formData.deviceMake || null,
        device_model: formData.deviceModel || null,
        device_color: formData.deviceColor || null,
        device_serial: formData.serial || null,
        device_imei: formData.imei || null,
        physical_condition: formData.condition || null,
        hash_sha256: hashes.sha256,
        hash_md5: hashes.md5,
        seal_number: formData.sealNum || 'SL-UNSPECIFIED',
        seized_at: new Date().toISOString(),
        device_metadata: device_metadata
      };

      await ingestEvidence(input);
      setLogs(prev => [...prev, "[+] Committed to immutable ledger. Ingestion complete."]);
      setIsProcessing(false);
      setHashComplete(true);
      
      // Redirect to EVIDENCE_LOG after a short delay
      setTimeout(() => {
        if (setCurrentView) setCurrentView('EVIDENCE_LOG');
      }, 1200);

    } catch (err) {
      setLogs(prev => [...prev, `[ERROR] Ingestion pipeline failed: ${err}`]);
      setIsProcessing(false);
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
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
                  <label className="block text-xs font-bold text-slate-500 mb-2">SELECT EXISTING CASE FROM ARCHIVE</label>
                  {cases.length === 0 ? (
                    <div className="text-sm font-bold text-red-500 py-2">NO CASES DETECTED. CHOOSE "INITIATE NEW CASE" TO CREATE ONE.</div>
                  ) : (
                    <select 
                      value={selectedCaseId} 
                      onChange={e=>setSelectedCaseId(e.target.value)} 
                      className="w-full bg-white border-2 border-slate-400 p-3 font-mono font-bold uppercase outline-none focus:border-slate-800 text-slate-800"
                    >
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id} - FIR: {c.fir_number} (IO: {c.investigating_officer})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2">COMPUTERIZED NODE RECORD (CNR) - OPTIONAL</label>
                    <input type="text" value={formData.cnr} onChange={e=>updateForm('cnr', e.target.value)} className="w-full bg-white border-2 border-slate-400 p-3 font-mono font-bold uppercase outline-none focus:border-slate-800" placeholder="e.g. DL-2026-X8890" />
                  </div>
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
              <AssetButton type="USB" icon={Usb} label="USB" assetType={assetType} setAssetType={setAssetType} />
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
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">IMEI NUMBER</label><input type="text" value={formData.imei} onChange={e=>updateForm('imei', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">OS TYPE / VERSION</label><input type="text" value={formData.os} onChange={e=>updateForm('os', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">ICCID (SIM)</label><input type="text" value={formData.iccid} onChange={e=>updateForm('iccid', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">EXTRACTION GOAL</label><select value={formData.extractionType} onChange={e=>updateForm('extractionType', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800"><option>LOGICAL</option><option>PHYSICAL</option><option>FILE_SYSTEM</option></select></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">MAKE (e.g. Apple)</label><input type="text" value={formData.deviceMake} onChange={e=>updateForm('deviceMake', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">MODEL (e.g. iPhone 15)</label><input type="text" value={formData.deviceModel} onChange={e=>updateForm('deviceModel', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-500 mb-1">COLOR</label><input type="text" value={formData.deviceColor} onChange={e=>updateForm('deviceColor', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                </div>
              )}
 
              {(assetType === 'DISK' || assetType === 'USB') && (
                <div className="bg-slate-50 border border-slate-300 p-6 grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">CAPACITY SIZE</label><input type="text" value={formData.size} onChange={e=>updateForm('size', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" placeholder="e.g. 500GB" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">FILESYSTEM DETECTED</label><input type="text" value={formData.fs} onChange={e=>updateForm('fs', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" placeholder="NTFS / EXT4" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">SERIAL NUMBER</label><input type="text" value={formData.serial} onChange={e=>updateForm('serial', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">VID/PID</label><input type="text" value={formData.vidpid} onChange={e=>updateForm('vidpid', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">MAKE</label><input type="text" value={formData.deviceMake} onChange={e=>updateForm('deviceMake', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">MODEL</label><input type="text" value={formData.deviceModel} onChange={e=>updateForm('deviceModel', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-500 mb-1">COLOR</label><input type="text" value={formData.deviceColor} onChange={e=>updateForm('deviceColor', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                </div>
              )}
 
              {assetType === 'CCTV' && (
                <div className="bg-slate-50 border border-slate-300 p-6 grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">CAMERA ID / LOCATION</label><input type="text" value={formData.camId} onChange={e=>updateForm('camId', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">TIME OFFSET TO IST</label><input type="text" value={formData.timeOffset} onChange={e=>updateForm('timeOffset', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" placeholder="e.g. -00:05:12" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">NATIVE FPS</label><input type="text" value={formData.fps} onChange={e=>updateForm('fps', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">CODEC FORMAT</label><input type="text" value={formData.codec} onChange={e=>updateForm('codec', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" placeholder="H.264 / H.265" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">MAKE</label><input type="text" value={formData.deviceMake} onChange={e=>updateForm('deviceMake', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">MODEL</label><input type="text" value={formData.deviceModel} onChange={e=>updateForm('deviceModel', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
                  <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-500 mb-1">COLOR</label><input type="text" value={formData.deviceColor} onChange={e=>updateForm('deviceColor', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-sm uppercase bg-white outline-none focus:border-slate-800" /></div>
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

             <div className="grid grid-cols-2 gap-8 mt-6 border-t border-slate-200 pt-6">
               <div>
                 <h4 className="text-xs font-black text-slate-800 tracking-wider mb-4">PANCH WITNESS 1_</h4>
                 <div className="space-y-3">
                   <div>
                     <label className="block text-[9px] font-bold text-slate-500 mb-1">WITNESS NAME</label>
                     <input type="text" value={formData.witness1Name} onChange={e=>updateForm('witness1Name', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-xs uppercase bg-white outline-none focus:border-slate-800 placeholder:text-slate-300" placeholder="NAME OF WITNESS 1" />
                   </div>
                   <div>
                     <label className="block text-[9px] font-bold text-slate-500 mb-1">CONTACT / ADDRESS</label>
                     <input type="text" value={formData.witness1Contact} onChange={e=>updateForm('witness1Contact', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-xs uppercase bg-white outline-none focus:border-slate-800 placeholder:text-slate-300" placeholder="CONTACT OF WITNESS 1" />
                   </div>
                 </div>
               </div>
               
               <div>
                 <h4 className="text-xs font-black text-slate-800 tracking-wider mb-4">PANCH WITNESS 2_</h4>
                 <div className="space-y-3">
                   <div>
                     <label className="block text-[9px] font-bold text-slate-500 mb-1">WITNESS NAME</label>
                     <input type="text" value={formData.witness2Name} onChange={e=>updateForm('witness2Name', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-xs uppercase bg-white outline-none focus:border-slate-800 placeholder:text-slate-300" placeholder="NAME OF WITNESS 2" />
                   </div>
                   <div>
                     <label className="block text-[9px] font-bold text-slate-500 mb-1">CONTACT / ADDRESS</label>
                     <input type="text" value={formData.witness2Contact} onChange={e=>updateForm('witness2Contact', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-xs uppercase bg-white outline-none focus:border-slate-800 placeholder:text-slate-300" placeholder="CONTACT OF WITNESS 2" />
                   </div>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-8 mt-6 border-t border-slate-200 pt-6">
               <div>
                 <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-3 border border-slate-300 hover:border-slate-800 transition-colors">
                   <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${formData.faradayIsolation ? 'border-slate-800' : 'border-slate-400'}`}>
                     <div className={`w-full h-full bg-slate-800 transition-transform duration-100 ${formData.faradayIsolation ? 'scale-100' : 'scale-0'}`} />
                   </div>
                   <input type="checkbox" className="hidden" checked={formData.faradayIsolation} onChange={() => updateForm('faradayIsolation', !formData.faradayIsolation)} />
                   <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">FARADAY BAG ISOLATION ENGAGED</span>
                 </label>
               </div>
               
               <div>
                 <label className="block text-[9px] font-bold text-slate-500 mb-1">VIDEO SEIZURE REFERENCE RECORD (PATH/ID)</label>
                 <input type="text" value={formData.videoRecordingRef} onChange={e=>updateForm('videoRecordingRef', e.target.value)} className="w-full border border-slate-400 p-2 font-mono text-xs uppercase bg-white outline-none focus:border-slate-800 placeholder:text-slate-300" placeholder="e.g. VID-20260520-IO-092" />
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
              <div 
                onClick={selectIngestionFile}
                className="mb-6 border-2 border-dashed border-slate-600 bg-slate-800/50 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
              >
                 <UploadCloud size={32} className="text-slate-400 mb-4" />
                 {selectedFilePath ? (
                   <div className="text-center">
                     <span className="font-bold font-mono tracking-widest text-xs text-[#0ea5e9] block break-all">
                       SELECTED: {selectedFilePath}
                     </span>
                     <span className="text-[10px] text-slate-400 mt-2 block font-bold">CLICK TO SELECT ANOTHER FILE</span>
                   </div>
                 ) : (
                   <span className="font-bold tracking-widest text-sm text-slate-300">
                     CLICK_TO_SELECT_FILE_FOR_INGESTION
                   </span>
                 )}
              </div>
            ) : (
              <div className="mb-6 border-b border-slate-700 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2">SOURCE BLOCK DEVICE</label>
                    <div className="flex gap-2">
                      <select 
                        value={formData.sourceDrive} 
                        onChange={e => handleDeviceChange(e.target.value)} 
                        className="flex-1 bg-slate-800 border border-slate-600 p-3 font-mono text-xs text-white outline-none focus:border-[#0ea5e9]"
                      >
                        {detectedDevices.length === 0 ? (
                          <option value="">-- NO DRIVES DETECTED --</option>
                        ) : (
                          detectedDevices.map(d => (
                            <option key={d.path} value={d.path}>
                              {d.name} - {d.model} ({(d.size_bytes / (1024*1024*1024)).toFixed(1)} GB) [{d.path}]
                            </option>
                          ))
                        )}
                      </select>
                      <button 
                        type="button"
                        onClick={refreshDrives}
                        disabled={detecting}
                        className="px-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 font-bold text-[10px] tracking-wider uppercase text-white"
                      >
                        {detecting ? 'SCANNING...' : 'SCAN'}
                      </button>
                    </div>
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

                <div className="border border-slate-700 bg-slate-800/40 p-4">
                  <label className="block text-[10px] font-bold text-[#0ea5e9] mb-2 tracking-widest">PORTABLE IMAGE SECTOR SOURCE SELECTOR</label>
                  <div className="flex gap-4">
                    <button onClick={selectSimulationSource} className="px-4 py-2 bg-slate-700 border border-slate-500 text-xs font-bold hover:bg-slate-600 transition-colors uppercase tracking-wider">
                      SELECT SOURCE FILE/DRIVE
                    </button>
                    <div className="flex-1 bg-black/50 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-300 truncate flex items-center">
                      {simulationSourcePath || 'AWAITING SECTOR CLONE SOURCE PATH...'}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">Required for Windows testing fallback or selecting raw logical sectors.</p>
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
