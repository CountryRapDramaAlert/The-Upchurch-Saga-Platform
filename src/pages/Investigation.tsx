import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Activity, Search, ZoomIn, ZoomOut, Maximize, RotateCcw,
  Play, Pause, FastForward, Rewind, Info, Check, Filter, 
  MapPin, HelpCircle, Eye, FileText, Video, Link as LinkIcon, 
  Calendar, Users, BookOpen, SearchX, Pin, Trash2, ArrowRight, Sparkles, Scale
} from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { Evidence, Lawsuit, DossierProfile } from '../types';

// Extended definitions for D3 layout simulation
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'people' | 'faction' | 'media' | 'event';
  description: string;
  startYear: number;
  era: string;
  alias?: string[];
  role?: string;
  youtubeId?: string;
  associatedFactions?: string[];
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  id: string;
  source: string | SimulationNode;
  target: string | SimulationNode;
  relationship: 'Alliance' | 'Association' | 'Coverage' | 'Conflict' | 'Historical Collaboration' | 'Community Membership' | 'Media Documentation' | 'Influence' | 'Audience Overlap';
  description: string;
  startYear: number;
}

const INITIAL_NODES: Omit<SimulationNode, 'x' | 'y' | 'vx' | 'vy' | 'fx' | 'fy'>[] = [
  // PEOPLE
  {
    id: 'ru',
    name: 'Ryan Upchurch',
    type: 'people',
    description: 'Central figure of the Country Rap ecosystem. Hick-hop pioneer, owner of Hollar Hood/Creek squad. Multi-million dollar defamation verdict subject. Used a master-level viewer base to try to silence early critics like MoKoN before the scene turned.',
    startYear: 2015,
    era: '2015-Present',
    alias: ['Ryan Ashley Upchurch', 'Upchurch the Redneck', 'RHEC Outlaw'],
    role: 'Central Subject',
    associatedFactions: ['Creeksquad', 'RHEC'],
    youtubeId: 'XpDN4ZRctDM'
  },
  {
    id: 'ac',
    name: 'Adam Calhoun',
    type: 'people',
    description: 'Country-rapper, long-term collaborator, and volatile rival. Shared historic stages (collaborated on the Hoss album) but split after a massive ego and financial rift, accusing each other of being unstable or fake.',
    startYear: 2019,
    era: '2019-Present',
    alias: ['Acal'],
    role: 'Dual Rival / Challenger'
  },
  {
    id: 'mk',
    name: 'MoKoN',
    type: 'people',
    description: 'The ultimate pioneer of anti-establishment independent media in country rap. Making music since 2001, mastering multiple DAWs to run dynamic home studios independent of Nashville corporatism. Launched SeekingTheTruth News to archive deleted streams, exposing Upchurch\'s behavior in 2020 while facing initial mass backlash.',
    startYear: 2019,
    era: '2019-Present',
    alias: ['MK_Investigator', 'SeekingTheTruth News', 'MoKoN commenting'],
    role: 'OG Whistleblower',
    youtubeId: 'VAkHWmEhUr0'
  },
  {
    id: 'tt',
    name: 'Triple T',
    type: 'people',
    description: 'Operator of Triple T Channel, serving as primary music news / country rap tracker. Frequently stepped into the crosshairs to document feuds and analyze diss tracks. Crucially, Triple T and his community members were originally some of the most malicious and toxic trolls in Creek Squad, defending Ryan fiercely against MoKoN.',
    startYear: 2020,
    era: '2020-Present',
    alias: ['Triple TTT Channel', 'Triple T News'],
    role: 'Mainstream Scene Tracker / Ex-Creeksquad Troll'
  },
  {
    id: 'jt',
    name: 'WhoTFisJustinTime',
    type: 'people',
    description: 'Country rap commentator, collaborator, and backline manager. Fought in the backline war against Upchurch alongside Uncle Dubb, exposing the severe turbulence and paranoia of managing a megastar under his independent setup.',
    startYear: 2020,
    era: '2020-Present',
    alias: ['Justin Time'],
    role: 'Backline Insider & Commentator'
  },
  {
    id: 'ud',
    name: 'Uncle Dubb',
    type: 'people',
    description: 'Underground country rap manager and collaborator. Teamed with WhoTFisJustinTime to counter-vlog Ryan Upchurch after an all-out digital assault claimed they were untrustworthy gatekeepers.',
    startYear: 2018,
    era: '2018-2024',
    role: 'Underground Manager'
  },
  {
    id: 'jg',
    name: 'Johnny Gobble (Dagburn)',
    type: 'people',
    description: 'Controversial outlaw commentary personality leading Dagburn Nation. Clashed with commercial acts to debate "who actually lived the outlaw recovery life" vs playing characters on YouTube for money.',
    startYear: 2022,
    era: '2022-Present',
    alias: ['Johnny Gobble', 'GobbStoppa', 'Dagburn'],
    role: 'Outlaw Commentator'
  },
  {
    id: 'r7',
    name: 'Reaper7Man',
    type: 'people',
    description: 'Underground dark trap metal outlier mixing southern grit with intense themes. Released explicit disses against Ryan Upchurch, provoking a mass-reporting and distribution suppression campaign by Creeksquad.',
    startYear: 2021,
    era: '2021-Present',
    alias: ['REAPER7MAN'],
    role: 'Sonic Challenger'
  },
  {
    id: 'md',
    name: 'MikeyD615',
    type: 'people',
    description: 'Independent southern rap collaborator. Associated with the Tennessee/Nashville operational backend nodes (JJV / HBR) handling local video production, booking, and promotion.',
    startYear: 2020,
    era: '2020-Present',
    role: 'TN Circle Associate'
  },
  {
    id: 'db',
    name: 'Daniel Bishop',
    type: 'people',
    description: 'Independent filmmaker and director behind high-production Upchurch videos. Clashed alongside outlaw creators against overly commercialized mainstream Hick-hop adaptations.',
    startYear: 2019,
    era: '2019-2024',
    role: 'Director / Visual Creator'
  },
  {
    id: 'jr',
    name: 'Jelly Roll',
    type: 'people',
    description: 'Mainstream country rock powerhouse. Transformed from underground rap to commercial titan; faced intense gatekeeping paranoia and diss tracks ("Been Behind") from RHEC.',
    startYear: 2021,
    era: '2021-Present',
    alias: ['JellyRoll'],
    role: 'Mainstream Titan'
  },
  {
    id: 'cm',
    name: 'Chase Matthew',
    type: 'people',
    description: 'Rising country chart artist who transitioned from independent circles to major label structures, triggering RHEC accusations regarding "industry loyalty."',
    startYear: 2021,
    era: '2021-Present',
    role: 'Rising Country Star'
  },
  // Keep original legal/liability nodes as they are highly relevant
  {
    id: 'dr',
    name: 'Daniel Rodni',
    type: 'people',
    description: 'Father of teenager Kiely Rodni. Sued Upchurch for severe emotional distress and defamation, winning a landmark $6.5 million in the Nashville federal trial.',
    startYear: 2022,
    era: '2022-Present',
    role: 'Defamation Litigant'
  },
  {
    id: 'dr_rob',
    name: 'David Robertson',
    type: 'people',
    description: 'Grandfather of teenager Kiely Rodni. Awarded a historical $11 million in federal court following Upchurch\'s viral true-crime stream allegations.',
    startYear: 2022,
    era: '2022-Present',
    role: 'Defamation Litigant'
  },
  {
    id: 'sb',
    name: 'Sonny Bama',
    type: 'people',
    description: 'Alabama country rapper and longtime administrative ally who was explosively cut off in January 2026 over credit card and distribution fraud allegations.',
    startYear: 2020,
    era: '2020-Present',
    role: 'Dual Music Partner'
  },
  {
    id: 'cs',
    name: 'cmdshft',
    type: 'people',
    description: 'Independent music distributor split and sued by Upchurch in 2026. Embroiled in leaked deposition scandals and restraining orders.',
    startYear: 2020,
    era: '2020-Present',
    alias: ['cmdshft distribution'],
    role: 'Distribution Network'
  },
  {
    id: 'jl',
    name: 'Jacob LeVeille',
    type: 'people',
    description: 'Fine artist who brought a federal Visual Artists Rights Act (VARA) suit when Upchurch shot LeVeille\'s hand-made portraits with automatic gunfire on livestream.',
    startYear: 2018,
    era: '2018-2019',
    role: 'Fine Artist Plaintiff'
  },

  // FACTIONS / COMMUNITIES
  {
    id: 'rhec',
    name: 'RHEC Movement',
    type: 'faction',
    description: 'Raise Hell Eat Chicken (Redneck Nation). Controlled the largest organic viewer base on YouTube, representing Southern independence.',
    startYear: 2015,
    era: '2015-Present'
  },
  {
    id: 'creeksquad',
    name: 'Creek Squad',
    type: 'faction',
    description: 'Ryan Upchurch\'s primary defense force and inner circle. Fiercely targeted anyone labeled a "clout chaser" or "industry plant".',
    startYear: 2015,
    era: '2015-Present'
  },
  {
    id: 'jjv_circle',
    name: 'JJV / HBR Circle',
    type: 'faction',
    description: 'Operational nodes handling Tennessee/Nashville local media production, independent booking, and street-level promotion.',
    startYear: 2020,
    era: '2020-Present'
  },
  {
    id: 'dagburn_nation',
    name: 'Dagburn Nation',
    type: 'faction',
    description: 'Commentary fanbase aligned with Johnny Gobble, interacting frequently with alternative archives and anti-industry voices.',
    startYear: 2021,
    era: '2021-Present'
  },
  {
    id: 'dark_trap_outlaws',
    name: 'Dark Trap Outlaws',
    type: 'faction',
    description: 'Fringe outlaw creators blending dark trap elements with acoustic southern grit, operating parallel to the independent union.',
    startYear: 2021,
    era: '2021-Present'
  },
  {
    id: 'independent_artists',
    name: 'Independent Country-Rap Union',
    type: 'faction',
    description: 'Collaborative underground hicks-hop creators running completely on self-released albums and social promotion.',
    startYear: 2015,
    era: '2015-Present'
  },
  {
    id: 'nashville_industry',
    name: 'Nashville Industry Circles',
    type: 'faction',
    description: 'The established country music hierarchy based on Music Row. Strongly criticized for its gatekeeping rules and major label models.',
    startYear: 2015,
    era: '2015-Present'
  },

  // MEDIA NODES
  {
    id: 'seeking_truth',
    name: 'SeekingTheTruth News (MoKoN)',
    type: 'media',
    description: 'Central digital archive for deleted livestreams, IG live screen-recordings, DAW-driven exposes, and contract disputes.',
    startYear: 2019,
    era: '2019-Present'
  },
  {
    id: 'triple_t_channel',
    name: 'Triple T Channel',
    type: 'media',
    description: 'Independent Music News and Country Rap Dashboard, analyzing diss tracks and tracking grassroots facts & evidence.',
    startYear: 2020,
    era: '2020-Present'
  },

  // KEY EVENTS (ACTS AS NODES ON BOARD FOR SEAMLESS MAPPING)
  {
    id: 'vara_incident',
    name: 'VARA Gunfire Incident (2018)',
    type: 'event',
    description: 'Ryan Upchurch obliterates custom-painted portraits by Jacob LeVeille with an automatic firearm on a stream, provoking a landmark VARA federal civil rights lawsuit.',
    startYear: 2018,
    era: 'September 2018'
  },
  {
    id: 'flag_controversy',
    name: 'Luke Combs Flag Apology Clash (2021)',
    type: 'event',
    description: 'Upchurch triggers a massive culture war by attacking mainstream star Luke Combs as a sellout for apologizing over past Confederate flag displays.',
    startYear: 2021,
    era: 'February 2021'
  },
  {
    id: 'mokon_commentary_era',
    name: 'Institutional War: MoKoN vs. Ryan Upchurch (2020)',
    type: 'event',
    description: 'MoKoN steps forward as the pioneer of exposing political hypocrisy and targeted harassment in the RHEC camp, taking isolated heat from defenders who later copied his stance.',
    startYear: 2020,
    era: '2020-Present',
    youtubeId: 'VAkHWmEhUr0'
  },
  {
    id: 'reaper_spotify_attack',
    name: 'Reaper7man "FUCK CREEK SQUAD" Diss (2021)',
    type: 'event',
    description: 'Underground artist Reaper7man launches a direct lyrical attack, met with intense mass-reporting by the Creeksquad fanbase to suppress streaming.',
    startYear: 2021,
    era: 'November 2021'
  },
  {
    id: 'johnny_gobble_feud',
    name: 'Johnny Gobble & "Big LiL GobbStoppa" Feud (2022)',
    type: 'event',
    description: 'Volatility peak with Johnny Gobble leading to diss tracks and subsequent erratic TikTok rehab sponsorship offers.',
    startYear: 2022,
    era: 'April 2022'
  },
  {
    id: 'rodni_speculation',
    name: 'Kiely Rodni Disappearance Speculation (2022)',
    type: 'event',
    description: 'Ryan Upchurch outputs high-heat true-crime logs alleging family fraud on California GoFundMe pages, laying the foundation for defamation complaints.',
    startYear: 2022,
    era: 'August 2022',
    youtubeId: 'XpDN4ZRctDM'
  },
  {
    id: 'calhoun_rift_2025',
    name: 'Calhoun Alliance Shattered ("DOOIN MORE RAPPIN") (2025)',
    type: 'event',
    description: 'The 2024 peace breaks down as Upchurch reignites intense rivalries, releasing direct competitive diss tracks.',
    startYear: 2025,
    era: 'January 2025'
  },
  {
    id: 'cmdshft_split',
    name: 'cmdshft Split & Credit Card Allegations (2026)',
    type: 'event',
    description: 'In January 2026, Upchurch releases explosive Instagram reels severs ties with Sonny Bama and cmdshft over alleged MasterCard identity fraud.',
    startYear: 2026,
    era: 'January 2026',
    youtubeId: 'j2vouvpa9PI'
  },
  {
    id: 'jelly_roll_diss',
    name: 'Bunnie Xo & Jelly Roll Feud (Been Behind) (2026)',
    type: 'event',
    description: 'Upchurch questions Jelly Roll\'s industry authenticity, dropping the aggressive diss "Been Behind" targeting Jelly Roll and Bunnie Xo.',
    startYear: 2026,
    era: 'March 2026'
  },
  {
    id: 'historical_verdict',
    name: '$17.5M Federal Defamation Verdict (2026)',
    type: 'event',
    description: 'Historic Middle District TN jury verdict finding Upchurch liable for defamation, awarding $6.5M to Daniel Rodni and $11M to David Robertson.',
    startYear: 2026,
    era: 'May 19, 2026',
    youtubeId: 'y9ZThcahQCA'
  }
];

