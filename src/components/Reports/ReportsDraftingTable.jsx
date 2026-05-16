import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Lock, 
  CheckCircle2, 
  Fingerprint 
} from 'lucide-react';
import { Stamp } from '../shared/Stamp';

export const IndCheckbox = ({ label, checked, onChange, disabled }) => (
  <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
    <div className={`w-4 h-4 border-2 p-0.5 flex items-center justify-center transition-colors ${checked ? 'border-slate-800' : 'border-slate-400 group-hover:border-slate-600'}`}>
       <div className={`w-full h-full bg-slate-800 transition-transform duration-100 ${checked ? 'scale-100' : 'scale-0'}`} />
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
  </label>
);

export const ReportsDraftingTable = () => {
  const [data, setData] = useState({
    custodianName: '', designation: '', sealNumber: '', deviceType: 'MOBILE_DEVICE', controlType: 'MAINTAINED', examinerName: '', labId: 'LAB-CYB-09', hashAlg: 'SHA-256',
  });
  const [isPartAComplete, setIsPartAComplete] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signProgress, setSignProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [finalHash, setFinalHash] = useState('');

  useEffect(() => {
    let timer;
    if (isSigning && !isLocked) {
      timer = setInterval(() => {
        setSignProgress(p => {
          if (p >= 100) { setIsLocked(true); setFinalHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'); return 100; }
          return p + 3;
        });
      }, 100);
    } else {
      if (!isLocked) {
        timer = setTimeout(() => setSignProgress(0), 0);
      }
    }
    return () => {
      if (timer) clearTimeout(timer); // clearTimeout works for both setInterval and setTimeout in browser
    };
  }, [isSigning, isLocked]);

  const updateField = (field, value) => { if (!isLocked) setData(prev => ({ ...prev, [field]: value })); };
  const missingA = !data.custodianName || !data.sealNumber || !data.designation;
  const missingB = !data.examinerName || !data.labId;
  const crosshatchClass = "bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(220,38,38,0.15)_4px,rgba(220,38,38,0.15)_8px)] border-red-400";
  const getInputClass = (val) => `w-full bg-white/50 border outline-none px-3 py-2 text-sm font-bold text-slate-800 transition-all uppercase placeholder:text-slate-400 placeholder:font-normal ${!val && !isLocked ? crosshatchClass : 'border-slate-400 focus:border-slate-800 focus:bg-white'}`;

  return (
    <div className="flex-1 flex overflow-hidden relative z-10">
      {/* Left Panel: Inputs */}
      <div className={`w-[450px] border-r border-slate-400 flex flex-col relative z-20 ${isLocked ? 'grayscale pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-400 bg-[#e2e8f0]/80 backdrop-blur-sm">
          <h2 className="text-xl font-light tracking-tight flex items-center gap-3">
            <FileSignature className="text-slate-700" size={24} />
            <span className="font-bold text-slate-800">SEC_63_DRAFTING</span>
          </h2>
          <p className="text-xs text-slate-600 mt-2 font-mono uppercase tracking-widest">Procedural Control Vault</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="border border-slate-400 bg-white shadow-[4px_4px_0px_rgba(100,116,139,0.1)] relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 tracking-widest">PART A: CUSTODIAN</h3>
              {isPartAComplete && <CheckCircle2 size={16} className="text-slate-600" />}
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">OFFICER / CUSTODIAN NAME</label>
                <input type="text" value={data.custodianName} onChange={e => updateField('custodianName', e.target.value)} className={getInputClass(data.custodianName)} placeholder="REQUIRED" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">DESIGNATION</label>
                  <input type="text" value={data.designation} onChange={e => updateField('designation', e.target.value)} className={getInputClass(data.designation)} placeholder="REQUIRED" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">SEAL NUMBER</label>
                  <input type="text" value={data.sealNumber} onChange={e => updateField('sealNumber', e.target.value)} className={getInputClass(data.sealNumber)} placeholder="REQUIRED" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 mb-3">DEVICE CATEGORY</label>
                <div className="space-y-3">
                  <IndCheckbox label="COMPUTER_SYSTEM" checked={data.deviceType === 'COMPUTER_SYSTEM'} onChange={() => updateField('deviceType', 'COMPUTER_SYSTEM')} />
                  <IndCheckbox label="MOBILE_DEVICE" checked={data.deviceType === 'MOBILE_DEVICE'} onChange={() => updateField('deviceType', 'MOBILE_DEVICE')} />
                  <IndCheckbox label="CCTV_DVR_NVR" checked={data.deviceType === 'CCTV_DVR_NVR'} onChange={() => updateField('deviceType', 'CCTV_DVR_NVR')} />
                </div>
              </div>
              {!isPartAComplete ? (
                <button onClick={() => !missingA && setIsPartAComplete(true)} disabled={missingA} className={`w-full mt-4 py-3 font-bold text-sm transition-all border ${missingA ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' : 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700 shadow-[2px_2px_0px_rgba(100,116,139,0.5)]'}`}>LOCK PART A & PROCEED</button>
              ) : (
                <button onClick={() => setIsPartAComplete(false)} className="w-full mt-4 py-2 border border-slate-400 text-slate-600 text-xs font-bold hover:bg-slate-50">UNLOCK PART A</button>
              )}
            </div>
          </div>
          <div className={`border border-slate-400 bg-white relative transition-all ${isPartAComplete ? 'shadow-[4px_4px_0px_rgba(100,116,139,0.1)] opacity-100' : 'opacity-50 pointer-events-none'}`}>
             <div className="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
             <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 tracking-widest">PART B: EXPERT</h3>
              {!isPartAComplete && <Lock size={14} className="text-slate-400" />}
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">EXAMINER NAME</label>
                <input type="text" value={data.examinerName} onChange={e => updateField('examinerName', e.target.value)} className={getInputClass(data.examinerName)} placeholder="REQUIRED" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">LAB IDENTIFIER</label>
                  <input type="text" value={data.labId} onChange={e => updateField('labId', e.target.value)} className={getInputClass(data.labId)} placeholder="REQUIRED" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">HASH ALGORITHM</label>
                  <select value={data.hashAlg} onChange={e => updateField('hashAlg', e.target.value)} className="w-full bg-white border border-slate-400 outline-none px-3 py-2 text-sm font-bold text-slate-800">
                    <option>SHA-256</option>
                    <option>MD5</option>
                    <option>SHA-512</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 p-6 relative overflow-hidden flex-shrink-0">
           {isLocked && <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] pointer-events-none z-10"></div>}
           <h4 className="text-slate-400 text-[10px] font-bold mb-3 tracking-widest flex items-center justify-between z-20 relative">
             <span>AUTHORIZATION PLINTH</span>
             {isLocked && <span className="text-green-400">SECURED</span>}
           </h4>
           <button onPointerDown={() => isPartAComplete && !missingB && !isLocked && setIsSigning(true)} onPointerUp={() => setIsSigning(false)} onPointerLeave={() => setIsSigning(false)} className={`w-full h-16 relative flex items-center justify-center font-black tracking-widest transition-all z-20 ${!isPartAComplete || missingB ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : isLocked ? 'bg-[#1e293b] text-slate-500 border-2 border-slate-600' : 'bg-white text-slate-900 cursor-pointer hover:bg-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'}`}>
             {!isLocked && <div className="absolute top-0 left-0 h-full bg-slate-300 transition-all ease-linear" style={{ width: `${signProgress}%`, transitionDuration: isSigning ? '100ms' : '300ms' }} />}
             <span className="relative z-10 flex items-center gap-2">
               {isLocked ? <Lock size={18} /> : <Fingerprint size={18} />}
               {isLocked ? 'DOCUMENT_IMMUTABLE' : 'HOLD_TO_SEAL'}
             </span>
           </button>
        </div>
      </div>

      {/* Right Panel: Live Document Rendering */}
      <div className="flex-1 bg-[#0f172a] relative overflow-y-auto p-8 custom-scrollbar flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)`, backgroundSize: '100px 100px' }}></div>

        <div className="w-[800px] bg-[#e0f2fe] border-2 border-[#0284c7] p-12 shadow-[0_0_30px_rgba(2,132,199,0.15)] relative z-10 transition-all duration-500">
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#0284c7]"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#0284c7]"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#0284c7]"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#0284c7]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[#bae6fd] text-8xl font-black opacity-30 pointer-events-none select-none whitespace-nowrap">SECTION 63 B</div>

          <div className="text-center border-b-2 border-[#0284c7] pb-6 mb-8 select-none">
            <h1 className="text-2xl font-serif font-black text-[#0c4a6e] tracking-widest uppercase">Certificate Under Section 63</h1>
            <h2 className="text-sm font-serif text-[#0369a1] uppercase tracking-widest mt-1">Bharatiya Sakshya Adhiniyam, 2023</h2>
          </div>

          <div className="space-y-6 text-[#0f172a] text-sm leading-loose text-justify font-serif select-none">
            <p>I, <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1">{data.custodianName || '[CUSTODIAN_NAME]'}</span>, functioning in the capacity of <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1">{data.designation || '[DESIGNATION]'}</span>, hereby certify that the electronic record detailed in the attached annexure was produced by a <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1 ml-1">{data.deviceType.replace(/_/g, ' ') || '[DEVICE_TYPE]'}</span>.</p>
            <p>During the period over which the computer output was produced, the said device was regularly used to store or process information for the purposes of activities regularly carried on over that period. The device was <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1">{data.controlType || '[CONTROL]'}</span> by me in the ordinary course of operations.</p>
            <p>The physical device containing the electronic record was secured under seal number <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1 ml-1">{data.sealNumber || '[SEAL_NUM]'}</span>, ensuring strict chain of custody protocols prior to forensic extraction.</p>
            <p>Furthermore, I, <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1">{data.examinerName || '[EXAMINER_NAME]'}</span>, operating at <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1">{data.labId || '[LAB_ID]'}</span>, verify that the digital evidence was imaged and verified using the <span className="font-mono font-bold text-[#0284c7] bg-[#bae6fd] px-1 ml-1">{data.hashAlg || '[HASH_ALG]'}</span> algorithm. Throughout the material part of the period, the computer was operating properly, and there are no reasonable grounds for believing that the statement is inaccurate.</p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 select-none">
            <div className="border-t border-[#0284c7] pt-2">
              <div className="font-serif text-[#0369a1] text-xs uppercase mb-1">Part A Signatory</div>
              <div className="font-mono font-bold text-[#0c4a6e]">{data.custodianName || 'PENDING'}</div>
              <div className="font-mono text-xs text-[#0284c7]">{data.designation || 'PENDING'}</div>
            </div>
            <div className="border-t border-[#0284c7] pt-2">
              <div className="font-serif text-[#0369a1] text-xs uppercase mb-1">Part B Signatory</div>
              <div className="font-mono font-bold text-[#0c4a6e]">{data.examinerName || 'PENDING'}</div>
              <div className="font-mono text-xs text-[#0284c7]">{data.labId || 'PENDING'}</div>
            </div>
          </div>
          {isLocked && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[stamp-drop_0.4s_ease-out_forwards]"><Stamp text="IMMUTABLE_RECORD" type="red" rotate="rotate-[15deg]" extraClasses="w-64 h-64 opacity-90 relative" /></div>}
        </div>

        <div className="w-[800px] mt-8 bg-[#0f172a]/80 border border-[#0ea5e9] p-6 backdrop-blur-sm z-10 relative">
           <h3 className="text-[#38bdf8] font-mono text-xs font-bold tracking-widest border-b border-[#0ea5e9]/50 pb-2 mb-4">ANNEXURE_1: HASH_REPORT</h3>
           <table className="w-full text-left font-mono text-[10px]">
             <thead><tr className="text-[#7dd3fc] border-b border-[#0ea5e9]/30"><th className="pb-2 font-normal">FILE_IDENTIFIER</th><th className="pb-2 font-normal">ALGORITHM</th><th className="pb-2 font-normal">HASH_VALUE</th><th className="pb-2 font-normal text-right">TIMESTAMP_IST</th></tr></thead>
             <tbody className="text-[#bae6fd]">
               <tr className="border-b border-[#0ea5e9]/10 hover:bg-[#0284c7]/20 transition-colors"><td className="py-2">EVID_IMAGE_001.E01</td><td className="py-2">{data.hashAlg}</td><td className="py-2 opacity-50">AWAITING_LOCK...</td><td className="py-2 text-right">--:--:--</td></tr>
               <tr className="border-b border-[#0ea5e9]/10 hover:bg-[#0284c7]/20 transition-colors"><td className="py-2">LOG_DUMP_SYS.TXT</td><td className="py-2">{data.hashAlg}</td><td className="py-2 opacity-50">AWAITING_LOCK...</td><td className="py-2 text-right">--:--:--</td></tr>
             </tbody>
           </table>
           {isLocked && <div className="mt-6 p-3 bg-[#0284c7]/20 border border-[#38bdf8] flex items-center justify-between animate-pulse"><div className="text-[#7dd3fc] text-[10px] font-bold">DOC_SEAL_HASH</div><div className="font-mono text-[#f8fafc] text-xs tracking-widest">{finalHash}</div></div>}
        </div>
      </div>
    </div>
  );
};
