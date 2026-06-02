import { collection, addDoc, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Evidence, Lawsuit, DossierProfile } from '../types';

export const HIGH_FIDELITY_EVIDENCE_SEEDS: Omit<Evidence, 'id'>[] = [
  {
    title: "Dawn of the RHEC & Creek Squad Era",
    description: "Ryan Upchurch successfully transitions from viral country comedy clips (under the character 'Upchurch the Redneck') to a pioneer of independent southern rock-infused rap with his breakthrough album 'Cheatham County'. He establishes the 'RHEC' (Raise Hell Eat Cornbread) creed and defines the primary boundary of 'Creek Squad' fanbase alignment.",
    type: "document",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 35,
    tags: ["music", "personal"],
    createdAt: "2015-05-15T12:00:00Z",
    aiAnalysis: {
      summary: "Foundational period establishing tribal country rap alignment structure 'RHEC'.",
      volatility: 0.15,
      validityScore: 0.99,
      extractedThemes: ["Pioneer Era", "RHEC Cultivation", "Independent Rap Rise"],
      narrativeImpact: "High"
    }
  },
  {
    title: "The Jacob LeVeille VARA Defiance Incident",
    description: "A major aesthetic and legal trigger occurs when Ryan Upchurch destroys custom painted canvas portraits of musicians by shooting them with an automatic rifle on a livestream. The artist, Jacob LeVeille, files a federal civil suit in the Middle District of Tennessee under the Visual Artists Rights Act of 1990 (VARA), setting an early footprint of high-impact civil litigations.",
    type: "document",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 42,
    tags: ["legal", "personal"],
    createdAt: "2018-09-22T08:00:00Z",
    aiAnalysis: {
      summary: "First instance of major federal civil rights violations concerning artist work validation.",
      volatility: 0.65,
      validityScore: 0.98,
      extractedThemes: ["VARA Federal Claims", "Weapon Conduct", "Property Defiance"],
      narrativeImpact: "Critical"
    }
  },
  {
    title: "Aggressed Mainstream Feuds: Calhoun, Jelly Roll, and Chase Matthew",
    description: "Upchurch triggers aggressive public fallout videos and call-outs targeting Adam Calhoun and Jelly Roll, accusing them of fence-sitting, playing industry games, and capitulating to major label structures rather than keeping it fully independent. This is followed by a shadow fallout with Chase Matthew after Matthew achieves mainstream signing trajectories.",
    type: "text",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 28,
    tags: ["beef", "music"],
    createdAt: "2021-03-10T14:30:00Z",
    aiAnalysis: {
      summary: "Rhetorical campaign enforcing severe gatekeeping standard against label capitulators.",
      volatility: 0.80,
      validityScore: 0.95,
      extractedThemes: ["Mainstream Gatekeeping", "Southern Rap Division", "Label Allegations"],
      narrativeImpact: "High"
    }
  },
  {
    title: "Kiely Rodni Tragic Disappearance & Outrage Stream Campaigns",
    description: "Following the disappearance and accidental drowning of local teenager Kiely Rodni in California, Upchurch turns his focus to true-crime stream output. Over multiple high-heat midnight streams, he alleges that the community's search efforts, family-led GoFundMe pages, and local law enforcement investigations correspond to structured fraud and cover-ups.",
    type: "video",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 56,
    tags: ["livestream", "legal"],
    createdAt: "2022-08-25T23:45:00Z",
    aiAnalysis: {
      summary: "Entry point to the multi-million dollar defamation timeline. Establishes core claims of search fraud.",
      volatility: 0.95,
      validityScore: 0.92,
      extractedThemes: ["True Crime Conspiracies", "True Hostility Peak", "Midnight Outrage Cycles"],
      narrativeImpact: "Extreme"
    }
  },
  {
    title: "The Adam Calhoun Peace Accord (Hollar Reunion)",
    description: "In an unexpected strategic reset, Ryan Upchurch and longtime bitter rival Adam Calhoun reconcile their differences, appearing cooperatively on stage. This 'Peace Accord' successfully consolidates the fractured Creek Squad and Bloodhound Nation fanbases, temporarily pacifying the southern rap ecosystem's primary war front.",
    type: "video",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 39,
    tags: ["beef", "personal"],
    createdAt: "2024-08-16T21:10:00Z",
    aiAnalysis: {
      summary: "Systemic alliance reset. Resolves the Calhoun front to consolidate tactical support circles.",
      volatility: 0.40,
      validityScore: 0.97,
      extractedThemes: ["Peace Accords", "Tribal Coalition Re-alignment", "Outlaw Solidarity"],
      narrativeImpact: "High"
    }
  },
  {
    title: "Chase Matthew & Independent Label Purge",
    description: "Upchurch issues a severe warning campaign regarding brand associations. He clarifies his stance on Chase Matthew's major label contract—stating he bears no personal malice toward Matthew—but launches a ferocious counter-offensive against indie music outlets and blogs asserting Upchurch endorses or distributes under standard major label grids.",
    type: "text",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 21,
    tags: ["beef", "music"],
    createdAt: "2024-11-04T10:15:00Z",
    aiAnalysis: {
      summary: "Campaign enforcing full sovereign isolationism, guarding against label implication.",
      volatility: 0.50,
      validityScore: 0.94,
      extractedThemes: ["Label Purge", "Sovereignty Defense", "Media Dissociation"],
      narrativeImpact: "Medium"
    }
  },
  {
    title: "Sonny Bama & cmdshft deposition leak & perjury scandal",
    description: "Upchurch releases series of high-heat video reels accusing longtime close ally Sonny Bama and music distribution service cmdshft of identity theft, credit card (Mastercard) fraud, and legal perjury regarding royalty balances. Upchurch releases sealed court depositions directly to the web, triggering federal sanction motions and fines for protective order violations.",
    type: "document",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 68,
    tags: ["legal", "livestream"],
    createdAt: "2026-02-14T02:30:00Z",
    aiAnalysis: {
      summary: "High-intensity dispute targeting internal royalty allocations and corporate identity theft.",
      volatility: 0.90,
      validityScore: 0.96,
      extractedThemes: ["Corporate Collusion", "Deposition Violations", "Mastercard Fraud Allegations"],
      narrativeImpact: "Extreme"
    }
  },
  {
    title: "The $17.5M Federal True Crime Defamation Jury Verdict",
    description: "A federal jury in the Middle District of Tennessee renders a historic civil verdict after a multi-day defamation trial. The jury orders Ryan Upchurch to pay $6.5 million in damages to David Robertson (Kiely Rodni's father) and $11 million to Daniel Rodni (her grandfather) for intentional infliction of emotional distress and systematic defamation. This landmark case establishes major legal boundaries for online influencer accountability.",
    type: "document",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 94,
    tags: ["legal"],
    createdAt: "2026-05-19T22:00:00Z",
    aiAnalysis: {
      summary: "A historic legal precedent penalizing internet conspiracy speculation with severe economic sanctions.",
      volatility: 0.99,
      validityScore: 1.0,
      extractedThemes: ["Federal Defamation Verdict", "$17.5M Judgement", "Accountability Landmark"],
      narrativeImpact: "Extreme"
    }
  },
  {
    title: "Intelligence Briefing: The Robertson/Rodni Case Retrospective",
    description: "A special digital file (YouTube Node XpDN4ZRctDM) examining the critical moments and public stream recordings tracking the Kiely Rodni search controversies. Features complete archival summaries of the claims that eventually triggered the $17.5M federal judgment.",
    type: "video",
    submittedBy: "didhesaythatreally",
    submitterName: "CHRONICLE ANALYST",
    status: "approved",
    votes: 72,
    tags: ["livestream", "legal"],
    createdAt: "2023-01-12T15:30:00Z",
    aiAnalysis: {
      summary: "Compilations documenting the specific statements and broadcast transcripts leading to liability.",
      volatility: 0.85,
      validityScore: 0.96,
      extractedThemes: ["Retrospective Chronicles", "Outrage Broadcast Logs", "Pre-Trial Scrutiny"],
      narrativeImpact: "High"
    }
  },
  {
    title: "Corporate Fracture: cmdshft & Sonny Bama Sealed Deposition Leak",
    description: "A comprehensive investigation logs (YouTube Node j2vouvpa9PI) tracking leaked depositions and internal discord surrounding Sonny Bama and music distribution system cmdshft. Verifies claims of credit card (Mastercard) accounts and royalties transfers.",
    type: "video",
    submittedBy: "didhesaythatreally",
    submitterName: "CHRONICLE ANALYST",
    status: "approved",
    votes: 61,
    tags: ["legal", "beef"],
    createdAt: "2026-02-14T10:45:00Z",
    aiAnalysis: {
      summary: "Deep dive investigation verifying structural account conflicts and copyright revenue actions.",
      volatility: 0.92,
      validityScore: 0.94,
      extractedThemes: ["Royalty Redirection", "Corporate Fallouts", "Unauthorized Access Logs"],
      narrativeImpact: "Extreme"
    }
  },
  {
    title: "Civil Verdict Impact: Robertson v. Upchurch Verdict Breakdown",
    description: "Legal and community video breakdown (YouTube Node y9ZThcahQCA) on the Nashville federal jury resolution. Details the massive damages and structural impact of Robertson & Rodni v. Ryan Upchurch on independent web broadcasts.",
    type: "video",
    submittedBy: "didhesaythatreally",
    submitterName: "CHRONICLE ANALYST",
    status: "approved",
    votes: 88,
    tags: ["legal"],
    createdAt: "2026-05-20T08:15:00Z",
    aiAnalysis: {
      summary: "Post-trial focus evaluating financial liabilities and legal boundary parameters.",
      volatility: 0.97,
      validityScore: 0.99,
      extractedThemes: ["Jury Decision Fallout", "Influencer Accountability", "Nashville Civil Verdict"],
      narrativeImpact: "Extreme"
    }
  },
  {
    title: "The Pioneer Protocol: Mokon Accountability Retrospective",
    description: "Interactive visual logs (YouTube Node VAkHWmEhUr0) tracing Mokon's early warnings regarding transparency and crowd-driven investigations. Compares historical 2021-2022 blockades with the actual outcomes realized in 2026.",
    type: "video",
    submittedBy: "intel_core",
    submitterName: "SYSTEM ARCHIVIST",
    status: "approved",
    votes: 54,
    tags: ["personal", "beef"],
    createdAt: "2021-06-30T17:00:00Z",
    aiAnalysis: {
      summary: "Archival record tracking crowd accountabilities and the cost of resisting online suppression.",
      volatility: 0.50,
      validityScore: 0.98,
      extractedThemes: ["Pioneer Declarations", "Ecosystem Accountability", "Resisting Coordinated Suppression"],
      narrativeImpact: "High"
    }
  }
];

