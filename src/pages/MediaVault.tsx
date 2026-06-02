import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, ImageIcon, FileText, Search, 
  Filter, Grid, List, Download, Share2, 
  Maximize2, MoreVertical, Calendar, Video, Clock, ShieldCheck, AlertTriangle, X, Info
} from 'lucide-react';

type MediaCategory = 
  | 'Livestream Archives' 
  | 'Diss Track Era' 
  | 'Legal & Court References' 
  | 'Screenshots & Receipts' 
  | 'Commentary Channels' 
  | 'Timeline Media' 
  | 'Archived Social Posts' 
  | 'Community Submissions' 
  | 'Country Rap History';

interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'document';
  date: string;
  category: MediaCategory;
  thumbnail: string;
  duration?: string;
  status: 'available' | 'processing' | 'pending_verification';
  description?: string;
  externalUrl?: string; // Add external URL support
  youtubeId?: string; // Support embedded YouTube playing
}

const mediaData: MediaItem[] = [
  { 
    id: 'V-001', 
    title: 'Adam Calhoun: "Tweaker" Diss Track', 
    type: 'video', 
    date: '2025-01-05', 
    category: 'Diss Track Era',
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop', 
    duration: '03:45',
    status: 'available',
    description: 'The initial shot fired by Adam Calhoun targeting Upchurch, starting the 2025 country rap feud.'
  },
  { 
    id: 'D-102', 
    title: 'Robertson v. Upchurch: District Court Ruling', 
    type: 'document', 
    date: '2024-05-23', 
    category: 'Legal & Court References',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop', 
    status: 'available',
    description: 'The May 2024 federal court order allowing the Kiely Rodni defamation claims to proceed.'
  },
  { 
    id: 'S-203', 
    title: 'Deleted Instagram Story: Betrayal Claims', 
    type: 'image', 
    date: '2026-02-01', 
    category: 'Screenshots & Receipts',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=2574&auto=format&fit=crop', 
    status: 'pending_verification',
    description: 'User-submitted screen capture of a deleted IG story. Currently undergoing metadata verification.'
  },
  { 
    id: 'V-004', 
    title: 'WhoTFisJustinTime: The Complete Breakdown', 
    type: 'video', 
    date: '2025-05-10', 
    category: 'Commentary Channels',
    thumbnail: 'https://images.unsplash.com/photo-1478720170044-f8b7035bcde2?q=80&w=2670&auto=format&fit=crop', 
    duration: '18:45',
    status: 'processing',
    description: 'Deep dive into the management disputes. Encoding in progress.'
  },
  { 
    id: 'V-005', 
    title: 'Church\'s Coffin - High Fidelity Rip', 
    type: 'video', 
    date: '2024-08-15', 
    category: 'Diss Track Era',
    thumbnail: 'https://images.unsplash.com/photo-1514525253361-903e0670dca9?q=80&w=2670&auto=format&fit=crop', 
    duration: '03:22',
    status: 'available'
  },
  { 
    id: 'H-901', 
    title: 'Early Upchurch / Calhoun Collaboration Archive', 
    type: 'image', 
    date: '2019-06-20', 
    category: 'Country Rap History',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2670&auto=format&fit=crop', 
    status: 'available'
  },
  {
    id: 'V-006',
    title: 'Did He Say That: The Robertson/Rodni Case Retrospective',
    type: 'video',
    date: '2023-01-12',
    category: 'Livestream Archives',
    thumbnail: 'https://img.youtube.com/vi/XpDN4ZRctDM/mqdefault.jpg',
    duration: '15:20',
    status: 'available',
    youtubeId: 'XpDN4ZRctDM',
    description: 'An analytical compilation of early live streams concerning the Kiely Rodni search operations. Examines how the initial narrative speculation patterns developed into federal civil actions.'
  },
  {
    id: 'V-007',
    title: 'Behind the Scenes: cmdshft & Sonny Bama Royalty Conflict',
    type: 'video',
    date: '2026-02-14',
    category: 'Legal & Court References',
    thumbnail: 'https://img.youtube.com/vi/j2vouvpa9PI/mqdefault.jpg',
    duration: '22:45',
    status: 'available',
    youtubeId: 'j2vouvpa9PI',
    description: 'Detailed analysis of leaked deposition transcripts, unauthorized credit transfers, and intellectual property disputes between the Outlaw collective, cmdshft, and Bama.'
  },
  {
    id: 'V-008',
    title: 'Historic Verdict: Inside the $17.5M Defamation Judgment',
    type: 'video',
    date: '2026-05-19',
    category: 'Commentary Channels',
    thumbnail: 'https://img.youtube.com/vi/y9ZThcahQCA/mqdefault.jpg',
    duration: '12:05',
    status: 'available',
    youtubeId: 'y9ZThcahQCA',
    description: 'In-depth review of the federal jury’s historic civil verdict in Nashville, detailing the precedents set for online developer and creator content liability.'
  },
  {
    id: 'V-009',
    title: 'Uncompromising Truth: The Mokon Pioneer Chronicle',
    type: 'video',
    date: '2021-06-30',
    category: 'Community Submissions',
    thumbnail: 'https://img.youtube.com/vi/VAkHWmEhUr0/mqdefault.jpg',
    duration: '08:50',
    status: 'available',
    youtubeId: 'VAkHWmEhUr0',
    description: 'Archive detailing the historical 2021 response patterns. Documents the systematic community efforts to suppress digital accountability footprints.'
  }
];