const INITIAL_LINKS: SimulationLink[] = [
  // core associations with factions
  { id: 'l_ru_rhec', source: 'ru', target: 'rhec', relationship: 'Community Membership', description: 'Ryan Upchurch founded and pioneered the Raise Hell Eat Cornbread movement.', startYear: 2015 },
  { id: 'l_ru_creeksquad', source: 'ru', target: 'creeksquad', relationship: 'Community Membership', description: 'Ryan Upchurch created and commands the Creek Squad fanbase.', startYear: 2015 },
  { id: 'l_tt_creeksquad', source: 'tt', target: 'creeksquad', relationship: 'Community Membership', description: 'Triple T and his community members were originally some of the most malicious and toxic trolls inside Creek Squad, defending Ryan Upchurch against MoKoN\'s early exposure vlogs.', startYear: 2020 },
  { id: 'l_md_jjv', source: 'md', target: 'jjv_circle', relationship: 'Association', description: 'MikeyD615 acts within the TN circle (JJV / HBR) handles regional bookings and street-promo.', startYear: 2020 },
  { id: 'l_md_ind_art', source: 'md', target: 'independent_artists', relationship: 'Community Membership', description: 'MikeyD615 collaborates with underground country rap circles.', startYear: 2020 },

  // vara incident (2018)
  { id: 'l_ru_jl', source: 'ru', target: 'jl', relationship: 'Conflict', description: 'Destruction of hand-painted portrait paintings leads to VARA legal fallout.', startYear: 2018 },
  { id: 'l_ru_vara_inc', source: 'ru', target: 'vara_incident', relationship: 'Conflict', description: 'Blasts portraits with automatic rifle on camera.', startYear: 2018 },
  { id: 'l_jl_vara_inc', source: 'jl', target: 'vara_incident', relationship: 'Alliance', description: 'Plaintiff fine-artist suing over painting destruction.', startYear: 2018 },

  // early rapper rifts (2019-2021)
  { id: 'l_ru_ac', source: 'ru', target: 'ac', relationship: 'Historical Collaboration', description: 'Superb country-rap collaborators on the "Hoss" album whose friendship ruptured over extreme rifts, ego, and cultural Southern claims.', startYear: 2019 },
  { id: 'l_ac_creeksquad', source: 'ac', target: 'creeksquad', relationship: 'Alliance', description: 'Adam Calhoun establishes dual alignment with Creek Squad fans initially.', startYear: 2019 },
  { id: 'l_ac_ind_art', source: 'ac', target: 'independent_artists', relationship: 'Community Membership', description: 'Adam Calhoun stands as a core pillar of the independent hick-hop circle.', startYear: 2019 },
  { id: 'l_ud_ind_art', source: 'ud', target: 'independent_artists', relationship: 'Community Membership', description: 'Uncle Dubb collaborates heavily in independent underground rap.', startYear: 2018 },
  { id: 'l_ru_ud', source: 'ru', target: 'ud', relationship: 'Conflict', description: 'Upchurch launched an all-out digital assault, accusing Uncle Dubb of being an untrustworthy gatekeeper manipulating smaller artists.', startYear: 2018 },
  { id: 'l_ru_db', source: 'ru', target: 'db', relationship: 'Association', description: 'Daniel Bishop films and directs multiple high-heat music videos.', startYear: 2019 },

  // Combs & flag debate (2021)
  { id: 'l_ru_flag_con', source: 'ru', target: 'flag_controversy', relationship: 'Conflict', description: 'Criticizes Luke Combs for flag apology, defending RHEC branding.', startYear: 2021 },
  { id: 'l_creeksquad_flag_con', source: 'creeksquad', target: 'flag_controversy', relationship: 'Audience Overlap', description: 'Fans mobilize to support outpatient Outlaw branding.', startYear: 2021 },

  // mokon whistleblower epoch (2021)
  { id: 'l_ru_mk', source: 'ru', target: 'mk', relationship: 'Conflict', description: 'Institutional War: MoKoN vs. Ryan Upchurch & The Retrospective Hypocrisy. MoKoN called out Ryan\'s behavior in 2020 while facing heavy backlash.', startYear: 2019 },
  { id: 'l_mk_mokon_ev', source: 'mk', target: 'mokon_commentary_era', relationship: 'Alliance', description: 'Mokon defends truth-checking commentary reports against a massive network of attackers who later copied his stance.', startYear: 2020 },
  { id: 'l_ru_mokon_ev', source: 'ru', target: 'mokon_commentary_era', relationship: 'Conflict', description: 'Ryan blockades comments and initiates smear campaigns alongside Creeksquad fan bases.', startYear: 2020 },
  { id: 'l_tt_triple_t', source: 'tt', target: 'triple_t_channel', relationship: 'Community Membership', description: 'Commentator Triple T runs the Triple T evidence hub tracking grassroots country rap news.', startYear: 2020 },
  { id: 'l_mk_tt_ch', source: 'mk', target: 'triple_t_channel', relationship: 'Conflict', description: 'Vocal conflict; Triple T and his community members originally acted as the most toxic trolls in Creeksquad aggressively trying to silence MoKoN.', startYear: 2020 },
  { id: 'l_jt_tt_ch', source: 'jt', target: 'triple_t_channel', relationship: 'Coverage', description: 'Justin Time participates in commentary circles reviewing raw video feeds.', startYear: 2020 },
  { id: 'l_ru_jt', source: 'ru', target: 'jt', relationship: 'Conflict', description: 'RHEC launched digital assault accusing Justin Time of manipulation; Justin counter vlogged exposing working behind-the-scenes hurdles.', startYear: 2020 },

  // reaper attack (2021)
  { id: 'l_ru_r7', source: 'ru', target: 'r7', relationship: 'Conflict', description: 'Ryan Upchurch responds in viral social media tirades to Reaper\'s diss track.', startYear: 2021 },
  { id: 'l_r7_attack', source: 'r7', target: 'reaper_spotify_attack', relationship: 'Alliance', description: 'Reaper7man releases explicit "FUCK CREEK SQUAD" diss on Spotify, trying to dismantle Ryan\'s "G.O.A.T." status.', startYear: 2021 },
  { id: 'l_ru_r7_attack', source: 'ru', target: 'reaper_spotify_attack', relationship: 'Conflict', description: 'Target of the explicit Creek Squad country rap diss.', startYear: 2021 },
  { id: 'l_creeksquad_r7', source: 'creeksquad', target: 'r7', relationship: 'Conflict', description: 'Creeksquad fan base flooded comments and systematically suppressed Reaper7man\'s distribution through mass-reporting.', startYear: 2021 },

  // gobbstoppa & rehab (2022)
  { id: 'l_ru_jg', source: 'ru', target: 'jg', relationship: 'Conflict', description: 'Volatile digital clash leading to the "Big LiL GobbStoppa" diss track.', startYear: 2022 },
  { id: 'l_jg_nation', source: 'jg', target: 'dagburn_nation', relationship: 'Community Membership', description: 'Johnny Gobble leads Dagburn Nation channels, fighting Hick-Hop commercialization.', startYear: 2022 },
  { id: 'l_jg_feud', source: 'jg', target: 'johnny_gobble_feud', relationship: 'Conflict', description: 'Sparks extensive online feuding across TikTok and YouTube over who "actually lived the outlaw life" vs playing a character.', startYear: 2022 },
  { id: 'l_ru_jg_feud', source: 'ru', target: 'johnny_gobble_feud', relationship: 'Conflict', description: 'Releases diss track, later offering Cumberland Heights rehab treatment.', startYear: 2022 },

  // rodni timeline (2022 -> 2026)
  { id: 'l_ru_dr', source: 'ru', target: 'dr', relationship: 'Conflict', description: 'Ryan accuses father Daniel Rodni of hoax and fraud in late night livestreams.', startYear: 2022 },
  { id: 'l_ru_dr_rob', source: 'ru', target: 'dr_rob', relationship: 'Conflict', description: 'Criticizes grandfather David Robertson over GoFundMe true crime campaigns.', startYear: 2022 },
  { id: 'l_seeking_dr', source: 'seeking_truth', target: 'dr', relationship: 'Media Documentation', description: 'News outlets document the family search efforts.', startYear: 2022 },
  { id: 'l_seeking_rodni_spec', source: 'seeking_truth', target: 'rodni_speculation', relationship: 'Coverage', description: 'Alternative true crime news streams report on Upchurch claims.', startYear: 2022 },
  { id: 'l_ru_rodni_spec', source: 'ru', target: 'rodni_speculation', relationship: 'Conflict', description: 'Ryan broadcasts continuous true-crime conspiracies to 3M+ followers.', startYear: 2022 },
  { id: 'l_dr_rodni_spec', source: 'dr', target: 'rodni_speculation', relationship: 'Conflict', description: 'Defamend by streams alleging false searches.', startYear: 2022 },
  { id: 'l_dr_rob_rodni_spec', source: 'dr_rob', target: 'rodni_speculation', relationship: 'Conflict', description: 'Subject of true crime fundraising hoax accusations.', startYear: 2022 },

  // secondary mainstream fallouts (2021 -> present)
  { id: 'l_ru_jr', source: 'ru', target: 'jr', relationship: 'Conflict', description: 'Severe criticism targeting Jelly Roll for major label signing. Shifting alliances triggered paranoia within RHEC regarding corporate authenticity.', startYear: 2021 },
  { id: 'l_jr_nashville', source: 'jr', target: 'nashville_industry', relationship: 'Community Membership', description: 'Jelly Roll achieves major Nashville mainstream country and rock successes, avoiding petty vlog wars.', startYear: 2021 },
  { id: 'l_ru_cm', source: 'ru', target: 'cm', relationship: 'Conflict', description: 'Friction following Chase Matthew\'s mainstream label signing trajectory.', startYear: 2021 },
  { id: 'l_ru_jelly_diss', source: 'ru', target: 'jelly_roll_diss', relationship: 'Conflict', description: 'Drops the direct diss track "Been Behind" targeting Jelly and Bunnie Xo.', startYear: 2026 },
  { id: 'l_jr_jelly_diss', source: 'jr', target: 'jelly_roll_diss', relationship: 'Conflict', description: 'Target of the critical "Been Behind" authenticity challenge.', startYear: 2026 },

  // calhoun 2025 rift
  { id: 'l_ru_cal_rift', source: 'ru', target: 'calhoun_rift_2025', relationship: 'Conflict', description: 'Peace accords break down completely, launching DOOIN MORE RAPPIN fury.', startYear: 2025 },
  { id: 'l_ac_cal_rift', source: 'ac', target: 'calhoun_rift_2025', relationship: 'Conflict', description: 'Responds with heavy-hitting country-rap diss bars.', startYear: 2025 },

  // management disputes & cmdshft royalty split (2026)
  { id: 'l_ru_sb', source: 'ru', target: 'sb', relationship: 'Historical Collaboration', description: 'Longtime Alabama country rap partner, split aggressively in Jan 2026.', startYear: 2020 },
  { id: 'l_ru_cs', source: 'ru', target: 'cs', relationship: 'Association', description: 'Administrative royalty distribution client, split in 2026.', startYear: 2020 },
  { id: 'l_sb_cs', source: 'sb', target: 'cs', relationship: 'Alliance', description: 'Jointly criticized by Upchurch as colluding distributors.', startYear: 2020 },
  { id: 'l_ru_cmd_split', source: 'ru', target: 'cmdshft_split', relationship: 'Conflict', description: 'Severes administrative ties via hostile Instagram video reels.', startYear: 2026 },
  { id: 'l_sb_cmd_split', source: 'sb', target: 'cmdshft_split', relationship: 'Conflict', description: 'Accused of perjury, fraud, and credit card identity tampering.', startYear: 2026 },
  { id: 'l_cs_cmd_split', source: 'cs', target: 'cmdshft_split', relationship: 'Conflict', description: 'Accused of evidence tampering and misappropriating royalty accounts.', startYear: 2026 },

  // 17.5M Defamation jury verdict (May 2026)
  { id: 'l_ru_hist_verd', source: 'ru', target: 'historical_verdict', relationship: 'Conflict', description: 'Found fully liable for defamation and intentional infliction of emotional distress.', startYear: 2026 },
  { id: 'l_dr_hist_verd', source: 'dr', target: 'historical_verdict', relationship: 'Alliance', description: 'Awarded $6.5 million in damages for emotional distress.', startYear: 2026 },
  { id: 'l_dr_rob_hist_verd', source: 'dr_rob', target: 'historical_verdict', relationship: 'Alliance', description: 'Awarded $11 million in damages for systematic defamation.', startYear: 2026 }
];

