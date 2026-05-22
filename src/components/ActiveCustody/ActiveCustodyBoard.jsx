import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WireframePerson } from '../shared/Wireframes';
import { getEvidenceLog, getCustodyChain, transferCustody, verifyForensicIntegrity } from '../../api/invoke';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { 
  Network, 
  HelpCircle, 
  Activity, 
  Plus, 
  ChevronRight, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Lock, 
  Unlock,
  RefreshCw
} from 'lucide-react';

const OPERATORS_LIST = [
  { username: 'op_092', name: 'OPERATOR_092', role: 'Malkhana In-charge', org: 'Delhi Police' },
  { username: 'io_rajesh', name: 'SI Rajesh Sharma', role: 'Sub-Inspector', org: 'Delhi Police' },
  { username: 'dr_vance', name: 'DR. A. Vance', role: 'Lead Forensic Examiner', org: 'Forensic Science Laboratory' },
  { username: 'admin', name: 'Administrator', role: 'System Administrator', org: 'Malkhana Vault HQ' }
];

export const PersonCard = ({ person, isHovered, onHover }) => (
  <div 
    onMouseEnter={() => onHover(person.id)}
    onMouseLeave={() => onHover(null)}
    className={`absolute w-64 border border-slate-400 bg-white/95 backdrop-blur-md p-4 flex flex-col shadow-[6px_6px_0px_rgba(100,116,139,0.15)] transition-all duration-500 cursor-default ${
      isHovered ? 'shadow-[8px_8px_0px_rgba(100,116,139,0.3)] z-30 scale-[1.03] border-slate-800' : 'z-20'
    } ${!person.hash_verified ? 'border-red-500 bg-red-50/90 shadow-[6px_6px_0px_rgba(220,38,38,0.15)]' : ''}`}
    style={{ left: `${person.x}px`, top: `${person.y}px`, transform: `rotate(${person.rot}deg)` }}
  >
    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-400"></div>
    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-400"></div>
    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-slate-400"></div>
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-400"></div>
    
    <div className="flex justify-between items-start mb-3 border-b border-slate-300 pb-2">
      <div className="text-[10px] font-black tracking-widest text-slate-800 uppercase truncate max-w-[150px]">{person.name}</div>
      <div className="border border-slate-400 px-1.5 py-0.5 text-[8px] font-mono font-bold bg-slate-100 text-slate-500">{person.id}</div>
    </div>
    
    <div className="flex gap-4">
      <div className="w-20 h-24 border border-slate-300 bg-[#f8fafc] relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.05)_1px,transparent_1px)] bg-[size:5px_5px]"></div>
        <div className="absolute inset-2"><WireframePerson /></div>
        {isHovered && <div className="absolute inset-0 border-2 border-red-600/30 animate-pulse pointer-events-none"></div>}
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        <div>
          <div className="text-[7px] text-slate-400 font-bold tracking-widest uppercase">POSITION</div>
          <div className="text-[9px] font-bold text-slate-700 leading-none truncate">{person.role}</div>
        </div>
        <div>
          <div className="text-[7px] text-slate-400 font-bold tracking-widest uppercase">ORGANIZATION</div>
          <div className="text-[9px] text-slate-600 leading-none truncate">{person.org}</div>
        </div>
        <div>
          <div className="text-[7px] text-slate-400 font-bold tracking-widest uppercase">ACTION / TYPE</div>
          <div className={`text-[8px] font-bold px-1.5 py-0.5 inline-block font-mono tracking-widest uppercase ${
            person.action === "SEIZED" ? "bg-emerald-100 text-emerald-800" :
            person.action === "SEALED" ? "bg-amber-100 text-amber-800" :
            person.action === "EXAMINED" ? "bg-purple-100 text-purple-800" :
            "bg-blue-100 text-blue-800"
          }`}>{person.action}</div>
        </div>
      </div>
    </div>

    {person.hash_at_transfer && (
      <div className="mt-3 border-t border-slate-200 pt-2 font-mono text-[8px] text-slate-500 truncate">
        HASH: <span className="text-slate-700">{person.hash_at_transfer.substring(0, 16)}...</span>
      </div>
    )}

    {person.hash_verified ? (
      <div className="mt-1 flex items-center gap-1 text-[8px] font-mono text-emerald-600 font-bold">
        <CheckCircle2 size={10} /> HASH_INTEGRITY_VERIFIED
      </div>
    ) : (
      <div className="mt-2 border border-red-500 bg-red-100/80 text-red-700 p-1 text-[8px] font-bold text-center uppercase tracking-widest animate-pulse flex items-center justify-center gap-1">
        <AlertTriangle size={10} /> TAMPER ALERT: HASH MISMATCH
      </div>
    )}

    {person.notes && isHovered && (
      <div className="mt-2 text-[8px] text-slate-500 border-t border-slate-200 pt-2 italic">
        "{person.notes}"
      </div>
    )}
  </div>
);

