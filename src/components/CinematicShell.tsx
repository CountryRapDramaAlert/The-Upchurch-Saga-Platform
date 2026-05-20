import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, History, ShieldAlert, Archive, 
  Map, MessageSquare, Scale, Music, 
  Menu, X, Search, Activity, Database,
  Terminal, User, Shield, Info, LogIn, LogOut,
  AlertCircle, Fingerprint, Check, CheckCircle2, Users
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
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'reset'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const location = useLocation();
  const { 
    user, 
    profile, 
    signIn, 
    signInWithRedirect,
    signUpWithEmail, 
    signInWithEmail, 
    sendPasswordReset, 
    logout, 
    authError, 
    clearError, 
    showLoginModal, 
    setShowLoginModal 
  } = useAuthStore();

  // Close modal when logged in
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false);
    }
  }, [user]);

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authTab === 'login') {
        await signInWithEmail(email, password);
      } else if (authTab === 'signup') {
        await signUpWithEmail(email, password, username);
      } else if (authTab === 'reset') {
        await sendPasswordReset(email);
        setResetSuccess(true);
      }
    } catch (err) {
      // Errors are handled inside the store
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLogin = () => {
    clearError();
    setResetSuccess(false);
    setAuthTab('login');
    setEmail('');
    setPassword('');
    setUsername('');
    setShowLoginModal(true);
  };

  return (
    <div className="app-viewport bg-black selection:bg-brand selection:text-white font-sans relative">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_100%)]" />
        <div className="absolute inset-0 cinematic-grid opacity-30" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] opacity-20" />
        
        {/* Animated Particles Simulation */}
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

      {/* Top HUD */}
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
           {/* Top HUD Login / Logout Action Button */}
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
               onClick={handleOpenLogin}
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
                          onClick={() => {
                            handleOpenLogin();
                            setIsSidebarOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-brand/15 border border-brand/40 text-brand hover:bg-brand hover:text-white hover:border-brand text-[10px] font-mono font-bold uppercase rounded-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] cursor-pointer"
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

      {/* Modern, Themed Cyberpunk Authentication Dialog */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop with strong blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(183,14,35,0.15)] z-10 flex flex-col font-sans"
            >
              {/* Top accent border */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-brand" />

              {/* Header Box */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
                <div className="flex items-center gap-3">
                  <User className="text-brand w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                      {authTab === 'login' && "Authentication Required"}
                      {authTab === 'signup' && "Create Investigator ID"}
                      {authTab === 'reset' && "Recover Credentials"}
                    </span>
                    <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest">
                      {authTab === 'login' && "Access the intelligence platform"}
                      {authTab === 'signup' && "Register custom access credentials"}
                      {authTab === 'reset' && "Request a secure password reset link"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Selector Tabs (if not on reset) */}
              {authTab !== 'reset' && (
                <div className="grid grid-cols-2 bg-black/30 border-b border-white/5 text-[9px] font-mono leading-none">
                  <button
                    onClick={() => {
                      clearError();
                      setAuthTab('login');
                    }}
                    className={`py-4 text-center font-bold uppercase tracking-wider transition-all border-r border-white/5 ${
                      authTab === 'login' 
                        ? 'text-brand bg-brand/5 border-b-2 border-b-brand font-black' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      clearError();
                      setAuthTab('signup');
                    }}
                    className={`py-4 text-center font-bold uppercase tracking-wider transition-all ${
                      authTab === 'signup' 
                        ? 'text-brand bg-brand/5 border-b-2 border-b-brand font-black' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Scrollable Form Body */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh] no-scrollbar">
                {resetSuccess ? (
                  <div className="py-4 text-center space-y-4">
                    <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 justify-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transmission Successful</h4>
                      <p className="text-[9px] text-zinc-400 uppercase leading-relaxed font-mono">
                        Password recovery email has been successfully sent. Please inspect your inbox or spam directory.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setResetSuccess(false);
                        setAuthTab('login');
                      }}
                      className="px-4 py-2 text-[9px] font-bold text-brand hover:text-brand-dark uppercase tracking-widest font-mono"
                    >
                      Return to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                    {authTab === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Investigator Codename</label>
                        <input
                          required
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. detective_smith"
                          className="w-full bg-zinc-950 border border-white/10 rounded-sm py-2.5 px-3 text-[10px] font-mono focus:border-brand/60 outline-none text-white transition-all uppercase"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Email Address</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-zinc-950 border border-white/10 rounded-sm py-2.5 px-3 text-[10px] focus:border-brand/60 outline-none text-white transition-all"
                      />
                    </div>

                    {authTab !== 'reset' && (
                      <div className="space-y-1.5 font-sans">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Password</label>
                          {authTab === 'login' && (
                            <button
                              type="button"
                              onClick={() => {
                                clearError();
                                setAuthTab('reset');
                              }}
                              className="text-[8px] font-mono text-zinc-400 hover:text-brand uppercase tracking-wider"
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <input
                          required
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-white/10 rounded-sm py-2.5 px-3 text-[10px] focus:border-brand/60 outline-none text-white transition-all"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-brand hover:bg-brand-dark disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 rounded-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.15)] font-mono"
                    >
                      {submitting ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn size={11} />
                          {authTab === 'login' && "Sign In With Password"}
                          {authTab === 'signup' && "Create Account"}
                          {authTab === 'reset' && "Send Reset Instructions"}
                        </>
                      )}
                    </button>

                    {authTab === 'reset' && (
                      <div className="text-center pt-1 font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            setAuthTab('login');
                          }}
                          className="text-[8px] text-zinc-500 hover:text-white uppercase tracking-widest"
                        >
                          ← Return to Sign In
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* Third Party Divider */}
                {authTab !== 'reset' && !resetSuccess && (
                  <div className="relative flex items-center justify-center font-mono py-2">
                    <div className="absolute w-full border-t border-white/5" />
                    <span className="relative bg-zinc-950 px-3 text-[8px] text-zinc-500 uppercase tracking-widest font-bold">OR</span>
                  </div>
                )}

                {/* Google OAuth Uplink button */}
                {authTab !== 'reset' && !resetSuccess && (
                  <div className="space-y-2.5">
                    <button
                      onClick={signIn}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 rounded-sm transition-all font-mono"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Google Authentication
                    </button>

                    <div className="text-center font-mono">
                      <p className="text-[7px] text-zinc-500 uppercase tracking-wider">
                        Running on mobile? If a popup is blocked, use our{" "}
                        <button
                          onClick={signInWithRedirect}
                          className="text-brand hover:underline font-black cursor-pointer"
                        >
                          Google Redirect Flow
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {authError && authError !== "popup_closed" && authError !== "popup_cancelled" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/20 border border-red-500/30 text-brand rounded-sm flex flex-col gap-2 font-mono text-[9px] leading-relaxed uppercase"
                  >
                    <div className="flex gap-2.5 items-start">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="font-bold block">Access Interrupted:</span>
                        {authError.startsWith("unauthorized_domain:") ? (
                          <span>UNAUTHORIZED AUTHENTICATION ORIGIN</span>
                        ) : (
                          authError
                        )}
                      </div>
                    </div>

                    {authError.startsWith("unauthorized_domain:") && (() => {
                      const domainName = authError.split("unauthorized_domain:")[1] || window.location.hostname;
                      return (
                        <div className="mt-2 pt-2 border-t border-red-500/25 space-y-2 text-zinc-300 normal-case font-sans">
                          <p className="font-bold text-brand uppercase font-mono text-[8px]">Action Required: Register Authorized Domain</p>
                          <p className="text-[10px] leading-normal">
                            Firebase Auth blocks Google login on external domains until they are added to your Authorized Domains white-list.
                          </p>
                          <div className="bg-black/40 p-2 border border-white/5 rounded-[1px] font-mono text-[9px] select-all uppercase">
                            Domain: <span className="text-white font-bold">{domainName}</span>
                          </div>
                          <p className="text-[10px] leading-normal pt-1">
                            To fix this:
                          </p>
                          <ol className="list-decimal pl-4 text-[10px] space-y-1.5 leading-normal">
                            <li>
                              Open {' '}
                              <a 
                                href="https://console.firebase.google.com/project/fundamental-quartet-v8gvj/authentication/settings" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-brand font-bold underline hover:text-white"
                              >
                                Firebase Console Settings
                              </a>
                            </li>
                            <li>Scroll down to <span className="text-zinc-100 font-semibold">Authorized domains</span></li>
                            <li>Click <span className="text-zinc-100 font-semibold">Add domain</span></li>
                            <li>Add <span className="font-bold text-white font-mono bg-zinc-900 border border-white/5 px-1 rounded-sm">{domainName}</span></li>
                          </ol>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>

              {/* Status Bar footer */}
              <div className="p-3.5 bg-black/60 border-t border-white/5 flex justify-between text-[7px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                <span>Verification Module</span>
                <span>Production Stack Online</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Bar (Bottom) */}
      <footer className="relative z-50 h-10 border-t border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 text-[8px] font-mono text-zinc-600">
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