const NODE_THEMES: Record<string, { border: string; bg: string; text: string; glow: string; label: string }> = {
  people: {
    border: 'border-red-500/50',
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    glow: 'rgba(239, 68, 68, 0.4)',
    label: 'PERSON'
  },
  faction: {
    border: 'border-green-500/50',
    bg: 'bg-green-950/40',
    text: 'text-green-400',
    glow: 'rgba(34, 197, 94, 0.4)',
    label: 'FACTION'
  },
  media: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    glow: 'rgba(59, 130, 246, 0.4)',
    label: 'MEDIA'
  },
  event: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-950/40',
    text: 'text-orange-400',
    glow: 'rgba(249, 115, 22, 0.4)',
    label: 'EVENT / CASE'
  }
};

const RELATIONSHIP_THEMES: Record<string, { stroke: string; strokeWidth: number; dashArray?: string }> = {
  'Alliance': { stroke: '#22c55e', strokeWidth: 3 }, // Solid vibrant green
  'Association': { stroke: '#3b82f6', strokeWidth: 2, dashArray: '5,5' }, // Dotted blue
  'Coverage': { stroke: '#0ea5e9', strokeWidth: 2, dashArray: '3,3' }, // Finely dotted cyan
  'Conflict': { stroke: '#ef4444', strokeWidth: 4 }, // Thick solid crimson red
  'Historical Collaboration': { stroke: '#eab308', strokeWidth: 2.5 }, // Yellow gold
  'Community Membership': { stroke: '#10b981', strokeWidth: 2.5 }, // Teal green
  'Media Documentation': { stroke: '#a855f7', strokeWidth: 2, dashArray: '6,4' }, // Purple dashed
  'Influence': { stroke: '#f43f5e', strokeWidth: 2, dashArray: '4,4' }, // Rose dashed
  'Audience Overlap': { stroke: '#d946ef', strokeWidth: 1.5, dashArray: '2,4' } // Magenta fine dots
};

