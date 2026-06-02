import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, ListVideo, Terminal, Radio, ShieldCheck, Cpu, Wifi } from 'lucide-react';

interface PlaylistVideo {
  id: string;
  title: string;
  code: string;
  intelCode: string;
  duration: string;
  description: string;
  thumbnail: string;
}

const PLAYLIST_VIDEOS: PlaylistVideo[] = [
  {
    id: 'vid_1',
    title: 'THE FUTURE OF INVESTIGATIVE MEDIA | MoKoN Official Platform Anthem',
    code: 'mHMq61D9ryQ',
    intelCode: 'SIGNAL_COMMS_01A',
    duration: '11:42',
    description: 'This cinematic anthem introduces the vision and scope of MoKoN, detailing the future of citizen-driven independent research and investigative country rap media.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 'vid_2',
    title: 'The Evolution of Ryan Upchurch in 56 Seconds 😂🐍 (Cartoon Animation)',
    code: 'IHOAAV0Ut8g',
    intelCode: 'SIGNAL_COMMS_02B',
    duration: '14:15',
    description: 'An animated, humorous retrospective highlighting the shifting dynamics, viral moments, and creative milestones of Ryan Upchurch over the years.',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 'vid_3',
    title: 'Echoes In The Pines | Official Trailer (2026) | The Rise & Rift of Country Rap',
    code: 'dHcoXrXsUlI',
    intelCode: 'SIGNAL_COMMS_03C',
    duration: '09:58',
    description: 'The official teaser docu-trailer exploring the origins, rising prominence, and internal community conflicts defining the modern country-rap music genre.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 'vid_4',
    title: 'Sippin’ On The Inside (Cave Confessions) | Redneck Rave Parody Remix',
    code: 'rhBcOzTAMak',
    intelCode: 'SIGNAL_COMMS_04D',
    duration: '17:33',
    description: 'A satirical parody remix taking a look inside country music narratives, cave acoustics, and the entertaining subculture of redneck rave experiences.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop'
  }
];

