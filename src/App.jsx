import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  ScanLine, 
  History, 
  Archive, 
  Lock, 
  ShieldCheck, 
  BarChart, 
  Settings, 
  Plus, 
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  FileText,
  Fingerprint,
  X,
  Download,
  HardDrive,
  Smartphone,
  Video,
  Usb,
  Cloud,
  FileCode2,
  Terminal as TerminalIcon,
  UploadCloud
} from 'lucide-react';

// --- Custom Blueprint SVGs & Shared Components ---

const BlueprintBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.15) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }} />
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(to right, rgba(100, 116, 139, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.3) 1px, transparent 1px)`,
      backgroundSize: '100px 100px'
    }} />
    <svg className="absolute bottom-0 left-0 w-96 h-96 text-slate-500 opacity-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.2">
      <circle cx="0" cy="100" r="30" />
      <circle cx="0" cy="100" r="60" />
      <circle cx="0" cy="100" r="90" strokeDasharray="2 2"/>
      <line x1="0" y1="100" x2="100" y2="100" />
      <line x1="0" y1="100" x2="0" y2="0" />
      <line x1="0" y1="100" x2="70" y2="30" />
      <line x1="0" y1="100" x2="30" y2="70" />
      <text x="65" y="95" fontSize="3" fill="currentColor" stroke="none">0.0°</text>
      <text x="5" y="35" fontSize="3" fill="currentColor" stroke="none">90.0°</text>
    </svg>
    <div className="absolute top-[20%] right-[15%] w-4 h-4 border-t border-l border-slate-400 opacity-50"></div>
    <div className="absolute bottom-[30%] right-[5%] w-4 h-4 border-b border-r border-slate-400 opacity-50"></div>
  </div>
);

const WireframeSSD = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="40,80 160,20 190,40 70,100" fill="rgba(100,116,139,0.05)" />
    <polygon points="40,80 40,90 70,110 70,100" />
    <polygon points="70,110 190,50 190,40 70,100" />
    <polygon points="50,75 150,25 180,45 80,95" strokeWidth="0.5" />
    <polygon points="60,70 80,60 90,65 70,75" fill="currentColor" fillOpacity="0.1" />
    <polygon points="90,55 110,45 120,50 100,60" fill="currentColor" fillOpacity="0.1" />
    <polygon points="120,40 140,30 150,35 130,45" fill="currentColor" fillOpacity="0.1" />
    <polygon points="80,80 100,70 110,75 90,85" fill="currentColor" fillOpacity="0.1" />
    <polygon points="110,65 130,55 140,60 120,70" fill="currentColor" fillOpacity="0.1" />
    <polygon points="140,50 160,40 170,45 150,55" fill="currentColor" fillOpacity="0.1" />
    <line x1="45" y1="85" x2="65" y2="105" strokeWidth="0.5" strokeDasharray="1 2"/>
  </svg>
);

const WireframePhone = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M50,70 L150,20 Q160,15 165,25 L180,50 Q185,60 175,65 L75,115 Q65,120 60,110 L45,85 Q40,75 50,70 Z" fill="rgba(100,116,139,0.05)" />
    <path d="M50,70 L150,20 Q160,15 165,25 L180,50 Q185,60 175,65 L75,115 Q65,120 60,110 L45,85 Q40,75 50,70 Z" />
    <path d="M55,70 L145,25 L170,50 L80,110 Z" strokeWidth="0.5" />
    <polyline points="120,40 100,60 110,75 80,90" strokeWidth="1" />
    <polyline points="100,60 85,55" strokeWidth="0.5" />
    <polyline points="110,75 135,70" strokeWidth="0.5" />
    <line x1="47" y1="77" x2="44" y2="83" />
    <line x1="167" y1="23" x2="164" y2="29" />
  </svg>
);

const WireframeDVR = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="20" y="50" width="160" height="40" fill="rgba(100,116,139,0.05)" />
    <rect x="20" y="50" width="160" height="40" />
    <polygon points="20,50 40,30 180,30 180,50" />
    <line x1="40" y1="30" x2="180" y2="30" />
    <rect x="10" y="55" width="10" height="30" />
    <circle cx="15" cy="62" r="1.5" />
    <circle cx="15" cy="78" r="1.5" />
    <rect x="180" y="55" width="10" height="30" />
    <circle cx="185" cy="62" r="1.5" />
    <circle cx="185" cy="78" r="1.5" />
    <rect x="110" y="65" width="60" height="15" strokeWidth="0.5" />
    <circle cx="120" cy="72.5" r="3" />
    <circle cx="135" cy="72.5" r="3" />
    <circle cx="150" cy="72.5" r="3" />
    <circle cx="165" cy="72.5" r="3" />
    <line x1="30" y1="65" x2="80" y2="65" strokeWidth="0.5" />
    <line x1="30" y1="70" x2="80" y2="70" strokeWidth="0.5" />
    <line x1="30" y1="75" x2="80" y2="75" strokeWidth="0.5" />
  </svg>
);

const WireframePerson = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinejoin="round">
    <polygon points="50,15 65,30 60,45 40,45 35,30" fill="rgba(100,116,139,0.05)" />
    <polygon points="50,15 65,30 50,40" />
    <polygon points="50,15 35,30 50,40" />
    <polygon points="35,30 50,40 40,45" />
    <polygon points="65,30 50,40 60,45" />
    <polygon points="40,45 50,40 60,45" fill="rgba(100,116,139,0.1)" />
    <polygon points="40,45 60,45 55,55 45,55" />
    <line x1="50" y1="45" x2="50" y2="55" />
    <polygon points="45,55 55,55 80,75 80,95 20,95 20,75" fill="rgba(100,116,139,0.05)" />
    <polygon points="45,55 50,75 20,75" />
    <polygon points="55,55 50,75 80,75" />
    <polygon points="50,75 20,95 50,95" />
    <polygon points="50,75 80,95 50,95" />
    <polygon points="20,75 20,95 50,75" />
    <polygon points="80,75 80,95 50,75" />
    <line x1="50" y1="55" x2="50" y2="75" />
    <circle cx="50" cy="40" r="1" fill="currentColor" />
    <circle cx="35" cy="30" r="1" fill="currentColor" />
    <circle cx="65" cy="30" r="1" fill="currentColor" />
    <circle cx="20" cy="75" r="1" fill="currentColor" />
    <circle cx="80" cy="75" r="1" fill="currentColor" />
  </svg>
);

const Stamp = ({ text, type = 'blue', rotate = '-rotate-12', extraClasses = '' }) => {
  const isRed = type === 'red';
  const colorClass = isRed ? 'text-red-700 border-red-700' : 'text-slate-600 border-slate-600';
  const fillClass = isRed ? 'fill-red-700' : 'fill-slate-600';

  return (
    <div className={`absolute w-32 h-32 pointer-events-none opacity-80 ${rotate} z-10 ${extraClasses}`}>
      <svg viewBox="0 0 100 100" className={`w-full h-full ${type === 'red' ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''}`}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className={colorClass} strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className={colorClass} strokeWidth="1" />
        <path id={`textPath-${text}`} d="M 15 50 A 35 35 0 1 1 85 50 A 35 35 0 1 1 15 50" fill="none" />
        <text className={`${fillClass} text-[9px] font-bold tracking-wider`} letterSpacing="2">
          <textPath href={`#textPath-${text}`} startOffset="50%" textAnchor="middle">
            • FORENSIC CONTROL • FORENSIC CONTROL 
          </textPath>
        </text>
        <rect x="15" y="40" width="70" height="20" className={`fill-[#f0f4f8] border-y-2 ${colorClass}`} />
        <text x="50" y="53" textAnchor="middle" className={`${fillClass} text-[8px] font-black tracking-widest`}>
          {text}
        </text>
      </svg>
    </div>
  );
};