interface MatrixRow {
  target: string;
  nodeId: string;
  faction: string;
  media: string;
  partner: string;
  weapon: string;
  note: string;
}

const MASTER_MATRIX: MatrixRow[] = [
  {
    target: 'MoKoN (SeekingTheTruth)',
    nodeId: 'mk',
    faction: 'Self-Contained Independent',
    media: 'Self-Operated',
    partner: 'Ryan Upchurch & 2020 Defenders',
    weapon: 'DAW-driven independent studio videos / Live Archive Exposés',
    note: 'The OG Whistleblower: Called out Upchurch in 2020 while facing mass backlash from people who now copy his stance.'
  },
  {
    target: 'Ryan Upchurch',
    nodeId: 'ru',
    faction: 'RHEC / Creeksquad',
    media: 'Triple T',
    partner: 'MoKoN / Adam Calhoun / Justin Time',
    weapon: '30-Minute Livestreams / Diss Tracks',
    note: 'The Monopoly: Used a massive fan wave to try to silence early critics like MoKoN before the scene turned.'
  },
  {
    target: 'Adam Calhoun',
    nodeId: 'ac',
    faction: 'Independent',
    media: 'SeekingTheTruth',
    partner: 'Ryan Upchurch',
    weapon: 'Calculated Call-out Vlogs',
    note: 'Later-stage challenger who shifted away from the RHEC alliance.'
  },
  {
    target: 'WhoTFisJustinTime',
    nodeId: 'jt',
    faction: 'Independent',
    media: 'SeekingTheTruth',
    partner: 'RHEC Crew',
    weapon: 'Behind-the-scenes Contract Exposés',
    note: 'Exposed infrastructure flaws that validated MoKoN\'s early reports.'
  },
  {
    target: 'Johnny Gobble (Dagburn)',
    nodeId: 'jg',
    faction: 'Underground',
    media: 'Commercial Hick-Hop Acts',
    partner: 'Dagburn Nation',
    weapon: '"Brutal Honesty" Vlogs / Acapella Bars',
    note: 'Anti-industry voice operating parallel to MoKoN’s independent ethos.'
  },
  {
    target: 'Reaper7Man',
    nodeId: 'r7',
    faction: 'Dark Trap Outlaws',
    media: 'Independent',
    partner: 'Ryan Upchurch',
    weapon: 'Underground Diss Audio Tracks',
    note: 'Direct sonic challenger targeting the RHEC hierarchy.'
  },
  {
    target: 'Triple T',
    nodeId: 'tt',
    faction: 'Independent News',
    media: 'Self',
    partner: 'Faction Fanbases',
    weapon: 'Narrative Breakdown Videos',
    note: 'Mainstream scene tracker that documented the fallout of MoKoN\'s early exposures. Crucially, Triple T and his community members were some of the most malicious and toxic trolls inside Creek Squad, defending Ryan fiercely against MoKoN.'
  }
];

