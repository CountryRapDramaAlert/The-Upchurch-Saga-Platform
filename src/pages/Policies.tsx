import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Scale, Mail, AlertTriangle, FileText, Info, Gavel, Flag } from 'lucide-react';

export default function Policies() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-black">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 border-l-4 border-brand pl-8">
          <h1 className="text-5xl font-black tracking-tighter mb-4 italic uppercase">Policy & Legal Hub</h1>
          <p className="text-gray-500 max-w-2xl font-medium">
            The Mokon Archive is dedicated to transparency, documentation, and the protection of free speech. 
            Below you will find our governing policies regarding usage, data, and content rights.
          </p>
        </div>

        {/* Navigation Shortcuts */}
        <div className="flex flex-wrap gap-4 mb-16">
          {[
            { label: 'Terms of Service', id: 'terms', icon: FileText },
            { label: 'Privacy Policy', id: 'privacy', icon: Lock },
            { label: 'Fair Use Notice', id: 'fair-use', icon: Scale },
            { label: 'Violation Report', id: 'dmca', icon: Flag }
          ].map((link) => (
            <a 
              key={link.id}
              href={`#${link.id}`}
              className="glass-panel px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-3 hover:border-brand/40 transition-all"
            >
              <link.icon size={14} className="text-brand" />
              {link.label}
            </a>
          ))}
        </div>

        <div className="space-y-32">
          {/* Terms of Service */}
          <section id="terms" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand/10 border border-brand/20 rounded-lg">
                <FileText className="text-brand" size={24} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tight">Terms of Service</h2>
            </div>
            
            <div className="prose prose-invert max-w-none space-y-6 text-gray-400 leading-relaxed font-medium">
              <p>
                Welcome to <span className="text-white italic font-bold">MOKON ARCHIVE</span>. By accessing or using this platform, 
                you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must cease use immediately.
              </p>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">1. Purpose of Platform</h3>
                <p>
                  Mokon Archive is an independent, community-driven documentary and archival project. Our goal is to document, 
                  archive, and discuss public internet events, specifically focusing on digital subcultures and public figures. 
                  This platform is for informational and research purposes only.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">2. User Conduct & Prohibited Acts</h3>
                <p>To maintain the integrity of the archive, users are strictly prohibited from:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Harassment, threats, or stalking of any individuals discussed on the platform.</li>
                  <li>Doxxing: Revealing or soliciting private, non-public personal information (home addresses, private phone numbers, etc.).</li>
                  <li>Impersonation of platform staff, public figures, or other users.</li>
                  <li>Illegal Activity: Uploading content that violates local, state, or international laws.</li>
                  <li>Copyright Abuse: Submitting content that you do not have a right to share, outside of established Fair Use principles.</li>
                  <li>Spamming: Disrupting the database with repetitive or irrelevant data.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">3. User-Generated Content</h3>
                <p>
                  By submitting content (screenshots, clips, links, comments) to the Archive, you grant us a non-exclusive, 
                  perpetual, royalty-free license to host, display, and archive that content for documentary purposes. 
                  You retain ownership of any original content, but you acknowledge that public investigation material 
                  contributed here becomes part of the permanent record.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">4. Limitation of Liability</h3>
                <p>
                  The Mokon Archive and its operators are not liable for the accuracy of community-submitted content. 
                  Users access this site at their own risk. We provide the platform "as-is" without warranty of any kind. 
                  Discussion of allegations does not constitute an endorsement of their truth.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section id="privacy" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Lock className="text-blue-500" size={24} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tight text-blue-500">Privacy Policy</h2>
            </div>
            
            <div className="prose prose-invert max-w-none space-y-6 text-gray-400 leading-relaxed font-medium">
              <p>
                Your privacy and digital security are paramount. This policy outlines how we handle information collected 
                during your interactions with the Archive.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="glass-panel p-6">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" /> Information Collected
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li>• Google Account identity (for authenticated sessions)</li>
                    <li>• Activity logs & IP addresses (for security monitoring)</li>
                    <li>• Metadata from uploaded content</li>
                    <li>• Browser cookies for session persistence</li>
                  </ul>
                </div>
                <div className="glass-panel p-6">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Info size={16} className="text-blue-500" /> Use of Data
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li>• Authentication and user profiling</li>
                    <li>• Prevention of malicious attacks and spam</li>
                    <li>• Internal analytics to improve archive performance</li>
                    <li>• Compliance with valid legal requests</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">Analytics & Tracking</h3>
                <p>
                  We utilize lightweight, privacy-focused analytics to monitor platform traffic. These tools help us 
                  understand how the archive is used without tracking you across the wider web.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">Data Security</h3>
                <p>
                  We implement industry-standard encryption and security protocols to protect your account data. 
                  However, no system is 100% secure—users are encouraged to use strong passwords and two-factor 
                  authentication on their primary Google accounts.
                </p>
              </div>
            </div>
          </section>

          {/* Fair Use Notice */}
          <section id="fair-use" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Scale className="text-amber-500" size={24} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tight text-amber-500">Fair Use Notice</h2>
            </div>
            
            <div className="prose prose-invert max-w-none space-y-6 text-gray-400 leading-relaxed font-medium">
              <p className="bg-amber-950/20 border border-amber-500/20 p-6 rounded-xl italic">
                "U.S. Copyright law allows for the 'Fair Use' of copyrighted materials for purposes such as 
                criticism, comment, news reporting, teaching, scholarship, or research." (17 U.S. Code § 107)
              </p>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">1. Educational & Documentary Intent</h3>
                <p>
                  This platform hosts media snippets, screenshots, and clips for the express purpose of documenting 
                  history and fostering public discourse. We do not claim ownership of any third-party media, 
                  logos, or trademarks featured in the archive. All rights remain with the original creators.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">2. Transformative Use</h3>
                <p>
                  Content curated here is often organized, indexed, and paired with commentary or investigative 
                  data, creating a transformative archive that serves a different public function than the 
                  original source material.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-4">3. Public Figure Discussion</h3>
                <p>
                  Public figures and publicly available internet content are discussed here for informational 
                  purposes. Documentation of digital history is a critical component of modern media literacy.
                </p>
              </div>

              <div id="dmca" className="p-8 border border-white/5 bg-zinc-950 rounded-2xl scroll-mt-32">
                <h3 className="text-white font-black italic uppercase text-2xl mb-4 flex items-center gap-3">
                  <Gavel className="text-brand" /> Content Removal & Reporting
                </h3>
                <p className="mb-6">
                  If you are a copyright owner or an agent thereof and believe that any content hosted on the Archive 
                  infringes upon your rights, please use our internal reporting tool. This is the <b>only</b> method 
                  accepted for formal takedown requests to ensure they are tracked and processed by our moderation unit.
                </p>
                
                <div className="glass-panel p-8 border-brand/20 bg-brand/5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Flag size={20} className="text-brand" /> Submission via Internal Report
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Mokon Archive uses a secure, ticket-based reporting system accessible directly from the investigation feed. 
                    To request a removal or report a violation:
                  </p>
                  <ol className="list-decimal pl-6 space-y-4 text-sm text-white font-bold uppercase tracking-widest leading-loose">
                    <li>Navigate to the specific investigation record in the <a href="/archive" className="text-brand underline">Archive</a>.</li>
                    <li>Locate the <span className="text-brand underline">"Report"</span> flag below the content.</li>
                    <li>Select the correct violation category (Copyright, Doxxing, etc.).</li>
                    <li>Provide specific identifying details or links to original works.</li>
                    <li>Submit the ticket for immediate review.</li>
                  </ol>
                </div>

                <div className="mt-12 p-6 border border-white/5 rounded-xl bg-black">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Resolution Timeline
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Once a report is submitted, our automated Vanguard system flags the content for a human moderator. 
                    Reports are typically reviewed within 24-72 hours. If a violation is confirmed, the content is 
                    immediately expunged from the public database and restricted from future archival.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Closing Notice */}
        <div className="mt-32 pt-16 border-t border-white/5 text-center">
          <div className="inline-block p-4 px-8 glass-panel border-red-500/20 bg-red-500/5">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
              WARNING: SYSTEM UNDER ACTIVE MONITORING // SECURITY PROTOCOL VANGUARD-1
            </p>
          </div>
          <p className="mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
            LAST UPDATED: MAY 16, 2026 // DIGITAL RECORDS DIVISION
          </p>
        </div>
      </div>
    </div>
  );
}
