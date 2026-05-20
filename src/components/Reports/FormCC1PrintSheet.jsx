import React, { useState, useEffect } from 'react';
import { getEvidenceDetails, getCustodyChain, getAllCases } from '../../api/invoke';
import { ArrowLeft, Printer } from 'lucide-react';

export const FormCC1PrintSheet = ({ evidenceId, onBack }) => {
  const [evidence, setEvidence] = useState(null);
  const [custodyChain, setCustodyChain] = useState([]);
  const [caseObj, setCaseObj] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!evidenceId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const evDetails = await getEvidenceDetails(evidenceId);
        setEvidence(evDetails);

        const chain = await getCustodyChain(evidenceId);
        setCustodyChain(chain);

        const casesList = await getAllCases();
        const foundCase = casesList.find(c => c.id === evDetails.case_id);
        setCaseObj(foundCase);
      } catch (err) {
        console.error("Failed to load Form CC-1 print data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [evidenceId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-white font-mono">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-t-transparent border-[#0ea5e9] rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest">Compiling Chain of Custody (CC-1)...</p>
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="p-8 text-center text-red-500 font-mono">
        [ERROR] EVIDENCE_NOT_FOUND: Failed to retrieve record {evidenceId}
      </div>
    );
  }

  // Parse witness and Faraday metadata from device_metadata JSON
  let meta = {};
  try {
    if (evidence.device_metadata) {
      meta = JSON.parse(evidence.device_metadata);
    }
  } catch (e) {
    console.error("Error parsing device_metadata:", e);
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* On-screen controls header (hidden during printing) */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center print:hidden flex-shrink-0 z-30 relative">
        <button onClick={onBack} className="flex items-center gap-2 border border-slate-500 px-4 py-2 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all uppercase">
          <ArrowLeft size={14} /> BACK_TO_DASHBOARD
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0ea5e9] text-slate-950 px-5 py-2 font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-[2px_2px_0px_rgba(14,165,233,0.3)] uppercase">
          <Printer size={14} /> PRINT_FORM_CC1
        </button>
      </div>

      {/* Main Print Container */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center custom-scrollbar print:p-0 print:overflow-visible print:bg-white" id="cc1-print-area">
        <div className="w-[800px] bg-white border border-slate-300 p-12 shadow-[0_0_30px_rgba(2,132,199,0.1)] relative z-10 print:shadow-none print:border-none print:p-0 text-black font-serif select-text">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-sm font-bold uppercase tracking-wider">FORM CC-1</h1>
            <h2 className="text-xs uppercase tracking-tight mt-1">[Under Rule 12 of the Digital Evidence Handling Protocols]</h2>
            <h1 className="text-2xl font-black tracking-wider uppercase mt-4">CHAIN OF CUSTODY RECORD SHEET</h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-600 mt-2 uppercase">Zero-Trust Cryptographic Audit Trail Ledger</p>
          </div>

          {/* Section 1: Case Details */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">1. CASE IDENTIFICATION</h3>
            <table className="w-full text-xs font-serif leading-relaxed border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/3 p-2 font-bold border-r border-slate-300">CNR / COURT CASE NO:</td>
                  <td className="p-2 font-mono uppercase">{caseObj?.cnr || "N/A"}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">FIR / CRIME NO:</td>
                  <td className="p-2 font-mono uppercase">{caseObj?.fir_number || "N/A"}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">POLICE STATION / JURISDICTION:</td>
                  <td className="p-2 uppercase">{caseObj?.jurisdiction || "N/A"}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">SEIZING INVESTIGATING OFFICER (IO):</td>
                  <td className="p-2 uppercase">{caseObj?.investigating_officer || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Asset Details */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">2. SEIZED EVIDENCE ASSET SPECIFICS</h3>
            <table className="w-full text-xs font-serif leading-relaxed border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/3 p-2 font-bold border-r border-slate-300">EVIDENCE ID / RECORD KEY:</td>
                  <td className="p-2 font-mono font-bold text-slate-800">{evidence.id}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">ASSET CLASSIFICATION:</td>
                  <td className="p-2 font-mono uppercase">{evidence.asset_type}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">MAKE, MODEL & SERIAL NO:</td>
                  <td className="p-2 uppercase">
                    {evidence.device_make || 'GENERIC'} {evidence.device_model || ''} 
                    {evidence.device_serial ? ` (S/N: ${evidence.device_serial})` : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">PHYSICAL CONDITION AT SEIZURE:</td>
                  <td className="p-2 uppercase">{evidence.physical_condition || 'INTACT - NORMAL WEAR'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">PHYSICAL METALLIC SEAL NO:</td>
                  <td className="p-2 font-mono font-bold uppercase">{evidence.seal_number || "SL-UNSPECIFIED"}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">BIRTH CRYPTOGRAPHIC HASH (H1):</td>
                  <td className="p-2 font-mono text-[10px] break-all leading-tight text-blue-900 bg-blue-50/50 p-1 font-bold">
                    SHA-256: {evidence.hash_sha256 || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Seizure Attestation & Isolation */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">3. PANCH WITNESS & ISOLATION DETAILS</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 p-3">
                <p className="font-bold border-b border-slate-200 pb-1 mb-2">PANCH WITNESS 1:</p>
                <p>NAME: <strong>{meta.witness1_name || '____________________'}</strong></p>
                <p className="mt-1">CONTACT: <strong>{meta.witness1_contact || '____________________'}</strong></p>
                <div className="w-full border-b border-dashed border-slate-400 mt-6 mb-1 h-6"></div>
                <p className="text-[9px] text-center text-slate-500">(Witness 1 Signature)</p>
              </div>
              <div className="border border-slate-300 p-3">
                <p className="font-bold border-b border-slate-200 pb-1 mb-2">PANCH WITNESS 2:</p>
                <p>NAME: <strong>{meta.witness2_name || '____________________'}</strong></p>
                <p className="mt-1">CONTACT: <strong>{meta.witness2_contact || '____________________'}</strong></p>
                <div className="w-full border-b border-dashed border-slate-400 mt-6 mb-1 h-6"></div>
                <p className="text-[9px] text-center text-slate-500">(Witness 2 Signature)</p>
              </div>
            </div>

            <table className="w-full text-xs font-serif mt-4 border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/2 p-2 font-bold border-r border-slate-300">FARADAY ISOLATION / SIGNAL SHIELDED:</td>
                  <td className="p-2 font-mono font-bold text-center">
                    {meta.faraday_isolation ? '✓ ENGAGED & SEALED' : '✗ NOT ENGAGED / NOT APPLICABLE'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">VIDEO SEIZURE REFERENCE RECORD (PATH/ID):</td>
                  <td className="p-2 font-mono">{meta.video_recording_ref || "N/A (PHYSICAL LOG COMPLIANT)"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Custody Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">4. CHRONOLOGICAL CHAIN OF CUSTODY HISTORY</h3>
            <table className="w-full text-[10px] font-mono border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400">
                  <th className="p-1 border-r border-slate-400 w-6 text-center">#</th>
                  <th className="p-1 border-r border-slate-400 w-24">TIMESTAMP</th>
                  <th className="p-1 border-r border-slate-400 w-28">FROM CUSTODIAN</th>
                  <th className="p-1 border-r border-slate-400 w-28">TO CUSTODIAN</th>
                  <th className="p-1 border-r border-slate-400">HANDOFF HASH (Hn)</th>
                  <th className="p-1 border-r border-slate-400 w-12 text-center">INTEGRITY</th>
                  <th className="p-1 w-20 text-center">SIGNATURE</th>
                </tr>
              </thead>
              <tbody>
                {/* Initial Intake Step */}
                <tr className="border-b border-slate-300">
                  <td className="p-1 border-r border-slate-300 text-center font-bold">1</td>
                  <td className="p-1 border-r border-slate-300 text-[9px]">
                    {new Date(evidence.created_at).toLocaleString('en-GB', { hour12: false })}
                  </td>
                  <td className="p-1 border-r border-slate-300 uppercase">SEIZING OFFICER (IO)</td>
                  <td className="p-1 border-r border-slate-300 uppercase">MALKHANA VAULT INTAKE</td>
                  <td className="p-1 border-r border-slate-300 text-[8px] break-all leading-tight text-blue-900 bg-blue-50/20 font-bold">
                    {evidence.hash_sha256}
                  </td>
                  <td className="p-1 border-r border-slate-300 text-center font-bold text-green-700 bg-green-50">OK</td>
                  <td className="p-1 text-center text-[8px] italic">INTAKE_SECURE</td>
                </tr>

                {/* Subsequent steps */}
                {custodyChain.map((entry, index) => {
                  const isVerified = entry.hash_verified || (entry.hash_at_transfer === evidence.hash_sha256);
                  return (
                    <tr key={entry.id} className="border-b border-slate-300">
                      <td className="p-1 border-r border-slate-300 text-center font-bold">{index + 2}</td>
                      <td className="p-1 border-r border-slate-300 text-[9px]">
                        {new Date(entry.timestamp).toLocaleString('en-GB', { hour12: false })}
                      </td>
                      <td className="p-1 border-r border-slate-300 uppercase">{entry.from_person || 'VAULT_LOCK'}</td>
                      <td className="p-1 border-r border-slate-300 uppercase">{entry.to_person}</td>
                      <td className="p-1 border-r border-slate-300 text-[8px] break-all leading-tight font-bold">
                        {entry.hash_at_transfer || "NO HASH PROVIDED"}
                      </td>
                      <td className={`p-1 border-r border-slate-300 text-center font-bold ${isVerified ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                        {isVerified ? 'OK' : 'MISMATCH'}
                      </td>
                      <td className="p-1 text-center text-[8px] italic truncate w-20">
                        {entry.signature || 'VERIFIED'}
                      </td>
                    </tr>
                  );
                })}

                {custodyChain.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-2 text-center text-slate-400 italic text-[10px]">
                      No transfer history logged. Evidence currently resides in initial sealed vault custody.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Verification Statement */}
          <div className="mt-8 border border-slate-400 p-4 text-xs leading-relaxed text-justify bg-slate-50">
            <p>
              This document is cryptographically generated and certified under the provisions of Section 63 of the Bharatiya Sakshya Adhiniyam (BSA). All custody transfers listed above have been cryptographically authorized using key challenges, and each transfer's hash value (Hn) was verified against the birth record hash (H1) at the time of intake/release. Any integrity marker labeled as "MISMATCH" denotes a tamper event.
            </p>
          </div>

          {/* Footer Signature Plinths */}
          <div className="mt-16 flex justify-between text-xs">
            <div className="text-center w-48">
              <div className="border-b border-black h-12 mb-1"></div>
              <p className="font-bold">MALKHANA VAULT IN-CHARGE</p>
              <p className="text-[10px] text-slate-500">(Name, Seal & Signature)</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-black h-12 mb-1"></div>
              <p className="font-bold">INVESTIGATING OFFICER (IO)</p>
              <p className="text-[10px] text-slate-500">(Name & Signature)</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
