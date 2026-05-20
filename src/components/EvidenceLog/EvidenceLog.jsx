import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, ArrowRight, FileSignature, Landmark, Calendar } from 'lucide-react';
import { EvidenceCard } from './EvidenceCard';
import { WireframeSSD, WireframePhone, WireframeDVR } from '../shared/Wireframes';
import { getEvidenceLog, getEvidenceDetails, getCustodyChain, transferCustody, getAllUsers, verifyForensicIntegrity } from '../../api/invoke';
import { Stamp } from '../shared/Stamp';

export const EvidenceLog = ({ setCurrentView, currentUser, searchQuery = '', onDraftCertificate }) => {
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL');

  // Modal State
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [evidenceDetails, setEvidenceDetails] = useState(null);
  const [custodyChainList, setCustodyChainList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Form State
  const [transferTarget, setTransferTarget] = useState('');
  const [transferRole, setTransferRole] = useState('EXAMINER');
  const [transferNotes, setTransferNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [transferHash, setTransferHash] = useState('');
  const [hashVerificationStatus, setHashVerificationStatus] = useState(null);

  const fetchEvidence = async () => {
    try {
      const data = await getEvidenceLog();
      setEvidenceItems(data);
    } catch (error) {
      console.error('Failed to load evidence log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filteredItems = evidenceItems
    .filter(item => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.desc.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // 2. Priority Filter
      if (filterMode === 'HIGH_PRIORITY') {
        return !!item.alert;
      }

      return true;
    })
    .sort((a, b) => {
      // 3. Recency Sort
      if (filterMode === 'RECENT') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  useEffect(() => {
    if (!selectedEvidenceId) {
      setEvidenceDetails(null);
      setCustodyChainList([]);
      setTransferHash('');
      setHashVerificationStatus(null);
      return;
    }

    const loadDetails = async () => {
      setModalLoading(true);
      try {
        const [details, chain, users] = await Promise.all([
          getEvidenceDetails(selectedEvidenceId),
          getCustodyChain(selectedEvidenceId),
          getAllUsers()
        ]);
        setEvidenceDetails(details);
        setCustodyChainList(chain);
        setUsersList(users);
        if (users.length > 0) {
          // Default to first user
          setTransferTarget(users[0].full_name || users[0].username);
        }
      } catch (err) {
        console.error("Failed to load details for " + selectedEvidenceId, err);
      } finally {
        setModalLoading(false);
      }
    };

    loadDetails();
  }, [selectedEvidenceId]);

  useEffect(() => {
    if (!transferHash || !evidenceDetails || !evidenceDetails.hash_sha256) {
      setHashVerificationStatus(null);
      return;
    }
    const checkHash = async () => {
      try {
        const res = await verifyForensicIntegrity(evidenceDetails.hash_sha256, transferHash, null);
        setHashVerificationStatus({
          matched: res.matched,
          details: res.details
        });
      } catch (err) {
        console.error("Integrity check failed:", err);
      }
    };
    checkHash();
  }, [transferHash, evidenceDetails]);

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvidenceId || !transferTarget) return;

    try {
      const targetUser = usersList.find(u => (u.full_name || u.username) === transferTarget) || usersList[0];
      const targetName = targetUser.full_name || targetUser.username;
      
      const fromName = currentUser ? (currentUser.full_name || currentUser.username) : "SYSTEM_USER";
      const isHashVerified = hashVerificationStatus ? hashVerificationStatus.matched : false;

      await transferCustody(
        selectedEvidenceId,
        fromName,
        targetName,
        transferRole,
        targetUser.organization || "Forensic Central",
        transferHash || null,
        isHashVerified,
        transferNotes || "Custody transferred securely"
      );

      // Re-fetch updated timeline & details
      const [updatedDetails, updatedChain] = await Promise.all([
        getEvidenceDetails(selectedEvidenceId),
        getCustodyChain(selectedEvidenceId)
      ]);
      setEvidenceDetails(updatedDetails);
      setCustodyChainList(updatedChain);
      setTransferNotes('');
      setTransferHash('');
      setHashVerificationStatus(null);
      
      // Update parent list
      await fetchEvidence();
    } catch (err) {
      console.error("Custody transfer failed:", err);
      alert("Transfer failed: " + err);
    }
  };

  const resolveImageComp = (typeStr) => {
    switch (typeStr) {
      case 'WireframeSSD': return WireframeSSD;
      case 'WireframePhone': return WireframePhone;
      case 'WireframeDVR': return WireframeDVR;
      default: return WireframeSSD;
    }
  };

  const resolveModalImageComp = (assetType) => {
    switch (assetType) {
      case 'DISK': return <WireframeSSD />;
      case 'MOBILE': return <WireframePhone />;
      case 'CCTV': return <WireframeDVR />;
      case 'USB': return <WireframeSSD />;
      default: return <WireframeSSD />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight mb-2 flex items-baseline gap-4">
          Evidence Log: <span className="font-bold">Blueprint View</span>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase align-middle bg-slate-200 px-1">v.2.0.1</span>
        </h2>
        <div className="flex justify-between items-end border-b border-slate-300 pb-2">
          <p className="text-sm text-slate-600 italic font-serif">Current chain of custody items awaiting forensic imaging and verification.</p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
            FILTER BY: 
            <button 
              onClick={() => setFilterMode('ALL')} 
              className={`border px-3 py-1 font-mono transition-colors ${filterMode === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-400 text-slate-600 hover:bg-slate-200 bg-white'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilterMode('RECENT')} 
              className={`border px-3 py-1 font-mono transition-colors ${filterMode === 'RECENT' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-400 text-slate-600 hover:bg-slate-200 bg-white'}`}
            >
              RECENT
            </button>
            <button 
              onClick={() => setFilterMode('HIGH_PRIORITY')} 
              className={`border px-3 py-1 font-mono transition-colors ${filterMode === 'HIGH_PRIORITY' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-400 text-slate-600 hover:bg-slate-200 bg-white'}`}
            >
              HIGH_PRIORITY
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-slate-500">
            LOADING_EVIDENCE_VAULT...
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <EvidenceCard 
              key={idx} 
              id={item.id}
              title={item.title}
              desc={item.desc}
              tags={item.tags}
              ImageComp={resolveImageComp(item.image_comp_type)}
              stamp={item.stamp}
              alert={item.alert}
              onClick={() => setSelectedEvidenceId(item.id)}
            />
          ))
        )}
        
        <div 
          onClick={() => setCurrentView('NEW_INGESTION')} 
          className="border-2 border-dashed border-slate-400 bg-[#f4f7f9]/50 hover:bg-white/50 transition-colors p-4 flex flex-col items-center justify-center text-center cursor-pointer group min-h-[400px]"
        >
           <div className="w-16 h-16 border border-slate-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-white shadow-[2px_2px_0px_rgba(100,116,139,0.2)]">
             <Plus size={24} className="text-slate-500" strokeWidth={1} />
           </div>
           <div className="font-bold text-lg mb-2 text-slate-700 group-hover:text-slate-900 transition-colors">INITIATE_NEW_INGESTION</div>
           <div className="text-[10px] text-slate-500">STAGE 1: SEIZURE WIZARD</div>
        </div>
      </div>

      {/* Forensic Detailed Evidence Modal */}
      {selectedEvidenceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-[#f4f7f9] border-2 border-slate-800 p-8 shadow-[16px_16px_0px_rgba(30,41,59,1)] w-full max-w-6xl h-[90vh] flex flex-col relative overflow-hidden animate-[fade-in_0.2s_ease-out]">
            
            {/* Corner Marks */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-800"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-800"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-800"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-800"></div>

            {/* Close Button */}
            <button 
              onClick={() => setSelectedEvidenceId(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 transition-colors z-20"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {modalLoading || !evidenceDetails ? (
              <div className="flex-1 flex items-center justify-center font-mono text-sm text-slate-600">
                DECRYPTING_SECURE_METADATA...
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 relative z-10">
                
                {/* Modal Title Block */}
                <div className="mb-6 flex justify-between items-start border-b border-slate-300 pb-4 flex-shrink-0">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Malkhana Forensic Entry</div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{evidenceDetails.title}</h3>
                    <div className="text-xs font-mono font-bold text-slate-500 mt-1 uppercase flex items-center gap-4">
                      <span>ID: {evidenceDetails.id}</span>
                      <span>CASE_ID: {evidenceDetails.case_id}</span>
                      <span>SEAL_NO: {evidenceDetails.seal_number || "NO_SEAL_RECORDED"}</span>
                      {evidenceDetails.storage_location && (
                        <span className="text-blue-600 font-black">LOCATION: {evidenceDetails.storage_location}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="border border-slate-400 bg-slate-800 text-white font-mono text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                      SEC_63_BSA_READY
                    </span>
                  </div>
                </div>

                {/* Modal Contents Split Layout */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
                  
                  {/* Left Column: Metadata & Technical Info (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Visualizer & Stamps */}
                    <div className="border border-slate-400 bg-white relative p-6 flex items-center justify-center h-48 flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <div className="w-full h-[1px] bg-slate-800"></div>
                        <div className="absolute h-full w-[1px] bg-slate-800"></div>
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center">
                        {resolveModalImageComp(evidenceDetails.asset_type)}
                      </div>
                      <Stamp text="VERIFIED_HASH" type="blue" rotate="rotate-6" extraClasses="top-2 right-2 w-24 h-24" />
                    </div>

                    {/* Technical Metadata Table */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">DEVICE_DETAILS</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div><span className="text-slate-400">MAKE:</span> <span className="font-bold text-slate-800">{evidenceDetails.device_make || "N/A"}</span></div>
                          <div><span className="text-slate-400">MODEL:</span> <span className="font-bold text-slate-800">{evidenceDetails.device_model || "N/A"}</span></div>
                          <div><span className="text-slate-400">COLOR:</span> <span className="font-bold text-slate-800">{evidenceDetails.device_color || "N/A"}</span></div>
                          <div><span className="text-slate-400">SERIAL:</span> <span className="font-bold text-slate-800">{evidenceDetails.device_serial || "N/A"}</span></div>
                        </div>
                        {evidenceDetails.device_imei && (
                          <div className="text-xs font-mono mt-1"><span className="text-slate-400">IMEI/IMSI:</span> <span className="font-bold text-slate-800">{evidenceDetails.device_imei}</span></div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">PHYSICAL_CONDITION</h4>
                        <p className="text-xs text-slate-700 bg-white border border-slate-300 p-2 leading-relaxed">
                          {evidenceDetails.physical_condition || "No specific physical conditions documented at ingestion."}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">CRYPTOGRAPHIC_SEALS</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="text-[8px] font-bold text-slate-400">SHA-256</div>
                            <div className="bg-slate-200 p-2 border border-slate-300 text-[10px] font-mono font-bold break-all text-slate-700">
                              {evidenceDetails.hash_sha256 || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[8px] font-bold text-slate-400">MD5</div>
                            <div className="bg-slate-200 p-2 border border-slate-300 text-[10px] font-mono font-bold break-all text-slate-700">
                              {evidenceDetails.hash_md5 || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">SEIZURE_METADATA</h4>
                        <div className="text-xs font-mono space-y-1">
                          <div className="flex items-center gap-2"><Calendar size={12} className="text-slate-400" /> <span className="text-slate-400">SEIZED_AT:</span> <span className="font-bold text-slate-800">{evidenceDetails.seized_at ? new Date(evidenceDetails.seized_at).toLocaleString() : "N/A"}</span></div>
                          <div className="flex items-center gap-2"><Landmark size={12} className="text-slate-400" /> <span className="text-slate-400">VAULT_STATUS:</span> <span className="font-bold text-slate-800 uppercase">{evidenceDetails.status}</span></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-300">
                        <button 
                          onClick={() => {
                            setSelectedEvidenceId(null);
                            onDraftCertificate(evidenceDetails.id);
                          }}
                          className="w-full border-2 border-[#0ea5e9] bg-white text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white font-bold tracking-widest py-3 flex items-center justify-center gap-2 transition-all text-xs"
                        >
                          <FileSignature size={14} />
                          DRAFT_SEC_63_CERTIFICATE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Custody Chain Timeline & Transfers (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col min-h-0">
                    
                    {/* Upper Half: Chain Timeline */}
                    <div className="flex-1 flex flex-col min-h-0 border border-slate-300 bg-white p-4">
                      <h4 className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase flex items-center gap-2 border-b border-slate-300 pb-2">
                        <ShieldCheck size={14} className="text-blue-600" />
                        SEC_63_BSA: Chronological Custody History
                      </h4>
                      
                      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                        {custodyChainList.map((entry, index) => {
                          const isVerified = entry.hash_verified;
                          return (
                            <div key={entry.id} className="relative pl-6 border-l-2 border-slate-300 pb-2 last:pb-0">
                              {/* Connector node dot */}
                              <div className="absolute -left-[7px] top-1.5 w-3 h-3 border border-slate-800 bg-white flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-slate-800"></div>
                              </div>
                              
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                                    <span>#{index + 1} {entry.action}</span>
                                    {isVerified && (
                                      <span className="text-[8px] text-green-600 bg-green-50 px-1 border border-green-300 font-bold uppercase flex items-center gap-0.5">
                                        <CheckCircle2 size={8} /> HASH_VERIFIED
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                                    {entry.from_person ? `${entry.from_person} ➔ ` : ""} {entry.to_person} ({entry.role || "OFFICER"})
                                  </div>
                                  {entry.notes && (
                                    <div className="text-[10px] italic text-slate-600 bg-slate-50 p-1.5 border border-slate-200 mt-1 max-w-lg leading-snug">
                                      {entry.notes}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-[9px] font-bold text-slate-400">{new Date(entry.timestamp).toLocaleString()}</div>
                                  <div className="text-[8px] font-mono text-slate-400 mt-0.5 break-all max-w-[120px] truncate">{entry.id}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lower Half: Custody Transfer Form */}
                    <div className="mt-4 border border-slate-300 bg-slate-100 p-4 flex-shrink-0">
                      <h4 className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase flex items-center gap-2 border-b border-slate-300 pb-2">
                        <FileSignature size={14} className="text-blue-600" />
                        Execute Custody Transfer Sign-Off
                      </h4>

                      <form onSubmit={handleTransferSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recipient Personnel</label>
                          {usersList.length > 0 ? (
                            <select 
                              value={transferTarget}
                              onChange={(e) => setTransferTarget(e.target.value)}
                              className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono font-bold outline-none focus:border-slate-800 text-slate-700"
                            >
                              {usersList
                                .filter(u => u.full_name !== (currentUser?.full_name || currentUser?.username))
                                .map(u => (
                                  <option key={u.id} value={u.full_name || u.username}>
                                    {u.full_name || u.username} ({u.role})
                                  </option>
                                ))
                              }
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={transferTarget} 
                              onChange={(e) => setTransferTarget(e.target.value)}
                              placeholder="Name/ID of recipient"
                              required
                              className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono outline-none focus:border-slate-800 text-slate-700"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transfer Role</label>
                          <select 
                            value={transferRole}
                            onChange={(e) => setTransferRole(e.target.value)}
                            className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono font-bold outline-none focus:border-slate-800 text-slate-700"
                          >
                            <option value="EXAMINER">FORENSIC_EXAMINER</option>
                            <option value="MALKHANA_INCHARGE">MALKHANA_INCHARGE</option>
                            <option value="IO">INVESTIGATING_OFFICER</option>
                            <option value="COURT_CLERK">COURT_CLERK</option>
                          </select>
                        </div>

                        <div className="col-span-2 border-t border-b border-slate-300 py-3 my-1">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Triple-Hash Protocol Verification
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={transferHash}
                              onChange={(e) => setTransferHash(e.target.value)}
                              placeholder="ENTER TRANSFER SEAL HASH (H1/H2/H3) FOR VERIFICATION"
                              className="flex-1 bg-white border border-slate-400 p-1.5 text-xs font-mono outline-none focus:border-slate-800 text-slate-700 uppercase"
                            />
                            <button
                              type="button"
                              onClick={() => setTransferHash(evidenceDetails?.hash_sha256 || '')}
                              className="px-2.5 bg-slate-200 border border-slate-400 hover:bg-slate-300 font-bold text-[9px] uppercase tracking-wider text-slate-700"
                            >
                              USE_REGISTERED
                            </button>
                          </div>
                          {hashVerificationStatus && (
                            <div className={`mt-2 text-[10px] font-mono font-bold flex items-center gap-1.5 ${hashVerificationStatus.matched ? 'text-green-700 bg-green-50 px-2 py-1 border border-green-300' : 'text-red-700 bg-red-50 px-2 py-1 border border-red-300'}`}>
                              {hashVerificationStatus.matched ? (
                                <>
                                  <CheckCircle2 size={12} /> HASH MATCHED: {hashVerificationStatus.details}
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={12} /> HASH MISMATCH: {hashVerificationStatus.details}
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authorization Notes / Remarks</label>
                          <input 
                            type="text"
                            value={transferNotes}
                            onChange={(e) => setTransferNotes(e.target.value)}
                            placeholder="Reason for transfer, seal verification confirmation, etc."
                            required
                            className="w-full bg-white border border-slate-400 p-1.5 text-xs font-mono outline-none focus:border-slate-800 text-slate-700"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={!transferTarget}
                          className="col-span-2 mt-2 w-full border-2 border-slate-800 bg-slate-800 text-white font-bold tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors text-xs"
                        >
                          <ArrowRight size={14} />
                          SUBMIT_SECURE_TRANSFER_SIGNOFF
                        </button>
                      </form>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
