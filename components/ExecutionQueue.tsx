
import React from 'react';
import { ForensicCommand, ExecutionQueueItem } from '../types';

interface Props {
  queue: ExecutionQueueItem[];
  registry: ForensicCommand[];
  onRemove: (uid: string) => void;
  onExecute: () => void;
  isProcessing: boolean;
}

export const ExecutionQueue: React.FC<Props> = ({ queue, registry, onRemove, onExecute, isProcessing }) => {
  const getCommandDetails = (id: string) => registry.find(c => c.id === id);

  return (
    <div className="w-80 bg-[#0a0f1a] flex flex-col h-full border-l border-slate-800 shadow-2xl z-20">
      <header className="px-5 py-5 border-b border-slate-800 bg-slate-900">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">Command Center</h2>
          <span className="bg-cyan-900 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold">{queue.length}</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono">Build your extraction strategy.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl">
            <span className="text-2xl opacity-20 mb-2">⚡</span>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Queue Empty</p>
          </div>
        ) : (
          queue.map((item, idx) => {
            const cmd = getCommandDetails(item.commandId);
            return (
              <div key={item.uid} className="bg-slate-800 border border-slate-700 p-3 rounded group relative">
                <div className="absolute -left-1 top-3 bottom-3 w-1 bg-cyan-500 rounded-r"></div>
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <span className="text-[9px] font-mono text-cyan-500 mb-0.5 block">0{idx + 1} // {cmd?.category}</span>
                    <h4 className="text-xs font-bold text-slate-200">{cmd?.label}</h4>
                  </div>
                  <button onClick={() => onRemove(item.uid)} className="text-slate-600 hover:text-red-500 transition-colors">
                    &times;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-900">
        <div className="flex justify-between items-center mb-4 text-[10px] font-mono text-slate-500">
          <span>EST. TIME:</span>
          <span className="text-slate-300">~{queue.length * 2} MIN</span>
        </div>
        <button
          onClick={onExecute}
          disabled={queue.length === 0 || isProcessing}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black uppercase text-xs tracking-[0.25em] rounded shadow-lg transition-all active:scale-95"
        >
          {isProcessing ? 'Executing...' : 'Execute Sequence'}
        </button>
      </div>
    </div>
  );
};