export const HIGH_FIDELITY_LAWSUITS_SEEDS: Omit<Lawsuit, 'id'>[] = [
  {
    title: "Robertson & Rodni v. Ryan Upchurch (True Crime Defamation)",
    description: "Federal civil case focused on defamation, intentional infliction of emotional distress, and coordinate libel actions over streams alleging fake recovery searches and fraudulent GoFundMe scams surrounding the Kiely Rodni search. The case culminated in a historic $17.5 million federal jury verdict against Upchurch on May 19, 2026.",
    caseNumber: "3:23-CV-00770",
    status: "Completed (Judgment Entered)",
    participants: ["Ryan Upchurch", "David Robertson", "Daniel Rodni", "Middle District of TN Federal Court"],
    filings: [
      { date: "2026-05-19", title: "Federal Jury Verdict: $17,500,000 Total Damages Awarded" },
      { date: "2026-05-12", title: "Pre-Trial Deposition Contempt Motion Over Deletions" },
      { date: "2024-05-23", title: "Order Overruling Motion to Dismiss, Defamation Allowed To Proceed" }
    ]
  },
  {
    title: "Jacob LeVeille v. Ryan Ashley Upchurch (Visual Artists Rights Act)",
    description: "Federal civil action filed by artist Jacob LeVeille under the Visual Artists Rights Act of 1990 (VARA). The plaintiff accused Upchurch of copyright infringement, moral rights violations, and property destruction after Upchurch shot original hand-painted musician portraits with an automatic rifle on stream.",
    caseNumber: "3:18-CV-00812",
    status: "Settled / Dismissed",
    participants: ["Ryan Upchurch", "Jacob LeVeille", "Federal Middle District of Tennessee"],
    filings: [
      { date: "2019-10-15", title: "Joint Stipulation of Dismissal with Prejudice (Settlement Reached)" },
      { date: "2019-02-04", title: "Order Granting Plaintiff Motion for Summary Judgment in Part" },
      { date: "2018-09-12", title: "Initial Federal Complaint Under VARA Title 17" }
    ]
  },
  {
    title: "Upchurch v. cmdshft & Sonny Bama (Copyright Royalty Civil Action)",
    description: "High-volatility internal trade dispute involving distribution company cmdshft and local associate Sonny Bama regarding Mastercard royalty distribution accounts, trademark holdings, and identity theft claims. Features dynamic clashes over leaked depositions.",
    caseNumber: "1:25-CV-01104",
    status: "Active (Depositions Phase)",
    participants: ["Ryan Upchurch", "Sonny Bama", "cmdshft Distribution Systems"],
    filings: [
      { date: "2026-03-04", title: "Emergency Motion for Federal Sanctions Order Over Leaked Depositions" },
      { date: "2026-02-12", title: "Sealed Witness Depositions Filed Under Protective Guard" },
      { date: "2025-08-11", title: "Complaint Entered Over Unauthorized Account Transfers" }
    ]
  }
];

