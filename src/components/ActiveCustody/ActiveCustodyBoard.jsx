import React, { useState } from 'react';
import { WireframePerson } from '../shared/Wireframes';

export const PersonCard = ({ person, isHovered, onHover }) => (
  <div 
    onMouseEnter={() => onHover(person.id)}
    onMouseLeave={() => onHover(null)}
    className={`absolute w-64 border border-slate-400 bg-white/80 backdrop-blur-md p-4 flex flex-col shadow-[6px_6px_0px_rgba(100,116,139,0.15)] transition-all duration-500 cursor-default ${isHovered ? 'shadow-[8px_8px_0px_rgba(100,116,139,0.3)] z-30 scale-105' : 'z-20'}`}
    style={{ left: `${person.x}px`, top: `${person.y}px`, transform: `rotate(${person.rot}deg)` }}
  >
    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-400"></div>
    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-400"></div>
    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-slate-400"></div>
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-400"></div>
    <div className="flex justify-between items-start mb-3 border-b border-slate-300 pb-2">
      <div className="text-[10px] font-black tracking-widest text-slate-800">{person.name}</div>
      <div className="border border-slate-400 px-1.5 py-0.5 text-[8px] font-bold bg-slate-100 text-slate-500">{person.id}</div>
    </div>
    <div className="flex gap-4">
      <div className="w-20 h-24 border border-slate-300 bg-[#f8fafc] relative overflow-hidden flex-shrink-0 group-hover:border-slate-400">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.05)_1px,transparent_1px)] bg-[size:5px_5px]"></div>
         <div className="absolute inset-2"><WireframePerson /></div>
         {isHovered && <div className="absolute inset-0 border-2 border-[#d92d20]/30 animate-pulse pointer-events-none"></div>}
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <div className="text-[8px] text-slate-400 font-bold mb-0.5">POSITION</div>
          <div className="text-[10px] font-bold text-slate-700 leading-none">{person.role}</div>
        </div>
        <div>
          <div className="text-[8px] text-slate-400 font-bold mb-0.5">ORGANIZATION</div>
          <div className="text-[10px] text-slate-600 leading-none">{person.org}</div>
        </div>
        <div className="flex justify-between items-end pt-1">
           <div>
            <div className="text-[8px] text-slate-400 font-bold mb-0.5">CLEARANCE</div>
            <div className="text-[9px] font-bold bg-slate-200 px-1 text-slate-600 inline-block">{person.auth}</div>
           </div>
           <div className="text-[9px] text-slate-500">{person.phone}</div>
        </div>
      </div>
    </div>
  </div>
);

export const ActiveCustodyBoard = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const personnelChain = [
    { id: "PER-001", name: "J. MILLS", role: "SEIZING OFFICER", org: "UNIT-9", auth: "LEVEL_02", phone: "EXT-442", x: 100, y: 150, rot: -3, pinX: 228, pinY: 155 },
    { id: "PER-045", name: "R. CHEN", role: "INTAKE CLERK", org: "FORENSIC VAULT", auth: "LEVEL_03", phone: "EXT-881", x: 550, y: 80, rot: 4, pinX: 678, pinY: 85 },
    { id: "PER-112", name: "DR. A. VANCE", role: "LEAD EXAMINER", org: "CYBER LAB", auth: "LEVEL_05", phone: "EXT-909", x: 300, y: 450, rot: -2, pinX: 428, pinY: 455 },
    { id: "PER-092", name: "OPERATOR_092", role: "DATA ANALYST", org: "FORENSIC CENTRAL", auth: "LEVEL_04", phone: "EXT-102", x: 800, y: 400, rot: 1, pinX: 928, pinY: 405 }
  ];
  const threadPath = `
    M ${personnelChain[0].pinX} ${personnelChain[0].pinY}
    C 350 100, 450 300, ${personnelChain[1].pinX} ${personnelChain[1].pinY}
    C 750 -50, 200 150, ${personnelChain[2].pinX} ${personnelChain[2].pinY}
    C 550 700, 650 200, ${personnelChain[3].pinX} ${personnelChain[3].pinY}
    C 1000 500, 950 650, 900 700
  `;

  return (
    <div className="flex-1 w-full h-full overflow-auto custom-scrollbar relative">
      <div className="min-w-[1200px] min-h-[800px] relative p-8">
        <div className="absolute top-8 left-8 z-10">
          <h2 className="text-3xl font-light tracking-tight mb-2 flex items-baseline gap-4">
            Custody Trace: <span className="font-bold">Investigation Board</span>
          </h2>
          <p className="text-sm text-slate-600 italic font-serif">Chronological thread of authorized personnel handling evidence asset [MOB-1142-922].</p>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.15))' }}>
          <path d={threadPath} fill="none" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" className="opacity-60" />
          <path d={threadPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className={`transition-all duration-500 ${hoveredNode ? 'animate-pulse opacity-100' : 'opacity-80'}`} />
          {personnelChain.map((person, idx) => (
             <g key={`pin-${idx}`} transform={`translate(${person.pinX}, ${person.pinY})`}>
               <circle cx="0" cy="0" r="6" fill="#334155" />
               <circle cx="-1" cy="-1" r="4" fill="#94a3b8" />
               <circle cx="-2" cy="-2" r="1.5" fill="#f8fafc" />
               <circle cx="0" cy="0" r="12" fill="none" stroke="#dc2626" strokeWidth="0.5" strokeDasharray="2 2" className="animate-[spin_4s_linear_infinite]" />
             </g>
          ))}
          <g transform={`translate(900, 700) rotate(-15)`}>
            <rect x="-10" y="-15" width="20" height="30" fill="rgba(100,116,139,0.3)" />
            <line x1="-8" y1="12" x2="8" y2="12" stroke="#475569" strokeWidth="1" />
            <text x="-7" y="-2" fontSize="5" fill="#1e293b" className="font-mono font-bold">L.END</text>
          </g>
        </svg>
        {personnelChain.map(person => (
          <PersonCard key={person.id} person={person} isHovered={hoveredNode === person.id} onHover={setHoveredNode} />
        ))}
      </div>
    </div>
  );
};
