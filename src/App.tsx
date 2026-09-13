/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { DashboardView } from './components/DashboardView';
import { AutomationView } from './components/AutomationView';
import { PagesView } from './components/PagesView';
import { TokensView } from './components/TokensView';
import { FacebookLoginModal } from './components/FacebookLoginModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { DEFAULT_PAGES } from './data/mockPages';
import { INITIAL_GEO_COUNTRIES } from './data/geoData';
import { FacebookPage, GeoCountry, MediaItem, UploadLogItem, UserProfile } from './types';
import { fetchFacebookUserProfile, fetchFacebookPages } from './services/facebookService';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'automation' | 'pages' | 'tokens' | 'management' | 'settings' | 'license' | 'editor'>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFbLoginOpen, setIsFbLoginOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return {
      id: '100088992144551',
      name: 'Ruman Ahmed (রুমেন)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      connectedAt: '23:36:38',
      isValidated: true,
      userToken: 'EAAGNO4...VALID_DEMO_SYSTEM_TOKEN',
    };
  });

  // Facebook Pages (loaded from mock or real FB Graph API)
  const [pages, setPages] = useState<FacebookPage[]>(DEFAULT_PAGES);

  // Media List (3-5 videos)
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Geo Targeting countries and states (preserves user state across media clears!)
  const [geoCountries, setGeoCountries] = useState<GeoCountry[]>(INITIAL_GEO_COUNTRIES);

  // System Logs
  const [logs, setLogs] = useState<UploadLogItem[]>([
    {
      id: 'log-1',
      timestamp: '23:36:38',
      text: '✓ User token validated: me',
      type: 'success',
    },
    {
      id: 'log-2',
      timestamp: '23:36:40',
      text: '✓ Fetched 23 Page(s) with Page Access',
      type: 'success',
    },
  ]);

  // Operational metrics
  const [successfulOps, setSuccessfulOps] = useState(0);
  const [failedOps, setFailedOps] = useState(0);
  const [deletedOps, setDeletedOps] = useState(0);

  // Add Log helper
  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        text,
        type,
      },
      ...prev,
    ]);
  };

  // Toggle Page selection
  const handleTogglePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  };

  const handleSelectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, isSelected: true })));
    addLog('Selected all Facebook pages', 'info');
  };

  const handleClearPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, isSelected: false })));
    addLog('Deselected all Facebook pages', 'info');
  };

  // Check saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('fb_user_token');
    if (savedToken && !userProfile) {
      fetchFacebookUserProfile(savedToken)
        .then((prof) => {
          setUserProfile(prof);
          return fetchFacebookPages(savedToken);
        })
        .then((fetchedPages) => {
          if (fetchedPages.length > 0) {
            setPages(fetchedPages);
          }
        })
        .catch(() => {
          // Keep defaults
        });
    }
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-[#0a0f17] text-slate-100' : 'bg-slate-100 text-slate-900'
      } font-sans antialiased selection:bg-sky-500 selection:text-black`}
    >
      {/* Top Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onNavigate={(view) => setActiveView(view)}
        activeView={activeView}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        userProfile={userProfile}
        onOpenLoginModal={() => setIsFbLoginOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Slide-out Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        userProfile={userProfile}
        onOpenFbLogin={() => setIsFbLoginOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        pageCount={pages.length}
      />

      {/* Main Content Area */}
      <main className="p-3 sm:p-5 max-w-2xl mx-auto">
        {activeView === 'dashboard' && (
          <DashboardView
            pages={pages}
            mediaList={mediaList}
            logs={logs}
            userProfile={userProfile}
            onNavigate={(view) => setActiveView(view)}
            onOpenFbLogin={() => setIsFbLoginOpen(true)}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            successfulOps={successfulOps}
            failedOps={failedOps}
            deletedOps={deletedOps}
          />
        )}

        {activeView === 'automation' && (
          <AutomationView
            pages={pages}
            onTogglePage={handleTogglePage}
            onSelectAllPages={handleSelectAllPages}
            onClearPages={handleClearPages}
            mediaList={mediaList}
            onUpdateMediaList={setMediaList}
            geoCountries={geoCountries}
            onUpdateGeoCountries={setGeoCountries}
            logs={logs}
            onAddLog={addLog}
            onIncrementSuccess={(c = 1) => setSuccessfulOps((prev) => prev + c)}
            onIncrementFailed={(c = 1) => setFailedOps((prev) => prev + c)}
          />
        )}

        {activeView === 'pages' && (
          <PagesView
            pages={pages}
            onTogglePage={handleTogglePage}
            onNavigateToAutomation={() => setActiveView('automation')}
            onOpenFbLogin={() => setIsFbLoginOpen(true)}
          />
        )}

        {activeView === 'tokens' && (
          <TokensView
            userProfile={userProfile}
            onOpenFbLogin={() => setIsFbLoginOpen(true)}
            pages={pages}
          />
        )}

        {/* Other views placeholder */}
        {['management', 'settings', 'license', 'editor'].includes(activeView) && (
          <div className="p-6 rounded-2xl bg-[#141e2b] border border-[#202f43] text-center space-y-3">
            <h3 className="text-lg font-bold uppercase text-white tracking-wider">
              {activeView} MODULE
            </h3>
            <p className="text-xs text-slate-400">
              This module is active under License V5. Click below to return to Automation.
            </p>
            <button
              onClick={() => setActiveView('automation')}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400"
            >
              Go to Automation
            </button>
          </div>
        )}
      </main>

      {/* Facebook Login / Token Connection Modal */}
      <FacebookLoginModal
        isOpen={isFbLoginOpen}
        onClose={() => setIsFbLoginOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        onUpdatePages={setPages}
        onAddLog={addLog}
      />

      {/* Android APK Download & Installation Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
