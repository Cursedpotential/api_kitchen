
import React from 'react';
import { ForensicCommand } from '../types';

interface Props {
  commands: ForensicCommand[];
  onAdd: (cmd: ForensicCommand) => void;
  categoryTitle: string;
}

export const CommandLibrary: React.FC<Props> = ({ commands, onAdd, categoryTitle }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#0f1522] border-r border-slate-800">
      <header className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Command Library</h2>
        <h1 className="text-xl font-bold text-slate-100 mt-1">{categoryTitle}</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {commands.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p>Select a Module or Service from the left to view available commands.</p>
          </div>
        ) : (
          commands.map(cmd => (
            <div key={cmd.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-lg hover:border-cyan-500/50 hover:bg-slate-800 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-[9px] font-black text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-700">
                  {cmd.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{cmd.estimatedTime}</span>
              </div>
              
              <h3 className="text-sm font-bold text-slate-200 mb-1 relative z-10">{cmd.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 relative z-10">{cmd.description}</p>
              
              <button 
                onClick={() => onAdd(cmd)}
                className="w-full py-2 bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white text-[10px] font-black uppercase tracking-widest rounded transition-all active:scale-[0.98] relative z-10"
              >
                + Add to Queue
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
