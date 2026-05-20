import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, History, ShieldAlert, Archive, 
  Map, Search, Menu, X, User, 
  LogOut, Scale, Music, MessageSquare, AlertTriangle, Users, Shield 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, profile, signIn, logout, setShowLoginModal } = useAuthStore();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Timeline', path: '/timeline', icon: History },
    { name: 'Beefs & Drama', path: '/drama', icon: AlertTriangle },
    { name: 'Community Dossier', path: '/dossier', icon: Users },
    { name: 'Lawsuit Tracker', path: '/lawsuits', icon: Scale },
    { name: 'Media Vault', path: '/vault', icon: Archive },
    { name: 'Mokon Archive', path: '/mokon', icon: Music },
    { name: 'Drama Map', path: '/map', icon: Map },
    { name: 'War Room', path: '/war-room', icon: ShieldAlert },
    { name: 'Archive', path: '/archive', icon: MessageSquare },
  ];

  if (profile?.isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin-console', icon: Shield });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                <ShieldAlert className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tighter text-white">UPCHURCH <span className="text-brand">SAGA</span></span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive ? 'text-brand' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-white leading-none">{profile?.username}</p>
                  <p className="text-[10px] text-brand uppercase tracking-widest">{profile?.karma} Karma</p>
                </div>
                <button 
                  onClick={() => logout()}
                  title="Log Out"
                  className="p-2 bg-white/5 rounded-full hover:bg-brand/20 transition-colors group flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-brand" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-brand/15 hover:bg-brand/25 text-brand border border-brand/35 rounded-md text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
              >
                <User className="w-4 h-4" />
                Log In
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-900 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-white/10"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              ))}

              {user ? (
                <div className="pt-4 pb-2 border-t border-white/10 mt-4 px-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{profile?.username}</p>
                      <p className="text-[11px] text-brand uppercase tracking-wider">{profile?.karma} Karma</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 py-1.5 px-3 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold rounded-md border border-brand/20 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 mt-4 px-3">
                  <button 
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full py-2 bg-brand/10 hover:bg-brand/20 text-brand font-bold rounded-md border border-brand/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Log In / Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
