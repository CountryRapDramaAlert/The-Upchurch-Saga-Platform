import React, { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Play, SkipForward, SkipBack, 
  ListMusic, Volume2, Share2, Info,
  AlertCircle, RefreshCw, Terminal, Shield,
  Database, Activity, Zap
} from 'lucide-react';

const MOKON_PLAYLIST = [
  { 
    id: 'bc6kpzzea5M', 
    title: 'Ryan Upchurch Diss 1', 
    type: 'Diss Track',
    description: 'A deep dive into the breakdown of the Hollar community and the beginning of the major rift with Upchurch. This track explores the initial cracks in the foundation of the crew.'
  },
  { 
    id: 'p5_HA1g6Y34', 
    title: 'Upchurch Diss 2', 
    type: 'Reaction / Diss',
    description: 'Analyzing the contradictions and public statements made by Ryan Upchurch regarding his business dealings and personal relationships within the music industry.'
  },
  { 
    id: 'SE5BIFik-M4', 
    title: 'Upchurch Diss 3', 
    type: 'Expose',
    description: 'Critical investigation into the operations of HHR (Hollar Hood Records) and its impact on independent artists trying to make it in the southern rap scene.'
  },
  { 
    id: 'eA2vsig_pxU', 
    title: 'Street Anthem', 
    type: 'Commentary',
    description: 'The first installment of a comprehensive series tracking the social media outbursts and public feuds that defined the early era of the conflict.'
  },
  { 
    id: 'p-CDJaXU_GI', 
    title: 'Cryan UpSkirts', 
    type: 'Analysis',
    description: 'Evaluating how the "outlaw" image is used as a marketing tool and the reality behind the persona cultivated by major figures in the scene.'
  },
  { 
    id: 'LfoSbn1qF7U', 
    title: 'Crackdown On CrackSquad', 
    type: 'Direct Diss',
    description: 'A direct lyrical and verbal response to the challenges issued by Ryan Upchurch in his recent live streams, setting the record straight from Mokon\'s perspective.'
  },
  { 
    id: '--Le2cNOCxo', 
    title: 'TweakerBoys (Parody) (feat. Dagburn Johnny Goble)', 
    type: 'Parody / Diss',
    description: 'A parity remix of the song "Hollerboys" by Ryan Upchurch.'
  },
  { 
    id: 'idLKBW4GSXI', 
    title: 'CreekSquad Diss', 
    type: 'Updates',
    description: 'Documentation of the secondary conflicts and "side beefs" that emerged among associates as the central drama between the main players escalated.'
  },
  { 
    id: 'b67L6nPc0u0', 
    title: 'Say My Name', 
    type: 'Response',
    description: 'Mokon addresses the specific points raised by other influential creators in the scene, consolidating the investigative narrative with new insights.'
  },
  { 
    id: '9rrhQ2JMGLE', 
    title: 'Call Me Crazy', 
    type: 'Evidence',
    description: 'A detailed breakdown of specific screenshots, recordings, and digital footprints shared by former associates to verify the claims being made.'
  },
  { 
    id: '_iOzB55xiFs', 
    title: 'Too Much Thought', 
    type: 'Summary',
    description: 'Wrapping up the extensive investigation with a summary of the collective evidence and an analysis of the current standing of the southern outlaw rap scene.'
  },
  { 
    id: 'XpDN4ZRctDM', 
    title: 'Did He Say That: The Robertson/Rodni Case Retrospective', 
    type: 'Analysis',
    description: 'A deep-dive analyzing the key statements and outrage-stream claims made regarding the Kiely Rodni search. Reconstructs how speculative public feeds laid the groundwork for the devastating defamation lawsuit.'
  },
  { 
    id: 'j2vouvpa9PI', 
    title: 'Behind the Scenes: cmdshft & Sonny Bama Royalty Conflict', 
    type: 'Expose',
    description: 'A crucial visual breakdown tracing the leaked deposition files and perjury scandals. Details the allegations of credit card fraud, Mastercard account maneuvers, and unauthorized transfer claims.'
  },
  { 
    id: 'y9ZThcahQCA', 
    title: 'Historic Verdict: Inside the $17.5M Defamation Judgment', 
    type: 'Legal & Court',
    description: 'Comprehensive legal and community commentary documenting the milestone civil jury decision in the Middle District of Tennessee, outlining how internet actors are legally held accountable for defamation and severe emotional distress.'
  },
  { 
    id: 'VAkHWmEhUr0', 
    title: 'Uncompromising Truth: The Mokon Pioneer Chronicle', 
    type: 'Commentary',
    description: 'Evaluating the long road of community accountability, comparing Mokon\'s early 2021 predictions with actual legal developments. Highlighting the heavy toll of resisting systematic online blackballing.'
  },
];

