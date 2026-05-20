import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle2, Download } from 'lucide-react';
import { WireframeSSD, WireframePhone, WireframeDVR } from '../shared/Wireframes';
import { Stamp } from '../shared/Stamp';
import { getArchiveMatrix, searchArchive, getEvidenceLog } from '../../api/invoke';

export const SealedArchiveMatrix = ({ onPrintCC1 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [slots, setSlots] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});
  const [selectedDrawer, setSelectedDrawer] = useState(null);
  const [highlightedLocations, setHighlightedLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matrix, evidenceLog] = await Promise.all([
          getArchiveMatrix(),
          getEvidenceLog()
        ]);
        
        // Build evidence map
        const evMap = {};
        evidenceLog.forEach(ev => {
          evMap[ev.id] = ev;
        });
        setEvidenceMap(evMap);
        setSlots(matrix);
      } catch (err) {
        console.error("Failed to load archive details:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const runSearch = async () => {
        try {
          const results = await searchArchive(searchQuery);
          setHighlightedLocations(results);
        } catch (err) {
          console.error("Search failed:", err);
        }
      };
      runSearch();
    } else {
      setHighlightedLocations([]);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toUpperCase());
  };

  const isSearchActive = searchQuery.trim().length > 2;

  // Generate 150 drawers matching coordinates R1-C1 to R10-C15
  const drawers = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const row = Math.floor(i / 15) + 1;
      const col = (i % 15) + 1;
      const id = `R${row}-C${col}`;
      
      const dbSlot = slots.find(s => s.location === id);
      const evidence = dbSlot && dbSlot.evidence_id ? evidenceMap[dbSlot.evidence_id] : null;

      return {
        id,
        row,
        col,
        dbSlot,
        evidence,
        caseId: evidence ? evidence.case_id : null,
        type: evidence ? evidence.asset_type : null,
      };
    });
  }, [slots, evidenceMap]);

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
            placeholder="SEARCH_BY_CASE_OR_EVIDENCE" 
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
                   const isMatch = isSearchActive && highlightedLocations.includes(drawer.id);
                   const isDimmed = isSearchActive && !isMatch;
                   const hasEvidence = !!drawer.evidence;
                   
                   return (
                     <div 
                       key={drawer.id}
                       onClick={() => hasEvidence && setSelectedDrawer(drawer)}
                       className={`
                         border h-16 relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                         ${!hasEvidence ? 'border-slate-300 bg-transparent opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-500'}
                         ${isMatch ? 'border-[#0ea5e9] bg-[#e0f2fe] scale-[1.15] z-30 shadow-[8px_8px_0px_rgba(2,132,199,0.3)] animate-pulse' : ''}
                         ${isDimmed ? 'opacity-20 grayscale pointer-events-none' : ''}
                         ${!isMatch && !isDimmed && hasEvidence ? 'border-slate-400 bg-white/60 shadow-[2px_2px_0px_rgba(100,116,139,0.1)] hover:bg-white/90 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_rgba(100,116,139,0.2)]' : ''}
                       `}
                     >
                       {/* Hardware Handle Detail */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 border border-slate-500 bg-slate-200 shadow-inner"></div>
                       
                       {/* Coordinate Label */}
                       <div className={`absolute bottom-1 right-1 text-[8px] font-bold ${isMatch ? 'text-[#0284c7]' : 'text-slate-500'}`}>
                         {drawer.id}
                       </div>
                       
                       {/* Content Indicator Dot */}
                       {hasEvidence && (
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
      {selectedDrawer && selectedDrawer.evidence && (
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
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1 uppercase">ID: {selectedDrawer.evidence.id}</h3>
                  <div className="text-xs font-bold text-[#0ea5e9] tracking-widest uppercase mb-1">CASE: {selectedDrawer.caseId}</div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase">LOC: PHYSICAL_MATRIX • {selectedDrawer.id}</div>
                </div>

                <div className="flex-1 border-2 border-slate-400 bg-white relative p-6 flex items-center justify-center min-h-[300px]">
                  {/* Subtle target crosshairs inside image box */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-full h-[1px] bg-slate-800"></div>
                    <div className="absolute h-full w-[1px] bg-slate-800"></div>
                  </div>
                  
                  <div className="w-64 h-64 flex items-center justify-center">
                    {selectedDrawer.type === 'DISK' && <WireframeSSD />}
                    {selectedDrawer.type === 'MOBILE' && <WireframePhone />}
                    {selectedDrawer.type === 'CCTV' && <WireframeDVR />}
                    {!['DISK', 'MOBILE', 'CCTV'].includes(selectedDrawer.type) && <WireframeSSD />}
                  </div>

                  <Stamp text="STATUS: IMMUTABLE" type="blue" rotate="-rotate-6" extraClasses="top-4 right-4 w-40 h-40" />
                </div>
              </div>

              {/* Right Column: Technical Metadata & Actions */}
              <div className="flex flex-col justify-between pt-4">
                
                <div className="space-y-6">
                  <div>
                     <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">ASSET_CLASS</h4>
                     <p className="text-lg font-bold text-slate-800 uppercase">{selectedDrawer.evidence.title || selectedDrawer.type}</p>
                     <p className="text-xs text-slate-500 mt-1">{selectedDrawer.evidence.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">SEIZURE_DATE</h4>
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(selectedDrawer.evidence.seized_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">SEAL_NUMBER</h4>
                      <p className="text-sm font-bold text-slate-800">{selectedDrawer.evidence.seal_number || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest border-b border-slate-300 pb-1">CRYPTOGRAPHIC_HASH (SHA-256)</h4>
                     <div className="bg-slate-200 p-3 border border-slate-300">
                       <p className="text-[10px] font-mono font-bold text-slate-700 break-all leading-relaxed">
                         {selectedDrawer.evidence.hash_sha256 || "N/A"}
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
                <button 
                  onClick={() => onPrintCC1 && onPrintCC1(selectedDrawer.evidence.id)}
                  className="w-full mt-8 border-2 border-slate-800 bg-slate-800 text-white font-bold tracking-widest py-4 flex items-center justify-center gap-3 shadow-[6px_6px_0px_rgba(100,116,139,0.5)] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px] hover:bg-slate-700"
                >
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
