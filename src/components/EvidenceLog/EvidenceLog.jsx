import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { EvidenceCard } from './EvidenceCard';
import { WireframeSSD, WireframePhone, WireframeDVR } from '../shared/Wireframes';
import { getEvidenceLog } from '../../api/invoke';

export const EvidenceLog = ({ setCurrentView }) => {
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchEvidence();
  }, []);

  const resolveImageComp = (typeStr) => {
    switch (typeStr) {
      case 'WireframeSSD': return WireframeSSD;
      case 'WireframePhone': return WireframePhone;
      case 'WireframeDVR': return WireframeDVR;
      default: return WireframeSSD; // Fallback
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
            FILTER BY: <button className="border border-slate-400 px-3 py-1 hover:bg-slate-200">RECENT</button><button className="border border-slate-400 px-3 py-1 hover:bg-slate-200">HIGH_PRIORITY</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-slate-500">
            LOADING_EVIDENCE_VAULT...
          </div>
        ) : (
          evidenceItems.map((item, idx) => (
            <EvidenceCard 
              key={idx} 
              id={item.id}
              title={item.title}
              desc={item.desc}
              tags={item.tags}
              ImageComp={resolveImageComp(item.image_comp_type)}
              stamp={item.stamp}
              alert={item.alert}
            />
          ))
        )}
        <div onClick={() => setCurrentView('NEW_INGESTION')} className="border-2 border-dashed border-slate-400 bg-[#f4f7f9]/50 hover:bg-white/50 transition-colors p-4 flex flex-col items-center justify-center text-center cursor-pointer group min-h-[400px]">
           <div className="w-16 h-16 border border-slate-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-white shadow-[2px_2px_0px_rgba(100,116,139,0.2)]"><Plus size={24} className="text-slate-500" strokeWidth={1} /></div>
           <div className="font-bold text-lg mb-2 text-slate-700 group-hover:text-slate-900 transition-colors">INITIATE_NEW_INGESTION</div>
           <div className="text-[10px] text-slate-500">STAGE 1: SEIZURE WIZARD</div>
        </div>
      </div>
    </div>
  );
};
