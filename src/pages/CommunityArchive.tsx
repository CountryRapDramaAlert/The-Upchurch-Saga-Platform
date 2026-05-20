import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Upload, Link as LinkIcon, FileText, Image as ImageIcon, 
  Video, Shield, Info, CheckCircle2, Clock, AlertTriangle, Users,
  ArrowUp, MessageSquare, Tag as TagIcon, X, Check, Trash2, Filter, Flag, Brain
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { Evidence, Report } from '../types';
import { addDoc, collection, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, QueryConstraint, increment, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CommunityArchive() {
  const { user, profile, signIn, setShowLoginModal } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'reports'>('approved');
  
  // Reporting State
  const [reportingItem, setReportingItem] = useState<Evidence | null>(null);
  const [reportReason, setReportReason] = useState<Report['reason']>('other');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Evidence['type']>('text');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');

  const getEvidenceQuery = (): QueryConstraint[] => {
    if (activeTab === 'approved') {
      return [where('status', '==', 'approved'), orderBy('createdAt', 'desc')];
    }
    
    // Pending tab
    if (profile?.isAdmin) {
      // Admins see all pending
      return [where('status', '==', 'pending'), orderBy('createdAt', 'desc')];
    } else {
      // Regular users see only their pending
      return [
        where('status', '==', 'pending'), 
        where('submittedBy', '==', user?.uid || 'none'),
        orderBy('createdAt', 'desc')
      ];
    }
  };

  const { data: evidence, loading } = useFirestoreCollection<Evidence>(
    'evidence', 
    getEvidenceQuery(), 
    activeTab !== 'reports'
  );

  const { data: reports, loading: reportsLoading } = useFirestoreCollection<Report>(
    'reports', 
    profile?.isAdmin && activeTab === 'reports' ? [where('status', '==', 'pending'), orderBy('createdAt', 'desc')] : [],
    !!profile?.isAdmin && activeTab === 'reports'
  );

  const formatDate = (date: any) => {
    if (!date) return 'Unknown Date';
    if (typeof date === 'string') return new Date(date).toLocaleString();
    if (date.toDate) return date.toDate().toLocaleString();
    return new Date(date).toLocaleString();
  };

  const canSeeAdminTabs = profile?.isAdmin;

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected', authorId?: string) => {
    if (!profile?.isAdmin) return;
    try {
      if (status === 'rejected') {
        await deleteDoc(doc(db, 'evidence', id));
      } else {
        await updateDoc(doc(db, 'evidence', id), { 
          status: 'approved',
          updatedAt: serverTimestamp()
        });
        if (authorId) {
          try {
            await updateDoc(doc(db, 'users', authorId), {
              karma: increment(50)
            });
          } catch (e) {
            console.warn("Could not award karma", e);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = async (id: string, authorId: string) => {
    if (!user) return setShowLoginModal(true);
    try {
      await updateDoc(doc(db, 'evidence', id), {
        votes: increment(1)
      });
      try {
        await updateDoc(doc(db, 'users', authorId), {
          karma: increment(5)
        });
      } catch (e) {
        console.warn("Could not award karma", e);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportingItem) return;
    
    setIsReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        targetId: reportingItem.id,
        targetType: 'evidence',
        reason: reportReason,
        details: reportDetails,
        reporterId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setReportingItem(null);
      setReportDetails('');
      alert("Report submitted. Our moderation team will review this investigation shortly.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsReporting(false);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete', targetId: string) => {
    if (!profile?.isAdmin) return;
    try {
      if (action === 'delete') {
        if (confirm('Delete reported content?')) {
          await deleteDoc(doc(db, 'evidence', targetId));
          await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
        }
      } else {
        await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      
      // Real AI Analysis Call
      let aiResults = null;
      try {
        const aiResponse = await fetch('/api/ai/analyze-evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, url, tags: tagList })
        });
        if (aiResponse.ok) {
          aiResults = await aiResponse.json();
        }
      } catch (aiErr) {
        console.warn("AI Analysis offline, proceeding with manual submission", aiErr);
      }

      await addDoc(collection(db, 'evidence'), {
        title,
        description,
        type,
        url,
        submittedBy: user.uid,
        submitterName: profile?.username || 'Anonymous',
        status: 'pending',
        votes: 0,
        tags: tagList,
        createdAt: serverTimestamp(),
        aiAnalysis: aiResults
      });
      
      setTitle('');
      setDescription('');
      setUrl('');
      setTags('');
      setShowForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden bg-black/40">
      {/* Tactical Report Sidebar */}
      <aside className="w-full lg:w-96 border-r border-white/5 bg-black/60 backdrop-blur-3xl flex flex-col shrink-0 z-20 overflow-y-auto no-scrollbar">
        <div className="p-10 space-y-12">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-6">
              COMMUNITY <span className="text-brand">ARCHIVE</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] leading-relaxed">
              DECENTRALIZED_INTEL_GATHERING_UNIT_V2
            </p>
          </div>

          <div className="space-y-8">
            <div className="glass-panel p-6 border-zinc-800 bg-black/40 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand flex items-center gap-3">
                <Shield size={18} /> INTEL_PROTOCOLS
              </h3>
              <ul className="space-y-4">
                 {[
                   'No private individual doxxing.',
                   'Verify all source metadata.',
                   'Avoid speculative labeling.',
                   'High-fidelity captures only.'
                 ].map((rule, i) => (
                   <li key={i} className="flex gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <CheckCircle2 size={14} className="text-brand shrink-0" /> {rule}
                   </li>
                 ))}
              </ul>
            </div>

            <div className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3 italic">
                 <AlertTriangle size={18} className="text-brand" /> Active_Threat_Feed
               </h3>
               <div className="space-y-4">
                 <Link to="/dossier" className="block p-4 bg-brand/10 border border-brand/30 hover:bg-brand/20 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black text-brand uppercase tracking-[0.3em]">GLOBAL_INTEL_INDEX</span>
                      <Users size={12} className="text-brand" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase italic tracking-widest text-white group-hover:underline">ACCESS_COMMUNITY_DOSSIER</h4>
                 </Link>
                 {[
                   { title: "The Sarah D. Recording", submissions: 24, status: "URGENT" },
                   { title: "HHR Contract Leak", submissions: 8, status: "ONGOING" },
                   { title: "Deleted Live: May 12th", submissions: 3, status: "SEEKING" },
                 ].map((inv) => (
                   <div key={inv.title} className="p-4 bg-zinc-950 border border-white/5 group hover:border-brand/40 transition-all cursor-pointer">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-[8px] font-black text-brand uppercase tracking-widest animate-pulse">{inv.status}</span>
                       <span className="text-[8px] text-zinc-600 font-mono">{inv.submissions} NODES</span>
                     </div>
                     <h4 className="text-[10px] font-black uppercase italic tracking-widest text-zinc-400 group-hover:text-white transition-colors">{inv.title}</h4>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-10 bg-brand/5 border-t border-brand/20">
           <div className="flex items-center gap-4 text-brand mb-4 text-[10px] font-black uppercase tracking-widest">
              <Shield size={16} /> Encryption_Engaged
           </div>
           <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest leading-loose">
             Any malicious acts against this collective will result in permanent hardware banning across the mesh network.
           </p>
        </div>
      </aside>

      {/* Main Intelligence Grid */}
      <main className="flex-1 relative lg:overflow-hidden flex flex-col">
        {/* Background Ambient */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,0,0.3)_0%,transparent_50%)]" />
           <div className="absolute inset-0 cinematic-grid" />
        </div>

        {/* Tab Sub-Header HUD */}
        <div className="h-20 border-b border-white/5 bg-zinc-950/50 backdrop-blur-3xl flex items-center justify-between px-10 shrink-0 z-20">
           <div className="flex gap-10">
              <button 
                onClick={() => setActiveTab('approved')}
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'approved' ? 'text-brand' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                TACTICAL_FEED
                {activeTab === 'approved' && <motion.div layoutId="tab-u" className="absolute -bottom-[31px] left-0 right-0 h-1 bg-brand" />}
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'pending' ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                {canSeeAdminTabs ? 'REVIEW_QUEUE' : 'MY_INTEL'}
                {activeTab === 'pending' && <motion.div layoutId="tab-u" className="absolute -bottom-[31px] left-0 right-0 h-1 bg-amber-500" />}
              </button>
              {canSeeAdminTabs && (
                <button 
                  onClick={() => setActiveTab('reports')}
                  className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'reports' ? 'text-red-500' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  DEVIATION_REPORTS
                  {activeTab === 'reports' && <motion.div layoutId="tab-u" className="absolute -bottom-[31px] left-0 right-0 h-1 bg-red-500" />}
                </button>
              )}
           </div>

           <button 
             onClick={() => user ? setShowForm(!showForm) : setShowLoginModal(true)}
             className="px-8 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-[0.4em] italic hover:bg-brand-dark transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(183,14,35,0.2)]"
           >
             {showForm ? <X size={16} /> : <Upload size={16} />}
             {showForm ? 'CANCEL_POD_DROP' : 'UPLOAD_EVIDENCE_POD'}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-10 lg:p-20 relative z-10">
           {/* Submission Form Overlay */}
           <AnimatePresence>
             {showForm && (
               <motion.div 
                 initial={{ opacity: 0, y: -50 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -50 }}
                 className="max-w-4xl mx-auto mb-20 glass-panel p-10 border-brand/50 bg-brand/5 space-y-10"
               >
                  <div className="flex items-center gap-6 pb-6 border-b border-brand/20">
                     <div className="p-4 bg-brand rounded-full">
                        <Upload size={24} className="text-white" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Initialize Pod Drop</h2>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SUBMITTING_ENTRY_TO_CORE_MANIFEST_V2.0</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Entry_Title</label>
                           <input 
                             required
                             type="text" 
                             value={title}
                             onChange={(e) => setTitle(e.target.value)}
                             placeholder="MANIFEST_ID_LABEL..."
                             className="w-full bg-zinc-950 border border-white/10 rounded-sm py-4 px-4 text-[11px] font-mono focus:border-brand/60 outline-none uppercase transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Description_Log</label>
                           <textarea 
                             required
                             rows={6}
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                             placeholder="DIVE_INTO_THE_ANALYSIS..."
                             className="w-full bg-zinc-950 border border-white/10 rounded-sm py-4 px-4 text-[11px] font-mono focus:border-brand/60 outline-none uppercase transition-all resize-none"
                           />
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Media_Protocol</label>
                           <div className="grid grid-cols-3 gap-2">
                              {(['image', 'video', 'link'] as const).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setType(t)}
                                  className={`py-3 border text-[9px] font-black uppercase tracking-[0.2em] transition-all italic ${type === t ? 'bg-brand border-brand text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'border-zinc-800 text-zinc-600 hover:border-zinc-500'}`}
                                >
                                  {t}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Source_Reference_Link</label>
                           <input 
                             type="url" 
                             value={url}
                             onChange={(e) => setUrl(e.target.value)}
                             placeholder="HTTPS://MANIFEST_ORIGIN..."
                             className="w-full bg-zinc-950 border border-white/10 rounded-sm py-4 px-4 text-[11px] font-mono focus:border-brand/60 outline-none transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Intel_Tags (comma separated)</label>
                           <input 
                             type="text" 
                             value={tags}
                             onChange={(e) => setTags(e.target.value)}
                             placeholder="TAG_1, TAG_2..."
                             className="w-full bg-zinc-950 border border-white/10 rounded-sm py-4 px-4 text-[11px] font-mono focus:border-brand/60 outline-none uppercase transition-all"
                           />
                        </div>
                        <button 
                          disabled={isSubmitting}
                          type="submit" 
                          className="w-full py-5 bg-brand text-white text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-4 hover:bg-brand-dark transition-all shadow-[0_0_30px_rgba(183,14,35,0.3)]"
                        >
                          {isSubmitting ? 'ENGAGING_PROTOCOL...' : 'DECOY_DROP_&_SUBMIT'}
                        </button>
                     </div>
                  </form>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Content Grid */}
           <div className="max-w-6xl mx-auto space-y-12 pb-20">
              {loading || (activeTab === 'reports' && reportsLoading) ? (
                <div className="h-64 flex flex-col items-center justify-center gap-6">
                   <div className="w-12 h-12 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                   <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] animate-pulse">Deep_Scanning_Database...</p>
                </div>
              ) : activeTab === 'reports' ? (
                 <div className="space-y-6">
                   {reports.length === 0 ? (
                     <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 gap-4 opacity-30">
                        <CheckCircle2 size={40} className="text-zinc-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">All Systems Clear</p>
                     </div>
                   ) : (
                     reports.map(report => (
                       <div key={report.id} className="p-8 bg-red-950/20 border border-red-500/30 flex flex-col lg:flex-row justify-between gap-8 group">
                          <div className="space-y-4">
                             <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest">{report.reason}</span>
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">REP_ID: {report.reporterId.slice(0, 8)}</span>
                             </div>
                             <h4 className="text-xl font-black uppercase italic tracking-tighter text-white underline decoration-red-600/30">Target: {report.targetId}</h4>
                             <p className="text-[11px] text-zinc-500 font-light leading-relaxed uppercase tracking-wider italic">
                                "{report.details || "No clarifying metadata provided for this incident report."}"
                             </p>
                          </div>
                          <div className="flex lg:flex-col gap-4 justify-center shrink-0">
                             <button 
                               onClick={() => handleResolveReport(report.id!, 'dismiss', report.targetId)}
                               className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all italic"
                             >
                               DRAIN_REPORT
                             </button>
                             <button 
                               onClick={() => handleResolveReport(report.id!, 'delete', report.targetId)}
                               className="px-6 py-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all italic"
                             >
                               TERMINATE_TARGET
                             </button>
                          </div>
                       </div>
                     ))
                   )}
                 </div>
              ) : evidence.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 gap-4 opacity-30">
                    <AlertTriangle size={40} className="text-zinc-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Manifest Data Detected</p>
                 </div>
              ) : (
                 <div className="space-y-10">
                   {evidence.map(item => (
                     <motion.div 
                       layout
                       key={item.id}
                       className="group bg-zinc-950 border border-white/5 hover:border-brand/40 transition-all flex flex-col lg:flex-row overflow-hidden hover:shadow-[0_0_40px_rgba(255,0,0,0.05)]"
                     >
                        <div className="lg:w-20 bg-black flex lg:flex-col items-center justify-center gap-4 py-6 border-b lg:border-b-0 lg:border-r border-white/5">
                           <button 
                             onClick={() => handleVote(item.id!, item.submittedBy)}
                             className="p-3 text-zinc-700 hover:text-brand transition-colors hover:scale-125"
                           >
                             <ArrowUp size={24} />
                           </button>
                           <span className="font-display font-black text-2xl text-zinc-400">{item.votes}</span>
                        </div>

                        <div className="flex-1 p-8 lg:p-12 space-y-8">
                           <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="space-y-2">
                                 <div className="flex items-center gap-3">
                                    <span className="px-3 py-0.5 bg-zinc-900 text-zinc-500 text-[8px] font-mono uppercase tracking-[0.2em] border border-white/5">{item.type}</span>
                                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">{formatDate(item.createdAt)} // BY {item.submitterName}</span>
                                 </div>
                                 <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter group-hover:text-brand transition-colors">{item.title}</h3>
                              </div>
                              {item.status === 'pending' && (
                                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">
                                  Verification_Pending
                                </div>
                              )}
                           </div>

                           <p className="text-[13px] text-zinc-500 font-light leading-relaxed uppercase tracking-wider italic">
                              "{item.description}"
                           </p>

                           {item.aiAnalysis && (
                             <div className="p-6 bg-brand/5 border border-brand/20 space-y-4">
                                <div className="flex items-center justify-between">
                                   <h4 className="text-[10px] font-black text-brand uppercase tracking-[0.4em] flex items-center gap-2">
                                     <Brain size={14} /> INTELLIGENCE_SUMMARY
                                   </h4>
                                   <div className="flex gap-4">
                                      <div className="flex flex-col items-end">
                                         <span className="text-[7px] text-zinc-600 uppercase">VOLATILITY</span>
                                         <span className="text-[10px] font-black text-brand italic">{(item.aiAnalysis.volatility * 100).toFixed(0)}%</span>
                                      </div>
                                      <div className="flex flex-col items-end">
                                         <span className="text-[7px] text-zinc-600 uppercase">VALIDITY</span>
                                         <span className="text-[10px] font-black text-green-500 italic">{(item.aiAnalysis.validityScore * 100).toFixed(0)}%</span>
                                      </div>
                                   </div>
                                </div>
                                <p className="text-[11px] text-zinc-300 font-medium italic border-l-2 border-brand/40 pl-4 py-1 uppercase leading-relaxed tracking-wider">
                                   {item.aiAnalysis.summary}
                                </p>
                                <div className="pt-2">
                                   <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest leading-relaxed">
                                      <span className="text-brand font-black">IMPACT:</span> {item.aiAnalysis.narrativeImpact}
                                   </p>
                                </div>
                             </div>
                           )}

                           <div className="flex flex-wrap items-center justify-between gap-10 pt-8 border-t border-white/5">
                              <div className="flex gap-2">
                                 {item.tags?.map(tag => (
                                   <span key={tag} className="flex items-center gap-2 text-[9px] font-black text-brand bg-brand/5 px-3 py-1.5 border border-brand/20 uppercase italic">
                                     <TagIcon size={12} /> {tag}
                                   </span>
                                 ))}
                              </div>

                              <div className="flex items-center gap-6">
                                 {profile?.isAdmin && item.status === 'pending' ? (
                                   <div className="flex gap-3">
                                      <button 
                                        onClick={() => handleStatusUpdate(item.id!, 'rejected')}
                                        className="px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                                      >
                                        <Trash2 size={14} /> PURGE
                                      </button>
                                      <button 
                                        onClick={() => handleStatusUpdate(item.id!, 'approved', item.submittedBy)}
                                        className="px-6 py-3 bg-green-600/10 text-green-600 border border-green-600/20 text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
                                      >
                                        <Check size={14} /> RATIFY
                                      </button>
                                   </div>
                                 ) : (
                                   <>
                                      <button className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase italic tracking-widest">
                                        <MessageSquare size={16} /> 0_Discuss
                                      </button>
                                      {item.url && (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-900 border border-white/5 text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-brand hover:border-brand transition-all italic">
                                           ACCESS_SOURCE
                                        </a>
                                      )}
                                      <button 
                                        onClick={() => setReportingItem(item)}
                                        className="text-zinc-800 hover:text-red-600 transition-colors"
                                      >
                                        <Flag size={18} />
                                      </button>
                                   </>
                                 )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                 </div>
              )}
           </div>
        </div>

        {/* Global Terminal Footer */}
        <div className="h-12 bg-black border-t border-white/5 flex items-center justify-between px-10 relative z-20">
           <div className="flex items-center gap-10">
              <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em]">Global_Investigation_Mesh: Running</p>
              <div className="flex gap-4">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-zinc-900" />)}
              </div>
           </div>
           <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest italic">
             "Collective transparency is the ultimate deterrent."
           </p>
        </div>
      </main>

      {/* Reporting Modal Overlay */}
      <AnimatePresence>
        {reportingItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 lg:p-24">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportingItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-[40px]" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -100 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-red-500/30 p-12 space-y-10"
              onClick={e => e.stopPropagation()}
            >
               <div className="flex items-center gap-6 pb-6 border-b border-red-500/20">
                  <div className="p-4 bg-red-600 rounded-full">
                     <Flag size={24} className="text-white" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">LODGE_VIOLATION</h2>
                     <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Entry: {reportingItem.id}</p>
                  </div>
               </div>

               <form onSubmit={handleReportSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest">Violation_Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['copyright', 'doxxing', 'harassment', 'spam', 'other'] as const).map(reason => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setReportReason(reason)}
                          className={`py-3 px-4 border text-[9px] font-black uppercase tracking-widest transition-all italic ${reportReason === reason ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(255,0,0,0.4)]' : 'border-zinc-800 text-zinc-600 hover:border-zinc-500'}`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest">Incident_Dossier</label>
                    <textarea 
                      required
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={4}
                      placeholder="PROVIDE_METADATA_EXTRACTS..."
                      className="w-full bg-zinc-950 border border-white/5 rounded-sm py-4 px-4 text-[11px] font-mono focus:border-red-500/40 outline-none transition-all italic resize-none"
                    />
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setReportingItem(null)}
                      className="flex-1 py-5 bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] font-mono"
                    >
                      DISCARD
                    </button>
                    <button 
                      disabled={isReporting}
                      type="submit"
                      className="flex-1 py-5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] disabled:opacity-50"
                    >
                      {isReporting ? 'LOGGING_VIOLATION...' : 'EXECUTE_REPORT'}
                    </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
