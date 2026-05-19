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
    { id: 'ru', name: 'Ryan Upchurch', type: 'creator', color: '#ff0000', heat: 0.9, val: 20 },
    { id: 'mk', name: 'MoKoN', type: 'creator', color: '#ff4400', heat: 0.7, val: 15 },
    { id: 'ac', name: 'Adam Calhoun', type: 'creator', color: '#ffaa00', heat: 0.5, val: 12 },
    { id: 'jr', name: 'Jelly Roll', type: 'creator', color: '#888888', heat: 0.3, val: 10 },
    { id: 'ls1', name: 'Midnight Rant 05/14', type: 'livestream', color: '#00aaff', heat: 1.0, val: 8 },
    { id: 'dt1', name: 'The Pioneer Diss', type: 'diss_track', color: '#ff00ff', heat: 0.8, val: 10 },
  ],
  links: [
    { id: 'l1', source: 'mk', target: 'ru', label: 'Original Pioneer Call-out', type: 'hostile', intensity: 0.9 },
    { id: 'l2', source: 'ru', target: 'ac', label: 'Collaborator', type: 'allied', intensity: 0.7 },
    { id: 'l3', source: 'ls1', target: 'ru', label: 'Primary Subject', type: 'neutral', intensity: 1.0 },
    { id: 'l4', source: 'mk', target: 'dt1', label: 'Authored By', type: 'allied', intensity: 1.0 },
  ],
  eras: [
    { 
      id: 'e1', 
      title: 'THE CORE PIONEER ERA', 
      startDate: '2021-01-01', 
      endDate: '2021-12-31', 
      description: 'The foundation of the modern movement. MoKoN establishes the first lines of dissent.',
      chapters: ['Chapter I: The Callout', 'Chapter II: The Response']
    },
    {
      id: 'e2',
      title: 'THE LIVESTREAM ESCALATION ARC',
      startDate: '2022-01-01',
      description: 'Emerging narrative: Shift from music to direct daily community interaction and live conflicts.',
      chapters: ['Chapter III: Midnight Rants', 'Chapter IV: Shadow People']
    }
  ],
  selectedNode: null,
  dramaHeatIndex: 0.85,
  isAutoDocMode: false,
  activeEraId: 'e2',

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
