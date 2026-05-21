import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Lock, 
  CheckCircle2, 
  Fingerprint 
} from 'lucide-react';
import { Stamp } from '../shared/Stamp';
import { getEvidenceForCertificate, generateCertificate, getEvidenceDetails } from '../../api/invoke';

export const IndCheckbox = ({ label, checked, onChange, disabled }) => (
  <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
    <div className={`w-4 h-4 border-2 p-0.5 flex items-center justify-center transition-colors ${checked ? 'border-slate-800' : 'border-slate-400 group-hover:border-slate-600'}`}>
       <div className={`w-full h-full bg-slate-800 transition-transform duration-100 ${checked ? 'scale-100' : 'scale-0'}`} />
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
  </label>
);

export const ReportsDraftingTable = ({ currentUser, initialEvidenceId, onClearInitial }) => {
  const [localLang, setLocalLang] = useState('en');
  
  const hindiLabels = {
    part_a: "भाग क: अभिरक्षक",
    evidence_source: "साक्ष्य स्रोत",
    select_evidence: "-- साक्ष्य चुनें --",
    custodian_name: "अधिकारी / अभिरक्षक का नाम",
    required: "आवश्यक",
    custodian_parent: "अभिरक्षक के पिता/माता/पति/पत्नी",
    custodian_parent_placeholder: "अभिरक्षक के अभिभावक/पति/पत्नी",
    custodian_address: "अभिरक्षक का पता",
    custodian_address_placeholder: "आवासीय / कार्यालय का पता",
    designation: "पद (डिजाइनेशन)",
    seal_number: "सील संख्या (सील नंबर)",
    device_specifics: "उपकरण का विवरण",
    make: "निर्माता (मेक)",
    model: "मॉडल",
    color: "रंग",
    serial: "क्रम संख्या (सीरियल नंबर)",
    imei: "आईएमईआई / यूआईडी / मैक",
    imei_placeholder: "आईएमईआई / मैक पता",
    other_info: "कोई अन्य विवरण",
    other_info_placeholder: "अतिरिक्त उपकरण विवरण",
    device_category: "उपकरण की श्रेणी",
    lock_part_a: "भाग क को लॉक करें और आगे बढ़ें",
    unlock_part_a: "भाग क को अनलॉक करें",
    part_b: "भाग ख: विशेषज्ञ",
    examiner_name: "परीक्षक का नाम",
    examiner_parent: "परीक्षक के पिता/माता/पति/पत्नी",
    examiner_parent_placeholder: "परीक्षक के अभिभावक/पति/पत्नी",
    examiner_address: "परीक्षक का पता",
    examiner_address_placeholder: "प्रयोगशाला का पता",
    lab_id: "प्रयोगशाला पहचानकर्ता",
    hash_alg: "हैश एल्गोरिदम",
    place: "सत्यापन का स्थान",
    place_placeholder: "हस्ताक्षर करने का स्थान",
    auth_plinth: "प्राधिकरण प्लिंथ",
    secured: "सुरक्षित",
    hold_to_seal: "सील करने के लिए दबाए रखें",
    document_immutable: "दस्तावेज़ सुरक्षित है",
    print_certificate: "प्रमाण पत्र प्रिंट करें (PDF)"
  };

  const getLabel = (key, defaultText) => localLang === 'hi' ? hindiLabels[key] || defaultText : defaultText;

  const [availableEvidence, setAvailableEvidence] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [originalHash, setOriginalHash] = useState('');
  const [data, setData] = useState({
    custodianName: '',
    custodianParent: '',
    custodianAddress: '',
    designation: '',
    sealNumber: '',
    deviceType: 'MOBILE_DEVICE',
    deviceMake: '',
    deviceModel: '',
    deviceColor: '',
    deviceSerial: '',
    deviceImei: '',
    deviceDescription: '',
    controlType: 'MAINTAINED',
    examinerName: currentUser ? (currentUser.full_name || currentUser.username) : '',
    examinerParent: '',
    examinerAddress: '',
    labId: 'LAB-CYB-09',
    hashAlg: 'SHA-256',
    place: 'DELHI',
  });
  const [isPartAComplete, setIsPartAComplete] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signProgress, setSignProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [finalHash, setFinalHash] = useState('');

  useEffect(() => {
    // Load evidence dropdown items on mount
    getEvidenceForCertificate().then(list => {
      setAvailableEvidence(list);
      if (initialEvidenceId) {
        const item = list.find(e => e.id === initialEvidenceId);
        if (item) {
          setSelectedEvidenceId(initialEvidenceId);
          setOriginalHash(item.hash_sha256 || 'NO_HASH_AVAILABLE');
          
          let mappedType = 'COMPUTER_SYSTEM';
          if (item.asset_type === 'DISK' || item.asset_type === 'COMPUTER') mappedType = 'COMPUTER_SYSTEM';
          else if (item.asset_type === 'MOBILE') mappedType = 'MOBILE_DEVICE';
          else if (item.asset_type === 'CCTV') mappedType = 'CCTV_DVR_NVR';

          setData(prev => ({
            ...prev,
            sealNumber: item.seal_number || '',
            deviceType: mappedType
          }));

          // Load details
          getEvidenceDetails(initialEvidenceId).then(details => {
            if (details) {
              setData(prev => ({
                ...prev,
                sealNumber: details.seal_number || item.seal_number || '',
                deviceMake: details.device_make || '',
                deviceModel: details.device_model || '',
                deviceColor: details.device_color || '',
                deviceSerial: details.device_serial || '',
                deviceImei: details.device_imei || '',
                deviceDescription: details.description || '',
              }));
            }
          }).catch(console.error);
        }
        if (onClearInitial) onClearInitial();
      }
    }).catch(console.error);
  }, [initialEvidenceId]);

  useEffect(() => {
    let timer;
    if (isSigning && !isLocked) {
      timer = setInterval(() => {
        setSignProgress(p => {
          if (p >= 100) { 
            // Progress hit 100%, trigger sealing
            setIsLocked(true); 
            handleSealDocument();
            return 100; 
          }
          return p + 3;
        });
      }, 100);
    } else {
      if (!isLocked) {
        timer = setTimeout(() => setSignProgress(0), 0);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSigning, isLocked]);

  const handleSealDocument = async () => {
    try {
      const input = {
        evidence_id: selectedEvidenceId,
        custodian_name: data.custodianName,
        custodian_parent: data.custodianParent || null,
        custodian_address: data.custodianAddress || null,
        designation: data.designation,
        seal_number: data.sealNumber,
        device_type: data.deviceType,
        device_description: `${data.deviceMake || ''} ${data.deviceModel || ''} ${data.deviceColor ? '(' + data.deviceColor + ')' : ''} S/N:${data.deviceSerial || ''} IMEI:${data.deviceImei || ''} ${data.deviceDescription || ''}`.trim() || null,
        control_type: data.controlType,
        examiner_name: data.examinerName,
        examiner_parent: data.examinerParent || null,
        examiner_address: data.examinerAddress || null,
        lab_id: data.labId,
        hash_algorithm: data.hashAlg,
      };
      const cert = await generateCertificate(input);
      setFinalHash(cert.document_hash);
      
      // Auto-trigger print with a slight delay for the stamp-drop animation
      setTimeout(() => {
        window.print();
      }, 800);
    } catch (e) {
      console.error("Failed to generate certificate:", e);
      setIsLocked(false);
      setSignProgress(0);
    }
  };

  const handleEvidenceSelect = async (id) => {
    setSelectedEvidenceId(id);
    if (!id) {
      setOriginalHash('');
      return;
    }
    const item = availableEvidence.find(e => e.id === id);
    if (item) {
      setOriginalHash(item.hash_sha256 || 'NO_HASH_AVAILABLE');
      updateField('sealNumber', item.seal_number || '');
      // Map basic asset types to cert device categories
      let mappedType = 'COMPUTER_SYSTEM';
      if (item.asset_type === 'DISK' || item.asset_type === 'COMPUTER') mappedType = 'COMPUTER_SYSTEM';
      else if (item.asset_type === 'MOBILE') mappedType = 'MOBILE_DEVICE';
      else if (item.asset_type === 'CCTV') mappedType = 'CCTV_DVR_NVR';
      
      updateField('deviceType', mappedType);
    }

    try {
      const details = await getEvidenceDetails(id);
      if (details) {
        setData(prev => ({
          ...prev,
          sealNumber: details.seal_number || prev.sealNumber || '',
          deviceMake: details.device_make || '',
          deviceModel: details.device_model || '',
          deviceColor: details.device_color || '',
          deviceSerial: details.device_serial || '',
          deviceImei: details.device_imei || '',
          deviceDescription: details.description || '',
        }));
      }
    } catch (err) {
      console.error("Failed to load evidence details:", err);
    }
  };

  const updateField = (field, value) => { if (!isLocked) setData(prev => ({ ...prev, [field]: value })); };
  
  const missingA = !selectedEvidenceId || !data.custodianName || !data.sealNumber || !data.designation;
  const missingB = !data.examinerName || !data.labId;
  const crosshatchClass = "bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(220,38,38,0.15)_4px,rgba(220,38,38,0.15)_8px)] border-red-400";
  const getInputClass = (val) => `w-full bg-white/50 border outline-none px-3 py-2 text-sm font-bold text-slate-800 transition-all uppercase placeholder:text-slate-400 placeholder:font-normal ${!val && !isLocked ? crosshatchClass : 'border-slate-400 focus:border-slate-800 focus:bg-white'}`;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative z-10">
      {/* Left Panel: Inputs */}
      <div className={`w-full lg:w-[450px] border-b lg:border-b-0 border-r-0 lg:border-r border-slate-400 flex flex-col relative z-20 flex-shrink-0 ${isLocked ? 'grayscale pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-400 bg-[#e2e8f0]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-light tracking-tight flex items-center gap-3">
              <FileSignature className="text-slate-700" size={24} />
              <span className="font-bold text-slate-800">SEC_63_DRAFTING</span>
            </h2>
            
            {/* English/Hindi Toggle Group */}
            <div className="flex font-mono text-[10px] border border-slate-400 bg-white shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
              <button 
                onClick={() => setLocalLang('en')}
                className={`px-2.5 py-1 font-bold ${localLang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLocalLang('hi')}
                className={`px-2.5 py-1 font-bold border-l border-slate-400 ${localLang === 'hi' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                हिंदी
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-mono uppercase tracking-widest">Procedural Control Vault</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* PART A FORM */}
          <div className="border border-slate-400 bg-white shadow-[4px_4px_0px_rgba(100,116,139,0.1)] relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 tracking-widest">{getLabel('part_a', 'PART A: CUSTODIAN')}</h3>
              {isPartAComplete && <CheckCircle2 size={16} className="text-slate-600" />}
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('evidence_source', 'EVIDENCE SOURCE')}</label>
                <select value={selectedEvidenceId} onChange={e => handleEvidenceSelect(e.target.value)} disabled={isLocked} className={getInputClass(selectedEvidenceId)}>
                  <option value="">{getLabel('select_evidence', '-- SELECT EVIDENCE --')}</option>
                  {availableEvidence.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title} ({ev.case_fir})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('custodian_name', 'OFFICER / CUSTODIAN NAME')}</label>
                <input type="text" value={data.custodianName} onChange={e => updateField('custodianName', e.target.value)} className={getInputClass(data.custodianName)} placeholder={getLabel('required', 'REQUIRED')} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('custodian_parent', 'CUSTODIAN PARENT (S/O, D/O, W/O)')}</label>
                <input type="text" value={data.custodianParent} onChange={e => updateField('custodianParent', e.target.value)} className={getInputClass(data.custodianParent)} placeholder={getLabel('custodian_parent_placeholder', "CUSTODIAN'S PARENT/SPOUSE")} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('custodian_address', 'CUSTODIAN ADDRESS')}</label>
                <input type="text" value={data.custodianAddress} onChange={e => updateField('custodianAddress', e.target.value)} className={getInputClass(data.custodianAddress)} placeholder={getLabel('custodian_address_placeholder', 'RESIDENTIAL/OFFICE ADDRESS')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('designation', 'DESIGNATION')}</label>
                  <input type="text" value={data.designation} onChange={e => updateField('designation', e.target.value)} className={getInputClass(data.designation)} placeholder={getLabel('required', 'REQUIRED')} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('seal_number', 'SEAL NUMBER')}</label>
                  <input type="text" value={data.sealNumber} onChange={e => updateField('sealNumber', e.target.value)} className={getInputClass(data.sealNumber)} placeholder={getLabel('required', 'REQUIRED')} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-4">
                <h4 className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{getLabel('device_specifics', 'DEVICE SPECIFICS')}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">{getLabel('make', 'MAKE')}</label>
                    <input type="text" value={data.deviceMake} onChange={e => updateField('deviceMake', e.target.value)} className={getInputClass(data.deviceMake)} placeholder={getLabel('make', 'MAKE')} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">{getLabel('model', 'MODEL')}</label>
                    <input type="text" value={data.deviceModel} onChange={e => updateField('deviceModel', e.target.value)} className={getInputClass(data.deviceModel)} placeholder={getLabel('model', 'MODEL')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">{getLabel('color', 'COLOR')}</label>
                    <input type="text" value={data.deviceColor} onChange={e => updateField('deviceColor', e.target.value)} className={getInputClass(data.deviceColor)} placeholder={getLabel('color', 'COLOR')} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">{getLabel('serial', 'SERIAL NUMBER')}</label>
                    <input type="text" value={data.deviceSerial} onChange={e => updateField('deviceSerial', e.target.value)} className={getInputClass(data.deviceSerial)} placeholder={getLabel('serial', 'SERIAL')} />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">{getLabel('imei', 'IMEI/UID/MAC')}</label>
                  <input type="text" value={data.deviceImei} onChange={e => updateField('deviceImei', e.target.value)} className={getInputClass(data.deviceImei)} placeholder={getLabel('imei_placeholder', 'IMEI / MAC ADDRESS')} />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">{getLabel('other_info', 'ANY OTHER INFO / DESCRIPTION')}</label>
                  <input type="text" value={data.deviceDescription} onChange={e => updateField('deviceDescription', e.target.value)} className={getInputClass(data.deviceDescription)} placeholder={getLabel('other_info_placeholder', 'ADDITIONAL DEVICE DESCRIPTION')} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 mb-3">{getLabel('device_category', 'DEVICE CATEGORY')}</label>
                <div className="space-y-3">
                  <IndCheckbox label="COMPUTER_SYSTEM" checked={data.deviceType === 'COMPUTER_SYSTEM'} onChange={() => updateField('deviceType', 'COMPUTER_SYSTEM')} />
                  <IndCheckbox label="MOBILE_DEVICE" checked={data.deviceType === 'MOBILE_DEVICE'} onChange={() => updateField('deviceType', 'MOBILE_DEVICE')} />
                  <IndCheckbox label="CCTV_DVR_NVR" checked={data.deviceType === 'CCTV_DVR_NVR'} onChange={() => updateField('deviceType', 'CCTV_DVR_NVR')} />
                </div>
              </div>
              
              {!isPartAComplete ? (
                <button onClick={() => !missingA && setIsPartAComplete(true)} disabled={missingA} className={`w-full mt-4 py-3 font-bold text-sm transition-all border ${missingA ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' : 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700 shadow-[2px_2px_0px_rgba(100,116,139,0.5)]'}`}>{getLabel('lock_part_a', 'LOCK PART A & PROCEED')}</button>
              ) : (
                <button onClick={() => setIsPartAComplete(false)} className="w-full mt-4 py-2 border border-slate-400 text-slate-600 text-xs font-bold hover:bg-slate-50">{getLabel('unlock_part_a', 'UNLOCK PART A')}</button>
              )}
            </div>
          </div>
          
          {/* PART B FORM */}
          <div className={`border border-slate-400 bg-white relative transition-all ${isPartAComplete ? 'shadow-[4px_4px_0px_rgba(100,116,139,0.1)] opacity-100' : 'opacity-50 pointer-events-none'}`}>
             <div className="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
             <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 tracking-widest">{getLabel('part_b', 'PART B: EXPERT')}</h3>
              {!isPartAComplete && <Lock size={14} className="text-slate-400" />}
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('examiner_name', 'EXAMINER NAME')}</label>
                <input type="text" value={data.examinerName} onChange={e => updateField('examinerName', e.target.value)} className={getInputClass(data.examinerName)} placeholder={getLabel('required', 'REQUIRED')} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('examiner_parent', 'EXAMINER PARENT (S/O, D/O, W/O)')}</label>
                <input type="text" value={data.examinerParent} onChange={e => updateField('examinerParent', e.target.value)} className={getInputClass(data.examinerParent)} placeholder={getLabel('examiner_parent_placeholder', "EXAMINER'S PARENT/SPOUSE")} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('examiner_address', 'EXAMINER ADDRESS')}</label>
                <input type="text" value={data.examinerAddress} onChange={e => updateField('examinerAddress', e.target.value)} className={getInputClass(data.examinerAddress)} placeholder={getLabel('examiner_address_placeholder', 'LABORATORY ADDRESS')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('lab_id', 'LAB IDENTIFIER')}</label>
                  <input type="text" value={data.labId} onChange={e => updateField('labId', e.target.value)} className={getInputClass(data.labId)} placeholder={getLabel('required', 'REQUIRED')} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('hash_alg', 'HASH ALGORITHM')}</label>
                  <select value={data.hashAlg} onChange={e => updateField('hashAlg', e.target.value)} className="w-full bg-white border border-slate-400 outline-none px-3 py-2 text-sm font-bold text-slate-800">
                    <option>SHA-256</option>
                    <option>MD5</option>
                    <option>SHA-512</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{getLabel('place', 'PLACE OF VERIFICATION')}</label>
                <input type="text" value={data.place} onChange={e => updateField('place', e.target.value)} className={getInputClass(data.place)} placeholder={getLabel('place_placeholder', 'PLACE OF SIGNING')} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 relative overflow-hidden flex-shrink-0">
           {isLocked && <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] pointer-events-none z-10"></div>}
           <h4 className="text-slate-400 text-[10px] font-bold mb-3 tracking-widest flex items-center justify-between z-20 relative">
             <span>{getLabel('auth_plinth', 'AUTHORIZATION PLINTH')}</span>
             {isLocked && <span className="text-green-400">{getLabel('secured', 'SECURED')}</span>}
           </h4>
           <button onPointerDown={() => isPartAComplete && !missingB && !isLocked && setIsSigning(true)} onPointerUp={() => setIsSigning(false)} onPointerLeave={() => setIsSigning(false)} className={`w-full h-16 relative flex items-center justify-center font-black tracking-widest transition-all z-20 ${!isPartAComplete || missingB ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : isLocked ? 'bg-[#1e293b] text-slate-500 border-2 border-slate-600' : 'bg-white text-slate-900 cursor-pointer hover:bg-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'}`}>
             {!isLocked && <div className="absolute top-0 left-0 h-full bg-slate-300 transition-all ease-linear" style={{ width: `${signProgress}%`, transitionDuration: isSigning ? '100ms' : '300ms' }} />}
             <span className="relative z-10 flex items-center gap-2">
               {isLocked ? <Lock size={18} /> : <Fingerprint size={18} />}
               {isLocked ? getLabel('document_immutable', 'DOCUMENT_IMMUTABLE') : getLabel('hold_to_seal', 'HOLD TO SEAL')}
             </span>
           </button>
           {isLocked && (
             <button onClick={() => window.print()} className="w-full mt-4 h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all flex justify-center items-center gap-2 z-20 relative">
               {getLabel('print_certificate', 'PRINT CERTIFICATE (PDF)')}
             </button>
           )}
        </div>
      </div>

      {/* Right Panel: Live Document Rendering */}
      <div className="flex-1 bg-[#0f172a] relative overflow-y-auto p-8 custom-scrollbar flex flex-col items-center print:bg-white print:p-0 print:overflow-visible" id="certificate-print-area">
        <div className="absolute inset-0 pointer-events-none print:hidden" style={{ backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
        <div className="absolute inset-0 pointer-events-none print:hidden" style={{ backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)`, backgroundSize: '100px 100px' }}></div>

        {/* PAGE 1 - PART A */}
        <div className="w-[800px] bg-white border border-slate-300 p-12 shadow-[0_0_30px_rgba(2,132,199,0.15)] relative z-10 transition-all duration-500 mb-8 print:shadow-none print:border-none print:mb-0 print:p-0 page-break-after">
          
          <div className="text-center pb-6 mb-8 select-none">
            <h1 className="text-lg font-serif font-bold text-black uppercase">THE SCHEDULE</h1>
            <h2 className="text-md font-serif text-black uppercase">[See section 63(4)(c)]</h2>
            <h1 className="text-2xl font-serif font-black text-black tracking-widest uppercase mt-4">CERTIFICATE</h1>
            <h2 className="text-xl font-serif font-bold text-black tracking-widest uppercase mt-2">PART A</h2>
            <h3 className="text-md font-serif text-black uppercase">(To be filled by the Party)</h3>
          </div>

          <div className="space-y-6 text-black text-sm leading-loose text-justify font-serif select-none">
            <p>I, <strong>{data.custodianName || '_____________________'}</strong>, Son/daughter/spouse of <strong>{data.custodianParent || '___________________'}</strong> residing/employed at <strong>{data.custodianAddress || '__________________________'}</strong> do hereby solemnly affirm and sincerely state and submit as follows:—</p>
            
            <p>I have produced electronic record/output of the digital record taken from the following device/digital record source (tick mark):—</p>
            
            <div className="flex flex-wrap gap-4 font-sans text-xs">
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.deviceType === 'COMPUTER_SYSTEM' ? '✓' : ''}</span> Computer / Storage Media</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.deviceType === 'CCTV_DVR_NVR' ? '✓' : ''}</span> DVR</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.deviceType === 'MOBILE_DEVICE' ? '✓' : ''}</span> Mobile</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Flash Drive</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> CD/DVD</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Server</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Cloud</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Other</div>
            </div>

            <p>
              Other: <strong>{data.deviceType !== 'COMPUTER_SYSTEM' && data.deviceType !== 'CCTV_DVR_NVR' && data.deviceType !== 'MOBILE_DEVICE' ? data.deviceType : 'N/A'}</strong><br/>
              Make & Model: <strong>{data.deviceMake || '_________________'}</strong> {data.deviceModel || ''} Color: <strong>{data.deviceColor || '___________'}</strong><br/>
              Serial/Seal Number: <strong>{data.sealNumber || '_______________'}</strong> {data.deviceSerial ? `(S/N: ${data.deviceSerial})` : ''}<br/>
              IMEI/UIN/UID/MAC/Cloud ID: <strong>{data.deviceImei || '_____________________'}</strong><br/>
              and any other relevant information, if any, about the device/digital record: <strong>{data.deviceDescription || '_________________'}</strong>
            </p>

            <p>The digital device or the digital record source was under the lawful control for regularly creating, storing or processing information for the purposes of carrying out regular activities and during this period, the computer or the communication device was working properly and the relevant information was regularly fed into the computer during the ordinary course of business. If the computer/digital device at any point of time was not working properly or out of operation, then it has not affected the electronic/digital record or its accuracy. The digital device or the source of the digital record is:—</p>
            
            <div className="flex flex-wrap gap-4 font-sans text-xs">
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.controlType === 'OWNED' ? '✓' : ''}</span> Owned</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.controlType === 'MAINTAINED' ? '✓' : ''}</span> Maintained</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.controlType === 'MANAGED' ? '✓' : ''}</span> Managed</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.controlType === 'OPERATED' ? '✓' : ''}</span> Operated</div>
              by me (select as applicable).
            </div>

            <p>I state that the HASH value/s of the electronic/digital record/s is <strong>{originalHash || '_________________'}</strong>, obtained through the following algorithm:—</p>

            <div className="flex flex-col gap-2 font-sans text-xs">
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> SHA1:</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.hashAlg === 'SHA-256' ? '✓' : ''}</span> SHA256:</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.hashAlg === 'MD5' ? '✓' : ''}</span> MD5:</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.hashAlg === 'SHA-512' ? '✓' : ''}</span> Other: {data.hashAlg !== 'SHA-256' && data.hashAlg !== 'MD5' ? data.hashAlg : '__________________'}</div>
            </div>

            <p>(Hash report to be enclosed with the certificate)</p>

            <div className="mt-12 flex justify-between">
              <div>
                <p>Date (DD/MM/YYYY): <strong>{isLocked ? new Date().toLocaleDateString('en-GB') : '_____'}</strong></p>
                <p>Time (IST): <strong>{isLocked ? new Date().toLocaleTimeString('en-GB', {hour12: false, hour: "numeric", minute: "numeric"}) : '________'}</strong> hours</p>
                <p>Place: <strong>{data.place || '________________'}</strong></p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-48 h-16 border-b border-black mb-2 flex items-end justify-center pb-2">
                  {isLocked && <span className="font-script text-2xl text-blue-800 opacity-80">{data.custodianName}</span>}
                </div>
                <p>(Name and signature)</p>
                <p><strong>{data.designation || ''}</strong></p>
              </div>
            </div>
          </div>
          {isLocked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[stamp-drop_0.4s_ease-out_forwards] print:opacity-100 print:scale-100 print:rotate-[15deg]">
              <Stamp text="PART_A_SEALED" type="red" rotate="rotate-[15deg]" extraClasses="w-64 h-64 opacity-90 relative" />
            </div>
          )}
        </div>

        {/* PAGE 2 - PART B */}
        <div className="w-[800px] bg-white border border-slate-300 p-12 shadow-[0_0_30px_rgba(2,132,199,0.15)] relative z-10 transition-all duration-500 mb-8 print:shadow-none print:border-none print:mb-0 print:p-0 page-break-after">
          <div className="text-center pb-6 mb-8 select-none">
            <h2 className="text-xl font-serif font-bold text-black tracking-widest uppercase">PART B</h2>
            <h3 className="text-md font-serif text-black uppercase">(To be filled by the Expert)</h3>
          </div>

          <div className="space-y-6 text-black text-sm leading-loose text-justify font-serif select-none">
            <p>I, <strong>{data.examinerName || '____________________'}</strong>, Son/daughter/spouse of <strong>{data.examinerParent || '____________________'}</strong> residing/employed at <strong>{data.examinerAddress || '_________________________'}</strong> do hereby solemnly affirm and sincerely state and submit as follows:—</p>
            
            <p>The produced electronic record/output of the digital record are obtained from the following device/digital record source (tick mark):—</p>
            
            <div className="flex flex-wrap gap-4 font-sans text-xs">
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.deviceType === 'COMPUTER_SYSTEM' ? '✓' : ''}</span> Computer / Storage Media</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.deviceType === 'CCTV_DVR_NVR' ? '✓' : ''}</span> DVR</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.deviceType === 'MOBILE_DEVICE' ? '✓' : ''}</span> Mobile</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Flash Drive</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> CD/DVD</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Server</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Cloud</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> Other</div>
            </div>

            <p>
              Other: <strong>{data.deviceType !== 'COMPUTER_SYSTEM' && data.deviceType !== 'CCTV_DVR_NVR' && data.deviceType !== 'MOBILE_DEVICE' ? data.deviceType : 'N/A'}</strong><br/>
              Make & Model: <strong>{data.deviceMake || '_________________'}</strong> {data.deviceModel || ''} Color: <strong>{data.deviceColor || '___________'}</strong><br/>
              Serial/Seal Number: <strong>{data.sealNumber || '_______________'}</strong> {data.deviceSerial ? `(S/N: ${data.deviceSerial})` : ''}<br/>
              IMEI/UIN/UID/MAC/Cloud ID: <strong>{data.deviceImei || '_____________________'}</strong><br/>
              and any other relevant information, if any, about the device/digital record: <strong>{data.deviceDescription || '_________________'}</strong>
            </p>

            <p>I state that the HASH value/s of the electronic/digital record/s is <strong>{originalHash || '_____________________'}</strong>, obtained through the following algorithm:—</p>
            
            <div className="flex flex-col gap-2 font-sans text-xs">
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3"></span> SHA1:</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.hashAlg === 'SHA-256' ? '✓' : ''}</span> SHA256:</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.hashAlg === 'MD5' ? '✓' : ''}</span> MD5:</div>
              <div><span className="inline-block w-4 h-4 border border-black mr-1 text-center leading-3">{data.hashAlg === 'SHA-512' ? '✓' : ''}</span> Other: {data.hashAlg !== 'SHA-256' && data.hashAlg !== 'MD5' ? data.hashAlg : '__________________'}</div>
            </div>

            <p>(Hash report to be enclosed with the certificate)</p>

            <div className="mt-12 flex justify-between">
              <div>
                <p>Date (DD/MM/YYYY): <strong>{isLocked ? new Date().toLocaleDateString('en-GB') : '_____'}</strong></p>
                <p>Time (IST): <strong>{isLocked ? new Date().toLocaleTimeString('en-GB', {hour12: false, hour: "numeric", minute: "numeric"}) : '________'}</strong> hours</p>
                <p>Place: <strong>{data.place || '____________'}</strong></p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-48 h-16 border-b border-black mb-2 flex items-end justify-center pb-2">
                  {isLocked && <span className="font-script text-2xl text-blue-800 opacity-80">{data.examinerName}</span>}
                </div>
                <p>(Name, designation and signature)</p>
              </div>
            </div>
          </div>
          {isLocked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[stamp-drop_0.4s_ease-out_forwards] print:opacity-100 print:scale-100 print:rotate-[-15deg]">
              <Stamp text="PART_B_SEALED" type="red" rotate="rotate-[-15deg]" extraClasses="w-64 h-64 opacity-90 relative" />
            </div>
          )}
        </div>

        {/* PAGE 3 - ANNEXURE */}
        <div className="w-[800px] bg-white border border-slate-300 p-12 shadow-[0_0_30px_rgba(2,132,199,0.15)] relative z-10 transition-all duration-500 print:shadow-none print:border-none print:p-0">
           <h3 className="text-black font-serif text-lg font-bold tracking-widest border-b border-black pb-2 mb-4 text-center">ANNEXURE 1: HASH REPORT</h3>
           <table className="w-full text-left font-mono text-sm border-collapse border border-black">
             <thead>
               <tr className="border-b border-black bg-slate-100">
                 <th className="p-2 border-r border-black font-bold">FILE_IDENTIFIER / DEVICE</th>
                 <th className="p-2 border-r border-black font-bold">ALGORITHM</th>
                 <th className="p-2 border-r border-black font-bold">HASH_VALUE</th>
                 <th className="p-2 font-bold text-center">STATUS</th>
               </tr>
             </thead>
             <tbody className="text-black">
               {selectedEvidenceId ? (
                 <tr className="border-b border-black">
                   <td className="p-2 border-r border-black">{availableEvidence.find(e => e.id === selectedEvidenceId)?.title || 'EVIDENCE'}</td>
                   <td className="p-2 border-r border-black">{data.hashAlg}</td>
                   <td className="p-2 border-r border-black break-all">{originalHash || 'NO HASH'}</td>
                   <td className="p-2 text-center">{isLocked ? 'SEALED' : 'PENDING'}</td>
                 </tr>
               ) : (
                 <tr className="border-b border-black">
                   <td colSpan="4" className="p-2 text-center italic text-slate-500">SELECT EVIDENCE FROM DROPDOWN</td>
                 </tr>
               )}
             </tbody>
           </table>
           
           {isLocked && (
             <div className="mt-8 border border-black p-4">
               <div className="font-bold text-sm mb-1">DIGITAL DOCUMENT SEAL (SHA-256)</div>
               <div className="text-xs text-slate-600 mb-2">This seal guarantees the integrity of this generated certificate.</div>
               <div className="font-mono text-sm tracking-widest break-all bg-slate-100 p-2 border border-slate-300">
                 {finalHash}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
