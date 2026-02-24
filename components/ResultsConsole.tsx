import React from 'react';
import { ForensicItem } from '../types';
import { downloadForensicFiles } from '../services/hashService';

interface Props {
  items: ForensicItem[];
  onClose: () => void;
}

export const ResultsConsole: React.FC<Props> = ({ items, onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#060912] z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
      <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
          <h1 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Extraction Complete</h1>
          <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded text-xs font-mono">{items.length} ITEMS SECURED</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider">
          Close Console &times;
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded uppercase">{item.source}</span>
                <span className="text-[10px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-2 truncate" title={item.title}>{item.title}</h3>
              
              <div className="bg-black/40 rounded p-2 mb-3 border border-slate-800">
                <code className="text-[10px] text-cyan-500/70 block truncate">{item.hash}</code>
              </div>
              
              <button
                onClick={() => downloadForensicFiles(item)}
                className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Download Artifact
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};