export const ActiveCustodyBoard = ({ currentUser }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'register'
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [selectedEvId, setSelectedEvId] = useState('');
  const [custodyChain, setCustodyChain] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custody Handoff Drawer States
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [recipient, setRecipient] = useState('op_092');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('IO');
  const [customOrg, setCustomOrg] = useState('');
  const [actionType, setActionType] = useState('TRANSFERRED');
  const [notes, setNotes] = useState('');

  // Hashing Verification States
  const [filePath, setFilePath] = useState('');
  const [hashing, setHashing] = useState(false);
  const [hashProgress, setHashProgress] = useState(0);
  const [computedHash, setComputedHash] = useState('');
  const [computedMd5, setComputedMd5] = useState('');
  const [hashMatchStatus, setHashMatchStatus] = useState(null); // 'match', 'mismatch', null

  // Recipient Challenge Password States
  const [recipientPassword, setRecipientPassword] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [authError, setAuthError] = useState('');
  const [manualCheckbox, setManualCheckbox] = useState(false);

  // Active Selected Evidence details
  const selectedEvidence = useMemo(() => {
    return evidenceItems.find(item => item.id === selectedEvId);
  }, [evidenceItems, selectedEvId]);

  // Load all evidence items on mount
  const loadItems = async () => {
    try {
      const log = await getEvidenceLog();
      setEvidenceItems(log);
      if (log.length > 0 && !selectedEvId) {
        setSelectedEvId(log[0].id);
      }
    } catch (err) {
      console.error("Failed to load evidence log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Fetch custody chain whenever selected evidence changes
  const loadChain = async () => {
    if (!selectedEvId) {
      setCustodyChain([]);
      return;
    }
    try {
      const chain = await getCustodyChain(selectedEvId);
      setCustodyChain(chain);
    } catch (err) {
      console.error("Failed to load custody chain for " + selectedEvId, err);
    }
  };

  useEffect(() => {
    loadChain();
  }, [selectedEvId]);

  // Handle file hashing calculation
  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      if (selected) {
        setFilePath(selected);
        runFileHash(selected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runFileHash = async (path) => {
    setHashing(true);
    setHashMatchStatus(null);
    setComputedHash('');
    setHashProgress(5);
    
    let progressInterval = setInterval(() => {
      setHashProgress(prev => {
        if (prev >= 90) return prev + 1;
        return prev + 10;
      });
    }, 150);

    try {
      const result = await invoke('hash_file', { path });
      clearInterval(progressInterval);
      setHashProgress(100);
      
      const sha256 = result.sha256;
      setComputedHash(sha256);
      setComputedMd5(result.md5);
      
      if (selectedEvidence) {
        const checkResult = await verifyForensicIntegrity(
          selectedEvidence.hash_sha256 || '',
          selectedEvidence.hash_sha256 || '',
          sha256
        );
        setHashMatchStatus(checkResult.fully_authentic ? 'match' : 'mismatch');
      } else {
        setHashMatchStatus('mismatch');
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      alert('Hashing failed: ' + err);
      setFilePath('');
    } finally {
      setTimeout(() => {
        setHashing(false);
        setHashProgress(0);
      }, 500);
    }
  };

  const handleSimulateVerification = async () => {
    if (!selectedEvidence) return;
    setFilePath('SIMULATED_INTEGRITY_VERIFIED');
    const sha256 = selectedEvidence.hash_sha256;
    setComputedHash(sha256);
    setComputedMd5(selectedEvidence.hash_md5 || 'N/A');
    
    try {
      const checkResult = await verifyForensicIntegrity(
        selectedEvidence.hash_sha256 || '',
        selectedEvidence.hash_sha256 || '',
        sha256
      );
      setHashMatchStatus(checkResult.fully_authentic ? 'match' : 'mismatch');
    } catch (e) {
      console.error(e);
      setHashMatchStatus('mismatch');
    }
  };

  const handleSimulateTamper = async () => {
    if (!selectedEvidence) return;
    setFilePath('SIMULATED_TAMPER_ALERT');
    const sha256 = 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855';
    setComputedHash(sha256);
    setComputedMd5('D41D8CD98F00B204E9800998ECF8427E');
    
    try {
      const checkResult = await verifyForensicIntegrity(
        selectedEvidence.hash_sha256 || '',
        selectedEvidence.hash_sha256 || '',
        sha256
      );
      setHashMatchStatus(checkResult.fully_authentic ? 'match' : 'mismatch');
    } catch (e) {
      console.error(e);
      setHashMatchStatus('mismatch');
    }
  };

  // Authenticate the recipient password
  const handleVerifyRecipient = async () => {
    const username = recipient === 'custom' ? customName : recipient;
    if (!username) {
      setAuthError('ENTER RECIPIENT NAME');
      return;
    }
    if (!recipientPassword) {
      setAuthError('ENTER RECIPIENT PASSWORD');
      return;
    }
    
    setIsAuthChecking(true);
    setAuthError('');
    setIsAuthVerified(false);
    
    try {
      const verified = await invoke('authenticate_user', { username, password: recipientPassword });
      if (verified) {
        setIsAuthVerified(true);
      } else {
        setAuthError('AUTH FAILURE: INVALID PASSWORD');
      }
    } catch (err) {
      console.error(err);
      setAuthError('LOCKOUT OR AUTH ERROR: ' + err);
    } finally {
      setIsAuthChecking(false);
    }
  };

  // Submit Custody Handoff
  const handleExecuteHandoff = async () => {
    if (recipient === 'custom' && !customName) {
      alert('Recipient Name is required.');
      return;
    }
    
    const targetRecipient = recipient === 'custom' ? customName : recipient;
    const targetRole = recipient === 'custom' ? customRole : (OPERATORS_LIST.find(o => o.username === recipient)?.role || 'OFFICER');
    const targetOrg = recipient === 'custom' ? customOrg : (OPERATORS_LIST.find(o => o.username === recipient)?.org || 'Delhi Police');
    
    const senderName = currentUser?.username || 'SYSTEM_USER';
    const isVerified = hashMatchStatus === 'match';

    try {
      await transferCustody(
        selectedEvId,
        senderName,
        targetRecipient,
        targetRole,
        targetOrg,
        computedHash || null,
        isVerified,
        notes || null
      );
      
      // Close drawer & reset states
      setIsTransferOpen(false);
      setNotes('');
      setFilePath('');
      setComputedHash('');
      setComputedMd5('');
      setHashMatchStatus(null);
      setRecipientPassword('');
      setIsAuthVerified(false);
      setManualCheckbox(false);
      
      // Refresh
      await loadChain();
      await loadItems();
    } catch (err) {
      console.error(err);
      alert('Custody transfer failed: ' + err);
    }
  };

  // Position cards on a smooth horizontal layout
  const personnelChain = useMemo(() => {
    return custodyChain.map((entry, i) => {
      const x = 80 + i * 320;
      const y = 200 + (i % 2 === 0 ? 0 : 210);
      const pinX = x + 128;
      const pinY = y + 10;
      const rot = (i % 2 === 0 ? -1.5 : 2);
      
      return {
        id: entry.id,
        name: entry.to_person,
        role: entry.role || "OFFICER",
        org: entry.organization || "Delhi Police",
        action: entry.action,
        hash_at_transfer: entry.hash_at_transfer,
        hash_verified: entry.hash_verified,
        notes: entry.notes || "",
        timestamp: entry.timestamp,
        from_person: entry.from_person,
        x,
        y,
        rot,
        pinX,
        pinY
      };
    });
  }, [custodyChain]);

  // Dynamically compute the path coordinates of the thread
  const threadPath = useMemo(() => {
    if (personnelChain.length === 0) return "";
    let path = `M ${personnelChain[0].pinX} ${personnelChain[0].pinY}`;
    
    for (let i = 1; i < personnelChain.length; i++) {
      const prev = personnelChain[i - 1];
      const curr = personnelChain[i];
      const cp1x = prev.pinX + 160;
      const cp1y = prev.pinY;
      const cp2x = curr.pinX - 160;
      const cp2y = curr.pinY;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.pinX} ${curr.pinY}`;
    }
    
    const last = personnelChain[personnelChain.length - 1];
    path += ` C ${last.pinX + 100} ${last.pinY + 50}, ${last.pinX + 150} ${last.pinY - 50}, ${last.pinX + 200} ${last.pinY + 100}`;
    return path;
  }, [personnelChain]);

  const lastCoords = useMemo(() => {
    if (personnelChain.length === 0) return { x: 900, y: 700 };
    const last = personnelChain[personnelChain.length - 1];
    return {
      x: last.pinX + 200,
      y: last.pinY + 100
    };
  }, [personnelChain]);

  const canExecute = useMemo(() => {
    const isRecipientFilled = recipient !== 'custom' || (customName && customOrg);
    const isVerificationDone = hashMatchStatus !== null;
    const isAuthDone = isAuthVerified || (recipient === 'custom' && manualCheckbox);
    return isRecipientFilled && isVerificationDone && isAuthDone;
  }, [recipient, customName, customOrg, hashMatchStatus, isAuthVerified, manualCheckbox]);

  return (
    <div className="flex-1 w-full h-full flex overflow-hidden bg-[#f4f7f9]/50 backdrop-blur-[1px] relative print:bg-white print:p-0">
      
      {/* Target Selector Control Bar & Main Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative print:hidden">
        <div className="border-b border-slate-400 bg-[#e2e8f0]/80 backdrop-blur-md p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center z-30 relative">
          <div>
            <h2 className="text-2xl font-light tracking-tight flex items-baseline gap-4">
              Custody Trace: <span className="font-bold">{activeTab === 'board' ? t('investigation_board') : t('movement_register')}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-mono uppercase tracking-widest">Zero-Trust Auditing • Section 63 BSA Chain Proof</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Tab selection ribbon */}
            <div className="flex font-mono text-xs border border-slate-400 bg-white shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
              <button 
                onClick={() => setActiveTab('board')}
                className={`px-3 py-1.5 font-bold uppercase transition-colors ${activeTab === 'board' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t('investigation_board')}
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`px-3 py-1.5 font-bold border-l border-slate-400 uppercase transition-colors ${activeTab === 'register' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t('movement_register')}
              </button>
            </div>

            {/* Target Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 font-mono uppercase">Select Target Asset:</span>
              {evidenceItems.length > 0 ? (
                <select 
                  value={selectedEvId}
                  onChange={(e) => setSelectedEvId(e.target.value)}
                  className="bg-white border border-slate-500 p-2 text-xs font-mono font-bold uppercase outline-none focus:border-slate-800 text-slate-700 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]"
                >
                  {evidenceItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.id})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-bold text-slate-400">NO_ASSETS_LOADED</div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-500 font-mono text-sm">
            RETRIEVING_CUSTODY_TRACE_VAULT...
          </div>
        ) : personnelChain.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-slate-500 font-mono text-center">
            <HelpCircle size={48} className="text-slate-400 mb-4 stroke-1" />
            <div className="text-sm font-bold">NO_CUSTODY_HISTORY_FOUND</div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase">Please verify the selected evidence is seeded correctly in SQLite.</div>
          </div>
        ) : activeTab === 'board' ? (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <div className="min-h-[750px] relative p-8" style={{ width: `${Math.max(1200, 200 + personnelChain.length * 340)}px` }}>
              
              {/* Thread Board Context */}
              <div className="absolute top-6 left-8 z-10 flex items-center gap-3 bg-white/40 backdrop-blur-sm p-3 border border-slate-300">
                <Activity className="text-red-600 animate-pulse" size={16} />
                <div className="text-xs font-bold text-slate-700">
                  TRACING HOPS FOR ASSET: <span className="font-mono text-blue-600">{selectedEvId}</span>
                </div>
                <div className="text-[10px] text-slate-400 border-l border-slate-300 pl-3">
                  {personnelChain.length} ACTIVE CUSTODIAN(S)
                </div>
              </div>

              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" 
                style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }}
              >
                {/* Visual copper wire custody path thread */}
                <path d={threadPath} fill="none" stroke="#b91c1c" strokeWidth="4" strokeLinecap="round" className="opacity-40" />
                <path 
                  d={threadPath} 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2.0" 
                  strokeLinecap="round" 
                  className={`transition-all duration-500 ${hoveredNode ? 'animate-pulse opacity-100 stroke-red-500' : 'opacity-80'}`} 
                />
                
                {personnelChain.map((person, idx) => (
                  <g key={`pin-${idx}`} transform={`translate(${person.pinX}, ${person.pinY})`}>
                    <circle cx="0" cy="0" r="7" fill="#334155" />
                    <circle cx="-1" cy="-1" r="4.5" fill="#94a3b8" />
                    <circle cx="-2" cy="-2" r="1.5" fill="#f8fafc" />
                    <circle cx="0" cy="0" r="14" fill="none" stroke="#dc2626" strokeWidth="0.75" strokeDasharray="3 2" className="animate-[spin_6s_linear_infinite]" />
                  </g>
                ))}
                
                <g transform={`translate(${lastCoords.x}, ${lastCoords.y}) rotate(-15)`}>
                  <rect x="-10" y="-15" width="20" height="30" fill="rgba(100,116,139,0.3)" />
                  <line x1="-8" y1="12" x2="8" y2="12" stroke="#475569" strokeWidth="1" />
                  <text x="-7" y="-2" fontSize="5.5" fill="#1e293b" className="font-mono font-bold">L.END</text>
                </g>
              </svg>

              {personnelChain.map(person => (
                <PersonCard key={person.id} person={person} isHovered={hoveredNode === person.id} onHover={setHoveredNode} />
              ))}
            </div>

            {/* Floating Action Button */}
            {!isTransferOpen && (
              <button 
                onClick={() => setIsTransferOpen(true)}
                className="absolute bottom-8 right-8 z-40 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-black tracking-widest px-6 py-4 flex items-center gap-2 border border-slate-600 shadow-[4px_4px_0px_#475569] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
              >
                <Plus size={16} /> Transfer Custody (H2/H3 Check)
              </button>
            )}
          </div>
        ) : (
          /* Movement Register Tab content */
          <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6 relative">
            <div className="flex justify-between items-center bg-white border border-slate-400 p-6 shadow-[4px_4px_0px_rgba(100,116,139,0.1)]">
              <div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
                  {selectedEvidence?.title || 'ASSET_LOG'} (FIR: {selectedEvidence?.case_fir || 'N/A'})
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  ASSET_ID: {selectedEvId} • H1_SHA256: {selectedEvidence?.hash_sha256 || 'N/A'}
                </p>
              </div>
              <button 
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-black tracking-widest px-4 py-2.5 border border-slate-600 shadow-[3px_3px_0px_#475569] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center gap-2"
              >
                <FileText size={14} />
                {t('print_register')}
              </button>
            </div>

            <div className="border border-slate-400 bg-white shadow-[4px_4px_0px_rgba(100,116,139,0.1)] overflow-hidden">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-400 bg-slate-100 text-slate-600 uppercase font-black">
                    <th className="p-3 border-r border-slate-400">Step</th>
                    <th className="p-3 border-r border-slate-400">Date/Time (IST)</th>
                    <th className="p-3 border-r border-slate-400">Transferor (Sender)</th>
                    <th className="p-3 border-r border-slate-400">Transferee (Recipient)</th>
                    <th className="p-3 border-r border-slate-400">Recipient Role & Org</th>
                    <th className="p-3 border-r border-slate-400">Purpose / Action</th>
                    <th className="p-3 border-r border-slate-400">Integrity Hash (Hn)</th>
                    <th className="p-3">Seal Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {personnelChain.map((person, index) => (
                    <tr key={person.id} className="border-b border-slate-300 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-r border-slate-300 font-bold">{index + 1}</td>
                      <td className="p-3 border-r border-slate-300 font-sans text-slate-600">
                        {new Date(person.timestamp).toLocaleString('en-GB', { hour12: false })}
                      </td>
                      <td className="p-3 border-r border-slate-300 font-bold text-slate-800">{person.from_person}</td>
                      <td className="p-3 border-r border-slate-300 font-bold text-slate-800">{person.name}</td>
                      <td className="p-3 border-r border-slate-300">
                        <div className="font-bold text-slate-700">{person.role}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{person.org}</div>
                      </td>
                      <td className="p-3 border-r border-slate-300">
                        <span className={`text-[9px] font-bold px-2 py-0.5 inline-block tracking-widest uppercase ${
                          person.action === "SEIZED" ? "bg-emerald-100 text-emerald-800" :
                          person.action === "SEALED" ? "bg-amber-100 text-amber-800" :
                          person.action === "EXAMINED" ? "bg-purple-100 text-purple-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>{person.action}</span>
                        {person.notes && <div className="text-[10px] text-slate-500 italic mt-1 font-sans">"{person.notes}"</div>}
                      </td>
                      <td className="p-3 border-r border-slate-300 text-[10px] break-all max-w-[180px]">
                        {person.hash_at_transfer || 'N/A'}
                      </td>
                      <td className="p-3">
                        {person.hash_verified ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                            <CheckCircle2 size={12} /> HASH_MATCH
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 font-bold text-[10px] animate-pulse">
                            <AlertTriangle size={12} /> MISMATCH / TAMPER
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Floating Action Button for Handoff inside Register Tab as well */}
            {!isTransferOpen && (
              <button 
                onClick={() => setIsTransferOpen(true)}
                className="absolute bottom-8 right-8 z-40 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-black tracking-widest px-6 py-4 flex items-center gap-2 border border-slate-600 shadow-[4px_4px_0px_#475569] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
              >
                <Plus size={16} /> Transfer Custody (H2/H3 Check)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Slide-out Control Drawer */}
      {isTransferOpen && (
        <div className="w-96 border-l border-slate-400 bg-slate-100 flex flex-col h-full z-45 shadow-[-8px_0_0_rgba(100,116,139,0.15)] relative">
          {/* Header */}
          <div className="p-6 border-b border-slate-400 bg-[#e2e8f0] flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm font-mono tracking-widest text-slate-800 uppercase">SEC 63 HANDOFF</h3>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">AUTHORIZE CUSTODY STEP</p>
            </div>
            <button 
              onClick={() => setIsTransferOpen(false)}
              className="text-xs font-mono font-black border border-slate-500 px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
            >
              CLOSE
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
            {/* Case info */}
            <div className="bg-white border border-slate-300 p-3 relative font-mono text-[9px] text-slate-600 space-y-1">
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 animate-pulse"></div>
              <div>VAULT TARGET ID: <span className="font-bold text-slate-800">{selectedEvId}</span></div>
              <div>BIRTH HASH (H1): <span className="font-bold text-slate-800 truncate block">{selectedEvidence?.hash_sha256?.substring(0, 32)}...</span></div>
            </div>

            {/* Sender / Current Holder */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase block">Current Custodian (Sender)</label>
              <input 
                type="text" 
                value={currentUser?.username?.toUpperCase() || 'IO_RAJESH'} 
                disabled 
                className="w-full bg-slate-200 border border-slate-400 p-2 text-xs font-mono text-slate-600 font-bold uppercase cursor-not-allowed"
              />
            </div>

            {/* Handoff Type */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase block font-black">Action / Purpose</label>
              <select 
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-white border border-slate-500 p-2 text-xs font-mono font-bold uppercase outline-none focus:border-slate-800 text-slate-700"
              >
                <option value="TRANSFERRED">TRANSFERRED (Malkhana Intake / Move)</option>
                <option value="EXAMINED">EXAMINED (FSL Forensic Copy)</option>
                <option value="SEALED">SEALED (Lock in Secure Safe)</option>
                <option value="RETURNED">RETURNED (Disposed / Court Submission)</option>
              </select>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-3 border-t border-slate-300 pt-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 font-mono uppercase block font-black">Target Recipient</label>
                <select 
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setIsAuthVerified(false);
                    setRecipientPassword('');
                  }}
                  className="w-full bg-white border border-slate-500 p-2 text-xs font-mono font-bold uppercase outline-none focus:border-slate-800 text-slate-700"
                >
                  {OPERATORS_LIST.map(op => (
                    <option key={op.username} value={op.username}>{op.name} ({op.role})</option>
                  ))}
                  <option value="custom">CUSTOM OUTSIDE AGENCY...</option>
                </select>
              </div>

              {recipient === 'custom' && (
                <div className="space-y-3 bg-white p-3 border border-slate-300">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 font-mono uppercase block">Officer/Examiner Name</label>
                    <input 
                      type="text" 
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="E.G. SI ARJUN KUMAR"
                      className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono uppercase outline-none text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 font-mono uppercase block">Role/Designation</label>
                    <input 
                      type="text" 
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="E.G. SPECIAL AGENT"
                      className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono uppercase outline-none text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 font-mono uppercase block">Organization</label>
                    <input 
                      type="text" 
                      value={customOrg}
                      onChange={(e) => setCustomOrg(e.target.value)}
                      placeholder="E.G. CENTRAL CYBER CELL"
                      className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono uppercase outline-none text-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Triple-Hash Handoff Check */}
            <div className="space-y-3 border-t border-slate-300 pt-3">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase block font-black">Triple-Hash Verification (H2/H3)</label>
              
              <div 
                onClick={handleSelectFile}
                className="border-2 border-dashed border-slate-400 hover:border-slate-800 bg-white/70 p-4 text-center cursor-pointer flex flex-col items-center justify-center transition-colors"
              >
                <UploadCloud className="text-slate-400 mb-1" size={24} />
                <span className="text-[10px] font-bold font-mono uppercase text-slate-700">Select File to Calculate Hash</span>
                <span className="text-[8px] text-slate-400 mt-1 uppercase">Simulates hashing device data on handoff</span>
              </div>

              {/* Developer shortcuts */}
              <div className="flex justify-between items-center text-[8px] font-mono">
                <button 
                  type="button"
                  onClick={handleSimulateVerification} 
                  className="text-blue-600 hover:underline font-bold uppercase"
                >
                  [Autofill Matching Hash]
                </button>
                <button 
                  type="button"
                  onClick={handleSimulateTamper} 
                  className="text-red-600 hover:underline font-bold uppercase"
                >
                  [Simulate Tamper (Mismatch)]
                </button>
              </div>

              {filePath && (
                <div className="bg-white border border-slate-300 p-3 space-y-2 font-mono text-[9px]">
                  <div className="truncate text-slate-500">FILE: {filePath}</div>
                  
                  {hashing ? (
                    <div className="flex items-center gap-2 text-slate-600 py-1">
                      <RefreshCw className="animate-spin" size={12} />
                      <span>HASHING FILE: {hashProgress}%</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="truncate">SHA256: <span className="font-bold text-slate-800">{computedHash}</span></div>
                      <div className="truncate">MD5: <span className="text-slate-500">{computedMd5}</span></div>
                      
                      {hashMatchStatus === 'match' && (
                        <div className="mt-2 bg-emerald-50 border border-emerald-400 text-emerald-800 p-1.5 font-bold flex items-center gap-1 uppercase tracking-widest text-[8px]">
                          <CheckCircle2 size={10} /> INTEGRITY VERIFIED (H(n) == H1)
                        </div>
                      )}
                      {hashMatchStatus === 'mismatch' && (
                        <div className="mt-2 bg-red-50 border border-red-400 text-red-800 p-1.5 font-bold flex items-center gap-1 uppercase tracking-widest text-[8px] animate-pulse">
                          <AlertTriangle size={10} /> TAMPER ALERT: HASH MISMATCH!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recipient Credentials challenge */}
            <div className="space-y-3 border-t border-slate-300 pt-3">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase block font-black">Recipient Authorization Sign-off</label>
              
              {recipient !== 'custom' ? (
                <div className="space-y-2">
                  <div className="text-[8px] text-slate-400 font-mono uppercase">Verify recipient login credentials to confirm secure handoff:</div>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value={recipientPassword}
                      onChange={(e) => setRecipientPassword(e.target.value)}
                      placeholder="ENTER RECIPIENT PASSWORD"
                      className="flex-1 bg-white border border-slate-500 p-2 text-xs font-mono outline-none text-slate-700 placeholder-slate-400"
                    />
                    <button 
                      type="button"
                      onClick={handleVerifyRecipient}
                      disabled={isAuthChecking || isAuthVerified}
                      className={`px-3 py-2 font-mono text-xs font-bold border border-slate-600 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] ${
                        isAuthVerified ? 'bg-emerald-100 border-emerald-500 text-emerald-800 cursor-not-allowed shadow-none' : 'bg-white hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isAuthChecking ? 'VERIFYING...' : isAuthVerified ? 'VERIFIED' : 'VERIFY'}
                    </button>
                  </div>
                  {authError && (
                    <div className="text-[8px] font-mono font-bold text-red-600 uppercase mt-1">
                      {authError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-white p-3 border border-slate-300">
                  <input 
                    type="checkbox" 
                    id="manual-check" 
                    checked={manualCheckbox}
                    onChange={(e) => setManualCheckbox(e.target.checked)}
                    className="mt-0.5"
                  />
                  <label htmlFor="manual-check" className="text-[8px] font-mono text-slate-600 leading-tight uppercase font-bold cursor-pointer">
                    Sign off manual physical Panchnama receipt (Outside uncredentialed Operator)
                  </label>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5 border-t border-slate-300 pt-3">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase block">Custodian Handover Notes</label>
              <textarea 
                rows="3" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.G. TRANSFERRED IN SEALED ENVELOPE SI-4402 TO FSL LAB COURIER."
                className="w-full bg-white border border-slate-400 p-2 text-xs font-mono outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-slate-400 bg-slate-200">
            <button 
              type="button"
              disabled={!canExecute}
              onClick={handleExecuteHandoff}
              className={`w-full font-mono text-xs font-black tracking-widest py-3 border shadow-[4px_4px_0px_rgba(0,0,0,0.15)] uppercase ${
                canExecute 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600 cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all'
                  : 'bg-slate-300 text-slate-400 border-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              EXECUTE SEC 63 HANDSHAKE
            </button>
          </div>
        </div>
      )}

      {/* Print-Only Movement Register Sheet */}
      <div id="movement-register-print-area" className="hidden print:block bg-white p-12 text-black font-serif">
        <div className="text-center pb-6 mb-8 border-b-2 border-black">
          <h1 className="text-xl font-bold uppercase tracking-wide">MALKHANA EVIDENCE TRACKING SYSTEM</h1>
          <h2 className="text-md font-bold uppercase tracking-widest mt-1">MOVEMENT REGISTER (CHAIN OF CUSTODY REPORT)</h2>
          <p className="text-xs italic mt-1">Generated under Section 63 of Bharatiya Sakshya Adhiniyam (BSA), 2023</p>
        </div>

        <div className="mb-6 space-y-2 text-sm">
          <div><strong>Case Reference (FIR):</strong> {selectedEvidence?.case_fir || 'N/A'}</div>
          <div><strong>Evidence Reference (ID):</strong> {selectedEvId}</div>
          <div><strong>Description of Item:</strong> {selectedEvidence?.title || 'N/A'} (Type: {selectedEvidence?.asset_type || 'N/A'})</div>
          <div><strong>Initial Hash (H1 - SHA-256):</strong> <span className="font-mono text-xs">{selectedEvidence?.hash_sha256 || 'N/A'}</span></div>
          <div><strong>Date/Time of Audit:</strong> {new Date().toLocaleString('en-GB')}</div>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-black mb-8">
          <thead>
            <tr className="border-b border-black bg-slate-100 text-black font-bold uppercase">
              <th className="p-2 border-r border-black">Step</th>
              <th className="p-2 border-r border-black">Date/Time (IST)</th>
              <th className="p-2 border-r border-black">Sender (Transferor)</th>
              <th className="p-2 border-r border-black">Recipient (Transferee)</th>
              <th className="p-2 border-r border-black">Designation & Agency</th>
              <th className="p-2 border-r border-black">Action / Notes</th>
              <th className="p-2 border-r border-black">Handoff Hash (Hn)</th>
              <th className="p-2">Integrity</th>
            </tr>
          </thead>
          <tbody>
            {personnelChain.map((person, index) => (
              <tr key={person.id} className="border-b border-black">
                <td className="p-2 border-r border-black font-bold">{index + 1}</td>
                <td className="p-2 border-r border-black font-sans">{new Date(person.timestamp).toLocaleString('en-GB')}</td>
                <td className="p-2 border-r border-black">{person.from_person}</td>
                <td className="p-2 border-r border-black">{person.name}</td>
                <td className="p-2 border-r border-black">
                  {person.role}, {person.org}
                </td>
                <td className="p-2 border-r border-black">
                  <strong>{person.action}</strong>
                  {person.notes && <div className="text-[10px] italic">"{person.notes}"</div>}
                </td>
                <td className="p-2 border-r border-black font-mono text-[9px] break-all max-w-[120px]">{person.hash_at_transfer || 'N/A'}</td>
                <td className="p-2">
                  {person.hash_verified ? 'VERIFIED MATCH' : 'ALERT: MISMATCH'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-40 border-b border-black h-16"></div>
            <p className="mt-2 font-bold">Malkhana Custodian Signature</p>
            <p className="text-[10px] text-slate-500">(Seal and Name)</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-40 border-b border-black h-16"></div>
            <p className="mt-2 font-bold">Investigating Officer (IO)</p>
            <p className="text-[10px] text-slate-500">(Seal and Name)</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-40 border-b border-black h-16"></div>
            <p className="mt-2 font-bold">Authorized Officer Sign-Off</p>
            <p className="text-[10px] text-slate-500">(Section 63 Certificate Issuer)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
