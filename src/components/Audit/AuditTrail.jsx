import React, { useState, useEffect } from 'react';
import { getAuditLog, verifyAuditLogTrail } from '../../api/invoke';
import { ShieldCheck, ShieldAlert, CheckCircle2, History, RotateCw, Fingerprint } from 'lucide-react';

export const AuditTrail = ({ onBack }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const list = await getAuditLog();
      // Reverse logs to show most recent at the top
      setLogs([...list].reverse());
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerifyTrail = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      // Simulate high-security check delay for visual polish
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await verifyAuditLogTrail(); // { verified: boolean, root_hash: string }
      setVerificationResult(res);
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationResult({ verified: false, error: err.toString() });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7f9] overflow-hidden">
      
      {/* Sub Header */}
      <div className="p-8 border-b border-slate-400 bg-white/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <History className="text-slate-500" size={32} />
            AUDIT_TRAIL_LEDGER
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            Section 63 BSA Tamper-Evident Cryptographic Chain
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="border-2 border-slate-500 bg-white hover:bg-slate-50 px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
          </button>
          
          <button
            onClick={handleVerifyTrail}
            disabled={verifying}
            className="bg-slate-800 border-2 border-slate-800 text-white hover:bg-slate-700 px-5 py-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <Fingerprint size={14} className={verifying ? 'animate-pulse' : ''} />
            {verifying ? 'COMPUTING_ROOT...' : 'VERIFY_VAULT_INTEGRITY'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side logs list, Right Side cryptographic integrity details */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Side: Audit Log History */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar border-r border-slate-300">
          {loading ? (
            <div className="h-full flex items-center justify-center font-mono">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-t-transparent border-[#0ea5e9] rounded-full animate-spin mx-auto" />
                <p className="text-xs uppercase tracking-widest text-slate-500">QUERYING IMMUTABLE AUDIT LOGS...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 font-bold text-xs tracking-widest">
              NO_AUDIT_LOG_RECORDS_DETECTED
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log, index) => (
                <div 
                  key={log.id} 
                  className="bg-white border-2 border-slate-400 p-6 relative hover:border-slate-800 transition-colors shadow-[4px_4px_0px_rgba(100,116,139,0.1)]"
                >
                  {/* Connected line visual representation */}
                  {index < logs.length - 1 && (
                    <div className="absolute left-10 -bottom-9 w-0.5 h-6 border-l-2 border-dashed border-slate-400 z-0"></div>
                  )}

                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-white font-mono font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString('en-GB', { hour12: false })}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-600">
                      ID: {log.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-4 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">ACTOR</span>
                      <span className="font-bold text-slate-800 uppercase">{log.actor}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">TARGET LAYER</span>
                      <span className="font-bold text-slate-800 uppercase">{log.entity_type} ({log.entity_id})</span>
                    </div>
                  </div>

                  {log.notes && (
                    <div className="bg-slate-50 border border-slate-300 p-3 mb-4">
                      <p className="text-xs text-slate-700 leading-relaxed font-mono uppercase">{log.notes}</p>
                    </div>
                  )}

                  {/* Hash block */}
                  <div className="flex items-center gap-4 bg-slate-900 text-slate-300 p-3 font-mono text-[9px] border border-slate-800">
                    <span className="text-[#0ea5e9] font-bold uppercase select-none flex-shrink-0">ENTRY_HASH</span>
                    <span className="break-all font-bold select-all">{log.entry_hash}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Cryptographic Integrity Verification Panel */}
        <div className="w-96 bg-white p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between flex-shrink-0 shadow-inner">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-wider border-b-2 border-slate-800 pb-2 mb-4 uppercase">
                INTEGRITY_SCANNER
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This panel executes an absolute validation of the audit trail database. It recalculates SHA-256 hashes of each audit entry, chains them sequentially (Merkle verification), and checks if the chain matches the root state.
              </p>
            </div>

            {/* Results Display */}
            {verifying && (
              <div className="border-2 border-dashed border-[#0ea5e9] bg-sky-50/50 p-6 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="text-xs font-black tracking-widest text-[#0ea5e9] uppercase animate-pulse">
                  COMPUTING MERKLE PATHS...
                </div>
              </div>
            )}

            {!verifying && verificationResult && (
              <div className={`border-2 p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] ${
                verificationResult.verified 
                  ? 'border-green-600 bg-green-50/50 text-green-900' 
                  : 'border-red-600 bg-red-50/50 text-red-900'
              }`}>
                <div className="flex items-center gap-3">
                  {verificationResult.verified ? (
                    <ShieldCheck size={28} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <ShieldAlert size={28} className="text-red-600 flex-shrink-0" />
                  )}
                  <h4 className="text-xs font-black uppercase tracking-widest">
                    {verificationResult.verified ? 'CHAIN INTEGRITY SECURE' : 'TAMPER EVENT DETECTED'}
                  </h4>
                </div>

                <div className="space-y-3 font-mono text-[10px]">
                  <div>
                    <span className="block font-sans font-bold text-slate-500 uppercase">MERKLE ROOT HASH</span>
                    <span className="break-all font-bold block bg-white/70 p-2 border border-slate-200 mt-1">
                      {verificationResult.root_hash || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block font-sans font-bold text-slate-500 uppercase">VERIFICATION STATUS</span>
                    <span className="font-bold flex items-center gap-1.5 mt-1">
                      {verificationResult.verified ? (
                        <>
                          <CheckCircle2 size={12} className="text-green-600" />
                          LEGAL ADMISSIBILITY VALIDATED
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 bg-red-600 inline-block animate-ping rounded-full mr-1"></span>
                          DATABASE ALTERATION DETECTED
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!verifying && !verificationResult && (
              <div className="border-2 border-slate-300 bg-slate-50 p-6 text-center text-slate-400 text-xs font-bold font-mono tracking-widest uppercase">
                Awaiting Scanner Trigger
              </div>
            )}
          </div>

          {/* Quick Legal Footnote */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-[10px] text-slate-500 leading-normal">
            <strong>Forensic Advisory:</strong> In accordance with Digital Preservation Rules, the audit root signature should remain locked and verified daily to retain Section 63 BSA legal validity in judicial proceedings.
          </div>
        </div>

      </div>
    </div>
  );
};