export default function MediaVault() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<MediaCategory | 'All'>('All');

  const filteredData = mediaData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (MediaCategory | 'All')[] = [
    'All',
    'Livestream Archives',
    'Diss Track Era',
    'Legal & Court References',
    'Screenshots & Receipts',
    'Commentary Channels',
    'Timeline Media',
    'Archived Social Posts',
    'Community Submissions',
    'Country Rap History'
  ];

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden bg-black/40">
      {/* Search & Category Sidebar */}
      <aside className="w-full lg:w-80 border-r border-white/5 bg-black/60 backdrop-blur-3xl flex flex-col shrink-0 z-20">
        <div className="p-8 space-y-8">
           <div>
              <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
                 DIGITAL <span className="text-brand">VAULT</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-relaxed">
                 CORE_INTEL_SYSTEM_V3.1
              </p>
           </div>

           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-brand transition-colors" size={16} />
              <input 
                type="text"
                placeholder="SCAN_MANIFEST..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-sm py-4 pl-10 pr-4 focus:border-brand/40 outline-none text-[10px] font-mono uppercase tracking-widest transition-all"
              />
           </div>

           <div className="space-y-2">
              <label className="text-[9px] font-black font-mono text-zinc-600 uppercase tracking-widest block mb-4 underline decoration-zinc-800 underline-offset-8 decoration-2">CATEGORY_INDEX</label>
              <div className="space-y-1">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`w-full text-left p-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between border border-transparent ${activeCategory === cat ? 'bg-brand/10 text-brand border-brand/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                     {cat}
                     {activeCategory === cat && <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 bg-black/40">
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-zinc-600 uppercase">SERVER_LOAD</span>
                 <span className="text-white">MEDIUM</span>
              </div>
              <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                 <div className="h-full bg-brand w-1/3" />
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative p-8 lg:p-12 space-y-12">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none opacity-5">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,0,0,0.2)_0%,transparent_50%)]" />
           <div className="absolute inset-0 cinematic-grid" />
        </div>

        <header className="flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
           <div className="glass-panel p-6 border-brand/20 bg-brand/5 max-w-2xl flex gap-6 items-start">
              <AlertTriangle className="text-brand shrink-0" size={24} />
              <div className="space-y-2">
                 <h4 className="text-xs font-black uppercase tracking-widest text-white italic underline decoration-brand underline-offset-4">Active Expansion Notice</h4>
                 <p className="text-[10px] text-zinc-400 font-light leading-relaxed uppercase tracking-wider">
                   System undergoing rapid archival ingestion. New community-vetted evidence nodes are appearing in real-time. Verification layers are strictly enforced.
                 </p>
              </div>
           </div>

           <div className="flex gap-2 p-1 bg-zinc-950 border border-white/5">
              <button 
                onClick={() => setView('grid')}
                className={`px-4 py-2 border transition-all ${view === 'grid' ? 'bg-brand border-brand text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`px-4 py-2 border transition-all ${view === 'list' ? 'bg-brand border-brand text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
              >
                <List size={16} />
              </button>
           </div>
        </header>

        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 relative z-10' : 'space-y-6 relative z-10'}>
          {filteredData.map((item) => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative overflow-hidden bg-zinc-950 border border-white/5 transition-all hover:border-brand/40 hover:shadow-[0_0_40px_rgba(255,0,0,0.1)] ${
                view === 'list' ? 'flex items-center gap-8 p-4 shrink-0' : 'flex flex-col'
              }`}
            >
              {/* Thumbnail */}
              <div className={`relative overflow-hidden bg-black shrink-0 ${
                view === 'list' ? 'w-64 aspect-video rounded-sm' : 'aspect-video'
              }`}>
                {item.status === 'processing' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 border-2 border-dashed border-white/5">
                    <Clock className="text-zinc-700 animate-spin" size={24} />
                    <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">ARCHIVE_ENCODING</span>
                  </div>
                ) : item.status === 'pending_verification' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-3 text-amber-500/50">
                    <ShieldCheck className="animate-pulse" size={24} />
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-black">UNVERIFIED_INTEL</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale brightness-[0.35] blur-[1px] transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-[0.8] group-hover:blur-0 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-16 h-16 bg-brand text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                        <Play fill="currentColor" size={24} className="ml-1" />
                      </div>
                    </div>
                  </>
                )}
                
                {item.duration && item.status === 'available' && (
                  <div className="absolute bottom-4 right-4 bg-black/90 border border-white/10 px-3 py-1 font-mono text-[9px] text-white">
                    {item.duration}
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                   <div className="px-3 py-1 bg-black/90 border border-white/5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                     ID:{item.id}
                   </div>
                   {item.externalUrl && (
                     <div className="px-3 py-1 bg-blue-600 text-[8px] font-mono text-white uppercase tracking-widest font-black animate-pulse">
                        EXTERNAL_HUB
                     </div>
                   )}
                </div>
              </div>

              {/* Info */}
              <div className={view === 'list' ? 'flex-1 py-4 pr-8' : 'p-8 flex-1 flex flex-col'}>
                <div className="flex-1 mb-10">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-[9px] font-black text-brand uppercase tracking-[0.2em] italic">{item.category}</span>
                      <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{item.date}</span>
                   </div>
                   <h3 className="text-xl font-display font-black leading-tight uppercase italic group-hover:text-brand transition-colors mb-4">{item.title}</h3>
                   <p className="text-[10px] text-zinc-500 font-light leading-relaxed uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                     {item.description || "Archival node contains critical historical alignment markers for the 2025 fracture narrative."}
                   </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    disabled={item.status !== 'available'}
                    onClick={() => {
                      if (item.externalUrl) {
                        window.open(item.externalUrl, '_blank');
                      } else {
                        setSelectedItem(item);
                      }
                    }}
                    className="flex-1 py-4 bg-zinc-900 border border-white/5 hover:bg-brand hover:border-brand hover:text-white transition-all text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic group/btn disabled:opacity-20"
                  >
                    <Maximize2 size={14} className="group-hover/btn:scale-125 transition-transform" /> 
                    {item.externalUrl ? 'EXTERNAL_ACCESS' : 'INITIALIZE_SCAN'}
                  </button>
                  <button className="p-4 bg-zinc-950 border border-white/5 hover:border-brand/40 text-zinc-600 hover:text-brand transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="py-24 border-t border-white/5 mt-12 text-center space-y-8 relative z-10">
           <div className="space-y-2">
              <p className="text-zinc-700 font-mono text-[8px] uppercase tracking-[0.8em]">MANIFEST_STREAM_HALTED</p>
              <h2 className="text-xl font-display font-black uppercase tracking-tighter italic text-zinc-400">Missing Archival Data?</h2>
           </div>
           <button className="px-12 py-5 bg-brand text-white text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-brand-dark transition-all shadow-[0_0_30px_rgba(183,14,35,0.2)]">
             Submit verified Evidence
           </button>
        </footer>
      </main>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 lg:p-24 origin-top">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-[50px]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -100 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-7xl bg-zinc-950 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col lg:flex-row"
              onClick={e => e.stopPropagation()}
            >
               {/* Close Button UI */}
               <div className="absolute top-0 right-0 p-8 z-50">
                  <button onClick={() => setSelectedItem(null)} className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-colors">
                    <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all">TERMINATE_PROCESS</span>
                    <X size={32} className="group-hover:rotate-90 transition-transform" />
                  </button>
               </div>

               {/* Left Segment: Visual/Media */}
               <div className="lg:w-2/3 bg-black relative flex items-center justify-center group overflow-hidden min-h-[300px] lg:min-h-0">
                  {selectedItem.youtubeId ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedItem.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                        title={selectedItem.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <>
                      <img src={selectedItem.thumbnail} className="w-full h-full object-cover opacity-20 scale-125 blur-3xl" alt="" />
                      <div className="absolute inset-x-0 top-0 p-12 flex justify-between items-start pointer-events-none">
                         <div className="space-y-4">
                            <div className="p-3 bg-brand text-white inline-block">
                               <Play size={32} className="fill-white" />
                            </div>
                            <h2 className="text-4xl lg:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.8]">
                               {selectedItem.title}
                            </h2>
                         </div>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-24 h-24 rounded-full border-2 border-brand/20 flex items-center justify-center mb-8 relative">
                           <div className="absolute inset-0 border-t-2 border-brand rounded-full animate-spin" />
                           <ShieldCheck className="text-brand" size={40} />
                        </div>
                        <div className="space-y-4 max-w-md">
                           <h4 className="text-xl font-display font-black uppercase text-white tracking-widest underline decoration-brand underline-offset-8">ENCRYPTION_LAYER_ENGAGED</h4>
                           <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] leading-relaxed">
                             PREVIEW_SESSION_LOCKED. FILE_REQUIRES_SECONDARY_DECRYPT_KEY_OR_DIRECT_NATIVE_ACCESS.
                           </p>
                        </div>
                      </div>
                    </>
                  )}
               </div>

               {/* Right Segment: Intel/Dossier */}
               <div className="lg:w-1/3 p-12 lg:p-20 flex flex-col h-full bg-zinc-950 border-l border-white/5">
                  <div className="flex-1 space-y-12">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black font-mono text-zinc-700 uppercase tracking-widest block mb-4 italic">INTEL_CATEGORY</label>
                        <span className="text-lg font-black text-brand uppercase italic tracking-widest drop-shadow-[0_0_10px_rgba(183,14,35,0.5)]">
                          {selectedItem.category}
                        </span>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black font-mono text-zinc-700 uppercase tracking-widest block underline decoration-zinc-800 underline-offset-4 decoration-2">EVIDENCE_DUMP</label>
                        <p className="text-lg text-zinc-400 font-light leading-snug italic">
                          {selectedItem.description || "Archive node tracking high-volatility shifts in country rap alliances. Subject matter exhibits coordinated interaction patterns with secondary entities."}
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block">INTEGRITY_INDEX</label>
                           <span className="text-xs font-black text-white italic">VERIFIED</span>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block">RECORD_DATE</label>
                           <span className="text-xs font-black text-white italic">{selectedItem.date}</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-12">
                     <button className="w-full py-6 bg-brand text-white text-[12px] font-black uppercase tracking-[0.3em] italic hover:bg-brand-dark transition-all flex items-center justify-center gap-4">
                        <Download size={18} /> DOWNLOAD_DATA_POD
                     </button>
                     <p className="text-[7px] text-zinc-700 font-mono text-center uppercase tracking-widest leading-none">
                       By accessing this pod you agree to the truth-preservation protocol.
                     </p>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
