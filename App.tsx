
import React, { useState, useEffect } from 'react';
import { ForensicItem, ApiStatus, ForensicCommand, ExecutionQueueItem } from './types';
import { GoogleForensicService } from './services/googleService';
import { COMMAND_REGISTRY, getCommandsByCategory } from './services/commandRegistry';
import { StatusIndicators } from './components/StatusIndicators';
import { CommandLibrary } from './components/CommandLibrary';
import { ServiceExplorer } from './components/ServiceExplorer';
import { ExecutionQueue } from './components/ExecutionQueue';
import { ResultsConsole } from './components/ResultsConsole';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Navigation State
  const [selectedCategory, setSelectedCategory] = useState<string>('SURVEILLANCE');
  const [activeTab, setActiveTab] = useState<'MODULES' | 'SERVICES'>('MODULES');

  // Execution State
  const [queue, setQueue] = useState<ExecutionQueueItem[]>([]);
  const [results, setResults] = useState<ForensicItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [googleService] = useState(() => GoogleForensicService.getInstance());

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleAuth = () => {
    // SCOPE STRATEGY:
    // gmail.settings.basic -> Required to see Auto-Forwarding (Surveillance) and Filters (Hidden emails).
    // drive.activity.readonly -> Deep history of file movement.
    // tasks.readonly -> Hidden lists.
    // people.readonly -> Contact graphs.
    const client = (window as any).google?.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.activity.readonly https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/chat.messages.readonly https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/contacts.other.readonly https://www.googleapis.com/auth/directory.readonly https://www.googleapis.com/auth/tasks.readonly https://www.googleapis.com/auth/userinfo.profile',
      callback: (response: any) => {
        if (response.access_token) {
          googleService.setToken(response.access_token);
          setIsAuthenticated(true);
          checkApis();
        }
      },
    });
    client?.requestAccessToken();
  };

  const checkApis = async () => {
    const statuses = await googleService.checkAndEnableApis();
    setApiStatuses(statuses);
  };

  const addToQueue = (cmd: ForensicCommand) => {
    const newItem: ExecutionQueueItem = {
      uid: Math.random().toString(36).substr(2, 9),
      commandId: cmd.id,
      status: 'PENDING'
    };
    setQueue(prev => [...prev, newItem]);
  };

  const removeFromQueue = (uid: string) => {
    setQueue(prev => prev.filter(item => item.uid !== uid));
  };

  const executeQueue = async () => {
    setIsLoading(true);
    let sessionResults: ForensicItem[] = [];
    for (const item of queue) {
      try {
        const cmdResults = await googleService.executeCommand(item.commandId);
        sessionResults = [...sessionResults, ...cmdResults];
      } catch (err) {
        console.error(`Failed to execute ${item.commandId}`, err);
      }
    }
    setResults(sessionResults);
    setIsLoading(false);
    setShowResults(true);
    setQueue([]); 
  };

  return (
    <div className="flex flex-col h-screen bg-[#060912] text-slate-300 font-sans selection:bg-cyan-500/30">
      <nav className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-800 rounded-xl shadow-xl shadow-cyan-950/40 flex items-center justify-center font-black text-white italic text-xl border border-cyan-500/20">
            SK
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-[0.2em] uppercase text-slate-100">
              Salem Forensic <span className="text-cyan-500">Builder</span>
            </h1>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Deep Layer Extraction Protocol</span>
          </div>
        </div>

        {!isAuthenticated ? (
          <button onClick={handleAuth} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg shadow-lg text-[10px] uppercase tracking-[0.1em]">
            Initialize Master Auth
          </button>
        ) : (
           <div className="flex items-center gap-3">
             <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-bold text-green-500 uppercase tracking-widest">
               Secure Tunnel Active
             </div>
           </div>
        )}
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-[#0d121f] border-r border-slate-800 flex flex-col shrink-0 p-5 z-10">
          <div className="flex p-1 bg-slate-950/80 rounded-xl mb-6 border border-slate-800/50">
            <button 
              onClick={() => setActiveTab('MODULES')}
              className={`flex-1 text-[9px] font-black py-2.5 rounded-lg transition-all ${activeTab === 'MODULES' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500'}`}
            >
              MODULES
            </button>
            <button 
              onClick={() => setActiveTab('SERVICES')}
              className={`flex-1 text-[9px] font-black py-2.5 rounded-lg transition-all ${activeTab === 'SERVICES' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500'}`}
            >
              API BUILDER
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
             {activeTab === 'MODULES' ? (
                <>
                  <button onClick={() => setSelectedCategory('SURVEILLANCE')} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'SURVEILLANCE' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                    Surveillance & Location
                  </button>
                  <button onClick={() => setSelectedCategory('COMMUNICATION')} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'COMMUNICATION' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                    Comm. Analyzer
                  </button>
                  <button onClick={() => setSelectedCategory('DRIVE')} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'DRIVE' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                    Drive Integrity
                  </button>
                   <button onClick={() => setSelectedCategory('EPHEMERAL')} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'EPHEMERAL' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                    Ghost Data
                  </button>
                  <button onClick={() => setSelectedCategory('SOCIAL_GRAPH')} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'SOCIAL_GRAPH' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                    Social Graph
                  </button>
                </>
             ) : (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                    <strong className="text-cyan-500 block mb-1">POWER USER MODE</strong>
                    Browse the full API catalog in the main view. Use search to filter by endpoint or category.
                  </p>
                </div>
             )}
          </div>
          
          <div className="pt-6 border-t border-slate-800/50">
            <StatusIndicators isConnected={isAuthenticated} isProcessing={isLoading} activeModules={apiStatuses.filter(s => s.enabled).length} />
          </div>
        </aside>

        {activeTab === 'MODULES' ? (
          <CommandLibrary 
            categoryTitle={selectedCategory}
            commands={getCommandsByCategory(selectedCategory)}
            onAdd={addToQueue}
          />
        ) : (
          <ServiceExplorer onAdd={addToQueue} />
        )}

        <ExecutionQueue 
          queue={queue}
          registry={COMMAND_REGISTRY}
          onRemove={removeFromQueue}
          onExecute={executeQueue}
          isProcessing={isLoading}
        />

      </div>

      {showResults && (
        <ResultsConsole items={results} onClose={() => setShowResults(false)} />
      )}
    </div>
  );
}
