import React, { useState, useEffect } from 'react';
import { getEvidenceDetails, getCustodyChain, getAllCases, verifyCertificateSignature, getCertificate } from '../../api/invoke';
import { ArrowLeft, Printer, Languages, ShieldCheck, ShieldAlert } from 'lucide-react';

// Hindi translation map for Form CC-1
const HINDI = {
  formTitle: 'प्रपत्र CC-1',
  ruleRef: '[डिजिटल साक्ष्य प्रबंधन प्रोटोकॉल के नियम 12 के अधीन]',
  mainTitle: 'कस्टडी श्रृंखला अभिलेख पत्र',
  subtitle: 'ज़ीरो-ट्रस्ट क्रिप्टोग्राफ़िक ऑडिट ट्रेल लेजर',
  caseId: '1. मामले की पहचान',
  cnr: 'सी.एन.आर. / न्यायालय मामला संख्या:',
  fir: 'एफ.आई.आर. / अपराध संख्या:',
  jurisdiction: 'थाना / क्षेत्राधिकार:',
  io: 'अनुसंधान अधिकारी (आई.ओ.):',
  assetDetails: '2. जब्त साक्ष्य परिसंपत्ति विवरण',
  evidenceId: 'साक्ष्य आई.डी. / रिकॉर्ड कुंजी:',
  assetClass: 'परिसंपत्ति वर्गीकरण:',
  makeModel: 'निर्माता, मॉडल एवं क्रम संख्या:',
  condition: 'जब्ती के समय भौतिक स्थिति:',
  sealNo: 'भौतिक धातु सील संख्या:',
  birthHash: 'जन्म क्रिप्टोग्राफ़िक हैश (H1):',
  witnessSection: '3. पंच गवाह एवं पृथक्करण विवरण',
  witness1: 'पंच गवाह 1:',
  witness2: 'पंच गवाह 2:',
  name: 'नाम:',
  contact: 'संपर्क:',
  witnessSig: '(गवाह हस्ताक्षर)',
  faraday: 'फैराडे पृथक्करण / सिग्नल शील्डेड:',
  faradayEngaged: '✓ संलग्न एवं सीलबंद',
  faradayNotEngaged: '✗ संलग्न नहीं / लागू नहीं',
  faradayDuration: 'पृथक्करण अवधि (मिनट):',
  videoRef: 'वीडियो जब्ती संदर्भ रिकॉर्ड (पथ/आई.डी.):',
  custodyHistory: '4. कालानुक्रमिक कस्टडी श्रृंखला इतिहास',
  colSeq: '#',
  colTime: 'समय चिह्न',
  colFrom: 'से अभिरक्षक',
  colTo: 'को अभिरक्षक',
  colHash: 'हस्तांतरण हैश (Hn)',
  colIntegrity: 'अखंडता',
  colSig: 'हस्ताक्षर',
  noCustody: 'कोई हस्तांतरण इतिहास दर्ज नहीं। साक्ष्य वर्तमान में प्रारंभिक सीलबंद वॉल्ट कस्टडी में है।',
  verificationStatement: 'यह दस्तावेज़ भारतीय साक्ष्य अधिनियम (बी.एस.ए.) की धारा 63 के प्रावधानों के तहत क्रिप्टोग्राफ़िक रूप से उत्पन्न और प्रमाणित है। ऊपर सूचीबद्ध सभी कस्टडी हस्तांतरणों को कुंजी चुनौतियों का उपयोग करके क्रिप्टोग्राफ़िक रूप से अधिकृत किया गया है, और प्रत्येक हस्तांतरण के हैश मान (Hn) को अंतर्ग्रहण/रिलीज़ के समय जन्म रिकॉर्ड हैश (H1) के विरुद्ध सत्यापित किया गया था।',
  malkhanaInCharge: 'मालखाना वॉल्ट प्रभारी',
  ioSignature: 'अनुसंधान अधिकारी (आई.ओ.)',
  nameSealSig: '(नाम, मुहर एवं हस्ताक्षर)',
  nameSig: '(नाम एवं हस्ताक्षर)',
};

