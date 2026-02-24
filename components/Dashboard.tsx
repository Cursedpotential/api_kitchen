
import React from 'react';
import { ForensicItem } from '../types';

interface Props {
  items: ForensicItem[];
  title: string;
  onFlag: (item: ForensicItem) => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<Props> = ({ items, title, onFlag, isLoading }) => {
  const [selectedItem, setSelectedItem] = React.useState<ForensicItem | null>(null);

  const getSourceIcon = (source: ForensicItem['source']) => {
    switch(source) {
      case 'Photos': return '📷';
      case 'Drive': return '📄';
      case 'Gmail': return '✉️';
      case 'Activity': return '🧠';
      case 'Maps': return '📍';
      case 'Voice': return '🎙️';
      case 'Calendar': return '📅';
      default: return '🔍';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a]">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 backdrop-blur-sm flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-100 uppercase">{title}</h1>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-[0.2em]">Forensic Extraction Protocol 2.5 // Chain of Custody Active</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Hashing</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-cyan-500 animate-pulse">SK</div>
            </div>
            <div className="text-center">
              <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-1">Scanning Data Clusters</p>
              <p className="text-slate-600 text-[10px] font-mono">Bypassing Obfuscation Layers...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`flex flex-col border border-slate-800 bg-slate-900/30 rounded-xl overflow-hidden transition-all hover:border-slate-600 group cursor-pointer ${selectedItem?.id === item.id ? 'ring-1 ring-cyan-500/50 border-cyan-500/50 bg-slate-900/50 shadow-2xl shadow-cyan-950/20' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-300 text-2xl shadow-inner group-hover:bg-slate-700 transition-colors">
                      {getSourceIcon(item.source)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-black text-slate-200 truncate max-w-[280px] tracking-tight">{item.title}</h3>
                        {item.metadata.isRiskFlagged && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded border border-amber-500/20 uppercase tracking-tighter shadow-[0_0_10px_rgba(245,158,11,0.1)]">High Risk Intent</span>
                        )}
                        {item.metadata.revisionCount && item.metadata.revisionCount > 5 && (
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded border border-indigo-500/20 uppercase tracking-tighter">Spoliation Risk</span>
                        )}
                        {item.metadata.isSurveillanceAlert && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black rounded border border-red-500/20 uppercase tracking-tighter animate-pulse">Surveillance Alert</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{new Date(item.timestamp).toLocaleString()}</p>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">{item.source}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onFlag(item); }}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-800 hover:bg-cyan-600 transition-all rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:border-cyan-500 shadow-sm active:scale-95"
                  >
                    Flag Evidence
                  </button>
                </div>
                
                {selectedItem?.id === item.id && (
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-800/50 bg-slate-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="lg:col-span-5 space-y-6">
                      <section>
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                            Metadata Profile
                          </h4>
                        </div>
                        <div className="grid gap-2">
                          {Object.entries(item.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-[11px] font-mono group/meta p-1 hover:bg-slate-800/30 rounded transition-colors">
                              <span className="text-slate-500 uppercase tracking-tighter text-[9px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-cyan-400 font-bold max-w-[200px] truncate">
                                {value ? (typeof value === 'object' ? JSON.stringify(value) : value.toString()) : 'NULL'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                         <div className="text-[10px] font-black text-amber-500 mb-2 flex items-center gap-2 tracking-[0.1em]">
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                           INTEGRITY VERIFICATION
                         </div>
                         <p className="text-[11px] font-mono text-amber-500/70 break-all leading-relaxed bg-slate-950/50 p-2 rounded border border-amber-500/10">SHA256: {item.hash}</p>
                      </section>
                    </div>
                    <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-5 font-mono text-[11px] text-green-500 overflow-hidden flex flex-col h-[380px] shadow-inner">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                        <span className="text-slate-600 uppercase text-[9px] font-black tracking-[0.2em] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-sm"></span>
                          Raw Forensic Stream
                        </span>
                        <span className="text-slate-700 text-[9px] font-bold">SIZE: {(item.rawJson.length / 1024).toFixed(2)} KB</span>
                      </div>
                      <pre className="flex-1 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed opacity-90">{item.rawJson}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span className="text-4xl opacity-20">🗄️</span>
                </div>
                <h3 className="text-slate-400 font-black text-lg uppercase tracking-widest mb-2">Workspace Sanitized</h3>
                <p className="text-slate-600 text-xs italic max-w-xs font-mono uppercase tracking-tighter">Initialize extraction sequence to pull deep-layer metadata clusters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="h-10 border-t border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Integrity Pulse</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1 h-3 bg-cyan-950 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-cyan-500/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
           <span className="uppercase tracking-tighter">Last Hash: {items[0]?.hash.substring(0, 16) || 'N/A'}...</span>
        </div>
      </footer>
    </div>
  );
};
