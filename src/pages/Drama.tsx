import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, ChevronRight, Play, MessageSquare, 
  History, User, X, Info, ShieldAlert, Scale, ExternalLink,
  Mic2, Music, Users, Camera, AlertTriangle, FileText,
  Database, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DramaConflict {
  id: string;
  name: string;
  tag: string;
  status: 'Ongoing' | 'Settled' | 'Cold' | 'Viral';
  era: string;
  image: string;
  description: string;
  participants: string[];
  evidenceLevel: 'High' | 'Critical' | 'Medium';
  timeline?: { date: string; event: string }[];
}

const conflicts: DramaConflict[] = [
  {
    id: 'rodni-lawsuit',
    name: 'Kiely Rodni Lawsuit',
    tag: 'LEGAL BATTLE',
    status: 'Settled',
    era: '2022–2026',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop',
    description: 'A comprehensive tracking of the defamation and libel lawsuit following the disappearance of Kiely Rodni. Stemming from comments claiming the tragical event was a fabricated GoFundMe fundraising scam, a federal jury in Tennessee found Upchurch liable for defamation and intentional infliction of emotional distress in May 2026, ordering a historic $17.5 million judgment ($6.5 million to father Daniel Rodni, and $11 million to grandfather David Robertson).',
    participants: ['Ryan Upchurch', 'Daniel Rodni', 'David Robertson'],
    evidenceLevel: 'Critical',
    timeline: [
      { date: '2022', event: 'Kiely Rodni Disappearance & speculatory stream commentary' },
      { date: '2023', event: 'Daniel Rodni & David Robertson file federal defamation case' },
      { date: '2024', event: 'Discovery phase, deposition orders, and protective motions' },
      { date: '2025', event: 'Federal judge overrules motion to dismiss the lawsuit' },
      { date: 'May 2026', event: 'Federal Middle District TN jury returns massive $17.5 million verdict' }
    ]
  },
  {
    id: 'calhoun-beef',
    name: 'Calhoun Diss Era',
    tag: 'DISS TRACK ERA',
    status: 'Cold',
    era: '2024–2025',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2670&auto=format&fit=crop',
    description: 'The breakdown of the Upchurch/Calhoun alliance. In early 2025, Upchurch reignited his long-standing, volatile rivalry with country-rapper Adam Calhoun, resulting in a series of direct diss tracks including "DOOIN MORE RAPPIN".',
    participants: ['Ryan Upchurch', 'Adam Calhoun'],
    evidenceLevel: 'High',
    timeline: [
      { date: 'Jan 2025', event: 'Calhoun releases "Tweaker" (Subliminal)' },
      { date: 'Jan 2025', event: 'Calhoun releases "Church\'s Coffin" (Direct Diss)' },
      { date: 'Jan 2025', event: 'Upchurch fires back with direct diss tracks including "DOOIN MORE RAPPIN"' },
      { date: 'Feb 2025', event: 'Calhoun ends the active rap battle' },
      { date: 'Feb 2025', event: 'Justin Time states the feud was reminiscent of "Pro Wrestling"' }
    ]
  },
  {
    id: 'justin-time-beef',
    name: 'Justin Time & The "Pro Wrestling" Meta',
    tag: 'BEEF META',
    status: 'Settled',
    era: '2025',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
    description: 'The "Country Rap Civil War" involving WhoTFisJustinTime. Concluded with a statement claiming the drama was designed for entertainment, similar to professional wrestling.',
    participants: ['Ryan Upchurch', 'WhoTFisJustinTime', 'Church Gang'],
    evidenceLevel: 'High',
    timeline: [
      { date: 'Jan 2025', event: 'Justin Time releases "The Roast of Ryan Upchurch"' },
      { date: 'Feb 2025', event: 'Justin Time issues "Pro Wrestling" explanation' }
    ]
  },
  {
    id: 'katie-noel-fallout',
    name: 'Katie Noel Professional Split',
    tag: 'LEGAL DISSOLUTION',
    status: 'Settled',
    era: '2019–2022',
    image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2670&auto=format&fit=crop',
    description: 'The rise and fall of the professional relationship between Upchurch and Katie Noel. Involved heavy early collaboration followed by a dramatic public fallout and legal restructuring.',
    participants: ['Ryan Upchurch', 'Katie Noel'],
    evidenceLevel: 'High'
  },
  {
    id: 'outlaw-backlash',
    name: 'Luke Combs Flag Controversy',
    tag: 'CULTURE DEBATE',
    status: 'Settled',
    era: '2021',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2670&auto=format&fit=crop',
    description: 'Upchurch faced severe internet backlash and sparked ongoing community drama after actively utilizing Confederate flag imagery in his music video for "Outlaw". Country star Luke Combs issued a public apology for past use of the flag. Upchurch fiercely criticized Combs, labeling him a "sellout," and staunchly defended his own branding.',
    participants: ['Ryan Upchurch', 'Luke Combs', 'Mainstream Media'],
    evidenceLevel: 'Medium',
    timeline: [
      { date: 'Feb 2021', event: 'Luke Combs issues public apology for past Confederate flag use' },
      { date: 'Feb 2021', event: 'Upchurch criticizes Luke Combs, branding him a "sellout"' },
      { date: 'Feb 2021', event: 'Upchurch releases "Outlaw" music video featuring Confederate imagery' }
    ]
  },
  {
    id: 'peer-fallout',
    name: 'Online Beefs & Diss Tracks',
    tag: 'PUBLIC FEUDS',
    status: 'Viral',
    era: '2019–2026',
    image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop',
    description: 'Ongoing online feuds, social roasts, and diss tracks with creators, commentators, and mainstream figures. Explores the 2021-2024 Mokon Commentary dispute, Johnny Gobble GobbStoppa feud, REAPER7MAN Spotify diss, and the 2026 fallout with Jelly Roll and Bunnie Xo.',
    participants: ['Ryan Upchurch', 'Mokon', 'Johnny Gobble', 'REAPER7MAN', 'Jelly Roll', 'Bunnie Xo'],
    evidenceLevel: 'High',
    timeline: [
      { date: '2021', event: 'Mokon faces social media retaliation for calling out Upchurch contradictions' },
      { date: '2021', event: 'Underground artist REAPER7MAN releases "FUCK CREEK SQUAD" diss on Spotify' },
      { date: '2022', event: 'Johnny Gobble feud sparks; Upchurch drops "Big LiL GobbStoppa" track' },
      { date: '2023', event: 'Upchurch TikTok offer to fund Cumberland Heights rehab for Johnny Gobble' },
      { date: '2026', event: 'Upchurch drops "Been Behind" diss track targeting Jelly Roll & Bunnie Xo' }
    ]
  },
  {
    id: 'retirement-claims',
    name: 'Tour & Retirement Cycles',
    tag: 'INDUSTRY DISPUTE',
    status: 'Viral',
    era: '2025',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2670&auto=format&fit=crop',
    description: 'Documentation of tour cancellations, repeated retirement announcements, and allegations regarding music industry contracts and management.',
    participants: ['Ryan Upchurch', 'Management', 'Promoters'],
    evidenceLevel: 'High'
  },
  {
    id: 'management-disputes',
    name: 'Internal Business & Management Split',
    tag: 'FRAUD ALLEGATIONS',
    status: 'Ongoing',
    era: '2026',
    image: 'https://images.unsplash.com/photo-1554224155-16974a4ea2c5?q=80&w=2670&auto=format&fit=crop',
    description: 'In January 2026, Upchurch completely severed ties with his administrative and distribution teams in a series of explosive Instagram videos. He accused distributors cmdshft and Sonny Bama of perjury, fraud, and evidence tampering, alleging they opened fraudulent credit cards under his name and mishandled his intellectual property.',
    participants: ['Ryan Upchurch', 'cmdshft distribution', 'Sonny Bama'],
    evidenceLevel: 'Critical',
    timeline: [
      { date: 'Jan 2026', event: 'Shattered ties with cmdshft and Sonny Bama via intense Instagram reels' },
      { date: 'Feb 2026', event: 'Federal copyright royalty case depositions leaked online' },
      { date: 'Mar 2026', event: 'Distributor cmdshft files emergency motion for federal sanctions' }
    ]
  }
];

