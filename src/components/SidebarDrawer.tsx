import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  PlaySquare,
  Folder,
  Key,
  Settings,
  CheckCircle2,
  Film,
  MessageSquare,
  Mail,
  X,
  Facebook,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: any) => void;
  userProfile: UserProfile | null;
  onOpenFbLogin: () => void;
  onOpenApkModal: () => void;
  pageCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  userProfile,
  onOpenFbLogin,
  onOpenApkModal,
  pageCount,
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'automation', label: 'Automation', icon: Sparkles, badge: 'V5' },
    { id: 'tokens', label: 'Tokens & FB Login', icon: Key, badge: userProfile?.isValidated ? 'Connected' : 'Setup' },
    { id: 'pages', label: 'Pages', icon: Folder, count: pageCount },
    { id: 'management', label: 'Management', icon: PlaySquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'license', label: 'License', icon: CheckCircle2 },
    { id: 'editor', label: 'Video Editor', icon: Film },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] bg-[#121a24] text-white h-full shadow-2xl flex flex-col z-10 border-r border-[#1e2a3b] animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#1c2738]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-wider text-white">
              FB AUTOMATION
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2d3f] transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
              LICENSE ACTIVE
            </div>

            {userProfile?.isValidated ? (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Facebook className="w-3 h-3 text-blue-400" />
                {userProfile.name.split(' ')[0]}
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenFbLogin();
                }}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <Key className="w-3 h-3" /> Connect FB
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`drawer-nav-${item.id}`}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#293649] text-white shadow-inner font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#182333]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-sky-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      item.badge === 'Connected'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.badge === 'Setup'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && (
                  <span className="text-xs text-slate-400 bg-[#1e2a3b] px-2 py-0.5 rounded-full font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Download Android APK Button */}
          <div className="pt-2">
            <button
              id="drawer-download-apk-btn"
              onClick={() => {
                onClose();
                onOpenApkModal();
              }}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#122324] border border-emerald-500/40 text-left hover:border-emerald-400 transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1557-.2698.0632-.6143-.2066-.77-.2698-.1557-.6143-.0632-.77.2066l-2.0227 3.5034C15.228 8.1633 13.6635 7.79 12 7.79c-1.6635 0-3.228.3733-4.8842 1.0145L5.0931 5.3011c-.1557-.2698-.5002-.3623-.77-.2066-.2698.1557-.3623.5002-.2066.77l1.996 3.4572C2.7937 11.233.5 15.3414.5 20.0827h23c0-4.7413-2.2937-8.8497-5.6185-10.7613" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Download APK
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 font-mono">
                        v5.0
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400/80">
                      Install on Android Phone
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Support Footer */}
        <div className="p-4 border-t border-[#1c2738] bg-[#0e1620]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <a
                href="#chat"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Customer Support: Telegram @fb_automation_support or WhatsApp');
                }}
                className="p-1.5 rounded-lg hover:text-white hover:bg-[#1b2737] transition-colors"
                title="Live Chat Support"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@fbautomation.local"
                className="p-1.5 rounded-lg hover:text-white hover:bg-[#1b2737] transition-colors"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
              <span>Contact support</span>
            </div>
            <span className="text-[10px] text-slate-500">v5.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