// --- View 1: Evidence Log Components ---

const EvidenceCard = ({ id, title, desc, tags, ImageComp, stamp, alert }) => (
  <div className="border border-slate-400 bg-white/60 backdrop-blur-sm p-4 relative flex flex-col shadow-[4px_4px_0px_rgba(100,116,139,0.1)] group hover:shadow-[2px_2px_0px_rgba(100,116,139,0.2)] hover:bg-white/80 transition-all duration-300">
    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-400"></div>
    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-400"></div>
    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-slate-400"></div>
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-400"></div>
    <div className="flex justify-between items-start mb-2">
      <div className="border border-slate-400 px-2 py-0.5 text-[10px] font-bold bg-[#f4f7f9]">ID: {id}</div>
    </div>
    {stamp && <Stamp text={stamp.text} type={stamp.type} rotate={stamp.rotate} extraClasses="top-4 right-2 w-28 h-28" />}
    <div className="h-40 border border-slate-300 mb-4 bg-[#f8fafc] relative overflow-hidden flex items-center justify-center p-2 group-hover:border-slate-400 transition-colors">
       <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
       {alert && (
         <div className="absolute top-2 left-2 border border-red-600 text-red-600 text-[9px] font-bold px-1.5 py-0.5 bg-red-50 flex items-center gap-1 z-10">
           <AlertTriangle size={10} />{alert}
         </div>
       )}
       <ImageComp />
       <div className="absolute bottom-1 right-1 text-[8px] text-slate-400">1:1 SCALE</div>
    </div>
    <h3 className="font-bold text-lg mb-2 leading-tight">{title}</h3>
    <p className="text-xs text-slate-600 mb-4 leading-relaxed flex-1">{desc}</p>
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((tag, i) => (
        <span key={i} className="border border-slate-300 px-1.5 py-0.5 text-[9px] text-slate-500 font-bold bg-[#f4f7f9]">{tag}</span>
      ))}
    </div>
    <div className="flex justify-between items-center text-[10px] border-t border-slate-300 pt-3 mt-auto">
      <div className="flex items-center gap-2">
         <span className="border border-slate-400 px-1 py-0.5">J.O</span>
         <span className="border border-slate-400 px-1 py-0.5">085</span>
      </div>
      <button className="font-bold hover:text-slate-500 uppercase tracking-widest">VIEW_LOG [ ]</button>
    </div>
  </div>
);

