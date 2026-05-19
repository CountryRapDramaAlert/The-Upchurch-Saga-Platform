import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, Eye, AlertCircle, 
  Search, Filter, ExternalLink, Info,
  Terminal, ShieldAlert, Zap, Activity,
  PlusCircle, X, Send, CheckCircle2, Trash2
} from 'lucide-react';
import { collection, query, getDocs, addDoc, orderBy, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { DossierProfile } from '../types';

export default function Dossier() {
  const { user, profile } = useAuthStore();
  const [profiles, setProfiles] = useState<DossierProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | 'all'>('all');
  const [selectedProfile, setSelectedProfile] = useState<DossierProfile | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Submission Form State
  const [newProfile, setNewProfile] = useState({
    name: '',
    role: 'moderator' as DossierProfile['role'],
    activityInput: '',
    activities: [] as string[],
    affiliationsInput: '',
    affiliations: [] as string[],
    notes: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const q = query(collection(db, 'dossier'), where('status', '!=', 'pending'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as DossierProfile));
      
      // Sort in memory since where status != pending and orderby createAt might need index or behaves weird with multiple filters
      setProfiles(data.sort((a, b) => b.levelOfImpact - a.levelOfImpact));
    } catch (err) {
      console.error("Failed to fetch dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'dossier'), {
        name: newProfile.name,
        role: newProfile.role,
        reportedActivities: [...newProfile.activities, newProfile.activityInput].filter(Boolean),
        affiliations: [...newProfile.affiliations, newProfile.affiliationsInput].filter(Boolean),
        notes: newProfile.notes,
        status: 'pending',
        levelOfImpact: 0.1, // Initial impact for new submissions
        submittedBy: user.uid,
        createdAt: new Date().toISOString()
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
        setNewProfile({ name: '', role: 'moderator', activityInput: '', activities: [], affiliationsInput: '', affiliations: [], notes: '' });
      }, 2000);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Ensure you are signed in and all fields are valid.");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!profile?.isAdmin) return;
    if (!confirm("ARE YOU SURE YOU WANT TO PERMANENTLY REMOVE THIS PROFILE FROM THE DOSSIER?")) return;
    try {
      await deleteDoc(doc(db, 'dossier', id));
      setProfiles(prev => prev.filter(p => p.id !== id));
      setSelectedProfile(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.affiliations.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || p.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden bg-black/40">
      {/* Search and Classification Sidebar */}
      <aside className="w-full lg:w-96 border-r border-white/5 bg-black/60 backdrop-blur-3xl flex flex-col shrink-0 z-20 overflow-y-auto no-scrollbar">
        <div className="p-10 space-y-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 border border-brand/20 rounded-sm">
                   <Users className="text-brand" size={24} />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">COMMUNITY_DOSSIER</h1>
                   <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Intelligence_Index: Subjects_&_Admin</p>
                </div>
             </div>
             <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                Objective catalog of community figures, moderators, and subjects involved in the broader YouTube Country Rap ecosystem.
             </p>
          </div>

          <div className="space-y-6">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="SEARCH_NODE_IDENTIFIER..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-sm py-4 pl-12 pr-4 text-xs font-mono text-white focus:border-brand/40 outline-none uppercase placeholder:text-zinc-800 transition-all"
                />
             </div>

             <div className="grid grid-cols-2 gap-2">
                {['all', 'moderator', 'subject', 'community_member'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${
                      selectedRole === role 
                      ? 'bg-brand text-white border-brand italic' 
                      : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Activity size={12} /> SCAN_RESULTS
               </h4>
               <button 
                 onClick={() => setShowSubmitModal(true)}
                 className="p-1 hover:text-brand transition-colors text-zinc-500" 
                 title="Submit New Profile"
               >
                 <PlusCircle size={16} />
               </button>
             </div>
             <div className="space-y-2">
                {filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`w-full text-left p-4 border transition-all group relative overflow-hidden ${
                      selectedProfile?.id === profile.id
                      ? 'bg-brand/10 border-brand/40'
                      : 'bg-zinc-950 border-white/5 hover:border-brand/30'
                    }`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex flex-col">
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${
                            profile.role === 'moderator' ? 'text-blue-500' : 'text-brand'
                          }`}>
                            {profile.role}
                          </span>
                          <span className="text-xs font-black text-white italic uppercase tracking-tighter transition-colors group-hover:text-brand">
                             {profile.name}
                          </span>
                       </div>
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         profile.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-800'
                       }`} />
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </aside>

      {/* Profile Intelligence Display */}
      <main className="flex-1 relative lg:overflow-hidden flex flex-col bg-black/60">
        <AnimatePresence mode="wait">
          {selectedProfile ? (
            <motion.div
              key={selectedProfile.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 lg:p-20 overflow-y-auto no-scrollbar"
            >
              <div className="max-w-4xl mx-auto w-full space-y-16">
                 {/* Identity Header */}
                 <div className="relative">
                    <div className="absolute -left-10 top-0 bottom-0 w-1 bg-brand/40" />
                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-brand/10 border border-brand/40 text-[10px] font-black text-brand uppercase italic">
                            SECURE_ACCESS_CLASSIFIED
                          </span>
                          <div className="h-px flex-1 bg-white/5" />
                       </div>
                       <h2 className="text-6xl lg:text-8xl font-black text-white tracking-tight uppercase leading-[0.8] italic">
                         {selectedProfile.name}
                       </h2>
                       <div className="flex flex-wrap gap-6 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
                          <span className="flex items-center gap-2">
                             <Shield size={14} className="text-brand" /> {selectedProfile.role}
                          </span>
                          <span className="flex items-center gap-2">
                             <Eye size={14} className="text-brand" /> {selectedProfile.status}
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* Core Intel Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div>
                          <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Terminal size={14} className="text-brand" /> REPORTED_ACTIVITIES
                          </h4>
                          <div className="space-y-4">
                             {selectedProfile.reportedActivities.map((activity, i) => (
                               <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                                  <p className="text-xs text-zinc-300 font-light leading-relaxed italic uppercase">
                                     "{activity}"
                                  </p>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div>
                          <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Filter size={14} className="text-brand" /> KNOWN_AFFILIATIONS
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {selectedProfile.affiliations.map((aff, i) => (
                               <span key={i} className="px-4 py-2 bg-zinc-950 border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                 {aff}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="glass-panel p-8 border-brand/20 bg-brand/5 relative overflow-hidden group">
                          <div className="absolute inset-0 cinematic-grid opacity-10 group-hover:opacity-20 transition-opacity" />
                          <div className="relative z-10 space-y-6">
                             <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-brand uppercase tracking-widest">IMPACT_COORDINATE</h4>
                                <ShieldAlert className="text-brand/40" size={32} />
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                   <span className="text-4xl font-display font-black text-white italic">{(selectedProfile.levelOfImpact * 100).toFixed(0)}%</span>
                                   <span className="text-[9px] font-mono text-zinc-500 uppercase pb-1">Community_Influence</span>
                                </div>
                                <div className="h-1 bg-zinc-900 overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${selectedProfile.levelOfImpact * 100}%` }}
                                     transition={{ duration: 1, ease: 'easeOut' }}
                                     className="h-full bg-brand shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                                   />
                                </div>
                             </div>
                             <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase">
                                High influence rating indicates significant control over narrative flow or community management protocols.
                             </p>
                          </div>
                       </div>

                       {selectedProfile.notes && (
                         <div className="p-8 bg-white/5 border border-white/5 space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                               <Info size={14} /> OFFICER_REMARKS
                            </h4>
                            <p className="text-sm text-zinc-400 italic font-light leading-relaxed">
                               {selectedProfile.notes}
                            </p>
                         </div>
                       )}

                       <div className="pt-8 border-t border-white/5 space-y-4">
                          <button className="w-full btn-primary py-6 text-sm flex items-center justify-center gap-3">
                             <Zap size={18} /> GENERATE_FULL_INTEL_REPORT
                          </button>
                          
                          {profile?.isAdmin && (
                            <button 
                              onClick={() => handleDeleteProfile(selectedProfile.id!)}
                              className="w-full py-4 text-[10px] font-black text-red-500 bg-red-950/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                               <Trash2 size={14} /> PURGE_NODE_FROM_DATABASE
                            </button>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 select-none">
               <Users size={120} className="text-zinc-800 mb-8" />
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">SELECT_PROFILE_NODE</h3>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Identity_Confirmation_Required</p>
               </div>
            </div>
          )}
        </AnimatePresence>

        {/* Tactical HUD Overlays */}
        <div className="absolute top-8 right-8 pointer-events-none">
           <div className="text-right space-y-1">
              <p className="text-[8px] font-mono text-brand uppercase tracking-widest">SAGA_VERSION: 1.0.4</p>
              <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">INDEX_MODE: DOSSIER</p>
           </div>
        </div>
      </main>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xl bg-zinc-950 border border-white/10 p-8 space-y-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 cinematic-grid opacity-5" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">SUBMIT_DOSSIER_NODE</h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Community_Intelligence_Protocol</p>
                  </div>
                  <button onClick={() => setShowSubmitModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                    <CheckCircle2 size={48} className="text-brand animate-bounce" />
                    <div className="space-y-1">
                      <p className="text-white font-black uppercase italic">SUBMISSION_RECEIVED</p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">Awaiting_Admin_Verification</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Channel_Name / Node_Identifier</label>
                        <input 
                          type="text"
                          value={newProfile.name}
                          onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-sm p-4 text-xs font-mono text-white outline-none focus:border-brand/40 uppercase"
                          placeholder="e.g. NUGGY_710..."
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Classification_Role</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['moderator', 'subject', 'community_member'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => setNewProfile({...newProfile, role: r})}
                              className={`py-3 text-[8px] font-black uppercase border transition-all ${
                                newProfile.role === r ? 'bg-brand text-white border-brand italic' : 'bg-white/5 text-zinc-500 border-white/5'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Toxic_Traits / Reported_Activities</label>
                        <textarea 
                          value={newProfile.activityInput}
                          onChange={(e) => setNewProfile({...newProfile, activityInput: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-sm p-4 text-xs font-mono text-white outline-none focus:border-brand/40 min-h-[100px] uppercase placeholder:text-zinc-800"
                          placeholder="LIST HARASSMENT, MALICIOUS MODERATION, OR TOXIC BEHAVIORS..."
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Officer_Notes (Optional)</label>
                        <input 
                          type="text"
                          value={newProfile.notes}
                          onChange={(e) => setNewProfile({...newProfile, notes: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-sm p-4 text-xs font-mono text-white outline-none focus:border-brand/40 uppercase"
                          placeholder="PERSONAL EXPERIENCE OR ADDITIONAL CONTEXT..."
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSubmitProfile}
                      disabled={!newProfile.name || !newProfile.activityInput}
                      className="w-full btn-primary py-5 text-[11px] font-black flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                      UPLOAD_INTEL_TO_DATABASE
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
