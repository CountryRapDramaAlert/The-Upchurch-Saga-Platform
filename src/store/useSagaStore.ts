import { create } from 'zustand';

export interface Node {
  id: string;
  name: string;
  type: 'creator' | 'livestream' | 'screenshot' | 'clip' | 'comment' | 'diss_track' | 'timeline_event' | 'allegation';
  color?: string;
  val?: number;
  heat?: number; // 0-1
  lastActivity?: string;
}

export interface Link {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'allied' | 'neutral' | 'hostile' | 'unstable' | 'former_allies';
  intensity: number; // 0-1
}

export interface SagaEra {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  chapters: string[];
}

interface SagaState {
  nodes: Node[];
  links: Link[];
  eras: SagaEra[];
  selectedNode: Node | null;
  dramaHeatIndex: number;
  isAutoDocMode: boolean;
  activeEraId: string | null;
  
  setNodes: (nodes: Node[]) => void;
  setLinks: (links: Link[]) => void;
  setEras: (eras: SagaEra[]) => void;
  setSelectedNode: (node: Node | null) => void;
  toggleAutoDoc: () => void;
  updateHeat: (nodeId: string, heat: number) => void;
  setActiveEra: (eraId: string | null) => void;
}

export const useSagaStore = create<SagaState>((set) => ({
  nodes: [
    { id: 'ru', name: 'Ryan Upchurch', type: 'creator', color: '#ff0000', heat: 0.95, val: 24 },
    { id: 'mk', name: 'MoKoN', type: 'creator', color: '#ff4400', heat: 0.85, val: 18 },
    { id: 'ac', name: 'Adam Calhoun', type: 'creator', color: '#ffaa00', heat: 0.65, val: 15 },
    { id: 'jr', name: 'Jelly Roll', type: 'creator', color: '#888888', heat: 0.35, val: 12 },
    { id: 'sb', name: 'Sonny Bama', type: 'creator', color: '#ff5500', heat: 0.82, val: 14 },
    { id: 'cs', name: 'cmdshft', type: 'creator', color: '#ffff00', heat: 0.78, val: 13 },
    { id: 'cm', name: 'Chase Matthew', type: 'creator', color: '#00ffaa', heat: 0.55, val: 11 },
    { id: 'kr', name: 'Rodni Defamation Saga', type: 'allegation', color: '#ff00ff', heat: 0.99, val: 16 },
    { id: 'jl', name: 'Jacob LeVeille VARA', type: 'allegation', color: '#ffffff', heat: 0.40, val: 10 },
  ],
  links: [
    { id: 'l1', source: 'mk', target: 'ru', label: 'Original Pioneer Call-out', type: 'hostile', intensity: 0.95 },
    { id: 'l2', source: 'ru', target: 'ac', label: 'Strategic Peace Accord (2024)', type: 'allied', intensity: 0.80 },
    { id: 'l3', source: 'ru', target: 'jr', label: 'Mainstream trajectory friction', type: 'unstable', intensity: 0.50 },
    { id: 'l4', source: 'ru', target: 'sb', label: 'Royalty & Mastercard disputes', type: 'hostile', intensity: 0.90 },
    { id: 'l5', source: 'ru', target: 'cs', label: 'Deposition leak sanctions', type: 'hostile', intensity: 0.85 },
    { id: 'l6', source: 'ru', target: 'cm', label: 'Label alignment warning', type: 'unstable', intensity: 0.60 },
    { id: 'l7', source: 'ru', target: 'kr', label: 'Federal Jury Verdict $17.5M', type: 'hostile', intensity: 0.99 },
    { id: 'l8', source: 'ru', target: 'jl', label: 'VARA painting damage lawsuit', type: 'former_allies', intensity: 0.70 },
    { id: 'l9', source: 'sb', target: 'cs', label: 'Accused distributor collusion', type: 'allied', intensity: 0.75 },
  ],
  eras: [
    { 
      id: 'e1', 
      title: 'THE CORE PIONEER ERA (2014-2020)', 
      startDate: '2014-01-01', 
      endDate: '2020-12-31', 
      description: 'Dawn of Hick-Hop. Early viral RHEC comedic breakthrough leading into the Jacob LeVeille gunfire lawsuit.',
      chapters: ['Chapter I: Upchurch the Redneck', 'Chapter II: VARA Art Fire Litigation']
    },
    {
      id: 'e2',
      title: 'THE LIVESTREAM ESCALATION ARC (2021-2023)',
      startDate: '2021-01-01',
      endDate: '2023-12-31',
      description: 'Severe escalation of digital call-outs. MoKoN files exhaustive contradictions. Rodni stream campaign commences and sparks federal complaints.',
      chapters: ['Chapter III: Whistleblower Epoch', 'Chapter IV: California Defamation Complaint']
    },
    {
      id: 'e3',
      title: 'THE FRAUD WAR & COURT CRISIS (2024-2026)',
      startDate: '2024-01-01',
      description: 'Resolution with Adam Calhoun contrasted against explosive legal battles. Sonny Bama and cmdshft MasterCard/deposition triggers culminate in a massive $17.5M federal verdict.',
      chapters: ['Chapter V: The 2024 Peace Accord', 'Chapter VI: The $17.5M Verdict Day']
    }
  ],
  selectedNode: null,
  dramaHeatIndex: 0.92,
  isAutoDocMode: false,
  activeEraId: 'e3',

  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
  setEras: (eras) => set({ eras }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  toggleAutoDoc: () => set((state) => ({ isAutoDocMode: !state.isAutoDocMode })),
  updateHeat: (nodeId, heat) => set((state) => ({
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, heat } : n)
  })),
  setActiveEra: (eraId) => set({ activeEraId: eraId }),
}));
