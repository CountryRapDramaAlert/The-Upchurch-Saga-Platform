import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText, Zap, ChevronRight, Activity, Terminal, Shield } from 'lucide-react';
import { Evidence } from '../types';
import { getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Report {
  id: string;
  date: string;
  title: string;
  summary: string;
  keyNarratives: string[];
  status: 'classified' | 'public' | 'declassified';
}

export default function IntelligenceReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // 1. Fetch latest approved evidence for context
      const evidenceSnap = await getDocs(query(
        collection(db, 'evidence'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ));
      
      const contextEvidence = evidenceSnap.docs.map(doc => ({
        title: doc.data().title,
        description: doc.data().description
      }));

      // 2. Call AI with real evidence
      const response = await fetch('/api/ai/saga-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timelineEvents: contextEvidence.length > 0 ? contextEvidence : [
            { title: 'Initial Archive Setup', description: 'System monitoring initialized.' }
          ]
        })
      });
      const data = await response.json();
      const newReport: Report = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        title: `INTEL_REPORT_${Math.floor(Math.random() * 9000) + 1000}_X`,
        summary: data.summary,
        keyNarratives: data.keyNarratives || [],
        status: 'classified'
      };
      setReports([newReport, ...reports]);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (reports.length === 0) {
      generateReport();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Brain className="text-brand" /> Intelligence Updates
        </h2>
        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="btn-primary flex items-center gap-2 px-6 py-2 text-xs disabled:opacity-50"
        >
          {isGenerating ? <Zap className="animate-spin" size={14} /> : <Terminal size={14} />} 
          EXECUTE_COLLECTION_NODE
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {reports.map((report) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 border-white/5 bg-zinc-950/50 backdrop-blur-md group hover:border-brand/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{report.date}</span>
                    <span className="px-2 py-0.5 bg-brand/20 text-brand text-[8px] font-bold uppercase rounded-sm">
                      {report.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-brand transition-colors">{report.title}</h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-green-500">
                    <Activity size={12} className="animate-pulse" />
                    <span className="text-[8px] font-mono uppercase">Signal Locked</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-zinc-400 italic leading-relaxed">
                  "{report.summary}"
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {report.keyNarratives.map((narrative, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] font-mono text-zinc-400 uppercase">
                      {narrative}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center pt-6 border-t border-white/5">
                 <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-600">
                   <Shield size={10} /> CLEARANCE_LVL_4
                 </div>
                 <button className="text-brand text-[10px] font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                   READ_FULL_DOSSIER <ChevronRight size={14} />
                 </button>
              </div>
            </motion.div>
          ))}
          
          {reports.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
               <FileText className="mx-auto text-zinc-800 mb-4" size={48} />
               <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">No active intelligence reports found for this period.</p>
               <button onClick={generateReport} className="mt-6 text-brand font-bold text-xs hover:underline uppercase underline-offset-4">Run Manual Scan</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