export const HIGH_FIDELITY_DOSSIER_SEEDS: DossierProfile[] = [
  {
    name: "Ryan Ashley Upchurch",
    alias: ["Upchurch the Redneck", "RHEC Outlaw"],
    role: "subject",
    reportedActivities: [
      "Pioneered the Hick-Hop country rap genre segment",
      "Conducted extensive midnight online true-crime narrative streaming campaigns",
      "Authored viral video and auditory diss tracks targeting multiple industry actors",
      "Currently facing major federal financial liabilities following a landmark defamation verdict"
    ],
    affiliations: ["Creek Squad", "Holler Hood Records", "RHEC"],
    status: "monitored",
    notes: "Central node. Direct source of severe narrative volatility. Highest social graph weight.",
    levelOfImpact: 1.0,
    createdAt: "2026-05-21T00:00:00Z"
  },
  {
    name: "MoKoN",
    alias: ["MK_Investigator"],
    role: "community_member",
    reportedActivities: [
      "Conducted early, exhaustive baseline timeline documenting Upchurch's internal contradictions",
      "Faced severe digital blacklisting, coordinated troll strikes, and community isolationism for years",
      "Pioneered detailed diss-level lyrical scrutiny videos analyzing corporate agreements",
      "Consistently maintained absolute, verifiable receipts of narrative inconsistencies"
    ],
    affiliations: ["Independent Accountability Analysts"],
    status: "active",
    notes: "Primary analytical beacon. Historically early whistleblower whose early findings are now fully validated by courts and ongoing community shifts.",
    levelOfImpact: 0.85,
    createdAt: "2026-05-21T00:00:00Z"
  },
  {
    name: "Adam Calhoun",
    alias: ["Acal"],
    role: "subject",
    reportedActivities: [
      "Maintained volatile collaborative beefs with Ryan Upchurch during the early 2020 era",
      "Co-conspirator in strategic stage handshakes squashing active southern rap feuds on stage",
      "Consolidated fragmented Bloodhound nation faction under Creek alignment umbrella"
    ],
    affiliations: ["Bloodhound Nation", "Creek Squad Allies"],
    status: "active",
    notes: "Strategic mediator who oscillates between direct visual hostilities and high-value peace accord arrangements.",
    levelOfImpact: 0.75,
    createdAt: "2026-05-21T00:00:00Z"
  }
];

