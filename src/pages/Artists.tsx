import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Award, CheckCircle2, Globe, Music, 
  Tv, Compass, HelpCircle, ChevronRight, MapPin, Sparkles, 
  Plus, Check, X, Users, MessageSquare, AlertCircle, Bookmark, Heart
} from 'lucide-react';
import { useFirestoreCollection, addLocalFallbackItem, getInitialLocalData } from '../hooks/useFirestore';
import { useAuthStore } from '../store/useAuthStore';
import { Artist, ArtistUpdate } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const GENRES = [
  'All Genres',
  'Country Rap',
  'Hick Hop',
  'Southern Woodgrit',
  'Outlaw Grit',
  'Dirt-Road Soul',
  'Tennessee Backend'
];

export default function Artists() {
  const { user, profile } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [followedIds, setFollowedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('crc_followed_artists');
    return saved ? JSON.parse(saved) : [];
  });

  // State for metrics toggling locally
  const [artistViews, setArtistViews] = useState<Record<string, number>>({});
  const [artistClicks, setArtistClicks] = useState<Record<string, number>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    genres: [] as string[],
    bio: '',
    shortBio: '',
    location: '',
    profilePicture: '',
    email: '',
    spotify: '',
    youtube: '',
    instagram: '',
    songTitle: '',
    songUrl: '',
    videoTitle: '',
    videoUrl: ''
  });
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Firestore Queries with offline failsafes
  const { data: rawArtists, loading: artistLoading } = useFirestoreCollection<Artist>('artists');
  const { data: updates, loading: updatesLoading } = useFirestoreCollection<ArtistUpdate>('artist_updates');

  // Filter and prioritize
  const artistsList = (rawArtists || []).filter(a => {
    const matchesPath = a.status === 'approved';
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.bio && a.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = selectedGenre === 'All Genres' || a.genres.includes(selectedGenre);
    return matchesPath && matchesSearch && matchesGenre;
  });

  const featuredArtists = artistsList.filter(a => a.verificationStatus === 'verified');
  const commonArtists = artistsList.filter(a => a.verificationStatus !== 'verified');

  // Load local views and clicks fallback counter
  useEffect(() => {
    const localViews = localStorage.getItem('crc_artist_views_clicks');
    if (localViews) {
      try {
        const parsed = JSON.parse(localViews);
        setArtistViews(parsed.views || {});
        setArtistClicks(parsed.clicks || {});
      } catch (e) {}
    }
  }, []);

  const saveMetrics = (newViews: Record<string, number>, newClicks: Record<string, number>) => {
    localStorage.setItem('crc_artist_views_clicks', JSON.stringify({ views: newViews, clicks: newClicks }));
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    // Track local page views
    const nextViews = { ...artistViews, [artist.id]: (artistViews[artist.id] || 0) + 1 };
    setArtistViews(nextViews);
    saveMetrics(nextViews, artistClicks);
  };

  const handleExternalClick = (artistId: string, platform: string) => {
    const nextClicks = { ...artistClicks, [artistId]: (artistClicks[artistId] || 0) + 1 };
    setArtistClicks(nextClicks);
    saveMetrics(artistViews, nextClicks);
  };

  const toggleFollow = (artistId: string) => {
    let next: string[];
    if (followedIds.includes(artistId)) {
      next = followedIds.filter(id => id !== artistId);
    } else {
      next = [...followedIds, artistId];
    }
    setFollowedIds(next);
    localStorage.setItem('crc_followed_artists', JSON.stringify(next));

    // If modal is open, trigger UI metrics change
    if (selectedArtist && selectedArtist.id === artistId) {
      const currentFollowers = selectedArtist.metrics?.followerCount || 0;
      setSelectedArtist({
        ...selectedArtist,
        metrics: {
          ...selectedArtist.metrics,
          followerCount: followedIds.includes(artistId) ? Math.max(0, currentFollowers - 1) : currentFollowers + 1
        }
      });
    }
  };

  const handleGenreCheckboxChange = (genre: string) => {
    setFormData(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setFormMsg({ type: 'error', text: 'ARTIST DISPLAY NAME IS REQUIRED.' });
    if (!formData.email.trim()) return setFormMsg({ type: 'error', text: 'CONTACT EMAIL IS REQUIRED.' });
    if (formData.genres.length === 0) return setFormMsg({ type: 'error', text: 'CHOOSE AT LEAST ONE COMPATIBLE GENRE.' });

    setFormSubmitting(true);
    setFormMsg(null);

    const submissionId = `art-${Math.random().toString(36).substring(2, 11)}`;
    const newDocPayload = {
      id: submissionId,
      name: formData.name,
      genres: formData.genres,
      bio: formData.bio || "No complete bio has been provided by the artist's representatives yet.",
      shortBio: formData.shortBio || `${formData.name} is an active voice carving frontiers in rural underground soundscapes.`,
      location: formData.location || 'Southern US Node',
      profilePicture: formData.profilePicture || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=60',
      email: formData.email,
      status: 'pending' as const,
      verificationStatus: 'unverified' as const,
      links: {
        spotify: formData.spotify || '',
        youtube: formData.youtube || '',
        instagram: formData.instagram || ''
      },
      featuredSong: formData.songTitle ? {
        title: formData.songTitle,
        link: formData.songUrl || ''
      } : undefined,
      featuredVideo: formData.videoTitle ? {
        title: formData.videoTitle,
        link: formData.videoUrl || ''
      } : undefined,
      metrics: {
        views: 1,
        clicks: 0,
        followerCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Cache locally in localStorage database immediately (offline support)
    addLocalFallbackItem('artists', newDocPayload);

    try {
      // Direct post to database server
      await addDoc(collection(db, 'artists'), newDocPayload);
      setFormMsg({ 
        type: 'success', 
        text: 'APPLICATION DEPOSITED SECURELY! Administrative reviewers will verify your off-site properties inside OMNIPOTENCE_CONSOLE shortly.' 
      });
      // Clear form except contact details
      setFormData(prev => ({
        ...prev,
        name: '',
        genres: [],
        bio: '',
        shortBio: '',
        location: '',
        profilePicture: '',
        spotify: '',
        youtube: '',
        instagram: '',
        songTitle: '',
        songUrl: '',
        videoTitle: '',
        videoUrl: ''
      }));
    } catch (err: any) {
      console.warn("Could not synchronize with Firestore directly (sandbox limit/offline). Submission has been securely indexed in local cache.", err);
      setFormMsg({ 
        type: 'success', 
        text: 'APPLICATION DEPOSITED LOCALLY! Online directory status queued on your client fallback cache.' 
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-300 pb-20">
      
      {/* Immersive Header Backdrop */}
      <div className="relative border-b border-white/5 bg-black/60 pt-16 pb-12 px-6 lg:px-12">
        <div className="absolute inset-0 cinematic-banner opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] tracking-[0.4em] font-mono text-zinc-500 uppercase leading-none">INDEPENDENT_UPLINK</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
              ARTIST_DISCOVERY_HUB
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 font-mono leading-relaxed uppercase">
              The centralized network blueprint linking audiences directly to official independent artists, social media clusters, and underground Hick-Hop releases.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-6 py-3.5 bg-brand hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest font-mono flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            >
              <Plus size={14} /> Submit Your Artist Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Work Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Left column: Controls, Filters & Recent Network Activity Feed */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Quick Search */}
          <div className="bg-black/40 border border-white/5 p-5 space-y-3">
            <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">FILTER_DATABASE</h3>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="PROBE NAME OR REGION..."
                className="w-full bg-black/60 border border-white/10 p-3 pr-10 text-[10px] font-mono text-white outline-none focus:border-brand/50 uppercase"
              />
              <Search className="absolute right-3 top-3 text-zinc-600" size={14} />
            </div>
          </div>

          {/* Genre Quick Filters */}
          <div className="bg-black/40 border border-white/5 p-5 space-y-3">
            <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">SONIC_ATMOSPHERES</h3>
            <div className="flex flex-col gap-1.5">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`text-left px-3 py-2 text-[10px] font-mono border uppercase transition-all flex items-center justify-between ${
                    selectedGenre === genre
                      ? 'bg-brand/10 border-brand text-brand italic font-extrabold'
                      : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                  }`}
                >
                  <span>{genre}</span>
                  {selectedGenre === genre && <ChevronRight size={10} />}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Network Activity Stream */}
          <div className="bg-black/40 border border-white/5 p-5 space-y-4">
             <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <Compass size={12} className="text-brand animate-spin" /> NETWORK_TIMESTAMPS
             </h3>
             <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
               {(updates || []).slice(0, 8).map((act) => (
                 <div key={act.id} className="border-l-2 border-brand/20 pl-3.5 space-y-1.5 py-0.5">
                   <div className="flex items-center gap-2">
                     <span className="text-[8px] font-mono text-zinc-500">{new Date(act.createdAt).toLocaleDateString()}</span>
                     <span className="text-[7px] font-mono text-zinc-600">ID: {act.artistId?.split('-')[0] || 'sys'}</span>
                   </div>
                   <p className="text-[10px] text-zinc-300 uppercase leading-relaxed font-mono">
                     <strong className="text-white italic">{act.artistName}</strong>: {act.description}
                   </p>
                 </div>
               ))}
               {(updates || []).length === 0 && (
                 <div className="text-[8px] font-mono text-zinc-600 uppercase italic">
                   Standing telemetry stream quiet. Verification notifications will spool here.
                 </div>
               )}
             </div>
          </div>

        </div>

        {/* Right column: Primary Artist Gallery showcases */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* SECURE USER SUBMISSIONS QUEUE STATE NOTIFICATIONS (For user feedback) */}
          {localStorage.getItem('firestore_fallback_artists') && (
            (() => {
              const pendingArtists = getInitialLocalData('artists').filter(a => a.status === 'pending');
              if (pendingArtists.length > 0) {
                return (
                  <div className="bg-yellow-950/20 border border-yellow-500/20 p-4 flex gap-4 items-start rounded-sm">
                    <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                    <div className="font-mono text-[9px] uppercase leading-relaxed text-zinc-300">
                      <span className="text-yellow-500 font-extrabold block mb-1">PROGRESSED UPLINKS RETRIEVED</span>
                      You have {pendingArtists.length} profile submission(s) pending administrative authentication. You can preview details inside the console or wait for verification logs.
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* High Impact Verified Artists */}
          {featuredArtists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                <Award size={18} className="text-brand" /> VERIFIED_SAGA_RESIDENTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArtists.map((artist) => (
                  <div 
                    key={artist.id}
                    onClick={() => handleSelectArtist(artist)}
                    className="group bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/5 hover:border-brand/35 transition-all p-5 flex flex-col justify-between gap-6 hover:shadow-[0_0_20px_rgba(239,68,68,0.05)] cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-20 text-[60px] font-black italic -skew-x-12 -translate-y-4 text-white uppercase">
                      V
                    </div>
                    
                    <div className="flex gap-4">
                      {artist.profilePicture && (
                        <div className="w-16 h-16 shrink-0 border border-white/10 overflow-hidden rounded-sm relative">
                          <img 
                            src={artist.profilePicture} 
                            alt={artist.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-md font-black text-white uppercase tracking-tight group-hover:text-brand transition-colors">{artist.name}</h3>
                          <span className="px-1.5 py-0.5 bg-brand/20 text-brand text-[7px] font-mono uppercase tracking-widest rounded-[1px]">VERIFIED</span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wide">{artist.location || 'NASHVILLE, TN Node'}</p>
                        <p className="text-[11px] text-zinc-400 mt-2 uppercase leading-snug line-clamp-2">{artist.shortBio}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[9px] font-mono">
                      <div className="flex gap-1.5">
                        {artist.genres.slice(0, 2).map(g => (
                          <span key={g} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 uppercase tracking-wider rounded-sm text-[8px]">{g}</span>
                        ))}
                      </div>
                      <span className="text-zinc-600 flex items-center gap-1 group-hover:text-zinc-400 transition-colors uppercase font-bold">
                        EXPLORE_INTEL <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Directory Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
              <Compass size={18} className="text-brand" /> COMMUNITY_CATALOG_GRID
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {commonArtists.map((artist) => (
                <div 
                  key={artist.id}
                  onClick={() => handleSelectArtist(artist)}
                  className="group bg-zinc-900/30 hover:bg-zinc-900/50 border border-white/5 hover:border-zinc-700 transition-all p-4 flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      {artist.profilePicture && (
                        <img 
                          src={artist.profilePicture} 
                          alt={artist.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-sm border border-white/10 shrink-0" 
                        />
                      )}
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand transition-colors truncate">{artist.name}</h3>
                        <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{artist.location || 'US Node'}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 uppercase leading-snug line-clamp-3">{artist.shortBio || artist.bio}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[8px] font-mono">
                    <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 hover:text-white transition-colors uppercase tracking-wider hover:bg-zinc-800">{artist.genres[0]}</span>
                    <span className="text-zinc-600 uppercase font-black tracking-widest hover:text-white transition-colors">ACCESS</span>
                  </div>
                </div>
              ))}

              {artistsList.length === 0 && !artistLoading && (
                <div className="col-span-full text-center py-24 border border-dashed border-white/5 opacity-30 text-[11px] font-mono uppercase italic">
                  No artist profiles match current search parameters or local filter settings.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* FULL SCALE ARTIST PROFILE EXPAND DRAWER / OVERLAY */}
      <AnimatePresence>
        {selectedArtist && (
          <div className="fixed inset-0 z-[350] flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArtist(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-zinc-950 border-l border-white/10 overflow-y-auto no-scrollbar shadow-[-10px_0_50px_rgba(0,0,0,0.8)] z-10 p-8 flex flex-col justify-between"
            >
              <div className="space-y-8">
                {/* Drawer Heading / Title block */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand/5 border border-brand/20">
                      <Users size={16} className="text-brand" />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.3em]">ARTIST_INTEL_INDEX</span>
                      <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mt-0.5">SPECIFIC_PROBE: {selectedArtist.name}</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedArtist(null)}
                    className="p-2 border border-white/5 hover:border-brand/40 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Profile Picture Card Header */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {selectedArtist.profilePicture && (
                    <img 
                      src={selectedArtist.profilePicture} 
                      alt={selectedArtist.name} 
                      referrerPolicy="no-referrer"
                      className="w-32 h-32 object-cover border border-white/10 rounded-sm relative shadow-lg" 
                    />
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedArtist.name}</h2>
                      {selectedArtist.verificationStatus === 'verified' && (
                        <span className="px-1.5 py-0.5 bg-brand/20 border border-brand/40 text-brand text-[7px] font-mono uppercase tracking-[0.2em]">VERIFIED RESIDENT</span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={10} className="text-brand" /> Origin Node: {selectedArtist.location || 'Southern US'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedArtist.genres.map(g => (
                        <span key={g} className="px-2 py-0.5 bg-zinc-900 border border-white/5 text-zinc-400 font-mono text-[8.5px] uppercase tracking-wider rounded-sm">{g}</span>
                      ))}
                    </div>

                    {/* Dynamic Follow Activation Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                       <button
                         onClick={() => toggleFollow(selectedArtist.id)}
                         className={`px-4 py-2 text-[9px] font-black uppercase font-mono tracking-widest flex items-center gap-2 transition-all ${
                           followedIds.includes(selectedArtist.id)
                             ? 'bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66]'
                             : 'bg-white text-black hover:bg-brand hover:text-white'
                         }`}
                       >
                         {followedIds.includes(selectedArtist.id) ? (
                           <>
                             <Check size={10} /> Active Follower
                           </>
                         ) : (
                           <>
                             <Sparkles size={10} /> Track Artist
                           </>
                         )}
                       </button>

                       <div className="text-[9px] font-mono text-zinc-500 uppercase">
                         Visits: {artistViews[selectedArtist.id] || selectedArtist.metrics?.views || 1} • Followers: {(selectedArtist.metrics?.followerCount || 0) + (followedIds.includes(selectedArtist.id) ? 1 : 0)}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Main Bio / Context */}
                <div className="bg-black/40 border border-white/5 p-5 rounded-sm space-y-3 font-mono text-xs">
                  <h3 className="text-[10px] text-zinc-400 uppercase tracking-widest font-black border-b border-white/5 pb-1.5">Artist Biography Context</h3>
                  <p className="text-zinc-300 leading-relaxed uppercase">{selectedArtist.bio}</p>
                </div>

                {/* Sub-featured Audio & Video platform links (Strictly Links - No Hosted Audio) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Song link box */}
                  {selectedArtist.featuredSong?.title && (
                    <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 p-4 rounded-sm flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-brand text-[9px] font-mono tracking-widest uppercase">
                          <Music size={10} /> Featured Single release
                        </div>
                        <h4 className="text-sm font-black text-white uppercase">{selectedArtist.featuredSong.title}</h4>
                      </div>
                      {selectedArtist.featuredSong.link && (
                        <a 
                          href={selectedArtist.featuredSong.link} 
                          onClick={() => handleExternalClick(selectedArtist.id, 'song')}
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full inline-block text-center py-2.5 bg-black hover:bg-brand/20 border border-white/10 hover:border-brand text-zinc-300 hover:text-white font-mono text-[9px] font-bold uppercase transition-colors"
                        >
                          Uplink External Music Streaming Hub
                        </a>
                      )}
                    </div>
                  )}

                  {/* Video link box */}
                  {selectedArtist.featuredVideo?.title && (
                    <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 p-4 rounded-sm flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[#4285F4] text-[9px] font-mono tracking-widest uppercase">
                          <Tv size={10} /> Featured Video production
                        </div>
                        <h4 className="text-sm font-black text-white uppercase">{selectedArtist.featuredVideo.title}</h4>
                      </div>
                      {selectedArtist.featuredVideo.link && (
                        <a 
                          href={selectedArtist.featuredVideo.link} 
                          onClick={() => handleExternalClick(selectedArtist.id, 'video')}
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full inline-block text-center py-2.5 bg-black hover:bg-[#4285F4]/20 border border-white/10 hover:border-[#4285F4] text-zinc-300 hover:text-white font-mono text-[9px] font-bold uppercase transition-colors"
                        >
                          Launch Media Redirect Uplink
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Social media cluster channels */}
                <div className="bg-black/40 border border-white/5 p-5 rounded-sm space-y-4">
                  <h3 className="text-[10px] text-zinc-400 uppercase tracking-widest font-black border-b border-white/5 pb-1.5 flex items-center gap-2">
                    <Globe size={11} className="text-brand" /> OFFICIAL_DIGITAL_CHANNELS
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(selectedArtist.links || {}).filter(([_, val]) => !!val).map(([platform, val]) => (
                      <a
                        key={platform}
                        href={val}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleExternalClick(selectedArtist.id, platform)}
                        className="py-3 bg-zinc-950 border border-white/5 hover:border-brand/40 text-center text-zinc-400 hover:text-white text-[10px] font-mono font-bold uppercase transition-all rounded-sm flex items-center justify-center gap-1.5"
                      >
                        {platform} <ChevronRight size={10} />
                      </a>
                    ))}
                    {Object.values(selectedArtist.links || {}).filter(k => !!k).length === 0 && (
                      <span className="col-span-full text-center text-[9px] font-mono text-zinc-600 uppercase italic">
                        No offsite profiles registered for this node yet.
                      </span>
                    )}
                  </div>
                </div>

              </div>
              
              <div className="border-t border-white/5 pt-6 mt-8 flex justify-between text-[7px] font-mono text-zinc-600 uppercase tracking-widest font-black">
                <span>INDEX_NODE_HASH_ID: {selectedArtist.id}</span>
                <span>DATA INTEGRITY VERIFIED</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC SHOWCASE SUBMISSION QUEUE POPUP FORM */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmitOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] z-10 flex flex-col font-mono"
            >
              {/* Modal header accent */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-brand" />

              {/* Title Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                  <Bookmark className="text-brand w-5 h-5 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                      INDIE_ARTIST_APPLICATION_GATEWAY
                    </span>
                    <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest">
                      Declare digital nodes to register catalog references
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSubmitOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body - Scrollable */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                
                {/* Status Notice Block */}
                <div className="p-3 bg-brand/5 border border-brand/20 text-[9px] uppercase tracking-wide leading-relaxed">
                  <span className="font-extrabold text-brand block mb-1">CONSTRAINTS CERTIFICATION WARNING</span>
                  This directory serves strictly as a gateway to redirect users to official platforms (Spotify, YouTube, Instagram). Under no circumstances will Country Rap Chaos host MP3 music files.
                </div>

                {/* Section A: Core Metrics */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-black text-brand uppercase tracking-widest border-b border-white/5 pb-1">Section A: Primary Identification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Artist Display Name*</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g., UPCHURCH SAGA MASTER"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white uppercase"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Origin State/Node Region</label>
                      <input
                        type="text"
                        placeholder="e.g., Nashville, TN"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Contact/Representative Email*</label>
                      <input
                        required
                        type="email"
                        placeholder="e.g., rep@independent.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Profile/Avatar URL</label>
                      <input
                        type="url"
                        placeholder="Link high-contrast image (square works best)"
                        value={formData.profilePicture}
                        onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-zinc-500 uppercase">Select Applicable Sub-genres* (Pick multiple)</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {GENRES.filter(g => g !== 'All Genres').map(g => {
                        const isSelected = formData.genres.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleGenreCheckboxChange(g)}
                            className={`px-3 py-1.5 border text-[9px] uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-brand/20 border-brand text-white font-extrabold' 
                                : 'bg-black border-white/5 text-zinc-500 hover:border-white/10'
                            }`}
                          >
                            {isSelected ? <Check size={10} /> : <Plus size={10} />}
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-zinc-500 uppercase">Catchy Short bio (Used on card listings / max 200 chars)</label>
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="e.g., A trailblazing outflow musician pushing country lyrics over 808 percussion grids."
                      value={formData.shortBio}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortBio: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white uppercase"
                    />
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase block font-bold">Comprehensive Biography Details</label>
                    <textarea
                      placeholder="Input complete artist history, career milestones, collaborations, and message..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-sm p-3 text-[10px] font-mono text-white h-24 outline-none focus:border-brand uppercase"
                    />
                  </div>
                </div>

                {/* Section B: Redirect Link targets */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-black text-brand uppercase tracking-widest border-b border-white/5 pb-1">Section B: Official Platforms Uplinks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Spotify Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://open.spotify.com/artist/..."
                        value={formData.spotify}
                        onChange={(e) => setFormData(prev => ({ ...prev, spotify: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">YouTube Channel Link</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@..."
                        value={formData.youtube}
                        onChange={(e) => setFormData(prev => ({ ...prev, youtube: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Instagram Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={formData.instagram}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] focus:border-brand outline-none text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Featured Media Assets */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-black text-brand uppercase tracking-widest border-b border-white/5 pb-1">Section C: Featured Release Reference Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured Single URL */}
                    <div className="p-4 bg-black/40 border border-white/5 space-y-3 rounded-sm">
                      <h5 className="text-[9px] text-[#00ff66] uppercase font-bold">Featured Main Single</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Song Title (e.g., Dirt road limits)"
                          value={formData.songTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, songTitle: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-sm py-1.5 px-2.5 text-[9px] focus:border-brand outline-none text-white uppercase"
                        />
                        <input
                          type="url"
                          placeholder="Spotify / Apple Music link..."
                          value={formData.songUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, songUrl: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-sm py-1.5 px-2.5 text-[9px] focus:border-brand outline-none text-white"
                        />
                      </div>
                    </div>

                    {/* Featured Video URL */}
                    <div className="p-4 bg-black/40 border border-white/5 space-y-3 rounded-sm">
                      <h5 className="text-[9px] text-[#4285F4] uppercase font-bold">Featured Video Link</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Video Title (e.g., Dirt road video)"
                          value={formData.videoTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, videoTitle: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-sm py-1.5 px-2.5 text-[9px] focus:border-brand outline-none text-white uppercase"
                        />
                        <input
                          type="url"
                          placeholder="YouTube Video URL link..."
                          value={formData.videoUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-sm py-1.5 px-2.5 text-[9px] focus:border-brand outline-none text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Message Feedback Overlay */}
                {formMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 text-[9px] uppercase leading-relaxed rounded-[1px] font-bold ${
                      formMsg.type === 'success' ? 'bg-green-950/20 border border-green-500/20 text-[#00ff66]' : 'bg-red-950/20 border border-red-500/20 text-brand'
                    }`}
                  >
                    {formMsg.text}
                  </motion.div>
                )}

                {/* Form Action Buttons */}
                <div className="flex gap-4 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="flex-1 py-3 border border-white/10 hover:border-white/20 text-zinc-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    TERM_DISCONNECT
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 py-3 bg-brand hover:opacity-95 disabled:bg-zinc-800 disabled:text-zinc-650 text-white font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                  >
                    {formSubmitting ? 'PROCESSING_SYNC...' : 'DEPOSIT_UPLINK_APPLICATION'}
                  </button>
                </div>

              </form>

              {/* Secure bottom stamp */}
              <div className="p-3.5 bg-black/60 border-t border-white/5 flex justify-between text-[7px] font-mono text-zinc-650 uppercase tracking-widest select-none font-bold">
                <span>Core Submission Gate</span>
                <span>DB CLEARANCE REQUIRED</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
