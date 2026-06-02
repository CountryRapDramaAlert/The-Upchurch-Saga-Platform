import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, AlertTriangle, CheckCircle2, XCircle, 
  Trash2, ShieldAlert, Activity, Search, Filter,
  FileText, MessageSquare, ExternalLink, RefreshCw,
  Ban, UserMinus, UserCheck, Inbox
} from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';
import { UserProfile, Report, Evidence, DossierProfile } from '../types';
import { seedFirestore } from '../utils/seeder';
import { getInitialLocalData, updateLocalFallbackItem, deleteLocalFallbackItem } from '../hooks/useFirestore';

type AdminTab = 'submissions' | 'reports' | 'users' | 'dossier';

export default function AdminConsole() {
  const { profile, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [submissions, setSubmissions] = useState<Evidence[]>([]);
  const [dossierPending, setDossierPending] = useState<DossierProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.isAdmin) {
      fetchAdminData();
    }
  }, [profile, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
      } else if (activeTab === 'reports') {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const snap = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        setReports(snap.docs.map(d => ({ ...d.data(), id: d.id } as Report)));
      } else if (activeTab === 'submissions') {
        const q = query(collection(db, 'evidence'), orderBy('createdAt', 'desc'));
        const snap = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        const serverDocs = snap.docs.map(d => ({ ...d.data(), id: d.id } as Evidence));
        const localEvidence = getInitialLocalData('evidence').filter((e: any) => e.status === 'pending');
        
        const merged = [...serverDocs];
        for (const local of localEvidence) {
          if (!merged.some(m => m.id === local.id || (m.title && m.title.toLowerCase() === local.title.toLowerCase()))) {
            merged.push(local);
          }
        }
        setSubmissions(merged);
      } else if (activeTab === 'dossier') {
        const q = query(collection(db, 'dossier'), where('status', '==', 'pending'));
        const snap = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        const serverDocs = snap.docs.map(d => ({ ...d.data(), id: d.id } as DossierProfile));
        const localDossier = getInitialLocalData('dossier').filter((d: any) => d.status === 'pending');
        
        const merged = [...serverDocs];
        for (const local of localDossier) {
          if (!merged.some(m => m.id === local.id || (m.name && m.name.toLowerCase() === local.name.toLowerCase()))) {
            merged.push(local);
          }
        }
        setDossierPending(merged);
      }
    } catch (err) {
      console.warn("Admin data fetch failed from Firestore, loading local backups:", err);
      if (activeTab === 'users') {
        const cachedUsers = localStorage.getItem('firestore_fallback_users');
        setUsers(cachedUsers ? JSON.parse(cachedUsers) : []);
      } else if (activeTab === 'reports') {
        const cachedReports = localStorage.getItem('firestore_fallback_reports');
        setReports(cachedReports ? JSON.parse(cachedReports) : []);
      } else if (activeTab === 'submissions') {
        const localEvidence = getInitialLocalData('evidence');
        setSubmissions(localEvidence.filter((e: any) => e.status === 'pending'));
      } else if (activeTab === 'dossier') {
        const localDossier = getInitialLocalData('dossier');
        setDossierPending(localDossier.filter((d: any) => d.status === 'pending'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDossier = async (id: string, status: 'active' | 'rejected') => {
    // Offline resilient edit
    if (status === 'rejected') {
      deleteLocalFallbackItem('dossier', id);
    } else {
      updateLocalFallbackItem('dossier', id, { status: 'active', levelOfImpact: 0.1 });
    }
    setDossierPending(prev => prev.filter(p => p.id !== id));

    try {
      if (status === 'rejected') {
        await deleteDoc(doc(db, 'dossier', id));
      } else {
        await updateDoc(doc(db, 'dossier', id), { status: 'active', levelOfImpact: 0.1 });
      }
    } catch (err) {
      console.warn("Failed to update dossier status on server, offline cache preserved:", err);
    }
  };

  const handleUpdateEvidence = async (id: string, status: 'approved' | 'rejected') => {
    // Offline resilient edit
    updateLocalFallbackItem('evidence', id, { status });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));

    try {
      await updateDoc(doc(db, 'evidence', id), { status });
    } catch (err) {
      console.warn("Failed to update evidence status on server, offline cache preserved:", err);
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'resolved' });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    } catch (err) {
      console.error("Failed to resolve report:", err);
    }
  };

  const handleToggleBan = async (uid: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'UNBAN' : 'BAN';
    if (!confirm(`ARE YOU SURE YOU WANT TO ${action} THIS USER?`)) return;
    try {
      await updateDoc(doc(db, 'users', uid), { isBanned: !currentBanStatus });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !currentBanStatus } : u));
    } catch (err) {
      console.error("Failed to toggle ban:", err);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO REMOVE THIS USER PROFILE? THIS CANNOT BE UNDONE.")) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-brand">INITIALIZING_SECURE_ACCESS...</div>;
  if (!profile?.isAdmin) return <Navigate to="/" replace />;

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Admin Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl p-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand/10 border border-brand/20 rounded-sm">
            <ShieldAlert className="text-brand" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">OMNIPOTENCE_CONSOLE</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Administrative_High_Command</span>
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-green-500 uppercase">Authenticated: {profile.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={async () => {
              if (window.confirm("ACTIVATE COGNITIVE TIMELINE SEED?\n\nThis will inject 8 high-fidelity approved timeline records, federal lawsuits, and active tracking dossiers into the database describing the Ryan Upchurch saga ($17.5M verdict, cmdshft/Sonny Bama fraud, LeVeille VARA lawsuit, Jelly Roll/Calhoun feuds, etc.).")) {
                try {
                  await seedFirestore();
                  window.alert("DATABASE INTEL SEED COMPLETE: Timeline events, court lawsuits, and social graph dossiers loaded successfully!");
                  fetchAdminData();
                } catch (e: any) {
                  window.alert(`SEED FAILURE: ${e.message}`);
                }
              }
            }}
            className="px-4 py-3 bg-zinc-950 hover:bg-yellow-500 hover:text-black border border-yellow-500/30 text-yellow-400 text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2"
          >
             <RefreshCw size={12} /> SEED COGNITIVE INTEL DATA
          </button>

          <div className="flex items-center gap-2">
            {(['submissions', 'reports', 'users', 'dossier'] as AdminTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                  activeTab === tab 
                  ? 'bg-brand text-white border-brand italic' 
                  : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'submissions' && (
              <motion.div
                key="submissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                     <Inbox size={20} className="text-brand" /> ARCHIVE_QUEUE [{submissions.length}]
                   </h2>
                   <button onClick={fetchAdminData} className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <RefreshCw size={16} />
                   </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="bg-zinc-900/50 border border-white/5 p-6 flex flex-col lg:flex-row justify-between gap-6 group hover:border-brand/30 transition-all">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                               sub.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                               sub.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                             }`}>
                                {sub.status}
                             </span>
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ID: {sub.id}</span>
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{sub.title}</h3>
                             <p className="text-[11px] text-zinc-400 mt-1 uppercase leading-relaxed">{sub.description}</p>
                          </div>
                          <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-600 uppercase">
                             <span>SUBMITTED_BY: {sub.submitterName} ({sub.submittedBy})</span>
                             <span>TYPE: {sub.type}</span>
                          </div>
                       </div>
                       
                       <div className="flex lg:flex-col lg:items-end justify-between gap-4 shrink-0">
                          <a href={sub.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] text-brand hover:underline font-black uppercase italic">
                             <ExternalLink size={12} /> VIEW_SOURCE
                          </a>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => handleUpdateEvidence(sub.id!, 'rejected')}
                               className="p-3 bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                             >
                               <XCircle size={18} />
                             </button>
                             <button 
                               onClick={() => handleUpdateEvidence(sub.id!, 'approved')}
                               className="p-3 bg-green-950/20 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                             >
                               <CheckCircle2 size={18} />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                  {submissions.length === 0 && !loading && (
                    <div className="text-center p-20 border border-dashed border-white/5 opacity-30 uppercase font-mono text-xs italic">
                       No pending submissions in database.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                     <AlertTriangle size={20} className="text-orange-500" /> VIOLATION_REPORTS [{reports.length}]
                   </h2>
                </div>

                <div className="space-y-4">
                   {reports.map((report) => (
                     <div key={report.id} className="p-6 bg-orange-950/10 border border-orange-500/20 hover:border-orange-500/40 transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex gap-4">
                              <span className="px-2 py-1 bg-orange-500 text-black text-[9px] font-black uppercase italic">
                                 {report.reason}
                              </span>
                              <span className={`px-2 py-1 border text-[9px] font-black uppercase italic ${
                                report.status === 'resolved' ? 'border-green-500/40 text-green-500' : 'border-orange-500/40 text-orange-500'
                              }`}>
                                 {report.status}
                              </span>
                           </div>
                           <button 
                             onClick={() => handleResolveReport(report.id!)}
                             disabled={report.status === 'resolved'}
                             className="text-[10px] font-black text-zinc-500 hover:text-green-500 transition-colors uppercase flex items-center gap-2 disabled:opacity-30"
                           >
                              <CheckCircle2 size={14} /> MARK_RESOLVED
                           </button>
                        </div>
                        <p className="text-sm text-white italic mb-4 uppercase">" {report.details} "</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-mono text-zinc-600 uppercase">
                           <div className="flex gap-6">
                              <span>TARGET_TYPE: {report.targetType}</span>
                              <span>TARGET_ID: {report.targetId}</span>
                           </div>
                           <span>REPORTER_ID: {report.reporterId}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                     <Users size={20} className="text-blue-500" /> COMMUNITY_MEMBERS [{users.length}]
                   </h2>
                   <div className="relative w-full md:w-96">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <input 
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-sm py-3 pl-12 pr-4 text-xs font-mono text-white outline-none focus:border-blue-500/50"
                      />
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            <th className="p-4">IDENTIFIER</th>
                            <th className="p-4">STATUS</th>
                            <th className="p-4">KARMA</th>
                            <th className="p-4">JOIN_DATE</th>
                            <th className="p-4 text-right">OPERATIONS</th>
                         </tr>
                      </thead>
                      <tbody className="text-xs font-mono">
                         {filteredUsers.map((user) => (
                           <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                              <td className="p-4">
                                 <div className="flex flex-col">
                                    <span className="text-white font-black uppercase text-[11px]">{user.username}</span>
                                    <span className="text-[10px] text-zinc-600 lowercase">{user.email}</span>
                                    <span className="text-[8px] text-zinc-800 mt-0.5">{user.uid}</span>
                                 </div>
                              </td>
                              <td className="p-4">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <span className={`${user.isBanned ? 'text-red-500' : 'text-green-500'} uppercase text-[10px]`}>
                                       {user.isBanned ? 'BANNED' : 'ACTIVE'}
                                    </span>
                                 </div>
                              </td>
                              <td className="p-4 text-zinc-400 font-bold">{user.karma}</td>
                              <td className="p-4 text-zinc-600 uppercase text-[10px]">
                                 {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button 
                                     onClick={() => handleToggleBan(user.uid, !!user.isBanned)}
                                     className={`p-2 transition-colors ${user.isBanned ? 'text-green-500 hover:text-green-400' : 'text-orange-500 hover:text-orange-400'}`}
                                     title={user.isBanned ? "Unban User" : "Ban User"}
                                   >
                                      {user.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteUser(user.uid)}
                                     className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                                     title="Delete User Profile"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}
            {activeTab === 'dossier' && (
              <motion.div
                key="dossier"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                     <Shield size={20} className="text-brand" /> DOSSIER_SUBMISSIONS [{dossierPending.length}]
                   </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {dossierPending.map((p) => (
                    <div key={p.id} className="bg-zinc-900/50 border border-white/5 p-6 flex flex-col lg:flex-row justify-between gap-6 group hover:border-brand/30 transition-all">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-widest">PENDING</span>
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">IDENTIFIER: {p.name}</span>
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{p.name}</h3>
                             <div className="mt-2 space-y-2">
                               {p.reportedActivities.map((a, i) => (
                                 <p key={i} className="text-[11px] text-zinc-400 uppercase leading-relaxed italic border-l border-brand/30 pl-4">{a}</p>
                               ))}
                             </div>
                             {p.notes && <p className="text-[10px] text-zinc-500 mt-2 uppercase">OFFICER_REMARKS: {p.notes}</p>}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-600 uppercase">SUBMITTED_BY: {p.submittedBy}</div>
                       </div>
                       
                       <div className="flex lg:flex-col lg:items-end justify-between gap-4 shrink-0">
                          <div className="flex gap-2">
                             <button 
                               onClick={() => handleUpdateDossier(p.id!, 'rejected')}
                               className="p-3 bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                             >
                               <XCircle size={18} />
                             </button>
                             <button 
                               onClick={() => handleUpdateDossier(p.id!, 'active')}
                               className="p-3 bg-green-950/20 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                             >
                               <CheckCircle2 size={18} />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Console HUD Overlay */}
      <div className="fixed bottom-8 right-8 pointer-events-none opacity-50">
         <div className="text-right space-y-1">
            <p className="text-[8px] font-mono text-brand uppercase tracking-widest">SECURE_LEVEL: OMNISCIENT</p>
            <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">UPTIME: 99.98%</p>
         </div>
      </div>
    </div>
  );
}
