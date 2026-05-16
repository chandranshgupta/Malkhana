import React, { useState } from 'react';
import { Archive, Lock, ShieldCheck, FileText, Settings, Plus, Search, ScanLine, History, CheckCircle2 } from 'lucide-react';
import { BlueprintBackground } from './components/shared/BlueprintBackground';
import { EvidenceLog } from './components/EvidenceLog/EvidenceLog';
import { ActiveCustodyBoard } from './components/ActiveCustody/ActiveCustodyBoard';
import { SealedArchiveMatrix } from './components/SealedArchive/SealedArchiveMatrix';
import { ReportsDraftingTable } from './components/Reports/ReportsDraftingTable';
import { SystemSettings } from './components/SystemSettings/SystemSettings';
import { NewIngestionWorkflow } from './components/NewIngestion/NewIngestionWorkflow';

export default function App() {
  const [currentView, setCurrentView] = useState('EVIDENCE_LOG');

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-mono text-slate-800 flex overflow-hidden selection:bg-slate-300 selection:text-slate-900">
      <BlueprintBackground />
      
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-400 bg-opacity-50 flex flex-col pt-6 pb-6 z-30 relative bg-[#f4f7f9]">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-500">
            <div className="text-slate-200 text-xs text-center leading-tight">USER<br/>092</div>
          </div>
          <div>
            <div className="font-bold text-sm">OPERATOR_092</div>
            <div className="text-xs text-slate-500">UNIT: FORENSIC CENTRAL</div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <button onClick={() => setCurrentView('EVIDENCE_LOG')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'EVIDENCE_LOG' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Archive size={16} /> EVIDENCE_LOG
          </button>
          <button onClick={() => setCurrentView('ACTIVE_CUSTODY')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'ACTIVE_CUSTODY' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Lock size={16} /> ACTIVE_CUSTODY
          </button>
          <button onClick={() => setCurrentView('SEALED_ARCHIVE')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SEALED_ARCHIVE' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <ShieldCheck size={16} /> SEALED_ARCHIVE
          </button>
          <button onClick={() => setCurrentView('REPORTS')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'REPORTS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <FileText size={16} /> REPORTS
          </button>
          <button onClick={() => setCurrentView('SYSTEM_SETTINGS')} className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SYSTEM_SETTINGS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'} mt-4`}>
            <Settings size={16} /> SYSTEM_SETTINGS
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <button onClick={() => setCurrentView('NEW_INGESTION')} className={`w-full flex items-center justify-center gap-2 py-3 border font-bold text-sm transition-all ${currentView === 'NEW_INGESTION' ? 'border-slate-800 bg-slate-800 text-white shadow-[2px_2px_0px_rgba(100,116,139,0.5)]' : 'border-slate-500 bg-white hover:bg-slate-50 shadow-[2px_2px_0px_rgba(100,116,139,0.5)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]'}`}>
            <Plus size={16} /> NEW_INGESTION
          </button>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col relative z-20 h-screen overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-400 py-4 px-8 flex items-center justify-between bg-[#f4f7f9] z-20 relative flex-shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-widest text-slate-800">MALKHANA_VAULT</h1>
            <nav className="hidden xl:flex items-center gap-6 text-xs font-bold pt-1">
              <button onClick={() => setCurrentView('EVIDENCE_LOG')} className={`transition-colors uppercase tracking-widest ${currentView === 'EVIDENCE_LOG' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>EVIDENCE_LOG</button>
              <button onClick={() => setCurrentView('ACTIVE_CUSTODY')} className={`transition-colors uppercase tracking-widest ${currentView === 'ACTIVE_CUSTODY' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>ACTIVE_CUSTODY</button>
              <button onClick={() => setCurrentView('SEALED_ARCHIVE')} className={`transition-colors uppercase tracking-widest ${currentView === 'SEALED_ARCHIVE' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>SEALED_ARCHIVE</button>
              <button onClick={() => setCurrentView('REPORTS')} className={`transition-colors uppercase tracking-widest ${currentView === 'REPORTS' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>REPORTS</button>
              <button onClick={() => setCurrentView('NEW_INGESTION')} className={`transition-colors uppercase tracking-widest ${currentView === 'NEW_INGESTION' ? 'text-slate-800 border-b-2 border-slate-800 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>NEW_INGESTION</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Global Search - Hidden in Sealed Archive as it has its own target search */}
            {currentView !== 'SEALED_ARCHIVE' && (
              <div className="relative flex items-center border-b border-slate-400 pb-1 w-64">
                <Search size={14} className="text-slate-400 absolute left-0" />
                <input type="text" placeholder="GLOBAL_CASE_SEARCH" className="bg-transparent border-none outline-none w-full pl-6 text-xs uppercase placeholder-slate-400 font-mono" />
              </div>
            )}
            <button className="text-slate-600 hover:text-slate-800"><ScanLine size={18} /></button>
            <button className="text-slate-600 hover:text-slate-800"><History size={18} /></button>
          </div>
        </header>
        
        {/* View Switcher */}
        {currentView === 'EVIDENCE_LOG' && <EvidenceLog setCurrentView={setCurrentView} />}
        {currentView === 'ACTIVE_CUSTODY' && <ActiveCustodyBoard />}
        {currentView === 'SEALED_ARCHIVE' && <SealedArchiveMatrix />}
        {currentView === 'REPORTS' && <ReportsDraftingTable />}
        {currentView === 'SYSTEM_SETTINGS' && <SystemSettings />}
        {currentView === 'NEW_INGESTION' && <NewIngestionWorkflow />}

        {/* Bottom Metrics (Hidden on complex views to maximize space) */}
        {['EVIDENCE_LOG', 'ACTIVE_CUSTODY', 'SEALED_ARCHIVE'].includes(currentView) && (
          <div className="border-t border-slate-400 p-6 bg-[#f4f7f9] z-20 relative flex justify-between gap-4 mt-auto flex-shrink-0">
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-400"></div>
               <div className="text-[10px] font-bold text-slate-500 mb-1">STORAGE_UTILIZATION</div>
               <div className="text-3xl font-light">74.2 <span className="text-sm font-bold">TB</span></div>
               <div className="w-full bg-slate-200 h-1 mt-2"><div className="bg-slate-700 h-1 w-[74%]"></div></div>
            </div>
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-400"></div>
               <div className="text-[10px] font-bold text-slate-500 mb-1">ACTIVE_CUSTODY_ITEMS</div>
               <div className="text-3xl font-light">1,204</div>
            </div>
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="text-[10px] font-bold text-slate-500 mb-1">SEALED_ARCHIVE_COUNT</div>
               <div className="text-3xl font-light">18,592</div>
            </div>
            <div className="flex-1 border border-slate-400 bg-white/50 p-4 relative shadow-[2px_2px_0px_rgba(100,116,139,0.1)]">
               <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-400"></div>
               <div className="text-[10px] font-bold text-slate-500 mb-1">SYSTEM_HEALTH_INDEX</div>
               <div className="text-3xl font-light flex items-center gap-2">0.99 <CheckCircle2 size={24} className="text-slate-500" strokeWidth={1.5} /></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}