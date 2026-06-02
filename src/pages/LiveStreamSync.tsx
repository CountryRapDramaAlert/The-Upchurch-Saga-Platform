import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { 
  Tv, Play, Pause, Activity, Flame, ShieldAlert, 
  Send, AlertTriangle, Crosshair, Cpu, Check, X, 
  RefreshCw, Layers, Shield, ThumbsUp, ThumbsDown, 
  Plus, ArrowLeft, Eye, MessageSquare, FastForward
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { LiveStream, LiveStreamAiEvent, UserAnnotation, LiveStreamEventType, LiveStreamStatus } from '../types';

// Robust video ID parser supporting standard, embed, shorts, mobile, live format URLs and raw IDs
function extractYouTubeVideoId(url: string): string {
  if (!url) return '';
  const cleaned = url.trim();
  
  // 1. Check if the input is already a raw 11-char YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
    return cleaned;
  }
  
  // 2. Comprehensive URL regex matches
  const patterns = [
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 3. General catch-all regex fallback
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleaned.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  
  return '';
}

// Seeding high-fidelity livestream intelligence records for offline fallback & quick exploration
const SEEDED_STREAMS: LiveStream[] = [
  {
    id: "seed-stream-01",
    url: "https://www.youtube.com/watch?v=5n_Z6hN9A_g",
    videoId: "5n_Z6hN9A_g",
    title: "Upchurch Defiant Rhetoric falling out with Tommy Fallon News Feed",
    creatorName: "Tommy Fallon News",
    category: "Legal Combat",
    status: "live",
    createdAt: "2026-05-23T21:00:00Z",
    communityConsensusScore: 84,
    consensusAgreeCount: 42,
    consensusDisagreeCount: 8,
    dramaIntensity: 92,
    heatMapData: [
      { time: "00:30", intensity: 45 },
      { time: "01:15", intensity: 80 },
      { time: "02:40", intensity: 95 },
      { time: "04:20", intensity: 60 },
      { time: "06:10", intensity: 92 },
      { time: "08:15", intensity: 35 },
      { time: "10:30", intensity: 88 },
      { time: "11:50", intensity: 90 },
      { time: "13:40", intensity: 75 },
      { time: "15:00", intensity: 50 },
    ]
  },
  {
    id: "seed-stream-02",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    title: "Ryan Upchurch Uncut: Addressing the Artist Jacob LeVeille Lawsuit",
    creatorName: "Ryan Upchurch Channel",
    category: "Personal Feud",
    status: "complete",
    createdAt: "2026-05-22T14:30:00Z",
    communityConsensusScore: 91,
    consensusAgreeCount: 55,
    consensusDisagreeCount: 5,
    dramaIntensity: 78,
    heatMapData: [
      { time: "00:45", intensity: 20 },
      { time: "02:10", intensity: 55 },
      { time: "04:30", intensity: 85 },
      { time: "06:50", intensity: 70 },
      { time: "08:15", intensity: 90 },
      { time: "10:00", intensity: 40 },
    ]
  },
  {
    id: "seed-stream-03",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    title: "Mokon Intelligence Syndicate: Tracing the Creek Squad Defections",
    creatorName: "Mokon Investigative Group",
    category: "Drama Channel",
    status: "complete",
    createdAt: "2026-05-20T10:15:00Z",
    communityConsensusScore: 76,
    consensusAgreeCount: 19,
    consensusDisagreeCount: 6,
    dramaIntensity: 65,
    heatMapData: [
      { time: "01:00", intensity: 30 },
      { time: "03:00", intensity: 65 },
      { time: "05:15", intensity: 45 },
      { time: "07:30", intensity: 80 },
      { time: "09:45", intensity: 75 },
    ]
  }
];

const SEEDED_EVENTS: LiveStreamAiEvent[] = [
  // Events for stream-01
  {
    id: "seed-ev-01-a",
    streamId: "seed-stream-01",
    timestamp: "00:30",
    timestampSeconds: 30,
    type: "hostile_escalation",
    title: "Opening Invective Statement",
    severity: "low",
    confidence: 94,
    explanation: "Broadcaster commences transmission by describing Ryan Upchurch as 'unhinged' and 'actively spreading misinformation to raise hell'. High verbal hostility coordinates.",
    snippet: "We're not running games tonight. The Raising Hell Eat Cornbread era has turned completely toxic and we're detailing exactly why Upchurch refuses to speak coordinates..."
  },
  {
    id: "seed-ev-01-b",
    streamId: "seed-stream-01",
    timestamp: "01:15",
    timestampSeconds: 75,
    type: "contradiction",
    title: "Contract Settlement Denial Clashes with DM Proof",
    severity: "high",
    confidence: 88,
    explanation: "Host claims Ryan Upchurch has 'zero legal recourse and has never attempted to settle or message privately'. However, host immediately displays direct messages with timestamps contradictory to this statement.",
    snippet: "My channel never received a single document or DM from Ryan. He can play tough, but he's silent. [Overlay displays DM from Ryan Upchurch: 'We can settle Cheatham Co out of court or go federal']"
  },
  {
    id: "seed-ev-01-c",
    streamId: "seed-stream-01",
    timestamp: "02:40",
    timestampSeconds: 160,
    type: "emotional_escalation",
    title: "Tommy Fallon Decibel Outburst",
    severity: "high",
    confidence: 96,
    explanation: "Voice frequency analysis tracks a 35dB signal spike. Host slams fists on the radar table, yelling about his credentials and professional privacy claims.",
    snippet: "DO NOT BRING UP MY CREDIT AND REVENUE IN MY COMMENT SECTION! I HAVE INDEPENDENT RIGHTS IN CHEATHAM COUNTY! WE COVER THE SAGA AUTHENTICALLY!"
  },
  {
    id: "seed-ev-01-d",
    streamId: "seed-stream-01",
    timestamp: "06:10",
    timestampSeconds: 370,
    type: "self_contradiction",
    title: "Retraction of Partnership Status",
    severity: "medium",
    confidence: 82,
    explanation: "Claims Ryan was 'solely a source, never a business direct affiliate', contradicting an earlier interview clip where he named Upchurch as the 'exclusive production financier' of Creeksquad records.",
    snippet: "Ryan had zero to do with production financing. He was just a standard catalog licensing source. Nothing more."
  },
  {
    id: "seed-ev-01-e",
    streamId: "seed-stream-01",
    timestamp: "10:30",
    timestampSeconds: 630,
    type: "audience_manipulation",
    title: "Uplink Target Raid Call",
    severity: "high",
    confidence: 90,
    explanation: "Explicit rhetorical plea asking subscribers to gather evidence and post spam links on Creek Squad fanboards, framing the actions as a 'righteous democratic audit'.",
    snippet: "Go check their fan panels right now and drop the screenshots. I want everyone in the chat to flood the reddit timeline with LeVeille's VARA document. They must know the truth."
  },

  // Events for stream-02
  {
    id: "seed-ev-02-a",
    streamId: "seed-stream-02",
    timestamp: "02:10",
    timestampSeconds: 130,
    type: "deflection",
    title: "Federal VARA Suit Avoidance Tactics",
    severity: "medium",
    confidence: 85,
    explanation: "Ryan avoids mentioning the core allegations of artistic destruction (Jacob LeVeille VARA lawsuit) and instantly pivots to describing Jacob's previous non-payment issues on unrelated design projects.",
    snippet: "Everybody wants to cry about copyright laws, but when I gave that painter custom features on my stream and paid him cold cash... nobody recorded that, did they?"
  },
  {
    id: "seed-ev-02-b",
    streamId: "seed-stream-02",
    timestamp: "04:30",
    timestampSeconds: 270,
    type: "accusation",
    title: "Extortion and Kickback Allegations",
    severity: "high",
    confidence: 78,
    explanation: "Ryan claims the lawyer representing the visual artist is 'colluding with several country music channels to extort independent southern artists in Middle Tennessee'.",
    snippet: "It's a complete kickback racket under the table. They find an independent kid that makes a splash, file some fake copyright paper, and split the settlement cream."
  },
  {
    id: "seed-ev-02-c",
    streamId: "seed-stream-02",
    timestamp: "08:15",
    timestampSeconds: 495,
    type: "alliance_mention",
    title: "The Adam Calhoun Re-Alliance Pivot",
    severity: "low",
    confidence: 92,
    explanation: "Offers unexpected praise to Adam Calhoun, suggesting they are coordinating to deal with shadow agents on social media. Narrative realignment signal.",
    snippet: "Adam called me last night. Calhoun and me, we had beef, but he's a real country rapper. He sees the shadow play. We are locked in on Cheatham County."
  }
];

const SEEDED_ANNOTATIONS: UserAnnotation[] = [
  {
    id: "seed-ann-01",
    streamId: "seed-stream-01",
    timestamp: "01:16",
    timestampSeconds: 76,
    text: "He clearly displayed the message right on the background monitors! Absolute definition of a self-destruction, Tommy Fallon got caught in 4K.",
    userEmail: "saga_watcher@gmail.com",
    userName: "SagaWatchDog",
    votes: 18
  },
  {
    id: "seed-ann-02",
    streamId: "seed-stream-01",
    timestamp: "02:45",
    timestampSeconds: 165,
    text: "Volume levels spiked heavy here! This is proof of core tension, he cannot keep his composure when they speak about Creeksquad bank logs.",
    userEmail: "creek_spy@yahoo.com",
    userName: "CreekSquadShadow",
    votes: 12
  }
];

export default function LiveStreamSync() {
  const { user, profile } = useAuthStore();
  const [streams, setStreams] = useState<LiveStream[]>(() => {
    const cached = localStorage.getItem("firestore_fallback_streams");
    return cached ? JSON.parse(cached) : SEEDED_STREAMS;
  });
  const [aiEvents, setAiEvents] = useState<LiveStreamAiEvent[]>(() => {
    const cached = localStorage.getItem("firestore_fallback_ai_events");
    return cached ? JSON.parse(cached) : SEEDED_EVENTS;
  });
  const [annotations, setAnnotations] = useState<UserAnnotation[]>(() => {
    const cached = localStorage.getItem("firestore_fallback_user_annotations");
    return cached ? JSON.parse(cached) : SEEDED_ANNOTATIONS;
  });

  const [activeTab, setActiveTab] = useState<'monitor' | 'command'>('command');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(() => {
    const cached = localStorage.getItem("firestore_fallback_streams");
    const parsed = cached ? JSON.parse(cached) : SEEDED_STREAMS;
    return parsed && parsed.length > 0 ? parsed[0] : SEEDED_STREAMS[0];
  });
  
  // Submit Stream variables
  const [streamUrl, setStreamUrl] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [streamCategory, setStreamCategory] = useState('Legal Combat');
  const [ingestionStage, setIngestionStage] = useState<string | null>(null);
  const [ingestingStatusText, setIngestingStatusText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Command Deck State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeEventFilter, setActiveEventFilter] = useState<string>('all');
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  
  // Annotation insertion variables
  const [newAnnotationText, setNewAnnotationText] = useState('');

  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const playbackTrackerInterval = useRef<number | null>(null);

  // Load live Firestore collections if reachable
  useEffect(() => {
    const unsubStreams = onSnapshot(collection(db, 'streams'), (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LiveStream[];
        setStreams(prev => {
          const localOnly = prev.filter(p => p.id.startsWith('stream_') || !data.some(d => d.id === p.id));
          const merged = [...data, ...localOnly];
          localStorage.setItem("firestore_fallback_streams", JSON.stringify(merged));
          return merged;
        });
      }
    }, (err) => console.log("Streams load using hybrid local mode"));

    const unsubEvents = onSnapshot(collection(db, 'ai_events'), (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LiveStreamAiEvent[];
        setAiEvents(prev => {
          const localOnly = prev.filter(p => p.id.startsWith('ev_') || !data.some(d => d.id === p.id));
          const merged = [...data, ...localOnly];
          localStorage.setItem("firestore_fallback_ai_events", JSON.stringify(merged));
          return merged;
        });
      }
    }, (err) => console.log("AI events load using hybrid local mode"));

    const unsubAnnotations = onSnapshot(collection(db, 'user_annotations'), (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserAnnotation[];
        setAnnotations(prev => {
          const localOnly = prev.filter(p => p.id.startsWith('ann_custom_') || !data.some(d => d.id === p.id));
          const merged = [...data, ...localOnly];
          localStorage.setItem("firestore_fallback_user_annotations", JSON.stringify(merged));
          return merged;
        });
      }
    }, (err) => console.log("Annotations load using hybrid local mode"));

    return () => {
      unsubStreams();
      unsubEvents();
      unsubAnnotations();
    };
  }, []);

  // Sync polling tracker when YouTube is playing
  useEffect(() => {
    if (isPlayerPlaying && youtubePlayerRef.current) {
      playbackTrackerInterval.current = window.setInterval(() => {
        try {
          const time = youtubePlayerRef.current.getCurrentTime();
          setCurrentTime(Math.round(time));
        } catch (e) {
          // Player reference errors are handled gracefully
        }
      }, 500);
    } else {
      if (playbackTrackerInterval.current) {
        clearInterval(playbackTrackerInterval.current);
        playbackTrackerInterval.current = null;
      }
    }
    return () => {
      if (playbackTrackerInterval.current) {
        clearInterval(playbackTrackerInterval.current);
      }
    };
  }, [isPlayerPlaying]);

  // Handle stream submission and trigger real, live backend analyzer
  const handleIngestStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setIngestionStage('CONNECTING');
    
    // Extract video ID safely
    const calculatedVideoId = extractYouTubeVideoId(streamUrl) || "dQw4w9WgXcQ";

    const localStreamId = `stream_${Date.now()}`;
    const newStreamObj: LiveStream = {
      id: localStreamId,
      url: streamUrl,
      videoId: calculatedVideoId,
      title: streamTitle,
      creatorName: creatorName,
      category: streamCategory,
      status: 'queued',
      createdAt: new Date().toISOString(),
      communityConsensusScore: 100,
      consensusAgreeCount: 0,
      consensusDisagreeCount: 0,
      dramaIntensity: 50,
      heatMapData: []
    };

    // Sequential fake hacking visual staging for immersive cyber espionage layout
    const runImmersiveVisualStages = async () => {
      setIngestingStatusText("ESTABLISHING ENCRYPTED LINK TO INGESTION PORT... 0.0.0.0:3000");
      await new Promise(r => setTimeout(r, 1500));
      setIngestingStatusText("DOWNLOADING SATELLITE DIGITAL CAPTURE BUFFER...");
      await new Promise(r => setTimeout(r, 1200));
      setIngestingStatusText("DECRYPTING YouTube PACKETS & ALIGNING CORE TRANSCRIPTION GRID...");
      await new Promise(r => setTimeout(r, 1500));
      setIngestingStatusText("PIPELINE ESTABLISHED. SUMMONING GEMINI QUANTUM COGNITIVE EVALUATOR...");
    };

    try {
      // Start visual timeline
      runImmersiveVisualStages();
      
      // Perform the real server-side API call!
      const response = await fetch('/api/ai/analyze-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: streamUrl,
          title: streamTitle,
          creatorName: creatorName,
          category: streamCategory
        })
      });

      if (!response.ok) {
        throw new Error("Target video analysis timed out at server layer or returned parsing boundaries.");
      }

      const reportData = await response.json();

      // Finish setup
      const fullyAnalyzedStream: LiveStream = {
        ...newStreamObj,
        status: 'live',
        title: reportData.title || streamTitle,
        creatorName: reportData.creatorName || creatorName,
        dramaIntensity: reportData.dramaIntensity || 70,
        heatMapData: reportData.heatMapData || [
          { time: "01:00", intensity: 45 },
          { time: "05:00", intensity: 85 },
          { time: "10:00", intensity: 65 }
        ]
      };

      // Create AI events based on detections returned
      const newDetections: LiveStreamAiEvent[] = (reportData.detections || []).map((det: any, index: number) => ({
        id: `ev_${localStreamId}_${index}_${Date.now()}`,
        streamId: localStreamId,
        timestamp: det.timestamp || "01:00",
        timestampSeconds: det.timestampSeconds || (index * 120),
        type: det.type as LiveStreamEventType,
        title: det.title || "Detected Conflict Node",
        severity: (det.severity || 'medium') as 'low' | 'medium' | 'high',
        confidence: det.confidence || 80,
        explanation: det.explanation || "Automated timeline detection.",
        snippet: det.snippet || "Vocal data captured.",
        pinned: false,
        userFlaggedCount: 0
      }));

      // Persist locally
      const storedStreams = [...streams, fullyAnalyzedStream];
      const storedEvents = [...aiEvents, ...newDetections];
      setStreams(storedStreams);
      setAiEvents(storedEvents);
      localStorage.setItem("firestore_fallback_streams", JSON.stringify(storedStreams));
      localStorage.setItem("firestore_fallback_ai_events", JSON.stringify(storedEvents));

      // Attempt write to real Firestore database
      try {
        await addDoc(collection(db, 'streams'), fullyAnalyzedStream);
        for (const ev of newDetections) {
          await addDoc(collection(db, 'ai_events'), ev);
        }
      } catch (dbErr) {
        console.warn("Real database is currently in sandbox safe-fallback mode. Record preserved locally.");
      }

      // Automatically launch this stream!
      setSelectedStream(fullyAnalyzedStream);
      setActiveTab('command');
      setIngestionStage(null);
      setStreamUrl('');
      setStreamTitle('');
      setCreatorName('');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to digest the livestream. Make sure your environment has proper process.env.GEMINI_API_KEY parameters configured.");
      setIngestionStage(null);
    }
  };

  const handleLaunchStream = (stream: LiveStream) => {
    setSelectedStream(stream);
    setCurrentTime(0);
    setIsPlayerPlaying(false);
    setSelectedEventId(null);
    setActiveTab('command');
  };

  // Helper seeks player head and aligns UI highlight
  const handleSeekPlayer = (seconds: number, eventId?: string) => {
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
        if (eventId) {
          setSelectedEventId(eventId);
        }
      } catch (e) {
        console.warn("YouTube video seeking error:", e);
      }
    }
  };

  // Upvote community consensus counters on Client + DB
  const handleConsensusReaction = async (id: string, agree: boolean) => {
    const stream = streams.find(s => s.id === id);
    if (!stream) return;

    const hasReacted = localStorage.getItem(`voted_consensus_${id}`);
    if (hasReacted) {
      alert("You have already recorded your vote for this stream.");
      return;
    }

    const agreeInc = agree ? 1 : 0;
    const disagreeInc = !agree ? 1 : 0;
    
    // Save locally
    const updated = streams.map(s => {
      if (s.id === id) {
        const agreeCount = (s.consensusAgreeCount || 0) + agreeInc;
        const disagreeCount = (s.consensusDisagreeCount || 0) + disagreeInc;
        const total = agreeCount + disagreeCount;
        const score = total > 0 ? Math.round((agreeCount / total) * 100) : 100;
        return {
          ...s,
          consensusAgreeCount: agreeCount,
          consensusDisagreeCount: disagreeCount,
          communityConsensusScore: score
        };
      }
      return s;
    });
    setStreams(updated);
    localStorage.setItem("firestore_fallback_streams", JSON.stringify(updated));
    localStorage.setItem(`voted_consensus_${id}`, 'agree');

    // Attempt firebase increment
    try {
      await updateDoc(doc(db, 'streams', id), {
        consensusAgreeCount: increment(agreeInc),
        consensusDisagreeCount: increment(disagreeInc)
      });
    } catch (e) {
      // Handled silently
    }
  };

  // Submit manual timestamped annotation
  const handleSubmitAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStream || !newAnnotationText.trim()) return;

    const timeStr = formatTime(currentTime);
    const newAnn: UserAnnotation = {
      id: `ann_custom_${Date.now()}`,
      streamId: selectedStream.id,
      timestamp: timeStr,
      timestampSeconds: currentTime,
      text: newAnnotationText.trim(),
      userEmail: user?.email || "anonymous_operator@saga.os",
      userName: profile?.username || "Guest Operator",
      votes: 1
    };

    const updated = [newAnn, ...annotations];
    setAnnotations(updated);
    localStorage.setItem("firestore_fallback_user_annotations", JSON.stringify(updated));
    setNewAnnotationText('');

    try {
      await addDoc(collection(db, 'user_annotations'), newAnn);
    } catch (e) {
      // Fallback
    }
  };

  // Upvote community annotation
  const handleUpvoteAnnotation = async (id: string) => {
    const hasUpvoted = localStorage.getItem(`voted_ann_${id}`);
    if (hasUpvoted) return;

    const updated = annotations.map(ann => 
      ann.id === id ? { ...ann, votes: ann.votes + 1 } : ann
    );
    setAnnotations(updated);
    localStorage.setItem("firestore_fallback_user_annotations", JSON.stringify(updated));
    localStorage.setItem(`voted_ann_${id}`, 'true');

    try {
      await updateDoc(doc(db, 'user_annotations', id), {
        votes: increment(1)
      });
    } catch (e) {
      // Handled silently
    }
  };

  // Admin control: pin event
  const togglePinEvent = async (id: string) => {
    if (!profile?.isAdmin) return;

    const updated = aiEvents.map(ev => 
      ev.id === id ? { ...ev, pinned: !ev.pinned } : ev
    );
    setAiEvents(updated);
    localStorage.setItem("firestore_fallback_ai_events", JSON.stringify(updated));

    try {
      const parentEvent = aiEvents.find(ev => ev.id === id);
      await updateDoc(doc(db, 'ai_events', id), {
        pinned: !parentEvent?.pinned
      });
    } catch (e) {
      // Fallback
    }
  };

  // Standard utility: format seconds to MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'contradiction':
        return 'border-red-500/30 bg-red-950/20 text-red-500';
      case 'self_contradiction':
        return 'border-red-400/30 bg-red-950/25 text-red-400';
      case 'emotional_escalation':
      case 'hostile_escalation':
        return 'border-orange-500/30 bg-orange-950/35 text-orange-500';
      case 'possible_misinformation':
        return 'border-yellow-500/30 bg-yellow-950/20 text-yellow-500';
      case 'accusation':
        return 'border-purple-500/40 bg-purple-950/20 text-purple-400';
      case 'denial':
        return 'border-blue-500/30 bg-blue-950/20 text-blue-400';
      case 'deflection':
      case 'topic_pivot':
        return 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400';
      case 'alliance_mention':
        return 'border-green-500/30 bg-green-950/20 text-green-400';
      default:
        return 'border-zinc-500/30 bg-zinc-950 text-zinc-400';
    }
  };

  // Find matching active event for the current playback marker and returns color mapping
  const activeEvents = selectedStream 
    ? aiEvents.filter(ev => ev.streamId === selectedStream.id)
    : [];

  const currentHighlightEvent = activeEvents.reduce<LiveStreamAiEvent | null>((acc, ev) => {
    if (currentTime >= ev.timestampSeconds && (acc === null || ev.timestampSeconds > acc.timestampSeconds)) {
      return ev;
    }
    return acc;
  }, null);

  const currentDramaScale = currentHighlightEvent 
    ? (currentHighlightEvent.severity === 'high' ? 95 : currentHighlightEvent.severity === 'medium' ? 65 : 30)
    : (selectedStream?.dramaIntensity || 45);

  const getFriendlyEventTypeName = (type: string) => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className={`w-full min-h-[calc(100vh-64px-40px)] flex flex-col relative text-zinc-300 font-sans transition-all selection:bg-brand selection:text-white ${cinemaMode ? 'bg-[#050505] pb-24' : 'bg-black pb-12'}`}>
      
      {/* HUD HEADER */}
      {!cinemaMode && (
        <div className="w-full bg-black/60 border-b border-white/5 py-4 px-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-brand/40 bg-brand/5 rounded-sm flex items-center justify-center animate-pulse">
              <Flame className="text-brand w-6 h-6 shadow-[0_0_15px_rgba(255,0,0,0.4)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-950/40 border border-brand/30 text-brand px-1.5 py-0.5 rounded-sm font-bold font-mono tracking-widest text-[8px] uppercase">
                  INTELLIGENCE COMMAND
                </span>
                <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
              </div>
              <h1 className="text-lg font-black font-display text-white tracking-widest uppercase flex items-center gap-2.5">
                <span>LIVE_STREAM_SYNC_MODE</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {activeTab === 'command' && selectedStream && (
              <button
                onClick={() => {
                  setActiveTab('monitor');
                  setCinemaMode(false);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 border border-white/10 bg-white/5 hover:border-brand/40 hover:bg-brand/5 text-[10px] font-bold font-mono text-zinc-400 hover:text-white rounded-sm transition-all"
              >
                <ArrowLeft size={13} />
                <span>EXIT COMMAND DECK</span>
              </button>
            )}

            <div className="flex items-center bg-zinc-950 border border-white/5 rounded-sm p-1">
              <button
                onClick={() => {
                  setActiveTab('monitor');
                  setCinemaMode(false);
                }}
                className={`px-3 py-1 text-[9px] font-bold font-mono rounded-sm transition-all uppercase ${activeTab === 'monitor' ? 'bg-brand text-white shadow-[0_0_10px_rgba(255,0,0,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                MONITOR CENTER
              </button>
              <button
                disabled={!selectedStream}
                onClick={() => setActiveTab('command')}
                className={`px-3 py-1 text-[9px] font-bold font-mono rounded-sm transition-all uppercase ${!selectedStream ? 'opacity-30 cursor-not-allowed' : ''} ${activeTab === 'command' ? 'bg-brand text-white shadow-[0_0_10px_rgba(255,0,0,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                COMMAND DECK
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitor' ? (
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 animate-fade-in">
          
          {/* LEFT/CENTER STAGING: INGESTION SUBMISSION */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            <div className="p-6 border border-white/10 bg-zinc-950/60 backdrop-blur-md rounded-sm relative flex flex-col space-y-4">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-brand/30" />
              
              <div className="flex items-center gap-2 text-white">
                <Cpu className="text-brand w-5 h-5" />
                <span className="text-xs font-black tracking-widest uppercase font-mono">ESTABLISH SYNC LINK</span>
              </div>
              
              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                Uplink a YouTube livestream or broadcast recording to compile automated contradiction timelines, lie detections, emotional decibel mappings, and creator beef markers.
              </p>

              {errorText && (
                <div className="p-3 bg-red-950/20 border border-brand/30 rounded-sm text-brand font-mono text-[9px] leading-relaxed uppercase flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              {ingestionStage ? (
                <div className="p-6 border border-brand/20 bg-brand/5 rounded-sm flex flex-col items-center justify-center space-y-4 text-center">
                  <RefreshCw className="w-8 h-8 text-brand animate-spin" />
                  <div className="space-y-1 font-mono">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">INGESTION SEQUENCE ENGAGED</p>
                    <p className="text-[8px] text-brand/80 px-4 leading-normal select-all">
                      {ingestingStatusText}
                    </p>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 border border-white/5 rounded-full overflow-hidden">
                    <div className="bg-brand h-full animate-pulse-progress" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleIngestStream} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Livestream / Video URL</label>
                    <input
                      required
                      type="url"
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-black border border-white/10 rounded-sm p-2.5 text-[10px] focus:border-brand/60 outline-none text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Simulated Event Title</label>
                    <input
                      required
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="e.g. Upchurch responds to Fallon claims"
                      className="w-full bg-black border border-white/10 rounded-sm p-2.5 text-[10px] focus:border-brand/60 outline-none text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Creator / Channel Name</label>
                    <input
                      required
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Tommy Fallon News"
                      className="w-full bg-black border border-white/10 rounded-sm p-2.5 text-[10px] focus:border-brand/60 outline-none text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Analysis Domain</label>
                    <select
                      value={streamCategory}
                      onChange={(e) => setStreamCategory(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-sm p-2.5 text-[10px] focus:border-brand/40 outline-none text-white tracking-wider font-mono"
                    >
                      <option value="Legal Combat">Legal Combat (VARA / Suits)</option>
                      <option value="Personal Feud">Personal Feud (Fallout / Callouts)</option>
                      <option value="Drama Channel">Drama Channel (Reactions / Audits)</option>
                      <option value="Media Debounce">Media Debounce (Retractions)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand hover:bg-red-700 text-white font-mono text-[9px] font-black uppercase tracking-[0.25em] rounded-sm transition-all cursor-pointer shadow-[0_0_15px_rgba(255,0,0,0.15)] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] flex items-center justify-center gap-2"
                  >
                    <Cpu size={12} />
                    <span>ENGAGE AUTOMATED PIPELINE</span>
                  </button>
                </form>
              )}
            </div>

            <div className="p-4 bg-red-950/5 border border-red-900/10 rounded-sm font-mono space-y-2">
              <div className="flex items-center gap-2 text-brand">
                <Shield size={12} />
                <span className="text-[9px] font-black uppercase tracking-wider">AI_INGEST_PROTOCOL</span>
              </div>
              <p className="text-[8px] text-zinc-500 leading-relaxed uppercase">
                THIS SUITE DIRECTLY PROXIES THE MODERN GEMINI COGNITIVE LAYER TO DETECT CONTRADICTION NODES IN SAGA RECORDS. EXPOSED KEYS ARE SECURED AND NEVER COMMITTED TO THE CLIENT.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: STREAM TRACKER FEED */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Tv className="text-brand w-4 h-4" />
                <span className="text-xs font-black tracking-[0.2em] font-mono text-white">RECONNAISSANCE SYNC FEED</span>
              </div>
              <span className="text-[8px] font-mono text-zinc-500">{streams.length} ACTIVE TRACKS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {streams.map((stream) => {
                const streamEvsCount = aiEvents.filter(ev => ev.streamId === stream.id).length;
                return (
                  <div 
                    key={stream.id}
                    className="border border-white/5 bg-zinc-950/40 hover:border-brand/30 hover:bg-zinc-950/70 transition-all rounded-sm p-4 sm:p-5 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2.5">
                      {/* Top metadata stats row with natural wrapping */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <span className="text-[8px] font-mono text-brand uppercase tracking-wider font-bold">
                          {stream.category} — {stream.creatorName}
                        </span>
                        <div>
                          {stream.status === 'live' ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-red-950/45 border border-brand/30 text-brand text-[7px] font-mono font-black tracking-widest uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
                              <span>SYNCHRONIZED</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-900 border border-white/10 text-zinc-450 text-[7px] font-mono font-black tracking-widest uppercase">
                              <span>COMPILED</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xs font-black font-display text-white tracking-wide leading-snug group-hover:text-brand transition-colors uppercase">
                        {stream.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[9px] text-zinc-500">
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Activity size={11} className="text-brand shrink-0" />
                          <span>{streamEvsCount} AI Detections</span>
                        </span>
                        <span className="flex items-center gap-1 text-green-500">
                          <ThumbsUp size={11} className="text-green-500/50 shrink-0" />
                          <span>{stream.communityConsensusScore}% Consensus</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleLaunchStream(stream)}
                        className="p-1.5 px-3 border border-brand/40 bg-brand/5 hover:bg-brand hover:text-white rounded-sm text-brand transition-all text-[8px] font-black tracking-wider uppercase cursor-pointer shrink-0 w-full sm:w-auto text-center"
                      >
                        LAUNCH DECK
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        
        /* COMMAND DECK INTERFACE */
        selectedStream && (
          <div className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10 animate-fade-in ${cinemaMode ? 'lg:py-6' : ''}`}>
            
            {/* STAGE HEADER METADATA OVERLAY */}
            <div className={`col-span-12 border border-white/5 bg-zinc-950/80 p-4 sm:p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${cinemaMode ? 'max-w-5xl mx-auto w-full' : ''}`}>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[8px] font-bold font-mono text-brand uppercase tracking-[0.2em] block">
                  MONITORED INTEL APERTURE // ID: {selectedStream.videoId}
                </span>
                <h2 className="text-sm md:text-base font-black font-display text-white tracking-wide uppercase break-words leading-tight">
                  {selectedStream.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-zinc-500">
                  <span className="shrink-0 bg-white/5 px-1 py-0.5 rounded-sm">CHANNEL: {selectedStream.creatorName}</span>
                  <span className="hidden sm:inline text-zinc-700">|</span>
                  <span className="shrink-0 bg-white/5 px-1 py-0.5 rounded-sm">CATEGORY: {selectedStream.category}</span>
                  <span className="hidden sm:inline text-zinc-700">|</span>
                  <span className="text-zinc-400 font-bold shrink-0 bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded-sm">TIME: {formatTime(currentTime)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <button
                  onClick={() => setCinemaMode(!cinemaMode)}
                  className={`w-full sm:w-auto px-3.5 py-1.5 border hover:border-brand/40 hover:text-white rounded-sm text-[8px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${cinemaMode ? 'border-brand bg-brand/35 text-brand shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' : 'border-white/10 text-zinc-400 bg-white/5'}`}
                >
                  <Eye size={12} className={cinemaMode ? "text-brand" : "text-zinc-400"} />
                  <span>{cinemaMode ? 'EXIT CINEMATIC HUD' : 'CINEMATIC HUD'}</span>
                </button>
              </div>
            </div>

            {/* LEFT AREA: MEDIA INGESTION VIEWPORT */}
            <div className={`${cinemaMode ? 'lg:col-span-12 max-w-5xl mx-auto w-full' : 'lg:col-span-7'} flex flex-col space-y-6`}>
              
              {/* VIDEO BOX LAYER */}
              <div className="border border-white/10 bg-zinc-950/80 rounded-sm relative shadow-2xl overflow-hidden flex flex-col">
                {/* Embedded status bar configured to wrap nicely on mobile */}
                <div className="border-b border-white/5 py-2.5 px-4 bg-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[9px] text-zinc-400 select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping shrink-0" />
                    <span className="font-bold text-white tracking-widest uppercase truncate">SECURE_MONITORING_FEED // PORT_3000</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-905 border border-white/10 rounded-sm py-0.5 px-2 text-[#00ff66] font-bold self-start sm:self-auto text-[8px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse shrink-0" />
                    <span>FEED_LINK: ACTIVE</span>
                  </div>
                </div>

                <div className="p-1">
                  <div className="w-full aspect-video rounded-sm overflow-hidden bg-zinc-950 flex items-center justify-center relative border border-white/5">
                    <YouTube
                      key={selectedStream.videoId}
                      videoId={selectedStream.videoId}
                      className="absolute inset-0 w-full h-full"
                      iframeClassName="absolute inset-0 w-full h-full"
                      opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                          autoplay: 1,
                          controls: 1,
                          modestbranding: 1,
                          rel: 0,
                        }
                      }}
                      onReady={(e: YouTubeEvent) => {
                        youtubePlayerRef.current = e.target;
                      }}
                      onStateChange={(e: YouTubeEvent) => {
                        setIsPlayerPlaying(e.data === 1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Only show diagnostics when cinematic mode is off */}
              {!cinemaMode && (
                <>
                  {/* DYNAMIC DRAMA & HEATMAP SIGNAL TRACKER */}
                  <div className="border border-white/5 bg-zinc-950/40 rounded-sm p-4 w-full space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-brand shrink-0" />
                        <span className="text-[10px] font-bold font-mono text-white uppercase tracking-widest leading-none">BIOMETRIC CONFLICT SCANNER</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#00ff66] animate-pulse bg-[#00ff66]/5 border border-[#00ff66]/20 px-2 py-0.5 rounded-sm">VOLATILITY_PCT: {currentDramaScale}%</span>
                    </div>

                    {/* GRAPHICAL SEGMENT */}
                    <div className="w-full h-10 flex items-end gap-1 font-mono pt-1">
                      {selectedStream.heatMapData.map((point, idx) => {
                        const isActive = currentTime >= idx * 90; // mock bracket
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            <div 
                              className={`w-full transition-all duration-300 rounded-sm ${isActive ? 'bg-gradient-to-t from-brand/50 to-brand' : 'bg-zinc-800'}`}
                              style={{ height: `${point.intensity}%` }}
                            />
                            {/* Non-intrusive hover overlay */}
                            <div className="absolute bottom-full mb-1 bg-zinc-950 border border-white/10 p-1 rounded-[1px] text-[6px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                              {point.time} // Heat: {point.intensity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* TIMELINE PROGRESS HOVERABLE TRACK */}
                    <div className="flex justify-between font-mono text-[8px] text-zinc-600 uppercase pt-1">
                      <span>Start [00:00]</span>
                      <span className="hidden sm:inline">Signal Resolution Level // Dynamic Filter</span>
                      <span>Limit [15:00]</span>
                    </div>
                  </div>

                  {/* RADIAL ANALYTICS BLOCK: DRAMA INTENSITY & COMMUNITY REACTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* CORE VOLATILITY ARC SCALE */}
                    <div className="border border-white/5 bg-zinc-950/60 p-4 sm:p-5 rounded-sm flex items-center gap-5 justify-between relative overflow-hidden">
                      <div className="space-y-1.5 flex-1 min-w-0 select-none">
                        <span className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Drama Volatility Index</span>
                        <h4 className="text-[11px] font-mono font-bold text-white uppercase truncate">SAGA_VOL_COORDINATE</h4>
                        <p className="text-[8px] text-zinc-400 font-mono leading-tight">
                          Acoustic stress indicators derived from vocal spikes.
                        </p>
                      </div>

                      {/* Standard Tailwind sizes (w-20 h-20 sm:w-24 sm:h-24) to prevent collapsing issues */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-4 border-brand/10 border-t-brand rounded-full animate-[spin_5s_linear_infinite] shrink-0">
                        <div className="flex flex-col items-center select-none rotate-0">
                          <div className="animate-[spin_5s_linear_infinite] [animation-direction:reverse] flex flex-col items-center">
                            <span className="text-xs sm:text-base font-bold text-white font-mono leading-none">{currentDramaScale}</span>
                            <span className="text-[5px] sm:text-[6px] font-mono text-brand tracking-widest leading-none mt-1">VOLAT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONSENSUS VOTE SCALE */}
                    <div className="border border-white/5 bg-zinc-950/60 p-4 sm:p-5 rounded-sm flex flex-col justify-between gap-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 select-none flex-1 min-w-0">
                          <span className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Community Consensus Score</span>
                          <h4 className="text-[11px] font-mono font-bold text-white uppercase truncate">DECISION_AGREEMENT</h4>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-bold font-mono text-green-500">{selectedStream.communityConsensusScore}%</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="w-full bg-zinc-900 h-1.5 border border-white/5 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-green-500 h-full transition-all" 
                            style={{ width: `${selectedStream.communityConsensusScore}%` }} 
                          />
                          <div 
                            className="bg-red-500 h-full transition-all" 
                            style={{ width: `${100 - selectedStream.communityConsensusScore}%` }} 
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[8px] font-mono text-zinc-500">
                          <span className="shrink-0">Agree: {selectedStream.consensusAgreeCount || 0}</span>
                          <div className="flex gap-1.5 justify-center">
                            <button 
                              onClick={() => handleConsensusReaction(selectedStream.id, true)} 
                              className="px-2 py-0.5 border border-green-950 border-t-green-500 bg-green-950/10 text-green-500 text-[7px] font-bold rounded-sm hover:bg-green-500 hover:text-white transition-all cursor-pointer uppercase"
                            >
                              Agree
                            </button>
                            <button 
                              onClick={() => handleConsensusReaction(selectedStream.id, false)} 
                              className="px-2 py-0.5 border border-red-950 border-t-brand bg-red-950/10 text-brand text-[7px] font-bold rounded-sm hover:bg-brand hover:text-white transition-all cursor-pointer uppercase"
                            >
                              Disagree
                            </button>
                          </div>
                          <span className="shrink-0 text-right">Disagree: {selectedStream.consensusDisagreeCount || 0}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </div>

            {/* RIGHT AREA: AI DETECTOR timeline AND COMMUNITY ANNOTATION FEED */}
            {!cinemaMode && (
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col space-y-6">
              
                {/* TIMELINE FEED BOX */}
                <div className="border border-white/10 bg-zinc-950/60 p-4 sm:p-5 rounded-sm flex flex-col space-y-4">
                  
                  {/* TAB OR HEADER SELECT */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="text-brand w-4 h-4 animate-pulse shrink-0" />
                      <span className="text-[10px] font-black tracking-widest font-mono text-white">AI TIMELINE ANNOTATIONS</span>
                    </div>

                    <select
                      value={activeEventFilter}
                      onChange={(e) => setActiveEventFilter(e.target.value)}
                      className="bg-black border border-white/10 text-[8px] font-mono py-1 px-2 focus:border-brand/40 outline-none text-zinc-400 font-bold rounded-sm w-full sm:w-auto"
                    >
                      <option value="all">ALL SIGNS ({activeEvents.length})</option>
                      <option value="contradiction">CONTRADICTIONS</option>
                      <option value="escalation">ESCALATIONS</option>
                    </select>
                  </div>

                  {/* SCROLLING TIMELINE ARRAY */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar flex flex-col">
                  {activeEvents
                    .filter(ev => {
                      if (activeEventFilter === 'all') return true;
                      if (activeEventFilter === 'contradiction') return ev.type.includes('contradiction');
                      if (activeEventFilter === 'escalation') return ev.type.includes('escalation');
                      return true;
                    })
                    .map((item) => {
                      
                      // Highlight matching item with current time coordinate
                      const isPast = currentTime >= item.timestampSeconds;
                      const isExact = currentHighlightEvent?.id === item.id;

                        return (
                          <div 
                            key={item.id}
                            className={`border rounded-sm p-4 transition-all text-left relative flex flex-col space-y-3 cursor-pointer ${isExact ? 'border-brand bg-brand/5 shadow-[0_0_15px_rgba(255,0,0,0.1)]' : 'border-white/5 bg-black/40 hover:border-white/15'}`}
                            onClick={() => handleSeekPlayer(item.timestampSeconds, item.id)}
                          >
                            {/* Top Tag Indicators */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 font-mono font-bold hover:text-brand bg-zinc-900 px-1.5 py-0.5 border border-white/10 rounded-sm shrink-0">
                                  {item.timestamp}
                                </span>
                                <span className={`text-[8px] border px-1.5 py-0.5 rounded-sm font-mono tracking-widest font-black uppercase shrink-0 ${getEventBadgeColor(item.type)}`}>
                                  {getFriendlyEventTypeName(item.type)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {item.pinned && (
                                  <span title="Pinned by Administration" className="shrink-0">
                                    <ShieldAlert className="w-3.5 h-3.5 text-[#ffcc00] fill-[#ffcc00]/10" />
                                  </span>
                                )}
                                <span className="text-[8px] font-mono text-zinc-500 font-bold shrink-0">CONF: {item.confidence}%</span>
                                
                                {profile?.isAdmin && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePinEvent(item.id);
                                    }}
                                    className={`p-1 px-1.5 border rounded-sm transition-all text-[7px] font-bold font-mono cursor-pointer shrink-0 ${item.pinned ? 'border-yellow-500/30 bg-yellow-950/20 text-yellow-500' : 'border-white/10 text-zinc-500 hover:text-white'}`}
                                  >
                                    PIN
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Body details */}
                            <div className="space-y-1.5 leading-relaxed">
                              <h4 className="text-xs font-black text-white font-mono tracking-wide uppercase leading-snug">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-mono italic select-all leading-normal bg-black/45 p-2.5 border border-white/5 rounded-sm whitespace-pre-wrap break-words">
                                "{item.snippet}"
                              </p>
                              <p className="text-[10px] text-zinc-350 font-sans leading-relaxed">
                                {item.explanation}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[8px] text-zinc-650 font-mono uppercase pt-2 border-t border-white/5">
                              <span>SEVERITY: <span className="font-bold text-zinc-450">{item.severity}</span></span>
                              <span className="text-brand/80 animate-pulse tracking-wider">CLICK CARD TO SEEK PLAYER</span>
                            </div>
                          </div>
                        );
                      })}

                    {activeEvents.length === 0 && (
                      <div className="py-12 border border-dashed border-white/5 rounded-sm text-center text-zinc-650 font-mono text-[10px] select-none">
                        NO AUTOMATED DETECTED SIGNALS SECURED
                      </div>
                    )}
                </div>

              </div>              {/* SECTION: COMMUNITY RADAR NOTES & ANNOTATION LOGS */}
              <div className="border border-white/10 bg-zinc-950/80 p-4 sm:p-5 rounded-sm flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                  <div className="flex items-center gap-2 text-white">
                    <MessageSquare className="text-brand w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-black tracking-widest font-mono">COMMUNITY TIMELINE RADAR</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500 shrink-0">{annotations.filter(ann => ann.streamId === selectedStream.id).length} RADAR PROTOCOL LOGS</span>
                </div>

                {/* Submissions form with responsive stack wrapper */}
                <form onSubmit={handleSubmitAnnotation} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-black/40 border border-white/10 rounded-sm p-2 focus-within:border-brand/40">
                    <div className="flex items-center justify-between w-full sm:w-auto shrink-0 bg-zinc-800 text-zinc-350 font-mono text-[9px] font-bold px-2.5 py-1 rounded-sm">
                      <span>SYNC COORDINATES</span>
                      <span className="sm:hidden font-mono text-brand font-bold">{formatTime(currentTime)}</span>
                      <span className="hidden sm:inline ml-1">{formatTime(currentTime)}</span>
                    </div>
                    <input
                      required
                      type="text"
                      value={newAnnotationText}
                      onChange={(e) => setNewAnnotationText(e.target.value)}
                      placeholder="Log dynamic claim contradictions & live audit meta..."
                      className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono py-1 px-1 min-w-0"
                    />
                    <button
                      type="submit"
                      className="p-2 sm:p-1.5 bg-brand hover:bg-red-700 text-white rounded-sm transition-colors cursor-pointer text-[8px] font-black uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
                      title="Transmit Note to Sync Frame"
                    >
                      <Send size={11} className="shrink-0" />
                      <span className="inline sm:hidden">TRANSMIT ANNOTATION</span>
                    </button>
                  </div>
                </form>

                {/* User reviews timeline */}
                <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar flex flex-col">
                  {annotations
                    .filter(ann => ann.streamId === selectedStream.id)
                    .map((ann) => (
                      <div key={ann.id} className="p-3.5 border border-white/5 bg-black/25 rounded-sm space-y-2.5 flex flex-col text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[8.5px] text-zinc-550">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => handleSeekPlayer(ann.timestampSeconds)}
                              className="text-brand font-bold bg-brand/5 border border-brand/20 px-2 py-0.5 rounded-sm cursor-pointer hover:bg-brand hover:text-white text-[9.5px]"
                            >
                              {ann.timestamp}
                            </span>
                            <span className="text-zinc-300 font-bold truncate max-w-[130px]">@{ann.userName}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleUpvoteAnnotation(ann.id)}
                            className="flex items-center justify-center gap-1.5 px-2 py-1 border border-white/5 bg-white/5 rounded-sm hover:border-brand/35 hover:text-brand transition-colors text-zinc-400 cursor-pointer text-[7.5px] font-bold font-mono w-full sm:w-auto"
                          >
                            <ThumbsUp size={10} className="shrink-0" />
                            <span>VOTES: {ann.votes}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-450 leading-relaxed font-sans select-text break-words">
                          {ann.text}
                        </p>
                      </div>
                    ))}

                  {annotations.filter(ann => ann.streamId === selectedStream.id).length === 0 && (
                    <div className="py-6 text-center text-zinc-600 font-mono text-[9px] select-none">
                      NO USER RADAR ENTRIES SECURED. TRANSMIT ONE ABOVE!
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
        )
      )}

      {/* Decorative pulse line near the status bar */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-brand/10 to-transparent pointer-events-none" />

    </div>
  );
}
