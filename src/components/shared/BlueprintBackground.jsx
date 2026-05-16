import React from 'react';

export const BlueprintBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.15) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }} />
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(to right, rgba(100, 116, 139, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.3) 1px, transparent 1px)`,
      backgroundSize: '100px 100px'
    }} />
    <svg className="absolute bottom-0 left-0 w-96 h-96 text-slate-500 opacity-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.2">
      <circle cx="0" cy="100" r="30" />
      <circle cx="0" cy="100" r="60" />
      <circle cx="0" cy="100" r="90" strokeDasharray="2 2"/>
      <line x1="0" y1="100" x2="100" y2="100" />
      <line x1="0" y1="100" x2="0" y2="0" />
      <line x1="0" y1="100" x2="70" y2="30" />
      <line x1="0" y1="100" x2="30" y2="70" />
      <text x="65" y="95" fontSize="3" fill="currentColor" stroke="none">0.0°</text>
      <text x="5" y="35" fontSize="3" fill="currentColor" stroke="none">90.0°</text>
    </svg>
    <div className="absolute top-[20%] right-[15%] w-4 h-4 border-t border-l border-slate-400 opacity-50"></div>
    <div className="absolute bottom-[30%] right-[5%] w-4 h-4 border-b border-r border-slate-400 opacity-50"></div>
  </div>
);