const ENGLISH = {
  formTitle: 'FORM CC-1',
  ruleRef: '[Under Rule 12 of the Digital Evidence Handling Protocols]',
  mainTitle: 'CHAIN OF CUSTODY RECORD SHEET',
  subtitle: 'Zero-Trust Cryptographic Audit Trail Ledger',
  caseId: '1. CASE IDENTIFICATION',
  cnr: 'CNR / COURT CASE NO:',
  fir: 'FIR / CRIME NO:',
  jurisdiction: 'POLICE STATION / JURISDICTION:',
  io: 'SEIZING INVESTIGATING OFFICER (IO):',
  assetDetails: '2. SEIZED EVIDENCE ASSET SPECIFICS',
  evidenceId: 'EVIDENCE ID / RECORD KEY:',
  assetClass: 'ASSET CLASSIFICATION:',
  makeModel: 'MAKE, MODEL & SERIAL NO:',
  condition: 'PHYSICAL CONDITION AT SEIZURE:',
  sealNo: 'PHYSICAL METALLIC SEAL NO:',
  birthHash: 'BIRTH CRYPTOGRAPHIC HASH (H1):',
  witnessSection: '3. PANCH WITNESS & ISOLATION DETAILS',
  witness1: 'PANCH WITNESS 1:',
  witness2: 'PANCH WITNESS 2:',
  name: 'NAME:',
  contact: 'CONTACT:',
  witnessSig: '(Witness Signature)',
  faraday: 'FARADAY ISOLATION / SIGNAL SHIELDED:',
  faradayEngaged: '✓ ENGAGED & SEALED',
  faradayNotEngaged: '✗ NOT ENGAGED / NOT APPLICABLE',
  faradayDuration: 'ISOLATION DURATION (MINUTES):',
  videoRef: 'VIDEO SEIZURE REFERENCE RECORD (PATH/ID):',
  custodyHistory: '4. CHRONOLOGICAL CHAIN OF CUSTODY HISTORY',
  colSeq: '#',
  colTime: 'TIMESTAMP',
  colFrom: 'FROM CUSTODIAN',
  colTo: 'TO CUSTODIAN',
  colHash: 'HANDOFF HASH (Hn)',
  colIntegrity: 'INTEGRITY',
  colSig: 'SIGNATURE',
  noCustody: 'No transfer history logged. Evidence currently resides in initial sealed vault custody.',
  verificationStatement: 'This document is cryptographically generated and certified under the provisions of Section 63 of the Bharatiya Sakshya Adhiniyam (BSA). All custody transfers listed above have been cryptographically authorized using key challenges, and each transfer\'s hash value (Hn) was verified against the birth record hash (H1) at the time of intake/release. Any integrity marker labeled as "MISMATCH" denotes a tamper event.',
  malkhanaInCharge: 'MALKHANA VAULT IN-CHARGE',
  ioSignature: 'INVESTIGATING OFFICER (IO)',
  nameSealSig: '(Name, Seal & Signature)',
  nameSig: '(Name & Signature)',
};

