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

  // User Profile loaded from localStorage so user never has to re-login on app exit
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('fb_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Facebook Pages loaded from localStorage
  const [pages, setPages] = useState<FacebookPage[]>(() => {
    try {
      const saved = localStorage.getItem('fb_pages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Media List (3-5 videos)
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Geo Targeting countries and states (preserves user state across app reboots!)
  const [geoCountries, setGeoCountries] = useState<GeoCountry[]>(() => {
    try {
      const saved = localStorage.getItem('fb_geo_countries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_GEO_COUNTRIES;
  });

  // System Logs
  const [logs, setLogs] = useState<UploadLogItem[]>([]);

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

  // Sync User Profile to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('fb_user_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('fb_user_profile');
    }
  }, [userProfile]);

  // Sync Pages to localStorage
  useEffect(() => {
    if (pages.length > 0) {
      localStorage.setItem('fb_pages', JSON.stringify(pages));
    }
  }, [pages]);

  // Sync Geo Countries / States to localStorage so selected states stay saved permanently
  useEffect(() => {
    localStorage.setItem('fb_geo_countries', JSON.stringify(geoCountries));
  }, [geoCountries]);

  // Check saved token on mount and refresh session seamlessly
  useEffect(() => {
    const savedToken = localStorage.getItem('fb_user_token');
    if (savedToken) {
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
        .catch((err) => {
          console.warn('Session refresh notice:', err.message);
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
            userProfile={userProfile}
            onOpenLoginModal={() => setIsFbLoginOpen(true)}
            onUpdatePages={setPages}
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