export default function UplinkMediaPlayer() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [loopPlaylist, setLoopPlaylist] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: string }>>([
    { time: getTimestamp(), msg: 'TACTICAL_MEDIA_MODULE INITIALIZED Successfully', type: 'info' },
    { time: getTimestamp(), msg: 'INTELLIGENCE CHAIN LOADING: 4 SOURCE LINKS COUPLED', type: 'system' }
  ]);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const hasInteractedRef = useRef<boolean>(false);

  // Listen for first interaction to unmute and play
  useEffect(() => {
    let interacted = false;
    const handleInteraction = () => {
      hasInteractedRef.current = true;
      if (interacted) return;
      if (playerRef.current) {
        interacted = true;
        try {
          playerRef.current.unMute();
          playerRef.current.playVideo();
          addLog("INTERACTION DETECTED: DECRYPTING COMS AUDIO", "success");
        } catch (e) {
          console.warn("Failed to unmute on interaction:", e);
        }
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return cleanup;
  }, []);

  function getTimestamp() {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  }

  const addLog = (msg: string, type: 'info' | 'system' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [{ time: getTimestamp(), msg, type }, ...prev].slice(0, 40));
  };

  const currentVideo = PLAYLIST_VIDEOS[currentIdx];

  // Keep track of visited clips in the current state session
  useEffect(() => {
    if (currentVideo && !playedIds.includes(currentVideo.id)) {
      setPlayedIds(prev => [...prev, currentVideo.id]);
    }
  }, [currentIdx, currentVideo, playedIds]);

  const handleVideoSelect = (idx: number, manual: boolean = true) => {
    if (idx < 0 || idx >= PLAYLIST_VIDEOS.length) return;
    const targetVideo = PLAYLIST_VIDEOS[idx];
    setCurrentIdx(idx);
    setIsPlaying(true);
    
    if (manual) {
      addLog(`MANUAL ROUTE: CONNECTING COGNITIVE FEED [${targetVideo.intelCode}]`, 'info');
    } else {
      addLog(`AUTO SEQUENCE: BUFFERING CHANNEL [${targetVideo.intelCode}]`, 'system');
    }
  };

  // Video Ended callback - plays back to back in sequence
  const handleVideoEnd = () => {
    addLog(`COMPLETED BROADCAST SIGNAL: [${currentVideo.intelCode}]`, 'success');
    
    if (autoAdvance) {
      if (shuffleMode) {
        const nextRandom = Math.floor(Math.random() * PLAYLIST_VIDEOS.length);
        addLog(`SHUFFLED HOP: ALIGNING TRANSMISSION GRID`, 'info');
        handleVideoSelect(nextRandom, false);
      } else if (currentIdx < PLAYLIST_VIDEOS.length - 1) {
        addLog(`SEQUENCE STEP: COUPLING NEXT CARRIER LINK`, 'system');
        handleVideoSelect(currentIdx + 1, false);
      } else if (loopPlaylist) {
        addLog(`UPLINK RECONVERSION: LOOP TRACE ACTIVE (RESET TO CODESPACE 0)`, 'success');
        handleVideoSelect(0, false);
      } else {
        addLog(`SEQUENCE REEL TERMINATION ACHIEVED. UPLINK STANDBY.`, 'warn');
        setIsPlaying(false);
      }
    } else {
      addLog(`PLAYBACK STOP: AUTO ADVANCE DISABLE TRACE`, 'warn');
      setIsPlaying(false);
    }
  };

  // Controls
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentIdx < PLAYLIST_VIDEOS.length - 1) {
      addLog(`USER COMMAND: SKIP NEXT CHANNEL`, 'info');
      handleVideoSelect(currentIdx + 1, true);
    } else if (loopPlaylist) {
      addLog(`USER COMMAND: SKIP RESET LOOP`, 'info');
      handleVideoSelect(0, true);
    } else {
      addLog(`COMMAND REJECTED: TERMINAL VIDEO INDEX LIMIT REACHED`, 'warn');
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      addLog(`USER COMMAND: REVERT BACK CHANNEL`, 'info');
      handleVideoSelect(currentIdx - 1, true);
    } else {
      addLog(`COMMAND REJECTED: FIRST INDEX ENCOUNTERED`, 'warn');
    }
  };

  return (
    <div id="media-deck-root" className="w-full border border-white/10 rounded-sm bg-neutral-950/80 backdrop-blur-xl relative overflow-hidden text-left shadow-2xl p-4 md:p-6 space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 border border-brand/30 bg-brand/5 rounded-sm shrink-0">
            <Radio className="text-brand w-5 h-5 animate-pulse" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-mono leading-none bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] px-1 py-0.5 rounded-sm font-bold uppercase tracking-widest">
                INTELLIGENCE BROADCAST UPLINK
              </span>
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full animate-pulse" />
            </div>
            <h3 className="text-md font-black font-display text-white uppercase tracking-wider mt-1">
              Command Deck Playlist Console
            </h3>
          </div>
        </div>

        {/* Live telemetry indicators */}
        <div className="flex items-center gap-4 font-mono text-[8px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-1">
            <Cpu size={10} className="text-zinc-600" />
            <span>DECODER_M7: <span className="text-white">ONLINE</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi size={10} className="text-zinc-600" />
            <span>LATENCY: <span className="text-[#00ff66] animate-pulse">19ms</span></span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck size={10} className="text-zinc-600" />
            <span>INTEGRITY: <span className="text-white">99.8%</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: YouTube Player Frame (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="border border-white/10 bg-black/90 p-1.5 rounded-sm relative aspect-video group overflow-hidden shadow-inner">
            
            {/* Embedded Active Frame Metadata Overlay */}
            <div className="absolute top-4 left-4 z-40 bg-black/80 border border-white/10 rounded-sm py-0.5 px-2 flex items-center gap-1.5 font-mono text-[7px] font-bold uppercase tracking-widest text-[#00ff66] pointer-events-none">
              <div className="w-1 h-1 rounded-full bg-[#00ff66] animate-pulse" />
              <span>LIVE_CHANNEL: {currentVideo.intelCode}</span>
            </div>

            <div className="absolute top-4 right-4 z-40 bg-brand/95 border border-white/20 rounded-sm py-0.5 px-2 flex items-center gap-1 font-mono text-[7px] font-bold tracking-wider text-white pointer-events-none select-none">
              <span>{currentIdx + 1} / {PLAYLIST_VIDEOS.length}</span>
            </div>

            {/* YouTube Component */}
            <div className="w-full h-full relative z-10 select-none">
              <YouTube
                videoId={currentVideo.code}
                className="absolute inset-0 w-full h-full"
                iframeClassName="absolute inset-0 w-full h-full border-0"
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3
                  }
                }}
                onReady={(e: YouTubeEvent) => {
                  playerRef.current = e.target;
                  addLog(`DOCK ENGAGEMENT: LINKED YOUTUBE DECODER [${currentVideo.code}]`, 'success');
                  try {
                    if (hasInteractedRef.current) {
                      e.target.unMute();
                      addLog(`POST-INTERACTION: Broadcaster audio unmuted`, 'success');
                    } else {
                      e.target.mute();
                    }
                    e.target.playVideo();
                  } catch (err) {
                    console.log("Auto-start play invocation failed:", err);
                  }
                }}
                onStateChange={(e: YouTubeEvent) => {
                  // State 1: Playing, 2: Paused, 0: Ended, -1: Unstarted, 3: Buffering
                  if (e.data === 1) {
                    setIsPlaying(true);
                    addLog(`STREAM PLAYBACK ACTIVE: DECIBEL PRESSURE STEADY`, 'success');
                  } else if (e.data === 2) {
                    setIsPlaying(false);
                    addLog(`STREAM SUSPENDED: STANDBY CAPTURE BUFFER`, 'warn');
                  } else if (e.data === 3) {
                    addLog(`STREAM BUFFERING: COMM COUPLING RESOLUTION...`, 'info');
                  }
                }}
                onEnd={handleVideoEnd}
                onError={() => {
                  addLog(`CRITICAL PIPELINE EXCEPTION: CODESPACE ENCOUNTERED CORRUPTION`, 'warn');
                }}
              />
            </div>
          </div>

          {/* Player controls */}
          <div className="border border-white/5 bg-zinc-950/60 p-3 rounded-sm flex items-center justify-between gap-3 font-mono text-[9px]">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev}
                className="w-7 h-7 border border-white/5 hover:border-brand/40 bg-white/5 hover:bg-brand/10 rounded-sm flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Previous Video"
              >
                <SkipBack size={12} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="px-4 h-7 border border-brand bg-brand/10 hover:bg-brand/20 rounded-sm flex items-center justify-center text-white hover:text-brand font-bold tracking-widest gap-1.5 transition-all text-[8px] cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                <span>{isPlaying ? 'SUSPEND' : 'ENGAGE'}</span>
              </button>

              <button 
                onClick={handleNext}
                className="w-7 h-7 border border-white/5 hover:border-brand/40 bg-white/5 hover:bg-brand/10 rounded-sm flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Next Video"
              >
                <SkipForward size={12} />
              </button>
            </div>

            {/* Config options */}
            <div className="flex items-center gap-3">
              {/* Auto Advance Toggle */}
              <button 
                onClick={() => {
                  setAutoAdvance(!autoAdvance);
                  addLog(`CONFIG OVERRIDE: AUTO_PLAYBACK_ADVANCE TO ${!autoAdvance ? 'TRUE' : 'FALSE'}`, 'system');
                }}
                className={`py-1 px-2.5 border rounded-sm flex items-center gap-1.5 transition-all cursor-pointer uppercase text-[8px] ${autoAdvance ? 'border-[#00ff66]/40 bg-[#00ff66]/5 text-[#00ff66]' : 'border-zinc-800 bg-transparent text-zinc-500'}`}
              >
                <div className={`w-1 h-1 rounded-full ${autoAdvance ? 'bg-[#00ff66]' : 'bg-zinc-600'} animate-pulse`} />
                <span>AUTO NEXT</span>
              </button>

              {/* Loop entire playlist toggle */}
              <button 
                onClick={() => {
                  setLoopPlaylist(!loopPlaylist);
                  addLog(`CONFIG OVERRIDE: CHAIN_PLAYLIST_LOOP TO ${!loopPlaylist ? 'ACTIVE' : 'INACTIVE'}`, 'system');
                }}
                className={`py-1 px-2.5 border rounded-sm flex items-center gap-1.5 transition-all cursor-pointer uppercase text-[8px] ${loopPlaylist ? 'border-brand bg-brand/10 text-brand' : 'border-zinc-800 bg-transparent text-zinc-500'}`}
              >
                <RotateCcw size={9} className={loopPlaylist ? 'animate-spin' : ''} />
                <span>CHAIN LOOP</span>
              </button>

              {/* Shuffle Mode toggle */}
              <button 
                onClick={() => {
                  setShuffleMode(!shuffleMode);
                  addLog(`CONFIG OVERRIDE: SEED_SHUFFLED_TARGET TO ${!shuffleMode ? 'ON' : 'OFF'}`, 'system');
                }}
                className={`py-1 px-2.5 border rounded-sm flex items-center gap-1.5 transition-all cursor-pointer uppercase text-[8px] ${shuffleMode ? 'border-purple-500/40 bg-purple-500/5 text-purple-400' : 'border-zinc-800 bg-transparent text-zinc-500'}`}
              >
                <Shuffle size={9} />
                <span>RANDOM SEED</span>
              </button>
            </div>
          </div>

          {/* Description HUD */}
          <div className="border border-white/5 bg-zinc-950/40 p-4 rounded-sm space-y-2 select-none">
            <div className="flex justify-between items-center text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-1.5">
              <span>BROADCAST DISPATCH DATA</span>
              <span className="text-brand">REFCODE: {currentVideo.intelCode}</span>
            </div>
            <h4 className="text-white text-xs font-bold leading-tight uppercase font-mono tracking-tight">
              {currentVideo.title}
            </h4>
            <p className="text-[10px] text-zinc-400 font-light leading-relaxed font-sans">
              {currentVideo.description}
            </p>
          </div>
        </div>

        {/* Right Side: Playlist and Interactive Feed Logs (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Playlist Panel */}
          <div className="border border-white/10 bg-zinc-950/85 p-4 rounded-sm flex flex-col space-y-3 flex-1 min-h-[220px]">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
              <ListVideo size={13} className="text-brand" />
              <span>Intel Playback Sequence</span>
              <span className="ml-auto text-[8px] text-zinc-500 lowercase font-light">4 clips loaded</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 no-scrollbar">
              {PLAYLIST_VIDEOS.map((video, idx) => {
                const isActive = idx === currentIdx;
                const isPlayed = playedIds.includes(video.id);
                return (
                  <motion.div
                    key={video.id}
                    onClick={() => handleVideoSelect(idx, true)}
                    whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className={`p-2.5 border rounded-sm flex gap-3 items-center group cursor-pointer transition-all ${
                      isActive 
                        ? 'border-brand bg-brand/5 shadow-[0_0_12px_rgba(239,68,68,0.05)]' 
                        : 'border-white/5 bg-white/2 hover:border-white/10'
                    }`}
                  >
                    {/* Tiny representation image */}
                    <div className="relative w-12 aspect-video shrink-0 bg-neutral-900 border border-white/5 rounded-[1px] overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[6px] font-mono text-right px-0.5 text-zinc-400">
                        {video.duration}
                      </div>
                      
                      {isActive && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play size={10} className="text-brand animate-ping" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex justify-between items-center text-[7px] font-mono leading-none">
                        <span className={`${isActive ? 'text-brand font-bold' : 'text-zinc-500'}`}>
                          {video.intelCode}
                        </span>
                        
                        <div className="flex items-center gap-1.5 uppercase font-mono tracking-widest">
                          {isActive ? (
                            <span className="text-[#00ff66] animate-pulse font-bold text-[6px]">PLAYING</span>
                          ) : isPlayed ? (
                            <span className="text-zinc-600 text-[6px]">COMPLETED</span>
                          ) : (
                            <span className="text-zinc-600 text-[6px]">QUEUED</span>
                          )}
                        </div>
                      </div>

                      <h5 className={`text-[10px] font-bold uppercase truncate tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                        {video.title}
                      </h5>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Control Terminal / Uplink Feed logs */}
          <div className="border border-white/5 bg-black/90 p-4 rounded-sm flex flex-col space-y-2.5 h-[155px] font-mono">
            <div className="flex items-center gap-2 text-[8px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-1.5">
              <Terminal size={11} className="text-[#00ff66]" />
              <span>Reactive Uplink Transceiver Log</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto text-[8px] space-y-1.5 no-scrollbar pr-1 select-none">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    key={log.time + i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2 items-start opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-zinc-700 font-bold shrink-0">[{log.time}]</span>
                    <span className={`leading-snug ${
                      log.type === 'success' ? 'text-[#00ff66]' : 
                      log.type === 'warn' ? 'text-brand' : 
                      log.type === 'system' ? 'text-purple-400' : 'text-zinc-400'
                    }`}>
                      {log.msg}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