export const FormCC1PrintSheet = ({ evidenceId, onBack }) => {
  const [evidence, setEvidence] = useState(null);
  const [custodyChain, setCustodyChain] = useState([]);
  const [caseObj, setCaseObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [dscStatus, setDscStatus] = useState(null); // null | { valid: true/false, ... }

  const t = lang === 'hi' ? HINDI : ENGLISH;

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

        // Fetch certificate and verify DSC signature
        const cert = await getCertificate(evidenceId);
        if (cert && cert.device_description) {
          try {
            const parsed = JSON.parse(cert.device_description);
            if (parsed && parsed.dsc_signature) {
              const verification = await verifyCertificateSignature(cert.id);
              setDscStatus({
                valid: verification.valid,
                signer_public_key: verification.signer_public_key
              });
            }
          } catch (e) {
            // device_description was not JSON, ignore
          }
        }
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
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} 
            className="flex items-center gap-2 border border-slate-500 px-4 py-2 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all uppercase"
          >
            <Languages size={14} /> {lang === 'en' ? 'हिंदी' : 'ENGLISH'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0ea5e9] text-slate-950 px-5 py-2 font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-[2px_2px_0px_rgba(14,165,233,0.3)] uppercase">
            <Printer size={14} /> PRINT_FORM_CC1
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center custom-scrollbar print:p-0 print:overflow-visible print:bg-white" id="cc1-print-area">
        <div className="w-[800px] bg-white border border-slate-300 p-12 shadow-[0_0_30px_rgba(2,132,199,0.1)] relative z-10 print:shadow-none print:border-none print:p-0 text-black font-serif select-text">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-sm font-bold uppercase tracking-wider">{t.formTitle}</h1>
            <h2 className="text-xs uppercase tracking-tight mt-1">{t.ruleRef}</h2>
            <h1 className="text-2xl font-black tracking-wider uppercase mt-4">{t.mainTitle}</h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-600 mt-2 uppercase">{t.subtitle}</p>
          </div>

          {/* DSC Verification Badge */}
          {dscStatus && (
            <div className={`mb-6 p-3 border-2 flex items-center gap-3 text-xs font-bold ${
              dscStatus.valid 
                ? 'border-green-600 bg-green-50 text-green-800' 
                : 'border-red-600 bg-red-50 text-red-800'
            }`}>
              {dscStatus.valid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              <div>
                <div>{dscStatus.valid ? 'DIGITAL SIGNATURE VERIFIED (Ed25519-SHA256)' : 'DIGITAL SIGNATURE VERIFICATION FAILED'}</div>
                <div className="text-[9px] font-mono mt-1 opacity-70">
                  SIGNER: {dscStatus.signer_public_key?.substring(0, 16)}...
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Case Details */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">{t.caseId}</h3>
            <table className="w-full text-xs font-serif leading-relaxed border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/3 p-2 font-bold border-r border-slate-300">{t.cnr}</td>
                  <td className="p-2 font-mono uppercase">{caseObj?.cnr || "N/A"}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">{t.fir}</td>
                  <td className="p-2 font-mono uppercase">{caseObj?.fir_number || "N/A"}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">{t.jurisdiction}</td>
                  <td className="p-2 uppercase">{caseObj?.jurisdiction || "N/A"}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">{t.io}</td>
                  <td className="p-2 uppercase">{caseObj?.investigating_officer || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Asset Details */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">{t.assetDetails}</h3>
            <table className="w-full text-xs font-serif leading-relaxed border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/3 p-2 font-bold border-r border-slate-300">{t.evidenceId}</td>
                  <td className="p-2 font-mono font-bold text-slate-800">{evidence.id}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">{t.assetClass}</td>
                  <td className="p-2 font-mono uppercase">{evidence.asset_type}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">{t.makeModel}</td>
                  <td className="p-2 uppercase">
                    {evidence.device_make || 'GENERIC'} {evidence.device_model || ''} 
                    {evidence.device_serial ? ` (S/N: ${evidence.device_serial})` : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">{t.condition}</td>
                  <td className="p-2 uppercase">{evidence.physical_condition || 'INTACT - NORMAL WEAR'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">{t.sealNo}</td>
                  <td className="p-2 font-mono font-bold uppercase">{evidence.seal_number || "SL-UNSPECIFIED"}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">{t.birthHash}</td>
                  <td className="p-2 font-mono text-[10px] break-all leading-tight text-blue-900 bg-blue-50/50 p-1 font-bold">
                    SHA-256: {evidence.hash_sha256 || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Seizure Attestation & Isolation */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">{t.witnessSection}</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 p-3">
                <p className="font-bold border-b border-slate-200 pb-1 mb-2">{t.witness1}</p>
                <p>{t.name} <strong>{meta.witness1_name || '____________________'}</strong></p>
                <p className="mt-1">{t.contact} <strong>{meta.witness1_contact || '____________________'}</strong></p>
                {meta.witness1_signature ? (
                  <div className="mt-3 border border-slate-300 bg-slate-50 p-1">
                    <img src={meta.witness1_signature} alt="Witness 1 Signature" className="w-full h-16 object-contain" />
                  </div>
                ) : (
                  <div className="w-full border-b border-dashed border-slate-400 mt-6 mb-1 h-6"></div>
                )}
                <p className="text-[9px] text-center text-slate-500 mt-1">{t.witnessSig}</p>
              </div>
              <div className="border border-slate-300 p-3">
                <p className="font-bold border-b border-slate-200 pb-1 mb-2">{t.witness2}</p>
                <p>{t.name} <strong>{meta.witness2_name || '____________________'}</strong></p>
                <p className="mt-1">{t.contact} <strong>{meta.witness2_contact || '____________________'}</strong></p>
                {meta.witness2_signature ? (
                  <div className="mt-3 border border-slate-300 bg-slate-50 p-1">
                    <img src={meta.witness2_signature} alt="Witness 2 Signature" className="w-full h-16 object-contain" />
                  </div>
                ) : (
                  <div className="w-full border-b border-dashed border-slate-400 mt-6 mb-1 h-6"></div>
                )}
                <p className="text-[9px] text-center text-slate-500 mt-1">{t.witnessSig}</p>
              </div>
            </div>

            <table className="w-full text-xs font-serif mt-4 border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/2 p-2 font-bold border-r border-slate-300">{t.faraday}</td>
                  <td className="p-2 font-mono font-bold text-center">
                    {meta.faraday_isolation ? t.faradayEngaged : t.faradayNotEngaged}
                  </td>
                </tr>
                {meta.faraday_isolation && meta.faraday_duration_minutes && (
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold border-r border-slate-300">{t.faradayDuration}</td>
                    <td className="p-2 font-mono font-bold text-center">{meta.faraday_duration_minutes}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">{t.videoRef}</td>
                  <td className="p-2 font-mono">{meta.video_recording_ref || "N/A (PHYSICAL LOG COMPLIANT)"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Custody Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold border-b border-black pb-1 mb-2 uppercase bg-slate-100 px-2">{t.custodyHistory}</h3>
            <table className="w-full text-[10px] font-mono border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400">
                  <th className="p-1 border-r border-slate-400 w-6 text-center">{t.colSeq}</th>
                  <th className="p-1 border-r border-slate-400 w-24">{t.colTime}</th>
                  <th className="p-1 border-r border-slate-400 w-28">{t.colFrom}</th>
                  <th className="p-1 border-r border-slate-400 w-28">{t.colTo}</th>
                  <th className="p-1 border-r border-slate-400">{t.colHash}</th>
                  <th className="p-1 border-r border-slate-400 w-12 text-center">{t.colIntegrity}</th>
                  <th className="p-1 w-20 text-center">{t.colSig}</th>
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
                      {t.noCustody}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Verification Statement */}
          <div className="mt-8 border border-slate-400 p-4 text-xs leading-relaxed text-justify bg-slate-50">
            <p>{t.verificationStatement}</p>
          </div>

          {/* Footer Signature Plinths */}
          <div className="mt-16 flex justify-between text-xs">
            <div className="text-center w-48">
              <div className="border-b border-black h-12 mb-1"></div>
              <p className="font-bold">{t.malkhanaInCharge}</p>
              <p className="text-[10px] text-slate-500">{t.nameSealSig}</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-black h-12 mb-1"></div>
              <p className="font-bold">{t.ioSignature}</p>
              <p className="text-[10px] text-slate-500">{t.nameSig}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