export default function Investigation() {
  // SVG and Container refs for D3 graph positioning
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomGRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);

  // Database hook loads items dynamically
  const { data: dbEvidence } = useFirestoreCollection<Evidence>('evidence');
  const { data: dbLawsuits } = useFirestoreCollection<Lawsuit>('lawsuits');
  const { data: dbDossier } = useFirestoreCollection<DossierProfile>('dossier');

  // Interactive controls state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<SimulationNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<SimulationLink | null>(null);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // Path Finder states
  const [pathSource, setPathSource] = useState<string>('');
  const [pathTarget, setPathTarget] = useState<string>('');
  const [shortestPathData, setShortestPathData] = useState<{ nodes: string[]; links: string[] } | null>(null);

  // Layout pin records stored in LocalStorage for persistence
  const [pinnedNodeIds, setPinnedNodeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('investigation_pinned_nodes_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedLayouts, setSavedLayouts] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('investigation_saved_coordinates_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Multiselect filters
  const [filterTypes, setFilterTypes] = useState<string[]>(['people', 'faction', 'media', 'event']);
  const [filterRelations, setFilterRelations] = useState<string[]>([
    'Alliance', 'Association', 'Coverage', 'Conflict', 'Historical Collaboration', 
    'Community Membership', 'Media Documentation', 'Influence', 'Audience Overlap'
  ]);

  // Dimensions of SVG canvas responsive observer
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.max(400, entry.contentRect.width),
          height: Math.max(300, entry.contentRect.height)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync pinned list with LocalStorage
  useEffect(() => {
    localStorage.setItem('investigation_pinned_nodes_v1', JSON.stringify(pinnedNodeIds));
  }, [pinnedNodeIds]);

  // Timeline slider automatic player
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setSelectedYear((prev) => {
          if (prev >= 2026) {
            return 2018; // loop rewind
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  // BFS solver for dynamic shortest path visualization
  useEffect(() => {
    if (!pathSource || !pathTarget) {
      setShortestPathData(null);
      return;
    }

    // Graph definition based strictly on active filters and current year
    const activeNodeIds = new Set(INITIAL_NODES
      .filter(n => n.startYear <= selectedYear && filterTypes.includes(n.type))
      .map(n => n.id));

    const activeLinks = INITIAL_LINKS.filter(l => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;
      return l.startYear <= selectedYear && 
             activeNodeIds.has(sId) && 
             activeNodeIds.has(tId) && 
             filterRelations.includes(l.relationship);
    });

    // Solve BFS
    const adj: Record<string, Array<{ target: string; linkId: string }>> = {};
    INITIAL_NODES.forEach(n => { adj[n.id] = []; });
    activeLinks.forEach(l => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;
      adj[sId].push({ target: tId, linkId: l.id });
      adj[tId].push({ target: sId, linkId: l.id });
    });

    const queue: string[] = [pathSource];
    const visited = new Set<string>([pathSource]);
    const parent: Record<string, { parentNode: string; viaLink: string } | null> = { [pathSource]: null };

    let found = false;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === pathTarget) {
        found = true;
        break;
      }
      for (const edge of adj[curr] || []) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          parent[edge.target] = { parentNode: curr, viaLink: edge.linkId };
          queue.push(edge.target);
        }
      }
    }

    if (found) {
      const pathNodes: string[] = [];
      const pathLinks: string[] = [];
      let temp = pathTarget;
      pathNodes.push(temp);
      while (parent[temp] !== null && parent[temp] !== undefined) {
        const edge = parent[temp]!;
        pathLinks.push(edge.viaLink);
        temp = edge.parentNode;
        pathNodes.push(temp);
      }
      setShortestPathData({
        nodes: pathNodes.reverse(),
        links: pathLinks.reverse()
      });
    } else {
      setShortestPathData({ nodes: [], links: [] }); // represent disconnected
    }
  }, [pathSource, pathTarget, selectedYear, filterTypes, filterRelations]);

  // Filter computation for layout simulation
  const processedNodes = useMemo(() => {
    // 1. Filter by slider timeline range
    let result = INITIAL_NODES.map(node => {
      // Restore coordinates from local storage if saved previously
      const savedCoord = savedLayouts[node.id];
      const copy: SimulationNode = {
        ...node,
        x: savedCoord ? savedCoord.x : undefined,
        y: savedCoord ? savedCoord.y : undefined,
      };

      // Apply fixed coordinates if user has pinned a node
      if (pinnedNodeIds.includes(node.id)) {
        copy.fx = savedCoord ? savedCoord.x : (dimensions.width / 2);
        copy.fy = savedCoord ? savedCoord.y : (dimensions.height / 2);
      } else {
        copy.fx = undefined;
        copy.fy = undefined;
      }
      return copy;
    });

    // 2. Filter by selected elements
    result = result.filter(n => n.startYear <= selectedYear);

    // 3. Filter by multi-select checkboxes
    result = result.filter(n => filterTypes.includes(n.type));

    return result;
  }, [selectedYear, filterTypes, pinnedNodeIds, savedLayouts, dimensions.width]);

  const processedLinks = useMemo(() => {
    // Ensure nodes exist in processed nodes
    const nodeIdMap = new Set(processedNodes.map(n => n.id));

    return INITIAL_LINKS
      .filter(l => l.startYear <= selectedYear && filterRelations.includes(l.relationship))
      .filter(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        return nodeIdMap.has(sId) && nodeIdMap.has(tId);
      })
      .map(l => ({ ...l })); // deep clone links for D3 simulation
  }, [processedNodes, selectedYear, filterRelations]);

  // Setup the D3 Simulation
  useEffect(() => {
    if (!svgRef.current || processedNodes.length === 0) return;

    const { width, height } = dimensions;

    const simulation = d3.forceSimulation<SimulationNode>(processedNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(processedLinks)
        .id(d => d.id)
        .distance(160)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45))
      .alphaDecay(0.04);

    simulationRef.current = simulation;

    // Tick listener
    simulation.on('tick', () => {
      // Re-trigger layout draws through D3 select updates
      const svg = d3.select(svgRef.current);

      svg.selectAll('.link-el')
        .data(processedLinks)
        .attr('x1', d => (d.source as SimulationNode).x ?? 0)
        .attr('y1', d => (d.source as SimulationNode).y ?? 0)
        .attr('x2', d => (d.target as SimulationNode).x ?? 0)
        .attr('y2', d => (d.target as SimulationNode).y ?? 0);

      svg.selectAll('.link-label-el')
        .data(processedLinks)
        .attr('transform', d => {
          const s = d.source as SimulationNode;
          const t = d.target as SimulationNode;
          const x = ((s.x ?? 0) + (t.x ?? 0)) / 2;
          const y = ((s.y ?? 0) + (t.y ?? 0)) / 2;
          return `translate(${x}, ${y})`;
        });

      svg.selectAll('.node-el')
        .data(processedNodes)
        .attr('transform', d => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    // Add drag-and-drop mechanics to the nodes
    const svg = d3.select(svgRef.current);

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .on('zoom', (event) => {
        d3.select(zoomGRef.current).attr('transform', event.transform);
      });

    svg.call(zoom);

    return () => {
      simulation.stop();
    };
  }, [processedNodes, processedLinks, dimensions]);

  // Zoom helpers
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom().scaleBy as any, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom().scaleBy as any, 1 / 1.3);
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom().transform as any, d3.zoomIdentity);
  };

  // Node pinning layout saves coordinates to local state
  const handlePinNode = (nodeId: string, x: number, y: number) => {
    setPinnedNodeIds(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });

    setSavedLayouts(prev => {
      const updated = { ...prev, [nodeId]: { x, y } };
      localStorage.setItem('investigation_saved_coordinates_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnpinAll = () => {
    setPinnedNodeIds([]);
    setSavedLayouts({});
    localStorage.removeItem('investigation_saved_coordinates_v1');
    localStorage.removeItem('investigation_pinned_nodes_v1');
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  const handleNodeDragStart = (event: any, d: SimulationNode) => {
    if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.2).restart();
    d.fx = d.x;
    d.fy = d.y;
  };

  const handleNodeDragEnd = (event: any, d: SimulationNode) => {
    if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
    
    const isPinned = pinnedNodeIds.includes(d.id);
    if (!isPinned) {
      d.fx = undefined;
      d.fy = undefined;
    } else {
      // Save position
      setSavedLayouts(prev => {
        const updated = { ...prev, [d.id]: { x: d.x ?? 0, y: d.y ?? 0 } };
        localStorage.setItem('investigation_saved_coordinates_v1', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleNodeDrag = (event: any, d: SimulationNode) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  // Dynamic D3 layout dragger hooks
  useEffect(() => {
    if (!svgRef.current || processedNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    
    svg.selectAll<SVGGElement, SimulationNode>('.node-el')
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on('start', handleNodeDragStart)
        .on('drag', handleNodeDrag)
        .on('end', handleNodeDragEnd)
      );
  }, [processedNodes]);

  // Dynamic panel tracer query values
  const relativeDbRecords = useMemo(() => {
    if (!selectedNode && !selectedLink) return { evidence: [], lawsuits: [], dossiers: [] };

    const searchStr = selectedNode 
      ? selectedNode.name.toLowerCase() 
      : `${(selectedLink?.source as SimulationNode)?.name || ''} ${(selectedLink?.target as SimulationNode)?.name || ''}`.toLowerCase();

    // Query elements
    const matchedEvidence = (dbEvidence || []).filter(item => {
      const matchText = `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
      return matchText.includes(searchStr) || (selectedNode && selectedNode.alias?.some(a => matchText.includes(a.toLowerCase())));
    });

    const matchedLawsuits = (dbLawsuits || []).filter(item => {
      const matchText = `${item.title} ${item.description} ${(item.participants || []).join(' ')}`.toLowerCase();
      return matchText.includes(searchStr) || (selectedNode && selectedNode.alias?.some(a => matchText.includes(a.toLowerCase())));
    });

    const matchedDossiers = (dbDossier || []).filter(item => {
      const matchText = `${item.name} ${(item.alias || []).join(' ')} ${(item.reportedActivities || []).join(' ')} ${(item.notes || '')}`.toLowerCase();
      return matchText.includes(searchStr) || (selectedNode && selectedNode.alias?.some(a => matchText.includes(a.toLowerCase())));
    });

    return {
      evidence: matchedEvidence,
      lawsuits: matchedLawsuits,
      dossiers: matchedDossiers
    };
  }, [selectedNode, selectedLink, dbEvidence, dbLawsuits, dbDossier]);

  // Filtering search outcomes index
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return INITIAL_NODES
      .filter(n => n.startYear <= selectedYear)
      .filter(n => n.name.toLowerCase().includes(lower) || n.description.toLowerCase().includes(lower) || n.alias?.some(a => a.toLowerCase().includes(lower)));
  }, [searchQuery, selectedYear]);

  // Center visual look on clicked searchable match
  const handleSelectSearchResult = (node: SimulationNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
    setSearchQuery('');
  };

  return (
    <div className="absolute inset-0 bg-[#07070a] text-zinc-300 flex flex-col font-sans overflow-hidden z-20">
      
      {/* HUD Bar */}
      <div className="h-14 border-b border-white/5 bg-black/60 flex items-center justify-between px-6 z-30 font-mono text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-sm bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-500 animate-pulse">
            <ShieldAlert size={14} />
          </div>
          <div>
            <h1 className="font-display font-black tracking-[0.25em] text-white uppercase text-xs">INVESTIGATION_MODE</h1>
            <p className="text-[8px] text-zinc-500 leading-none">INTEL ANALYSIS HARDWARE PROTOCOL</p>
          </div>
        </div>

        {/* Playback & Year slider dashboard */}
        <div className="hidden md:flex items-center gap-4 bg-zinc-950/80 px-4 py-1.5 border border-white/5 rounded-sm">
          <div className="flex items-center gap-1 border-r border-white/10 pr-4">
            <button 
              onClick={() => setSelectedYear(2018)}
              className="p-1 hover:text-white transition-colors"
              title="Rewind to 2018"
            >
              <Rewind size={14} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-sm bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 hover:text-orange-300 transition-all cursor-pointer"
              title={isPlaying ? "Pause playback" : "Replay History (2018-2026)"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button 
              onClick={() => setSelectedYear(2026)}
              className="p-1 hover:text-white transition-colors"
              title="Fast Forward to 2026"
            >
              <FastForward size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-zinc-500 font-mono tracking-widest uppercase">ACTIVE ERA:</span>
            <input 
              type="range"
              min={2018}
              max={2026}
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-40 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <span className="bg-orange-600/10 px-2 py-0.5 border border-orange-500/20 text-orange-400 font-bold tracking-widest text-[11px] rounded-sm">
              {selectedYear === 2026 ? "PRESENT (2026)" : selectedYear}
            </span>
          </div>
        </div>

        {/* Floating System coordinates stats */}
        <div className="flex items-center gap-4">
          <span className="hidden lg:inline text-[9px] text-zinc-600 tracking-wider">
            NODES ACTIVE: {processedNodes.length}/{INITIAL_NODES.length}
          </span>
          <button 
            onClick={() => setShowMatrix(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/25 border border-blue-900/30 hover:bg-blue-600/30 hover:text-white text-blue-400 text-[9px] font-bold uppercase transition-all rounded-sm cursor-pointer"
            title="Open Cross-Reference Master Conflict Matrix Layout"
          >
            <Scale size={11} />
            <span>MASTER MATRIX</span>
          </button>
          <button 
            onClick={handleUnpinAll}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-950/20 border border-red-900/30 hover:bg-brand hover:border-brand text-brand hover:text-white text-[9px] font-bold uppercase transition-all rounded-sm cursor-pointer"
            title="Clear all locked gravity coordinates"
          >
            <RotateCcw size={10} />
            <span>RESET GRIDS</span>
          </button>
        </div>
      </div>

      {/* Main Panel space */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Left Side: Control & Calculator Desk */}
        <div className="w-full lg:w-80 border-r border-white/5 bg-black/40 backdrop-blur-md flex flex-col z-20 shrink-0 select-none overflow-y-auto no-scrollbar">
          
          {/* Search Box */}
          <div className="p-5 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Search size={12} /> Search Archive Index
            </h3>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search people, communities, cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-sm py-2 px-3 pl-8 text-[11px] text-zinc-200 focus:border-orange-500/60 outline-none transition-all font-mono"
              />
              <Search className="absolute left-2.5 top-2.5 text-zinc-600" size={12} />
            </div>

            {/* Float Search items outcome list */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-4 right-4 mt-2 bg-zinc-950 border border-white/10 rounded-sm shadow-xl p-2 max-h-56 overflow-y-auto no-scrollbar z-50 text-[10px] font-mono leading-relaxed"
                >
                  <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1.5 px-1.5">MATCHED DATA ({searchResults.length})</p>
                  {searchResults.map(match => {
                    const theme = NODE_THEMES[match.type];
                    return (
                      <button 
                        key={match.id}
                        onClick={() => handleSelectSearchResult(match as SimulationNode)}
                        className="w-full text-left p-1.5 rounded-sm hover:bg-white/5 flex items-center justify-between text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <span className="truncate pr-2 font-bold uppercase">{match.name}</span>
                        <span className={`text-[7px] border px-1 ${theme.border} ${theme.text} shrink-0`}>
                          {theme.label}
                        </span>
                      </button>
                    );
                  })}
                  {searchResults.length === 0 && (
                    <div className="p-4 text-center text-zinc-700 flex flex-col items-center gap-2">
                      <SearchX size={16} />
                      <span>NO ARCHIVED LOG FOUND</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shortest Path finder box */}
          <div className="p-5 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles size={12} className="text-orange-400" /> Relational Path Tracer
            </h3>
            <p className="text-[9px] text-zinc-600 mb-4 font-mono leading-normal">
              Detect and compute the shortest documented chain between two entities.
            </p>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[8px] text-zinc-600 tracking-wider block mb-1">ORIGIN NODE</label>
                <select 
                  value={pathSource}
                  onChange={(e) => setPathSource(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-[10px] text-zinc-300 py-1.5 px-2 outline-none focus:border-orange-500/60 rounded-sm"
                >
                  <option value="">-- CHOOSE SOURCE --</option>
                  {processedNodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[8px] text-zinc-600 tracking-wider block mb-1">DESTINATION TARGET</label>
                <select 
                  value={pathTarget}
                  onChange={(e) => setPathTarget(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-[10px] text-zinc-300 py-1.5 px-2 outline-none focus:border-orange-500/60 rounded-sm"
                >
                  <option value="">-- CHOOSE TARGET --</option>
                  {processedNodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              {pathSource && pathTarget && (
                <div className="mt-3 p-3 bg-orange-950/10 border border-orange-500/20 rounded-sm space-y-2">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-zinc-500 tracking-widest">TRACING CHAIN:</span>
                    <button 
                      onClick={() => { setPathSource(''); setPathTarget(''); }}
                      className="text-orange-400 hover:underline hover:text-orange-300"
                    >
                      CLEAR PATH
                    </button>
                  </div>

                  {shortestPathData ? (
                    shortestPathData.nodes.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                          {shortestPathData.nodes.map((nId, idx) => {
                            const node = INITIAL_NODES.find(n => n.id === nId);
                            return (
                              <React.Fragment key={nId}>
                                <button
                                  onClick={() => {
                                    const n = processedNodes.find(pn => pn.id === nId);
                                    if (n) setSelectedNode(n);
                                  }}
                                  className="font-bold text-white hover:text-orange-400 underline decoration-orange-500/50"
                                >
                                  {node?.name}
                                </button>
                                {idx < shortestPathData.nodes.length - 1 && (
                                  <ArrowRight size={10} className="text-zinc-600 inline" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <p className="text-[8px] text-zinc-500 italic font-mono leading-normal pt-1 border-t border-white/5 uppercase">
                          Path length: {shortestPathData.nodes.length - 1} steps. Trace highlighted on map in glowing orange.
                        </p>
                      </div>
                    ) : (
                      <div className="p-1 px-2 border border-red-500/20 bg-red-950/10 text-[8px] text-red-400 text-center uppercase tracking-wider leading-relaxed">
                        No direct documented path exists under current time filter! Choose different timeline.
                      </div>
                    )
                  ) : (
                    <div className="text-[9px] text-zinc-500 animate-pulse text-center">Calculating matrix path...</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filtering system */}
          <div className="p-5 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Filter size={12} /> ENTITY CLASSIFICATION
              </h3>
              <div className="space-y-2">
                {Object.entries(NODE_THEMES).map(([type, theme]) => {
                  const active = filterTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-sm border transition-all text-left font-mono text-[10px] cursor-pointer ${
                        active ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-transparent border-dashed border-white/5 text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${active ? theme.text.replace('text-', 'bg-') : 'bg-zinc-800'}`} />
                        <span>{theme.label}S</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-orange-500' : 'border-zinc-800'}`}>
                        {active && <Check size={10} className="text-orange-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Scale size={12} /> RELATIONSHIP RULES
              </h3>
              <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar font-mono text-[9px]">
                {Object.keys(RELATIONSHIP_THEMES).map(rel => {
                  const active = filterRelations.includes(rel);
                  const stroke = RELATIONSHIP_THEMES[rel].stroke;
                  return (
                    <button
                      key={rel}
                      onClick={() => {
                        setFilterRelations(prev => prev.includes(rel) ? prev.filter(r => r !== rel) : [...prev, rel]);
                      }}
                      className={`w-full flex items-center justify-between p-2 hover:bg-zinc-950 transition-colors text-left cursor-pointer ${
                        active ? 'text-zinc-300' : 'text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-4 h-0.5" style={{ backgroundColor: stroke }} />
                        <span className="truncate uppercase">{rel}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${active ? 'border-orange-500 text-orange-500' : 'border-zinc-800'}`}>
                        {active && <Check size={8} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Center: Graph Canvas Area */}
        <div ref={containerRef} className="flex-1 relative bg-[radial-gradient(ellipse_at_center,rgba(18,18,24,1)_0%,rgba(7,7,9,1)_100%)] h-full overflow-hidden">
          
          {/* CRT scanline grids */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] cinematic-grid select-none" />

          {/* Interactive instruction floating tooltip */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 font-mono text-[8px] bg-black/70 border border-white/5 p-3 rounded-sm leading-relaxed text-zinc-500 select-none max-w-xs">
            <span className="text-zinc-400 font-bold tracking-widest uppercase mb-1">TACTICAL RECON INSTRUCTIONS:</span>
            <span>• DRAG nodes to adjust forces gravity mapping.</span>
            <span>• DOUBLE CLICK nodes to Lock/Unlock (Pin position).</span>
            <span>• CLICK nodes or pathways to decrypt evidence files.</span>
            <span>• ZOOM using mousewheel/touch-pinch.</span>
          </div>

          {/* Float Canvas Zoom utilities */}
          <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 text-zinc-400 font-mono text-[10px]">
            <button 
              onClick={handleZoomIn}
              className="p-2 border border-white/10 bg-black/60 rounded-sm hover:bg-white/5 hover:text-white transition-all"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-2 border border-white/10 bg-black/60 rounded-sm hover:bg-white/5 hover:text-white transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button 
              onClick={handleResetZoom}
              className="p-2 border border-white/10 bg-black/60 rounded-sm hover:bg-white/5 hover:text-white transition-all"
              title="Reset Zoom Transform"
            >
              <Maximize size={14} />
            </button>
          </div>

          {/* D3 SVG Rendering Frame */}
          <svg 
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          >
            {/* Markers to render arrows on connection lines */}
            <defs>
              <marker
                id="arrow"
                viewBox="0 -5 10 10"
                refX={30}
                refY={0}
                markerWidth={6}
                markerHeight={6}
                orient="auto"
              >
                <path d="M0,-5L10,0L0,5" fill="#33333b" />
              </marker>
              <marker
                id="arrow-conflict"
                viewBox="0 -5 10 10"
                refX={30}
                refY={0}
                markerWidth={6}
                markerHeight={6}
                orient="auto"
              >
                <path d="M0,-5L10,0L0,5" fill="#ef4444" />
              </marker>
              <marker
                id="arrow-highlight"
                viewBox="0 -5 10 10"
                refX={30}
                refY={0}
                markerWidth={6}
                markerHeight={6}
                orient="auto"
              >
                <path d="M0,-5L10,0L0,5" fill="#f97316" />
              </marker>
            </defs>

            {/* Transform grouping applied on Zoom */}
            <g ref={zoomGRef}>
              
              {/* EDGES / LINKS LAYER */}
              <g className="links-group">
                {processedLinks.map((link) => {
                  const relationshipStyle = RELATIONSHIP_THEMES[link.relationship] || { stroke: '#444', strokeWidth: 1.5 };
                  const isLinkSelected = selectedLink?.id === link.id;
                  
                  // Highlight path links
                  const isHighlightedPathLink = shortestPathData?.links.includes(link.id);

                  let stroke = isHighlightedPathLink 
                    ? '#f97316' 
                    : isLinkSelected 
                      ? '#ef4444' 
                      : relationshipStyle.stroke;
                  
                  let strokeWidth = isHighlightedPathLink 
                    ? 5 
                    : isLinkSelected 
                      ? 5 
                      : relationshipStyle.strokeWidth;

                  // Dim non-path elements if path calculations active
                  if (shortestPathData && shortestPathData.links.length > 0 && !isHighlightedPathLink) {
                    stroke = '#1a1a24';
                    strokeWidth = 1;
                  }

                  return (
                    <g key={link.id} className="link-wrapper">
                      <line
                        id={link.id}
                        className="link-el transition-all duration-300 strokeLinecap"
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={relationshipStyle.dashArray}
                        markerEnd={
                          isHighlightedPathLink 
                            ? 'url(#arrow-highlight)' 
                            : link.relationship === 'Conflict' 
                              ? 'url(#arrow-conflict)' 
                              : 'url(#arrow)'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLink(link);
                          setSelectedNode(null);
                        }}
                      />
                      <line
                        className="opacity-0 hover:opacity-[0.1] hover:stroke-orange-500 hover:stroke-[15px] cursor-pointer"
                        x1={0} y1={0} x2={0} y2={0} // dynamically update in svg selection
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLink(link);
                          setSelectedNode(null);
                        }}
                      />
                    </g>
                  );
                })}
              </g>

              {/* LABELS FOR CHOSEN EDGES */}
              <g className="link-labels-group pointer-events-none">
                {processedLinks.map((link) => {
                  const isHighlightedPathLink = shortestPathData?.links.includes(link.id);
                  const isSelected = selectedLink?.id === link.id;
                  const isDimmed = shortestPathData && shortestPathData.links.length > 0 && !isHighlightedPathLink;

                  if (isDimmed) return null;
                  if (!isHighlightedPathLink && !isSelected) return null; // show only key contextual labels to avoid pollution

                  return (
                    <g key={`lbl-${link.id}`} className="link-label-el transition-all duration-300">
                      <rect
                        x={-50}
                        y={-8}
                        width={100}
                        height={16}
                        fill="#050508"
                        stroke={isSelected ? '#ef4444' : '#f97316'}
                        strokeWidth={1}
                        rx={2}
                      />
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill={isSelected ? '#ef4444' : '#ffffff'}
                        fontSize={7}
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="uppercase tracking-wider select-none leading-none"
                      >
                        {link.relationship.substring(0, 15)}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* NODES LAYER */}
              <g className="nodes-group">
                {processedNodes.map((node) => {
                  const isNodeSelected = selectedNode?.id === node.id;
                  const theme = NODE_THEMES[node.type];
                  const isPinned = pinnedNodeIds.includes(node.id);

                  // Highlight path nodes
                  const isHighlightedPathNode = shortestPathData?.nodes.includes(node.id);

                  let strokeColor = isNodeSelected 
                    ? '#ffffff' 
                    : isHighlightedPathNode 
                      ? '#f97316' 
                      : theme.text.replace('text-', '#').replace('text-red-400', '#ef4444').replace('text-green-400', '#22c55e').replace('text-blue-400', '#3b82f6').replace('text-orange-400', '#f97316');

                  let radius = node.id === 'ru' ? 24 : 18;
                  let bgFill = isNodeSelected ? '#ef4444' : theme.bg.replace('bg-', '#').replace('bg-red-950/40', '#450a0a').replace('bg-green-950/40', '#052e16').replace('bg-blue-950/40', '#172554').replace('bg-orange-950/40', '#431407');
                  
                  // Dim nodes if path solver highlights a dynamic target
                  let opacity = 1;
                  if (shortestPathData && shortestPathData.nodes.length > 0 && !isHighlightedPathNode) {
                    opacity = 0.15;
                  }

                  return (
                    <g 
                      key={node.id} 
                      className="node-el cursor-pointer transition-opacity duration-300"
                      style={{ opacity }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                        setSelectedLink(null);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handlePinNode(node.id, node.x ?? 0, node.y ?? 0);
                      }}
                    >
                      {/* Glow shadow radial */}
                      <circle
                        r={radius + 8}
                        fill="transparent"
                        stroke={strokeColor}
                        strokeWidth={1}
                        strokeDasharray="4,4"
                        className={isNodeSelected || isHighlightedPathNode ? "animate-spin" : "opacity-30"}
                        style={{ transformOrigin: 'center', animationDuration: '20s' }}
                      />

                      <circle
                        r={radius}
                        fill={bgFill}
                        stroke={strokeColor}
                        strokeWidth={isNodeSelected || isHighlightedPathNode ? 3 : 1.5}
                        className="transition-all"
                      />

                      {/* Initial Letter mark */}
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="#ffffff"
                        fontSize={radius * 0.55}
                        fontWeight="black"
                        className="select-none pointer-events-none font-mono tracking-tighter"
                        dy=".3em"
                      >
                        {node.name.substring(0, 2).toUpperCase()}
                      </text>

                      {/* Display name label under node */}
                      <g transform={`translate(0, ${radius + 14})`}>
                        <rect
                          x={-45}
                          y={-7}
                          width={90}
                          height={14}
                          fill="#050508"
                          stroke={isNodeSelected ? '#ef4444' : isHighlightedPathNode ? '#f97316' : 'rgba(255,255,255,0.05)'}
                          strokeWidth={1}
                          rx={1.5}
                        />
                        <text
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fill={isNodeSelected ? '#ef4444' : isHighlightedPathNode ? '#f97316' : '#ffffff'}
                          fontSize={6.5}
                          fontWeight="bold"
                          fontFamily="monospace"
                          className="truncate tracking-wide select-none"
                          dy=".3em"
                        >
                          {node.name.length > 14 ? `${node.name.substring(0, 11)}...` : node.name}
                        </text>
                      </g>

                      {/* Pinned position node indicator icon */}
                      {isPinned && (
                        <g transform={`translate(${radius - 4}, -${radius - 4})`} className="text-orange-500">
                          <circle r={5} fill="#050508" stroke="#f97316" strokeWidth={1} />
                          <path d="M-2.5,-1.5L2.5,1.5" stroke="#f97316" strokeWidth={0.8} />
                          <circle r={1.2} fill="#ef4444" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

            </g>
          </svg>
        </div>

        {/* Right Side: Decryption Evidence Sidebar Panel */}
        <AnimatePresence>
          {(selectedNode || selectedLink) && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute lg:relative top-0 bottom-0 right-0 w-full lg:w-96 bg-zinc-950 border-l border-white/10 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-40 overflow-y-auto no-scrollbar font-mono text-[10px]"
            >
              
              {/* Sidebar Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-orange-500">
                  <BookOpen size={16} />
                  <span className="font-bold tracking-widest text-xs">DECRYPTED_DOSSIER</span>
                </div>
                <button 
                  onClick={() => { setSelectedNode(null); setSelectedLink(null); }}
                  className="px-2 py-1 text-zinc-500 hover:text-white border border-white/10 rounded-sm bg-black/40 hover:bg-white/5 text-[9px] font-bold"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Core Information Section */}
              {selectedNode && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[8px] font-black border px-1.5 py-0.5 rounded-sm ${NODE_THEMES[selectedNode.type].border} ${NODE_THEMES[selectedNode.type].text}`}>
                        {NODE_THEMES[selectedNode.type].label}
                      </span>
                      <span className="text-zinc-600 text-[8px]">EST. {selectedNode.startYear}</span>
                    </div>

                    <h2 className="text-md font-black text-white uppercase tracking-wider mb-2 leading-tight">
                      {selectedNode.name}
                    </h2>

                    {selectedNode.alias && selectedNode.alias.length > 0 && (
                      <p className="text-[8px] text-zinc-500 leading-normal mb-3">
                        KNOWN ALIASES: {selectedNode.alias.join(' // ')}
                      </p>
                    )}

                    <div className="p-3 bg-zinc-900 border border-white/5 text-zinc-400 font-light leading-relaxed rounded-sm">
                      {selectedNode.description}
                    </div>
                  </div>

                  {/* Metadata cards */}
                  {selectedNode.role && (
                    <div className="bg-black/60 p-3 border border-white/5 flex justify-between rounded-sm">
                      <span className="text-zinc-650 font-bold uppercase tracking-widest text-[8px]">DESIGNATED ROLE</span>
                      <span className="text-white font-extrabold uppercase">{selectedNode.role}</span>
                    </div>
                  )}

                  {/* Interactive locked state */}
                  <div className="bg-orange-950/10 border border-orange-500/20 p-3 rounded-sm flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold text-[9px] uppercase">Glow Pin Layout Status</p>
                      <p className="text-[7px] text-zinc-500 uppercase leading-none">Save coordinate positions locally</p>
                    </div>
                    <button 
                      onClick={() => handlePinNode(selectedNode.id, selectedNode.x ?? (dimensions.width / 2), selectedNode.y ?? (dimensions.height / 2))}
                      className={`px-2 py-1 border hover:border-orange-500 font-black flex items-center gap-1 text-[8px] uppercase rounded-sm transition-all cursor-pointer ${
                        pinnedNodeIds.includes(selectedNode.id) 
                          ? 'bg-orange-500 text-black border-orange-500' 
                          : 'bg-black/40 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      <Pin size={9} />
                      <span>{pinnedNodeIds.includes(selectedNode.id) ? 'PINNED' : 'PIN NODE'}</span>
                    </button>
                  </div>

                  {/* Dynamic YouTube Video embedding */}
                  {selectedNode.youtubeId && (
                    <div className="space-y-2">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <Video size={11} className="text-brand" /> DECRYPTED MEDIA SPECIMEN
                      </p>
                      <div className="relative aspect-video w-full bg-black border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedNode.youtubeId}?rel=0&modestbranding=1`}
                          title="Evidence Material"
                          className="w-full h-full border-none"
                          allowFullScreen
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedLink && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black border border-orange-500/50 text-orange-400 px-1.5 py-0.5 rounded-sm">
                        RELATIONSHIP RECORD
                      </span>
                      <span className="text-zinc-600 text-[8px]">SINCE {selectedLink.startYear}</span>
                    </div>

                    <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2 leading-none">
                      <span>{(selectedLink.source as SimulationNode).name}</span>
                      <ArrowRight size={10} className="text-zinc-600 inline shrink-0" />
                      <span>{(selectedLink.target as SimulationNode).name}</span>
                    </h2>

                    <div className="bg-zinc-900 border border-white/5 p-3.5 text-zinc-400 leading-relaxed font-light rounded-sm">
                      <p className="text-[8px] font-bold text-orange-400 uppercase tracking-widest mb-1.5">{selectedLink.relationship} Analysis:</p>
                      {selectedLink.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic DatabaseMentions Cross-referencing Section */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-6 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} className="text-blue-400" /> SOURCE EVIDENCE DIGEST
                  </h3>
                  <span className="text-[7px] text-green-500 font-bold bg-green-950/20 px-1.5 py-0.2 select-none">VERIFIED_RECEIPT</span>
                </div>

                <div className="space-y-3">
                  
                  {/* Evidence Mentions */}
                  <div>
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-2 font-bold flex justify-between leading-none">
                      <span>DOCUMENTED EVIDENCE FILES</span>
                      <span>({relativeDbRecords.evidence.length})</span>
                    </p>
                    {relativeDbRecords.evidence.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {relativeDbRecords.evidence.map((ev: any) => (
                          <div key={ev.id} className="p-2.5 bg-black/60 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-1 gap-1">
                              <h4 className="text-[9px] font-black text-white uppercase leading-tight font-sans truncate">{ev.title}</h4>
                              <span className="text-[6px] tracking-widest font-mono shrink-0 text-zinc-650 uppercase">
                                {ev.type}
                              </span>
                            </div>
                            <p className="text-[8px] text-zinc-500 line-clamp-2 leading-normal italic font-sans mb-1">{ev.description}</p>
                            {ev.aiAnalysis && (
                              <div className="flex gap-2 text-[6px] font-mono font-bold uppercase tracking-widest mt-1 text-orange-400/80">
                                <span>Volatility: {(ev.aiAnalysis.volatility * 100).toFixed(0)}%</span>
                                <span>Impact: {ev.aiAnalysis.narrativeImpact}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[8px] text-zinc-700 font-light font-mono italic leading-none py-1">No direct evidence file tagged under target name.</p>
                    )}
                  </div>

                  {/* Lawsuit Mentions */}
                  <div className="border-t border-white/5 pt-4">
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-2 font-bold flex justify-between leading-none">
                      <span>LITIGATION LAWSUIT LOGS</span>
                      <span>({relativeDbRecords.lawsuits.length})</span>
                    </p>
                    {relativeDbRecords.lawsuits.length > 0 ? (
                      <div className="space-y-2">
                        {relativeDbRecords.lawsuits.map((lw: any) => (
                          <div key={lw.id} className="p-2.5 bg-black/60 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-1 gap-1">
                              <h4 className="text-[9px] font-black text-white uppercase leading-tight font-sans truncate">{lw.title}</h4>
                              <span className="text-[6px] border border-red-500/30 text-brand px-1 font-mono uppercase size-fit font-semibold leading-none shrink-0">
                                COURT
                              </span>
                            </div>
                            <p className="text-[8px] text-zinc-500 line-clamp-2 leading-normal mb-1 font-sans font-light">{lw.description}</p>
                            <div className="flex gap-2 text-[7px] font-mono uppercase text-zinc-600">
                              <span>Case: {lw.caseNumber || 'UNAVAILABLE'}</span>
                              <span>•</span>
                              <span className="text-zinc-500">{lw.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[8px] text-zinc-700 font-light font-mono italic leading-none py-1">No direct lawsuits files mapped under target name.</p>
                    )}
                  </div>

                  {/* Dossier Mentions */}
                  <div className="border-t border-white/5 pt-4 mb-4">
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-2 font-bold flex justify-between leading-none">
                      <span>COMMUNITY DOSSIER PROFILES</span>
                      <span>({relativeDbRecords.dossiers.length})</span>
                    </p>
                    {relativeDbRecords.dossiers.length > 0 ? (
                      <div className="space-y-2">
                        {relativeDbRecords.dossiers.map((ds: any) => (
                          <div key={ds.id} className="p-2.5 bg-black/60 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-1.5 gap-1 leading-none">
                              <h4 className="text-[9px] font-black text-white uppercase leading-none font-sans truncate">{ds.name}</h4>
                              <span className="text-[6px] text-green-400 font-mono uppercase font-bold bg-green-950/20 px-1 leading-none">
                                {ds.role}
                              </span>
                            </div>
                            <p className="text-[8px] text-zinc-500 italic mb-1.5 font-sans leading-normal">Notes: {ds.notes || 'No notes compiled'}</p>
                            <div className="space-y-0.5">
                              {ds.reportedActivities?.slice(0, 2).map((act: string, aIdx: number) => (
                                <p key={aIdx} className="text-[7.5px] text-zinc-600 leading-relaxed font-sans truncate">• {act}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[8px] text-zinc-700 font-light font-mono italic leading-none py-1">No community dossier profile found for target entry.</p>
                    )}
                  </div>

                </div>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {/* Master Matrix Overlay Modal */}
      <AnimatePresence>
        {showMatrix && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl bg-zinc-950 border border-white/10 rounded-sm shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center bg-zinc-900 px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-sm">
                    <Scale size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-white text-xs font-black uppercase tracking-widest font-mono">CROSS-REFERENCE MATRIX</h2>
                    <p className="text-[9px] text-zinc-500 font-mono tracking-wider">CHRONOLOGICAL TARGET INTELLIGENCE MAPPING MATRIX</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMatrix(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-zinc-400 text-[10px] font-mono rounded-sm transition-all cursor-pointer"
                >
                  [ ESCAPE_SYSTEM ]
                </button>
              </div>

              {/* Description Callout */}
              <div className="bg-blue-600/5 border-b border-blue-500/10 px-6 py-3 font-mono text-[9.5px] text-blue-300 leading-normal">
                ⚔️ This master intelligence matrix tracks targeted conflicts, digital faction positions, and content platforms utilized within the Country Rap space from 2018 to the present. All listed points correspond to real public record entries on the active digital timeline. Select any target row to snap-focus gravity coordinates directly to their active node.
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-auto p-6 no-scrollbar">
                <table className="w-full border-collapse font-sans text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-2 px-3 font-bold">Target</th>
                      <th className="py-2 px-3 font-bold">Primary Faction</th>
                      <th className="py-2 px-3 font-bold">Media Node</th>
                      <th className="py-2 px-3 font-bold">Conflict Partner</th>
                      <th className="py-2 px-3 font-bold font-mono text-[9px]">Weapon / Format</th>
                      <th className="py-2 px-3 font-bold">Historical Role Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MASTER_MATRIX.map((row, index) => (
                      <tr 
                        key={index}
                        onClick={() => {
                          const matchingNode = INITIAL_NODES.find(n => n.id === row.nodeId);
                          if (matchingNode) {
                            setSelectedNode(matchingNode as SimulationNode);
                          }
                          setShowMatrix(false);
                        }}
                        className="border-b border-white/5 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] font-black text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5 leading-none">
                            <span className="w-1 h-3 bg-blue-500/50 rounded-sm inline-block"></span>
                            {row.target}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-300 font-mono text-[10px] leading-none uppercase">{row.faction}</td>
                        <td className="py-3 px-3 text-zinc-400 font-mono text-[10px] leading-none uppercase">{row.media}</td>
                        <td className="py-3 px-3 text-red-400/80 font-mono text-[10px] leading-none">{row.partner}</td>
                        <td className="py-3 px-3 text-zinc-500 font-light font-sans">{row.weapon}</td>
                        <td className="py-3 px-3 text-zinc-400 font-sans leading-normal font-light italic max-w-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-zinc-900 px-6 py-3 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-zinc-650 uppercase">
                <span>INTEL DATABASE ENCRYPTION: G-26.C</span>
                <span>Select a node row to navigate mapping map</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
