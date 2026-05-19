import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, FileText, Download, Calendar, 
  ExternalLink, ChevronRight, Info, AlertTriangle,
  Gavel, User, Search
} from 'lucide-react';
import { Lawsuit } from '../types';

export default function LawsuitTracker() {
  const [search, setSearch] = useState('');

  const mockLawsuits: Lawsuit[] = [
    {
      id: 'ru-rodni-2023',
      title: 'Robertson v. Upchurch (Kiely Rodni Case)',
      caseNumber: '3:23-CV-00770',
      description: 'Defamation and libel lawsuit filed in the Middle District of Tennessee regarding statements made about the Kiely Rodni investigation. The court has allowed libel and defamation claims to proceed as of May 2024.',
      status: 'Active / Discovery',
      participants: ['Ryan Upchurch', 'David Robertson', 'Daniel Rodni', 'Federal Court System'],
      filings: [
        { date: '2024-05-23', title: 'Order Allowing Defamation Claims to Proceed' },
        { date: '2023-09-29', title: 'Case Formally Cataloged in Tennessee' },
        { date: '2023-07-29', title: 'Initial Federal Complaint Filed' }
      ]
    },
    {
      id: 'ru-decker-2024',
      title: 'Upchurch vs. Decker',
      caseNumber: 'MT-882-99',
      description: 'A significant legal dispute involving the Decker Music Group regarding intellectual property, distribution rights, and brand usage within the independent country rap sector.',
      status: 'Settled',
      participants: ['Ryan Upchurch', 'Decker Music Group'],
      filings: [
        { date: '2024-05-12', title: 'Final Settlement Entry' },
        { date: '2024-03-15', title: 'Mediation Report' }
      ]
    }
  ];

  const filtered = mockLawsuits.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.caseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 min-h-screen bg-black">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-l from-red-900/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 text-brand font-mono text-xs mb-4 tracking-[0.2em]">
            <Gavel size={14} /> LEGAL_DATABASE_V1
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">LAWSUIT <span className="text-white bg-brand/20 border border-brand/40 px-4 py-1 italic">TRACKER</span></h1>
          <p className="text-gray-500 font-mono text-sm max-w-2xl leading-relaxed">
            SYSTEMATIC TRACKING OF ALL PUBLIC LEGAL FILINGS RELATIVE TO THE COMMUNITY. ALL DOCUMENTS ARE PUBLIC RECORD. 
            <span className="text-white ml-2">ALLEGATIONS ARE NOT CONVICTIONS.</span>
          </p>
        </div>

        {/* Search */}
        <div className="glass-panel p-4 mb-12 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search case titles, number, or participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none py-2 pl-12 pr-4 focus:ring-0 outline-none text-white font-medium"
            />
          </div>
          <div className="hidden md:flex gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <span className="text-blue-500 text-[10px] font-bold">●</span>
              <span className="text-xs text-gray-400 font-bold">DISCOVERY</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <span className="text-green-500 text-[10px] font-bold">●</span>
              <span className="text-xs text-gray-400 font-bold">SETTLED</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-8 pb-24">
          {filtered.map((lawsuit) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={lawsuit.id}
              className="glass-panel overflow-hidden border-zinc-800 hover:border-brand/30 transition-colors"
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-brand tracking-widest uppercase">CASE ID: {lawsuit.caseNumber}</span>
                    <h2 className="text-3xl font-bold">{lawsuit.title}</h2>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {lawsuit.participants.map(p => (
                        <div key={p} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] font-bold text-gray-400">
                          <User size={12} className="text-zinc-600" /> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs font-bold text-white uppercase mb-2">
                      STATUS: {lawsuit.status}
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono">LAST UPDATED: 12 MAY 2026</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Summary */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info size={14} /> Case Overview
                    </h3>
                    <p className="text-gray-400 leading-relaxed italic">
                      "{lawsuit.description}"
                    </p>
                    
                    <div className="mt-8 p-4 bg-red-950/10 border border-red-900/30 rounded-lg flex gap-4">
                      <AlertTriangle className="text-red-500 shrink-0" />
                      <p className="text-[10px] text-red-400 font-mono leading-relaxed uppercase">
                        NOTICE: These summaries are curated from public court documentation. The platform does not take a stance on legal outcomes.
                      </p>
                    </div>
                  </div>

                  {/* Filings Timeline */}
                  <div className="bg-zinc-950/50 p-6 border-l border-zinc-900">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Latest Filings</h3>
                    <div className="space-y-6">
                      {lawsuit.filings?.map((filing, fidx) => (
                        <div key={fidx} className="relative pl-6 border-l border-zinc-800 group cursor-pointer">
                          <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-zinc-800 group-hover:bg-brand transition-colors" />
                          <p className="text-[10px] font-mono text-zinc-600 mb-1">{filing.date}</p>
                          <h4 className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors flex items-center justify-between">
                            {filing.title} <ChevronRight size={14} className="text-zinc-700" />
                          </h4>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-8 py-3 border border-zinc-800 rounded text-[10px] font-bold text-gray-500 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2">
                      VIEW ALL COURT DOCUMENTS <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
