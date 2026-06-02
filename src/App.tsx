/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import CinematicShell from './components/CinematicShell';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Drama from './pages/Drama';
import LawsuitTracker from './pages/LawsuitTracker';
import DramaMap from './pages/DramaMap';
import CommunityArchive from './pages/CommunityArchive';
import MediaVault from './pages/MediaVault';
import MokonArchive from './pages/MokonArchive';
import Policies from './pages/Policies';
import WarRoom from './pages/WarRoom';
import Dossier from './pages/Dossier';
import AdminConsole from './pages/AdminConsole';
import LiveStreamSync from './pages/LiveStreamSync';

export default function App() {
  return (
    <Router>
      <CinematicShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/drama" element={<Drama />} />
          <Route path="/lawsuits" element={<LawsuitTracker />} />
          <Route path="/vault" element={<MediaVault />} />
          <Route path="/mokon" element={<MokonArchive />} />
          <Route path="/dossier" element={<Dossier />} />
          <Route path="/map" element={<DramaMap />} />
          <Route path="/conspiracy" element={<DramaMap />} />
          <Route path="/war-room" element={<WarRoom />} />
          <Route path="/livestream" element={<LiveStreamSync />} />
          <Route path="/archive" element={<CommunityArchive />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/admin-login" element={<Home />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CinematicShell>
    </Router>
  );
}
