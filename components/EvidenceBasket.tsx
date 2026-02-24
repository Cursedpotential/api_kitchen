
import React from 'react';
import { ForensicItem } from '../types';
import { downloadForensicFiles } from '../services/hashService';

interface Props {
  flaggedItems: ForensicItem[];
  onRemove: (id: string) => void;
}

export const EvidenceBasket: React.FC<Props> = ({ flaggedItems, onRemove }) => {
  return (
    <div className="w-80 border-l border-slate-700 bg-slate-900 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center justify-between">
          Evidence Basket
          <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{flaggedItems.length}</span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {flaggedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm italic">No items flagged for export.</p>
          </div>
        ) : (
          flaggedItems.map(item => (
            <div key={item.id} className="p-3 bg-slate-800 border border-slate-600 rounded-lg group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-1.5 rounded uppercase">
                  {item.source}
                </span>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
              <h3 className="text-xs font-bold truncate text-slate-200 mb-1">{item.title}</h3>
              <p className="text-[10px] font-mono text-slate-500 mb-2 truncate">SHA256: {item.hash.substring(0, 16)}...</p>
              
              <button
                onClick={() => downloadForensicFiles(item)}
                className="w-full py-1.5 text-[10px] font-bold uppercase tracking-tighter bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
              >
                Extract Package
              </button>
            </div>
          ))
        )}
      </div>

      {flaggedItems.length > 0 && (
        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
          <p className="text-[10px] text-slate-500 leading-tight">
            * Extraction generates a paired .json and .sha256 file to maintain chain of custody.
          </p>
        </div>
      )}
    </div>
  );
};
