import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, History, ShieldAlert, Archive, 
  Map, MessageSquare, Scale, Music, 
  Menu, X, Search, Activity, Database,
  Terminal, User, Shield, Info, LogIn, LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { name: 'HOME', path: '/', icon: Home, label: 'CORE_INTERFACE' },
  { name: 'TIMELINE', path: '/timeline', icon: History, label: 'TEMPORAL_ARCHIVE' },
  { name: 'DRAMA', path: '/drama', icon: Activity, label: 'CONFLICT_SIGNAL' },
  { name: 'MAP', path: '/map', icon: Map, label: 'COGNITIVE_WALL' },
  { name: 'WAR ROOM', path: '/war-room', icon: ShieldAlert, label: 'STRATEGIC_INTEL' },
  { name: 'VAULT', path: '/vault', icon: Archive, label: 'MEDIA_STORAGE' },
  { name: 'MOKON', path: '/mokon', icon: Music, label: 'PIONEER_LOGS' },
  { name: 'COMMUNITY', path: '/archive', icon: MessageSquare, label: 'SIGNAL_FEED' },
];

export default function CinematicShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signIn, logout } = useAuthStore();

  return (
    <div className="app-viewport bg-black selection:bg-brand selection:text-white font-sans">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_100%)]" />
        <div className="absolute inset-0 cinematic-grid opacity-30" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] opacity-20" />
        
        {/* Animated Particles Simulation (Visual only) */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-brand/40"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: 0 
              }}
              animate={{ 
                y: [null, '-10%'],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 20
              }}
            />
          ))}
        </div>
      </div>

      {/* Top HUD HUD */}
      <header className="relative z-50 h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-sm border border-brand bg-brand/5 flex items-center justify-center group-hover:bg-brand/20 transition-all">
              <ShieldAlert className="text-brand w-5 h-5 shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs tracking-[0.3em] text-white">UPCHURCH_SAGA</span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Intelligence. Surveillance. Reconnaissance.</span>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-12 font-mono">
          <div className="flex gap-6">
             {navItems.slice(0, 5).map(item => (
               <Link 
                 key={item.path} 
                 to={item.path}
                 className={`text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all hover:text-brand ${location.pathname === item.path ? 'text-brand' : 'text-zinc-500'}`}
               >
                 <item.icon size={12} /> {item.name}
               </Link>
             ))}
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex items-center gap-4 text-[8px] text-zinc-600">
             <span className="flex items-center gap-1"><Activity size={10} className="text-brand" /> UPLINK: VERIFIED</span>
             <span className="flex items-center gap-1"><Database size={10} /> DB_SYNC: 1.0.4B</span>
             <span className="flex items-center gap-1 text-green-500/50"><Shield size={10} /> SECURE_NODE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Top HUD Login / Logout Action Button (Always visible on all pages/sections) */}
           {user ? (
             <div className="flex items-center gap-2 px-2.5 py-1 border border-white/5 bg-white/5 rounded-sm">
               <div className="hidden sm:flex flex-col items-end">
                 <span className="text-[9px] font-bold text-white font-mono uppercase">@{profile?.username || 'operator'}</span>
                 <span className="text-[7px] font-mono text-brand leading-none">{profile?.isAdmin ? 'ROOT_ACCESS' : `${profile?.karma || 0}_KB`}</span>
               </div>
               <button 
                 onClick={() => logout()}
                 className="p-1 px-1.5 border border-red-500/25 bg-red-950/15 hover:bg-brand hover:text-white hover:border-brand rounded-sm text-brand transition-all font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                 title="Terminate Session"
               >
                 <LogOut size={10} />
                 <span>LOGOUT</span>
               </button>
             </div>
           ) : (
             <button 
               onClick={() => signIn()}
               className="flex items-center gap-1.5 px-3 py-1 border border-brand/40 bg-brand/5 text-brand hover:bg-brand hover:text-white hover:border-brand rounded-sm text-[9px] font-bold font-mono tracking-wider transition-all hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] cursor-pointer"
             >
               <LogIn size={11} />
               <span>CONNECT_UPLINK</span>
             </button>
           )}

           <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Search size={18} /></button>
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="px-4 py-1.5 border border-white/10 rounded-sm hover:border-brand/40 transition-all text-zinc-400 hover:text-white flex items-center gap-2"
           >
             <Menu size={16} /> <span className="text-[10px] font-bold font-mono tracking-widest hidden sm:inline">TERMINAL</span>
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-content no-scrollbar z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Sidebar / Terminal Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm pointer-events-auto"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 z-[70] bg-zinc-950 border-l border-white/10 p-8 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <Terminal className="text-brand" size={20} />
                  <span className="text-sm font-black font-mono tracking-widest text-white">SYSTEM_CMD</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.3em] mb-4">Navigation_Nodes</p>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`group flex items-center justify-between p-3 border border-white/5 rounded-sm transition-all hover:bg-brand/5 hover:border-brand/30 ${location.pathname === item.path ? 'bg-brand/5 border-brand/30' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={16} className={location.pathname === item.path ? 'text-brand' : 'text-zinc-600'} />
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold tracking-widest ${location.pathname === item.path ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-[7px] font-mono text-zinc-600">{item.label}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="pt-8 mt-8 border-t border-white/5 space-y-6">
                <div>
                   <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-3">Operator_Identity</p>
                   {user ? (
                     <div className="space-y-3">
                       <div className="flex items-center gap-3 px-4 py-3 bg-brand/5 rounded-sm border border-brand/20">
                          <div className="w-8 h-8 rounded-sm bg-brand/15 flex items-center justify-center border border-brand/20">
                             <User size={16} className="text-brand" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                             <span className="text-[11px] font-mono font-bold text-white truncate">@{profile?.username || 'operator'}</span>
                             <span className="text-[8px] font-mono text-brand">
                                {profile?.isAdmin ? 'ROOT_ACCESS_LEVEL' : `OPERATOR_LVL_1 (${profile?.karma || 0} Karma)`}
                             </span>
                          </div>
                       </div>
                       
                       {profile?.isAdmin && (
                         <Link
                           to="/admin-console"
                           onClick={() => setIsSidebarOpen(false)}
                           className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-yellow-950/20 border border-yellow-900/30 text-yellow-500 hover:bg-yellow-900/40 text-[10px] font-mono font-bold uppercase rounded-sm transition-all"
                         >
                            <Shield size={12} />
                            <span>ACCESS_ADMIN_CONSOLE</span>
                         </Link>
                       )}

                       <button
                         onClick={async () => {
                           await logout();
                           setIsSidebarOpen(false);
                         }}
                         className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-950/15 border border-red-900/30 text-brand hover:bg-brand hover:text-white hover:border-brand text-[10px] font-mono font-bold uppercase rounded-sm transition-all cursor-pointer"
                       >
                          <LogOut size={12} />
                          <span>TERMINATE_SESSION</span>
                       </button>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-sm border border-white/5">
                          <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center">
                             <User size={16} className="text-zinc-600" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-zinc-400">UNREGISTERED_OPERATOR</span>
                             <span className="text-[8px] font-mono text-zinc-600 mb-1">GUEST_CLEARANCE_LVL_0</span>
                          </div>
                       </div>
                       
                       <button
                         onClick={async () => {
                           await signIn();
                           setIsSidebarOpen(false);
                         }}
                         className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-brand/15 border border-brand/40 text-brand hover:bg-brand hover:text-white hover:border-brand text-[10px] font-mono font-bold uppercase rounded-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] cursor-pointer"
                       >
                          <LogIn size={12} />
                          <span>ESTABLISH_UPLINK</span>
                       </button>
                     </div>
                   )}
                </div>
                
                <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-sm">
                   <div className="flex items-center gap-2 text-red-500 mb-2">
                      <Info size={12} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Saga_Warning</span>
                   </div>
                   <p className="text-[8px] text-zinc-500 font-mono leading-relaxed">
                      SENSITIVE INVESTIGATIVE CONTENT DETECTED. ALL DATA POINTS ARE COMMUNITY-SOURCED.
                   </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Status Bar (Bottom) */}
      <footer className="relative z-50 h-10 border-t border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6 px-8 text-[8px] font-mono text-zinc-600">
         <div className="flex gap-8 items-center">
            <span className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
               LIVE_DATA_STREAM: ACTIVE
            </span>
            <span className="hidden sm:inline">LATENCY: 24MS</span>
            <span className="hidden md:inline italic opacity-50">"Documentation is the shield against distortion."</span>
         </div>
         <div className="flex gap-4">
            <Link to="/policies" className="hover:text-zinc-300">TERM_OF_CMD</Link>
            <Link to="/policies" className="hover:text-zinc-300">PRIVACY_PROTOCOL</Link>
            <span className="text-zinc-800">SAGA_OS v1.0.4</span>
         </div>
      </footer>
    </div>
  );
}
