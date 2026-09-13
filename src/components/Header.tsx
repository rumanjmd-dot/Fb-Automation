import React, { useState } from 'react';
import { Menu, Sun, Moon, MoreVertical, Sparkles, Key, CheckCircle, RefreshCw, Smartphone, Download } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenDrawer: () => void;
  onNavigate: (view: 'dashboard' | 'automation' | 'tokens' | 'pages') => void;
  activeView: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userProfile: UserProfile | null;
  onOpenLoginModal: () => void;
  onOpenApkModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  userProfile,
  onOpenLoginModal,
  onOpenApkModal,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0d141f] border-b border-[#1c2738] px-4 py-3 text-white">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Menu & Title */}
        <div className="flex items-center gap-3">
          <button
            id="drawer-toggle-btn"
            onClick={onOpenDrawer}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#192333] transition-colors"
            title="Open navigation menu"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                FB AUTOMATION
              </h1>
              {userProfile?.isValidated && (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  FB Connected
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Page Content Manager • V5
            </p>
          </div>
        </div>

        {/* Right: Quick FB Status, APK Button, 3-dots Quick Menu, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Direct APK Download / Install Button */}
          <button
            id="header-apk-btn"
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition-all shadow-xs"
            title="Download Android APK / Install App"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="font-mono">APK</span>
          </button>

          {/* Quick FB Login status / button */}
          {userProfile?.isValidated ? (
            <button
              id="header-user-badge"
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#182435] border border-[#27374d] text-xs text-slate-200 hover:bg-[#203046] transition-colors"
              title="Connected Facebook Account"
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
              <span className="max-w-[100px] truncate text-[11px] font-medium hidden sm:inline">
                {userProfile.name}
              </span>
            </button>
          ) : (
            <button
              id="header-connect-fb-btn"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Facebook Login</span>
            </button>
          )}

          {/* 3-dots menu specifically mentioned by user */}
          <div className="relative">
            <button
              id="header-more-menu-btn"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#192333] transition-colors"
              title="Quick Options"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-[#182435] border border-[#293b52] rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden text-sm">
                  <button
                    onClick={() => {
                      onOpenApkModal();
                      setShowQuickMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-emerald-400 font-semibold hover:bg-[#223247] transition-colors border-b border-[#24374d]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Android APK</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('automation');
                      setShowQuickMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-200 hover:bg-[#223247] transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Automation</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenLoginModal();
                      setShowQuickMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-200 hover:bg-[#223247] transition-colors"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Facebook Login</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setShowQuickMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-200 hover:bg-[#223247] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span>Dashboard</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sun / Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#192333] transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
