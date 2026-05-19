import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle, Brain, Terminal, Zap, ChevronRight, Share2, Search } from 'lucide-react';

interface Contradiction {
  id: string;
  claim1: { text: string; date: string; source: string };
  claim2: { text: string; date: string; source: string };
  description: string;
  confidence: number;
}

export default function ContradictionDetector() {
  const [statements, setStatements] = useState<{ text: string; source: string; date: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);

  const analyzeContradiction = async () => {
    if (!inputText) return;
    
    // Check for extremely large input (over 100k chars is a lot for a single paste)
    if (inputText.length > 200000) {
      alert("TRANSCRIPT TOO LARGE. PLEASE CLIP TO UNDER 200,000 CHARACTERS FOR OPTIMAL PROCESSING.");
      return;
    }

    setIsAnalyzing(true);
    
    // Keep internal history clean (limit to last 5 major entries to prevent payload bloat)
    const newStatements = [...statements, { text: inputText, source: 'LIVESTREAM_INPUT', date: new Date().toISOString() }].slice(-5);
    
    try {
      const response = await fetch('/api/ai/detect-contradictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statements: newStatements })
      });
      
      if (!response.ok) throw new Error("NETWORK_RESPONSE_FAILURE");
      
      const data = await response.json();
      if (data.contradictions) {
        setContradictions(data.contradictions.map((c: any, i: number) => ({ ...c, id: `c-${Date.now()}-${i}` })));
      }
      setStatements(newStatements);
      setInputText('');
    } catch (error) {
      console.error("Contradiction Analysis Failed:", error);
      alert("ANALYSIS TIMEOUT: THE TRANSCRIPT MAY BE TOO COMPLEX OR NETWORK LATENCY IS HIGH.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-panel border-brand/20 overflow-hidden bg-black/40 backdrop-blur-xl">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-brand/5">
        <div className="flex items-center gap-3">
          <Brain className="text-brand animate-pulse" size={20} />
          <h3 className="text-sm font-bold font-mono tracking-widest uppercase">Cognitive_Dissonance_Scanner</h3>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 uppercase">
          {inputText.length > 0 && (
            <span className={inputText.length > 50000 ? 'text-red-500' : 'text-zinc-500'}>
              SIZE: {Math.round(inputText.length / 1024)}KB / 200KB
            </span>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System_Online
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-4 text-zinc-600 transition-colors group-focus-within:text-brand" size={16} />
          <textarea 
            placeholder="PASTE STATEMENT OR TRANSCRIPT TO CHECK FOR CONTRADICTIONS..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 bg-zinc-950 border border-white/10 rounded-lg p-4 pl-12 text-xs font-mono text-white focus:border-brand/40 outline-none uppercase placeholder:text-zinc-800 transition-all resize-none scrollbar-thin scrollbar-thumb-brand/20"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            {isAnalyzing && (
              <span className="text-[8px] font-mono text-brand animate-pulse uppercase tracking-tighter">Analyzing_Large_Dataset...</span>
            )}
            <button 
              onClick={analyzeContradiction}
              disabled={isAnalyzing || !inputText}
              className="btn-primary px-6 py-2 text-[10px] flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed group/btn shadow-lg shadow-brand/10"
            >
              {isAnalyzing ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap size={12} className="group-hover/btn:scale-125 transition-transform" />
              )} 
              {isAnalyzing ? 'SCANNING...' : 'RUN_NARRATIVE_SCAN'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Terminal size={12} /> SCAN_RESULTS
          </h4>
          
          <AnimatePresence mode="popLayout">
            {contradictions.length > 0 ? (
              contradictions.map((c) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 border border-red-500/20 bg-red-500/5 rounded-lg space-y-4 relative"
                >
                  <div className="absolute top-4 right-4 text-[8px] font-mono text-red-500/50">CONFIDENCE: {Math.round(c.confidence * 100)}%</div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[7px] font-mono text-zinc-500 uppercase">Statement A ({new Date(c.claim1.date).toLocaleDateString()})</p>
                      <p className="text-[10px] text-zinc-300 italic">"{c.claim1.text}"</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[7px] font-mono text-zinc-500 uppercase font-bold text-red-500">CONTRADICTION DETECTED</p>
                      <p className="text-[10px] text-zinc-300 italic">"{c.claim2.text}"</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-red-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="text-red-500" size={14} />
                      <p className="text-[10px] font-bold text-white uppercase font-mono">Narrative Drift Detected</p>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-relaxed uppercase">
                      Analysis: {c.description}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center border border-white/5 bg-zinc-950/30 rounded-lg">
                <CheckCircle className="mx-auto text-zinc-800 mb-3" size={32} />
                <p className="text-[10px] font-mono text-zinc-600 uppercase">No active contradictions found in current stack.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 bg-brand/5 border-t border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
         {statements.map((s, i) => (
           <div key={i} className="px-3 py-1 bg-white/5 rounded border border-white/5 whitespace-nowrap">
             <span className="text-[8px] font-mono text-zinc-500 lowercase">{new Date(s.date).toLocaleTimeString()} : {s.text.substring(0, 15)}...</span>
           </div>
         ))}
      </div>
    </div>
  );
}