export default function MokonArchive() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const currentTrack = MOKON_PLAYLIST[currentIndex];

  const onEnd = () => {
    if (autoAdvance && currentIndex < MOKON_PLAYLIST.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      controls: 1,
    },
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row lg:overflow-hidden bg-black/20">
      {/* Playlist Sidebar: Global Intel Feed */}
      <aside className="w-full lg:w-96 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-10">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <ListMusic className="text-brand shrink-0" size={18} />
            <h1 className="text-xs font-black font-mono tracking-[0.3em] uppercase underline decoration-brand decoration-2 underline-offset-8">Archive_Feed</h1>
          </div>
          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest whitespace-nowrap">VOL_01.X</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          <div className="px-2 mb-6">
             <p className="text-[8px] font-mono text-brand uppercase tracking-[0.2em] mb-2 font-bold italic group flex items-center gap-2">
                <AlertCircle size={10} className="animate-pulse" /> PIONEER_STATUS_DETECTED
             </p>
             <p className="text-[9px] text-zinc-500 font-light leading-relaxed">
               Historical logs tracking MoKoN's initial 2021 resistance. Subject faced massive community blackballing and coordinated harassment for early accountability efforts.
             </p>
          </div>

          {MOKON_PLAYLIST.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-full group relative transition-all duration-300 ${currentIndex === idx ? 'scale-[1.02] translate-x-2' : 'opacity-40 hover:opacity-100 hover:translate-x-1'}`}
            >
              <div className={`p-4 border rounded-sm flex gap-4 items-center transition-all ${currentIndex === idx ? 'border-brand/40 bg-brand/5' : 'border-white/5 bg-white/5'}`}>
                <div className="relative shrink-0 w-20 aspect-video rounded-sm overflow-hidden bg-zinc-900">
                  <img src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`} className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all" />
                  {currentIndex === idx && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand/20">
                      <Play className="text-white fill-white animate-pulse" size={12} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-[7px] font-mono mb-1 ${currentIndex === idx ? 'text-brand' : 'text-zinc-600'}`}>0{idx + 1}_LOG_CHUNK</p>
                  <h4 className={`text-[10px] font-black uppercase truncate tracking-widest ${currentIndex === idx ? 'text-white' : 'text-zinc-400'}`}>{track.title}</h4>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 bg-black/40">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                <RefreshCw size={12} /> AUTOMATIC_FEED
              </span>
              <button 
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-10 h-5 rounded-sm relative transition-colors ${autoAdvance ? 'bg-brand' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white transition-all ${autoAdvance ? 'left-[22px]' : 'left-1'}`} />
              </button>
           </div>
           <p className="text-[7px] font-mono text-zinc-700 italic uppercase">"Silence is the only enemy of the truth."</p>
        </div>
      </aside>

      {/* Main Terminal Player */}
      <main className="flex-1 relative flex flex-col lg:overflow-hidden bg-black/60">
        {/* Background Ambient Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1)_0%,transparent_100%)]" />
           <div className="absolute inset-0 cinematic-grid opacity-20" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
          <div className="max-w-6xl mx-auto p-12 lg:p-24 space-y-16">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-brand text-white text-[9px] font-black uppercase tracking-[0.4em] italic shadow-[0_0_15px_rgba(255,0,0,0.3)]">INTEL_NODE_0{currentIndex + 1}</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:block select-all">FILE_{currentTrack.id}.RECORD</span>
                  </div>
                  <h2 className="text-5xl lg:text-[80px] font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-6">
                    {currentTrack.title}
                  </h2>
                  <div className="flex flex-wrap gap-6">
                    <p className="text-brand font-black font-mono text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
                      <Zap size={16} /> {currentTrack.type}
                    </p>
                    <p className="text-zinc-600 font-black font-mono text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
                      <Database size={16} /> TRUTH_INDEX: 98.2%
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button className="p-4 border border-white/5 bg-white/5 hover:border-brand/40 hover:bg-brand/10 transition-all text-zinc-400 hover:text-brand">
                    <Share2 size={20} />
                  </button>
                  <button className="p-4 border border-white/5 bg-white/5 hover:border-white/20 transition-all text-zinc-400 hover:text-white">
                    <Info size={20} />
                  </button>
                </div>
              </div>

              <div className="aspect-video w-full glass-panel border-white/5 bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden relative group">
                <YouTube 
                  key={currentTrack.id}
                  videoId={currentTrack.id} 
                  opts={opts} 
                  onEnd={onEnd}
                  onPlay={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8 space-y-12">
                <div className="relative">
                  <div className="absolute -left-8 top-0 bottom-0 w-1 bg-brand/30" />
                  <p className="text-xl lg:text-3xl text-zinc-400 leading-snug font-light italic tracking-tight px-4">
                    "{currentTrack.description}"
                  </p>
                </div>

                <div className="p-10 bg-white/5 border border-white/5 rounded-sm relative overflow-hidden backdrop-blur-sm">
                   <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Terminal size={80} className="text-brand" />
                   </div>
                   <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-6 flex items-center gap-3 underline decoration-brand/30 underline-offset-4">
                      <Shield size={16} /> ARCHIVIST_CONTEXT
                   </h4>
                   <div className="space-y-6 text-sm text-zinc-500 font-light leading-relaxed max-w-2xl">
                      <p>
                        This log represents a critical intersection in the 2021 transition period. MoKoN, acting as the pioneer of the accountability movement, provided verified digital footprints that community reactors attempted to suppress through coordinated mass-reporting and blackballing.
                      </p>
                      <div className="flex gap-10 pt-4 border-t border-white/5 font-mono text-[9px] uppercase tracking-widest">
                         <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand" /> ORIGIN_2021</span>
                         <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800" /> CATEGORY_ACCOUNTABILITY</span>
                         <span className="flex items-center gap-2 text-red-500"><AlertCircle size={10} /> HIGH_RESISTANCE_VALUE</span>
                      </div>
                   </div>
                </div>
              </div>

              <aside className="lg:col-span-4 space-y-10">
                <div className="glass-panel p-8 border-brand/10 bg-brand/5">
                   <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                      <Activity size={16} className="text-brand" /> NETWORK_METRICS
                   </h4>
                   <div className="space-y-8">
                      <div>
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Truth_Impact_Radius</span>
                            <span className="text-xs font-black text-white italic">9.4/10</span>
                         </div>
                         <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                            <motion.div className="h-full bg-brand" initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1 }} />
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Pioneer_Resistance</span>
                            <span className="text-xs font-black text-white italic">CRITICAL</span>
                         </div>
                         <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                            <motion.div className="h-full bg-red-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <button onClick={() => setCurrentIndex(prev => Math.min(MOKON_PLAYLIST.length - 1, prev + 1))} className="w-full p-6 bg-brand text-white font-black italic tracking-[0.4em] text-[11px] uppercase hover:bg-brand-dark transition-all flex items-center justify-center gap-4 group">
                    <SkipForward size={18} className="group-hover:translate-x-1 transition-transform" /> 
                    NEXT_CHRONICLE
                  </button>
                  <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} className="w-full p-6 bg-zinc-900 border border-white/5 text-zinc-500 font-black italic tracking-[0.4em] text-[11px] uppercase hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-4 group">
                    <SkipBack size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                    PREVIOUS_CHRONICLE
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Global Persistence Bar */}
        <div className="h-16 bg-black/95 border-t border-white/5 flex items-center justify-between px-10 relative z-20">
           <div className="flex items-center gap-8 font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
              <span className="flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> SYSTEM_UPTIME: 100%</span>
              <span className="flex items-center gap-2 lg:flex hidden"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800" /> Latency: 14ms</span>
              <span className="flex items-center gap-2 lg:flex hidden"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800" /> Buffer: 100%</span>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">MOKON_ARCHIVE.VOL_0{currentIndex + 1}</span>
              <button className="flex items-center gap-2 text-brand text-[9px] font-black uppercase tracking-widest group">
                 <Terminal size={14} className="group-hover:animate-pulse" /> SYNC_LOCAL_VAULT
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}
