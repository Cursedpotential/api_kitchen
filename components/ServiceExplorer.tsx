
import React, { useState } from 'react';
import { ForensicCommand, ForensicCategoryType } from '../types';
import { COMMAND_REGISTRY } from '../services/commandRegistry';

interface Props {
  onAdd: (cmd: ForensicCommand) => void;
}

export const ServiceExplorer: React.FC<Props> = ({ onAdd }) => {
  const [selectedService, setSelectedService] = useState<string | null>('GMAIL');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique categories (Services)
  const servicesList = Array.from(new Set(
    COMMAND_REGISTRY
      .filter(c => c.type === ForensicCategoryType.SERVICE)
      .map(c => c.category)
  )).sort();

  // Filter commands based on selection
  const filteredCommands = COMMAND_REGISTRY.filter(cmd => 
    cmd.type === ForensicCategoryType.SERVICE &&
    (selectedService ? cmd.category === selectedService : true) &&
    (searchTerm ? 
      (cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
       cmd.endpoint?.toLowerCase().includes(searchTerm.toLowerCase())) 
      : true)
  );

  return (
    <div className="flex-1 flex h-full bg-[#0f1522] border-r border-slate-800">
      
      {/* LEFT PANE: Services List */}
      <div className="w-56 flex flex-col border-r border-slate-800 bg-[#0a0e17]">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">API Builder</h2>
          <h3 className="text-sm font-bold text-slate-200">Services</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {servicesList.map(service => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`w-full text-left px-3 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex justify-between items-center ${
                selectedService === service 
                  ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {service}
              {selectedService === service && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>}
            </button>
          ))}
        </div>
      </div>

      {/* MIDDLE PANE: Endpoints Table */}
      <div className="flex-1 flex flex-col bg-[#0f1522]">
        <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-1">{selectedService || 'ALL'}</h2>
            <h1 className="text-lg font-bold text-slate-100">Available Endpoints</h1>
          </div>
          
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1.5 px-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 sticky top-0 z-10 shadow-lg shadow-black/20">
              <tr>
                <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 w-24">Method</th>
                <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800">Endpoint Structure</th>
                <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 w-1/3">Description</th>
                <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCommands.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-20 text-center text-slate-600 text-xs italic">No endpoints available for this selection.</td>
                 </tr>
              ) : (
                filteredCommands.map(cmd => (
                  <tr key={cmd.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-5 align-top">
                      <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded border ${
                        cmd.method === 'GET' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        cmd.method === 'POST' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                        'bg-slate-700 text-slate-400 border-slate-600'
                      }`}>
                        {cmd.method || 'RPC'}
                      </span>
                    </td>
                    <td className="py-3 px-5 align-top">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{cmd.label}</span>
                        <code className="text-[10px] text-cyan-600/80 font-mono mt-1 break-all bg-slate-950/50 px-1 py-0.5 rounded w-fit">{cmd.endpoint || cmd.id}</code>
                      </div>
                    </td>
                    <td className="py-3 px-5 align-top">
                      <p className="text-[10px] text-slate-400 leading-tight font-medium">{cmd.description}</p>
                    </td>
                    <td className="py-3 px-5 align-top text-right">
                      <button 
                        onClick={() => onAdd(cmd)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white text-[9px] font-black uppercase tracking-widest rounded transition-all active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