// --- View 2: Active Custody Components ---

const PersonCard = ({ person, isHovered, onHover }) => (
  <div 
    onMouseEnter={() => onHover(person.id)}
    onMouseLeave={() => onHover(null)}
    className={`absolute w-64 border border-slate-400 bg-white/80 backdrop-blur-md p-4 flex flex-col shadow-[6px_6px_0px_rgba(100,116,139,0.15)] transition-all duration-500 cursor-default ${isHovered ? 'shadow-[8px_8px_0px_rgba(100,116,139,0.3)] z-30 scale-105' : 'z-20'}`}
    style={{ left: `${person.x}px`, top: `${person.y}px`, transform: `rotate(${person.rot}deg)` }}
  >
    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-400"></div>
    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-400"></div>
    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-slate-400"></div>
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-400"></div>
    <div className="flex justify-between items-start mb-3 border-b border-slate-300 pb-2">
      <div className="text-[10px] font-black tracking-widest text-slate-800">{person.name}</div>
      <div className="border border-slate-400 px-1.5 py-0.5 text-[8px] font-bold bg-slate-100 text-slate-500">{person.id}</div>
    </div>
    <div className="flex gap-4">
      <div className="w-20 h-24 border border-slate-300 bg-[#f8fafc] relative overflow-hidden flex-shrink-0 group-hover:border-slate-400">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.05)_1px,transparent_1px)] bg-[size:5px_5px]"></div>
         <div className="absolute inset-2"><WireframePerson /></div>
         {isHovered && <div className="absolute inset-0 border-2 border-[#d92d20]/30 animate-pulse pointer-events-none"></div>}
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <div className="text-[8px] text-slate-400 font-bold mb-0.5">POSITION</div>
          <div className="text-[10px] font-bold text-slate-700 leading-none">{person.role}</div>
        </div>
        <div>
          <div className="text-[8px] text-slate-400 font-bold mb-0.5">ORGANIZATION</div>
          <div className="text-[10px] text-slate-600 leading-none">{person.org}</div>
        </div>
        <div className="flex justify-between items-end pt-1">
           <div>
            <div className="text-[8px] text-slate-400 font-bold mb-0.5">CLEARANCE</div>
            <div className="text-[9px] font-bold bg-slate-200 px-1 text-slate-600 inline-block">{person.auth}</div>
           </div>
           <div className="text-[9px] text-slate-500">{person.phone}</div>
        </div>
      </div>
    </div>
  </div>
);

