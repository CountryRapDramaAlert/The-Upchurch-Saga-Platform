import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, FileText, Download, Calendar, 
  ExternalLink, ChevronRight, Info, AlertTriangle,
  Gavel, User, Search
} from 'lucide-react';
import { Lawsuit } from '../types';
import { useFirestoreCollection } from '../hooks/useFirestore';

export default function LawsuitTracker() {
  const [search, setSearch] = useState('');
  const { data: dbLawsuits } = useFirestoreCollection<Lawsuit>('lawsuits');

  const mockLawsuits: Lawsuit[] = [
    {
      id: 'ru-rodni-2023',
      title: 'Robertson & Rodni v. Ryan Upchurch (Kiely Rodni Case)',
      caseNumber: '3:23-CV-00770',
      description: 'Federal civil complaint for defamation and intentional infliction of emotional distress filed in the Middle District of Tennessee, concerning streams claiming Kiely Rodni\'s tragic disappearance was a fabricated scam to raise money via GoFundMe. Culminated in a landmark $17.5 million federal jury verdict against Upchurch in May 2026, ordering him to pay $6.5 million to Daniel Rodni (her father) and $11 million to David Robertson (her grandfather), heavily impacting his estimated net worth.',
      status: 'Completed (Judgment Entered)',
      participants: ['Ryan Upchurch', 'David Robertson', 'Daniel Rodni', 'Federal Court System'],
      filings: [
        { date: '2026-05-19', title: 'Federal Jury Verdict: $17.5M Awarded ($11M to Robertson, $6.5M to Rodni)' },
        { date: '2026-05-12', title: 'Pre-Trial Deposition Contempt Filings Entered' },
        { date: '2024-05-23', title: 'Order Overruling Motion to Dismiss, Defamation Allowed' }
      ]
    },
    {
      id: 'ru-leveille-2018',
      title: 'Jacob LeVeille v. Ryan Upchurch (VARA Infringement)',
      caseNumber: '3:18-CV-00812',
      description: 'Federal property destruction and moral rights litigation brought by local visual designer under the Visual Artists Rights Act of 1990 (VARA) after Upchurch fired an assault rifle at custom-painted canvases on a public web livestream.',
      status: 'Settled & Dismissed',
      participants: ['Ryan Upchurch', 'Jacob LeVeille', 'Middle District of TN Court'],
      filings: [
        { date: '2019-10-15', title: 'Stipulant Joint Order of Dismissal with Prejudice' },
        { date: '2019-02-04', title: 'Order Denying Motion for Summary Dismissal of VARA Claims' },
        { date: '2018-09-12', title: 'Initial Federal Complaint Entered Under Section 106A' }
      ]
    },
    {
      id: 'ru-cmdshft-2025',
      title: 'Upchurch v. cmdshft Distribution & Sonny Bama',
      caseNumber: '1:25-CV-01104',
      description: 'In January 2026, Upchurch completely severed ties with his administrative and distribution teams (cmdshft and Sonny Bama) in a series of explosive videos. He accused them of perjury, fraud, and evidence tampering, publicly alleging they opened fraudulent credit cards under his name and mishandled his intellectual property.',
      status: 'Active (Depositions)',
      participants: ['Ryan Upchurch', 'Sonny Bama', 'cmdshft Distribution Systems'],
      filings: [
        { date: '2026-03-04', title: 'Order Imposing Penalty Fines Over Leaked Sealed Depositions' },
        { date: '2026-02-12', title: 'Filing of Sealed Depositions & Protective Orders' },
        { date: '2025-08-11', title: 'Original Complaint Entered' }
      ]
    }
  ];

  const lawsuits = dbLawsuits && dbLawsuits.length > 0 ? dbLawsuits : mockLawsuits;

  const filtered = lawsuits.filter(l => 
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
