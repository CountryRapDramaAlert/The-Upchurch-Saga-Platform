import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, Terminal, Shield, Activity, Zap, Maximize, 
  Eye, Volume2, Search, Brain, Database, Flame,
  TrendingUp, AlertCircle, Share2, ZoomIn, Globe,
  MessageSquare, User, Cpu
} from 'lucide-react';
import { useSagaStore } from '../store/useSagaStore';
import ContradictionDetector from '../components/ContradictionDetector';

export default function WarRoom() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { nodes, links, dramaHeatIndex } = useSagaStore();
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [liveComments, setLiveComments] = useState<{ id: string; user: string; text: string; sentiment: 'positive' | 'negative' | 'neutral' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock live comments
  useEffect(() => {
    const interval = setInterval(() => {
      const users = ['lore_keeper_42', 'truth_seeker', 'mokon_fan_01', 'upchurch_vet', 'anon_analyst'];
      const comments = [
        'DID HE JUST SAY THAT?',
        'Look at the timestamp on the 2021 clip.',
        'The relationship graph is shifting live.',
        'Adam Calhoun just went live too.',
        'Check the discord leaks in the vault.',
        'Authenticity verified by lore keepers.'
      ];
      const sentiment: 'positive' | 'negative' | 'neutral' = Math.random() > 0.5 ? 'neutral' : (Math.random() > 0.7 ? 'positive' : 'negative');
      const newComment = {
        id: Math.random().toString(),
        user: users[Math.floor(Math.random() * users.length)],
        text: comments[Math.floor(Math.random() * comments.length)],
        sentiment
      };
      setLiveComments(prev => [...prev.slice(-15), newComment]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-mono flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* HUD Scanner overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.02)_0%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] pointer-events-none" />
        <motion.div 
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-px bg-brand/30 shadow-[0_0_15px_rgba(255,0,0,0.5)] z-50"
        />
      </div>

      {/* Main Bar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md relative z-[60]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <Radio className="text-brand animate-pulse" size={24} />
             <div>
               <h1 className="text-xl font-black tracking-tighter uppercase italic">War_Room <span className="text-brand">V1.0B</span></h1>
               <p className="text-[8px] text-zinc-500 uppercase tracking-widest leading-none">Intelligence. Surveillance. Reconnaissance.</p>
             </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 border-l border-white/5 pl-8">
             <div className="space-y-1">
               <p className="text-[6px] text-zinc-600 uppercase">System Integrity</p>
               <div className="flex gap-0.5">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-2 h-1 bg-brand/40" />)}
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[6px] text-zinc-600 uppercase">Active Nodes</p>
               <p className="text-xs font-bold text-brand">{nodes.length}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] text-zinc-500 uppercase">Live_Heat_Index</span>
              <span className="text-sm font-bold text-red-500 font-mono tracking-tighter">{(dramaHeatIndex * 100).toFixed(2)}%</span>
           </div>
           <button onClick={toggleFullscreen} className="p-2 border border-white/10 rounded hover:bg-white/5 h-10 w-10 flex items-center justify-center">
             <Maximize size={18} />
           </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Sidebar Left: Evidence & Signal Feed */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-zinc-950/40 backdrop-blur-xl relative z-[60]">
           <div className="p-4 border-b border-white/5 bg-white/5">
             <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-brand" /> Signal_Buffer
             </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
             {nodes.slice(0, 8).map(node => (
               <motion.div 
                 key={node.id}
                 whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                 className="p-3 border border-white/5 rounded-sm cursor-pointer group"
               >
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[7px] font-mono text-zinc-700 uppercase">ID: {node.id}-SAGA</span>
                    <span className={`px-1.5 py-0.5 rounded-[1px] text-[6px] font-bold uppercase ${node.heat! > 0.7 ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                      {node.type}
                    </span>
                 </div>
                 <h4 className="text-[10px] font-bold uppercase group-hover:text-brand transition-colors">{node.name}</h4>
                 <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                       <motion.div className="h-full bg-brand" initial={{ width: 0 }} animate={{ width: `${(node.heat || 0.5) * 100}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-zinc-600">HEAT_{Math.round((node.heat || 0.5)*100)}</span>
                 </div>
               </motion.div>
             ))}
           </div>
           <div className="p-4 border-t border-white/10 bg-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] text-zinc-500 uppercase">Encryption_Status</span>
                <Shield size={12} className="text-green-500" />
              </div>
              <p className="text-[7px] text-zinc-700 font-mono leading-relaxed">SYSTEM_IDENT: AX-1092-ALPHA. ALL_TRAFFIC_PROXIED_THRU_TOR_RELAYS. NO_LOGS_KEPT.</p>
           </div>
        </div>

        {/* Center Canvas: Live Interaction / Video Grid */}
        <div className="flex-1 relative flex flex-col">
           <div className="grid grid-cols-2 h-full">
              <div className="border-r border-b border-white/5 p-4 relative group">
                 <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <iframe
                      className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                      src="https://www.youtube.com/embed/ls1" // Placeholder
                      title="SIGNAL_01"
                      allowFullScreen
                    ></iframe>
                 </div>
                 <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-bold font-mono tracking-widest text-white uppercase bg-black/60 px-2 py-1">LIVE_UPLINK_01</span>
                 </div>
              </div>
              <div className="border-b border-white/5 p-4 relative overflow-hidden">
                 <div className="h-full">
                    <ContradictionDetector />
                 </div>
              </div>
              <div className="border-r border-white/5 p-4 flex flex-col">
                 <div className="flex-1 glass-panel border-white/5 p-4 flex flex-col">
                   <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                         <TrendingUp className="text-brand" size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Sentiment_Spectrum</span>
                      </div>
                      <div className="flex gap-2">
                         <div className="w-2 h-2 rounded-full bg-brand" title="Negative" />
                         <div className="w-2 h-2 rounded-full bg-blue-500" title="Positive" />
                         <div className="w-2 h-2 rounded-full bg-zinc-600" title="Neutral" />
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-center space-y-6">
                      {['Hostility', 'Accuracy', 'Engagement', 'Volubility'].map(label => (
                        <div key={label} className="space-y-1">
                           <div className="flex justify-between items-center text-[8px] font-mono uppercase text-zinc-500">
                             <span>{label}</span>
                             <span>{Math.floor(Math.random() * 100)}%</span>
                           </div>
                           <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-brand" 
                                animate={{ width: `${Math.random() * 100}%` }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
              <div className="p-4 flex flex-col gap-4">
                  <div className="flex-1 glass-panel border-white/5 p-6 space-y-6">
                     <div className="flex items-center gap-3 text-zinc-300">
                        <Cpu className="text-brand" size={20} />
                        <span className="text-xs font-bold font-mono tracking-widest uppercase italic">AI_Narrative_Forecast</span>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-light italic">
                          "EMERGENT NARRATIVE DETECTED: A possible coordinate alignment between entities AC and RU has reached a fracture point. AI predicts a 82% probability of a 'What-If' timeline convergence within 72 hours."
                        </p>
                        <div className="p-3 bg-brand/5 border border-brand/20 rounded-sm">
                           <p className="text-[8px] font-bold text-brand uppercase mb-1">Forecast Stage</p>
                           <p className="text-xs font-black uppercase text-white tracking-widest">CRITICAL_ACCELERATION</p>
                        </div>
                     </div>
                  </div>
              </div>
           </div>

           {/* Dramatic overlay text */}
           <div className="absolute inset-x-0 bottom-0 pointer-events-none p-6">
              <div className="text-[80px] font-black text-white/5 uppercase select-none leading-none tracking-tighter">SAGA_LIVE_SCANNER</div>
           </div>
        </div>

        {/* Sidebar Right: Communcations & Intelligence */}
        <div className="w-80 border-l border-white/10 flex flex-col bg-zinc-950/40 backdrop-blur-xl relative z-[60]">
           <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
             <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} className="text-brand" /> Comm_Intercept
             </h3>
             <span className="text-[8px] font-mono text-green-500 animate-pulse">STREAMLINK_OK</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
             {liveComments.map(comment => (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 key={comment.id} 
                 className={`p-3 border rounded-sm relative group ${
                   comment.sentiment === 'negative' ? 'border-red-500/20 bg-red-500/5' : 
                   comment.sentiment === 'positive' ? 'border-blue-500/20 bg-blue-500/5' : 
                   'border-white/5 bg-white/5'
                 }`}
               >
                 <div className="flex justify-between items-center mb-1">
                   <div className="flex items-center gap-2">
                     <div className={`w-1 h-1 rounded-full ${
                       comment.sentiment === 'negative' ? 'bg-red-500' : 
                       comment.sentiment === 'positive' ? 'bg-blue-500' : 'bg-zinc-500'
                     }`} />
                     <span className="text-[8px] font-bold text-zinc-300 font-mono tracking-tighter">{comment.user}</span>
                   </div>
                   <span className="text-[6px] font-mono text-zinc-600">INT_00{Math.floor(Math.random() * 9)}</span>
                 </div>
                 <p className="text-[9px] text-zinc-400 leading-tight">
                    {comment.text}
                 </p>
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertCircle size={10} className="text-zinc-700" />
                 </div>
               </motion.div>
             ))}
           </div>

           <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 mb-4">
                 <User className="text-zinc-600" size={16} />
                 <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[8px] font-bold uppercase tracking-widest">Investigator Rank</span>
                       <span className="text-[10px] font-black text-brand italic">LORE_KEEPER</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                       <div className="h-full bg-brand w-[88%]" />
                    </div>
                 </div>
              </div>
              <button className="w-full py-3 bg-brand/10 border border-brand/20 text-brand text-[8px] font-bold uppercase tracking-widest hover:bg-brand/20 transition-all flex items-center justify-center gap-2">
                 <Zap size={12} /> SCAN_COMMUNITY_INTEL
              </button>
           </div>
        </div>
      </div>

      {/* Footer System HUD */}
      <div className="h-10 border-t border-white/10 bg-black flex items-center justify-between px-6 z-[60]">
        <div className="flex gap-8 items-center h-full">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Local_Interface_Active</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-zinc-700 uppercase">Latency: 12ms</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-zinc-700 uppercase italic">"Trust the evidence, not the narrative."</span>
           </div>
        </div>
        <div className="flex gap-4">
           <Volume2 size={12} className="text-zinc-700 cursor-pointer hover:text-white" />
           <Globe size={12} className="text-zinc-700 cursor-pointer hover:text-white" />
        </div>
      </div>
    </div>
  );
}