const ActiveCustodyBoard = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const personnelChain = [
    { id: "PER-001", name: "J. MILLS", role: "SEIZING OFFICER", org: "UNIT-9", auth: "LEVEL_02", phone: "EXT-442", x: 100, y: 150, rot: -3, pinX: 228, pinY: 155 },
    { id: "PER-045", name: "R. CHEN", role: "INTAKE CLERK", org: "FORENSIC VAULT", auth: "LEVEL_03", phone: "EXT-881", x: 550, y: 80, rot: 4, pinX: 678, pinY: 85 },
    { id: "PER-112", name: "DR. A. VANCE", role: "LEAD EXAMINER", org: "CYBER LAB", auth: "LEVEL_05", phone: "EXT-909", x: 300, y: 450, rot: -2, pinX: 428, pinY: 455 },
    { id: "PER-092", name: "OPERATOR_092", role: "DATA ANALYST", org: "FORENSIC CENTRAL", auth: "LEVEL_04", phone: "EXT-102", x: 800, y: 400, rot: 1, pinX: 928, pinY: 405 }
  ];
  const threadPath = `
    M ${personnelChain[0].pinX} ${personnelChain[0].pinY}
    C 350 100, 450 300, ${personnelChain[1].pinX} ${personnelChain[1].pinY}
    C 750 -50, 200 150, ${personnelChain[2].pinX} ${personnelChain[2].pinY}
    C 550 700, 650 200, ${personnelChain[3].pinX} ${personnelChain[3].pinY}
    C 1000 500, 950 650, 900 700
  `;

  return (
    <div className="flex-1 w-full h-full overflow-auto custom-scrollbar relative">
      <div className="min-w-[1200px] min-h-[800px] relative p-8">
        <div className="absolute top-8 left-8 z-10">
          <h2 className="text-3xl font-light tracking-tight mb-2 flex items-baseline gap-4">
            Custody Trace: <span className="font-bold">Investigation Board</span>
          </h2>
          <p className="text-sm text-slate-600 italic font-serif">Chronological thread of authorized personnel handling evidence asset [MOB-1142-922].</p>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.15))' }}>
          <path d={threadPath} fill="none" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" className="opacity-60" />
          <path d={threadPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className={`transition-all duration-500 ${hoveredNode ? 'animate-pulse opacity-100' : 'opacity-80'}`} />
          {personnelChain.map((person, idx) => (
             <g key={`pin-${idx}`} transform={`translate(${person.pinX}, ${person.pinY})`}>
               <circle cx="0" cy="0" r="6" fill="#334155" />
               <circle cx="-1" cy="-1" r="4" fill="#94a3b8" />
               <circle cx="-2" cy="-2" r="1.5" fill="#f8fafc" />
               <circle cx="0" cy="0" r="12" fill="none" stroke="#dc2626" strokeWidth="0.5" strokeDasharray="2 2" className="animate-[spin_4s_linear_infinite]" />
             </g>
          ))}
          <g transform={`translate(900, 700) rotate(-15)`}>
            <rect x="-10" y="-15" width="20" height="30" fill="rgba(100,116,139,0.3)" />
            <line x1="-8" y1="12" x2="8" y2="12" stroke="#475569" strokeWidth="1" />
            <text x="-7" y="-2" fontSize="5" fill="#1e293b" className="font-mono font-bold">L.END</text>
          </g>
        </svg>
        {personnelChain.map(person => (
          <PersonCard key={person.id} person={person} isHovered={hoveredNode === person.id} onHover={setHoveredNode} />
        ))}
      </div>
    </div>
  );
};

