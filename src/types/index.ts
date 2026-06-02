export interface Creator {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  role: string;
  socialLinks?: Record<string, string>;
  isVerified?: boolean;
}

export type EventCategory = 'music' | 'beef' | 'legal' | 'livestream' | 'social' | 'personal' | 'investigation';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: EventCategory;
  mediaUrls?: string[];
  creatorIds?: string[];
  conflictId?: string;
  lawsuitId?: string;
  sourceLinks?: string[];
}

export interface Conflict {
  id: string;
  name: string;
  description: string;
  status: 'ongoing' | 'resolved' | 'quiet';
  participants: string[];
  heroImage?: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'link' | 'text' | 'document';
  url?: string;
  submittedBy: string;
  submitterName: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  tags?: string[];
  createdAt: string;
  aiAnalysis?: {
    summary: string;
    volatility: number;
    validityScore: number;
    extractedThemes: string[];
    narrativeImpact: string;
  };
}

export interface Lawsuit {
  id: string;
  title: string;
  description: string;
  caseNumber?: string;
  status: string;
  filings?: Array<{ date: string; title: string; link?: string }>;
  participants: string[];
}

export interface UserProfile {
  uid: string;
  username: string;
  email?: string;
  karma: number;
  isAdmin: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface DossierProfile {
  id?: string;
  name: string;
  alias?: string[];
  role: 'moderator' | 'subject' | 'community_member';
  reportedActivities: string[];
  affiliations: string[];
  status: 'active' | 'monitored' | 'pending';
  notes?: string;
  levelOfImpact: number; // 0.0 to 1.0
  submittedBy?: string;
  createdAt?: string;
}

export interface Report {
  id?: string;
  targetId: string;
  targetType: 'evidence' | 'comment';
  reason: 'copyright' | 'doxxing' | 'harassment' | 'spam' | 'other';
  details?: string;
  reporterId: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

// --- Live Stream Sync Interfaces ---
export type LiveStreamStatus = 'queued' | 'ingesting' | 'transcribing' | 'analyzing' | 'live' | 'complete';

export interface LiveStream {
  id: string;
  url: string;
  videoId: string;
  title: string;
  creatorName: string;
  category: string;
  status: LiveStreamStatus;
  createdAt: string;
  communityConsensusScore: number; // 0 to 100
  consensusAgreeCount: number;
  consensusDisagreeCount: number;
  dramaIntensity: number; // 0 to 100
  heatMapData: { time: string; intensity: number }[]; // 10 points over video duration
}

export interface LiveTranscriptChunk {
  id: string;
  streamId: string;
  timestamp: string;
  timestampSeconds: number;
  text: string;
  speaker: string;
}

export type LiveStreamEventType = 
  | 'contradiction' 
  | 'narrative_shift' 
  | 'accusation' 
  | 'denial' 
  | 'emotional_escalation' 
  | 'alliance_mention' 
  | 'repeated_talking_point' 
  | 'possible_misinformation' 
  | 'evidence_claim' 
  | 'self_contradiction' 
  | 'deflection' 
  | 'topic_pivot' 
  | 'hostile_escalation' 
  | 'audience_manipulation';

export interface LiveStreamAiEvent {
  id: string;
  streamId: string;
  timestamp: string;
  timestampSeconds: number;
  type: LiveStreamEventType;
  title: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0 to 100
  explanation: string;
  snippet: string;
  pinned?: boolean;
  userFlaggedCount?: number;
}

export interface UserAnnotation {
  id: string;
  streamId: string;
  timestamp: string;
  timestampSeconds: number;
  text: string;
  userEmail: string;
  userName: string;
  votes: number;
}

