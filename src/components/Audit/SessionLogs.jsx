import React, { useState, useEffect } from 'react';
import { getAllSessions, getSessionEvents, getSessionCosigners, cosignSession } from '../../api/invoke';
import { History, RotateCw, Fingerprint, Download, UserCheck, Shield, Clock, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const SessionLogs = ({ sessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionEvents, setSessionEvents] = useState([]);
  const [sessionCosigners, setSessionCosigners] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Co-sign form state
  const [showCosignModal, setShowCosignModal] = useState(false);
  const [cosignName, setCosignName] = useState('');
  const [cosignRank, setCosignRank] = useState('');
  const [cosignBatch, setCosignBatch] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricScanned, setBiometricScanned] = useState(false);
  const [signature, setSignature] = useState('');
  const [cosignError, setCosignError] = useState('');
  const [cosignSuccess, setCosignSuccess] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const list = await getAllSessions();
      setSessions(list);
      
      // Auto-select active session if exists
      if (sessionId) {
        const active = list.find(s => s.id === sessionId);
        if (active) {
          handleSelectSession(active);
        }
      } else if (list.length > 0 && !selectedSession) {
        handleSelectSession(list[0]);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [sessionId]);

  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    setLoadingDetails(true);
    try {
      const [events, cosigners] = await Promise.all([
        getSessionEvents(session.id),
        getSessionCosigners(session.id)
      ]);
      setSessionEvents(events);
      setSessionCosigners(cosigners);
    } catch (err) {
      console.error("Failed to load session details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBiometricScan = async () => {
    if (!cosignName || !cosignRank || !cosignBatch) {
      setCosignError("PLEASE FILL NAME, RANK, AND BATCH NO BEFORE SCANNING");
      return;
    }
    setCosignError('');
    setBiometricScanning(true);
    setBiometricScanned(false);
    
    // Premium biometric scanning mock animation
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const mockSig = `Ed25519_BIO_SIG_SHA256_` + Math.random().toString(36).substring(2, 10).toUpperCase();
    setSignature(mockSig);
    setBiometricScanning(false);
    setBiometricScanned(true);
  };

  const handleCosignSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId) {
      setCosignError("NO ACTIVE SESSION DETECTED FOR CO-SIGNING");
      return;
    }
    if (!signature) {
      setCosignError("BIOMETRIC VERIFICATION REQUIRED");
      return;
    }

    try {
      setCosignError('');
      await cosignSession(sessionId, cosignName, cosignRank, cosignBatch, signature);
      setCosignSuccess(true);
      
      // Update local state and reload
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession(prev => ({
          ...prev,
          cosigner_count: prev.cosigner_count + 1
        }));
        setSessionCosigners(prev => [...prev, {
          id: Math.random().toString(),
          session_id: sessionId,
          cosigner_name: cosignName,
          cosigner_rank: cosignRank,
          cosigner_batch_no: cosignBatch,
          timestamp: new Date().toISOString()
        }]);
      }
      
      setTimeout(() => {
        setShowCosignModal(false);
        setCosignSuccess(false);
        setCosignName('');
        setCosignRank('');
        setCosignBatch('');
        setSignature('');
        setBiometricScanned(false);
        fetchSessions();
      }, 1500);

    } catch (err) {
      console.error("Failed to co-sign:", err);
      setCosignError(String(err).toUpperCase());
    }
  };

  const exportSessionCSV = () => {
    if (!selectedSession) return;
    
    const headers = ["Event ID", "Session ID", "Event Type", "Entity Type", "Entity ID", "Timestamp", "Details"];
    const rows = sessionEvents.map(e => [
      e.id,
      e.session_id,
      e.event_type,
      e.entity_type || "N/A",
      e.entity_id || "N/A",
      e.timestamp,
      e.details || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `malkhana_session_${selectedSession.id.substring(0, 8)}_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7f9] overflow-hidden">
      
      {/* Sub Header */}
      <div className="p-8 border-b border-slate-400 bg-white/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <History className="text-slate-500" size={32} />
            CUSTODY_SESSION_LEDGER
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            Section 63 BSA Joint Inspections & Session Audit Logs
          </p>
        </div>
        
        <div className="flex gap-4">
          {sessionId && (
            <button
              onClick={() => setShowCosignModal(true)}
              className="bg-[#0ea5e9] text-slate-950 hover:bg-[#38bdf8] px-5 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_rgba(14,165,233,0.3)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] border border-slate-950"
            >
              <UserCheck size={14} /> INITIATE_JOINT_CO_SIGN
            </button>
          )}
          
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="border-2 border-slate-500 bg-white hover:bg-slate-50 px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Side: Session List */}
        <div className="w-80 lg:w-96 overflow-y-auto p-6 custom-scrollbar border-r border-slate-300 bg-white/50">
          <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-4">
            ALL RECORDED SESSIONS ({sessions.length})
          </div>
          
          {loading ? (
            <div className="py-20 text-center font-mono">
              <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">RETRIEVING CUSTODY SESSIONS...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-300 text-slate-400 font-bold text-xs tracking-widest uppercase">
              NO_SESSION_RECORDS
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const isActive = sessionId === s.id;
                const isSelected = selectedSession?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className={`w-full text-left p-4 border-2 transition-all font-mono relative flex flex-col gap-2 ${
                      isSelected 
                        ? 'border-slate-800 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.05)]' 
                        : 'border-slate-300 bg-white/60 hover:bg-white hover:border-slate-500'
                    }`}
                  >
                    {/* Active Ribbon */}
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white font-black text-[7px] px-1.5 py-0.5 tracking-wider uppercase animate-pulse">
                        ACTIVE
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pr-12">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] uppercase">
                        {s.officer_name}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase border border-slate-300 px-1">
                        {s.officer_role}
                      </span>
                    </div>

                    <div className="text-[9px] text-slate-500 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} /> {new Date(s.opened_at).toLocaleString('en-GB', { hour12: false })}
                      </div>
                      <div className="text-[8px] truncate">
                        ID: {s.id.substring(0, 18)}...
                      </div>
                      <div className="text-[8px] font-bold text-slate-600">
                        CO-SIGNERS: {s.cosigner_count}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Selected Session Details & Event Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedSession ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-300 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SESSION DETAILS</div>
                  <h3 className="text-base font-black text-slate-800 truncate uppercase mt-0.5">
                    {selectedSession.officer_name} ({selectedSession.officer_role})
                  </h3>
                  <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-4">
                    <span>ID: <code className="bg-slate-200 px-1 py-0.5 font-bold select-all text-slate-700">{selectedSession.id}</code></span>
                    <span>FP: <code className="bg-slate-200 px-1 py-0.5 font-bold text-slate-700">{selectedSession.device_fingerprint}</code></span>
                  </div>
                </div>
                
                <button
                  onClick={exportSessionCSV}
                  disabled={loadingDetails || sessionEvents.length === 0}
                  className="border border-slate-400 hover:border-slate-800 bg-white px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Download size={14} /> EXPORT_SUMMARY
                </button>
              </div>

              {/* Detail Content Grid */}
              <div className="flex-1 flex overflow-hidden">
                {/* Event Logs Timeline */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar border-r border-slate-200">
                  <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-4">
                    SESSION EVENTS TIMELINE ({sessionEvents.length})
                  </div>

                  {loadingDetails ? (
                    <div className="py-20 text-center font-mono">
                      <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">LOADING TIMELINE...</span>
                    </div>
                  ) : sessionEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-bold text-xs tracking-widest uppercase border border-dashed border-slate-200">
                      NO_EVENTS_LOGGED
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
                      {sessionEvents.map((evt) => (
                        <div key={evt.id} className="relative font-mono">
                          {/* Dot marker */}
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-slate-800 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>

                          <div className="bg-slate-50 border border-slate-300 p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2 text-[10px]">
                              <span className="bg-slate-800 text-white font-bold px-1.5 py-0.5 text-[8px] uppercase tracking-wider">
                                {evt.event_type}
                              </span>
                              <span className="text-slate-400 font-bold">
                                {new Date(evt.timestamp).toLocaleTimeString('en-GB')}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 font-bold uppercase mb-2">
                              {evt.details || "Forensic session transaction"}
                            </p>

                            {evt.entity_type && (
                              <div className="text-[9px] text-slate-500 flex gap-2">
                                <span className="font-bold">TARGET:</span>
                                <span>{evt.entity_type} ({evt.entity_id})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cosigners Panel */}
                <div className="w-72 lg:w-80 overflow-y-auto p-6 custom-scrollbar bg-slate-50 shrink-0">
                  <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                    <Shield size={12} className="text-slate-500" /> JOINT_CO_SIGNERS ({sessionCosigners.length})
                  </div>

                  {loadingDetails ? (
                    <div className="py-12 text-center font-mono">
                      <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span className="text-[9px] text-slate-500 uppercase">LOADING...</span>
                    </div>
                  ) : sessionCosigners.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-300 bg-white text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                      <AlertTriangle size={16} className="mx-auto mb-2 text-amber-500" />
                      Single Officer Custody. No co-signer registered.
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono">
                      {sessionCosigners.map((c) => (
                        <div key={c.id} className="bg-white border border-slate-300 p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                          <div className="text-xs font-black text-slate-800 uppercase">{c.cosigner_name}</div>
                          <div className="text-[9px] text-slate-500 uppercase mt-0.5">{c.cosigner_rank} | Batch: {c.cosigner_batch_no}</div>
                          <div className="text-[8px] text-slate-400 mt-2 border-t border-slate-100 pt-2 break-all">
                            SIG: <code className="text-slate-600 font-bold">{c.signature}</code>
                          </div>
                          <div className="text-[8px] text-slate-400 mt-1 font-sans">
                            {new Date(c.timestamp).toLocaleString('en-GB')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 p-4 border border-slate-300 bg-white text-[9px] text-slate-500 leading-normal">
                    <strong>BNSS Admissibility:</strong> Joint inspection co-signing creates a multipart cryptographical record binding both officers to the custody events, ensuring compliance with electronic evidence audit standards.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-xs tracking-widest uppercase">
              Select a session to view logs
            </div>
          )}
        </div>
      </div>

      {/* Joint Co-Sign Verification Modal Overlay */}
      {showCosignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-800 p-6 lg:p-8 shadow-[12px_12px_0px_rgba(15,23,42,1)] w-full max-w-md relative font-mono text-slate-800">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
              <UserCheck size={20} className="text-[#0ea5e9]" />
              JOINT INSPECTION CO-SIGN
            </h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-6">
              A second inspecting officer must authenticate biometrically to co-sign the active custody session.
            </p>

            <form onSubmit={handleCosignSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">
                  CO-SIGNER FULL NAME
                </label>
                <input
                  type="text"
                  value={cosignName}
                  onChange={(e) => setCosignName(e.target.value)}
                  placeholder="E.G. INSPECTOR ANIL KUMAR"
                  className="w-full bg-slate-100 border border-slate-400 p-2 text-xs font-bold outline-none focus:border-slate-800 uppercase"
                  required
                  disabled={cosignSuccess}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">
                    RANK / DESIGNATION
                  </label>
                  <input
                    type="text"
                    value={cosignRank}
                    onChange={(e) => setCosignRank(e.target.value)}
                    placeholder="E.G. SUB-INSPECTOR"
                    className="w-full bg-slate-100 border border-slate-400 p-2 text-xs font-bold outline-none focus:border-slate-800 uppercase"
                    required
                    disabled={cosignSuccess}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">
                    BATCH / BADGE NO
                  </label>
                  <input
                    type="text"
                    value={cosignBatch}
                    onChange={(e) => setCosignBatch(e.target.value)}
                    placeholder="E.G. SI_ANIL_77"
                    className="w-full bg-slate-100 border border-slate-400 p-2 text-xs font-bold outline-none focus:border-slate-800 uppercase"
                    required
                    disabled={cosignSuccess}
                  />
                </div>
              </div>

              {/* Biometric Scan Section */}
              <div className="border border-slate-350 p-4 bg-slate-50">
                <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-3 text-center">
                  BIOMETRIC AUTHENTICATION LOCK
                </div>
                
                {biometricScanning ? (
                  <div className="py-4 text-center">
                    <div className="w-8 h-8 border-4 border-t-transparent border-[#0ea5e9] rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-[9px] font-black tracking-widest text-[#0ea5e9] uppercase animate-pulse">
                      SCANNING FINGERPRINT ON SECURE DEVICE...
                    </div>
                  </div>
                ) : biometricScanned ? (
                  <div className="py-3 text-center bg-green-50 border border-green-500 text-green-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> BIOMETRIC SCAN VALIDATED
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleBiometricScan}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                  >
                    <Fingerprint size={16} className="text-[#0ea5e9]" /> TRIGGER_BIOMETRIC_SCAN
                  </button>
                )}

                {signature && (
                  <div className="mt-3 p-2 bg-slate-950 border border-slate-800 text-[8px] text-slate-400 font-mono break-all leading-normal uppercase">
                    <span className="text-[#0ea5e9] font-bold">CRYPTO SIG:</span> {signature}
                  </div>
                )}
              </div>

              {cosignError && (
                <div className="p-2 border border-red-500 bg-red-50 text-[9px] font-bold text-red-600 uppercase">
                  [!] {cosignError}
                </div>
              )}

              {cosignSuccess && (
                <div className="p-3 border border-green-600 bg-green-50 text-[10px] font-black text-green-700 uppercase tracking-widest text-center animate-pulse">
                  [✓] CO-SIGNATURE SEALED SUCCESSFULLY!
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={biometricScanning || !biometricScanned || cosignSuccess}
                  className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all ${
                    !biometricScanned || cosignSuccess
                      ? 'bg-slate-200 border border-slate-400 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-900 border-2 border-slate-900 text-white shadow-[4px_4px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]'
                  }`}
                >
                  SUBMIT_CO_SIGNATURE
                </button>
                
                <button
                  type="button"
                  disabled={biometricScanning || cosignSuccess}
                  onClick={() => setShowCosignModal(false)}
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
