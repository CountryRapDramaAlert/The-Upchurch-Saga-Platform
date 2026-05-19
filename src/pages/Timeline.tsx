import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Search, Calendar, Tag, ChevronDown, 
  ExternalLink, Video, Image as ImageIcon, FileText,
  Brain, Zap, GitBranch, History, Share2, Terminal,
  ShieldCheck, AlertTriangle, ArrowUp
} from 'lucide-react';
import { Evidence, EventCategory } from '../types';
import IntelligenceReports from '../components/IntelligenceReports';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

const categories: { label: string; value: string | 'all'; color: string }[] = [
  { label: 'All', value: 'all', color: 'bg-zinc-800' },
  { label: 'Beefs', value: 'beef', color: 'bg-red-600' },
  { label: 'Music', value: 'music', color: 'bg-blue-600' },
  { label: 'Legal', value: 'legal', color: 'bg-amber-600' },
  { label: 'Livestreams', value: 'livestream', color: 'bg-purple-600' },
  { label: 'Personal', value: 'personal', color: 'bg-emerald-600' },
];

export default function Timeline() {
  const [filter, setFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: evidence, loading } = useFirestoreCollection<Evidence>('evidence', [
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  ]);

  const filteredEvents = useMemo(() => {
    return evidence.filter(e => {
      const matchesFilter = filter === 'all' || e.tags?.includes(filter.toLowerCase()) || e.type === filter;
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                           e.description.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [evidence, filter, search]);

  const selectedEvent = useMemo(() => 
    evidence.find(e => e.id === selectedEventId) || evidence[0],
    [evidence, selectedEventId]
  );

  const formatDate = (date: any) => {
    if (!date) return 'Unknown Date';
    if (typeof date === 'string') return new Date(date).toLocaleString();
    if (date.toDate) return date.toDate().toLocaleString();
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden bg-black/20">
      {/* Control Sidebar */}
      <aside className="w-full lg:w-96 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-10">
        <div className="p-8 border-b border-white/5">
           <div className="flex items-center gap-3 mb-8">
             <History className="text-brand" size={24} />
             <h1 className="text-sm font-black font-mono tracking-[0.3em] uppercase">Temporal_Archive</h1>
           </div>

           <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                <input 
                  type="text"
                  placeholder="FILTER_SAGA_LOGS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-sm py-2 pl-10 pr-4 outline-none text-[10px] font-mono uppercase tracking-widest focus:border-brand/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFilter(cat.value)}
                    className={`p-2 border rounded-sm text-[8px] font-bold font-mono tracking-widest transition-all ${
                      filter === cat.value 
                        ? 'bg-brand/20 text-brand border-brand' 
                        : 'bg-zinc-950 text-zinc-600 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {cat.label.toUpperCase()}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
           <IntelligenceReports />
        </div>
      </aside>

      {/* Main Timeline Stream */}
      <main className="flex-1 relative overflow-y-auto no-scrollbar scroll-smooth bg-black/40">
        <div className="max-w-4xl mx-auto px-8 py-20 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-900" />
          
          <div className="space-y-12">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">Scanning_Node_Network...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-20 text-center">
                <AlertTriangle className="mx-auto text-zinc-800 mb-4" size={40} />
                <p className="text-[10px] font-black font-mono text-zinc-600 uppercase tracking-widest">No_Corroborating_Evidence_Detected</p>
              </div>
            ) : filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative pl-12 group cursor-pointer ${selectedEventId === event.id ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}`}
                onClick={() => setSelectedEventId(event.id)}
              >
                <div className={`absolute left-0 top-3 w-4 h-4 -translate-x-1/2 rounded-full border-2 bg-black z-10 transition-all ${selectedEventId === event.id ? 'border-brand scale-125 shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'border-zinc-800'}`} />
                
                <div className="flex flex-col gap-1 mb-2">
                   <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                     {formatDate(event.createdAt)}
                   </span>
                   <span className={`w-fit px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest italic bg-zinc-800`}>
                     {event.type}
                   </span>
                </div>

                <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-brand transition-colors mb-2">{event.title}</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-2 italic">"{event.description}"</p>
                
                {selectedEventId === event.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute -inset-4 border border-brand/20 bg-brand/5 pointer-events-none rounded-sm"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Detail Panel */}
      <aside className="hidden xl:flex w-[500px] border-l border-white/5 bg-black/60 backdrop-blur-3xl flex-col z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedEvent ? (
            <motion.div
              key={selectedEvent.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col p-12 overflow-y-auto no-scrollbar"
            >
              <div className="mb-10">
                 <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Intelligence_Node</span>
                      <span className="text-lg font-black text-white italic">{formatDate(selectedEvent.createdAt)}</span>
                    </div>
                    <div className="p-3 bg-brand/10 border border-brand/20 rounded-sm">
                       <ShieldCheck className="text-brand" size={24} />
                    </div>
                 </div>

                 <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-[0.9] mb-8 text-brand">
                   {selectedEvent.title}
                 </h2>

                 <div className="p-6 bg-white/5 border border-white/5 rounded-sm mb-10">
                    <p className="text-sm text-zinc-400 font-light leading-relaxed italic">
                      "{selectedEvent.description}"
                    </p>
                 </div>

                 <div className="space-y-8">
                    {selectedEvent.aiAnalysis && (
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                            <Brain size={12} /> AI_CORE_ANALYSIS
                         </h4>
                         <div className="p-6 bg-brand/5 border border-brand/20 space-y-4">
                            <p className="text-sm text-white italic font-medium tracking-tight uppercase leading-relaxed">
                               {selectedEvent.aiAnalysis.summary}
                            </p>
                            <div className="pt-4 border-t border-brand/20">
                               <p className="text-[9px] text-zinc-500 font-mono uppercase leading-loose">
                                  <span className="text-brand font-black">NARRATIVE_IMPACT:</span> {selectedEvent.aiAnalysis.narrativeImpact}
                               </p>
                            </div>
                         </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Terminal size={12} /> SECURE_EVIDENCE_LOGS
                      </h4>
                      <div className="space-y-2">
                         {selectedEvent.url && (
                           <a 
                             href={selectedEvent.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center justify-between p-4 bg-zinc-950 border border-white/5 rounded-sm hover:border-brand/40 transition-all group/link"
                           >
                              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest group-hover/link:text-white transition-colors uppercase">SOURCE_PROTOCOL_{selectedEvent.type}</span>
                              <ExternalLink size={14} className="text-zinc-700 group-hover/link:text-brand transition-colors" />
                           </a>
                         )}
                         <div className="flex flex-wrap gap-2 pt-2">
                           {selectedEvent.tags?.map(tag => (
                             <span key={tag} className="px-2 py-1 bg-zinc-900 border border-white/5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                               #{tag}
                             </span>
                           ))}
                         </div>
                      </div>
                    </div>

                    <div>
                       <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Zap size={12} /> NARRATIVE_INTEGRITY
                       </h4>
                       <div className="glass-panel p-6 border-white/5 bg-white/5 relative overflow-hidden">
                          <div className="absolute inset-0 cinematic-grid opacity-10" />
                          <div className="relative z-10 flex justify-between items-center">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-mono text-zinc-600 uppercase">Analysis_Confidence</span>
                                <span className="text-2xl font-display font-black text-white italic tracking-tighter">
                                  {selectedEvent.aiAnalysis ? ((selectedEvent.aiAnalysis.validityScore || 0.85) * 100).toFixed(1) : '85.0'}%
                                </span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] font-mono text-zinc-600 uppercase">Conflict_Volatilty</span>
                                <span className="text-2xl font-display font-black text-brand italic tracking-tighter">
                                  {selectedEvent.aiAnalysis ? ((selectedEvent.aiAnalysis.volatility || 0.45) * 100).toFixed(1) : '45.0'}%
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-auto pt-10 border-t border-white/5 flex gap-4">
                 <button className="flex-1 px-6 py-4 bg-brand text-white font-black italic tracking-widest text-[10px] uppercase hover:bg-brand-dark transition-all">
                   SYNCHRONIZE_EVENT
                 </button>
                 <button className="p-4 bg-zinc-900 border border-white/5 hover:border-brand/40 transition-all text-zinc-500">
                   <Share2 size={16} />
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30">
               <Terminal size={48} className="text-zinc-800" />
               <p className="text-[10px] font-black font-mono uppercase tracking-[0.4em]">Awaiting_Selection_Input</p>
            </div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}

