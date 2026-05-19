import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, User, AlertCircle, Share2, ZoomIn, Maximize, 
  Search, Shield, Brain, Activity, Zap, Radio, 
  Terminal, Database, Flame, Eye, Lock, Volume2,
  History as HistoryIcon
} from 'lucide-react';
import { useSagaStore, Node, Link } from '../store/useSagaStore';

interface SagaNode extends Node, d3.SimulationNodeDatum {}
interface SagaLink extends d3.SimulationLinkDatum<SagaNode> {
  id: string;
  label: string;
  type: string;
  intensity: number;
}

const NODE_COLORS: Record<string, string> = {
  creator: '#ff0000',
  livestream: '#00aaff',
  screenshot: '#00ffaa',
  clip: '#ffff00',
  comment: '#888888',
  diss_track: '#ff00ff',
  timeline_event: '#ffffff',
  allegation: '#ff5500'
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  allied: '#00ff44',
  neutral: '#444444',
  hostile: '#ff0000',
  unstable: '#ffaa00',
  former_allies: '#888888'
};

export default function ConspiracyWall() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, links, selectedNode, setSelectedNode, dramaHeatIndex, isAutoDocMode, toggleAutoDoc } = useSagaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeStep, setTimeStep] = useState(2026);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Resize Observer for fluid graph
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredNodes = useMemo<SagaNode[]>(() => {
    let base = nodes as SagaNode[];
    if (searchTerm) {
      base = base.filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (timeStep < 2025) {
      return base.filter(n => !['dt1', 'ls1'].includes(n.id));
    }
    return base;
  }, [nodes, searchTerm, timeStep]);

  const filteredLinks = useMemo<SagaLink[]>(() => {
    const base = links as unknown as SagaLink[];
    if (timeStep < 2025) {
      return base.filter(l => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as SagaNode).id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as SagaNode).id;
        return !['ls1', 'dt1'].includes(sourceId) && !['ls1', 'dt1'].includes(targetId);
      });
    }
    return base;
  }, [links, timeStep]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<SagaNode>(filteredNodes as any)
      .force('link', d3.forceLink<SagaNode, SagaLink>(filteredLinks as any).id(d => d.id).distance(220).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-1200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(90))
      .force('x', d3.forceX(width / 2).strength(0.08))
      .force('y', d3.forceY(height / 2).strength(0.08));

    const linkGroup = g.append('g')
      .selectAll('g')
      .data(filteredLinks)
      .join('g');

    linkGroup.append('line')
      .attr('stroke', d => RELATIONSHIP_COLORS[d.type])
      .attr('stroke-width', d => 1 + d.intensity * 3)
      .attr('stroke-opacity', 0.5)
      .attr('id', d => `link-${d.id}`);

    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, SagaNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', (event, d) => setSelectedNode(d));

    node.append('circle')
      .attr('r', d => (d.val || 12) + (d.heat || 0) * 12)
      .attr('fill', 'transparent')
      .attr('stroke', d => NODE_COLORS[d.type])
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,4')
      .attr('class', 'animate-spin-slow opacity-20');

    node.append('circle')
      .attr('r', d => (d.val || 12))
      .attr('fill', '#000')
      .attr('stroke', d => NODE_COLORS[d.type])
      .attr('stroke-width', 2)
      .style('filter', d => (d.heat || 0) > 0.6 ? 'url(#glow)' : 'none');

    node.append('text')
      .text(d => d.name)
      .attr('dy', d => (d.val || 12) + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', d => NODE_COLORS[d.type])
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-weight', 'black')
      .attr('class', 'uppercase tracking-tighter');

    simulation.on('tick', () => {
      linkGroup.selectAll('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    let docInterval: any;
    if (isAutoDocMode) {
      docInterval = setInterval(() => {
        const randomNode = filteredNodes[Math.floor(Math.random() * filteredNodes.length)];
        const transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1.8)
          .translate(-(randomNode as any).x, -(randomNode as any).y);
        
        svg.transition().duration(2500).call(zoom.transform as any, transform);
        setSelectedNode(randomNode);
      }, 6000);
    }

    return () => {
      simulation.stop();
      if (docInterval) clearInterval(docInterval);
    };
  }, [filteredNodes, filteredLinks, isAutoDocMode, dimensions]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Search & Global Controls HUD */}
      <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
         <div className="glass-panel p-6 border-white/5 bg-black/60 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
               <Terminal className="text-brand shrink-0" size={18} />
               <h1 className="text-xs font-black font-mono tracking-[0.3em] uppercase">Visual_Intelligence</h1>
            </div>
            
            <div className="space-y-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                 <input 
                   type="text" 
                   placeholder="SEARCH_ENTITY..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="bg-black/50 border border-white/10 rounded-sm pl-10 pr-4 py-2 text-[10px] font-mono text-white focus:border-brand/50 outline-none w-64 uppercase tracking-widest"
                 />
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={toggleAutoDoc}
                   className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-sm border text-[10px] font-black uppercase italic transition-all ${
                     isAutoDocMode 
                     ? 'bg-brand/20 border-brand text-brand animate-pulse' 
                     : 'bg-zinc-900/50 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
                   }`}
                 >
                   <Radio size={14} /> {isAutoDocMode ? 'STOP_DRIVE' : 'AUTO_DOC_MODE'}
                 </button>
                 <button className="p-3 border border-white/10 rounded-sm text-zinc-600 hover:text-white transition-colors">
                    <Maximize size={16} />
                 </button>
               </div>
            </div>
         </div>

         <div className="glass-panel p-6 border-white/5 bg-black/40 backdrop-blur-md">
            <h4 className="text-[8px] font-mono text-zinc-600 mb-4 uppercase tracking-[0.2em]">Node Classification</h4>
            <div className="space-y-2">
               {Object.entries(NODE_COLORS).map(([type, color]) => (
                 <div key={type} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,1)]" style={{ backgroundColor: color }} />
                   <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">{type.replace('_', ' ')}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Stats HUD (Bottom Left) */}
      <div className="absolute bottom-10 left-10 z-50 flex items-center gap-12 glass-panel p-6 px-10 bg-black/60 border-white/5 backdrop-blur-xl">
         <div className="space-y-1">
            <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Global Heat Index</p>
            <div className="text-xl font-display font-black text-brand italic tracking-tighter">{(dramaHeatIndex * 100).toFixed(1)}%</div>
         </div>
         <div className="w-px h-10 bg-white/5" />
         <div className="space-y-1">
            <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Identified Nodes</p>
            <div className="text-xl font-display font-black text-white italic tracking-tighter">{nodes.length}</div>
         </div>
         <div className="w-px h-10 bg-white/5" />
         <div className="space-y-1">
            <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Conflict Points</p>
            <div className="text-xl font-display font-black text-red-500 italic tracking-tighter">{links.filter(l => l.type === 'hostile').length}</div>
         </div>
      </div>

      {/* Temporal Scrubber HUD (Floating Center Bottom) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[500px] glass-panel border-brand/10 bg-brand/5 p-6 px-10 backdrop-blur-2xl">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-3">
              <HistoryIcon className="text-brand/50" size={14} />
              <span className="text-[9px] font-black text-brand font-mono uppercase tracking-[0.3em]">Temporal_Scrubber</span>
           </div>
           <span className="text-xl font-display font-black text-white italic">{timeStep}</span>
        </div>
        <input 
          type="range" 
          min="2021" 
          max="2026" 
          step="1" 
          value={timeStep}
          onChange={(e) => setTimeStep(parseInt(e.target.value))}
          className="w-full accent-brand bg-zinc-900 border border-white/5 h-2 rounded-full appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-[7px] font-mono text-zinc-600 uppercase tracking-widest">
          <span>Pioneer_Epoch</span>
          <span>Current_State</span>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div ref={containerRef} className="flex-1 relative bg-black/20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand/10 text-transparent" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-brand/5 text-transparent" />
        </div>
        <svg ref={svgRef} className="w-full h-full relative z-10" />
        
        {/* Intelligence Detail Sidebar */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute top-0 right-0 w-[450px] h-full p-12 glass-panel bg-black/95 border-l border-white/10 backdrop-blur-3xl z-[60] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <Database className="text-brand" size={20} />
                  <span className="text-[10px] font-black font-mono text-brand uppercase tracking-[0.4em]">Entity_Profile</span>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-2 text-zinc-600 hover:text-white transition-colors border border-white/5 rounded-sm">
                  <Maximize size={16} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="flex flex-col gap-2 mb-6">
                    <span className="w-fit px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 text-[8px] font-black uppercase tracking-widest rounded-sm">{selectedNode.type}</span>
                    <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic text-white">{selectedNode.name}</h2>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                      <span className="uppercase tracking-[0.2em]">{selectedNode.id}_INST_01</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="uppercase tracking-[0.2em]">Verified_Archive</span>
                    </div>
                  </div>

                  <div className="p-8 bg-brand/5 border border-brand/10 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Zap size={60} className="text-brand" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="text-brand" size={14} />
                        <span className="text-[10px] font-black font-mono text-brand uppercase tracking-widest">AI_Synthesized_Bio</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed font-light italic">
                        {selectedNode.name === 'MoKoN' 
                          ? "Pioneer of the Upchurch accountability movement. Decoupled from core inner-circles, MoKoN initiated the cycle of public call-outs in early 2021 through verified diss tracks. System identifies this node as a primary catalyst for the current saga's investigation layer." 
                          : "System detects significant interaction peaks surrounding May 2024 events. High probability of relationship shift detected between this entity and the Central Axis."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase font-mono tracking-[0.3em] flex items-center gap-2">
                     <Activity size={12} className="text-brand" /> Relationship_Vectors
                  </h4>
                  <div className="space-y-3">
                    {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).map(link => {
                      const otherNode = link.source === selectedNode.id ? link.target : link.source;
                      const targetNodeName = typeof otherNode === 'string' ? otherNode : (otherNode as any).name;
                      return (
                        <div key={link.id} className="p-5 border border-white/5 bg-zinc-950/50 rounded-sm flex items-center justify-between group hover:border-brand/40 transition-all">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{targetNodeName}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{link.type.replace('_', ' ')}</p>
                               <div className="w-1 h-1 rounded-full bg-zinc-800" />
                               <p className="text-[8px] font-mono text-brand uppercase tracking-widest">Intensity: {link.intensity}</p>
                            </div>
                          </div>
                          <div className={`w-1 h-10 rounded-full ${RELATIONSHIP_COLORS[link.type] === '#ff0000' ? 'bg-red-600' : 'bg-brand'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-zinc-950/50 border border-white/5 rounded-sm">
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Social_Sentiment</p>
                    <p className={`text-xl font-display font-black italic tracking-tighter ${ (selectedNode.heat || 0) > 0.5 ? 'text-red-500' : 'text-white'}`}>
                      {(selectedNode.heat || 0) > 0.5 ? 'VOLATILE' : 'STABLE'}
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-950/50 border border-white/5 rounded-sm">
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Narrative_Weight</p>
                    <p className="text-xl font-display font-black text-brand italic tracking-tighter">7.4 / 10</p>
                  </div>
                </div>

                <button className="w-full relative group p-6 border border-brand/30 bg-brand/5 text-brand font-black italic tracking-[0.4em] text-[10px] uppercase hover:bg-brand hover:text-white transition-all overflow-hidden">
                   <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                   <span className="relative z-10 flex items-center justify-center gap-3">
                     <Eye size={14} /> SCAN EXTERNAL_RECORDS
                   </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating System Indicators */}
      <div className="absolute top-10 right-10 pointer-events-none flex flex-col gap-4">
         <div className="glass-panel p-4 px-6 border-white/5 bg-black/40 backdrop-blur-md flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">LIVE_RELATIONSHIP_FLUX</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">SENTIMENT_PARSER Active</span>
            </div>
         </div>
      </div>
    </div>
  );
}