export async function seedFirestore() {
  // Always seed localStorage fallback cache first to ensure offline-readiness
  localStorage.setItem('firestore_fallback_evidence', JSON.stringify(HIGH_FIDELITY_EVIDENCE_SEEDS.map((item, idx) => ({ id: `seed-ev-${idx}`, ...item }))));
  localStorage.setItem('firestore_fallback_lawsuits', JSON.stringify(HIGH_FIDELITY_LAWSUITS_SEEDS.map((item, idx) => ({ id: `seed-lw-${idx}`, ...item }))));
  localStorage.setItem('firestore_fallback_dossier', JSON.stringify(HIGH_FIDELITY_DOSSIER_SEEDS.map((item, idx) => ({ id: `seed-ds-${idx}`, ...item }))));
  
  // Notify active listeners to reload lists immediately
  window.dispatchEvent(new Event('local-firestore-change'));

  try {
    const batch = writeBatch(db);

    // 1. Evidence / Timeline Events
    const evidenceCol = collection(db, 'evidence');
    // Avoid duplicate seeding by checking first with a timeout/race
    const existingEvidence = await getDocs(evidenceCol);
    if (existingEvidence.empty) {
      for (const item of HIGH_FIDELITY_EVIDENCE_SEEDS) {
        const newDocRef = doc(evidenceCol);
        batch.set(newDocRef, item);
      }
    }

    // 2. Lawsuits
    const lawsuitsCol = collection(db, 'lawsuits');
    const existingLawsuits = await getDocs(lawsuitsCol);
    if (existingLawsuits.empty) {
      for (const item of HIGH_FIDELITY_LAWSUITS_SEEDS) {
        const newDocRef = doc(lawsuitsCol);
        batch.set(newDocRef, item);
      }
    }

    // 3. Dossiers
    const dossierCol = collection(db, 'dossier');
    const existingDossier = await getDocs(dossierCol);
    if (existingDossier.empty) {
      for (const item of HIGH_FIDELITY_DOSSIER_SEEDS) {
        const newDocRef = doc(dossierCol);
        batch.set(newDocRef, item);
      }
    }

    await batch.commit();
    console.log("Firestore cloud seed completed successfully.");
  } catch (error: any) {
    console.warn("Firestore cloud seeding was unavailable (client is offline), but offline-safe shadow seeding succeeded!", error.message);
  }
}