// --- View 3: Reports (Section 63 Drafting Table) Components ---

const IndCheckbox = ({ label, checked, onChange, disabled }) => (
  <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
    <div className={`w-4 h-4 border-2 p-0.5 flex items-center justify-center transition-colors ${checked ? 'border-slate-800' : 'border-slate-400 group-hover:border-slate-600'}`}>
       <div className={`w-full h-full bg-slate-800 transition-transform duration-100 ${checked ? 'scale-100' : 'scale-0'}`} />
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
  </label>
);

const ReportsDraftingTable = () => {
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
      if (!isLocked) setSignProgress(0);
    }
    return () => clearInterval(timer);
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


// --- View 4: Sealed Archive (Coordinate Matrix) Components ---

const SealedArchiveMatrix = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawer, setSelectedDrawer] = useState(null);

  // Generate a massive grid of drawers (10 rows x 15 cols = 150)
  const drawers = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const row = Math.floor(i / 15) + 1;
      const col = (i % 15) + 1;
      const id = `R${row}-C${col}`;
      let caseId = null;
      let type = null;
      
      // Seed some specific cases for the demo
      if (id === 'R5-C8') { caseId = 'CASE-101'; type = 'SSD'; }
      else if (id === 'R2-C3') { caseId = 'CASE-404'; type = 'PHONE'; }
      else if (id === 'R8-C12') { caseId = 'CASE-999'; type = 'DVR'; }
      else if (Math.random() > 0.85) { 
        caseId = `CASE-X${Math.floor(Math.random() * 900) + 100}`; 
        type = ['SSD', 'PHONE', 'DVR'][Math.floor(Math.random() * 3)];
      }

      return { id, row, col, caseId, type };
    });
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toUpperCase());
  };

  const isSearchActive = searchQuery.length > 2;

  return (
    <div className="flex-1 flex flex-col relative z-10 overflow-hidden bg-[#f4f7f9]/50 backdrop-blur-[1px]">
      
      {/* Search Control Bar */}
      <div className="border-b border-slate-400 bg-[#e2e8f0]/80 backdrop-blur-md p-6 flex justify-between items-center z-20">
        <div>
          <h2 className="text-2xl font-light tracking-tight flex items-baseline gap-4">
            Sealed Archive: <span className="font-bold">Coordinate Matrix</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-mono uppercase tracking-widest">Physical Storage Twin • Vault Level 3</p>
        </div>
        
        <div className="relative flex items-center border border-slate-500 bg-white w-96 shadow-[4px_4px_0px_rgba(100,116,139,0.2)]">
          <div className="bg-slate-800 p-3">
            <Search size={18} className="text-white" />
          </div>
          <input 
            type="text" 
            placeholder="ENTER_CASE_ID_OR_CNR (Try: CASE-101)" 
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none outline-none w-full px-4 text-sm font-bold uppercase placeholder-slate-400 font-mono tracking-wider"
          />
        </div>
      </div>

      {/* Grid Wall Container */}
      <div className="flex-1 overflow-auto custom-scrollbar p-10 relative">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Axis Labels & Grid */}
          <div className="relative">
             {/* Column Labels */}
             <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-2 mb-2 ml-8">
               {Array.from({ length: 15 }).map((_, i) => (
                 <div key={`col-${i}`} className="text-[10px] font-bold text-slate-400 text-center tracking-widest">C{i+1}</div>
               ))}
             </div>

             <div className="flex gap-2">
               {/* Row Labels */}
               <div className="flex flex-col gap-2 pt-2">
                 {Array.from({ length: 10 }).map((_, i) => (
                   <div key={`row-${i}`} className="text-[10px] font-bold text-slate-400 h-16 flex items-center pr-2 tracking-widest">R{i+1}</div>
                 ))}
               </div>

               {/* The Wall */}
               <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-2 flex-1">
                 {drawers.map(drawer => {
                   const isMatch = isSearchActive && drawer.caseId?.includes(searchQuery);
                   const isDimmed = isSearchActive && !isMatch;
                   
                   return (
                     <div 
                       key={drawer.id}
                       onClick={() => drawer.caseId && setSelectedDrawer(drawer)}
                       className={`
                         border h-16 relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                         ${!drawer.caseId ? 'border-slate-300 bg-transparent opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-500'}
                         ${isMatch ? 'border-[#0ea5e9] bg-[#e0f2fe] scale-[1.15] z-30 shadow-[8px_8px_0px_rgba(2,132,199,0.3)] animate-pulse' : ''}
                         ${isDimmed ? 'opacity-20 grayscale pointer-events-none' : ''}
                         ${!isMatch && !isDimmed && drawer.caseId ? 'border-slate-400 bg-white/60 shadow-[2px_2px_0px_rgba(100,116,139,0.1)] hover:bg-white/90 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_rgba(100,116,139,0.2)]' : ''}
                       `}
                     >
                       {/* Hardware Handle Detail */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 border border-slate-500 bg-slate-200 shadow-inner"></div>
                       
                       {/* Coordinate Label */}
                       <div className={`absolute bottom-1 right-1 text-[8px] font-bold ${isMatch ? 'text-[#0284c7]' : 'text-slate-500'}`}>
                         {drawer.id}
                       </div>
                       
                       {/* Content Indicator Dot */}
                       {drawer.caseId && (
                         <div className={`absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-none ${isMatch ? 'bg-[#0ea5e9]' : 'bg-slate-600'}`}></div>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Blueprint Drawer Modal */}
      {selectedDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-[#f4f7f9] border-2 border-slate-800 p-10 shadow-[16px_16px_0px_rgba(30,41,59,1)] w-full max-w-4xl relative overflow-hidden animate-[fade-in_0.2s_ease-out]">
            
            {/* Modal Blueprint Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-50" style={{
              backgroundImage: `linear-gradient(to right, rgba(100, 116, 139, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.2) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}></div>

            {/* Corner Marks */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-800"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-800"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-800"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-800"></div>

            {/* Close Button */}
            <button 
              onClick={() => setSelectedDrawer(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 transition-colors z-20"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            <div className="relative z-10 grid grid-cols-2 gap-12">
              
              {/* Left Column: Visuals & Status */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-1">{selectedDrawer.caseId}</h3>
                  <div className="text-xs font-bold text-slate-500 tracking-widest uppercase">LOC: PHYSICAL_MATRIX • {selectedDrawer.id}</div>
                </div>

                <div className="flex-1 border-2 border-slate-400 bg-white relative p-6 flex items-center justify-center min-h-[300px]">
                  {/* Subtle target crosshairs inside image box */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-full h-[1px] bg-slate-800"></div>
                    <div className="absolute h-full w-[1px] bg-slate-800"></div>
                  </div>
                  
                  <div className="w-64 h-64">
                    {selectedDrawer.type === 'SSD' && <WireframeSSD />}
                    {selectedDrawer.type === 'PHONE' && <WireframePhone />}
                    {selectedDrawer.type === 'DVR' && <WireframeDVR />}
                  </div>

                  <Stamp text="STATUS: IMMUTABLE" type="blue" rotate="-rotate-6" extraClasses="top-4 right-4 w-40 h-40" />
                </div>
              </div>

              {/* Right Column: Technical Metadata & Actions */}
              <div className="flex flex-col justify-between pt-4">
                
                <div className="space-y-6">
                  <div>
                     <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">ASSET_CLASS</h4>
                     <p className="text-lg font-bold text-slate-800 uppercase">{selectedDrawer.type}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">SEIZURE_DATE</h4>
                      <p className="text-sm font-bold text-slate-800">2026-04-12 14:30 IST</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">CUSTODIAN_ID</h4>
                      <p className="text-sm font-bold text-slate-800">OPR_092</p>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">CRYPTOGRAPHIC_HASH (SHA-256)</h4>
                     <div className="bg-slate-200 p-3 border border-slate-300">
                       <p className="text-[10px] font-mono font-bold text-slate-700 break-all leading-relaxed">
                         e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                       </p>
                     </div>
                  </div>
                  
                  <div>
                     <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">STORAGE_CONDITION</h4>
                     <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-green-600" />
                       SEAL_INTACT_VERIFIED
                     </p>
                  </div>
                </div>

                {/* Brutalist Export Button */}
                <button className="w-full mt-8 border-2 border-slate-800 bg-slate-800 text-white font-bold tracking-widest py-4 flex items-center justify-center gap-3 shadow-[6px_6px_0px_rgba(100,116,139,0.5)] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px] hover:bg-slate-700">
                  <Download size={18} />
                  EXPORT_CHAIN_OF_CUSTODY
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- View 5: System Settings Architecture ---

const IndustrialToggle = ({ label, checked, onChange }) => (
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

const DisabledInput = ({ label, value }) => (
  <div className="bg-slate-200/80 border-l-4 border-slate-400 p-3 opacity-80 pointer-events-none">
    <div className="text-[9px] font-bold text-slate-500 tracking-widest mb-1">{label}</div>
    <div className="text-sm font-black text-slate-800 font-mono">{value}</div>
  </div>
);

const SystemSettings = () => {
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


// --- View 6: New Ingestion Workflow ---

const NewIngestionWorkflow = () => {
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

  const AssetButton = ({ type, icon: Icon, label }) => (
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
              <AssetButton type="DISK" icon={HardDrive} label="DISK" />
              <AssetButton type="MOBILE" icon={Smartphone} label="MOBILE" />
              <AssetButton type="CCTV" icon={Video} label="CCTV" />
              <AssetButton type="PENDRIVE" icon={Usb} label="USB" />
              <AssetButton type="CLOUD" icon={Cloud} label="CLOUD" />
              <AssetButton type="FILES" icon={FileCode2} label="FILES" />
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
                    <input type="checkbox" className="hidden" checked={formData.writeBlocker} onChange={e=>updateForm('writeBlocker', !formData.writeBlocker)} />
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


// --- Main Application Wrapper ---

export default function App() {
  const [currentView, setCurrentView] = useState('EVIDENCE_LOG'); // 'EVIDENCE_LOG' | 'ACTIVE_CUSTODY' | 'SEALED_ARCHIVE' | 'REPORTS' | 'SYSTEM_SETTINGS' | 'NEW_INGESTION'

  const evidenceItems = [
    { id: "S50-9926-X1", title: "1TB_NVME_SSD", desc: "Seized from location Alpha-9. Primary storage for workstation suspect-01. Physical casing intact, no signs of tampering.", tags: ["CAPACITY: 1024GB", "INTERFACE: PCIE_X4"], ImageComp: WireframeSSD, stamp: { text: "STATUS: IMMUTABLE", type: 'blue', rotate: '-rotate-12' } },
    { id: "MOB-1142-922", title: "SAMSUNG_S22_ULTRA", desc: "Recovered from vehicle search. Screen damaged but functional. Multiple failed login attempts recorded in vault log.", tags: ["OS: ANDROID_13", "SIGNAL: ISOLATED"], ImageComp: WireframePhone, stamp: { text: "STATUS: ALERT", type: 'red', rotate: 'rotate-12' }, alert: "ENCRYPTION_ACTIVE" },
    { id: "DVR-4402-2Y", title: "SONY_CCTV_DVR_R4", desc: "Seized from retail location during incident investigation. 4-channel continuous recording. Password bypass pending.", tags: ["CHANNELS: 04", "FORMAT: H.264"], ImageComp: WireframeDVR, stamp: { text: "STATUS: IMMUTABLE", type: 'blue', rotate: '-rotate-6' } }
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-mono text-slate-800 flex overflow-hidden selection:bg-slate-300 selection:text-slate-900">
      <BlueprintBackground />
      
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-400 bg-opacity-50 flex flex-col pt-6 pb-6 z-30 relative bg-[#f4f7f9]">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-500">
            <div className="text-slate-200 text-xs text-center leading-tight">USER<br/>092</div>
          </div>
          <div>
            <div className="font-bold text-sm">OPERATOR_092</div>
            <div className="text-xs text-slate-500">UNIT: FORENSIC CENTRAL</div>
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
              <button onClick={() => setCurrentView('NEW_INGESTION')} className={`transition-colors uppercase tracking-widest ${currentView === 'NEW_INGESTION' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>NEW_INGESTION</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Global Search - Hidden in Sealed Archive as it has its own target search */}
            {currentView !== 'SEALED_ARCHIVE' && (
              <div className="relative flex items-center border-b border-slate-400 pb-1 w-64">
                <Search size={14} className="text-slate-400 absolute left-0" />
                <input type="text" placeholder="GLOBAL_CASE_SEARCH" className="bg-transparent border-none outline-none w-full pl-6 text-xs uppercase placeholder-slate-400 font-mono" />
              </div>
            )}
            <button className="text-slate-600 hover:text-slate-800"><ScanLine size={18} /></button>
            <button className="text-slate-600 hover:text-slate-800"><History size={18} /></button>
          </div>
        </header>
        
        {/* View Switcher */}
        {currentView === 'EVIDENCE_LOG' && (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="mb-8">
              <h2 className="text-3xl font-light tracking-tight mb-2 flex items-baseline gap-4">
                Evidence Log: <span className="font-bold">Blueprint View</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase align-middle bg-slate-200 px-1">v.2.0.1</span>
              </h2>
              <div className="flex justify-between items-end border-b border-slate-300 pb-2">
                <p className="text-sm text-slate-600 italic font-serif">Current chain of custody items awaiting forensic imaging and verification.</p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                  FILTER BY: <button className="border border-slate-400 px-3 py-1 hover:bg-slate-200">RECENT</button><button className="border border-slate-400 px-3 py-1 hover:bg-slate-200">HIGH_PRIORITY</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {evidenceItems.map((item, idx) => <EvidenceCard key={idx} {...item} />)}
              <div onClick={() => setCurrentView('NEW_INGESTION')} className="border-2 border-dashed border-slate-400 bg-[#f4f7f9]/50 hover:bg-white/50 transition-colors p-4 flex flex-col items-center justify-center text-center cursor-pointer group min-h-[400px]">
                 <div className="w-16 h-16 border border-slate-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-white shadow-[2px_2px_0px_rgba(100,116,139,0.2)]"><Plus size={24} className="text-slate-500" strokeWidth={1} /></div>
                 <div className="font-bold text-lg mb-2 text-slate-700 group-hover:text-slate-900 transition-colors">INITIATE_NEW_INGESTION</div>
                 <div className="text-[10px] text-slate-500">STAGE 1: SEIZURE WIZARD</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'ACTIVE_CUSTODY' && <ActiveCustodyBoard />}
        {currentView === 'SEALED_ARCHIVE' && <SealedArchiveMatrix />}
        {currentView === 'REPORTS' && <ReportsDraftingTable />}
        {currentView === 'SYSTEM_SETTINGS' && <SystemSettings />}
        {currentView === 'NEW_INGESTION' && <NewIngestionWorkflow />}

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

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-left: 1px solid #cbd5e1; border-top: 1px solid #cbd5e1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border: 1px solid #f4f7f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes stamp-drop {
          0% { opacity: 0; transform: scale(2) rotate(15deg); }
          60% { opacity: 1; transform: scale(0.9) rotate(15deg); }
          100% { opacity: 0.9; transform: scale(1) rotate(15deg); }
        }
      `}} />
    </div>
  );
}