export default function Drama() {
  const [selectedConflict, setSelectedConflict] = useState<DramaConflict | null>(null);

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden bg-black/40">
      {/* Dossier Terminal Sidebar */}
      <aside className="w-full lg:w-96 border-r border-white/5 bg-black/60 backdrop-blur-3xl flex flex-col shrink-0 z-20 overflow-y-auto no-scrollbar">
        <div className="p-10 space-y-12">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-6">
              BEEFS & <span className="text-brand">DRAMA</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] leading-relaxed">
              DOCUMENTING_ALLIANCES_&_FALLOUT_PROTOCOL_V4.2.0
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-brand">
              <ShieldAlert size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Active_Intel_Scanner</span>
            </div>
            
            <div className="space-y-3">
              {conflicts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConflict(c)}
                  className={`w-full text-left p-4 border transition-all relative group overflow-hidden ${selectedConflict?.id === c.id ? 'bg-brand/10 border-brand/40 shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[7px] font-black font-mono uppercase tracking-widest ${selectedConflict?.id === c.id ? 'text-brand' : 'text-zinc-600'}`}>ID:{c.id}</span>
                    <span className={`px-2 py-0.5 text-[6px] font-black uppercase tracking-widest rounded-sm ${c.status === 'Ongoing' ? 'bg-brand text-white animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className={`text-[11px] font-black uppercase italic tracking-widest leading-tight ${selectedConflict?.id === c.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {c.name}
                  </h4>
                  {selectedConflict?.id === c.id && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-brand"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Analysis Theater */}
      <main className="flex-1 relative lg:overflow-hidden flex flex-col">
        {/* Background Ambient Component */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_100%)]" />
           <div className="absolute inset-0 cinematic-grid opacity-10" />
        </div>

        <AnimatePresence mode="wait">
          {selectedConflict ? (
            <motion.div
              key={selectedConflict.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col z-10"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-12 lg:p-24">
                <div className="max-w-6xl mx-auto space-y-16">
                   {/* Header Segment */}
                   <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                      <div className="space-y-8">
                         <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-brand text-white text-[10px] font-black uppercase tracking-[0.4em] italic shadow-[0_0_20px_rgba(255,0,0,0.3)]">{selectedConflict.tag}</span>
                            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">ERA_WINDOW: {selectedConflict.era}</span>
                         </div>
                         <h2 className="text-5xl lg:text-[100px] font-display font-black tracking-tighter uppercase italic leading-[0.8]">
                           {selectedConflict.name}
                         </h2>
                         <div className="flex gap-8">
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Evidence_Classification</p>
                               <p className="text-xs font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                  <Database size={14} className="text-brand" /> {selectedConflict.evidenceLevel}
                               </p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Subject_Count</p>
                               <p className="text-xs font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                  <Users size={14} className="text-brand" /> {selectedConflict.participants.length} ASSETS
                               </p>
                            </div>
                         </div>
                      </div>
                      <div className="aspect-video lg:aspect-[4/3] bg-zinc-900 border border-white/5 relative group overflow-hidden">
                         <img 
                           src={selectedConflict.image} 
                           className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 scale-110 group-hover:scale-100" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                         <div className="absolute bottom-6 left-6 flex -space-x-3">
                            {selectedConflict.participants.map((_, i) => (
                              <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-zinc-950 flex items-center justify-center">
                                 <User size={20} className="text-zinc-700" />
                              </div>
                            ))}
                         </div>
                      </div>
                   </header>

                   {/* Analysis Section */}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                      <div className="lg:col-span-7 space-y-12">
                         <div className="relative">
                            <div className="absolute -left-10 top-0 bottom-0 w-1.5 bg-brand/40" />
                            <p className="text-2xl lg:text-4xl text-zinc-400 font-light leading-snug italic tracking-tight px-4">
                               "{selectedConflict.description}"
                            </p>
                         </div>

                         <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand flex items-center gap-4 underline decoration-brand/30 underline-offset-8">
                               <History size={18} /> Conflict_Reconstruction
                            </h3>
                            <div className="space-y-12 border-l border-white/5 pl-8 ml-2">
                               {selectedConflict.timeline?.map((event, i) => (
                                 <div key={i} className="relative">
                                    <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-black border-2 border-brand rounded-full z-10" />
                                    <span className="text-[10px] font-black text-brand font-mono uppercase tracking-[0.3em] mb-2 block">{event.date}</span>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">{event.event}</h4>
                                    <p className="text-xs text-zinc-500 font-light leading-relaxed max-w-lg uppercase tracking-wider">
                                       Verified timeline event substantiating the strategic alignment shift within the broader 2025 fracture narrative.
                                    </p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <aside className="lg:col-span-5 space-y-10">
                         <div className="glass-panel p-8 border-white/10 bg-white/5 space-y-8">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                               <Scale size={18} className="text-brand" /> LEGAL_RISK_ASSESSMENT
                            </h4>
                            <div className="space-y-6">
                               <div className="p-6 bg-black/40 border border-white/5">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Subject_Exposure</p>
                                  <p className="text-lg font-black text-white italic uppercase tracking-tighter">HIGH_VOLATILITY</p>
                               </div>
                               <div className="p-6 bg-black/40 border border-white/5">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Metadata_Density</p>
                                  <p className="text-lg font-black text-white italic uppercase tracking-tighter">CRITICAL_MAX</p>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <Link to="/media-vault" className="w-full p-8 bg-brand text-white font-black italic tracking-[0.5em] text-xs uppercase hover:bg-brand-dark transition-all flex items-center justify-center gap-4 group shadow-[0_0_30px_rgba(183,14,35,0.2)]">
                               <Camera size={20} className="group-hover:scale-125 transition-transform" /> 
                               ACCESS_EVIDENCE_VAULT
                            </Link>
                            <button className="w-full p-8 bg-zinc-900 border border-white/5 text-zinc-500 font-black italic tracking-[0.5em] text-xs uppercase hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-4 group">
                               <Share2 size={20} className="group-hover:rotate-12 transition-transform" /> 
                               SHARE_DOSSIER_ID
                            </button>
                         </div>
                      </aside>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
               <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/5 flex items-center justify-center text-zinc-800 animate-pulse">
                  <ShieldAlert size={60} />
               </div>
               <div className="space-y-4">
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-zinc-500">Awaiting Dossier Selection</h2>
                  <p className="text-xs font-mono text-zinc-700 uppercase tracking-[0.3em] max-w-sm">
                    Select a drama arc node from the lateral terminal to initialize deep tactical analysis.
                  </p>
               </div>
            </div>
          )}
        </AnimatePresence>

        {/* Tactical Footer HUD */}
        <div className="h-16 bg-black border-t border-white/10 flex items-center justify-between px-10 relative z-20">
           <div className="flex items-center gap-10 font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
              <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> NETWORK_TRAFFIC: STABLE</span>
              <span className="flex items-center gap-3 lg:flex hidden"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800" /> SYSTEM_LATENCY: 12ms</span>
              <span className="flex items-center gap-3 lg:flex hidden"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800" /> ACTIVE_SESSIONS: 4</span>
           </div>
           <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic font-mono hidden md:block">
             "Trust the evidence, not the narrative."
           </p>
        </div>
      </main>
    </div>
  );
}
