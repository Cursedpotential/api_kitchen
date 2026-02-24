
import React from 'react';

interface Props {
  isConnected: boolean;
  isProcessing: boolean;
  activeModules: number;
}

export const StatusIndicators: React.FC<Props> = ({ isConnected, isProcessing, activeModules }) => {
  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`} />
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {isConnected ? 'System Online' : 'Awaiting Auth'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-500 animate-spin' : 'bg-slate-600'}`} />
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {isProcessing ? 'Data Flowing' : 'Standby'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-1.5 py-0.5 rounded border border-slate-600 bg-slate-900 text-[10px] text-cyan-400 font-bold">
          {activeModules} ACTIVE
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Modules</span>
      </div>
    </div>
  );
};
