import React from 'react';
import { motion } from 'framer-motion';
import { Play, History, MessageSquare, ShieldAlert, ChevronRight, TrendingUp, AlertCircle, Scale, ImageIcon, Flame, Radio, Map, Archive, Activity, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import UplinkMediaPlayer from '../components/UplinkMediaPlayer';

export default function Home() {
  const trendingDrama = [
    { id: 1, title: 'The Adam Calhoun Discord', category: 'Conflict', status: 'Ongoing', color: 'text-red-500' },
    { id: 2, title: 'Justin Time Legal Update', category: 'Legal', status: 'Breaking', color: 'text-blue-500' },
    { id: 3, title: 'Archived Livestream Found', category: 'Evidence', status: 'New', color: 'text-green-500' },
  ];

  const statistics = [
    { label: 'Timeline Events', value: '450+' },
    { label: 'Archived Clips', value: '1,2k' },
    { label: 'Contributors', value: '890' },
    { label: 'Investigations', value: '12' },
  ];

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden relative">
      {/* Left Sidebar: Intel Panel */}
      <aside className="w-full lg:w-96 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-10">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <Radio className="text-brand animate-pulse" size={20} />
            <h2 className="text-sm font-black font-mono tracking-[0.3em] uppercase">Intelligence_Feed</h2>
          </div>
          
          <div className="space-y-4">
            {trendingDrama.map((item) => (
              <motion.div 
                whileHover={{ x: 5, backgroundColor: 'rgba(255,0,0,0.05)' }}
                key={item.id} 
                className="p-4 border border-white/5 rounded-sm bg-white/5 group cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{item.category}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-1 bg-zinc-950 ${item.color}`}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold uppercase leading-tight group-hover:text-brand transition-colors">{item.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert size={14} /> Investigator_Ranks
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Observer', rank: 'I', color: 'text-zinc-500', progress: 100 },
                { name: 'Archivist', rank: 'II', color: 'text-blue-500', progress: 85 },
                { name: 'Investigator', rank: 'III', color: 'text-green-500', progress: 60 },
                { name: 'Intelligence Analyst', rank: 'IV', color: 'text-brand', progress: 40 },
                { name: 'Lore Keeper', rank: 'V', color: 'text-purple-500', progress: 15 }
              ].map((rank) => (
                <div key={rank.name} className="p-3 bg-white/5 border border-white/10 rounded-sm">
                   <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-bold uppercase ${rank.color}`}>{rank.name}</span>
                      <span className="text-[8px] font-mono text-zinc-600">LVL_{rank.rank}</span>
                   </div>
                   <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${rank.progress}%` }}
                        className={`h-full ${rank.color.replace('text-', 'bg-')}`}
                      />
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} /> Ecosystem_Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {statistics.map((stat) => (
                <div key={stat.label} className="p-4 bg-zinc-950 border border-white/5 rounded-sm text-center">
                  <p className="text-xl font-display font-black text-white italic tracking-tighter">{stat.value}</p>
                  <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel: Interactive Space */}
      <main className="flex-1 relative flex flex-col overflow-y-auto no-scrollbar">
        {/* Background Ambient Video/Effect */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden opacity-40">
           <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549675584-91f19337af3d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 brightness-50 blur-sm" />
        </div>

        <div className="relative z-20 flex-1 flex flex-col justify-start items-center p-6 md:p-12 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mt-6 lg:mt-12"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-sm border border-brand/30 bg-brand/5 text-brand text-[10px] font-black uppercase tracking-[0.4em] mb-8 animate-pulse">
              <AlertCircle size={14} /> PREVIEW_MODE_ACTIVE
            </div>
            
            <h1 className="text-6xl md:text-[120px] font-display font-bold leading-[0.8] mb-8 tracking-tighter uppercase italic">
              UPCHURCH<br />
              <span className="text-brand">INTELLIGENCE</span>
            </h1>

            <p className="text-sm md:text-base text-zinc-400 mb-12 max-w-xl mx-auto font-light leading-relaxed tracking-wide">
              The ENTIRE country rap internet ecosystem, archived and tracked in real-time. Join the investigation into one of the most polarizing figures in modern music history.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/timeline" className="group relative px-10 py-5 bg-brand text-white font-black tracking-widest uppercase italic text-xs hover:bg-brand-dark transition-all">
                <div className="absolute inset-0 border border-white/20 -m-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                DIVE_INTO_SAGA
              </Link>
              <Link to="/investigation" className="group relative px-10 py-5 bg-orange-600 text-white font-black tracking-widest uppercase italic text-xs hover:bg-orange-700 transition-all shadow-[0_0_25px_rgba(239,68,68,0.25)]">
                <div className="absolute inset-0 border border-white/20 -m-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                INVESTIGATION_BOARD
              </Link>
              <Link to="/war-room" className="group relative px-10 py-5 bg-zinc-900 border border-white/10 text-white font-black tracking-widest uppercase italic text-xs hover:bg-zinc-800 transition-all">
                WAR_ROOM_ACCESS
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-5xl"
          >
            <UplinkMediaPlayer />
          </motion.div>
        </div>

        {/* Global Nav Grid (Bottom) */}
        <div className="relative z-20 grid grid-cols-2 lg:grid-cols-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
           {[
             { name: 'Saga Timeline', path: '/timeline', icon: History, desc: 'Temporal archive of all major events.' },
             { name: 'Investigation Board', path: '/investigation', icon: ShieldAlert, desc: 'Advanced interactive intelligence graph.' },
             { name: 'Relationship Map', path: '/map', icon: Map, desc: 'Interactive social connection graph.' },
             { name: 'Archive Vault', path: '/vault', icon: Archive, desc: 'Evidence, clips, and historical data.' },
             { name: 'Community Dossier', path: '/dossier', icon: Users, desc: 'Profile database of admins and subjects.' },
             { name: 'Lore Feed', path: '/archive', icon: MessageSquare, desc: 'Community investigation threads.' },
           ].map((item) => (
             <Link 
               key={item.path} 
               to={item.path}
               className="p-8 border-r border-white/5 hover:bg-white/5 transition-all group"
             >
               <item.icon className="text-zinc-600 group-hover:text-brand transition-colors mb-4" size={24} />
               <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">{item.name}</h4>
               <p className="text-[10px] text-zinc-500 font-mono leading-tight">{item.desc}</p>
             </Link>
           ))}
        </div>
      </main>

      {/* Right Sidebar: Activity */}
      <aside className="hidden xl:flex w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl flex-col z-10">
         <div className="p-8 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} /> Comm_Intercepts
            </h3>
            <div className="space-y-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-sm bg-zinc-900 border border-white/5 flex items-center justify-center">
                       <User size={14} className="text-zinc-700" />
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-brand">ANON_OP_{i}</span>
                          <span className="text-[6px] text-zinc-700 font-mono">0{i}M_AGO</span>
                       </div>
                       <p className="text-[9px] text-zinc-400 font-light leading-snug">
                          {["New evidence uploaded to vault.", "Narrative shift detected in recent livestream.", "Coordinated behavior identified among fans.", "Archive synchronization complete."][i-1]}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Flame size={14} /> Drama_Heat_Index
            </h3>
            <div className="glass-panel p-6 border-brand/10 bg-brand/5 relative overflow-hidden">
               <div className="absolute inset-0 cinematic-grid opacity-10" />
               <div className="relative z-10 text-center">
                  <p className="text-[10px] font-mono text-zinc-600 mb-2 uppercase">Current_Community_Tension</p>
                  <p className="text-4xl font-display font-black text-brand italic tracking-tighter">89.4%</p>
                  <p className="text-[8px] font-mono text-red-500 mt-2 animate-pulse uppercase">CRITICAL_LEVEL_DETECTED</p>
               </div>
            </div>
            
            <div className="mt-12 space-y-4">
               <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">System_Log</p>
               <div className="space-y-1 text-[8px] font-mono text-zinc-700">
                  <p>[17:13:01] UPLINK_STABLE</p>
                  <p>[17:13:45] SCAN_COMPLETE: 45 NEW_ENTITIES_FOUND</p>
                  <p>[17:14:12] NARRATIVE_ARC_UPDATED: "2025_PIVOT"</p>
                  <p>[17:15:00] DEFENSE_VANGUARD: STANDBY</p>
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
}
