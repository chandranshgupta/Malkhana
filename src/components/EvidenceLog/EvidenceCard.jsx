import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Stamp } from '../shared/Stamp';

export const EvidenceCard = ({ id, title, desc, tags, ImageComp, stamp, alert, onClick }) => (
  <div 
    onClick={onClick}
    className="border border-slate-400 bg-white/60 backdrop-blur-sm p-4 relative flex flex-col shadow-[4px_4px_0px_rgba(100,116,139,0.1)] group hover:shadow-[2px_2px_0px_rgba(100,116,139,0.2)] hover:bg-white/85 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-300 cursor-pointer"
  >
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
    
    <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-[#0ea5e9] transition-colors">{title}</h3>
    <p className="text-xs text-slate-600 mb-4 leading-relaxed flex-1">{desc}</p>
    
    <div className="flex flex-wrap gap-2 mb-6">
      {tags && tags.map((tag, i) => (
        <span key={i} className="border border-slate-300 px-1.5 py-0.5 text-[9px] text-slate-500 font-bold bg-[#f4f7f9]">{tag}</span>
      ))}
    </div>
    
    <div className="flex justify-between items-center text-[10px] border-t border-slate-300 pt-3 mt-auto">
      <div className="flex items-center gap-2">
         <span className="border border-slate-400 px-1 py-0.5 font-bold">SEC_63</span>
         <span className="border border-slate-400 px-1 py-0.5 font-bold">BSA</span>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="font-bold flex items-center gap-1 hover:text-slate-500 uppercase tracking-widest text-[#0ea5e9]"
      >
        VIEW_LOG <ChevronRight size={12} />
      </button>
    </div>
  </div>
);
